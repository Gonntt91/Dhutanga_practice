// Hungry-ghost grandmother (HG27) under the card rules v0.2: Bi when the player chooses to help,
// Không tham only when the player shares their own evening rice, Tùy hỷ only when they stay to watch.
// Cards come after the closing scene, never during it. Same sandbox as client-card-logic.test.js.
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

const PLACES = () => ({
  gao: { x: -500, y: -500 }, bamboo: { x: 100, y: 100 }, village: { x: 200, y: 200 }, well: { x: 300, y: 300 },
  graves: { x: 400, y: 400 }, mit: { x: 500, y: 500 }, hermitage: { x: 600, y: 600 }, gate: { x: 700, y: 700 },
});
const NEUTRAL_STATS = { tin: 40, tan: 40, niem: 33, dinh: 33, tue: 37, tham: 35, san: 31, si: 33 };

const saved = (over = {}) => ({
  cards: {}, carita: null, surveySkipped: false, stats: { ...NEUTRAL_STATS },
  quest: { step: "done", hit: true }, q: {}, items: [], deva: { pity: 0, last: 0, seen: 0 },
  milestones: {}, msCounts: {}, village: { deeds: {} }, ...over,
});

function boot(save, { role = "villager", darkness = 0, pos = { x: 0, y: 0 } } = {}) {
  const sb = makeSandbox();
  const els = {};
  const toasts = [];
  const logs = [];
  let player = { x: pos.x, y: pos.y, moving: false };
  let loopFn = null;
  sb.document = { visibilityState: "visible", addEventListener() {}, getElementById: (id) => (els[id] ||= node()), createElement: () => node(), createElementNS: () => node(), querySelector: () => node(), querySelectorAll: () => [] };
  sb.performance = { now: () => Date.now() };
  sb.setInterval = (fn, ms) => { if (ms === 250) loopFn = fn; return 0; };
  sb.clearInterval = () => {};
  sb.World = {
    PLACES: PLACES(),
    getMap: () => ({ path: [[0, 0], [1000, 0]], caveFound: false }),
    getPlayer: () => player,
    setPlayer(x, y) { player = { ...player, x, y }; },
    setActors() {}, setFx() {}, stop() {}, lookAt() {}, resetLook() {}, setView() {},
  };
  sb.Save = { get: () => (save == null ? null : JSON.stringify(save)), set() {}, log: (m) => logs.push(m) };
  load(sb, "milestones.js");
  sb.Milestones.reveal = () => {};
  load(sb, "mind.js");
  const M = sb.Mind;
  const api = {
    busy: () => false, darkness: () => darkness, mood: () => 0.6, sound: () => false,
    toast: (t) => toasts.push(t), refresh() {}, swingMood() {}, goTo() {}, day: () => 1, setPose() {},
  };
  M.init(api);
  load(sb, "encounters.js");
  M.onRoleStart(role, () => {});

  const $ = (id) => sb.document.getElementById(id);
  $("mind-card").hidden = true;
  $("card-reveal").hidden = true;
  return {
    sb, M, K: M.kit, toasts, logs,
    S: () => M.kit.S,
    setPos(x, y) { player = { ...player, x, y }; },
    tick() { M.kit.cooldown(-1); M.kit.setOpen(false); loopFn(); },
    choiceLabels: () => $("mind-choices").children.map((c) => c.textContent),
    choice(label) {
      const btn = $("mind-choices").children.find((c) => c.textContent === label);
      if (!btn) throw new Error(`no choice "${label}"; have: ${$("mind-choices").children.map((c) => c.textContent).join(" | ")}`);
      btn.listeners.click();
    },
    sheetLabel: () => $("mind-label").textContent,
    sheetOpen: () => !$("mind-card").hidden,
    cardOpen: () => !$("card-reveal").hidden,
    cardOk() { $("card-reveal-ok").onclick(); },
    // close every card popup that is open, in order (bounded so a loop cannot hang the test)
    drainCards() { for (let i = 0; i < 5 && !$("card-reveal").hidden; i++) this.cardOk(); },
    lines: () => $("mind-lines").children.map((p) => p.textContent),
    extraChildren: () => $("mind-extra").children,
  };
}

// The grandmother's position for the meeting, and the rice well beside her.
const PETA_AT = { x: 444, y: 374 };
const GRANNY_AT = { x: 322, y: 308 };

// ---------- petaMeet: Bi only by choice ----------
function petaStory(save) {
  const g = boot(save, { darkness: 0.6, pos: PETA_AT });
  g.tick();
  assert.equal(g.sheetLabel(), "Giữa các ngôi mộ");
  g.choice("Hỏi bà là ai");
  return g;
}

