const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

function setup() {
  const sb = makeSandbox();
  const box = { cur: { deeds: {}, said: null, save() { this.saved = (this.saved || 0) + 1; } } };
  sb.Mind = { isOpen: () => false, parts: { villageState: () => box.cur } };
  load(sb, "village.js");
  return { V: sb.Village, box };
}

test("record increments count and updates day", () => {
  const { V, box } = setup();
  V.record("granny_herbs", 2);
  assert.deepEqual({ ...box.cur.deeds.granny_herbs }, { day: 2, count: 1 });
  V.record("granny_herbs", 5);
  assert.deepEqual({ ...box.cur.deeds.granny_herbs }, { day: 5, count: 2 });
  assert.ok(box.cur.saved >= 2);
  V.record("not_a_deed", 5);
  assert.equal(box.cur.deeds.not_a_deed, undefined);
});

test("age bands: yesterday, 2-6 days, 7+ days; null on the same night and with no deed", () => {
  const { V } = setup();
  assert.equal(V.lineFor("well", 1, "monk"), null);
  V.record("granny_herbs", 3);
  assert.equal(V.lineFor("well", 3, "monk"), null); // same night
  const a = V.lineFor("well", 4, "monk");
  assert.match(a, /[Hh]ôm qua|hôm qua|Nắm rau hôm qua/);
  const b = V.lineFor("well", 6, "monk");
  assert.match(b, /Hôm trước|Mấy bữa trước/);
  const c = V.lineFor("well", 10, "monk");
  assert.match(c, /Dạo nọ/);
  assert.equal(V.lineFor("graves", 10, "monk"), null); // other place
});

test("deterministic choice, but never the same deed twice in one night", () => {
  const one = setup(), two = setup();
  for (const x of [one, two]) x.V.record("na_home", 1);
  const a = one.V.lineFor("village", 2, "monk");
  const b = two.V.lineFor("village", 2, "monk");
  assert.equal(a, b);
  assert.ok(a);
  assert.equal(one.V.lineFor("village", 2, "monk"), null);
  // next night it can speak again
  assert.ok(one.V.lineFor("village", 3, "monk"));
});

test("variants differ across days/deeds", () => {
  const { V } = setup();
  V.record("tu_herbs", 1);
  const seen = new Set();
  for (let day = 2; day < 40; day++) { const l = V.lineFor("village", day, "monk"); if (l) seen.add(l); }
  assert.ok(seen.size >= 3);
});

test("role-aware: monk is thầy, villager is cháu, ghost hears nothing", () => {
  const { V } = setup();
  V.record("granny_herbs", 1);
  const m = V.next("well", 2, "monk");
  assert.ok(/thầy/.test(m.text) && !/\{you\}/.test(m.text));
  assert.equal(m.npc, "granny");
  const { V: V2 } = setup();
  V2.record("granny_herbs", 1);
  const v = V2.next("well", 2, "villager");
  assert.ok(/cháu/.test(v.text) && !/thầy/.test(v.text));
  const { V: V3 } = setup();
  V3.record("granny_herbs", 1);
  assert.equal(V3.lineFor("well", 5, "ghost"), null);
});

test("at most one line per call; the other deed at the same place follows", () => {
  const { V } = setup();
  V.record("peta_fed", 1);
  V.record("sat_with_monk", 1);
  const a = V.next("graves", 3, "monk"), b = V.next("graves", 3, "monk");
  assert.ok(a && b && a.id !== b.id);
  assert.equal(V.next("graves", 3, "monk"), null);
});

test("every deed has a place, an npc and 2+ lines in each band, no 'Bạn'", () => {
  const { V } = setup();
  for (const [id, d] of Object.entries(V.DEEDS)) {
    assert.ok(d.place && d.npc, id);
    for (const band of ["recent", "mid", "old"]) {
      assert.ok(d.lines[band].length >= 2, id + band);
      for (const l of d.lines[band]) assert.ok(!/Bạn/.test(l), l);
    }
  }
  assert.ok(Object.keys(V.DEEDS).length >= 4 && Object.keys(V.DEEDS).length <= 6);
});

test("works without Mind (fallback state) and survives garbage state", () => {
  const sb = makeSandbox();
  load(sb, "village.js");
  sb.Village.record("na_home", 1);
  assert.ok(sb.Village.lineFor("village", 2, "monk"));
  const { V, box } = setup();
  box.cur.deeds = { granny_herbs: { day: "x", count: null } };
  assert.equal(V.lineFor("well", 4, "monk"), null);
});
