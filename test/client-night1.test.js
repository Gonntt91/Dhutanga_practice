// Đêm 1: bé Na hides in the bamboo grove and the player follows the crying by ear (no fail, no timer).
// Same sandbox as client-peta.test.js, with a fake clock so the crying rhythm can be checked.
const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

function node() {
  return {
    hidden: false, textContent: "", className: "", type: "", style: {}, dataset: {}, children: [], listeners: {},
    classList: { add() {}, remove() {}, contains() { return false; } },
    appendChild(c) { this.children.push(c); return c; },
    append(...c) { c.forEach((x) => this.children.push(x)); },
    get firstChild() { return this.children[0]; },
    replaceChildren(...c) { this.children = c; },
    addEventListener(ev, fn) { this.listeners[ev] = fn; },
    setAttribute() {},
  };
}

// Simple layout: the grove is at (1000, 1000), so the child sits at (986, 1030).
const PLACES = () => ({
  gao: { x: 0, y: 0 }, bamboo: { x: 1000, y: 1000 }, village: { x: 200, y: 200 }, well: { x: 300, y: 300 },
  graves: { x: 400, y: 400 }, mit: { x: 500, y: 500 }, hermitage: { x: 600, y: 600 }, gate: { x: 700, y: 700 },
});
const CHILD = { x: 986, y: 1030 };
const NEUTRAL_STATS = { tin: 40, tan: 40, niem: 33, dinh: 33, tue: 37, tham: 35, san: 31, si: 33 };

const saved = (over = {}) => ({
  cards: {}, carita: null, surveySkipped: false, stats: { ...NEUTRAL_STATS },
  quest: { step: "done", hit: true }, q: {}, items: [], deva: { pity: 0, last: 0, seen: 0 },
  milestones: {}, msCounts: {}, village: { deeds: {} }, ...over,
});

const CTX = () => {
  const g = () => ({ addColorStop() {} });
  return {
    arcs: 0,
    createRadialGradient: g, createLinearGradient: g,
    beginPath() {}, arc() { this.arcs++; }, fill() {}, stroke() {}, fillRect() {}, ellipse() {}, moveTo() {}, lineTo() {}, closePath() {},
    fillText() {}, strokeText() {}, save() {}, restore() {}, translate() {}, scale() {}, quadraticCurveTo() {}, fillStyle: "", strokeStyle: "", lineWidth: 1, globalCompositeOperation: "source-over", font: "", textAlign: "",
  };
};

function boot(save, { pos = { x: 0, y: 0 }, darkness = 0.6, sound = true, role = "villager" } = {}) {
  const sb = makeSandbox();
  const els = {};
  const toasts = [];
  const goTo = [];
  const sighs = [];
  let clock = 1_000_000;
  class FakeDate extends Date { static now() { return clock; } }
  sb.Date = FakeDate;
  let player = { x: pos.x, y: pos.y, moving: false };
  let busy = false;
  let loopFn = null;
  sb.document = { visibilityState: "visible", addEventListener() {}, getElementById: (id) => (els[id] ||= node()), createElement: () => node(), createElementNS: () => node(), querySelector: () => node(), querySelectorAll: () => [] };
  sb.performance = { now: () => clock };
  sb.setInterval = (fn, ms) => { if (ms === 250) loopFn = fn; return 0; };
  sb.clearInterval = () => {};
  sb.World = {
    PLACES: PLACES(),
    getMap: () => ({ path: [[0, 0], [1000, 0]], caveFound: false }),
    getPlayer: () => player,
    setPlayer(x, y) { player = { ...player, x, y }; },
    setActors() {}, setFx() {}, stop() {}, lookAt() {}, resetLook() {}, setView() {},
  };
  sb.NightAudio = { sigh: () => sighs.push(clock), bell() {} };
  sb.Save = { get: () => (save == null ? null : JSON.stringify(save)), set() {}, log() {} };
  load(sb, "milestones.js");
  sb.Milestones.reveal = () => {};
  load(sb, "mind.js");
  const M = sb.Mind;
  const modules = [];
  const reg = M.register;
  M.register = (m) => { modules.push(m); reg(m); };
  const api = {
    busy: () => busy, darkness: () => darkness, mood: () => 0.6, sound: () => sound,
    toast: (t) => toasts.push(t), refresh() {}, swingMood() {}, goTo: (x, y) => goTo.push([x, y]), day: () => 1, setPose() {},
  };
  M.init(api);
  load(sb, "encounters.js");
  M.onRoleStart(role, () => {});
  const enc = modules.find((m) => m.actors && m.fx);

  const $ = (id) => sb.document.getElementById(id);
  $("mind-card").hidden = true;
  $("card-reveal").hidden = true;
  return {
    sb, M, K: M.kit, enc, toasts, goTo, sighs,
    S: () => M.kit.S,
    setPos(x, y) { player = { ...player, x, y }; },
    setBusy(v) { busy = v; },
    // one 250 ms frame of the proximity loop, with the clock moved forward first
    tick(ms = 250) { clock += ms; M.kit.cooldown(-1); M.kit.setOpen(false); loopFn(); },
    run(ms) { for (let t = 0; t < ms; t += 250) this.tick(250); },
    choice(label) {
      const btn = $("mind-choices").children.find((c) => c.textContent === label);
      if (!btn) throw new Error(`no choice "${label}"; have: ${$("mind-choices").children.map((c) => c.textContent).join(" | ")}`);
      btn.listeners.click();
    },
    sheetLabel: () => $("mind-label").textContent,
    sheetOpen: () => !$("mind-card").hidden,
    cryToasts: () => toasts.filter((t) => /Tiếng khóc|Rất gần rồi/.test(t)),
    childActors: () => enc.actors().filter((a) => a.kind === "child"),
    frame(ms = 16) { const ctx = CTX(); enc.fx(ctx, { dayMix: 0, time: 0, camY: 0, viewH: 0 }, ms / 1000); return ctx; },
  };
}

