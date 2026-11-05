// Accounts, sessions and characters.
// With DATABASE_URL set (e.g. a Neon Postgres connection string) everything lives in Postgres.
// Without it, a JSON file in data/ is used: fine for local testing, but on Render Free that file
// is wiped on every deploy or restart.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SESSION_DAYS = 60;
const MAX_CHARACTERS = 12;
const newId = () => crypto.randomUUID();
const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

function summary(c) {
  const mind = (c.data && c.data.mind) || {};
  return {
    id: c.id, name: c.name, role: c.role, createdAt: c.created_at, updatedAt: c.updated_at,
    cards: Object.keys(mind.cards || {}).length, items: (mind.items || []).length,
    carita: mind.carita || null,
  };
}

// ---------- Postgres ----------
function pgStore(url) {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: url, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false }, max: 5 });
  const q = (text, params) => pool.query(text, params);
  const ready = q(`
    create table if not exists users (
      id text primary key, provider_sub text unique not null, email text, name text, picture text,
      account jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
    create table if not exists sessions (
      token_hash text primary key, user_id text not null references users(id) on delete cascade,
      expires_at timestamptz not null);
    create table if not exists characters (
      id text primary key, user_id text not null references users(id) on delete cascade,
      name text not null, role text not null, data jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now());
    create index if not exists characters_user on characters(user_id);
  `);
  const wait = async () => { await ready; };
  return {
    kind: "postgres",
    async upsertUser(sub, profile) {
      await wait();
      const r = await q(
        `insert into users (id, provider_sub, email, name, picture) values ($1,$2,$3,$4,$5)
         on conflict (provider_sub) do update set email = excluded.email, name = excluded.name, picture = excluded.picture
         returning id, name, email, picture`,
        [newId(), sub, profile.email || null, profile.name || null, profile.picture || null]);
      return r.rows[0];
    },
    async createSession(userId) {
      await wait();
      const token = crypto.randomBytes(32).toString("base64url");
      await q("insert into sessions (token_hash, user_id, expires_at) values ($1,$2, now() + make_interval(days => $3::int))", [hashToken(token), userId, SESSION_DAYS]);
      return token;
    },
    async sessionUser(token) {
      if (!token) return null;
      await wait();
      const r = await q("select u.id, u.name, u.email, u.picture, u.account from sessions s join users u on u.id = s.user_id where s.token_hash = $1 and s.expires_at > now()", [hashToken(token)]);
      return r.rows[0] || null;
    },
    async deleteSession(token) { await wait(); await q("delete from sessions where token_hash = $1", [hashToken(token)]); },
    async saveAccount(userId, account) { await wait(); await q("update users set account = $2 where id = $1", [userId, account]); },
    async listCharacters(userId) {
      await wait();
      const r = await q("select id, name, role, data, created_at, updated_at from characters where user_id = $1 order by updated_at desc", [userId]);
      return r.rows.map(summary);
    },
    async createCharacter(userId, name, role, data) {
      await wait();
      const n = await q("select count(*)::int as n from characters where user_id = $1", [userId]);
      if (n.rows[0].n >= MAX_CHARACTERS) throw new Error("too many characters");
      const r = await q("insert into characters (id, user_id, name, role, data) values ($1,$2,$3,$4,$5) returning id, name, role, data, created_at, updated_at", [newId(), userId, name, role, data || {}]);
      return r.rows[0];
    },
    async getCharacter(userId, id) {
      await wait();
      const r = await q("select id, name, role, data, created_at, updated_at from characters where user_id = $1 and id = $2", [userId, id]);
      return r.rows[0] || null;
    },
    async saveCharacter(userId, id, data) {
      await wait();
      const r = await q("update characters set data = $3, updated_at = now() where user_id = $1 and id = $2", [userId, id, data]);
      return r.rowCount > 0;
    },
    async renameCharacter(userId, id, name) {
      await wait();
      const r = await q("update characters set name = $3, updated_at = now() where user_id = $1 and id = $2", [userId, id, name]);
      return r.rowCount > 0;
    },
    async deleteCharacter(userId, id) { await wait(); await q("delete from characters where user_id = $1 and id = $2", [userId, id]); },
  };
}

// ---------- JSON file (local testing) ----------
function fileStore(file) {
  let db = { users: {}, sessions: {}, characters: {} };
  try { db = { ...db, ...JSON.parse(fs.readFileSync(file, "utf8")) }; } catch {}
  let timer = null;
  const persist = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFile(file, JSON.stringify(db), (err) => err && console.error("save accounts failed:", err.message));
    }, 300);
  };
  const now = () => new Date().toISOString();
  return {
    kind: "file",
    async upsertUser(sub, profile) {
      let u = Object.values(db.users).find((x) => x.provider_sub === sub);
      if (!u) { u = { id: newId(), provider_sub: sub, account: {}, created_at: now() }; db.users[u.id] = u; }
      Object.assign(u, { email: profile.email || null, name: profile.name || null, picture: profile.picture || null });
      persist();
      return { id: u.id, name: u.name, email: u.email, picture: u.picture };
    },
    async createSession(userId) {
      const token = crypto.randomBytes(32).toString("base64url");
      db.sessions[hashToken(token)] = { user_id: userId, expires_at: Date.now() + SESSION_DAYS * 864e5 };
      persist();
      return token;
    },
    async sessionUser(token) {
      if (!token) return null;
      const s = db.sessions[hashToken(token)];
      if (!s || s.expires_at < Date.now()) return null;
      const u = db.users[s.user_id];
      return u ? { id: u.id, name: u.name, email: u.email, picture: u.picture, account: u.account || {} } : null;
    },
    async deleteSession(token) { delete db.sessions[hashToken(token)]; persist(); },
    async saveAccount(userId, account) { if (db.users[userId]) { db.users[userId].account = account; persist(); } },
    async listCharacters(userId) {
      return Object.values(db.characters).filter((c) => c.user_id === userId).sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1)).map(summary);
    },
    async createCharacter(userId, name, role, data) {
      if (Object.values(db.characters).filter((c) => c.user_id === userId).length >= MAX_CHARACTERS) throw new Error("too many characters");
      const c = { id: newId(), user_id: userId, name, role, data: data || {}, created_at: now(), updated_at: now() };
      db.characters[c.id] = c; persist();
      return c;
    },
    async getCharacter(userId, id) { const c = db.characters[id]; return c && c.user_id === userId ? c : null; },
    async saveCharacter(userId, id, data) {
      const c = db.characters[id];
      if (!c || c.user_id !== userId) return false;
      c.data = data; c.updated_at = now(); persist();
      return true;
    },
    async renameCharacter(userId, id, name) {
      const c = db.characters[id];
      if (!c || c.user_id !== userId) return false;
      c.name = name; c.updated_at = now(); persist();
      return true;
    },
    async deleteCharacter(userId, id) { const c = db.characters[id]; if (c && c.user_id === userId) { delete db.characters[id]; persist(); } },
  };
}

function createStore() {
  if (process.env.DATABASE_URL) return pgStore(process.env.DATABASE_URL);
  return fileStore(path.join(__dirname, "data", "accounts.json"));
}

module.exports = { createStore, MAX_CHARACTERS };
