// Google sign-in (OAuth 2.0 authorization code flow, no extra libraries), sessions in an HttpOnly cookie,
// and the account / character API. Playing without signing in still works: guests keep progress in
// their browser and can save it into an account later.
const crypto = require("crypto");
const { createStore } = require("./store");

const store = createStore();
const COOKIE = "dh_sess";
const STATE_COOKIE = "dh_oauth";
const ROLES = ["monk", "ghost", "villager"];
const MAX_DATA = 96 * 1024;
const isProd = process.env.NODE_ENV === "production";
const googleOn = () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
// A quick fake sign-in for local testing only (never in production).
const devLoginOn = () => !isProd && process.env.DEV_LOGIN !== "0";

function parseCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function cookie(name, value, maxAgeSec) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${isProd ? "; Secure" : ""}`;
}
function json(res, status, data, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  res.end(JSON.stringify(data));
}
function redirect(res, to, headers = {}) { res.writeHead(302, { Location: to, ...headers }); res.end(); }
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > limit) { reject(new Error("too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(JSON.parse(body || "{}")); } catch { reject(new Error("bad json")); } });
  });
}
function origin(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return `${proto}://${req.headers.host}`;
}
const cleanName = (v) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);

async function currentUser(req) {
  try { return await store.sessionUser(parseCookies(req)[COOKIE]); } catch (e) { console.error("session lookup failed:", e.message); return null; }
}
async function startSession(res, user, back = "/") {
  const token = await store.createSession(user.id);
  redirect(res, back, { "Set-Cookie": [cookie(COOKIE, token, 60 * 86400), cookie(STATE_COOKIE, "", 0)] });
}

// ---------- Google ----------
function googleStart(req, res) {
  if (!googleOn()) return json(res, 503, { error: "google sign-in is not configured" });
  const state = crypto.randomBytes(16).toString("base64url");
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: origin(req) + "/auth/google/callback",
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  redirect(res, "https://accounts.google.com/o/oauth2/v2/auth?" + params, { "Set-Cookie": cookie(STATE_COOKIE, state, 600) });
}
async function googleCallback(req, res, url) {
  const state = url.searchParams.get("state");
  if (!state || state !== parseCookies(req)[STATE_COOKIE]) return redirect(res, "/?login=failed");
  const code = url.searchParams.get("code");
  if (!code) return redirect(res, "/?login=cancelled");
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: origin(req) + "/auth/google/callback", grant_type: "authorization_code",
      }),
    });
    const tok = await r.json();
    if (!tok.id_token) throw new Error("no id_token");
    // The ID token came straight from Google's token endpoint over TLS, so its claims can be read
    // without re-checking the signature; we still check issuer, audience and expiry.
    const claims = JSON.parse(Buffer.from(tok.id_token.split(".")[1], "base64url").toString("utf8"));
    if (!["accounts.google.com", "https://accounts.google.com"].includes(claims.iss)) throw new Error("bad iss");
    if (claims.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("bad aud");
    if (claims.exp * 1000 < Date.now()) throw new Error("expired");
    const user = await store.upsertUser("google:" + claims.sub, { email: claims.email, name: claims.name || claims.given_name, picture: claims.picture });
    await startSession(res, user, "/?login=ok");
  } catch (e) {
    console.error("google sign-in failed:", e.message);
    redirect(res, "/?login=failed");
  }
}

// ---------- API ----------
async function me(req, res) {
  const user = await currentUser(req);
  const base = { google: googleOn(), devLogin: devLoginOn(), storage: store.kind };
  if (!user) return json(res, 200, { ...base, user: null });
  const characters = await store.listCharacters(user.id);
  json(res, 200, { ...base, user: { name: user.name, email: user.email, picture: user.picture }, account: user.account || {}, characters });
}

