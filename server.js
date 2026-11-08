// Dhutanga night – zero-dependency multiplayer server.
// Static files + Server-Sent Events for live presence and shared moments.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const ROLES = ["monk", "ghost", "villager"];
const MOMENT_TOPICS = ["chime", "sigh", "lantern"];
const EFFECT_KINDS = {
  monk: ["offering", "chant", "vigil"],
  ghost: ["release"],
  villager: ["incense", "alms"],
};
const POSES = ["sit", "walk", "sleep", "eat", "collect", "sew"];

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
/** @type {Map<string, {res: http.ServerResponse, presence: object, lastEmit: number, lastEffect: number}>} */
const peers = new Map();

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
    presence: existing?.presence ?? { role: null, scene: null, nick: "", x: 0.5, y: 0.95, pose: null, robe: 0 },
    lastEmit: 0,
    lastEffect: 0,
  });

  send(res, "init", { pid, peers: publicPeers() });
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
    pose: body.role === "monk" && POSES.includes(body.pose) ? body.pose : null,
    robe: body.role === "monk" && Number.isSafeInteger(body.robe) ? Math.min(99, Math.max(0, body.robe)) : 0,
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

async function handleEffect(req, res) {
  const body = await readJson(req);
  const peer = peers.get(body.pid);
  if (!peer) return json(res, 404, { error: "not connected" });
  if (!EFFECT_KINDS[peer.presence.role]?.includes(body.kind)) return json(res, 400, { error: "unknown effect" });
  const now = Date.now();
  if (now - peer.lastEffect < 1000) return json(res, 429, { error: "too fast" });
  peer.lastEffect = now;
  broadcast("effect", { kind: body.kind, from: body.pid });
  json(res, 200, { ok: true });
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
    if (req.method === "GET" && url.pathname === "/events") return handleEvents(req, res, url);
    if (req.method === "POST" && url.pathname === "/api/presence") return await handlePresence(req, res);
    if (req.method === "POST" && url.pathname === "/api/emit") return await handleEmit(req, res);
    if (req.method === "POST" && url.pathname === "/api/effect") return await handleEffect(req, res);
    if (req.method === "GET") return serveStatic(req, res, url);
    res.writeHead(405);
    res.end();
  } catch (err) {
    json(res, 400, { error: err.message });
  }
});

module.exports = server;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Một đêm đầu đà đang chạy ở http://localhost:${PORT}`);
    console.log("Mở nhiều tab hoặc nhiều máy cùng mạng LAN để chơi cùng nhau.");
  });
}
