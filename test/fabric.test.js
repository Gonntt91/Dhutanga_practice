const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', 'public', file), 'utf8');
const moduleURL = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const fabricModule = import(moduleURL(read('fabric.js')));

test('cloth must be nearby, unique and sufficient for a robe', async () => {
  const { FABRIC_PIECES, CLOTH_REQUIRED, PICKUP_RADIUS, restoreFabric, fabricCount, nearestFabric, takeFabric, sewRobe } = await fabricModule;
  let stock = restoreFabric();
  assert.equal(sewRobe(stock), null);
  assert.equal(new Set(FABRIC_PIECES.map(p => p.id)).size, FABRIC_PIECES.length);
  const first = FABRIC_PIECES[0];
  assert.equal(nearestFabric(stock, first.x, first.y).id, first.id);
  assert.equal(takeFabric(stock, first.id, first.x + PICKUP_RADIUS + 1, first.y), null);
  assert.equal(takeFabric(stock, 'nonexistent', first.x, first.y), null);
  for (const piece of FABRIC_PIECES.slice(0, CLOTH_REQUIRED)) {
    stock = takeFabric(stock, piece.id, piece.x, piece.y);
    assert.equal(takeFabric(stock, piece.id, piece.x, piece.y), null);
  }
  assert.equal(fabricCount(stock), CLOTH_REQUIRED);
  const finished = sewRobe(stock);
  assert.equal(finished.robes, 1);
  assert.equal(fabricCount(finished), 0);
  assert.equal(sewRobe(finished), null);
  assert.equal(stock.robes, 0, 'crafting does not spend cloth until the result is committed');
  assert.deepEqual(restoreFabric(JSON.parse(JSON.stringify(finished))), finished);
  assert.deepEqual(restoreFabric({ picked: [first.id, first.id, 'bad'], robes: 99 }), { picked: [first.id], robes: 0 });
  for (const malformed of [null, [], 0, { picked: 'bad', robes: -3 }]) assert.deepEqual(restoreFabric(malformed), { picked: [], robes: 0 });
});

// Exercise the real app handlers and clock without a browser or WebGL renderer.
function launchApp(fabric, saved = new Map()) {
  class Element {
    constructor() {
      this.children = []; this.dataset = {}; this.style = {}; this.attributes = {}; this.listeners = {};
      this.hidden = false; this.disabled = false; this.value = ''; this.textContent = ''; this.className = '';
      this.classList = {
        contains: (name) => this.className.split(/\s+/).includes(name),
        add: (name) => this.classList.toggle(name, true),
        remove: (name) => this.classList.toggle(name, false),
        toggle: (name, force) => {
          const classes = new Set(this.className.split(/\s+/).filter(Boolean));
          (force ?? !classes.has(name)) ? classes.add(name) : classes.delete(name);
          this.className = [...classes].join(' ');
        },
      };
    }
    addEventListener(type, fn) { this.listeners[type] = fn; }
    setAttribute(key, value) { this.attributes[key] = value; }
    append(...children) { this.children.push(...children); }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    querySelector(selector) { return this.children.find(child => child.className === selector.slice(1)); }
    focus() { this.focused = true; }
    click() { if (!this.disabled) this.listeners.click?.(); }
  }
  const nodes = new Map();
  for (const match of read('index.html').matchAll(/<\w+\b([^>]*\bid="([^"]+)"[^>]*)>/g)) {
    const node = new Element();
    node.hidden = /\bhidden\b/.test(match[1]); node.disabled = /\bdisabled\b/.test(match[1]);
    nodes.set(match[2], node);
  }
  let now = 10000, interval, target = null, view = null, player = { x: 205, y: 1950, moving: false };
  const worldSource = read('world.js');
  const config = vm.runInNewContext(`${worldSource.slice(worldSource.indexOf('const W ='), worldSource.indexOf('const PATH ='))}; ({ W, H, PLACES, SPAWN });`);
  const posts = [];
  const world = {
    ...config,
    init() {}, getPoseImage: () => 'preview.png',
    getPlayer: () => ({ ...player, nx: player.x / config.W, ny: player.y / config.H }),
    setPlayer(x, y) { player = { x, y, moving: false }; target = null; },
    setView(next) { view = next; },
    walkTo(x, y) { target = { x, y }; player.moving = true; },
    stop() { target = null; player.moving = false; },
    faceCamera() {}, facePoint() {}, setOthers() {}, startWalking() {}, ripple() {},
    rotateCamera() {}, zoomCamera() {}, resetCamera() {},
  };
  let events;
  const context = vm.createContext({
    ...fabric, World: world, console,
    document: { getElementById: id => { assert.ok(nodes.has(id), `Missing element ${id}`); return nodes.get(id); }, createElement: () => new Element() },
    localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) },
    crypto: { randomUUID: () => 'test-player' },
    NightAudio: { start() {}, stop() {} },
    Date: class extends Date { static now() { return now; } },
    setInterval(fn) { interval = fn; }, setTimeout() { return 1; }, clearTimeout() {},
    fetch(url, options) { posts.push({ url, body: JSON.parse(options.body) }); return Promise.resolve({ json: async () => ({ ok: true }) }); },
    EventSource: class { constructor() { events = this; this.handlers = {}; } addEventListener(type, fn) { this.handlers[type] = fn; } },
  });
  context.window = context;
  vm.runInContext(read('story.js'), context);
  vm.runInContext(read('app.js').replace(/^import .*;\n/gm, ''), context);
  events.handlers.init({ data: JSON.stringify({ peers: [{ pid: 'test-player', role: null }] }) });
  return {
    get view() { return view; }, posts, saved,
    node: id => nodes.get(id), click: id => nodes.get(id).click(),
    role: role => nodes.get('role-list').children.find(card => card.dataset.role === role).click(),
    pose: pose => nodes.get('action-list').children.find(card => card.dataset.action === pose).click(),
    advance(ms) { now += ms; interval(); },
    arrive() { assert.ok(target, 'the monk should have a destination'); player = { ...target, moving: false }; target = null; interval(); },
  };
}

