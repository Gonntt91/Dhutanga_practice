const { test } = require('node:test');
const assert = require('node:assert/strict');
const server = require('../server');

test('3D game protocol', async (t) => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const abort = new AbortController();
  t.after(async () => {
    abort.abort();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  });
  const events = [];
  const response = await fetch(`${base}/events?pid=test-monk`, { signal: abort.signal });
  const readEvents = (async () => {
    let buffer = '';
    const decoder = new TextDecoder();
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true });
      let end;
      while ((end = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, end); buffer = buffer.slice(end + 2);
        const event = block.match(/^event: (.+)$/m)?.[1];
        const data = block.match(/^data: (.+)$/m)?.[1];
        if (event && data) events.push({ event, data: JSON.parse(data) });
      }
    }
  })();
  readEvents.catch(() => {});
  async function waitEvent(event, predicate = () => true, start = 0) {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const match = events.slice(start).find(e => e.event === event && predicate(e.data));
      if (match) return match.data;
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    assert.fail(`Missing SSE event: ${event}`);
  }
  const post = (route, body) => fetch(`${base}${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid: 'test-monk', ...body }) });

  await t.test('joins without activity history', async () => {
    const init = await waitEvent('init');
    assert.equal(init.pid, 'test-monk');
    assert.equal(Object.hasOwn(init, 'traces'), false);
    assert.equal(init.peers.length, 1);
  });
  await t.test('all four monk poses reach other SSE subscribers', async () => {
    for (const pose of ['sit', 'walk', 'sleep', 'eat']) {
      const start = events.length;
      const result = await post('/api/presence', { role: 'monk', scene: 'm1', pose, x: 0.4, y: 0.7 });
      assert.equal(result.status, 200);
      const peers = await waitEvent('peers', list => list.some(p => p.pose === pose), start);
      assert.deepEqual(peers.map(p => [p.role, p.pose, p.x, p.y]), [['monk', pose, 0.4, 0.7]]);
    }
  });
  await t.test('invalid and non-monk poses are filtered', async () => {
    for (const body of [{ role: 'monk', pose: 'fly' }, { role: 'ghost', pose: 'eat' }]) {
      const start = events.length;
      assert.equal((await post('/api/presence', body)).status, 200);
      const peers = await waitEvent('peers', list => list[0]?.role === body.role, start);
      assert.equal(peers[0].pose, null);
    }
  });
  await t.test('story effects are live, validated by role and rate limited', async () => {
    assert.equal((await post('/api/effect', { kind: 'chant' })).status, 400);
    await post('/api/presence', { role: 'monk', pose: 'sit' });
    const start = events.length;
    assert.equal((await post('/api/effect', { kind: 'chant' })).status, 200);
    const effect = await waitEvent('effect', e => e.kind === 'chant', start);
    assert.deepEqual(effect, { kind: 'chant', from: 'test-monk' });
    assert.equal((await post('/api/effect', { kind: 'offering' })).status, 429);
    assert.equal((await post('/api/effect', { kind: 'incense' })).status, 400);
  });
  await t.test('removed activity endpoint has no handler', async () => {
    assert.equal((await post('/api/trace', { kind: 'offering' })).status, 405);
  });
  await t.test('all 3D modules are served locally', async () => {
    for (const file of ['app.js', 'world.js', 'character.js', 'vendor/three.module.min.js', 'vendor/three.core.min.js', 'vendor/OrbitControls.js', 'vendor/BufferGeometryUtils.js']) {
      const result = await fetch(`${base}/${file}`);
      assert.equal(result.status, 200, file);
      assert.match(result.headers.get('content-type'), /javascript/);
      assert.ok((await result.text()).length > 100);
    }
  });
});
