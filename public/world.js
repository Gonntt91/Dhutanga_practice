// 2D portrait world: a cemetery seen from a high 3/4 angle, scrolling vertically.
// World units: 400 wide x 2000 tall. Everything is drawn procedurally on canvas.
window.World = (() => {
  const W = 640;            // world width (content was authored for 400, then shifted by SHIFT)
  const SHIFT = window.WORLD_SHIFT || 0;
  const BASE_VIEW_W = 400;  // at zoom 1 the screen shows this many world units across
  const H = 2000;

  const PLACES = {
    village: { x: 200, y: 2040, name: "Ngõ làng" },
    gate: { x: 200, y: 1850, name: "Cổng nghĩa địa" },
    bamboo: { x: 95, y: 1490, name: "Bụi tre" },
    graves: { x: 222, y: 1065, name: "Giữa các ngôi mộ" },
    gao: { x: 150, y: 625, name: "Gốc cây gạo" },
    hermitage: { x: 205, y: 300, name: "Tịnh thất" },
  };
  const UNNAMED = { x: 262, y: 1032 };
  const SPAWN = {
    monk: { x: 200, y: 2200 },
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

  // ---------- day / night palette ----------
  // Night colours are the base. In daytime everything blends toward a bright, saturated palette:
  // green grass, brown earth path, light stone graves, green leaves, red-tiled roofs.
  const NIGHT = { ...COLORS };
  const DAY = {
    ground: "#6aa84f", groundEdge: "#4f8a3c", path: "#b69b6c", pathInner: "#cbb386",
    grave: "#b8b3a1", graveFace: "#d2cebd", mound: "#8c6b45", moundTop: "#6fae4a",
    bamboo: "#7fb653", leaf: "#4f9a3e", trunk: "#6b4f36", canopy: "#3f9a3c", flower: "#d4536a",
  };
  // literal night colours used inside draw functions -> their day equivalents
  const DAY_MAP = {
    "#1c2720": "#3f8c30", "#212b26": "#8a6b45", "#2b3a31": "#5ea646", "#16201b": "#3f7a2f", "#17201b": "#5fb34a",
    "#3a3f3a": "#b3ae9d", "#474d47": "#c9c4b2", "#353a35": "#a39e8c", "#2a2e2a": "#b04a35",
    "#2a2f2b": "#e6d7b0", "#101513": "#3a2f24", "#1e2320": "#b04a35",
    "#1a201d": "#b9ad92", "#0a0e0d": "#2b2218", "#222a26": "#8b5a3c",
    "#262b28": "#eadcb8", "#1a1f1c": "#c0553b",
  };
  const GRAVE_DAY = [["#c9c4b2", "#e0dccb"], ["#a9b3a0", "#c5cfba"], ["#d3c6a8", "#e6dcc2"], ["#a7adb0", "#c3c9cc"]];
  let dayMix = 0;
  const hexCache = new Map();
  function hexToRgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function lerpHex(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  function pal(hex) {
    const day = DAY_MAP[hex];
    if (!day || dayMix < 0.003) return hex;
    let c = hexCache.get(hex);
    if (!c) { c = lerpHex(hex, day, dayMix); hexCache.set(hex, c); }
    return c;
  }
  function applyDay() {
    hexCache.clear();
    for (const k of Object.keys(DAY)) COLORS[k] = lerpHex(NIGHT[k], DAY[k], dayMix);
  }

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
  const grassPatches = [];
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
    decor.push({ kind: "gao", x: 128, y: 618 });
    for (const [x, y] of [[332, 520], [58, 860], [352, 890], [300, 330], [70, 300], [360, 1250], [30, 1180]]) {
      decor.push({ kind: "tree", x, y, s: 0.7 + r() * 0.5 });
    }
    decor.push({ kind: "gate", x: 200, y: 1795 });
    decor.push({ kind: "ruin", x: 335, y: 1300 });
    decor.push({ kind: "shrine", x: 205, y: 262 });
    decor.push({ kind: "sign", x: 206, y: 585 });
    for (const [x, y] of [[78, 1975], [325, 1962], [52, 2110], [318, 2135], [92, 2290], [340, 2310]]) decor.push({ kind: "house", x, y });
    for (const [x, y] of [[20, 2050], [372, 2060], [140, 2200], [258, 2240], [30, 2380], [380, 2420]]) decor.push({ kind: "tree", x, y, s: 0.8 + r() * 0.4 });
    for (const [cx, cy, n] of [[255, 2060, 5], [120, 2380, 6]]) for (let i = 0; i < n; i++) decor.push({ kind: "bamboo", x: cx + (r() - 0.5) * 36, y: cy + (r() - 0.5) * 24, h: 60 + r() * 45, lean: (r() - 0.5) * 0.3, seed: r() * 10 });
    for (let i = 0; i < 520; i++) tufts.push({ x: r() * W, y: r() * H, s: 0.6 + r() * 0.9, h: Math.floor(r() * 1000) });
    for (let i = 0; i < 110; i++) grassPatches.push({ x: r() * W, y: r() * 2500, rx: 30 + r() * 60, ry: 12 + r() * 22, c: r() < 0.5 ? "120,190,70" : "60,130,50" });
  })();

  // Shift everything authored in the original 400-wide space to the middle of the wider world,
  // then fill both wings with extra scenery.
  (function widenWorld() {
    PATH.forEach((p) => { p[0] += SHIFT; });
    Object.values(PLACES).forEach((p) => { p.x += SHIFT; });
    UNNAMED.x += SHIFT;
    Object.values(SPAWN).forEach((p) => { p.x += SHIFT; });
    decor.forEach((d) => { d.x += SHIFT; });
    const r = rng(23);
    const wings = [[14, SHIFT - 14], [W - SHIFT + 14, W - 14]];
    const near = (x, y, d, kind) => decor.some((o) => (!kind || o.kind === kind) && Math.hypot(o.x - x, o.y - y) < d);
    for (const [x0, x1] of wings) {
      let n = 0, tries = 0;
      while (n < 26 && tries < 2000) {            // graves
        tries++;
        const x = x0 + r() * (x1 - x0), y = 700 + r() * 760;
        if (near(x, y, 26, "grave")) continue;
        decor.push({ kind: "grave", type: Math.floor(r() * 4), x, y, s: 0.8 + r() * 0.5, incense: r() < 0.06 });
        n++;
      }
      for (let i = 0; i < 6; i++) { // trees
        const x = x0 + r() * (x1 - x0), y = 250 + r() * 1500;
        if (!near(x, y, 60, "tree")) decor.push({ kind: "tree", x, y, s: 0.7 + r() * 0.5 });
      }
      const cx = x0 + (x1 - x0) * (0.3 + r() * 0.4), cy = 1380 + r() * 260; // a bamboo grove
      for (let i = 0; i < 8; i++) decor.push({ kind: "bamboo", x: cx + (r() - 0.5) * 50, y: cy + (r() - 0.5) * 34, h: 60 + r() * 55, lean: (r() - 0.5) * 0.35, seed: r() * 10 });
    }
    // extra houses and trees around the village on both sides
    for (const [x, y] of [[44, 2060], [596, 2090], [30, 2220], [610, 2240]]) decor.push({ kind: "house", x, y });
    for (const [x, y] of [[110, 2330], [530, 2350], [60, 2150], [580, 2170]]) decor.push({ kind: "tree", x, y, s: 0.8 + r() * 0.4 });
  })();

  const fog = Array.from({ length: 7 }, (_, i) => ({ x: Math.random() * W, y: i / 7, rx: 120 + Math.random() * 120, ry: 26 + Math.random() * 20, v: 3 + Math.random() * 5 }));
  const fireflies = Array.from({ length: 14 }, () => ({ x: 30 + Math.random() * (W - 60), y: 700 + Math.random() * 900, p: Math.random() * 6.28, v: 0.4 + Math.random() * 0.6 }));

  // A black owl crosses the sky now and then and hoots once mid-flight.
  const owl = { on: false, x: 0, y: 0, dir: 1, hooted: false, wait: 10 + Math.random() * 8, phase: 0 };
  function updateOwl(dt) {
    if (shownDark < 0.5) { owl.on = false; if (owl.wait < 8) owl.wait = 8; return; } // owls only fly at night
    if (!owl.on) {
      if (!view.role || shownDark < 0.5) return;
      owl.wait -= dt;
      if (owl.wait > 0) return;
      owl.on = true; owl.hooted = false;
      owl.dir = Math.random() < 0.5 ? 1 : -1;
      owl.x = owl.dir > 0 ? camX - 30 : camX + viewW + 30;
      owl.yRel = 0.1 + Math.random() * 0.16;
      return;
    }
    owl.x += owl.dir * 46 * dt;
    owl.phase += dt;
    const owlU = (owl.x - camX) / viewW;
    if (!owl.hooted && owlU > 0.38 && owlU < 0.62) {
      owl.hooted = true;
      window.dispatchEvent(new CustomEvent("owl", { detail: { pan: owlU * 2 - 1 } }));
    }
    if (owlU < -0.1 || owlU > 1.1) { owl.on = false; owl.wait = 28 + Math.random() * 30; }
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

  // Ambient ghost bots: rare, only at night, only in the graveyard stretch of the map.
  // "rise" ghosts form at a grave and fade away; "pass" ghosts drift across and vanish.
  const GY = { y0: 620, y1: 1280, x0: 40, x1: 600 };
  const bots = [];
  let botWait = 14 + Math.random() * 12;
  function updateBots(dt) {
    for (const b of bots) {
      b.age += dt;
      b.phase += dt;
      if (b.type === "pass") { b.x += b.vx * dt; b.y += Math.sin(b.age * 0.9 + b.seed) * 4 * dt; }
      else { b.y -= 3.5 * dt; b.x += Math.sin(b.age * 0.8 + b.seed) * 5 * dt; }
    }
    for (let i = bots.length - 1; i >= 0; i--) if (bots[i].age > bots[i].life) bots.splice(i, 1);
    const night = view.role && shownDark >= 0.5;
    if (!night || bots.length >= 2) return;
    botWait -= dt;
    if (botWait > 0) return;
    // only conjure one where the player can see it, inside the graveyard zone
    const y0 = Math.max(GY.y0, camY + 60), y1 = Math.min(GY.y1, camY + viewH - 60);
    if (y1 <= y0) { botWait = 4; return; }
    const seed = Math.random() * 10;
    if (Math.random() < 0.55) {
      const graves = decor.filter((d) => d.kind === "grave" && d.y > y0 && d.y < y1 && d.x > GY.x0 && d.x < GY.x1);
      if (graves.length) {
        const g = graves[Math.floor(Math.random() * graves.length)];
        bots.push({ type: "rise", x: g.x, y: g.y - 6, age: 0, life: 6 + Math.random() * 4, phase: Math.random() * 6, seed });
        botWait = 35 + Math.random() * 50;
        return;
      }
    }
    const dir = Math.random() < 0.5 ? 1 : -1;
    bots.push({ type: "pass", x: dir > 0 ? GY.x0 - 10 : GY.x1 + 10, y: y0 + Math.random() * (y1 - y0), vx: dir * (22 + Math.random() * 14), age: 0, life: 7 + Math.random() * 5, phase: Math.random() * 6, seed });
    botWait = 35 + Math.random() * 50;
  }
  const botAlpha = (b) => Math.max(0, Math.min(1, b.age / 1.6, (b.life - b.age) / 2.2)) * 0.55;

  // Daytime: butterflies wander over the grass instead of fireflies.
  const BUTTERFLY = ["#f6c335", "#ffffff", "#ff8a3d", "#f29ac0"];
  function drawButterflies() {
    const a = Math.min(1, (dayMix - 0.4) / 0.4);
    fireflies.forEach((f, i) => {
      if (i % 2) return;
      const bx = f.x + Math.sin(f.p * 0.9 + i) * 40;
      const by = f.y + Math.cos(f.p * 0.6) * 24 + Math.sin(f.p * 3) * 3;
      if (by < camY - 20 || by > camY + viewH + 20) return;
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(time * 9 + i));
      ctx.globalAlpha = a;
      ctx.fillStyle = BUTTERFLY[(i / 2) % 4 | 0];
      ctx.beginPath(); ctx.ellipse(bx - 2.2 * flap, by, 2.6 * flap, 2.2, -0.5, 0, Math.PI * 2); ctx.ellipse(bx + 2.2 * flap, by, 2.6 * flap, 2.2, 0.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3a2a1a"; ctx.fillRect(bx - 0.4, by - 2, 0.8, 4);
      ctx.globalAlpha = 1;
    });
  }

  // Speech bubbles above heads (nearby chat). key: "me" or a player's public id.
  const bubbles = new Map();
  function say(key, text, role) { bubbles.set(key, { text, role, t: 0, life: Math.min(10, 4.5 + text.length * 0.07) }); }
  function updateBubbles(dt) { for (const [k, b] of bubbles) { b.t += dt; if (b.t > b.life) bubbles.delete(k); } }
  function wrapText(text, maxW) {
    const words = text.split(" "), lines = []; let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(test).width > maxW) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 4);
  }
  function drawBubble(b, x, y) {
    ctx.font = '500 9.5px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = "center";
    const lines = wrapText(b.text, 112);
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 12, h = lines.length * 12 + 8;
    const bx = Math.max(camX + 6, Math.min(camX + viewW - 6 - w, x - w / 2)), by = y - h - 6;
    const a = Math.min(1, b.t / 0.25, (b.life - b.t) / 0.8);
    const rc = b.role === "monk" ? "208,138,77" : b.role === "villager" ? "230,197,111" : "120,215,190";
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = dayMix > 0.5 ? "rgba(255,252,240,0.96)" : "rgba(12,20,18,0.92)";
    ctx.strokeStyle = `rgba(${rc},0.9)`; ctx.lineWidth = 1;
    const r = 6;
    ctx.beginPath();
    ctx.moveTo(bx + r, by); ctx.lineTo(bx + w - r, by); ctx.quadraticCurveTo(bx + w, by, bx + w, by + r);
    ctx.lineTo(bx + w, by + h - r); ctx.quadraticCurveTo(bx + w, by + h, bx + w - r, by + h);
    ctx.lineTo(Math.min(bx + w - r, x + 4), by + h); ctx.lineTo(x, by + h + 5); ctx.lineTo(Math.max(bx + r, x - 4), by + h);
    ctx.lineTo(bx + r, by + h); ctx.quadraticCurveTo(bx, by + h, bx, by + h - r);
    ctx.lineTo(bx, by + r); ctx.quadraticCurveTo(bx, by, bx + r, by); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = dayMix > 0.5 ? "#20301c" : "#ece6d6";
    lines.forEach((l, i) => ctx.fillText(l, bx + w / 2, by + 12 + i * 12));
    ctx.globalAlpha = 1;
  }

  // Things left lying around that the player can walk to and pick over (set by the app).
  let finds = [];
  function setFinds(list) { finds = list; }
  const FIND_TINT = { monk: "208,138,77", ghost: "159,210,193", villager: "230,197,111", any: "200,205,205" };
  function drawFinds() {
    for (const f of finds) {
      if (f.y < camY - 30 || f.y > camY + viewH + 30) continue;
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.2 + f.x);
      const c = FIND_TINT[f.role] || FIND_TINT.any;
      const g = ctx.createRadialGradient(f.x, f.y - 4, 0, f.x, f.y - 4, 15);
      g.addColorStop(0, `rgba(${c},${0.55 + 0.3 * pulse})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y - 4, 15, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${c},0.95)`;
      ctx.beginPath(); ctx.moveTo(f.x, f.y - 8); ctx.lineTo(f.x + 3, f.y - 4); ctx.lineTo(f.x, f.y); ctx.lineTo(f.x - 3, f.y - 4); ctx.closePath(); ctx.fill();
    }
  }

  // A crow: faster, jagged wings, caws harshly a few times while crossing.
  const crow = { on: false, x: 0, y: 0, dir: 1, called: false, wait: 35 + Math.random() * 25, phase: 0, yRel: 0.15 };
  function updateCrow(dt) {
    if (shownDark < 0.5) { crow.on = false; if (crow.wait < 10) crow.wait = 10; return; } // crows too: night only
    if (!crow.on) {
      if (!view.role) return;
      crow.wait -= dt;
      if (crow.wait > 0 || owl.on) return;
      crow.on = true; crow.called = false;
      crow.dir = Math.random() < 0.5 ? 1 : -1;
      crow.x = crow.dir > 0 ? camX - 30 : camX + viewW + 30;
      crow.yRel = 0.08 + Math.random() * 0.25;
      return;
    }
    crow.x += crow.dir * 78 * dt;
    crow.phase += dt;
    const crowU = (crow.x - camX) / viewW;
    if (!crow.called && crowU > 0.3 && crowU < 0.7) {
      crow.called = true;
      window.dispatchEvent(new CustomEvent("crow", { detail: { pan: crowU * 2 - 1, n: 2 + Math.floor(Math.random() * 3) } }));
    }
    if (crowU < -0.1 || crowU > 1.1) { crow.on = false; crow.wait = 55 + Math.random() * 50; }
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
  let camX = 0, viewW = BASE_VIEW_W, baseScale = 1, zoom = 1, zoomTarget = 1;
  let last = 0;
  let time = 0;
  const player = { x: SPAWN.monk.x, y: SPAWN.monk.y, tx: null, ty: null, facing: 1, phase: 0, moving: false };
  const others = new Map();
  const ripples = [];
  const view = { lookRange: Infinity, mist: 0.4, hint: false, role: null, pose: null, darkness: 0.75, flags: new Set(), marker: null, nick: "", anchor: 0.55 };
  // The shown darkness eases toward the scene's darkness, so dusk and dawn fade in instead of snapping.
  let shownDark = view.darkness;
  let tapHandler = null;

  function init(canvasEl, onTap) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    shade = document.createElement("canvas");
    sctx = shade.getContext("2d");
    tapHandler = onTap;
    resize();
    window.addEventListener("resize", resize);
    // A short press is a tap; dragging vertically pans the camera so you can look around
    // without moving the character.
    // One finger: tap, or drag to look around. Two fingers: pinch to zoom in and out.
    const pointers = new Map();
    let press = null, pinch = null, gestureMulti = false;
    const pinchDist = () => { const [a, b] = [...pointers.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
    canvas.addEventListener("pointerdown", (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      if (pointers.size === 2) { pinch = { d: pinchDist(), z: zoomTarget }; gestureMulti = true; press = null; return; }
      if (pointers.size === 1) { gestureMulti = false; press = { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, dragged: false, id: e.pointerId }; }
    });
    canvas.addEventListener("pointermove", (e) => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size >= 2) { setZoom(pinch.z * pinchDist() / pinch.d); return; }
      if (!press || e.pointerId !== press.id) return;
      if (!press.dragged && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 8) press.dragged = true;
      if (!press.dragged) return;
      const dx = (e.clientX - press.lastX) / scale, dy = (e.clientY - press.lastY) / scale;
      press.lastX = e.clientX; press.lastY = e.clientY;
      look.on = true; look.idle = 0;
      look.target = clampLook(camY - dy);
      look.targetX = clampLookX(camX - dx);
      camY = look.target; camX = look.targetX;
    });
    const release = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (!press || e.pointerId !== press.id) return;
      const p = press; press = null;
      look.idle = 0;
      if (p.dragged || gestureMulti || e.type === "pointercancel") return;
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left) / scale + camX;
      const wy = (e.clientY - rect.top) / scale + camY;
      if (tapHandler) tapHandler(wx, wy);
    };
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); setZoom(zoomTarget * Math.exp(-e.deltaY * 0.0016)); }, { passive: false });
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);
    requestAnimationFrame(frame);
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    shade.width = canvas.width;
    shade.height = canvas.height;
    baseScale = rect.width / BASE_VIEW_W;
    zoomTarget = clampZoom(zoomTarget);
    applyZoom();
  }
  // Zoom: 1 shows BASE_VIEW_W units across the screen. Zooming out shows more of the wider world,
  // but never more than the world's own width.
  function minZoom() { return Math.max(0.62, BASE_VIEW_W / W); }
  function clampZoom(z) { return Math.max(minZoom(), Math.min(1.8, z)); }
  function setZoom(z) { zoomTarget = clampZoom(z); }
  function zoomBy(f) { setZoom(zoomTarget * f); }
  function applyZoom() {
    const rect = canvas.getBoundingClientRect();
    scale = baseScale * zoom;
    viewW = rect.width / scale;
    viewH = rect.height / scale;
  }

  // ---------- public controls ----------
  function setView(patch) { Object.assign(view, patch); }
  function setPlayer(x, y) { look.on = false; player.x = x; player.y = y; player.tx = null; player.moving = false; camY = clampCam(y - viewH * view.anchor); camX = clampCamX(x - viewW / 2); }
  function walkTo(x, y) {
    player.tx = Math.max(12, Math.min(W - 12, x));
    player.ty = Math.max(60, Math.min(2340, y));
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
  function clampCamX(x) { return Math.max(0, Math.min(W - viewW, x)); }

  // Free look: camera detached from the character. Limited by view.lookRange (per role).
  const look = { on: false, target: 0, targetX: 0, idle: 0, announced: false };
  const LOOK_IDLE_RETURN = 12; // seconds without touching before the camera drifts home
  function homeCam() { return clampCam(player.y - viewH * view.anchor); }
  function homeCamX() { return clampCamX(player.x - viewW / 2); }
  function clampLookX(x) { const c = homeCamX(); return clampCamX(Math.max(c - view.lookRange, Math.min(c + view.lookRange, x))); }
  function clampLook(y) {
    const c = homeCam();
    return clampCam(Math.max(c - view.lookRange, Math.min(c + view.lookRange, y)));
  }
  function lookAt(worldY, worldX) {
    look.on = true; look.idle = 0; look.target = clampLook(worldY - viewH * 0.5);
    look.targetX = worldX == null ? homeCamX() : clampLookX(worldX - viewW / 2);
  }
  function resetLook() { look.on = false; }
  function isLooking() { return look.on; }
  function getMap() {
    const pts = [];
    for (const o of others.values()) pts.push({ x: o.rx, y: o.ry, role: o.role });
    return {
      W, H, PLACES, path: PATH, others: pts, finds: finds.map((f) => ({ x: f.x, y: f.y })), camX, camY, viewW, viewH, zoom,
      player: { x: player.x, y: player.y }, range: view.lookRange, view: view.role,
    };
  }

  // ---------- update ----------
  function update(dt) {
    time += dt;
    shownDark += (view.darkness - shownDark) * Math.min(1, dt * 0.8);
    const dayTarget = Math.max(0, Math.min(1, (0.5 - shownDark) / 0.25));
    if (Math.abs(dayTarget - dayMix) > 0.002) { dayMix += (dayTarget - dayMix) * Math.min(1, dt * 2.2); applyDay(); }
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
    if (Math.abs(zoomTarget - zoom) > 0.0005) { zoom += (zoomTarget - zoom) * Math.min(1, dt * 9); applyZoom(); }
    if (look.on) {
      look.idle += dt;
      if (look.idle > LOOK_IDLE_RETURN) look.on = false;
      else {
        look.target = clampLook(look.target); look.targetX = clampLookX(look.targetX);
        camY += (look.target - camY) * Math.min(1, dt * 5);
        camX += (look.targetX - camX) * Math.min(1, dt * 5);
      }
    }
    if (!look.on) {
      camY += (homeCam() - camY) * Math.min(1, dt * 3);
      camX += (homeCamX() - camX) * Math.min(1, dt * 3);
    }
    camX = clampCamX(camX);
    if (look.on !== look.announced) {
      look.announced = look.on;
      window.dispatchEvent(new CustomEvent("lookchange", { detail: { on: look.on } }));
    }
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
    updateBots(dt);
    updateBubbles(dt);
  }

  // ---------- drawing helpers ----------
  function ellipse(x, y, rx, ry, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
  // Night: a plain dark pool. Day: sun from the upper left, so shadows lean to the lower right.
  function shadow(x, y, rx) {
    if (dayMix > 0.05) ellipse(x + rx * 0.55, y + 2, rx * 1.25, rx * 0.42, `rgba(12,40,14,${0.34 * dayMix})`);
    ellipse(x, y + 1, rx, rx * 0.35, `rgba(0,0,0,${0.35 * (1 - 0.5 * dayMix)})`);
  }

  function drawGround(top, bottom) {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, top, W, bottom - top);
    // edges darker
    const g = ctx.createLinearGradient(0, 0, W, 0);
    const eg = 0.35 * (1 - 0.7 * dayMix);
    g.addColorStop(0, `rgba(0,0,0,${eg})`);
    g.addColorStop(0.18, "rgba(0,0,0,0)");
    g.addColorStop(0.82, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${eg})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, top, W, bottom - top);
    if (dayMix > 0.02) {
      for (const gp of grassPatches) {
        if (gp.y < top - 40 || gp.y > bottom + 40) continue;
        ellipse(gp.x, gp.y, gp.rx, gp.ry, `rgba(${gp.c},${0.22 * dayMix})`);
      }
    }
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
    ctx.strokeStyle = pal("#1c2720");
    ctx.lineWidth = 1;
    for (const t of tufts) {
      if (t.y < top - 10 || t.y > bottom + 10) continue;
      if (distToPath(t.x, t.y) < 14) continue;
      ctx.beginPath();
      ctx.moveTo(t.x - 3 * t.s, t.y); ctx.lineTo(t.x - 1 * t.s, t.y - 5 * t.s);
      ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y - 7 * t.s);
      ctx.moveTo(t.x + 3 * t.s, t.y); ctx.lineTo(t.x + 1.5 * t.s, t.y - 5 * t.s);
      ctx.stroke();
      if (dayMix > 0.3 && t.h % 6 === 0) {
        const fc = ["#f6e05e", "#ffffff", "#f29ac0", "#ff9d4d", "#b79cf0"][t.h % 5];
        ctx.globalAlpha = Math.min(1, dayMix * 1.4 - 0.3);
        ellipse(t.x + 2, t.y - 8 * t.s, 1.9, 1.9, fc);
        ellipse(t.x + 2, t.y - 8 * t.s, 0.7, 0.7, "#e0a020");
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawGrave(d, lights) {
    const s = d.s;
    const { x, y } = d;
    shadow(x, y, 11 * s);
    const keepG = COLORS.grave, keepF = COLORS.graveFace;
    if (dayMix > 0.01) {
      const v = GRAVE_DAY[(d.type + Math.floor(d.x)) % GRAVE_DAY.length];
      COLORS.grave = lerpHex(keepG, v[0], 0.85); COLORS.graveFace = lerpHex(keepF, v[1], 0.85);
    }
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
    COLORS.grave = keepG; COLORS.graveFace = keepF;
    if (dayMix > 0.25) {
      // moss at the base, grass tuft, and a few offerings of flowers
      ellipse(x - 3 * s, y - 1, 7 * s, 2.4 * s, `rgba(70,140,50,${0.55 * dayMix})`);
      ctx.strokeStyle = `rgba(60,130,40,${dayMix})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 7 * s, y); ctx.lineTo(x + 6 * s, y - 5); ctx.moveTo(x + 8 * s, y); ctx.lineTo(x + 9.5 * s, y - 6); ctx.stroke();
      const h = Math.floor(x * 7 + y * 3) % 5;
      if (h < 3) {
        const fc = ["#f6c335", "#ff8a3d", "#f4f1e6"][h];
        ctx.globalAlpha = dayMix;
        ellipse(x - 9 * s, y - 2, 2.2, 1.8, fc); ellipse(x - 11 * s, y - 1, 1.8, 1.5, fc); ellipse(x - 7.5 * s, y - 1, 1.6, 1.4, "#ffd6a0");
        ctx.globalAlpha = 1;
      }
    }
    if (d.incense) drawIncense(x + 8 * s, y - 2, lights, 0.5);
  }

  function drawIncense(x, y, lights, strength) {
    ctx.strokeStyle = "#5a4a3a";
    ctx.lineWidth = 0.8;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.moveTo(x + i * 1.5, y); ctx.lineTo(x + i * 2, y - 9); ctx.stroke();
      const flick = 0.6 + 0.4 * Math.sin(time * 5 + i * 2 + x);
      ellipse(x + i * 2, y - 9, 0.9, 0.9, `rgba(240,150,80,${(0.6 + 0.4 * flick) * (1 - 0.8 * dayMix)})`);
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
    ellipse(x, y - 3, 14, 7, pal("#212b26"));
    ctx.strokeStyle = pal("#2b3a31");
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
    ctx.strokeStyle = pal("#16201b");
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

  // Cây gạo (bông gòn): thân thẳng cao có bạnh rễ, cành mọc ngang theo từng tầng, mùa hoa thì
  // cành trơ lá và đỏ rực hoa. Vẽ sáng hơn nền để thấy rõ từ xa, kể cả ban đêm.
  function drawGao(d) {
    const { x, y } = d;
    const sway = Math.sin(time * 0.6) * 1.2;
    shadow(x, y, 46);
    // fallen flowers on the ground around the roots
    const rp = rng(9);
    for (let i = 0; i < 34; i++) {
      const a = rp() * Math.PI * 2, dist = 14 + rp() * 52;
      ellipse(x + Math.cos(a) * dist, y + 4 + Math.sin(a) * dist * 0.32, 2.2, 1.3, rp() < 0.5 ? "#8e2f25" : "#b2432f");
    }
    const bark = "#4a3f35", barkDark = "#2d2822", barkLight = "#6a5a4b";
    // buttress roots
    ctx.fillStyle = bark;
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 2); ctx.quadraticCurveTo(x - 14, y - 6, x - 9, y - 40);
    ctx.lineTo(x + 9, y - 40); ctx.quadraticCurveTo(x + 14, y - 6, x + 30, y + 2);
    ctx.quadraticCurveTo(x + 8, y - 5, x, y + 3); ctx.quadraticCurveTo(x - 8, y - 5, x - 30, y + 2);
    ctx.fill();
    // trunk
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 38); ctx.lineTo(x - 6.5, y - 150); ctx.lineTo(x + 6.5, y - 150); ctx.lineTo(x + 9, y - 38); ctx.closePath(); ctx.fill();
    // rim light on the left, shade on the right, thorn bumps
    ctx.strokeStyle = barkLight; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x - 8, y - 38); ctx.lineTo(x - 6, y - 148); ctx.stroke();
    ctx.strokeStyle = barkDark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 5, y - 38); ctx.lineTo(x + 4, y - 148); ctx.stroke();
    ctx.fillStyle = barkDark;
    const tb = rng(21);
    for (let i = 0; i < 16; i++) { const by = y - 46 - tb() * 96; ctx.beginPath(); ctx.arc(x + (tb() - 0.5) * 11, by, 1.1, 0, Math.PI * 2); ctx.fill(); }
    // tiers of near-horizontal branches
    const tiers = [
      { by: -78, span: 70, rise: 14 },
      { by: -108, span: 88, rise: 18 },
      { by: -136, span: 60, rise: 16 },
    ];
    ctx.lineCap = "round";
    const fl = rng(5);
    for (const t of tiers) {
      for (const side of [-1, 1]) {
        const ex = x + side * t.span + sway * side, ey = y + t.by - t.rise;
        ctx.strokeStyle = bark; ctx.lineWidth = 4.2;
        ctx.beginPath(); ctx.moveTo(x, y + t.by); ctx.quadraticCurveTo(x + side * t.span * 0.55, y + t.by - 2, ex, ey); ctx.stroke();
        // twigs and flowers along the branch tip
        ctx.lineWidth = 1.6;
        for (let k = 0; k < 4; k++) {
          const u = 0.45 + k * 0.17;
          const tx = x + side * t.span * u + sway * side * u, ty = y + t.by - t.rise * u * u;
          const ux = tx + side * (6 + fl() * 5), uy = ty - (8 + fl() * 8);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ux, uy); ctx.stroke();
          ellipse(ux, uy, 4.4, 3, "#c4432c");
          ellipse(ux + side * 3, uy - 1.5, 3.2, 2.4, "#e0603a");
          ellipse(ux - side * 2, uy + 1.5, 2.6, 2, "#9c3022");
        }
        ellipse(ex, ey - 2, 4.6, 3.2, "#d6502f");
      }
    }
    // crown flowers
    ellipse(x, y - 154, 5, 3.4, "#d6502f"); ellipse(x - 8, y - 150, 3.6, 2.6, "#b2432f"); ellipse(x + 8, y - 151, 3.6, 2.6, "#e0603a");
  }

  function drawTree(d) {
    const { x, y, s } = d;
    shadow(x, y, 16 * s);
    if (dayMix > 0.05) {
      // dappled shade under the crown
      ellipse(x + 16 * s, y + 6 * s, 30 * s, 11 * s, `rgba(15,50,18,${0.24 * dayMix})`);
      ellipse(x + 8 * s, y + 3 * s, 20 * s, 8 * s, `rgba(15,50,18,${0.18 * dayMix})`);
    }
    ctx.fillStyle = COLORS.trunk;
    ctx.fillRect(x - 3 * s, y - 40 * s, 6 * s, 40 * s);
    ellipse(x - 10 * s, y - 48 * s, 18 * s, 13 * s, COLORS.canopy);
    ellipse(x + 10 * s, y - 52 * s, 18 * s, 13 * s, COLORS.canopy);
    ellipse(x, y - 62 * s, 16 * s, 12 * s, pal("#17201b"));
    if (dayMix > 0.05) ellipse(x - 5 * s, y - 66 * s, 9 * s, 6 * s, `rgba(190,240,120,${0.38 * dayMix})`);
  }

  function drawGate(d) {
    const { x, y } = d;
    for (const side of [-1, 1]) {
      shadow(x + side * 42, y, 9);
      ctx.fillStyle = pal("#3a3f3a");
      ctx.fillRect(x + side * 42 - 5, y - 48, 10, 48);
      ctx.fillStyle = pal("#474d47");
      ctx.fillRect(x + side * 42 - 6, y - 52, 12, 5);
    }
    ctx.fillStyle = pal("#353a35");
    ctx.fillRect(x - 50, y - 60, 100, 9);
    ctx.beginPath();
    ctx.moveTo(x - 58, y - 60); ctx.quadraticCurveTo(x, y - 70, x + 58, y - 60); ctx.lineTo(x + 50, y - 66); ctx.quadraticCurveTo(x, y - 74, x - 50, y - 66); ctx.closePath();
    ctx.fillStyle = pal("#2a2e2a"); ctx.fill();
  }

  // Tịnh thất: a small forest hermitage on stilts — thatched roof, plank floor, a bell on a post,
  // and a hanging lantern that glows at night so it can be spotted from the path.
  function drawShrine(d, lights) {
    const { x, y } = d;
    const c = (n, dy) => lerpHex(n, dy, dayMix);
    shadow(x, y, 44);
    // sweeping yard
    ellipse(x, y + 4, 52, 12, c("#1b1914", "#c9b48a"));
    // stilts and floor
    ctx.fillStyle = c("#1d1913", "#6e4a2a");
    for (const px of [-30, -10, 10, 30]) ctx.fillRect(x + px - 2, y - 24, 4, 24);
    ctx.fillStyle = c("#2a241c", "#b58a58");
    ctx.fillRect(x - 36, y - 28, 72, 6);
    // back wall and doorway
    ctx.fillStyle = c("#241f19", "#c9a26a");
    ctx.fillRect(x - 30, y - 56, 60, 28);
    ctx.fillStyle = c("#0b0a08", "#2b1c10");
    ctx.fillRect(x - 8, y - 52, 16, 24);
    // thatched hip roof
    ctx.beginPath();
    ctx.moveTo(x - 48, y - 50); ctx.lineTo(x - 14, y - 84); ctx.lineTo(x + 14, y - 84); ctx.lineTo(x + 48, y - 50); ctx.closePath();
    ctx.fillStyle = c("#3a3220", "#c19a52"); ctx.fill();
    ctx.strokeStyle = c("#241f14", "#8a6a32"); ctx.lineWidth = 1;
    for (let k = -4; k <= 4; k++) { ctx.beginPath(); ctx.moveTo(x + k * 3.4, y - 84); ctx.lineTo(x + k * 10.5, y - 50); ctx.stroke(); }
    ctx.fillStyle = c("#2b261a", "#a98240"); ctx.fillRect(x - 50, y - 52, 100, 4); // eave
    // bell on a post
    const sway = Math.sin(time * 1.4) * 2;
    ctx.fillStyle = c("#1d1913", "#6e4a2a"); ctx.fillRect(x + 54, y - 46, 3, 46);
    ctx.fillRect(x + 42, y - 46, 15, 3);
    ctx.fillStyle = c("#7a6a3a", "#d8b24a");
    ctx.beginPath(); ctx.moveTo(x + 46 + sway, y - 43); ctx.quadraticCurveTo(x + 41 + sway, y - 33, x + 43 + sway, y - 29); ctx.lineTo(x + 51 + sway, y - 29); ctx.quadraticCurveTo(x + 52 + sway, y - 36, x + 47 + sway, y - 43); ctx.fill();
    // hanging lantern
    const lx = x - 22, ly = y - 38 + Math.sin(time * 1.1) * 0.8;
    ctx.strokeStyle = c("#3a3220", "#6e4a2a"); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx, y - 50); ctx.lineTo(lx, ly - 5); ctx.stroke();
    ctx.fillStyle = c(COLORS.lantern, "#f0b04a"); ctx.fillRect(lx - 3, ly - 5, 6, 9);
    if (lights) lights.push({ x: lx, y: ly, r: 95, a: 0.8 });
    // broom leaning on the post
    ctx.strokeStyle = c("#3c3326", "#7a5a30"); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x + 36, y - 6); ctx.lineTo(x + 31, y - 26); ctx.stroke();
    ctx.fillStyle = c("#2f2a1c", "#b89a52"); ctx.beginPath(); ctx.moveTo(x + 30, y - 26); ctx.lineTo(x + 28, y - 30); ctx.lineTo(x + 36, y - 30); ctx.closePath(); ctx.fill();
  }

  // Wooden signpost on the path to the hermitage.
  function drawSign(d) {
    const { x, y } = d;
    const c = (n, dy) => lerpHex(n, dy, dayMix);
    shadow(x, y, 8);
    ctx.fillStyle = c("#2b241b", "#7a5532"); ctx.fillRect(x - 1.5, y - 34, 3, 34);
    ctx.fillStyle = c("#6b5d43", "#d9c38e");
    ctx.beginPath(); ctx.moveTo(x - 26, y - 34); ctx.lineTo(x + 24, y - 34); ctx.lineTo(x + 30, y - 41); ctx.lineTo(x + 24, y - 48); ctx.lineTo(x - 26, y - 48); ctx.closePath(); ctx.fill();
    ctx.fillStyle = c("#1b1710", "#4a3418");
    ctx.font = '600 7.5px "Be Vietnam Pro", system-ui, sans-serif'; ctx.textAlign = "center";
    ctx.fillText("Tịnh thất", x, y - 38.5);
    ctx.beginPath(); ctx.moveTo(x + 18, y - 44); ctx.lineTo(x + 22, y - 41); ctx.lineTo(x + 18, y - 38); ctx.closePath(); ctx.fill();
  }

  // Abandoned house at the graveyard's edge: no light, broken roof, empty doorway.
  function drawRuin(d) {
    const { x, y } = d;
    shadow(x, y, 34);
    ctx.fillStyle = pal("#1a201d");
    ctx.fillRect(x - 28, y - 30, 56, 30);
    ctx.fillStyle = pal("#0a0e0d");
    ctx.fillRect(x - 7, y - 22, 14, 22);
    ctx.fillStyle = pal("#222a26");
    ctx.beginPath();
    ctx.moveTo(x - 34, y - 30); ctx.lineTo(x - 8, y - 48); ctx.lineTo(x + 2, y - 42);
    ctx.lineTo(x + 10, y - 49); ctx.lineTo(x + 34, y - 30); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pal("#0a0e0d"); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x - 2, y - 41); ctx.lineTo(x + 2, y - 34); ctx.lineTo(x - 1, y - 30); ctx.stroke();
  }

  // Cooking smoke curling up from a roof in daytime.
  function drawSmoke(d) {
    for (let i = 0; i < 6; i++) {
      const u = ((time * 0.12 + i / 6 + d.x * 0.01) % 1);
      const sx = d.x + 14 + Math.sin(u * 5 + d.y) * 6 * u;
      const sy = d.y - 48 - u * 46;
      ellipse(sx, sy, 3 + u * 7, 2.4 + u * 5, `rgba(200,200,190,${0.16 * (1 - u)})`);
    }
  }

  function drawHouse(d, lights) {
    const { x, y } = d;
    shadow(x, y, 32);
    ctx.fillStyle = pal("#262b28");
    ctx.fillRect(x - 28, y - 28, 56, 28);
    ctx.beginPath(); ctx.moveTo(x - 34, y - 26); ctx.lineTo(x, y - 48); ctx.lineTo(x + 34, y - 26); ctx.closePath();
    ctx.fillStyle = pal("#1a1f1c"); ctx.fill();
    ctx.fillStyle = COLORS.lantern;
    ctx.globalAlpha = 0.75 - 0.5 * dayMix;
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
    else if (c.role === "ghost") drawGhost(c.x, c.y, c.phase, viewerIsGhost || c.isMe ? 0.9 : 0.66, lights);
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
    ctx.setTransform(k, 0, 0, k, -camX * k, -camY * k);
    drawGround(top - 40, bottom);

    // collect drawables in view, sort by y (base line)
    const items = [];
    for (const d of decor) if (d.y > top - 20 && d.y < bottom + 160) items.push(d);
    for (const [pid, o] of others) items.push({ kind: "char", role: o.role, x: o.rx, y: o.ry, pose: o.pose, phase: o.phase, moving: o.moving, facing: o.x >= o.rx ? 1 : -1, label: o.nick || roleName(o.role), pid });
    for (const b of bots) items.push({ kind: "ghostbot", x: b.x, y: b.y, phase: b.phase, alpha: botAlpha(b) });
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
        case "shrine": drawShrine(it, lights); break;
        case "sign": drawSign(it); break;
        case "house": drawHouse(it, lights); if (shownDark < 0.3) drawSmoke(it); break;
        case "ruin": drawRuin(it); break;
        case "char": drawCharacter(it, lights, viewerIsGhost); break;
        case "ghostbot": drawGhost(it.x, it.y, it.phase, it.alpha, lights); break;
      }
    }

    // drifting fog
    for (const f of fog) {
      const fy = camY + f.y * viewH;
      ellipse(f.x, fy, f.rx * (1 + view.mist * 0.5), f.ry * (1 + view.mist * 0.9), `rgba(200,210,205,${(0.03 + view.mist * 0.075) * (1 - 0.7 * dayMix)})`);
    }

    // darkness with light holes
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.globalCompositeOperation = "source-over";
    sctx.clearRect(0, 0, shade.width, shade.height);
    const dark = viewerIsGhost ? shownDark * 0.72 : shownDark;
    sctx.fillStyle = `rgba(7,14,26,${dark})`;
    sctx.fillRect(0, 0, shade.width, shade.height);
    sctx.globalCompositeOperation = "destination-out";
    for (const l of lights) {
      const sx = (l.x - camX) * k;
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
    if (dayMix < 0.5 && shownDark >= 0.5) {
      // moonlight: a cool wash plus a pale glow from the upper right so the night is dim but readable
      const cw = canvas.width, ch = canvas.height, m = 1 - dayMix * 2;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(40,72,112,${0.085 * m})`;
      ctx.fillRect(0, 0, cw, ch);
      const moon = ctx.createRadialGradient(cw, 0, 0, cw, 0, cw * 1.2);
      moon.addColorStop(0, `rgba(150,185,230,${0.20 * m})`);
      moon.addColorStop(1, "rgba(150,185,230,0)");
      ctx.fillStyle = moon; ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "source-over";
    }
    if (dayMix > 0.02) {
      // sunlight: warm wash, a glow from the upper left and slanting beams through the trees
      const cw = canvas.width, ch = canvas.height;
      ctx.fillStyle = `rgba(255,236,180,${0.07 * dayMix})`;
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = "lighter";
      const sun = ctx.createRadialGradient(0, 0, 0, 0, 0, cw * 1.1);
      sun.addColorStop(0, `rgba(255,224,150,${0.30 * dayMix})`);
      sun.addColorStop(1, "rgba(255,224,150,0)");
      ctx.fillStyle = sun; ctx.fillRect(0, 0, cw, ch);
      for (let i = 0; i < 4; i++) {
        const bx = cw * (0.05 + 0.27 * i) + Math.sin(time * 0.25 + i * 1.7) * 14 * k;
        const bw = cw * 0.1;
        const bg = ctx.createLinearGradient(bx, 0, bx - cw * 0.3, ch);
        bg.addColorStop(0, `rgba(255,240,190,${0.11 * dayMix})`);
        bg.addColorStop(1, "rgba(255,240,190,0)");
        ctx.fillStyle = bg;
        ctx.beginPath(); ctx.moveTo(bx, 0); ctx.lineTo(bx + bw, 0); ctx.lineTo(bx + bw - cw * 0.3, ch); ctx.lineTo(bx - cw * 0.3, ch); ctx.closePath(); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }
    if (viewerIsGhost) {
      ctx.fillStyle = `rgba(70,120,115,${0.10 * (1 - dayMix)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // above darkness: warm glows, fireflies, ripples, labels, marker
    ctx.setTransform(k, 0, 0, k, -camX * k, -camY * k);
    drawFinds();
    drawOwl();
    drawCrow();
    ctx.globalCompositeOperation = "lighter";
    for (const l of lights) {
      if (l.r < 50) continue;
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 0.5);
      g.addColorStop(0, `rgba(230,170,90,${0.10 * l.a * (1 - dayMix)})`);
      g.addColorStop(1, "rgba(230,170,90,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.r * 0.5, 0, Math.PI * 2); ctx.fill();
    }
    if (dayMix < 0.6) {
      for (const f of fireflies) {
        const fx = f.x + Math.sin(f.p) * 14;
        const fy = f.y + Math.cos(f.p * 0.7) * 10;
        if (fy < top || fy > bottom) continue;
        const a = Math.max(0, Math.sin(f.p * 2.3)) * 0.8 * (1 - dayMix / 0.6);
        ellipse(fx, fy, 1.3, 1.3, `rgba(200,240,160,${a})`);
      }
    }
    ctx.globalCompositeOperation = "source-over";
    if (dayMix > 0.4) drawButterflies();

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
      const lift = it.role === "ghost" ? 46 : it.pose === "sit" ? 36 : 44;
      const other = !it.isMe;
      if (other) {
        // another real player: a slowly pulsing ring at their feet so they stand out from ambient ghosts
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.6 + it.x);
        const rc = it.role === "monk" ? "208,138,77" : it.role === "villager" ? "230,197,111" : "120,215,190";
        ctx.strokeStyle = `rgba(${rc},${0.35 + 0.35 * pulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(it.x, it.y + 2, 15 + pulse * 3, 6 + pulse * 1.2, 0, 0, Math.PI * 2); ctx.stroke();
      }
      if (dayMix > 0.5) {
        // daylight: dark text with a pale outline so names read on bright grass
        ctx.lineWidth = 2.6; ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(250,246,230,0.85)";
        ctx.strokeText(it.label, it.x, it.y - lift);
        ctx.fillStyle = it.isMe ? "#20301c" : "rgba(32,48,28,0.8)";
      } else if (other && it.role === "ghost") ctx.fillStyle = "rgba(150,230,205,0.9)";
      else ctx.fillStyle = it.isMe ? "rgba(220,213,197,0.95)" : "rgba(220,213,197,0.75)";
      ctx.fillText(it.label, it.x, it.y - lift);
    }
    for (const it of items) {
      if (it.kind !== "char") continue;
      const b = bubbles.get(it.isMe ? "me" : it.pid);
      if (!b) continue;
      const lift = it.role === "ghost" ? 46 : it.pose === "sit" ? 36 : 44;
      drawBubble(b, it.x, it.y - lift - 8);
    }

    if (view.marker && PLACES[view.marker]) {
      drawMarker(PLACES[view.marker]);
      if (view.hint) drawHint(PLACES[view.marker]);
    }
  }

  // Place-name text: gold at night; dark brown with a pale outline by day.
  function markerText(text, x, y, a) {
    if (dayMix > 0.5) {
      ctx.lineWidth = 2.8; ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(255,250,230,0.9)"; ctx.strokeText(text, x, y);
      ctx.fillStyle = "#5a3a10";
    } else ctx.fillStyle = `rgba(230,197,111,${a})`;
    ctx.fillText(text, x, y);
  }

  // After the player has stood still for a while: chevrons flowing from the character toward the next place.
  function drawHint(target) {
    const dx = target.x - player.x, dy = target.y - player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 70) return;
    const ux = dx / dist, uy = dy / dist, ang = Math.atan2(dy, dx);
    const n = Math.min(6, Math.floor((dist - 40) / 28));
    const flow = (time * 0.9) % 1;
    const day = dayMix > 0.5;
    for (let i = 0; i < n; i++) {
      const d = 34 + (i + flow) * 28;
      if (d > dist - 24) break;
      const fade = Math.min(1, flow + (i === 0 ? 0 : 1)) * (1 - (i + flow) / (n + 0.5)) * 0.95;
      const cx = player.x + ux * d, cy = player.y + uy * d;
      ctx.save();
      ctx.translate(cx, cy); ctx.rotate(ang);
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(-5, -8); ctx.lineTo(4, 0); ctx.lineTo(-5, 8);
      ctx.lineWidth = day ? 6 : 5; ctx.strokeStyle = day ? `rgba(255,250,230,${Math.min(1, fade * 1.2)})` : `rgba(0,0,0,${fade * 0.45})`; ctx.stroke();
      ctx.lineWidth = 3.2; ctx.strokeStyle = day ? `rgba(160,90,0,${Math.min(1, fade * 1.2)})` : `rgba(245,210,110,${Math.min(1, fade * 1.15)})`;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawMarker(p) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    const onTop = p.y < camY + 80;
    const onBottom = p.y > camY + viewH - 140;
    if (!onTop && !onBottom) {
      ctx.strokeStyle = `rgba(230,197,111,${0.5 + 0.4 * pulse})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, 20 + pulse * 4, 9 + pulse * 2, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.font = '500 10px "Be Vietnam Pro", system-ui, sans-serif';
      markerText(p.name, p.x, p.y + 24, 0.9);
      return;
    }
    const ay = onTop ? camY + 96 : camY + viewH - 140;
    const ax = Math.max(camX + 30, Math.min(camX + viewW - 30, p.x));
    const dir = onTop ? -1 : 1;
    ctx.fillStyle = `rgba(230,197,111,${0.6 + 0.35 * pulse})`;
    ctx.beginPath(); ctx.moveTo(ax, ay + dir * 8); ctx.lineTo(ax - 7, ay - dir * 2); ctx.lineTo(ax + 7, ay - dir * 2); ctx.closePath(); ctx.fill();
    ctx.font = '500 10px "Be Vietnam Pro", system-ui, sans-serif';
    markerText(p.name, ax, ay - dir * 12, 0.9);
  }

  function roleName(role) {
    return role && window.ROLE_INFO ? ROLE_INFO[role].name : "";
  }

  return { zoomBy, say, setFinds, lookAt, resetLook, isLooking, getMap, W, H, PLACES, SPAWN, init, setView, setPlayer, walkTo, stop, getPlayer, setOthers, ripple };
})();