const CHILD_SAVE = () => saved({ q: { tree: { step: "child" } } });

// ---------- A.1: treeMeet → "Đi tìm đứa bé" no longer walks the player to the child ----------
test("treeMeet: 'Đi tìm đứa bé' sets the child step, does not call goTo, and shows the hint", () => {
  const g = boot(saved({ q: { tree: { step: "none" } } }), { pos: { x: 38, y: 14 } });
  g.tick();
  assert.equal(g.sheetLabel(), "Gốc cây gạo");
  g.choice("Đi tìm đứa bé");
  assert.equal(g.S().q.tree.step, "child");
  assert.equal(g.goTo.length, 0, "the player is not led to the child");
  assert.equal(g.sheetOpen(), false, "sheet closed");
  assert.ok(g.toasts.some((t) => t === "Có tiếng khóc nhỏ vọng ra từ bụi tre. Lần theo tiếng khóc nhé."));
});

// ---------- A.2: the errand target is the whole bamboo grove ----------
test("targets: the child step points at the bamboo grove, not the child's exact spot", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  const t = g.M.questList().find((q) => q.title === "Lần theo tiếng khóc");
  assert.ok(t, "errand listed");
  assert.equal(t.name, "Bụi tre");
  assert.deepEqual([t.x, t.y], [1000, 1020], "bamboo position with dy 20");
  assert.notDeepEqual([t.x, t.y], [CHILD.x, CHILD.y], "not the child's position");
});

// ---------- A.3: the child is drawn only when the player is within 90 ----------
test("actors: the child is not drawn far away and is drawn within 90", () => {
  const far = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  assert.equal(far.childActors().length, 0, "far: no child");
  const near = boot(CHILD_SAVE(), { pos: { x: CHILD.x - 60, y: CHILD.y } });
  assert.equal(near.childActors().length, 1, "within 90: child drawn");
  assert.equal(near.childActors()[0].x, CHILD.x);
});

// ---------- A.4: distance hints, toast only when the level changes ----------
test("loop: a far hint is shown once no matter how often the loop runs", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  for (let i = 0; i < 6; i++) g.tick();
  assert.deepEqual(g.cryToasts(), ["Tiếng khóc còn xa…"]);
});

test("loop: moving closer changes the hint once per level, then stays quiet", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  g.tick();
  g.setPos(CHILD.x - 200, CHILD.y); // d = 200: mid
  g.run(1000);
  g.setPos(CHILD.x - 100, CHILD.y); // d = 100: close
  g.run(1000);
  assert.deepEqual(g.cryToasts(), ["Tiếng khóc còn xa…", "Tiếng khóc gần hơn…", "Rất gần rồi…"]);
});

test("loop: NightAudio.sigh follows the rhythm; the interval is d/80 clamped to 0.9..3.2 s", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } }); // far: 3.2 s between cries
  g.tick();
  assert.equal(g.sighs.length, 1, "first cry straight away");
  g.run(3000);
  assert.equal(g.sighs.length, 1, "no cry before 3.2 s");
  g.run(500);
  assert.equal(g.sighs.length, 2, "next cry at 3.2 s");
});

test("loop: no cry while the player is busy", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  g.setBusy(true);
  g.run(2000);
  assert.equal(g.sighs.length, 0);
  assert.equal(g.cryToasts().length, 0);
});

test("fx: a ripple is drawn for a cry and fades after about 1.2 s", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  g.tick(); // starts a cry
  assert.equal(g.frame(16).arcs, 1, "ripple drawn");
  g.frame(1500);
  assert.equal(g.frame(16).arcs, 0, "ripple gone after 1.2 s");
});

// ---------- finding the child and stopping the crying ----------
test("loop: arriving within 40 opens the found scene", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: CHILD.x - 20, y: CHILD.y } });
  g.tick();
  assert.equal(g.sheetLabel(), "Bụi tre");
});

test("loop: the crying stops once the child is no longer at step 'child'", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: 0, y: 0 } });
  g.tick();
  assert.equal(g.frame(16).arcs, 1, "a cry is running");
  g.S().q.tree.step = "done";
  g.tick();
  const before = g.sighs.length;
  g.run(5000);
  assert.equal(g.sighs.length, before, "no more cries");
  assert.equal(g.frame(16).arcs, 0, "no ripple");
  assert.equal(g.cryToasts().length, 1, "no more hints after the step changed");
});

test("an old save at step 'child' still plays: the child can be found by walking close", () => {
  const g = boot(CHILD_SAVE(), { pos: { x: CHILD.x - 10, y: CHILD.y + 10 } });
  g.tick();
  assert.equal(g.sheetLabel(), "Bụi tre");
  g.choice("Ngồi xuống, dỗ dành");
  assert.equal(g.S().q.tree.step, "follow");
});
