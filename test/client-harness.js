// Loads browser scripts into a vm sandbox with fake timers, localStorage and fetch.
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const PUBLIC = path.join(__dirname, "..", "public");

function makeSandbox() {
  const store = new Map();
  const handlers = {};
  const timers = new Map();
  let nextId = 1, now = 0;
  const calls = [];
  const sb = {
    console,
    JSON, Promise, Object, Array, Set, Map, Math, Date, Error, Number, String,
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: (k) => { store.delete(k); },
    },
    document: { visibilityState: "visible", addEventListener: (ev, fn) => { (handlers["doc:" + ev] ||= []).push(fn); } },
    setTimeout: (fn, ms) => { const id = nextId++; timers.set(id, { at: now + (ms || 0), fn }); return id; },
    clearTimeout: (id) => { timers.delete(id); },
    fetch: async (url, opts = {}) => {
      const call = { url, method: opts.method || "GET", body: opts.body ? JSON.parse(opts.body) : undefined, keepalive: !!opts.keepalive };
      calls.push(call);
      const res = await sb.__route(call);
      return { ok: res.status >= 200 && res.status < 300, status: res.status, json: async () => res.body || {} };
    },
    __route: async () => ({ status: 200, body: {} }),
  };
  sb.window = sb;
  sb.addEventListener = (ev, fn) => { (sb.__h[ev] ||= []).push(fn); };
  sb.__h = {};
  sb.fire = (ev) => (sb.__h[ev] || []).forEach((f) => f());
  sb.calls = calls;
  sb.store = store;
  // Run due timers up to ms ahead, letting promises settle between them.
  sb.advance = async (ms) => {
    const end = now + ms;
    for (;;) {
      await settle();
      const due = [...timers.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!due) break;
      timers.delete(due[0]);
      now = Math.max(now, due[1].at);
      due[1].fn();
    }
    now = end;
    await settle();
  };
  sb.pendingTimers = () => timers.size;
  return vm.createContext(sb);
}
const settle = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); await new Promise((r) => setImmediate(r)); };

function load(sb, file) {
  vm.runInContext(fs.readFileSync(path.join(PUBLIC, file), "utf8"), sb, { filename: file });
  return sb;
}

module.exports = { makeSandbox, load, settle };
