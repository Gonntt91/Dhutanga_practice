const test = require("node:test");
const assert = require("node:assert/strict");
const { makeSandbox, load, settle } = require("./client-harness");

const CHAR = { id: "c1", name: "A", role: "monk", data: { progress: { v: 1, runId: "r1", role: "monk", sceneId: "a1", meter: 6 }, mind: { cards: {} } } };

async function signedIn(route) {
  const sb = makeSandbox();
  sb.__route = async (c) => {
    if (c.url === "/api/me") return { status: 200, body: { user: { name: "u" }, account: {} } };
    if (c.url === "/api/characters/c1" && c.method === "GET") return { status: 200, body: { character: CHAR } };
    return route ? route(c) : { status: 200, body: {} };
  };
  load(sb, "save.js");
  await sb.Save.refresh();
  await sb.Save.openCharacter("c1");
  sb.calls.length = 0;
  return sb;
}
const puts = (sb) => sb.calls.filter((c) => c.method === "PUT");

test("failed PUT keeps dirty and retries with backoff", async () => {
  let fail = true;
  const sb = await signedIn((c) => (c.method === "PUT" && fail ? { status: 500, body: {} } : { status: 200, body: {} }));
  sb.Save.set("dhutanga.mind", JSON.stringify({ cards: { a: 1 } }));
  await sb.advance(2000);
  assert.equal(puts(sb).length, 1);
  assert.equal(sb.Save.status(), "offline");
  fail = false;
  await sb.advance(5000);
  assert.equal(puts(sb).length, 2);
  assert.equal(sb.Save.status(), "saved");
  await sb.advance(120000);
  assert.equal(puts(sb).length, 2);
});

test("retry on the online event", async () => {
  let fail = true;
  const sb = await signedIn((c) => (c.method === "PUT" && fail ? { status: 0 || 500, body: {} } : { status: 200, body: {} }));
  sb.Save.set("dhutanga.history", "[]");
  await sb.advance(2000);
  fail = false;
  sb.fire("online");
  await settle();
  assert.equal(puts(sb).length, 2);
  assert.equal(sb.Save.status(), "saved");
});

test("flush sends when dirty even with no pending timer", async () => {
  let fail = true;
  const sb = await signedIn((c) => (c.method === "PUT" && fail ? { status: 500, body: {} } : { status: 200, body: {} }));
  sb.Save.set("dhutanga.history", "[1]");
  await sb.advance(2000); // failed; the debounce timer is gone, a retry is pending
  fail = false;
  await sb.Save.flush(true);
  const last = puts(sb).pop();
  assert.equal(puts(sb).length, 2);
  assert.equal(last.keepalive, true);
  assert.equal(sb.Save.status(), "saved");
});

test("single request in flight; change during flight triggers a second send with newest data", async () => {
  let release;
  let first = true;
  const sb = await signedIn((c) => {
    if (c.method !== "PUT") return { status: 200, body: {} };
    if (first) { first = false; return new Promise((r) => { release = () => r({ status: 200, body: {} }); }); }
    return { status: 200, body: {} };
  });
  sb.Save.set("dhutanga.history", "[1]");
  await sb.advance(2000);
  assert.equal(puts(sb).length, 1);
  sb.Save.set("dhutanga.history", "[1,2]");
  await sb.advance(2000);
  assert.equal(puts(sb).length, 1, "no second request while one is in flight");
  assert.equal(sb.Save.status(), "saving");
  release();
  await settle();
  await sb.advance(10);
  assert.equal(puts(sb).length, 2);
  assert.deepEqual(puts(sb)[1].body.data.history, [1, 2]);
  assert.equal(sb.Save.status(), "saved");
});

test("status transitions saving -> offline -> saved, and onStatus fires", async () => {
  let fail = true;
  const sb = await signedIn((c) => (c.method === "PUT" && fail ? { status: 500, body: {} } : { status: 200, body: {} }));
  const seen = [];
  sb.Save.onStatus((s) => seen.push(s));
  assert.equal(sb.Save.status(), "saved");
  sb.Save.set("dhutanga.history", "[]");
  assert.equal(sb.Save.status(), "saving");
  await sb.advance(2000);
  fail = false;
  await sb.advance(5000);
  assert.deepEqual(seen.filter((s, i) => s !== seen[i - 1]), ["saving", "offline", "saving", "saved"]);
});

test("guests are always saved", async () => {
  const sb = makeSandbox();
  sb.__route = async () => ({ status: 401, body: {} });
  load(sb, "save.js");
  sb.Save.set("dhutanga.progress", "{}");
  assert.equal(sb.Save.status(), "saved");
  assert.equal(sb.store.get("dhutanga.progress"), "{}");
});

test("dhutanga.progress round-trips through openCharacter and PUT", async () => {
  const sb = await signedIn();
  assert.equal(JSON.parse(sb.Save.get("dhutanga.progress")).sceneId, "a1");
  sb.Save.set("dhutanga.progress", JSON.stringify({ v: 1, sceneId: "a2" }));
  await sb.advance(2000);
  assert.equal(puts(sb)[0].body.data.progress.sceneId, "a2");
});

test("guest progress transfers on login import", async () => {
  const sb = makeSandbox();
  let posted;
  sb.__route = async (c) => {
    if (c.url === "/api/me") return { status: 200, body: { user: { name: "u" }, account: {} } };
    if (c.url === "/api/characters" && c.method === "POST") { posted = c.body; return { status: 200, body: { character: { id: "n", name: c.body.name, role: c.body.role, data: c.body.data } } }; }
    return { status: 200, body: {} };
  };
  load(sb, "save.js");
  sb.localStorage.setItem("dhutanga.mind", JSON.stringify({ cards: { a: 1 } }));
  sb.localStorage.setItem("dhutanga.progress", JSON.stringify({ v: 1, runId: "g", role: "monk", sceneId: "a1" }));
  assert.equal(sb.Save.guestProgress().progress.sceneId, "a1");
  await sb.Save.refresh();
  await sb.Save.importGuest("Tên");
  assert.equal(posted.data.progress.sceneId, "a1");
  assert.equal(sb.store.has("dhutanga.progress"), false);
});