test("petaMeet: choosing to help gives Bi and moves to the rice step", () => {
  const g = petaStory(saved({ q: { peta: { step: "none" } } }));
  assert.deepEqual(g.choiceLabels(), ["Con sẽ tìm cách giúp bà", "Nghe xong rồi đi"]);
  g.choice("Con sẽ tìm cách giúp bà");
  assert.equal(g.S().q.peta.step, "rice");
  assert.equal(g.cardOpen(), true, "the Bi card opens");
  assert.ok(g.S().cards.bi, "Bi is recorded");
  assert.equal(g.toasts.length, 0, "the rice hint waits for the card to close");
  g.drainCards();
  assert.ok(g.toasts.some((t) => t.includes("xin một bát")), "the hint to ask for rice is shown after the card");
});

test("petaMeet: hearing the story and leaving gives no card and keeps the step", () => {
  const g = petaStory(saved({ q: { peta: { step: "none" } } }));
  g.choice("Nghe xong rồi đi");
  assert.equal(g.S().q.peta.step, "none", "step unchanged");
  assert.equal(g.S().cards.bi, undefined, "no Bi card");
  assert.equal(g.cardOpen(), false, "no card popup");
  assert.equal(g.sheetOpen(), false, "sheet closed");
  assert.ok(g.S().q.peta.snooze > Date.now(), "snoozed, so she is still there when the player comes back");
});

// ---------- grannyRice: scoop step, then the share choice ----------
function riceSetup(save = saved({ q: { peta: { step: "rice" } } })) {
  const g = boot(save, { darkness: 0, pos: GRANNY_AT });
  g.tick();
  assert.equal(g.sheetLabel(), "Giếng làng");
  return g;
}

test("grannyRice: scoop step shows three muỗng and only 'Để sau' as a choice", () => {
  const g = riceSetup();
  assert.deepEqual(g.choiceLabels(), ["Để sau"]);
  const scoops = g.extraChildren()[0].children;
  assert.equal(scoops.length, 3);
  assert.ok(scoops.every((b) => b.setAttribute && b.className === "scoop"));
});

test("grannyRice: the share choices only appear after all three scoops", async () => {
  const g = riceSetup();
  const scoops = g.extraChildren()[0].children;
  scoops[0].listeners.click();
  scoops[1].listeners.click();
  await g.sb.advance(1000);
  assert.deepEqual(g.choiceLabels(), ["Để sau"], "two scoops: still scooping");
  scoops[1].listeners.click(); // a repeat tap on a picked muỗng does nothing
  await g.sb.advance(1000);
  assert.deepEqual(g.choiceLabels(), ["Để sau"], "repeat tap does not count");
  scoops[2].listeners.click();
  await g.sb.advance(500);
  assert.deepEqual(g.choiceLabels(), ["Nhận bát cơm của bà", "Nhận, và đặt thêm phần cơm tối của mình vào bát"]);
});

test("grannyRice: taking her rice alone leaves q.shared falsy", async () => {
  const g = riceSetup();
  const scoops = g.extraChildren()[0].children;
  scoops.forEach((b) => b.listeners.click());
  await g.sb.advance(500);
  g.choice("Nhận bát cơm của bà");
  assert.equal(g.S().q.peta.step, "offer");
  assert.ok(!g.S().q.peta.shared, "not shared");
  assert.equal(g.S().items.includes("bat_com"), true, "the bowl is received");
});

test("grannyRice: sharing your own evening rice sets q.shared", async () => {
  const g = riceSetup();
  const scoops = g.extraChildren()[0].children;
  scoops.forEach((b) => b.listeners.click());
  await g.sb.advance(500);
  g.choice("Nhận, và đặt thêm phần cơm tối của mình vào bát");
  assert.equal(g.S().q.peta.step, "offer");
  assert.equal(g.S().q.peta.shared, true);
  assert.equal(g.S().cards.khong_tham, undefined, "no card at the rice step");
});

test("grannyRice: 'Để sau' while scooping keeps the step and gives nothing", async () => {
  const g = riceSetup();
  g.choice("Để sau");
  assert.equal(g.S().q.peta.step, "rice");
  assert.equal(g.sheetOpen(), false);
  assert.equal(g.S().items.includes("bat_com"), false, "no bowl yet");
  assert.ok(g.S().q.peta.snooze > Date.now());
});

// ---------- offerRice: the closing scene first, then cards in order ----------
function offerSetup(shared) {
  const g = boot(saved({ q: { peta: { step: "offer", shared } }, items: ["bat_com"] }), { darkness: 0 });
  g.setPos(g.K.MONK_SPOT().x, g.K.MONK_SPOT().y);
  g.tick();
  assert.equal(g.sheetLabel(), "Dâng cơm");
  g.choice("Cùng hồi hướng: “Lành thay”");
  return g;
}

