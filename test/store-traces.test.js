const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createStore } = require("../store");

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "traces-"));
const mk = (i) => ({ id: "id" + i, kind: "lamp", variant: i % 6, role: "monk", nick: "n" + i, at: 1000 + i });
const fileStoreIn = (dir) => createStore({ accountsFile: path.join(dir, "accounts.json"), tracesFile: path.join(dir, "traces.json") });
const flush = () => new Promise((r) => setTimeout(r, 700));

test("fileStore: missing file gives []", async () => {
  const s = fileStoreIn(tmp());
  assert.deepStrictEqual(await s.loadTraces(60), []);
});

test("fileStore: malformed file gives []", async () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, "traces.json"), "{not json");
  assert.deepStrictEqual(await fileStoreIn(dir).loadTraces(60), []);
  fs.writeFileSync(path.join(dir, "traces.json"), '{"a":1}');
  assert.deepStrictEqual(await fileStoreIn(dir).loadTraces(60), []);
});

test("fileStore: round-trip across instances, oldest first", async () => {
  const dir = tmp();
  const s = fileStoreIn(dir);
  for (let i = 0; i < 3; i++) await s.addTrace(mk(i));
  await flush();
  const again = fileStoreIn(dir);
  assert.deepStrictEqual(await again.loadTraces(10), [mk(0), mk(1), mk(2)]);
});

test("fileStore: loadTraces(limit) returns the newest, oldest first", async () => {
  const s = fileStoreIn(tmp());
  for (let i = 0; i < 5; i++) await s.addTrace(mk(i));
  assert.deepStrictEqual((await s.loadTraces(2)).map((t) => t.id), ["id3", "id4"]);
});

test("fileStore: prunes to 500", async () => {
  const s = fileStoreIn(tmp());
  for (let i = 0; i < 510; i++) await s.addTrace(mk(i));
  const all = await s.loadTraces(1000);
  assert.strictEqual(all.length, 500);
  assert.strictEqual(all[0].id, "id10");
  assert.strictEqual(all[499].id, "id509");
});

function fakePool(rowsForSelect = []) {
  const calls = [];
  return { calls, query: async (text, params) => { calls.push({ text, params }); return /^\s*select/i.test(text) ? { rows: rowsForSelect } : { rows: [], rowCount: 0 }; } };
}

test("pgStore: addTrace uses a parameterized insert", async () => {
  const pool = fakePool();
  const s = createStore({ pool });
  const t = mk(7);
  await s.addTrace(t);
  const ins = pool.calls.find((c) => /insert into traces/i.test(c.text));
  assert.ok(ins, "insert issued");
  assert.deepStrictEqual(ins.params, [t.id, t.kind, t.variant, t.role, t.nick, t.at]);
  assert.match(ins.text, /\$1.*\$6/s);
  assert.ok(!ins.text.includes(t.nick) && !ins.text.includes(t.id));
});

test("pgStore: creates the traces table idempotently", async () => {
  const pool = fakePool();
  const s = createStore({ pool });
  await s.loadTraces(5);
  assert.ok(pool.calls.some((c) => /create table if not exists traces/i.test(c.text)));
});

test("pgStore: loadTraces maps rows back, oldest first, limit as parameter", async () => {
  // DB returns newest first; bigint columns come back as strings.
  const rows = [
    { id: "b", kind: "lamp", variant: 2, role: null, nick: "B", at: "2000" },
    { id: "a", kind: "incense", variant: 0, role: "monk", nick: "A", at: "1000" },
  ];
  const pool = fakePool(rows);
  const s = createStore({ pool });
  const out = await s.loadTraces(60);
  assert.deepStrictEqual(out, [
    { id: "a", kind: "incense", variant: 0, role: "monk", nick: "A", at: 1000 },
    { id: "b", kind: "lamp", variant: 2, role: null, nick: "B", at: 2000 },
  ]);
  const sel = pool.calls.filter((c) => /from traces/i.test(c.text)).pop();
  assert.deepStrictEqual(sel.params, [60]);
});

test("pgStore: prunes old rows with a parameterized delete", async () => {
  const pool = fakePool();
  const s = createStore({ pool });
  for (let i = 0; i < 120; i++) await s.addTrace(mk(i));
  const dels = pool.calls.filter((c) => /delete from traces/i.test(c.text));
  assert.ok(dels.length >= 1 && dels.length < 120, "pruned occasionally, not every insert");
  assert.deepStrictEqual(dels[0].params, [500]);
});

test("getStore returns one shared instance", () => {
  const { getStore } = require("../store");
  assert.strictEqual(getStore(), getStore());
});
