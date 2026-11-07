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

// ---------- story arc across nights ----------
function arcEnv() {
  const sb = makeSandbox();
  load(sb, "story.js");
  load(sb, "story-nights.js");
  load(sb, "chapters.js");
  load(sb, "progress.js");
  return { P: sb.Progress, S: sb.STORY, C: sb.Chapters };
}
const finishNight = (P, S, role, cp, meter) => {
  const scene = S[role].scenes[cp.sceneId];
  const band = scene.endings.findIndex((e) => meter <= e.max);
  return P.complete({ ...cp, meter }, band).cp;
};
const endReachable = (story, from) => {
  const seen = new Set(), stack = [from];
  while (stack.length) {
    const id = stack.pop();
    if (seen.has(id)) continue;
    seen.add(id);
    const sc = story.scenes[id];
    if (sc.end) return id;
    for (const c of sc.choices || []) if (c.next) stack.push(c.next);
    if (sc.watch) stack.push(sc.watch.next);
  }
  throw new Error("no end from " + from);
};

test("create starts in c1 with an empty arc history, and accepts start/meterStart/arc overrides", () => {
  const P_ = P();
  const cp = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  assert.deepEqual(JSON.parse(JSON.stringify(cp.arc)), { chapter: "c1", history: [] });
  const cp2 = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN, start: "a1", meterStart: 8, arc: { chapter: "c2a", history: [] } });
  assert.equal(cp2.sceneId, "a1");
  assert.equal(cp2.meter, 8);
  assert.equal(cp2.arc.chapter, "c2a");
});

test("complete records {chapter, band, day} once", () => {
  const P_ = P();
  const cp = { ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 2 }), sceneId: "end" };
  const a = P_.complete(cp, 2);
  assert.equal(a.first, true);
  assert.deepEqual(JSON.parse(JSON.stringify(a.cp.arc.history)), [{ chapter: "c1", band: 2, day: 2 }]);
  const b = P_.complete(a.cp, 0);
  assert.equal(b.first, false);
  assert.equal(b.cp.arc.history.length, 1);
  assert.equal(b.cp.arc.history[0].band, 2);
});

test("complete on a checkpoint without arc starts one from c1", () => {
  const P_ = P();
  const cp = P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN });
  delete cp.arc;
  const r = P_.complete(cp, 1);
  assert.equal(r.cp.arc.chapter, "c1");
  assert.deepEqual(JSON.parse(JSON.stringify(r.cp.arc.history)), [{ chapter: "c1", band: 1, day: 1 }]);
});

test("newnight carries the arc and starts at the chapter's start scene", () => {
  const { P: P_, S, C } = arcEnv();
  const first = P_.decide(null, "villager", S.villager, SPAWN, BOUNDS).cp;
  assert.equal(first.arc.chapter, "c1");
  assert.equal(first.sceneId, "v1");
  const done = finishNight(P_, S, "villager", { ...first, sceneId: "end" }, 9);
  const r = P_.decide(done, "villager", S.villager, SPAWN, BOUNDS);
  assert.equal(r.mode, "newnight");
  assert.equal(r.cp.day, 2);
  const want = C.startFor("villager", { chapter: "c1", history: [{ chapter: "c1", band: 2, day: 1 }] }, 2);
  assert.equal(want.chapter, "c2a");
  assert.equal(r.cp.arc.chapter, "c2a");
  assert.equal(r.cp.sceneId, want.start);
  assert.equal(r.cp.meter, want.meterStart);
  assert.notEqual(r.cp.sceneId, "v1");
  assert.deepEqual(JSON.parse(JSON.stringify(r.cp.arc.history)), [{ chapter: "c1", band: 2, day: 1 }]);
  assert.equal(P_.valid(r.cp, "villager", S.villager), true);
});

test("newnight for a low-trust villager goes to the doubt chapter; the account memory v_alms overrides", () => {
  const { P: P_, S } = arcEnv();
  const first = P_.decide(null, "villager", S.villager, SPAWN, BOUNDS).cp;
  const done = finishNight(P_, S, "villager", { ...first, sceneId: "end" }, 2);
  assert.equal(P_.decide(done, "villager", S.villager, SPAWN, BOUNDS).cp.arc.chapter, "c2b");
  assert.equal(P_.decide(done, "villager", S.villager, SPAWN, BOUNDS, { mem: ["v_alms"] }).cp.arc.chapter, "c2a");
});