// the closing sheet arrives 3800 ms after the chant, and no card may be showing before it
async function closingSheet(g) {
  await g.sb.advance(3900);
  assert.equal(g.sheetLabel(), "Giữa các ngôi mộ");
  assert.equal(g.cardOpen(), false, "no card cuts the scene");
  assert.equal(g.S().cards.khong_tham, undefined, "no Không tham before the player chooses");
  assert.equal(g.S().cards.tuy_hy, undefined, "no Tùy hỷ before the player chooses");
  assert.ok(g.lines().some((l) => l.includes("tan vào ánh trăng")), "the scene text is kept");
  assert.deepEqual(g.choiceLabels(), ["Đứng lại nhìn cho tới khi ánh trăng tan", "Chắp tay rồi đi"]);
}

test("offerRice: shared + stay gives Không tham, then Tùy hỷ, in that order", async () => {
  const g = offerSetup(true);
  await closingSheet(g);
  g.choice("Đứng lại nhìn cho tới khi ánh trăng tan");
  assert.equal(g.S().q.peta.step, "done");
  assert.equal(g.cardOpen(), true, "Không tham opens first");
  assert.ok(g.S().cards.khong_tham, "Không tham recorded");
  assert.equal(g.S().cards.tuy_hy, undefined, "Tùy hỷ waits for the first card to close");
  g.cardOk();
  assert.equal(g.cardOpen(), true, "then Tùy hỷ");
  assert.ok(g.S().cards.tuy_hy, "Tùy hỷ recorded");
  g.cardOk();
  assert.equal(g.cardOpen(), false);
  assert.equal(g.S().q.peta.shared, false, "shared flag cleared after use");
});

test("offerRice: shared + hands folded gives only Không tham", async () => {
  const g = offerSetup(true);
  await closingSheet(g);
  g.choice("Chắp tay rồi đi");
  assert.equal(g.S().q.peta.step, "done");
  assert.ok(g.S().cards.khong_tham, "Không tham recorded");
  g.drainCards();
  assert.equal(g.S().cards.tuy_hy, undefined, "no Tùy hỷ");
  assert.equal(g.S().q.peta.shared, false);
});

test("offerRice: not shared + stay gives only Tùy hỷ", async () => {
  const g = offerSetup(false);
  await closingSheet(g);
  g.choice("Đứng lại nhìn cho tới khi ánh trăng tan");
  assert.equal(g.S().q.peta.step, "done");
  assert.equal(g.S().cards.khong_tham, undefined, "no Không tham when only the bowl was passed on");
  assert.ok(g.cardOpen(), "Tùy hỷ opens");
  g.drainCards();
  assert.ok(g.S().cards.tuy_hy, "Tùy hỷ recorded");
});

test("offerRice: not shared + hands folded gives no card at all", async () => {
  const g = offerSetup(false);
  await closingSheet(g);
  g.choice("Chắp tay rồi đi");
  assert.equal(g.S().q.peta.step, "done");
  assert.equal(g.cardOpen(), false, "no card");
  assert.equal(g.S().cards.khong_tham, undefined);
  assert.equal(g.S().cards.tuy_hy, undefined);
  assert.equal(g.sheetOpen(), false, "sheet closed");
});

test("offerRice: the done log line is written on both branches", async () => {
  const g = offerSetup(false);
  await closingSheet(g);
  g.choice("Chắp tay rồi đi");
  assert.ok(g.logs.includes("Đã giúp bà ngoại bên mộ thấp được an."));
});

test("the whole chain: Bi, then rice with a share, then Không tham and Tùy hỷ, with the scene uncut", async () => {
  const g = boot(saved({ q: { peta: { step: "none" } } }), { darkness: 0.6, pos: PETA_AT });
  g.tick();
  g.choice("Hỏi bà là ai");
  g.choice("Con sẽ tìm cách giúp bà");
  g.drainCards();
  assert.equal(g.S().q.peta.step, "rice");
  g.setPos(GRANNY_AT.x, GRANNY_AT.y);
  g.tick();
  const scoops = g.extraChildren()[0].children;
  scoops.forEach((b) => b.listeners.click());
  await g.sb.advance(500);
  g.choice("Nhận, và đặt thêm phần cơm tối của mình vào bát");
  assert.equal(g.S().q.peta.shared, true);
  g.setPos(g.K.MONK_SPOT().x, g.K.MONK_SPOT().y);
  g.tick();
  g.choice("Cùng hồi hướng: “Lành thay”");
  await closingSheet(g);
  g.choice("Đứng lại nhìn cho tới khi ánh trăng tan");
  g.drainCards();
  assert.equal(g.S().q.peta.step, "done");
  assert.ok(g.S().cards.bi && g.S().cards.khong_tham && g.S().cards.tuy_hy);
});