// Returns true when the request was handled.
async function handle(req, res, url) {
  const p = url.pathname;
  if (req.method === "GET" && p === "/auth/google") { googleStart(req, res); return true; }
  if (req.method === "GET" && p === "/auth/google/callback") { await googleCallback(req, res, url); return true; }
  if (req.method === "POST" && p === "/auth/dev") {
    if (!devLoginOn()) { json(res, 404, { error: "not found" }); return true; }
    const body = await readBody(req, 2048);
    const name = cleanName(body.name) || "Người thử";
    const user = await store.upsertUser("dev:" + name.toLowerCase(), { name, email: null, picture: null });
    const token = await store.createSession(user.id);
    json(res, 200, { ok: true }, { "Set-Cookie": cookie(COOKIE, token, 60 * 86400) });
    return true;
  }
  if (req.method === "POST" && p === "/auth/logout") {
    const token = parseCookies(req)[COOKIE];
    if (token) await store.deleteSession(token).catch(() => {});
    json(res, 200, { ok: true }, { "Set-Cookie": cookie(COOKIE, "", 0) });
    return true;
  }
  if (req.method === "GET" && p === "/api/me") { await me(req, res); return true; }
  if (!p.startsWith("/api/account") && !p.startsWith("/api/characters")) return false;

  // everything below needs a signed-in user, and JSON bodies (blocks cross-site form posts)
  if (req.method !== "GET" && !(req.headers["content-type"] || "").includes("application/json")) { json(res, 415, { error: "json only" }); return true; }
  const user = await currentUser(req);
  if (!user) { json(res, 401, { error: "not signed in" }); return true; }

  if (req.method === "PUT" && p === "/api/account") {
    const body = await readBody(req, MAX_DATA);
    const account = { memory: Array.isArray(body.memory) ? body.memory.map(String).slice(0, 400) : [], runs: Math.max(0, Math.min(9999, Number(body.runs) || 0)), completed: typeof body.completed === "object" && body.completed ? Object.fromEntries(ROLES.filter((r) => body.completed[r]).map((r) => [r, true])) : {} };
    await store.saveAccount(user.id, account);
    json(res, 200, { ok: true });
    return true;
  }
  if (req.method === "GET" && p === "/api/characters") { json(res, 200, { characters: await store.listCharacters(user.id) }); return true; }
  if (req.method === "POST" && p === "/api/characters") {
    const body = await readBody(req, MAX_DATA);
    const role = ROLES.includes(body.role) ? body.role : null;
    if (!role) { json(res, 400, { error: "bad role" }); return true; }
    const data = body.data && typeof body.data === "object" ? body.data : {};
    try {
      const c = await store.createCharacter(user.id, cleanName(body.name) || "Vô danh", role, data);
      json(res, 200, { character: { id: c.id, name: c.name, role: c.role, data: c.data } });
    } catch (e) { json(res, 400, { error: e.message }); }
    return true;
  }
  const m = p.match(/^\/api\/characters\/([\w-]{8,64})$/);
  if (m) {
    const id = m[1];
    if (req.method === "GET") {
      const c = await store.getCharacter(user.id, id);
      if (!c) json(res, 404, { error: "not found" });
      else json(res, 200, { character: { id: c.id, name: c.name, role: c.role, data: c.data || {} } });
      return true;
    }
    if (req.method === "PUT") {
      const body = await readBody(req, MAX_DATA);
      const ok = await store.saveCharacter(user.id, id, body.data && typeof body.data === "object" ? body.data : {});
      json(res, ok ? 200 : 404, ok ? { ok: true } : { error: "not found" });
      return true;
    }
    if (req.method === "PATCH") {
      const body = await readBody(req, 2048);
      const name = cleanName(body.name);
      if (!name) { json(res, 400, { error: "empty name" }); return true; }
      const ok = await store.renameCharacter(user.id, id, name);
      json(res, ok ? 200 : 404, ok ? { character: { id, name } } : { error: "not found" });
      return true;
    }
    if (req.method === "DELETE") { await store.deleteCharacter(user.id, id); json(res, 200, { ok: true }); return true; }
  }
  json(res, 404, { error: "not found" });
  return true;
}

module.exports = { handle, storeKind: () => store.kind };
