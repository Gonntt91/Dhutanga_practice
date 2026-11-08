// Saved connections API: "Giữ kết nối" (connect), bỏ kết nối (disconnect), the owner's list and "seen".
// Everything is addressed by public handle. The caller's own characterId only says WHICH of their
// characters acts; it is checked with store.getCharacter(user.id, id) on every request.
// Internal character and user ids never appear in a response.
const auth = require("./auth");
const social = require("./social");
const { levelOf, connectDecision, buildConnectionList } = require("./connection-view");

const CHAR_ID_RE = /^[\w-]{8,64}$/;

// The caller's own character, or a 400/404 response (returns null).
async function ownCharacter(res, user, characterId) {
  if (typeof characterId !== "string" || !CHAR_ID_RE.test(characterId)) {
    social.json(res, 400, { error: "bad character" });
    return null;
  }
  const own = await auth.store.getCharacter(user.id, characterId);
  if (!own) {
    social.json(res, 404, { error: "not found" });
    return null;
  }
  return own;
}

async function connectRoute(req, res, action) {
  const user = await social.signedIn(req, res);
  if (!user) return;
  const body = await social.readBody(req, 2048);
  const own = await ownCharacter(res, user, body.characterId);
  if (!own) return;
  const target = await social.targetFromBody(res, body);
  if (!target) return;
  const store = auth.store;

  if (action === "/api/disconnect") {
    await store.removeConnection(own.id, target.id);
    const pair = await store.connectionPair(own.id, target.id);
    return social.json(res, 200, { ok: true, level: levelOf(pair) });
  }

  const pair = await store.connectionPair(own.id, target.id);
  const decision = connectDecision({
    sameAccount: target.user_id === user.id,
    blocked: await store.isBlockedEither(user.id, target.user_id),
    hasEncounter: await store.hasEncounter(own.id, target.id),
    pair,
    savedCount: (await store.listConnections(own.id)).filter((r) => r.iSaved).length,
  });
  if (!decision.ok) return social.json(res, decision.status, { error: decision.error });
  if (!decision.already) {
    const added = await store.addConnection(own.id, target.id, Date.now());
    if (!added) return social.json(res, 400, { error: "cannot connect" });
  }
  const after = await store.connectionPair(own.id, target.id);
  social.json(res, 200, { ok: true, level: levelOf(after) });
}

// Owner only. Blocked accounts and characters that no longer exist are left out.
// status is null unless the level is "quen" and the other character has hide_status false.
async function listRoute(req, res, characterId, isOnline) {
  const user = await social.signedIn(req, res);
  if (!user) return;
  const own = await ownCharacter(res, user, characterId);
  if (!own) return;
  const rows = await auth.store.listConnections(own.id);
  const blockedUserIds = new Set();
  for (const r of rows) {
    if (await auth.store.isBlockedEither(user.id, r.otherUserId)) blockedUserIds.add(r.otherUserId);
  }
  const connections = buildConnectionList(rows, { isOnline, now: Date.now(), blockedUserIds, ownUserId: user.id });
  const counts = await auth.store.countIncomingUnseen([own.id]);
  social.json(res, 200, { connections, newCount: counts.get(own.id) || 0 });
}

// Marks the incoming connections of this character as looked at.
async function seenRoute(req, res, characterId) {
  const user = await social.signedIn(req, res);
  if (!user) return;
  await social.readBody(req, 2048);
  const own = await ownCharacter(res, user, characterId);
  if (!own) return;
  await auth.store.markIncomingSeen(own.id, Date.now());
  social.json(res, 200, { ok: true });
}

// Returns true when the request was handled. deps.isOnline(charId) comes from server.js (live peers).
async function handle(req, res, url, deps = {}) {
  const p = url.pathname;
  const isOnline = typeof deps.isOnline === "function" ? deps.isOnline : () => false;
  try {
    if (p === "/api/connect" || p === "/api/disconnect") {
      if (req.method !== "POST") { social.json(res, 405, { error: "method not allowed" }); return true; }
      await connectRoute(req, res, p);
      return true;
    }
    const m = p.match(/^\/api\/connections\/([\w-]{8,64})(\/seen)?$/);
    if (m) {
      if (m[2]) {
        if (req.method !== "POST") { social.json(res, 405, { error: "method not allowed" }); return true; }
        await seenRoute(req, res, m[1]);
      } else {
        if (req.method !== "GET") { social.json(res, 405, { error: "method not allowed" }); return true; }
        await listRoute(req, res, m[1], isOnline);
      }
      return true;
    }
    return false;
  } catch (err) {
    if (err.client) social.json(res, 400, { error: err.message });
    else { console.error("connections api failed:", err.message); social.json(res, 500, { error: "server error" }); }
    return true;
  }
}

module.exports = { handle };
