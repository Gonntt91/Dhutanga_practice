const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

function setup(role = "monk") {
  const sb = makeSandbox();
  let day = 1, popup = null, activeRole = role;
  const state = { q: {} };
  const places = { gate: { x: 10, y: 10 }, well: { x: 20, y: 20 }, hermitage: { x: 30, y: 30 } };
  let mod;
  const items = [];
  const k = {
    S: state, role: () => activeRole, api: () => ({ day: () => day, toast() {} }),
    near: () => true, save() {}, closeSheet() {}, setOpen() {}, cooldown() {},
    showSheet: (p) => { popup = p; }, giveItem: (i) => items.push(i),
    gotItem: (id, fn) => { if (fn) fn(); },
  };
  sb.Mind = { kit: k, register: (m) => { mod = m; } };
  sb.World = { PLACES: places };
  load(sb, "robe.js");
  return { get mod() { return mod; }, get popup() { return popup; }, state, items, setDay: (d) => { day = d; }, setRole: (r) => { activeRole = r; } };
}

test("ghost cannot receive monk's rag-robe physical errands", () => {
  const g = setup("ghost");
  assert.equal(g.mod.targets().length, 0);
  assert.equal(g.mod.loop(), false);
});

test("robe spans multiple game days and awards a keepsake only once", () => {
  const g = setup();
  for (let d = 1; d <= 5; d++) {
    g.setDay(d);
    assert.equal(g.mod.targets().length, 1);
    assert.equal(g.mod.loop(), true);
    g.popup.choices[0].fn();
    assert.equal(g.state.q.robe.step, d);
    assert.equal(g.state.q.robe.readyDay, d + 1);
    if (d < 5) assert.equal(g.items.length, 0);
  }
  assert.equal(g.items.length, 1);
  assert.equal(g.items[0], "y_mau_dat");
  assert.equal(g.mod.targets().length, 0);
});

test("cannot complete several robe stages on the same game day", () => {
  const g = setup();
  assert.equal(g.mod.loop(), true);
  g.popup.choices[0].fn();
  assert.equal(g.mod.loop(), false);
  assert.match(g.mod.targets()[0].body, /Sang ngày mới/);
});
