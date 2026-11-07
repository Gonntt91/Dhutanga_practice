const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const W = () => load(makeSandbox(), "world.js").World;

test("walking pace is calm near the destination", () => {
  const w = W();
  assert.ok(w.walkSpeed("monk", 60, 0.6) <= 62);
  assert.ok(w.walkSpeed("monk", 60, 0.6) >= 50);
});

test("long trips speed up so travel stays short", () => {
  const w = W();
  const near = w.walkSpeed("monk", 60, 0.6), far = w.walkSpeed("monk", 900, 0.6);
  assert.ok(far >= near * 2, `far ${far} near ${near}`);
  assert.ok(far <= 150);
  assert.ok(w.walkSpeed("monk", 300, 0.6) > near && w.walkSpeed("monk", 300, 0.6) < far);
});

test("ghosts drift slower than the living", () => {
  const w = W();
  assert.ok(w.walkSpeed("ghost", 60, 0.6) < w.walkSpeed("villager", 60, 0.6));
});

test("an agitated mind hurries, a clear mind slows a little", () => {
  const w = W();
  const calm = w.walkSpeed("monk", 60, 0.6);
  assert.ok(w.walkSpeed("monk", 60, 0.05) > calm);
  assert.ok(w.walkSpeed("monk", 60, 0.9) < calm);
  assert.equal(w.walkSpeed("monk", 60, null), calm);
});

test("tapping again quickly hurries the walk, up to a cap", () => {
  const w = W();
  let lv = w.hurryNext(0, 9999, false);
  assert.equal(lv, 0);
  lv = w.hurryNext(lv, 250, true); assert.equal(lv, 1); // double tap
  lv = w.hurryNext(lv, 300, true); assert.equal(lv, 2);
  for (let i = 0; i < 5; i++) lv = w.hurryNext(lv, 200, true);
  assert.equal(lv, w.HURRY_MAX);
});

test("a slow tap keeps the hurry while walking, resets once stopped", () => {
  const w = W();
  assert.equal(w.hurryNext(2, 2000, true), 2);
  assert.equal(w.hurryNext(2, 2000, false), 0);
});

test("hurry multiplies the pace, a double tap clearly faster", () => {
  const w = W();
  const calm = w.walkSpeed("monk", 300, 0.6);
  const one = w.walkSpeed("monk", 300, 0.6, 1), max = w.walkSpeed("monk", 300, 0.6, w.HURRY_MAX);
  assert.ok(one >= calm * 1.5, `one ${one} calm ${calm}`);
  assert.ok(max > one && max <= calm * 2.6);
});

test("walking somewhere brings the camera back to follow the player", () => {
  const w = W();
  w.lookAt(500, 200);
  assert.equal(w.isLooking(), true);
  w.walkTo(200, 900);
  assert.equal(w.isLooking(), false);
  w.lookAt(500, 200);
  w.walkTo(210, 900, true); // keyboard steps too
  assert.equal(w.isLooking(), false);
});
