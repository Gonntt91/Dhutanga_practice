const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

const IDS = ["san", "hoi_han", "tham", "bon_xen", "khong_san", "khong_tham", "niem", "hy", "bi", "tuy_hy"];
const A = () => load(makeSandbox(), "cetasika-art.js").CetasikaArt;

test("every game card has an svg icon", () => {
  const a = A();
  for (const id of IDS) {
    const s = a.svg(id, 56);
    assert.match(s, /^<svg[\s\S]*<\/svg>$/, id);
    assert.ok(s.length > 400, id + " is illustrated");
  }
});

test("icons are distinct, unknown ids fall back, size is respected", () => {
  const a = A();
  const all = IDS.map((id) => a.svg(id, 56));
  assert.equal(new Set(all).size, IDS.length);
  const fb = a.svg("nope", 56);
  assert.match(fb, /^<svg/);
  assert.ok(!all.includes(fb));
  assert.match(a.svg("san", 110), /width="110"/);
  assert.match(a.svg("san", 110), /height="110"/);
});

test("gradient ids are namespaced per icon", () => {
  const a = A();
  const ids = (s) => [...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  const x = new Set(ids(a.svg("san", 56)));
  assert.equal(ids(a.svg("hy", 56)).some((i) => x.has(i)), false);
});
