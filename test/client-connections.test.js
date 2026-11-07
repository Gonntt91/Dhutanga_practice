const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load } = require("./client-harness");

// values built inside the vm sandbox have another Array prototype; copy them out before deep comparison
const plain = (v) => JSON.parse(JSON.stringify(v));
const newSocial = () => { const sb = makeSandbox(); load(sb, "social.js"); return { S: sb.Social, sb }; };

test("levelLabel gives the three level names and '' for no level", () => {
  const { S } = newSocial();
  assert.equal(S.levelLabel("quen"), "Quen");
  assert.equal(S.levelLabel("luu"), "Đã lưu");
  assert.equal(S.levelLabel("moi"), "Muốn kết nối với bạn");
  assert.equal(S.levelLabel(null), "");
  assert.equal(S.levelLabel("met"), "");
});

test("statusText: online, last seen with the age band, or '' for null", () => {
  const { S } = newSocial();
  const now = Date.parse("2026-06-10T12:00:00Z");
  assert.equal(S.statusText(null, now), "");
  assert.equal(S.statusText({ online: true, lastSeenAt: null }, now), "đang chơi");
  assert.equal(S.statusText({ online: false, lastSeenAt: new Date(now - 5 * 60000).toISOString() }, now), "chơi lần cuối 5 phút trước");
  assert.equal(S.statusText({ online: false, lastSeenAt: new Date(now - 3 * 3600000).toISOString() }, now), "chơi lần cuối 3 giờ trước");
  assert.equal(S.statusText({ online: false, lastSeenAt: null }, now), "");
});

test("mergePeople: quen (online first), then moi, luu, and only-met; one row per handle", () => {
  const { S } = newSocial();
  const now = Date.parse("2026-06-10T12:00:00Z");
  const conns = [
    { handle: "hLuu000001", name: "Luu", role: "monk", hidden: false, level: "luu", status: null },
    { handle: "hQuenOff01", name: "QuenOff", role: "villager", hidden: false, level: "quen", status: { online: false, lastSeenAt: new Date(now - 60000).toISOString() } },
    { handle: "hMoi0000001", name: "Moi", role: "ghost", hidden: false, level: "moi", status: null },
    { handle: "hQuenOn0001", name: "QuenOn", role: "monk", hidden: true, level: "quen", status: null },
    { handle: "hQuenOn0002", name: "QuenOn2", role: "monk", hidden: false, level: "quen", status: { online: true, lastSeenAt: now } },
    { handle: null, name: "NoHandle", level: "quen", status: null },
  ];
  const encs = [
    { handle: "hMet0000001", name: "Met", role: "villager", lastAt: new Date(now).toISOString(), count: 2 },
    { handle: "hLuu000001", name: "Luu dup", role: "monk", lastAt: new Date(now).toISOString(), count: 1 }, // already a connection
    { handle: null, name: "Ghost", role: "monk" },
  ];
  const rows = plain(S.mergePeople(conns, encs));
  assert.deepEqual(rows.map((r) => r.handle), ["hQuenOn0002", "hQuenOff01", "hQuenOn0001", "hMoi0000001", "hLuu000001", "hMet0000001"]);
  assert.deepEqual(rows.map((r) => r.group), ["quen", "quen", "quen", "moi", "luu", "met"]);
  assert.equal(rows[0].level, "quen");
  assert.equal(rows[0].status.online, true);
  assert.equal(rows[2].hidden, true); // hidden status: no online mark, so it sits with the offline quen rows
  assert.equal(rows[2].status, null);
  assert.equal(rows[5].level, null);
  assert.equal(rows[5].count, 2);
  assert.equal(rows[5].lastAt, new Date(now).toISOString());
  assert.equal(rows.filter((r) => r.handle === "hLuu000001").length, 1);
  assert.equal(rows.find((r) => r.handle === "hLuu000001").name, "Luu");
});

test("mergePeople: empty and missing inputs give an empty list", () => {
  const { S } = newSocial();
  assert.deepEqual(plain(S.mergePeople(null, undefined)), []);
  assert.deepEqual(plain(S.mergePeople([], [])), []);
});

