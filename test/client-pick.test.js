const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const W = () => load(makeSandbox(), "world.js").World;

// one candidate in a group: hit centre (cx, cy), radius r (world units), and the info it returns
const cand = (cx, cy, r, info) => ({ cx, cy, r, info });
const groups = (g = {}) => ({ players: [], actors: [], places: [], objects: [], ...g });

test("nothing under the tap gives null (bare ground walks as before)", () => {
  const w = W();
  assert.equal(w.pickAt(100, 100, 1, groups({ objects: [cand(300, 300, 16, { kind: "object" })] })), null);
});

test("a player beats an NPC, an NPC beats a place, a place beats scenery", () => {
  const w = W();
  const all = groups({
    players: [cand(100, 100, 18, { kind: "player", id: "p" })],
    actors: [cand(100, 100, 18, { kind: "actor", id: "a" })],
    places: [cand(100, 100, 20, { kind: "place", id: "gate" })],
    objects: [cand(100, 100, 16, { kind: "object", id: "tree:1" })],
  });
  assert.equal(w.pickAt(100, 100, 1, all).kind, "player");
  assert.equal(w.pickAt(100, 100, 1, groups({ ...all, players: [] })).kind, "actor");
  assert.equal(w.pickAt(100, 100, 1, groups({ places: all.places, objects: all.objects })).kind, "place");
  assert.equal(w.pickAt(100, 100, 1, groups({ objects: all.objects })).kind, "object");
});

test("a higher-priority kind wins even when a lower one is closer", () => {
  const w = W();
  const g = groups({
    actors: [cand(100, 100, 18, { kind: "actor", id: "dog" })],
    objects: [cand(100, 100, 16, { kind: "object", id: "tree:0" })],
  });
  const far = groups({
    actors: [cand(110, 100, 18, { kind: "actor", id: "dog" })],
    objects: [cand(100, 100, 16, { kind: "object", id: "tree:0" })],
  });
  assert.equal(w.pickAt(100, 100, 1, g).kind, "actor");
  assert.equal(w.pickAt(100, 100, 1, far).kind, "actor");
});

test("within one kind the nearest hit wins", () => {
  const w = W();
  const g = groups({ objects: [cand(100, 100, 16, { id: "a" }), cand(108, 100, 16, { id: "b" })] });
  assert.equal(w.pickAt(106, 100, 1, g).id, "b");
  assert.equal(w.pickAt(98, 100, 1, g).id, "a");
});

test("hit area is at least 28 screen px, so it grows when zoomed out", () => {
  const w = W();
  const g = groups({ objects: [cand(100, 100, 4, { id: "tree" })] });
  // scale 1: 28 world units; a tap 20 units away hits
  assert.equal(w.pickAt(120, 100, 1, g).id, "tree");
  // a tap 40 units away misses at scale 1 (floor 28) ...
  assert.equal(w.pickAt(140, 100, 1, g), null);
  // ... but hits at scale 0.5 (floor 56 world units)
  assert.equal(w.pickAt(140, 100, 0.5, g).id, "tree");
});

test("the candidate radius is used when it is larger than the screen floor", () => {
  const w = W();
  const g = groups({ places: [cand(100, 100, 60, { id: "big" })] });
  assert.equal(w.pickAt(150, 100, 2, g).id, "big");
});

test("returned info is a copy, not the candidate itself", () => {
  const w = W();
  const info = { kind: "place", id: "gate" };
  const got = w.pickAt(100, 100, 1, groups({ places: [cand(100, 100, 20, info)] }));
  got.id = "changed";
  assert.equal(info.id, "gate");
});

test("World.pick finds a named place on the real map", () => {
  const w = W();
  const hit = w.pick(w.PLACES.gate.x, w.PLACES.gate.y);
  assert.equal(hit.kind, "place");
  assert.equal(hit.id, "gate");
  assert.equal(hit.name, w.PLACES.gate.name);
});
