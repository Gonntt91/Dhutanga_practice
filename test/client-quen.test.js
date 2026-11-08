const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const W = () => load(makeSandbox(), "world.js").World;

test("quenFor is false until a set is given", () => {
  const w = W();
  assert.equal(w.quenFor("h1aaaaaa"), false);
});

test("setQuen marks only the handles in the set; no handle means no dot", () => {
  const w = W();
  w.setOthers([
    { pid: "p1", x: 0.5, y: 0.5, role: "villager", nick: "Ana", pose: null, mood: 0.5, handle: "h1aaaaaa" },
    { pid: "p2", x: 0.2, y: 0.2, role: "monk", nick: "Bình", pose: null, mood: 0.5, handle: "h2bbbbbb" },
    { pid: "p3", x: 0.3, y: 0.3, role: "ghost", nick: "Khách", pose: null, mood: 0.5, handle: null },
  ]);
  w.setQuen(new Set(["h1aaaaaa", "h3notthere"]));
  assert.equal(w.quenFor("h1aaaaaa"), true);
  assert.equal(w.quenFor("h2bbbbbb"), false);
  assert.equal(w.quenFor(null), false);
  assert.equal(w.quenFor(undefined), false);
  assert.equal(w.quenFor(""), false);
});

test("setQuen replaces the previous set; a non-set clears it", () => {
  const w = W();
  w.setQuen(new Set(["h1aaaaaa"]));
  w.setQuen(new Set(["h2bbbbbb"]));
  assert.equal(w.quenFor("h1aaaaaa"), false);
  assert.equal(w.quenFor("h2bbbbbb"), true);
  w.setQuen(["h2bbbbbb"]);
  assert.equal(w.quenFor("h2bbbbbb"), false);
  w.setQuen(null);
  assert.equal(w.quenFor("h2bbbbbb"), false);
});