test("each role walks c1 -> c2 -> ordinary nights without ever repeating a chapter", () => {
  const { P: P_, S } = arcEnv();
  for (const role of ["monk", "ghost", "villager"]) {
    let cp = P_.decide(null, role, S[role], SPAWN, BOUNDS).cp;
    const seen = [cp.arc.chapter];
    for (let night = 1; night <= 7; night++) {
      const ended = finishNight(P_, S, role, { ...cp, sceneId: endReachable(S[role], cp.sceneId) }, 5);
      const r = P_.decide(ended, role, S[role], SPAWN, BOUNDS);
      assert.equal(r.mode, "newnight");
      assert.equal(r.cp.day, night + 1);
      assert.ok(S[role].scenes[r.cp.sceneId]);
      seen.push(r.cp.arc.chapter);
      cp = r.cp;
    }
    assert.equal(seen[0], "c1");
    assert.ok(/^c2/.test(seen[1]));
    for (let i = 2; i < seen.length; i++) assert.ok(/^n[12]$/.test(seen[i]));
    for (let i = 1; i < seen.length; i++) assert.notEqual(seen[i], seen[i - 1]);
  }
});

test("resume keeps the current chapter, arc and scene", () => {
  const { P: P_, S } = arcEnv();
  const first = P_.decide(null, "monk", S.monk, SPAWN, BOUNDS).cp;
  const done = finishNight(P_, S, "monk", { ...first, sceneId: "end" }, 9);
  const night2 = P_.decide(done, "monk", S.monk, SPAWN, BOUNDS).cp;
  const mid = { ...night2, meter: 6 };
  const r = P_.decide(mid, "monk", S.monk, SPAWN, BOUNDS);
  assert.equal(r.mode, "resume");
  assert.equal(r.cp.arc.chapter, night2.arc.chapter);
  assert.equal(r.cp.sceneId, night2.sceneId);
  assert.equal(r.cp.runId, night2.runId);
  assert.equal(r.cp.arc.history.length, 1);
});

test("resume of an old checkpoint without arc gets a c1 arc and keeps its scene", () => {
  const { P: P_, S } = arcEnv();
  const old = P_.create({ role: "ghost", story: S.ghost, spawn: SPAWN, day: 2 });
  delete old.arc;
  old.sceneId = "g3";
  const r = P_.decide(old, "ghost", S.ghost, SPAWN, BOUNDS);
  assert.equal(r.mode, "resume");
  assert.equal(r.cp.sceneId, "g3");
  assert.equal(r.cp.arc.chapter, "c1");
});

test("old checkpoint without arc at day >= 2 (night finished) moves on to a c2 chapter", () => {
  const { P: P_, S } = arcEnv();
  for (const role of ["monk", "ghost", "villager"]) {
    const old = { ...P_.create({ role, story: S[role], spawn: SPAWN, day: 2 }), sceneId: "end", meter: 5 };
    delete old.arc;
    const done = { ...old, endedRunId: old.runId };
    const r = P_.decide(done, role, S[role], SPAWN, BOUNDS);
    assert.equal(r.mode, "newnight");
    assert.equal(r.cp.day, 3);
    assert.ok(/^c2/.test(r.cp.arc.chapter), `${role}: ${r.cp.arc.chapter}`);
    assert.ok(S[role].scenes[r.cp.sceneId]);
    assert.notEqual(r.cp.sceneId, S[role].start);
  }
  // a villager who remembered the alms is treated as having trusted
  const v = { ...P_.create({ role: "villager", story: S.villager, spawn: SPAWN, day: 2 }), sceneId: "end", meter: 5 };
  delete v.arc;
  v.endedRunId = v.runId;
  assert.equal(P_.decide(v, "villager", S.villager, SPAWN, BOUNDS, { mem: new Set(["v_alms"]) }).cp.arc.chapter, "c2a");
});

test("with no chapter data in the story, newnight falls back to the story start", () => {
  const P_ = P(); // progress.js alone, fake story
  const done = P_.complete({ ...P_.create({ role: "monk", story: STORY.monk, spawn: SPAWN }), sceneId: "end" }, 1).cp;
  const r = P_.decide(done, "monk", STORY.monk, SPAWN, BOUNDS);
  assert.equal(r.cp.sceneId, "a0");
  assert.equal(r.cp.meter, 5);
  assert.equal(r.cp.arc.chapter, "c1");
});

test("newnight keeps promise and away carry-over alongside the arc", () => {
  const { P: P_, S } = arcEnv();
  const first = { ...P_.decide(null, "monk", S.monk, SPAWN, BOUNDS).cp, sceneId: "end", away: { activity: "sit", at: 1 }, nextPromise: { id: "p1", day: 1 } };
  const done = finishNight(P_, S, "monk", first, 9);
  const r = P_.decide(done, "monk", S.monk, SPAWN, BOUNDS);
  assert.deepEqual(r.cp.returnFrom, { activity: "sit", at: 1 });
  assert.deepEqual({ ...r.cp.promise }, { id: "p1", day: 1 });
  assert.ok(r.cp.arc.chapter);
});
