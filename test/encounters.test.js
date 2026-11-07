const test = require("node:test");
const assert = require("node:assert");
const { createTracker } = require("../encounters");

// Peer helper: world units, same scene unless told otherwise.
const peer = (over) => ({ key: "pa", userId: "ua", charId: "ca", scene: "s1", x: 100, y: 100, ...over });

// Runs the tracker once per second from `from` to `to` (inclusive) with the given peers.
// Returns [{t, pairs}] for every tick that fired something.
function run(tracker, peers, from, to) {
  const out = [];
  for (let t = from; t <= to; t += 1000) {
    const list = typeof peers === "function" ? peers(t) : peers;
    const pairs = tracker.update(list, t);
    if (pairs.length) out.push({ t, pairs });
  }
  return out;
}

test("fires once after 20 seconds together", () => {
  const tr = createTracker();
  const peers = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  const fires = run(tr, peers, 0, 60000);
  assert.deepStrictEqual(fires, [{ t: 20000, pairs: [["ca", "cb"]] }]);
});

test("does not fire before the threshold", () => {
  const tr = createTracker();
  const peers = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  assert.deepStrictEqual(run(tr, peers, 0, 19000), []);
});

test("range: 150 counts, 151 does not", () => {
  const far = [peer(), peer({ key: "pb", userId: "ub", charId: "cb", x: 251 })];
  assert.deepStrictEqual(run(createTracker(), far, 0, 40000), []);
  const near = [peer(), peer({ key: "pb", userId: "ub", charId: "cb", x: 250 })];
  assert.strictEqual(run(createTracker(), near, 0, 40000).length, 1);
});

test("scene mismatch never counts", () => {
  const tr = createTracker();
  const peers = [peer(), peer({ key: "pb", userId: "ub", charId: "cb", scene: "s2" })];
  assert.deepStrictEqual(run(tr, peers, 0, 40000), []);
});

test("same account (userId) never counts, even with different characters", () => {
  const tr = createTracker();
  const peers = [peer(), peer({ key: "pb", userId: "ua", charId: "cb" })];
  assert.deepStrictEqual(run(tr, peers, 0, 40000), []);
});

test("same character never counts with itself", () => {
  const tr = createTracker();
  const peers = [peer(), peer({ key: "pb", userId: "ub", charId: "ca" })];
  assert.deepStrictEqual(run(tr, peers, 0, 40000), []);
});

test("guests (no userId or no charId) never count", () => {
  const guest = [peer(), peer({ key: "pb", userId: null, charId: null })];
  assert.deepStrictEqual(run(createTracker(), guest, 0, 40000), []);
  const noChar = [peer(), peer({ key: "pb", userId: "ub", charId: null })];
  assert.deepStrictEqual(run(createTracker(), noChar, 0, 40000), []);
});

test("a gap longer than maxGapMs restarts the count", () => {
  const tr = createTracker();
  const both = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  // together 0..15s (15s counted), silence until 19s (4s gap > 3s), then together again
  const first = run(tr, both, 0, 15000);
  assert.deepStrictEqual(first, []);
  const second = run(tr, both, 19000, 33000);
  assert.deepStrictEqual(second, [], "14s after the gap: not yet");
  const third = run(tr, both, 34000, 40000);
  assert.deepStrictEqual(third, [{ t: 39000, pairs: [["ca", "cb"]] }], "20s after the gap: fires");
});

test("a short gap (within maxGapMs) keeps the count", () => {
  const tr = createTracker();
  const both = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  run(tr, both, 0, 10000);
  // 10s counted, then a 2s gap (within maxGapMs): the count continues, so it fires at 20s counted (t=20000)
  const later = run(tr, both, 12000, 30000);
  assert.deepStrictEqual(later, [{ t: 20000, pairs: [["ca", "cb"]] }]);
});

test("separating resets the count; coming back starts over", () => {
  const tr = createTracker();
  const together = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  const apart = [peer(), peer({ key: "pb", userId: "ub", charId: "cb", x: 400 })];
  run(tr, together, 0, 10000); // 10s counted
  assert.deepStrictEqual(run(tr, apart, 11000, 11000), []); // separated
  const back = run(tr, together, 12000, 33000);
  assert.deepStrictEqual(back, [{ t: 32000, pairs: [["ca", "cb"]] }], "needs a fresh 20s after returning");
});

test("fires once per stretch together, not on every tick", () => {
  const tr = createTracker();
  const both = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  const fires = run(tr, both, 0, 120000);
  assert.strictEqual(fires.length, 1);
});

test("forget(peer) drops its pairs; re-observing starts a new count", () => {
  const tr = createTracker();
  const both = [peer(), peer({ key: "pb", userId: "ub", charId: "cb" })];
  run(tr, both, 0, 15000); // 15s counted
  tr.forget("pa");
  assert.deepStrictEqual(run(tr, both, 16000, 35000), [], "old 15s was dropped");
  assert.strictEqual(run(tr, both, 36000, 36000).length, 1, "fresh 20s after re-observing");
});

test("returns charIds regardless of key order, and each separate pair fires on its own", () => {
  const tr = createTracker();
  const three = (t) => [
    peer({ key: "zz", charId: "c3", userId: "u3", x: 100 }),
    peer({ key: "aa", charId: "c1", userId: "u1", x: 105 }),
    peer({ key: "mm", charId: "c2", userId: "u2", x: 110 }),
  ];
  const fires = run(tr, three, 0, 20000);
  // every pair is within range, so all three pairs fire on the same tick
  assert.strictEqual(fires.length, 1);
  const got = fires[0].pairs.map((p) => p.slice().sort().join("+")).sort();
  assert.deepStrictEqual(got, ["c1+c2", "c1+c3", "c2+c3"]);
});

test("peers without coordinates or key are ignored", () => {
  const tr = createTracker();
  const bad = [peer(), { key: "pb", userId: "ub", charId: "cb", scene: "s1", x: NaN, y: 100 }, null];
  assert.deepStrictEqual(run(tr, bad, 0, 40000), []);
});