test('menu collects six separate scraps, sews, equips and restores the new robe', async () => {
  const fabric = await fabricModule, app = launchApp(fabric);
  app.role('monk');
  assert.equal(app.node('sew-robe').disabled, true);
  for (let i = 1; i <= fabric.CLOTH_REQUIRED; i++) {
    app.click('collect-fabric');
    assert.equal(app.view.pose, 'walk');
    app.advance(5000);
    assert.equal(app.view.picked.length, i - 1, 'cloth cannot be picked up from a distance');
    app.arrive();
    assert.equal(app.view.pose, 'collect');
    app.advance(fabric.PICKUP_TIME - 1);
    assert.equal(app.view.picked.length, i - 1);
    app.advance(1);
    assert.equal(app.view.picked.length, i);
  }
  assert.equal(app.node('sew-robe').disabled, false);
  app.click('sew-robe');
  assert.equal(app.view.pose, 'sew');
  assert.equal(app.node('sewing-progress').hidden, false);
  app.advance(fabric.SEW_TIME / 2);
  assert.equal(app.node('sewing-progress').value, 50);
  assert.equal(app.view.robe, 0);
  app.advance(fabric.SEW_TIME / 2);
  assert.equal(app.view.robe, 1);
  assert.equal(app.view.pose, 'sit');
  assert.match(app.node('fabric-stock').textContent, /0 mảnh vải · 1 áo/);
  assert.equal(app.node('sew-robe').disabled, true);
  assert.equal(app.posts.at(-1).body.robe, 1);
  app.advance(fabric.SEW_TIME * 2);
  assert.equal(app.view.robe, 1, 'completion must happen only once');
  app.click('leave-role');
  app.role('ghost');
  assert.equal(app.node('monk-actions').hidden, true);
  app.click('leave-role');
  app.role('monk');
  assert.equal(app.view.robe, 1);
  assert.equal(app.view.picked.length, fabric.CLOTH_REQUIRED);
  const reload = launchApp(fabric, app.saved);
  reload.role('monk');
  assert.equal(reload.view.robe, 1);
  assert.equal(reload.view.picked.length, fabric.CLOTH_REQUIRED);
});

test('interrupting sewing or leaving the role keeps unspent cloth', async () => {
  const fabric = await fabricModule;
  const picked = fabric.FABRIC_PIECES.slice(0, fabric.CLOTH_REQUIRED).map(p => p.id);
  const saved = new Map([[fabric.FABRIC_STORAGE_KEY, JSON.stringify({ picked, robes: 0 })]]);
  const app = launchApp(fabric, saved);
  app.role('monk'); app.click('sew-robe'); app.advance(1000); app.pose('sit'); app.advance(fabric.SEW_TIME);
  assert.equal(app.view.robe, 0);
  assert.match(app.node('fabric-stock').textContent, /6 mảnh vải/);
  app.click('sew-robe'); app.advance(1000); app.click('leave-role'); app.advance(fabric.SEW_TIME);
  app.role('ghost'); app.click('collect-fabric'); app.click('sew-robe'); app.advance(fabric.SEW_TIME);
  assert.equal(app.view.role, 'ghost');
  assert.equal(app.view.robe, 0);
  app.click('leave-role'); app.role('monk');
  assert.equal(app.node('sew-robe').disabled, false);
  app.click('sew-robe'); app.advance(fabric.SEW_TIME);
  assert.equal(app.view.robe, 1);
  assert.equal(JSON.parse(saved.get(fabric.FABRIC_STORAGE_KEY)).robes, 1);
});

test('monk models animate all six poses and change patchwork without changing villagers', async () => {
  const coreURL = moduleURL(read('vendor/three.core.min.js'));
  const { createMonk } = await import(moduleURL(read('character.js').replace('from "three"', `from "${coreURL}"`)));
  const monk = createMonk();
  const textures = () => { const values = []; monk.root.traverse(o => { if (o.isMesh && o.material.map) values.push(o.material.map); }); return values; };
  const initial = textures()[0];
  assert.ok(initial, 'the robe should have a patchwork textile');
  for (const pose of ['walk', 'sit', 'sleep', 'eat', 'collect', 'sew']) {
    for (const time of [0, 0.5, 1]) monk.animate(pose, time, pose === 'walk', 1);
    monk.root.updateMatrixWorld(true);
    monk.root.traverse(o => assert.ok(o.matrixWorld.elements.every(Number.isFinite), `Invalid transform in ${pose}`));
  }
  monk.setRobe(1);
  const updated = textures();
  assert.ok(updated.every(texture => texture === updated[0]));
  assert.notDeepEqual(updated[0].image.data, initial.image.data);
  assert.equal(monk.root.userData.robe, 1);
  const villager = createMonk({ villager: true });
  villager.setRobe(1);
  villager.root.traverse(o => { if (o.isMesh) assert.equal(o.material.map, null); });
  monk.dispose(); villager.dispose();
});
