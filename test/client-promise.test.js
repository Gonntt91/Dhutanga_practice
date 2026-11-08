const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const PLACE_KEYS = ["village", "gate", "bamboo", "graves", "gao", "hermitage", "well", "mit", "ao", "hang", "thap"];
const STORY = { monk: { start: "a0", meterStart: 5, scenes: { a0: { place: "x" } } } };
const SPAWN = { x: 100, y: 200 };
const plain = (o) => JSON.parse(JSON.stringify(o));
const setup = () => { const sb = makeSandbox(); load(sb, "progress.js"); load(sb, "reflect.js"); return { R: sb.NightReflect, P: sb.Progress }; };

test("every hook has id, real place, text and a payoff of 2-4 lines", () => {
  const { R } = setup();
  const want = { monk: [4, 5], villager: [3, 4], ghost: [3, 3] };
  const ids = new Set();
  for (const role of ["monk", "villager", "ghost"]) {
    const list = R.HOOKS[role];
    assert.ok(list.length >= want[role][0] && list.length <= want[role][1], role);
    for (const h of list) {
      assert.ok(h.id && !ids.has(h.id), "unique id " + h.id); ids.add(h.id);
      assert.ok(PLACE_KEYS.includes(h.place), h.id + " place");
      assert.ok(typeof h.text === "string" && h.text.length > 0);
      assert.ok(Array.isArray(h.payoff) && h.payoff.length >= 2 && h.payoff.length <= 4, h.id + " payoff");
      for (const l of h.payoff) { assert.ok(l.trim().length > 0); assert.ok(!/Bạn/.test(l), l); }
      assert.ok(!/Bạn/.test(h.text));
    }
  }
});

test("promiseFor is deterministic per runId and its text equals hookFor", () => {
  const { R } = setup();
  for (const role of ["monk", "villager", "ghost"]) {
    const seen = new Set();
    for (let i = 0; i < 60; i++) {
      const id = "run" + i;
      const a = R.promiseFor(role, id), b = R.promiseFor(role, id);
      assert.deepEqual(plain(a), plain(b));
      assert.equal(a.text, R.hookFor(role, id));
      seen.add(a.id);
    }
    assert.ok(seen.size > 1);
  }
  assert.ok(R.promiseFor("nope", "x").id);
});

test("hookById finds a hook across roles, null for unknown", () => {
  const { R } = setup();
  const h = R.HOOKS.villager[0];
  assert.equal(R.hookById(h.id).text, h.text);
  assert.equal(R.hookById("zzz"), null);
  assert.equal(R.hookById(null), null);
});

test("chooseAway records the same hook text and promise id", () => {
  const { R } = setup();
  const cp = { role: "monk", runId: "r9", day: 3 };
  const out = R.chooseAway(cp, "sit", 5);
  const p = R.promiseFor("monk", "r9");
  assert.equal(out.away.hook, p.text);
  assert.deepEqual(plain(out.nextPromise), { id: p.id, day: 3 });
});

test("withPromise stamps nextPromise once per night, same promise the player saw", () => {
  const { R } = setup();
  const cp = { role: "ghost", runId: "r1", day: 2 };
  const a = R.withPromise(cp);
  assert.deepEqual(plain(a.nextPromise), { id: R.promiseFor("ghost", "r1").id, day: 2 });
  assert.deepEqual(plain(R.withPromise(a)), plain(a));
});

test("Progress.decide carries yesterday's promise into the next night as {id, day}", () => {
  const { P } = setup();
  const cp0 = P.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 4 });
  const ended = { ...P.complete(cp0).cp, nextPromise: { id: "p1", day: 4 } };
  const r = P.decide(ended, "monk", STORY.monk, SPAWN);
  assert.equal(r.mode, "newnight");
  assert.deepEqual(plain(r.cp.promise), { id: "p1", day: 4 });
  assert.equal(r.cp.day, 5);
  assert.equal(r.cp.nextPromise, undefined);
});

test("no nextPromise, or one from an older night, is not carried", () => {
  const { P } = setup();
  const cp0 = P.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 4 });
  const ended = P.complete(cp0).cp;
  assert.equal(P.decide(ended, "monk", STORY.monk, SPAWN).cp.promise, undefined);
  const stale = { ...ended, nextPromise: { id: "p1", day: 2 } };
  assert.equal(P.decide(stale, "monk", STORY.monk, SPAWN).cp.promise, undefined);
  // a promise already carried (even kept) is never re-carried
  const kept = { ...ended, promise: { id: "p1", day: 3, kept: true } };
  assert.equal(P.decide(kept, "monk", STORY.monk, SPAWN).cp.promise, undefined);
});

test("resume keeps the promise", () => {
  const { P } = setup();
  const cp = { ...P.create({ role: "monk", story: STORY.monk, spawn: SPAWN, day: 5 }), promise: { id: "p1", day: 4 } };
  const r = P.decide(cp, "monk", STORY.monk, SPAWN);
  assert.equal(r.mode, "resume");
  assert.deepEqual(plain(r.cp.promise), { id: "p1", day: 4 });
});

test("promiseDue: only yesterday's, unkept, known promise", () => {
  const { R } = setup();
  const h = R.HOOKS.monk[0];
  const cp = (promise, day) => ({ role: "monk", day, promise });
  assert.equal(R.promiseDue(cp({ id: h.id, day: 4 }, 5)).id, h.id);
  assert.equal(R.promiseDue(cp({ id: h.id, day: 4, kept: true }, 5)), null);
  assert.equal(R.promiseDue(cp({ id: h.id, day: 3 }, 5)), null);
  assert.equal(R.promiseDue(cp({ id: "unknown", day: 4 }, 5)), null);
  assert.equal(R.promiseDue({ day: 5 }), null);
});

test("keepPromise marks kept and a kept promise is no longer due", () => {
  const { R } = setup();
  const h = R.HOOKS.villager[1];
  const cp = { role: "villager", day: 2, promise: { id: h.id, day: 1 } };
  const k = R.keepPromise(cp);
  assert.equal(k.promise.kept, true);
  assert.equal(R.promiseDue(k), null);
  assert.equal(cp.promise.kept, undefined);
});

test("nudgeLine is one short third-person-free line naming the place", () => {
  const { R } = setup();
  const h = R.HOOKS.monk.find((x) => x.place === "ao");
  const line = R.nudgeLine({ day: 3, promise: { id: h.id, day: 2 } });
  assert.match(line, /^Hôm qua có lời hẹn ở .+\.$/);
  assert.match(line, /ao sen/);
  assert.equal(R.nudgeLine({ day: 3, promise: { id: h.id, day: 2, kept: true } }), null);
  assert.equal(R.nudgeLine({ day: 3 }), null);
});
