// Dhutanga night – zero-dependency multiplayer server.
// Static files + Server-Sent Events for live presence/moments + JSON-file traces.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "traces.json");
const MAX_TRACES = 500;

const ROLES = ["monk", "ghost", "villager"];
const MOMENT_TOPICS = ["chime", "sigh", "lantern"];
const TRACE_KINDS = ["offering", "chant", "sigh", "incense", "alms", "release", "vigil", "keepsake", "lamp", "bowl"];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
};

// ---------- state ----------
/** @type {Map<string, {res: http.ServerResponse, presence: object, lastEmit: number, lastTrace: number}>} */
const peers = new Map();
let traces = loadTraces();
let saveTimer = null;

function loadTraces() {
  try {
    const list = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(list) ? list.slice(-MAX_TRACES) : [];
  } catch {
    return [];
  }
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFile(DATA_FILE, JSON.stringify(traces, null, 1), (err) => {
      if (err) console.error("save traces failed:", err.message);
    });
  }, 500);
}

// ---------- helpers ----------
function cleanText(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, "")
    .trim()
    .slice(0, max);
}

function publicPeers() {
  return [...peers.entries()].map(([pid, p]) => ({ pid, ...p.presence }));
}

function send(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcast(event, data) {
  for (const p of peers.values()) send(p.res, event, data);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) {
        reject(new Error("too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("bad json"));
      }
    });
  });
}

function json(res, status, data) {
  res.writeHead(status, { "Content-Type": MIME[".json"] });
  res.end(JSON.stringify(data));
}

// ---------- routes ----------
function handleEvents(req, res, url) {
  const pid = cleanText(url.searchParams.get("pid"), 40) || crypto.randomUUID();
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.write("retry: 3000\n\n");

  const existing = peers.get(pid);
  peers.set(pid, {
    res,
    presence: existing?.presence ?? { role: null, scene: null, nick: "", x: 0.5, y: 0.95, pose: null },
    lastEmit: 0,
    lastTrace: 0,
  });

  send(res, "init", { pid, peers: publicPeers(), traces: traces.slice(-60) });
  broadcast("peers", publicPeers());

  const heartbeat = setInterval(() => res.write(": keepalive\n\n"), 20000);
  req.on("close", () => {
    clearInterval(heartbeat);
    const current = peers.get(pid);
    if (current && current.res === res) {
      peers.delete(pid);
      broadcast("peers", publicPeers());
    }
  });
}

async function handlePresence(req, res) {
  const body = await readJson(req);
  const peer = peers.get(body.pid);
  if (!peer) return json(res, 404, { error: "not connected" });
  peer.presence = {
    role: ROLES.includes(body.role) ? body.role : null,
    scene: cleanText(body.scene, 24) || null,
    nick: cleanText(body.nick, 24),
    x: Math.min(1, Math.max(0, Number(body.x) || 0.5)),
    y: Math.min(1, Math.max(0, Number(body.y) || 0.95)),
    pose: body.pose === "sit" ? "sit" : null,
  };
  broadcast("peers", publicPeers());
  json(res, 200, { ok: true });
}

async function handleEmit(req, res) {
  const body = await readJson(req);
  const peer = peers.get(body.pid);
  if (!peer) return json(res, 404, { error: "not connected" });
  if (!MOMENT_TOPICS.includes(body.topic)) return json(res, 400, { error: "unknown topic" });
  const now = Date.now();
  if (now - peer.lastEmit < 4000) return json(res, 429, { error: "too fast" });
  peer.lastEmit = now;
  broadcast("moment", { topic: body.topic, from: body.pid, x: peer.presence.x, y: peer.presence.y, role: peer.presence.role });
  json(res, 200, { ok: true });
}

async function handleTrace(req, res) {
  const body = await readJson(req);
  const peer = peers.get(body.pid);
  if (!peer) return json(res, 404, { error: "not connected" });
  if (!TRACE_KINDS.includes(body.kind)) return json(res, 400, { error: "unknown kind" });
  const now = Date.now();
  if (now - peer.lastTrace < 3000) return json(res, 429, { error: "too fast" });
  peer.lastTrace = now;
  const trace = {
    id: crypto.randomUUID(),
    kind: body.kind,
    variant: Math.max(0, Math.min(5, Number(body.variant) || 0)),
    role: ROLES.includes(body.role) ? body.role : null,
    nick: cleanText(body.nick, 24),
    at: now,
  };
  traces.push(trace);
  if (traces.length > MAX_TRACES) traces = traces.slice(-MAX_TRACES);
  scheduleSave();
  broadcast("trace", trace);
  json(res, 200, { ok: true, trace });
}

function serveStatic(req, res, url) {
  const rel = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Không tìm thấy");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    // Tiny health check for uptime pingers: no state, no disk, no SSE.
    if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/healthz") {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(req.method === "HEAD" ? undefined : "ok");
    }
    // Runtime flags for the client. The dev panel (?dev) is off in production unless DEV_PANEL=1.
    if (req.method === "GET" && url.pathname === "/config.js") {
      const dev = process.env.DEV_PANEL ? process.env.DEV_PANEL === "1" : process.env.NODE_ENV !== "production";
      res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "no-store" });
      return res.end(`window.APP_CONFIG = { dev: ${dev} };`);
    }
    if (req.method === "GET" && url.pathname === "/events") return handleEvents(req, res, url);
    if (req.method === "POST" && url.pathname === "/api/presence") return await handlePresence(req, res);
    if (req.method === "POST" && url.pathname === "/api/emit") return await handleEmit(req, res);
    if (req.method === "POST" && url.pathname === "/api/trace") return await handleTrace(req, res);
    if (req.method === "GET") return serveStatic(req, res, url);
    res.writeHead(405);
    res.end();
  } catch (err) {
    json(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Một đêm đầu đà đang chạy ở http://localhost:${PORT}`);
  console.log("Mở nhiều tab hoặc nhiều máy cùng mạng LAN để chơi cùng nhau.");
});
