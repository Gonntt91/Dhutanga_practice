const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const R = () => load(makeSandbox(), "milestones.js").Milestones.rules;
const GOOD = { good: true }, BAD = { good: false };

test("good cards keep growing and open faces at n=2..5", () => {
  const r = R();
  assert.deepEqual({ ...r.cardStep(GOOD, 0) }, { n: 1, show: true, understood: false, opened: 0 });
  assert.equal(r.cardStep(GOOD, 1).opened, 1);
  assert.equal(r.cardStep(GOOD, 4).opened, 4);
  const six = r.cardStep(GOOD, 5);
  assert.equal(six.n, 6);
  assert.equal(six.opened, 0);
  assert.equal(r.cardStep(GOOD, 20).n, 21);
  assert.equal(r.cardStep(GOOD, 20).show, true);
  assert.equal(r.cardStep(GOOD, 20).understood, false);
});

test("bad cards: front, then three faces, then understood at 3", () => {
  const r = R();
  assert.deepEqual({ ...r.cardStep(BAD, 0) }, { n: 1, show: true, understood: false, opened: 0 });
  const two = r.cardStep(BAD, 1);
  assert.equal(two.n, 2); assert.equal(two.understood, false); assert.equal(two.opened, 1);
  const three = r.cardStep(BAD, 2);
  assert.equal(three.n, 3); assert.equal(three.understood, true); assert.equal(three.show, true); assert.equal(three.opened, 2);
});

test("bad cards after understood: capped, no popup", () => {
  const r = R();
  const s = r.cardStep(BAD, 3);
  assert.equal(s.n, 3); assert.equal(s.show, false); assert.equal(s.understood, true);
});

test("old saves with n=5 on a bad card count as understood", () => {
  const r = R();
  const s = r.cardStep(BAD, 5);
  assert.equal(s.n, 3); assert.equal(s.show, false); assert.equal(s.understood, true);
  assert.equal(r.effN(BAD, 5), 3);
  assert.equal(r.effN(GOOD, 5), 5);
  assert.equal(r.isUnderstood(BAD, 7), true);
  assert.equal(r.isUnderstood(BAD, 2), false);
  assert.equal(r.isUnderstood(GOOD, 9), false);
});

test("face unlock level: good one per visit, bad three at 2 and last at 3", () => {
  const r = R();
  assert.deepEqual([0, 1, 2, 3].map((i) => r.faceUnlockN(GOOD, i)), [2, 3, 4, 5]);
  assert.deepEqual([0, 1, 2, 3].map((i) => r.faceUnlockN(BAD, i)), [2, 2, 2, 3]);
});
