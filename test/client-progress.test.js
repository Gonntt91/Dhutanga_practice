const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const STORY = { monk: { start: "a0", meterStart: 5, scenes: { a0: { place: "x" }, a1: { place: "y" }, end: { end: true, place: "z" } } } };
const SPAWN = { x: 100, y: 200 };
const BOUNDS = { minX: 12, maxX: 628, minY: 60, maxY: 2000 };
const P = () => load(makeSandbox(), "progress.js").Progress;

test("create makes a v1 checkpoint at the story start", () => {
  const P_ = P();
  const cp = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 1 });
  assert.equal(cp.v, 1);
  assert.equal(cp.role, "monk");
  assert.equal(cp.sceneId, "a0");
  assert.equal(cp.meter, 5);
  assert.equal(cp.day, 1);
  assert.equal(cp.endedRunId, null);
  assert.ok(cp.runId && typeof cp.runId === "string");
  assert.deepEqual([cp.x, cp.y], [100, 200]);
});

test("run ids are unique", () => {
  const P_ = P();
  assert.notEqual(P_.newRunId(), P_.newRunId());
});

test("valid checkpoint resumes with scene, meter, found and clamped position", () => {
  const P_ = P();
  const cp = { ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN }), sceneId: "a1", meter: 8, found: ["f1"], readTonight: ["k1"], x: 9999, y: -5 };
  const r = P_.decide(cp, "monk", STORY.monk, SPAWN, BOUNDS);
  assert.equal(r.mode, "resume");
  assert.equal(r.cp.sceneId, "a1");
  assert.equal(r.cp.meter, 8);
  assert.deepEqual(r.cp.found, ["f1"]);
  assert.equal(r.cp.runId, cp.runId);
  assert.equal(r.cp.x, 628);
  assert.equal(r.cp.y, 60);
});

test("unknown scene, wrong version, wrong role, garbage -> fresh", () => {
  const P_ = P();
  const base = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  for (const bad of [{ ...base, sceneId: "nope" }, { ...base, v: 99 }, { ...base, role: "ghost" }, null, undefined, "x", 42, {}, { ...base, meter: "a" }]) {
    const r = P_.decide(bad, "monk", STORY.monk, SPAWN, BOUNDS);
    assert.equal(r.mode, "fresh");
    assert.equal(r.cp.sceneId, "a0");
    assert.equal(r.cp.meter, 5);
  }
});

test("invalid checkpoint never throws", () => {
  const P_ = P();
  const weird = [{ found: 5, readTonight: {}, x: "q", sceneId: "a0", v: 1, role: "monk", meter: 3, runId: "r" }, { get sceneId() { throw new Error("boom"); } }];
  for (const w of weird) assert.doesNotThrow(() => P_.decide(w, "monk", STORY.monk, SPAWN, BOUNDS));
});

test("ended run -> new night with day+1 and a new runId", () => {
  const P_ = P();
  const cp = { ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 3 }), sceneId: "end" };
  const done = P_.complete(cp).cp;
  const r = P_.decide(done, "monk", STORY.monk, SPAWN, BOUNDS);
  assert.equal(r.mode, "newnight");
  assert.equal(r.cp.day, 4);
  assert.notEqual(r.cp.runId, cp.runId);
  assert.equal(r.cp.sceneId, "a0");
  assert.equal(r.cp.endedRunId, null);
});

test("complete-once: second completion of the same runId does nothing", () => {
  const P_ = P();
  const cp = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  const a = P_.complete(cp);
  assert.equal(a.first, true);
  assert.equal(a.cp.endedRunId, cp.runId);
  const b = P_.complete(a.cp);
  assert.equal(b.first, false);
  assert.equal(b.cp.endedRunId, cp.runId);
});

test("snapshot copies live state into a checkpoint without mutating the old one", () => {
  const P_ = P();
  const cp = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  const next = P_.snapshot(cp, { sceneId: "a1", meter: 7, found: new Set(["f"]), readTonight: new Set(), x: 50.4, y: 70.6, nightVars: new Set(["v"]) });
  assert.equal(next.sceneId, "a1");
  assert.deepEqual([...next.found], ["f"]);
  assert.deepEqual([...next.vars], ["v"]);
  assert.equal(cp.sceneId, "a0");
  assert.equal(next.runId, cp.runId);
});

test("create sets startedAt", () => {
  const before = Date.now();
  const cp = P().create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  assert.ok(cp.startedAt >= before && cp.startedAt <= Date.now());
});

test("ended run with away -> newnight carries away as returnFrom", () => {
  const P_ = P();
  const away = { activity: "sit", at: 123, hook: "x" };
  const cp = { ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 2 }), sceneId: "end", away };
  const done = P_.complete(cp).cp;
  const r = P_.decide(done, "monk", STORY.monk, SPAWN, BOUNDS);
  assert.equal(r.mode, "newnight");
  assert.equal(r.cp.day, 3);
  assert.deepEqual(r.cp.returnFrom, away);
  assert.equal(r.cp.away, undefined);
  assert.notEqual(r.cp.startedAt, cp.startedAt === undefined ? -1 : null);
});

test("newnight without away has no returnFrom", () => {
  const P_ = P();
  const done = P_.complete({ ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN }), sceneId: "end" }).cp;
  assert.equal(P_.decide(done, "monk", STORY.monk, SPAWN, BOUNDS).cp.returnFrom, undefined);
});

test("resume keeps away and returnFrom untouched", () => {
  const P_ = P();
  const cp = { ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN }), away: { activity: "study", at: 5 }, returnFrom: { activity: "sit", at: 1 } };
  const r = P_.decide(cp, "monk", STORY.monk, SPAWN, BOUNDS);
  assert.equal(r.mode, "resume");
  assert.deepEqual(r.cp.away, { activity: "study", at: 5 });
  assert.deepEqual(r.cp.returnFrom, { activity: "sit", at: 1 });
});

test("old checkpoint without startedAt/away is still valid", () => {
  const P_ = P();
  const cp = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  delete cp.startedAt;
  assert.equal(P_.valid(cp, "monk", STORY.monk), true);
  assert.equal(P_.decide(cp, "monk", STORY.monk, SPAWN, BOUNDS).mode, "resume");
});
