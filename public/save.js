// Where progress is kept.
// Guests: in this browser (localStorage), exactly as before.
// Signed in: account-wide keys (story memory, nights played, roles finished) go to the account;
// per-character keys (mind, cards, items, history) go to the character being played.
window.Save = (() => {
  const ACCOUNT_KEYS = ["dhutanga.memory", "dhutanga.runs", "dhutanga.completed"];
  const CHAR_KEYS = ["dhutanga.mind", "dhutanga.history"];
  const GUEST_ROLE = "dhutanga.guestRole";
  const GUEST_NICK = "dhutanga.guestNick";
  let me = { user: null, google: false, devLogin: false };
  let acct = {};          // account kv (strings, like localStorage)
  let char = null;        // { id, name, role, kv }
  let acctTimer = null, charTimer = null;

  const ls = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const signedIn = () => !!me.user;

  async function api(method, url, body, keepalive) {
    const r = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : {}, body: body ? JSON.stringify(body) : undefined, credentials: "same-origin", keepalive: !!keepalive });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(data.error || "request failed"), { status: r.status });
    return data;
  }

  function accountFromServer(a) {
    acct = {
      "dhutanga.memory": JSON.stringify(Array.isArray(a.memory) ? a.memory : []),
      "dhutanga.runs": String(a.runs || 0),
      "dhutanga.completed": JSON.stringify(a.completed || {}),
    };
  }
  function accountToServer() {
    const parse = (k, d) => { try { return JSON.parse(acct[k] ?? d); } catch { return JSON.parse(d); } };
    return { memory: parse("dhutanga.memory", "[]"), runs: Number(acct["dhutanga.runs"]) || 0, completed: parse("dhutanga.completed", "{}") };
  }
  function charToServer() {
    const parse = (k, d) => { try { return JSON.parse(char.kv[k] ?? d); } catch { return JSON.parse(d); } };
    return { mind: parse("dhutanga.mind", "null"), history: parse("dhutanga.history", "[]") };
  }

  // ---------- key/value used by the game ----------
  function get(key) {
    if (signedIn() && ACCOUNT_KEYS.includes(key)) return acct[key] ?? null;
    if (signedIn() && CHAR_KEYS.includes(key) && char) return char.kv[key] ?? null;
    return ls.get(key);
  }
  function set(key, value) {
    if (signedIn() && ACCOUNT_KEYS.includes(key)) { acct[key] = value; queueAccount(); return; }
    if (signedIn() && CHAR_KEYS.includes(key) && char) { char.kv[key] = value; queueChar(); return; }
    ls.set(key, value);
  }
  function remove(key) {
    if (signedIn() && ACCOUNT_KEYS.includes(key)) { delete acct[key]; queueAccount(); return; }
    if (signedIn() && CHAR_KEYS.includes(key) && char) { delete char.kv[key]; queueChar(); return; }
    ls.del(key);
  }
  function queueAccount() { clearTimeout(acctTimer); acctTimer = setTimeout(pushAccount, 1200); }
  function queueChar() { clearTimeout(charTimer); charTimer = setTimeout(pushChar, 1500); }
  function pushAccount(keepalive) { acctTimer = null; if (signedIn()) return api("PUT", "/api/account", accountToServer(), keepalive).catch((e) => console.warn("save account:", e.message)); }
  function pushChar(keepalive) { charTimer = null; if (signedIn() && char) return api("PUT", "/api/characters/" + char.id, { data: charToServer() }, keepalive).catch((e) => console.warn("save character:", e.message)); }
  function flush(keepalive) {
    const jobs = [];
    if (acctTimer) { clearTimeout(acctTimer); jobs.push(pushAccount(keepalive)); }
    if (charTimer) { clearTimeout(charTimer); jobs.push(pushChar(keepalive)); }
    return Promise.all(jobs);
  }
  window.addEventListener("pagehide", () => flush(true));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") flush(true); });

  // A short diary for the character: cards found, gifts, visitors, nights finished.
  function log(text) {
    let list = [];
    try { list = JSON.parse(get("dhutanga.history") || "[]"); } catch {}
    list.push({ at: Date.now(), text });
    set("dhutanga.history", JSON.stringify(list.slice(-200)));
  }
  function history() { try { return JSON.parse(get("dhutanga.history") || "[]"); } catch { return []; } }

  // ---------- account & characters ----------
  async function refresh() {
    try { me = await api("GET", "/api/me"); } catch { me = { user: null, google: false, devLogin: false }; }
    if (me.user) accountFromServer(me.account || {});
    return me;
  }
  function kvFromData(data) {
    const kv = {};
    if (data && data.mind) kv["dhutanga.mind"] = JSON.stringify(data.mind);
    if (data && data.history) kv["dhutanga.history"] = JSON.stringify(data.history);
    return kv;
  }
  async function openCharacter(id) {
    await flush();
    const { character } = await api("GET", "/api/characters/" + id);
    char = { id: character.id, name: character.name, role: character.role, kv: kvFromData(character.data) };
    return char;
  }
  async function createCharacter(name, role, data) {
    const { character } = await api("POST", "/api/characters", { name, role, data: data || {} });
    char = { id: character.id, name: character.name, role: character.role, kv: kvFromData(character.data) };
    me.characters = [{ id: char.id, name: char.name, role: char.role, cards: 0, items: 0, updatedAt: new Date().toISOString() }, ...(me.characters || [])];
    return char;
  }
  async function renameCharacter(id, name) {
    const { character } = await api("PATCH", "/api/characters/" + id, { name });
    (me.characters || []).forEach((c) => { if (c.id === id) c.name = character.name; });
    if (char && char.id === id) char.name = character.name;
    return character.name;
  }
  async function deleteCharacter(id) {
    await api("DELETE", "/api/characters/" + id);
    if (char && char.id === id) char = null;
    me.characters = (me.characters || []).filter((c) => c.id !== id);
  }
  async function closeCharacter() { await flush(); char = null; }

  // What a guest played on this device, if anything worth saving.
  function guestProgress() {
    let mind = null, history = [];
    try { mind = JSON.parse(ls.get("dhutanga.mind") || "null"); } catch {}
    try { history = JSON.parse(ls.get("dhutanga.history") || "[]"); } catch {}
    let memory = [];
    try { memory = JSON.parse(ls.get("dhutanga.memory") || "[]"); } catch {}
    const runs = Number(ls.get("dhutanga.runs")) || 0;
    const hasMind = mind && (Object.keys(mind.cards || {}).length || (mind.items || []).length || mind.carita);
    if (!hasMind && !memory.length && !runs) return null;
    return { mind, history, memory, runs, role: ls.get(GUEST_ROLE) || "villager", nick: ls.get(GUEST_NICK) || "", cards: Object.keys((mind && mind.cards) || {}).length, items: ((mind && mind.items) || []).length };
  }
  // Move guest progress into a new character, merge story memory into the account, then clear the device copy.
  async function importGuest(name) {
    const g = guestProgress();
    if (!g) return null;
    const c = await createCharacter(name || g.nick || "Nhân vật đầu tiên", g.role, { mind: g.mind, history: [...g.history, { at: Date.now(), text: "Chuyển từ lần chơi thử vào tài khoản." }] });
    const a = accountToServer();
    let completed = {};
    try { completed = JSON.parse(ls.get("dhutanga.completed") || "{}"); } catch {}
    accountFromServer({ memory: [...new Set([...a.memory, ...g.memory])], runs: Math.max(a.runs, g.runs), completed: { ...a.completed, ...completed } });
    await pushAccount();
    ["dhutanga.mind", "dhutanga.history", "dhutanga.memory", "dhutanga.runs", "dhutanga.completed", GUEST_ROLE, GUEST_NICK].forEach(ls.del);
    char = null;
    return c;
  }

  async function devLogin(name) { await api("POST", "/auth/dev", { name }); return refresh(); }
  async function logout() { await flush(); await api("POST", "/auth/logout", {}); char = null; acct = {}; return refresh(); }

  return {
    get, set, remove, flush, log, history,
    refresh, me: () => me, signedIn, character: () => char,
    openCharacter, createCharacter, deleteCharacter, renameCharacter, closeCharacter,
    guestProgress, importGuest, devLogin, logout,
    setGuestRole: (r, nick) => { ls.set(GUEST_ROLE, r); if (nick) ls.set(GUEST_NICK, nick); },
  };
})();