test("groupTitle gives the four headings", () => {
  const { S } = newSocial();
  assert.equal(S.groupTitle("quen"), "Quen");
  assert.equal(S.groupTitle("moi"), "Muốn kết nối với bạn");
  assert.equal(S.groupTitle("luu"), "Đã lưu");
  assert.equal(S.groupTitle("met"), "Từng gặp");
});

test("connectErrorText maps the two known refusals and falls back to the gentle line", () => {
  const { S } = newSocial();
  assert.equal(S.connectErrorText(new Error("not met yet")), "Cần gặp nhau ngoài làng một lúc đã.");
  assert.equal(S.connectErrorText(new Error("too many connections")), "Danh sách đã đầy.");
  assert.equal(S.connectErrorText(new Error("server error")), "Chưa làm được, thử lại nhé.");
  assert.equal(S.connectErrorText(undefined), "Chưa làm được, thử lại nhé.");
});

test("connect, disconnect and markSeen call the API with the character id and the handle", async () => {
  const { S, sb } = newSocial();
  const seen = [];
  sb.__route = async (call) => {
    seen.push(call);
    if (call.url === "/api/connect") return { status: 200, body: { ok: true, level: "luu" } };
    if (call.url === "/api/disconnect") return { status: 200, body: { ok: true, level: null } };
    return { status: 200, body: { ok: true } };
  };
  assert.deepEqual(plain(await S.connect("char_abcdefgh", "h1aaaaaa")), { ok: true, level: "luu" });
  assert.deepEqual(plain(await S.disconnect("char_abcdefgh", "h1aaaaaa")), { ok: true, level: null });
  await S.markSeen("char_abcdefgh");
  assert.deepEqual(seen.map((c) => [c.method, c.url]), [
    ["POST", "/api/connect"], ["POST", "/api/disconnect"], ["POST", "/api/connections/char_abcdefgh/seen"],
  ]);
  assert.deepEqual(plain(seen[0].body), { characterId: "char_abcdefgh", handle: "h1aaaaaa" });
  assert.deepEqual(plain(seen[1].body), { characterId: "char_abcdefgh", handle: "h1aaaaaa" });
  assert.deepEqual(plain(seen[2].body), {});
});

test("connect failure rejects with the server's message on the error", async () => {
  const { S, sb } = newSocial();
  sb.__route = async () => ({ status: 400, body: { error: "not met yet" } });
  await assert.rejects(S.connect("char_abcdefgh", "h1aaaaaa"), (e) => {
    assert.equal(e.message, "not met yet");
    assert.equal(e.status, 400);
    assert.equal(S.connectErrorText(e), "Cần gặp nhau ngoài làng một lúc đã.");
    return true;
  });
});

test("connections is cached for a few seconds and dropped by connect or markSeen", async () => {
  const { S, sb } = newSocial();
  let n = 0;
  sb.__route = async () => { n++; return { status: 200, body: { connections: [{ handle: "h1aaaaaa", level: "quen" }], newCount: 1 } }; };
  const a = plain(await S.connections("char_abcdefgh"));
  assert.deepEqual(a, { connections: [{ handle: "h1aaaaaa", level: "quen" }], newCount: 1 });
  await S.connections("char_abcdefgh");
  assert.equal(n, 1);
  await S.connect("char_abcdefgh", "h1aaaaaa");
  await S.connections("char_abcdefgh");
  assert.equal(n, 3); // connect itself, then a fresh list
  await S.markSeen("char_abcdefgh");
  await S.connections("char_abcdefgh");
  assert.equal(n, 5);
});

test("connections does not cache a failed load", async () => {
  const { S, sb } = newSocial();
  let n = 0, fail = true;
  sb.__route = async () => { n++; return fail ? { status: 500, body: { error: "server error" } } : { status: 200, body: { connections: [], newCount: 0 } }; };
  await assert.rejects(S.connections("char_abcdefgh"));
  fail = false;
  assert.deepEqual(plain(await S.connections("char_abcdefgh")), { connections: [], newCount: 0 });
  assert.equal(n, 2);
});
