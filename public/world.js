// 2D portrait world: a cemetery seen from a high 3/4 angle, scrolling vertically.
// World units: 400 wide x 2000 tall. Everything is drawn procedurally on canvas.
window.World = (() => {
  const W = 400;
  const H = 2000;

  const PLACES = {
    gate: { x: 200, y: 1850, name: "Cổng nghĩa địa" },
    bamboo: { x: 95, y: 1490, name: "Bụi tre" },
    graves: { x: 222, y: 1065, name: "Giữa các ngôi mộ" },
    gao: { x: 150, y: 625, name: "Gốc cây gạo" },
  };
  const UNNAMED = { x: 262, y: 1032 };
  const SPAWN = {
    monk: { x: 205, y: 1950 },
    ghost: { x: 160, y: 650 },
    villager: { x: 172, y: 1965 },
  };
  const PATH = [[198, 2400],[200, 2000], [208, 1840], [168, 1660], [150, 1500], [195, 1320], [240, 1150], [226, 980], [175, 800], [152, 640], [186, 440], [200, 270]];

  const COLORS = {
    ground: "#15201b",
    groundEdge: "#0d1311",
    path: "#202924",
    pathInner: "#29332d",
    grave: "#343c37",
    graveFace: "#454e48",
    mound: "#232d28",
    moundTop: "#2c3832",
    bamboo: "#1f2b24",
    leaf: "#25332b",
    trunk: "#1b211d",
    canopy: "#151d19",
    flower: "#7d2b23",
    ember: "#e09050",
    lantern: "#e6c56f",
    jade: "#9fd2c1",
    robe: "#6e4f33",
    robeDark: "#5a3f28",
    skin: "#b48a62",
    villagerBody: "#3a4447",
    hat: "#c8b989",
    ash: "#dcd5c5",
    ashDim: "#8d9189",
  };

  // ---------- seeded decor ----------
  function rng(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function distToPath(x, y) {
    let best = Infinity;
    for (let i = 0; i < PATH.length - 1; i++) {
      const [ax, ay] = PATH[i];
      const [bx, by] = PATH[i + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      best = Math.min(best, Math.hypot(x - (ax + t * dx), y - (ay + t * dy)));
    }
    return best;
  }

  const decor = [];
  const tufts = [];
  (function buildDecor() {
    const r = rng(11);
    let tries = 0;
    let count = 0;
    while (count < 72 && tries < 4000) {
      tries++;
      const x = 18 + r() * 364;
      const y = 720 + r() * 700;
      if (distToPath(x, y) < 26) continue;
      if (Math.hypot(x - UNNAMED.x, y - UNNAMED.y) < 30) continue;
      if (Math.hypot(x - PLACES.graves.x, y - PLACES.graves.y) < 30) continue;
      if (decor.some((d) => d.kind === "grave" && Math.hypot(d.x - x, d.y - y) < 25)) continue;
      decor.push({ kind: "grave", type: Math.floor(r() * 4), x, y, s: 0.8 + r() * 0.5, incense: r() < 0.07 });
      count++;
    }
    decor.push({ kind: "unnamed", x: UNNAMED.x, y: UNNAMED.y });
    const clusters = [[55, 1470, 9], [112, 1535, 7], [38, 1590, 8], [330, 1610, 7], [362, 1430, 6], [28, 1380, 6], [352, 1730, 6], [300, 1500, 4]];
    for (const [cx, cy, n] of clusters) {
      for (let i = 0; i < n; i++) {
        decor.push({ kind: "bamboo", x: cx + (r() - 0.5) * 42, y: cy + (r() - 0.5) * 30, h: 62 + r() * 55, lean: (r() - 0.5) * 0.35, seed: r() * 10 });
      }
    }
    decor.push({ kind: "gao", x: 118, y: 600 });
    for (const [x, y] of [[332, 520], [58, 860], [352, 890], [300, 330], [70, 300], [360, 1250], [30, 1180]]) {
      decor.push({ kind: "tree", x, y, s: 0.7 + r() * 0.5 });
    }
    decor.push({ kind: "gate", x: 200, y: 1795 });
    decor.push({ kind: "shrine", x: 205, y: 235 });
    for (const [x, y] of [[78, 1975], [325, 1962], [52, 2110], [318, 2135], [92, 2290], [340, 2310]]) decor.push({ kind: "house", x, y });
    for (const [x, y] of [[20, 2050], [372, 2060], [140, 2200], [258, 2240], [30, 2380], [380, 2420]]) decor.push({ kind: "tree", x, y, s: 0.8 + r() * 0.4 });
    for (const [cx, cy, n] of [[255, 2060, 5], [120, 2380, 6]]) for (let i = 0; i < n; i++) decor.push({ kind: "bamboo", x: cx + (r() - 0.5) * 36, y: cy + (r() - 0.5) * 24, h: 60 + r() * 45, lean: (r() - 0.5) * 0.3, seed: r() * 10 });
    for (let i = 0; i < 320; i++) tufts.push({ x: r() * W, y: r() * H, s: 0.6 + r() * 0.9 });
  })();

  const fog = Array.from({ length: 7 }, (_, i) => ({ x: Math.random() * W, y: i / 7, rx: 120 + Math.random() * 120, ry: 26 + Math.random() * 20, v: 3 + Math.random() * 5 }));
  const fireflies = Array.from({ length: 14 }, () => ({ x: 30 + Math.random() * 340, y: 700 + Math.random() * 900, p: Math.random() * 6.28, v: 0.4 + Math.random() * 0.6 }));

  // A black owl crosses the sky now and then and hoots once mid-flight.
  const owl = { on: false, x: 0, y: 0, dir: 1, hooted: false, wait: 10 + Math.random() * 8, phase: 0 };
  function updateOwl(dt) {
    if (!owl.on) {
      if (!view.role) return;
      owl.wait -= dt;
      if (owl.wait > 0) return;
      owl.on = true; owl.hooted = false;
      owl.dir = Math.random() < 0.5 ? 1 : -1;
      owl.x = owl.dir > 0 ? -30 : W + 30;
      owl.yRel = 0.1 + Math.random() * 0.16;
      return;
    }
    owl.x += owl.dir * 46 * dt;
    owl.phase += dt;
    if (!owl.hooted && owl.x > W * 0.38 && owl.x < W * 0.62) {
      owl.hooted = true;
      window.dispatchEvent(new CustomEvent("owl", { detail: { pan: (owl.x / W) * 2 - 1 } }));
    }
    if (owl.x < -40 || owl.x > W + 40) { owl.on = false; owl.wait = 28 + Math.random() * 30; }
  }
  function drawOwl() {
    if (!owl.on) return;
    const x = owl.x, y = camY + viewH * owl.yRel + Math.sin(owl.phase * 1.7) * 5;
    const flap = Math.sin(owl.phase * 7);
    const d = owl.dir;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(x, y);
    ctx.scale(d, 1);
    ctx.fillStyle = "#07090a";
    ctx.strokeStyle = "rgba(170,190,200,0.28)";
    ctx.lineWidth = 0.8;
    // wings
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.quadraticCurveTo(s * 14, -10 - flap * 9, s * 30, -2 - flap * 14);
      ctx.quadraticCurveTo(s * 18, 3 - flap * 3, 0, 5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // body and head
    ctx.beginPath(); ctx.ellipse(0, 3, 5, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -7, 4.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, -9); ctx.lineTo(-3.4, -13); ctx.lineTo(-1.2, -10.4); ctx.moveTo(4, -9); ctx.lineTo(3.4, -13); ctx.lineTo(1.2, -10.4); ctx.fill();
    // two pale eyes
    ctx.fillStyle = "rgba(230,200,120,0.9)";
    ctx.fillRect(-2.6, -7.6, 1.4, 1.4); ctx.fillRect(1.2, -7.6, 1.4, 1.4);
    ctx.restore();
  }

  // A crow: faster, jagged wings, caws harshly a few times while crossing.
  const crow = { on: false, x: 0, y: 0, dir: 1, called: false, wait: 35 + Math.random() * 25, phase: 0, yRel: 0.15 };
  function updateCrow(dt) {
    if (!crow.on) {
      if (!view.role) return;
      crow.wait -= dt;
      if (crow.wait > 0 || owl.on) return;
      crow.on = true; crow.called = false;
      crow.dir = Math.random() < 0.5 ? 1 : -1;
      crow.x = crow.dir > 0 ? -30 : W + 30;
      crow.yRel = 0.08 + Math.random() * 0.25;
      return;
    }
    crow.x += crow.dir * 78 * dt;
    crow.phase += dt;
    if (!crow.called && crow.x > W * 0.3 && crow.x < W * 0.7) {
      crow.called = true;
      window.dispatchEvent(new CustomEvent("crow", { detail: { pan: (crow.x / W) * 2 - 1, n: 2 + Math.floor(Math.random() * 3) } }));
    }
    if (crow.x < -40 || crow.x > W + 40) { crow.on = false; crow.wait = 55 + Math.random() * 50; }
  }
  function drawCrow() {
    if (!crow.on) return;
    const x = crow.x, y = camY + viewH * crow.yRel + Math.sin(crow.phase * 2.3) * 4;
    const flap = Math.sin(crow.phase * 11);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(x, y);
    ctx.scale(crow.dir, 1);
    ctx.fillStyle = "#050707";
    ctx.strokeStyle = "rgba(170,190,200,0.22)";
    ctx.lineWidth = 0.7;
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, -1);
      ctx.lineTo(s * 9, -8 - flap * 8);
      ctx.lineTo(s * 17, -5 - flap * 10);
      ctx.lineTo(s * 24, -2 - flap * 12);
      ctx.lineTo(s * 14, 1 - flap * 3);
      ctx.lineTo(s * 6, 3);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 1, 3.6, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(5.2, -3, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(7.4, -3.6); ctx.lineTo(12, -2.4); ctx.lineTo(7.4, -1.6); ctx.fill();
    ctx.restore();
  }

  // ---------- runtime state ----------
  let canvas, ctx, shade, sctx;
  let dpr = 1;
  let scale = 1;
  let viewH = 800;
  let camY = H - 800;
  let last = 0;
  let time = 0;
  const player = { x: SPAWN.monk.x, y: SPAWN.monk.y, tx: null, ty: null, facing: 1, phase: 0, moving: false };
  const others = new Map();
  const ripples = [];
  const view = { mist: 0.4, role: null, pose: null, darkness: 0.75, flags: new Set(), marker: null, nick: "", anchor: 0.55 };
  let tapHandler = null;

  function init(canvasEl, onTap) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    shade = document.createElement("canvas");
    sctx = shade.getContext("2d");
    tapHandler = onTap;
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left) / scale;
      const wy = (e.clientY - rect.top) / scale + camY;
      if (tapHandler) tapHandler(wx, wy);
    });
    requestAnimationFrame(frame);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    shade.width = canvas.width;
    shade.height = canvas.height;
    scale = rect.width / W;
    viewH = rect.height / scale;
  }

  // ---------- public controls ----------
  function setView(patch) { Object.assign(view, patch); }
  function setPlayer(x, y) { player.x = x; player.y = y; player.tx = null; player.moving = false; camY = clampCam(y - viewH * view.anchor); }
  function walkTo(x, y) {
    player.tx = Math.max(12, Math.min(W - 12, x));
    player.ty = Math.max(60, Math.min(H - 20, y));
  }
  function stop() { player.tx = null; player.moving = false; }
  function getPlayer() { return { x: player.x, y: player.y, moving: player.moving, nx: player.x / W, ny: player.y / H }; }

  function setOthers(list) {
    const seen = new Set();
    for (const p of list) {
      seen.add(p.pid);
      const x = p.x * W;
      const y = p.y * H;
      const o = others.get(p.pid);
      if (o) Object.assign(o, { x, y, role: p.role, nick: p.nick, pose: p.pose });
      else others.set(p.pid, { x, y, rx: x, ry: y, role: p.role, nick: p.nick, pose: p.pose, phase: Math.random() * 6 });
    }
    for (const id of [...others.keys()]) if (!seen.has(id)) others.delete(id);
  }

  function ripple(nx, ny, kind) { ripples.push({ x: nx * W, y: ny * H, kind, t: 0 }); }

  function clampCam(y) { return Math.max(-viewH * 0.1, Math.min(H + 450 - viewH, y)); }

  // ---------- update ----------
  function update(dt) {
    time += dt;
    if (player.tx != null) {
      const dx = player.tx - player.x;
      const dy = player.ty - player.y;
      const d = Math.hypot(dx, dy);
      const speed = view.role === "ghost" ? 70 : 88;
      if (d < 2) { player.tx = null; player.moving = false; }
      else {
        const step = Math.min(d, speed * dt);
        player.x += (dx / d) * step;
        player.y += (dy / d) * step;
        if (Math.abs(dx) > 1) player.facing = dx > 0 ? 1 : -1;
        player.moving = true;
        player.phase += dt * 9;
      }
    }
    camY += (clampCam(player.y - viewH * view.anchor) - camY) * Math.min(1, dt * 3);
    for (const o of others.values()) {
      const dx = o.x - o.rx;
      const dy = o.y - o.ry;
      o.moving = Math.hypot(dx, dy) > 1.5;
      o.rx += dx * Math.min(1, dt * 3.5);
      o.ry += dy * Math.min(1, dt * 3.5);
      if (o.moving) o.phase += dt * 9;
    }
    for (const r of ripples) r.t += dt;
    while (ripples.length && ripples[0].t > 3) ripples.shift();
    for (const f of fog) { f.x += f.v * dt; if (f.x - f.rx > W) f.x = -f.rx; }
    for (const f of fireflies) f.p += dt * f.v;
    updateOwl(dt);
    updateCrow(dt);
  }

  // ---------- drawing helpers ----------
  function ellipse(x, y, rx, ry, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
  function shadow(x, y, rx) { ellipse(x, y + 1, rx, rx * 0.35, "rgba(0,0,0,0.35)"); }

  function drawGround(top, bottom) {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, top, W, bottom - top);
    // edges darker
    const g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "rgba(0,0,0,0.35)");
    g.addColorStop(0.18, "rgba(0,0,0,0)");
    g.addColorStop(0.82, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, top, W, bottom - top);
    // path
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    PATH.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = COLORS.path;
    ctx.lineWidth = 34;
    ctx.stroke();
    ctx.strokeStyle = COLORS.pathInner;
    ctx.lineWidth = 20;
    ctx.stroke();
    // grass tufts
    ctx.strokeStyle = "#1c2720";
    ctx.lineWidth = 1;
    for (const t of tufts) {
      if (t.y < top - 10 || t.y > bottom + 10) continue;
      if (distToPath(t.x, t.y) < 14) continue;
      ctx.beginPath();
      ctx.moveTo(t.x - 3 * t.s, t.y); ctx.lineTo(t.x - 1 * t.s, t.y - 5 * t.s);
      ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y - 7 * t.s);
      ctx.moveTo(t.x + 3 * t.s, t.y); ctx.lineTo(t.x + 1.5 * t.s, t.y - 5 * t.s);
      ctx.stroke();
    }
  }

  function drawGrave(d, lights) {
    const s = d.s;
    const { x, y } = d;
    shadow(x, y, 11 * s);
    ctx.fillStyle = COLORS.grave;
    if (d.type === 0) {
      ellipse(x, y - 3 * s, 12 * s, 7 * s, COLORS.mound);
      ellipse(x, y - 5 * s, 9 * s, 4.5 * s, COLORS.moundTop);
    } else if (d.type === 1) {
      ctx.beginPath();
      ctx.moveTo(x - 6 * s, y); ctx.lineTo(x - 6 * s, y - 14 * s);
      ctx.quadraticCurveTo(x, y - 22 * s, x + 6 * s, y - 14 * s);
      ctx.lineTo(x + 6 * s, y); ctx.closePath(); ctx.fill();
      ctx.fillStyle = COLORS.graveFace;
      ctx.fillRect(x - 3 * s, y - 13 * s, 6 * s, 9 * s);
    } else if (d.type === 2) {
      ctx.fillRect(x - 11 * s, y - 6 * s, 22 * s, 6 * s);
      ctx.fillStyle = COLORS.graveFace;
      ctx.fillRect(x - 5 * s, y - 20 * s, 10 * s, 14 * s);
      ctx.fillStyle = COLORS.grave;
      ctx.fillRect(x - 7 * s, y - 22 * s, 14 * s, 3 * s);
    } else {
      ctx.fillRect(x - 7 * s, y - 5 * s, 14 * s, 5 * s);
      ctx.fillStyle = COLORS.graveFace;
      ctx.fillRect(x - 5 * s, y - 16 * s, 10 * s, 11 * s);
      ctx.beginPath(); ctx.moveTo(x - 6 * s, y - 16 * s); ctx.lineTo(x, y - 24 * s); ctx.lineTo(x + 6 * s, y - 16 * s); ctx.closePath();
      ctx.fillStyle = COLORS.grave; ctx.fill();
    }
    if (d.incense) drawIncense(x + 8 * s, y - 2, lights, 0.5);
  }

  function drawIncense(x, y, lights, strength) {
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 0.8;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * 1.5, y); ctx.lineTo(x + i * 2, y - 9); ctx.stroke();
      const flick = 0.6 + 0.4 * Math.sin(time * 5 + i * 2 + x);
      ellipse(x + i * 2, y - 9, 0.9, 0.9, `rgba(240,150,80,${0.6 + 0.4 * flick})`);
    }
    lights.push({ x, y: y - 9, r: 18, a: 0.45 * strength });
    // thin smoke
    ctx.strokeStyle = "rgba(210,210,200,0.10)";
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const yy = y - 9 - k * 3;
      const xx = x + Math.sin(time * 1.2 + k * 0.7) * (k * 0.5);
      k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  }

  function drawUnnamed(d, lights) {
    const { x, y } = d;
    shadow(x, y, 14);
    ellipse(x, y - 3, 14, 7, "#212b26");
    ctx.strokeStyle = "#2b3a31";
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i += 4) {
      ctx.beginPath(); ctx.moveTo(x + i, y - 5); ctx.lineTo(x + i + 1, y - 11 - Math.abs(Math.sin(i)) * 3); ctx.stroke();
    }
    if (view.flags.has("offering")) {
      ellipse(x - 2, y - 7, 5, 2.5, "#3b3a35");
      ellipse(x - 2, y - 8.5, 3.8, 2.4, "#e8e4d6");
      lights.push({ x: x - 2, y: y - 8, r: 14, a: 0.25 });
    }
    if (view.flags.has("incense")) drawIncense(x + 8, y - 4, lights, 1);
  }

  function drawBamboo(d) {
    const sway = Math.sin(time * 0.8 + d.seed) * 3;
    const topX = d.x + d.lean * d.h + sway;
    const topY = d.y - d.h;
    ctx.strokeStyle = COLORS.bamboo;
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.quadraticCurveTo(d.x + d.lean * d.h * 0.4, d.y - d.h * 0.5, topX, topY); ctx.stroke();
    ctx.strokeStyle = "#16201b";
    ctx.lineWidth = 1;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const nx = d.x + (topX - d.x) * t;
      const ny = d.y + (topY - d.y) * t;
      ctx.beginPath(); ctx.moveTo(nx - 1.6, ny); ctx.lineTo(nx + 1.6, ny); ctx.stroke();
    }
    ctx.strokeStyle = COLORS.leaf;
    ctx.lineWidth = 2;
    for (let k = 0; k < 5; k++) {
      const a = -Math.PI / 2 + (k - 2) * 0.55 + sway * 0.05;
      ctx.beginPath(); ctx.moveTo(topX, topY); ctx.lineTo(topX + Math.cos(a) * 14, topY + Math.sin(a) * 9 + 6); ctx.stroke();
    }
  }

  function drawGao(d) {
    const { x, y } = d;
    shadow(x, y, 26);
    ctx.fillStyle = COLORS.trunk;
    ctx.beginPath();
    ctx.moveTo(x - 9, y); ctx.lineTo(x - 5, y - 95); ctx.lineTo(x + 5, y - 95); ctx.lineTo(x + 9, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COLORS.trunk;
    ctx.lineWidth = 4;
    for (const [bx, by, ex, ey] of [[0, -70, -40, -110], [0, -80, 38, -118], [0, -92, -10, -130]]) {
      ctx.beginPath(); ctx.moveTo(x + bx, y + by); ctx.lineTo(x + ex, y + ey); ctx.stroke();
    }
    for (const [cx, cy, rx, ry] of [[-38, -118, 30, 16], [34, -124, 32, 16], [-4, -140, 36, 18]]) ellipse(x + cx, y + cy, rx, ry, COLORS.canopy);
    const r = rng(5);
    for (let i = 0; i < 26; i++) {
      const fx = x - 60 + r() * 120;
      const fy = y - 150 + r() * 45;
      ellipse(fx, fy, 2, 2, COLORS.flower);
    }
  }

  function drawTree(d) {
    const { x, y, s } = d;
    shadow(x, y, 16 * s);
    ctx.fillStyle = COLORS.trunk;
    ctx.fillRect(x - 3 * s, y - 40 * s, 6 * s, 40 * s);
    ellipse(x - 10 * s, y - 48 * s, 18 * s, 13 * s, COLORS.canopy);
    ellipse(x + 10 * s, y - 52 * s, 18 * s, 13 * s, COLORS.canopy);
    ellipse(x, y - 62 * s, 16 * s, 12 * s, "#17201b");
  }

  function drawGate(d) {
    const { x, y } = d;
    for (const side of [-1, 1]) {
      shadow(x + side * 42, y, 9);
      ctx.fillStyle = "#3a3f3a";
      ctx.fillRect(x + side * 42 - 5, y - 48, 10, 48);
      ctx.fillStyle = "#474d47";
      ctx.fillRect(x + side * 42 - 6, y - 52, 12, 5);
    }
    ctx.fillStyle = "#353a35";
    ctx.fillRect(x - 50, y - 60, 100, 9);
    ctx.beginPath();
    ctx.moveTo(x - 58, y - 60); ctx.quadraticCurveTo(x, y - 70, x + 58, y - 60); ctx.lineTo(x + 50, y - 66); ctx.quadraticCurveTo(x, y - 74, x - 50, y - 66); ctx.closePath();
    ctx.fillStyle = "#2a2e2a"; ctx.fill();
  }

  function drawShrine(d) {
    const { x, y } = d;
    shadow(x, y, 30);
    ctx.fillStyle = "#2a2f2b";
    ctx.fillRect(x - 26, y - 34, 52, 34);
    ctx.fillStyle = "#101513";
    ctx.fillRect(x - 8, y - 22, 16, 22);
    ctx.beginPath();
    ctx.moveTo(x - 38, y - 30); ctx.quadraticCurveTo(x - 20, y - 36, x, y - 56); ctx.quadraticCurveTo(x + 20, y - 36, x + 38, y - 30);
    ctx.lineTo(x + 30, y - 36); ctx.lineTo(x, y - 50); ctx.lineTo(x - 30, y - 36); ctx.closePath();
    ctx.fillStyle = "#1e2320"; ctx.fill();
  }

  function drawHouse(d, lights) {
    const { x, y } = d;
    shadow(x, y, 32);
    ctx.fillStyle = "#262b28";
    ctx.fillRect(x - 28, y - 28, 56, 28);
    ctx.beginPath(); ctx.moveTo(x - 34, y - 26); ctx.lineTo(x, y - 48); ctx.lineTo(x + 34, y - 26); ctx.closePath();
    ctx.fillStyle = "#1a1f1c"; ctx.fill();
    ctx.fillStyle = COLORS.lantern;
    ctx.globalAlpha = 0.75;
    ctx.fillRect(x - 6, y - 19, 12, 9);
    ctx.globalAlpha = 1;
    lights.push({ x, y: y - 15, r: 60, a: 0.55 });
  }

  // ---------- characters ----------
  function drawMonk(x, y, pose, phase, moving, facing, lights) {
    lights.push({ x, y: y - 14, r: 58, a: 0.7 });
    if (pose === "sit") {
      shadow(x, y, 13);
      ctx.fillStyle = COLORS.robeDark;
      ellipse(x, y - 3, 13, 5, COLORS.robeDark);
      ctx.beginPath(); ctx.moveTo(x - 11, y - 3); ctx.quadraticCurveTo(x, y - 26, x + 11, y - 3); ctx.closePath();
      ctx.fillStyle = COLORS.robe; ctx.fill();
      ellipse(x, y - 25, 5, 5, COLORS.skin);
      ellipse(x, y - 9, 3.2, 1.8, "#2a1e14");
      return;
    }
    const bob = moving ? Math.abs(Math.sin(phase)) * 1.6 : 0;
    shadow(x, y, 8);
    ctx.fillStyle = COLORS.robeDark;
    const step = moving ? Math.sin(phase) * 2.5 : 0;
    ctx.fillRect(x - 3 + step, y - 6, 2.5, 6);
    ctx.fillRect(x + 1 - step, y - 6, 2.5, 6);
    ctx.beginPath(); ctx.moveTo(x - 8, y - 5 - bob); ctx.lineTo(x - 5, y - 24 - bob); ctx.lineTo(x + 5, y - 24 - bob); ctx.lineTo(x + 8, y - 5 - bob); ctx.closePath();
    ctx.fillStyle = COLORS.robe; ctx.fill();
    ellipse(x, y - 29 - bob, 4.8, 4.8, COLORS.skin);
    ellipse(x + facing * 5, y - 15 - bob, 3.4, 2.4, "#2a1e14");
  }

  function drawGhost(x, y, phase, alpha, lights) {
    const float = Math.sin(time * 1.6 + phase) * 3;
    const yy = y - 18 + float;
    const flick = 0.85 + 0.15 * Math.sin(time * 7 + phase);
    const a = alpha * flick;
    const g = ctx.createRadialGradient(x, yy - 4, 1, x, yy, 18);
    g.addColorStop(0, `rgba(190,235,220,${0.85 * a})`);
    g.addColorStop(0.5, `rgba(159,210,193,${0.35 * a})`);
    g.addColorStop(1, "rgba(159,210,193,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 9, yy - 4);
    ctx.quadraticCurveTo(x - 10, yy - 18, x, yy - 18);
    ctx.quadraticCurveTo(x + 10, yy - 18, x + 9, yy - 4);
    const tail = Math.sin(time * 2 + phase) * 4;
    ctx.quadraticCurveTo(x + 6, yy + 10, x + tail, yy + 20);
    ctx.quadraticCurveTo(x - 6, yy + 8, x - 9, yy - 4);
    ctx.fill();
    lights.push({ x, y: yy, r: 26, a: 0.25 * alpha });
  }

  function drawVillager(x, y, phase, moving, facing, lights) {
    const bob = moving ? Math.abs(Math.sin(phase)) * 1.4 : 0;
    shadow(x, y, 7);
    const step = moving ? Math.sin(phase) * 2.5 : 0;
    ctx.fillStyle = "#2a3235";
    ctx.fillRect(x - 3 + step, y - 7, 2.5, 7);
    ctx.fillRect(x + 1 - step, y - 7, 2.5, 7);
    ctx.fillStyle = COLORS.villagerBody;
    ctx.fillRect(x - 5, y - 22 - bob, 10, 16);
    ellipse(x, y - 25 - bob, 3.6, 3.6, "#8f7056");
    ctx.beginPath(); ctx.moveTo(x - 11, y - 25 - bob); ctx.lineTo(x, y - 36 - bob); ctx.lineTo(x + 11, y - 25 - bob); ctx.closePath();
    ctx.fillStyle = COLORS.hat; ctx.fill();
    // lantern on a short pole
    const lx = x + facing * 11;
    const ly = y - 14 - bob + Math.sin(time * 3 + phase) * 0.8;
    ctx.strokeStyle = "#4a3c2c";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + facing * 4, y - 16 - bob); ctx.lineTo(lx, ly - 5); ctx.stroke();
    ctx.fillStyle = COLORS.lantern;
    ctx.fillRect(lx - 2.5, ly - 4, 5, 7);
    lights.push({ x: lx, y: ly, r: 105, a: 0.9 });
  }

  function drawCharacter(c, lights, viewerIsGhost) {
    if (c.role === "monk") drawMonk(c.x, c.y, c.pose, c.phase, c.moving, c.facing || 1, lights);
    else if (c.role === "ghost") drawGhost(c.x, c.y, c.phase, viewerIsGhost || c.isMe ? 0.9 : 0.38, lights);
    else if (c.role === "villager") drawVillager(c.x, c.y, c.phase, c.moving, c.facing || 1, lights);
    else ellipse(c.x, c.y - 4, 3, 3, "rgba(220,213,197,0.35)");
  }

  // ---------- frame ----------
  function frame(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
    last = ts;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function draw() {
    const k = scale * dpr;
    const top = camY - 40;
    const bottom = camY + viewH + 80;
    const lights = [];
    ctx.setTransform(k, 0, 0, k, 0, -camY * k);
    drawGround(top - 40, bottom);

    // collect drawables in view, sort by y (base line)
    const items = [];
    for (const d of decor) if (d.y > top - 20 && d.y < bottom + 160) items.push(d);
    for (const [pid, o] of others) items.push({ kind: "char", role: o.role, x: o.rx, y: o.ry, pose: o.pose, phase: o.phase, moving: o.moving, facing: o.x >= o.rx ? 1 : -1, label: o.nick || roleName(o.role), pid });
    if (view.role) items.push({ kind: "char", role: view.role, x: player.x, y: player.y, pose: view.pose, phase: player.phase, moving: player.moving, facing: player.facing, label: "bạn", isMe: true });
    items.sort((a, b) => a.y - b.y);

    const viewerIsGhost = view.role === "ghost";
    for (const it of items) {
      switch (it.kind) {
        case "grave": drawGrave(it, lights); break;
        case "unnamed": drawUnnamed(it, lights); break;
        case "bamboo": drawBamboo(it); break;
        case "gao": drawGao(it); break;
        case "tree": drawTree(it); break;
        case "gate": drawGate(it); break;
        case "shrine": drawShrine(it); break;
        case "house": drawHouse(it, lights); break;
        case "char": drawCharacter(it, lights, viewerIsGhost); break;
      }
    }

    // drifting fog
    for (const f of fog) {
      const fy = camY + f.y * viewH;
      ellipse(f.x, fy, f.rx * (1 + view.mist * 0.5), f.ry * (1 + view.mist * 0.9), `rgba(200,210,205,${0.03 + view.mist * 0.075})`);
    }

    // darkness with light holes
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = "source-over";
    sctx.clearRect(0, 0, shade.width, shade.height);
    const dark = viewerIsGhost ? view.darkness * 0.72 : view.darkness;
    sctx.fillStyle = `rgba(3,6,8,${dark})`;
    sctx.fillRect(0, 0, shade.width, shade.height);
    sctx.globalCompositeOperation = "destination-out";
    for (const l of lights) {
      const sx = l.x * k;
      const sy = (l.y - camY) * k;
      const sr = l.r * k;
      if (sy < -sr || sy > shade.height + sr) continue;
      const g = sctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
      g.addColorStop(0, `rgba(0,0,0,${l.a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      sctx.fillStyle = g;
      sctx.beginPath(); sctx.arc(sx, sy, sr, 0, Math.PI * 2); sctx.fill();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(shade, 0, 0);
    if (viewerIsGhost) {
      ctx.fillStyle = "rgba(70,120,115,0.10)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // above darkness: warm glows, fireflies, ripples, labels, marker
    ctx.setTransform(k, 0, 0, k, 0, -camY * k);
    drawOwl();
    drawCrow();
    ctx.globalCompositeOperation = "lighter";
    for (const l of lights) {
      if (l.r < 50) continue;
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 0.5);
      g.addColorStop(0, `rgba(230,170,90,${0.10 * l.a})`);
      g.addColorStop(1, "rgba(230,170,90,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    for (const f of fireflies) {
      const fx = f.x + Math.sin(f.p) * 14;
      const fy = f.y + Math.cos(f.p * 0.7) * 10;
      if (fy < top || fy > bottom) continue;
      const a = Math.max(0, Math.sin(f.p * 2.3)) * 0.8;
      ellipse(fx, fy, 1.3, 1.3, `rgba(200,240,160,${a})`);
    }
    ctx.globalCompositeOperation = "source-over";

    for (const r of ripples) {
      const color = r.kind === "sigh" ? "159,210,193" : r.kind === "lantern" ? "230,197,111" : "233,226,204";
      const rad = 8 + r.t * 70;
      ctx.strokeStyle = `rgba(${color},${Math.max(0, 0.8 - r.t / 3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(r.x, r.y - 10, rad, rad * 0.55, 0, 0, Math.PI * 2); ctx.stroke();
    }

    ctx.font = '500 9px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = "center";
    for (const it of items) {
      if (it.kind !== "char" || !it.label) continue;
      if (it.role === "ghost" && !viewerIsGhost && !it.isMe) continue; // the living don't see a ghost's name
      ctx.fillStyle = it.isMe ? "rgba(220,213,197,0.95)" : "rgba(220,213,197,0.6)";
      const lift = it.role === "ghost" ? 46 : it.pose === "sit" ? 36 : 44;
      ctx.fillText(it.label, it.x, it.y - lift);
    }

    if (view.marker && PLACES[view.marker]) drawMarker(PLACES[view.marker]);
  }

  function drawMarker(p) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    const onTop = p.y < camY + 80;
    const onBottom = p.y > camY + viewH - 140;
    if (!onTop && !onBottom) {
      ctx.strokeStyle = `rgba(230,197,111,${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 20 + pulse * 4, 9 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(230,197,111,0.9)";
      ctx.font = '500 10px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.fillText(p.name, p.x, p.y + 24);
      return;
    }
    const ay = onTop ? camY + 96 : camY + viewH - 140;
    const ax = Math.max(30, Math.min(W - 30, p.x));
    const dir = onTop ? -1 : 1;
    ctx.fillStyle = `rgba(230,197,111,${0.6 + 0.35 * pulse})`;
    ctx.beginPath(); ctx.moveTo(ax, ay + dir * 8); ctx.lineTo(ax - 7, ay - dir * 2); ctx.lineTo(ax + 7, ay - dir * 2); ctx.closePath(); ctx.fill();
    ctx.font = '500 10px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillText(p.name, ax, ay - dir * 12);
  }

  function roleName(role) {
    return role && window.ROLE_INFO ? ROLE_INFO[role].name : "";
  }

  return { W, H, PLACES, SPAWN, init, setView, setPlayer, walkTo, stop, getPlayer, setOthers, ripple };
})();
