const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const R = (extra) => { const sb = makeSandbox(); if (extra) Object.assign(sb, extra); load(sb, "progress.js"); return load(sb, "reflect.js").NightReflect; };
const HOUR = 3600000;

test("hooks are deterministic per runId and role-specific", () => {
  const r = R();
  for (const role of ["monk", "villager", "ghost"]) {
    assert.equal(r.hookFor(role, "run-abc"), r.hookFor(role, "run-abc"));
    assert.ok(r.HOOKS[role].length >= 6);
    const seen = new Set();
    for (let i = 0; i < 60; i++) seen.add(r.hookFor(role, "run" + i));
    assert.ok(seen.size > 1);
    for (const s of seen) assert.ok(r.HOOKS[role].includes(s));
  }
  assert.equal(r.HOOKS.monk.filter((h) => r.HOOKS.ghost.includes(h)).length, 0);
  assert.equal(typeof r.hookFor("nope", "x"), "string");
});

test("no pressure wording or 'Bạn' in hooks and stories", () => {
  const r = R();
  const all = [...Object.values(r.HOOKS).flat(), ...Object.values(r.AWAY_STORIES).flat().flat()];
  for (const s of all) { assert.ok(!/đừng bỏ lỡ|Bạn/i.test(s), s); }
});

test("away story bands: <1h, <1 day, >=1 day; 30 days equals 1 day", () => {
  const r = R();
  const at = 1000000;
  assert.equal(r.awayBand(at, at + 10 * 60000), "short");
  assert.equal(r.awayBand(at, at + 5 * HOUR), "mid");
  assert.equal(r.awayBand(at, at + 24 * HOUR), "long");
  assert.equal(r.awayBand(at, at + 30 * 24 * HOUR), "long");
  assert.equal(r.awayBand(at, at - 5), "short");
  const a = r.awayStory({ activity: "sit", at, hook: "Mai nữa." }, at + 24 * HOUR, "r1");
  const b = r.awayStory({ activity: "sit", at, hook: "Mai nữa." }, at + 30 * 24 * HOUR, "r1");
  assert.deepEqual(a, b);
  assert.ok(a.lines.length >= 2 && a.lines.length <= 5);
  assert.equal(a.lines[a.lines.length - 1], "Mai nữa.");
  const s = r.awayStory({ activity: "sit", at }, at + 60000, "r1");
  assert.notDeepEqual(s.lines, a.lines);
});

test("away story works for every activity and unknown ones", () => {
  const r = R();
  for (const role of ["monk", "villager", "ghost"]) for (const act of r.ACTIVITIES[role]) {
    const s = r.awayStory({ activity: act.id, at: 0 }, HOUR, "x");
    assert.ok(s.lines.length >= 2, act.id);
  }
  assert.ok(r.awayStory({ activity: "???", at: 0 }, HOUR, "x").lines.length >= 1);
  assert.ok(r.awayStory(null, 0, "x").lines.length >= 1);
});

test("diary summary filters by startedAt, groups duplicates, caps, empty message", () => {
  const r = R();
  const h = [{ at: 1, text: "Cũ." }, { at: 10, text: "A." }, { at: 11, text: "A." }, { at: 12, text: "B." }];
  assert.deepEqual([...r.summarizeDiary(h, 10)], ["A. (×2)", "B."]);
  const many = Array.from({ length: 30 }, (_, i) => ({ at: 100 + i, text: "Việc " + i }));
  assert.equal(r.summarizeDiary(many, 100).length, 8);
  assert.deepEqual([...r.summarizeDiary([], 5)], ["Một đêm lặng lẽ."]);
  assert.deepEqual([...r.summarizeDiary(null, 5)], ["Một đêm lặng lẽ."]);
  assert.deepEqual([...r.summarizeDiary([{ at: 20, text: "Đi qua một đêm (sư)." }, { at: 21, text: "Hồi hướng công đức cuối đêm." }], 10)], ["Một đêm lặng lẽ."]);
});

test("diary fallback without startedAt", () => {
  const r = R();
  const h = [{ at: 1, text: "Cũ." }, { at: 2, text: "Đi qua một đêm (sư)." }, { at: 3, text: "Mới." }, { at: 4, text: "Đi qua một đêm (sư)." }];
  assert.deepEqual([...r.summarizeDiary(h, undefined)], ["Mới."]);
  const plain = Array.from({ length: 20 }, (_, i) => ({ at: i, text: "L" + i }));
  assert.equal(r.summarizeDiary(plain, undefined).length, 8);
});

test("dedicate fires once per runId, night event once per runId", () => {
  const calls = [];
  const r = R({ Milestones: { notify: (e, d, o) => { calls.push([e, d, o]); return e === "dedicate" ? [{ id: "m", title: "T", text: "x" }] : []; } } });
  let cp = { runId: "r1", day: 2, role: "monk" };
  const a = r.dedicate(cp);
  assert.equal(a.first, true);
  assert.equal(a.milestones.length, 1);
  const b = r.dedicate(a.cp);
  assert.equal(b.first, false);
  assert.deepEqual([...b.milestones], []);
  assert.equal(calls.filter((c) => c[0] === "dedicate").length, 1);
  assert.equal(JSON.stringify(calls[0][2]), JSON.stringify({ quiet: true }));
  const n1 = r.nightEvent(cp);
  const n2 = r.nightEvent(n1.cp);
  assert.equal(n1.first, true); assert.equal(n2.first, false);
  assert.equal(calls.filter((c) => c[0] === "night").length, 1);
  assert.equal(JSON.stringify(calls.find((c) => c[0] === "night")[1]), JSON.stringify({ day: 2, role: "monk" }));
  // a new run may dedicate again
  assert.equal(r.dedicate({ ...a.cp, runId: "r2" }).first, true);
});

test("works when Milestones is null or throws", () => {
  const r = R({ Milestones: null });
  assert.equal(r.dedicate({ runId: "a" }).first, true);
  assert.deepEqual([...r.nightEvent({ runId: "a", day: 1, role: "ghost" }).milestones], []);
  const r2 = R({ Milestones: { notify: () => { throw new Error("x"); }, since: () => { throw new Error("y"); } } });
  assert.deepEqual([...r2.dedicate({ runId: "a" }).milestones], []);
  assert.deepEqual([...r2.milestonesSince(5)], []);
});

test("activities per role as specified", () => {
  const r = R();
  assert.equal(r.ACTIVITIES.monk.length, 4);
  assert.equal(r.ACTIVITIES.villager.length, 3);
  assert.equal(r.ACTIVITIES.ghost.length, 2);
  assert.equal(r.ACTIVITIES.monk[0].label, "Ngồi thiền dưới cội gạo");
});

test("chooseAway stores activity, at and hook in the checkpoint", () => {
  const r = R();
  const cp = r.chooseAway({ runId: "r1", role: "monk" }, "sit", 777);
  assert.equal(cp.away.activity, "sit");
  assert.equal(cp.away.at, 777);
  assert.equal(cp.away.hook, r.hookFor("monk", "r1"));
  assert.match(r.closingLine("monk", "sit"), /Người này đang ngồi thiền dưới cội gạo/);
});
