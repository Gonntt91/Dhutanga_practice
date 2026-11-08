// Thiên cung (vimāna): lớp phủ canvas + hộp thoại. Cần palace.css.
// Palace.open({ host, lines, steps, onEnd })
//   host:  nhãn người nói
//   lines: các dòng thoại, bấm "Tiếp" để sang dòng sau
//   steps: [{ text, choices: [{ label, outcome }] }]; chọn xong gọi onEnd(outcome)
//   outcome === "fade": cung điện tan dần rồi đóng; khác: ánh sáng ấm, chờ bấm "Rời thiên cung".
//   "Rời đi" (góc phải trên) gọi onEnd("leave") rồi đóng.
// Ví dụ:
//   Palace.open({
//     host: "Vị thiên",
//     lines: ["Ánh sáng mở ra một tòa lâu đài trên mây.",
//             "“Chào người lành. Xưa tôi chỉ quét sân chùa làng và thắp một ngọn đèn mỗi tối.”",
//             "“Chừng ấy việc nhỏ mà thành chốn này.”"],
//     steps: [{ text: "Một thiên nữ vội vàng làm đổ nước cam lồ lên áo bạn.",
//               choices: [{ label: "Bực bội, quát lên", outcome: "fade" }, { label: "Cười xòa, không sao", outcome: "stay" }] }],
//     onEnd: (outcome) => {},
//   });
// Cũng có Palace.isOpen(), Palace.close() (đóng không gọi onEnd).
window.Palace = (() => {
  const LW = 400, LH = 720;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const reduced = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let root = null, cv, ctx, box, whoEl, textEl, actEl, leaveBtn;
  let raf = null, t0 = 0, scale = 1, ox = 0, oy = 0, opts = null;
  let ended = false, endKind = null, endT = 0, glow = 0, fade = 0, closeTimer = null, onResize = null;
  let queue = [], qi = 0, flowers = [], lights = [], stars = [];

  // bộ sinh số giả ngẫu nhiên cố định để khung hình tĩnh ổn định
  function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
  function seedScene() {
    const r = rng(7);
    stars = Array.from({ length: 70 }, () => ({ x: r() * LW, y: r() * 330, s: 0.5 + r() * 1.2, p: r() * 6.28 }));
    lights = Array.from({ length: 26 }, () => ({ x: r() * LW, y: r() * LH, v: 6 + r() * 14, s: 1 + r() * 2.2, p: r() * 6.28 }));
    flowers = Array.from({ length: 22 }, () => ({ x: r() * LW, y: r() * LH, v: 12 + r() * 16, sw: 8 + r() * 14, p: r() * 6.28, s: 5 + r() * 5, rot: r() * 6.28, rv: (r() - 0.5) * 1.2 }));
  }

  // ---------- vẽ ----------
  function roof(g, cx, y, w, h, grad) {
    g.beginPath();
    g.moveTo(cx - w / 2 - 20, y + h - 4);
    g.quadraticCurveTo(cx - w / 2 + 14, y + h + 2, cx - w * 0.26, y + h * 0.55);
    g.quadraticCurveTo(cx - w * 0.08, y + 6, cx, y);
    g.quadraticCurveTo(cx + w * 0.08, y + 6, cx + w * 0.26, y + h * 0.55);
    g.quadraticCurveTo(cx + w / 2 - 14, y + h + 2, cx + w / 2 + 20, y + h - 4);
    g.quadraticCurveTo(cx + w / 2, y + h + 6, cx, y + h + 6);
    g.quadraticCurveTo(cx - w / 2, y + h + 6, cx - w / 2 - 20, y + h - 4);
    g.closePath();
    g.fillStyle = grad; g.fill();
    g.strokeStyle = "rgba(255,243,196,0.8)"; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = "rgba(160,110,40,0.35)"; g.lineWidth = 0.8;
    for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(cx + i * w * 0.05, y + h * 0.35 + Math.abs(i) * 3); g.lineTo(cx + i * w * 0.13, y + h + 3); g.stroke(); }
  }

  function cloud(g, x, y, s, a) {
    g.save(); g.globalAlpha = a;
    const gr = g.createRadialGradient(x, y, 4, x, y, 70 * s);
    gr.addColorStop(0, "rgba(255,244,230,0.95)"); gr.addColorStop(0.6, "rgba(240,205,205,0.45)"); gr.addColorStop(1, "rgba(200,170,210,0)");
    g.fillStyle = gr;
    [[0, 0, 60], [-48, 8, 44], [50, 6, 48], [-86, 16, 30], [92, 14, 32]].forEach(([dx, dy, r]) => { g.beginPath(); g.ellipse(x + dx * s, y + dy * s, r * s, r * 0.45 * s, 0, 0, 6.283); g.fill(); });
    g.restore();
  }

  function flower(g, x, y, s, rot, a) {
    g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = a;
    for (let i = 0; i < 5; i++) {
      g.rotate(1.2566);
      const pg = g.createLinearGradient(0, 0, 0, -s * 1.6);
      pg.addColorStop(0, "#f3d78a"); pg.addColorStop(0.4, "#ffeef0"); pg.addColorStop(1, "#fbd3dc");
      g.fillStyle = pg; g.strokeStyle = "rgba(230,197,111,0.7)"; g.lineWidth = 0.6;
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-s * 0.9, -s * 0.5, -s * 0.7, -s * 1.5, 0, -s * 1.7); g.bezierCurveTo(s * 0.7, -s * 1.5, s * 0.9, -s * 0.5, 0, 0); g.fill(); g.stroke();
    }
    g.fillStyle = "#e6c56f"; g.beginPath(); g.arc(0, 0, s * 0.35, 0, 6.283); g.fill();
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(0, 0, s * 0.14, 0, 6.283); g.fill();
    g.restore();
  }

  function lotus(g, x, y, s, open, t) {
    const sway = Math.sin(t * 0.8 + x) * 0.8;
    g.save(); g.translate(x + sway, y);
    g.fillStyle = "#2d6b55"; g.beginPath(); g.ellipse(-s * 1.2, s * 0.35, s * 1.1, s * 0.3, 0, 0, 6.283); g.fill();
    for (let i = -2; i <= 2; i++) {
      const a = i * 0.42;
      g.save(); g.rotate(a);
      const pg = g.createLinearGradient(0, 0, 0, -s * 1.8);
      pg.addColorStop(0, "#f8cfdc"); pg.addColorStop(1, "#ffffff");
      g.fillStyle = pg; g.strokeStyle = "rgba(240,190,205,0.9)"; g.lineWidth = 0.7;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-s * 0.55 * open, -s * 0.9, 0, -s * 1.8); g.quadraticCurveTo(s * 0.55 * open, -s * 0.9, 0, 0); g.fill(); g.stroke();
      g.restore();
    }
    g.restore();
  }

  function deva(g, cx, by, t) {
    const sw = Math.sin(t * 0.9) * 1.5, br = Math.sin(t * 1.3) * 0.8;
    g.save(); g.translate(cx + sw, by);
    // quầng sáng sau đầu
    const hy = -178 + br;
    const hg = g.createRadialGradient(0, hy, 6, 0, hy, 62);
    hg.addColorStop(0, "rgba(255,243,196,0.85)"); hg.addColorStop(0.5, "rgba(255,225,150,0.3)"); hg.addColorStop(1, "rgba(255,225,150,0)");
    g.fillStyle = hg; g.beginPath(); g.arc(0, hy, 62, 0, 6.283); g.fill();
    g.strokeStyle = "rgba(255,230,150,0.9)"; g.lineWidth = 1.6; g.beginPath(); g.arc(0, hy, 34, 0, 6.283); g.stroke();
    g.strokeStyle = "rgba(255,230,150,0.35)"; g.lineWidth = 1; g.beginPath(); g.arc(0, hy, 40, 0, 6.283); g.stroke();
    // dải lụa bay hai bên
    g.strokeStyle = "rgba(251,211,220,0.75)"; g.lineWidth = 6; g.lineCap = "round";
    for (const d of [-1, 1]) {
      g.beginPath(); g.moveTo(d * 24, -140); g.bezierCurveTo(d * (70 + sw * 3), -110, d * (40 - sw * 2), -50, d * (78 + sw * 4), 0); g.stroke();
    }
    // áo choàng
    const rg = g.createLinearGradient(0, -150, 0, 0);
    rg.addColorStop(0, "#fffaf0"); rg.addColorStop(1, "#e8dcc4");
    g.fillStyle = rg; g.strokeStyle = "rgba(230,197,111,0.85)"; g.lineWidth = 1.3;
    g.beginPath(); g.moveTo(-22, -146 + br);
    g.bezierCurveTo(-30, -110, -44, -50, -56 - sw, 0);
    g.quadraticCurveTo(0, 12, 56 - sw, 0);
    g.bezierCurveTo(44, -50, 30, -110, 22, -146 + br); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = "rgba(190,165,110,0.5)"; g.lineWidth = 0.9;
    for (const x of [-26, -10, 8, 24]) { g.beginPath(); g.moveTo(x * 0.5, -104); g.quadraticCurveTo(x * 1.3, -50, x * 1.6, 2); g.stroke(); }
    // dây thắt và vòng cổ
    g.fillStyle = "#f2b6c4"; g.beginPath(); g.moveTo(-24, -112); g.lineTo(24, -118); g.lineTo(24, -108); g.lineTo(-24, -102); g.closePath(); g.fill();
    g.strokeStyle = "#e6c56f"; g.lineWidth = 2; g.beginPath(); g.arc(0, -142 + br, 15, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
    // tay chắp
    g.fillStyle = "#f1d3b0"; g.strokeStyle = "rgba(160,110,70,0.5)"; g.lineWidth = 0.8;
    g.beginPath(); g.ellipse(0, -112, 8, 14, 0, 0, 6.283); g.fill(); g.stroke();
    // đầu
    g.fillStyle = "#2b1f2e"; g.beginPath(); g.ellipse(0, hy + 2, 21, 23, 0, 0, 6.283); g.fill();
    g.fillStyle = "#f4d9b8"; g.beginPath(); g.ellipse(0, hy + 7, 16, 19, 0, 0, 6.283); g.fill();
    g.fillStyle = "#2b1f2e"; g.beginPath(); g.moveTo(-17, hy + 2); g.quadraticCurveTo(0, hy - 14, 17, hy + 2); g.quadraticCurveTo(0, hy - 4, -17, hy + 2); g.fill();
    g.strokeStyle = "#5a3a2a"; g.lineWidth = 1.2; g.lineCap = "round";
    g.beginPath(); g.arc(-6, hy + 7, 3, 0.2, Math.PI - 0.2); g.stroke(); g.beginPath(); g.arc(6, hy + 7, 3, 0.2, Math.PI - 0.2); g.stroke();
    g.strokeStyle = "#b9726a"; g.beginPath(); g.arc(0, hy + 15, 4, 0.2, Math.PI - 0.2); g.stroke();
    // vương miện
    const cg = g.createLinearGradient(0, hy - 34, 0, hy - 10);
    cg.addColorStop(0, "#fff3c4"); cg.addColorStop(1, "#d3a33f");
    g.fillStyle = cg; g.strokeStyle = "#9a7222"; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(-18, hy - 10); g.lineTo(-17, hy - 24); g.lineTo(-9, hy - 17); g.lineTo(0, hy - 34); g.lineTo(9, hy - 17); g.lineTo(17, hy - 24); g.lineTo(18, hy - 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = "#f2b6c4"; g.beginPath(); g.arc(0, hy - 18, 2.4, 0, 6.283); g.fill();
    g.restore();
  }

  function scene(g, t) {
    // trời đêm xanh thẫm, ánh vàng hồng ở chân trời
    const sky = g.createLinearGradient(0, 0, 0, LH);
    sky.addColorStop(0, "#050a22"); sky.addColorStop(0.45, "#12245a"); sky.addColorStop(0.72, "#4a3a78"); sky.addColorStop(1, "#7a4a6e");
    g.fillStyle = sky; g.fillRect(-60, -60, LW + 120, LH + 120);
    for (const s of stars) { g.globalAlpha = 0.45 + 0.4 * Math.sin(t * 1.3 + s.p); g.fillStyle = "#fff6dc"; g.beginPath(); g.arc(s.x, s.y, s.s * 0.8, 0, 6.283); g.fill(); }
    g.globalAlpha = 1;
    // vầng sáng sau cung điện
    const cx = 200, py = 250;
    const bg = g.createRadialGradient(cx, py, 10, cx, py, 300);
    bg.addColorStop(0, "rgba(255,230,160," + (0.55 + glow * 0.25) + ")"); bg.addColorStop(0.4, "rgba(255,190,150,0.2)"); bg.addColorStop(1, "rgba(255,190,150,0)");
    g.fillStyle = bg; g.fillRect(-60, -60, LW + 120, LH + 120);
    // tia sáng xoay chậm
    g.save(); g.translate(cx, py); g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * 6.283 + t * 0.03 - 1.57, w = 0.07 + 0.03 * Math.sin(t * 0.6 + i);
      g.fillStyle = "rgba(255,228,160,0.07)"; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a - w) * 520, Math.sin(a - w) * 520); g.lineTo(Math.cos(a + w) * 520, Math.sin(a + w) * 520); g.closePath(); g.fill();
    }
    g.restore();

    // mây xa
    cloud(g, 70 + Math.sin(t * 0.1) * 8, 400, 0.8, 0.5); cloud(g, 340 - Math.sin(t * 0.12) * 8, 430, 0.9, 0.5);

    // cung điện (vimāna), nhấp nhô rất nhẹ
    g.save(); g.translate(0, Math.sin(t * 0.7) * 3);
    const gold = g.createLinearGradient(0, 80, 0, 200); gold.addColorStop(0, "#fff3c4"); gold.addColorStop(0.6, "#e6c56f"); gold.addColorStop(1, "#b88a35");
    // bậc thềm
    const base = g.createLinearGradient(0, 340, 0, 388); base.addColorStop(0, "#fffaf0"); base.addColorStop(1, "#d9c9a0");
    g.fillStyle = base; g.strokeStyle = "rgba(230,197,111,0.9)"; g.lineWidth = 1.2;
    g.beginPath(); g.rect(78, 372, 244, 14); g.fill(); g.stroke(); g.beginPath(); g.rect(64, 386, 272, 14); g.fill(); g.stroke();
    // tầng dưới
    g.fillStyle = "rgba(255,226,150,0.35)"; g.fillRect(104, 262, 192, 110);
    const pg = g.createLinearGradient(0, 255, 0, 372); pg.addColorStop(0, "#fffaf0"); pg.addColorStop(1, "#e6d8b0");
    for (const x of [104, 152, 248, 296]) { g.fillStyle = pg; g.fillRect(x - 6, 262, 12, 110); g.strokeStyle = "rgba(230,197,111,0.8)"; g.lineWidth = 1; g.strokeRect(x - 6, 262, 12, 110); g.fillStyle = gold; g.fillRect(x - 9, 258, 18, 7); g.fillRect(x - 9, 368, 18, 5); }
    // ánh sáng trong điện
    const ig = g.createRadialGradient(cx, 320, 4, cx, 320, 60); ig.addColorStop(0, "rgba(255,248,210,0.9)"); ig.addColorStop(1, "rgba(255,230,160,0)");
    g.fillStyle = ig; g.fillRect(158, 266, 84, 104);
    // lan can
    g.strokeStyle = "rgba(230,197,111,0.8)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(104, 350); g.lineTo(296, 350); g.stroke();
    // các mái cong
    roof(g, cx, 200, 230, 52, gold);
    roof(g, cx, 142, 150, 44, gold);
    roof(g, cx, 94, 84, 36, gold);
    g.fillStyle = "#e6c56f"; g.fillRect(cx - 1.5, 62, 3, 34);
    g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(cx, 60, 4, 0, 6.283); g.fill();
    // chuông gió nhỏ ở góc mái
    for (const [x, y] of [[cx - 135, 244], [cx + 135, 244], [cx - 92, 188], [cx + 92, 188]]) { g.fillStyle = "#fff3c4"; g.beginPath(); g.arc(x, y + 4 + Math.sin(t * 2 + x) * 1, 2.4, 0, 6.283); g.fill(); }
    g.restore();

    // mây dưới chân cung
    cloud(g, 120 + Math.sin(t * 0.2) * 6, 430, 1.25, 0.95); cloud(g, 290 - Math.sin(t * 0.17) * 6, 438, 1.35, 0.95); cloud(g, 200, 452, 1.5, 0.9);

    // ao sen
    const pond = g.createLinearGradient(0, 480, 0, LH); pond.addColorStop(0, "#27406e"); pond.addColorStop(1, "#0c1738");
    g.fillStyle = pond; g.beginPath(); g.moveTo(-60, 500); g.quadraticCurveTo(200, 470, 460, 500); g.lineTo(460, LH + 60); g.lineTo(-60, LH + 60); g.fill();
    g.strokeStyle = "rgba(255,230,170,0.25)"; g.lineWidth = 1;
    for (let i = 0; i < 6; i++) { const y = 520 + i * 30, w = 40 + i * 24, x = (i * 97) % 340 + 30; g.beginPath(); g.ellipse(x, y, w * (0.8 + 0.2 * Math.sin(t * 0.6 + i)), 3 + i * 0.6, 0, 0, 6.283); g.stroke(); }
    // bóng cung điện trên nước
    g.save(); g.globalAlpha = 0.18; const rf = g.createLinearGradient(0, 500, 0, 640); rf.addColorStop(0, "#ffe9a8"); rf.addColorStop(1, "rgba(255,233,168,0)");
    g.fillStyle = rf; g.fillRect(150, 500, 100, 140); g.restore();
    [[50, 600, 12, 0.9], [350, 590, 14, 1], [90, 664, 16, 0.8], [320, 668, 15, 1], [190, 690, 12, 0.7], [376, 650, 10, 0.6], [22, 650, 10, 0.7]].forEach(([x, y, s, o]) => lotus(g, x, y, s, o, t));

    // vị thiên
    deva(g, 200, 560, t);

    // đom đóm ngọc bay lên
    g.globalCompositeOperation = "lighter";
    for (const l of lights) {
      const y = ((l.y - t * l.v) % (LH + 40) + LH + 40) % (LH + 40) - 20;
      const x = l.x + Math.sin(t * 0.7 + l.p) * 10;
      const a = (0.35 + 0.35 * Math.sin(t * 1.6 + l.p)) * (0.6 + glow);
      const lg = g.createRadialGradient(x, y, 0, x, y, l.s * 5);
      lg.addColorStop(0, "rgba(255,240,190," + a + ")"); lg.addColorStop(1, "rgba(255,220,150,0)");
      g.fillStyle = lg; g.beginPath(); g.arc(x, y, l.s * 5, 0, 6.283); g.fill();
    }
    g.globalCompositeOperation = "source-over";

    // hoa mạn-đà-la rơi (rơi nhanh hơn khi cung điện tan)
    const speed = 1 + fade * 5;
    for (const f of flowers) {
      const y = ((f.y + t * f.v * speed) % (LH + 40)) - 20;
      const x = f.x + Math.sin(t * 0.8 + f.p) * f.sw;
      flower(g, x, y, f.s, f.rot + t * f.rv, 0.9);
    }

    // tan biến / ấm áp
    if (glow > 0) { const wg = g.createRadialGradient(cx, 300, 20, cx, 300, 460); wg.addColorStop(0, "rgba(255,225,150," + 0.32 * glow + ")"); wg.addColorStop(1, "rgba(255,200,130," + 0.1 * glow + ")"); g.fillStyle = wg; g.fillRect(-60, -60, LW + 120, LH + 120); }
    if (fade > 0) { g.fillStyle = "rgba(5,8,20," + Math.min(1, fade * 0.9) + ")"; g.fillRect(-60, -60, LW + 120, LH + 120); }
  }

  function fit() {
    const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.round(r.width * dpr)); cv.height = Math.max(1, Math.round(r.height * dpr));
    scale = Math.max(r.width / LW, r.height / LH) * dpr;
    ox = (cv.width - LW * scale) / 2; oy = (cv.height - LH * scale) / 2;
  }

  function frame(now) {
    if (!root) return;
    const t = (now - t0) / 1000;
    if (endKind === "glow") glow = Math.min(1, glow + 0.012);
    if (endKind === "fade") fade = Math.min(1, (now - endT) / 2000);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, ox, oy);
    scene(ctx, reduced() ? 3 : t);
    if (!reduced()) raf = requestAnimationFrame(frame); else raf = null;
  }
  const redraw = () => { if (root && reduced()) requestAnimationFrame(frame); };

  // ---------- hội thoại ----------
  function btn(label, cls, fn) { const b = el("button", "palace-btn " + (cls || ""), label); b.type = "button"; b.addEventListener("click", fn); return b; }
  function show(text, actions, row) {
    textEl.textContent = text; textEl.style.animation = "none"; void textEl.offsetWidth; textEl.style.animation = "";
    actEl.replaceChildren(...actions); actEl.className = "palace-actions" + (row ? " row" : "");
    if (actions[0]) actions[0].focus({ preventScroll: true });
  }
  function step() {
    if (!root || ended) return;
    const item = queue[qi];
    if (!item) { finish("leave"); return; }
    if (typeof item === "string") {
      show(item, [btn("Tiếp", "primary", () => { qi++; step(); })], true);
    } else {
      show(item.text, (item.choices || []).map((c) => btn(c.label, "", () => choose(c.outcome))), false);
    }
  }
  function choose(outcome) {
    if (ended) return; ended = true;
    try { opts.onEnd && opts.onEnd(outcome); } catch (e) { console.error(e); }
    if (outcome === "fade") {
      endKind = "fade"; endT = performance.now();
      root.classList.add("fading");
      show("Cung điện tan vào sương, hoa rơi theo gió.", [], true);
      if (reduced()) { fade = 1; redraw(); }
      closeTimer = setTimeout(close, 2100);
    } else {
      endKind = "glow"; if (reduced()) { glow = 1; redraw(); }
      show("Ánh sáng ấm lan ra khắp cung điện. Lòng người này nhẹ đi.", [btn("Rời thiên cung", "primary", close)], true);
    }
  }
  function finish(outcome) {
    if (ended) { close(); return; }
    ended = true;
    try { opts.onEnd && opts.onEnd(outcome); } catch (e) { console.error(e); }
    close();
  }

  function open(o) {
    if (root) close();
    opts = o || {}; ended = false; endKind = null; glow = 0; fade = 0;
    queue = (opts.lines || []).concat(opts.steps || []); qi = 0;
    seedScene();
    root = el("div", "palace"); root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "Thiên cung");
    cv = el("canvas", "palace-canvas"); cv.setAttribute("aria-hidden", "true"); ctx = cv.getContext("2d");
    leaveBtn = btn("Rời đi", "small palace-leave", () => finish("leave"));
    box = el("div", "palace-box");
    whoEl = el("p", "palace-who", opts.host || "Vị thiên");
    textEl = el("p", "palace-text"); textEl.setAttribute("aria-live", "polite");
    actEl = el("div", "palace-actions");
    box.append(whoEl, textEl, actEl);
    root.append(cv, leaveBtn, box);
    (document.getElementById("app") || document.body).appendChild(root);
    fit(); onResize = () => { fit(); redraw(); }; window.addEventListener("resize", onResize);
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
    step();
  }

  function close() {
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    if (raf) cancelAnimationFrame(raf); raf = null;
    if (onResize) window.removeEventListener("resize", onResize); onResize = null;
    if (root) root.remove();
    root = null;
  }

  return { open, close, isOpen: () => !!root };
})();
