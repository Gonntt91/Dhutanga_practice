// 2.5D interior of the abandoned house: layered flat shapes with pointer/tilt parallax,
// a moonbeam through the broken roof, drifting dust, and objects to examine.
window.Room = (() => {
  const LW = 400, LH = 720; // logical size
  let root, cv, ctx, cap, closeBtn, raf = null, onClose = null, onPhoto = null;
  let px = 0, py = 0, tpx = 0, tpy = 0, t0 = 0, scale = 1, ox = 0, oy = 0;
  let flipped = false, bowlsLifted = false, last = 0;
  let drawerOpen = false, hasWife = false, onLore = null;
  const read = new Set(); // letters read during this visit
  let dust = [];

  // objects: hit boxes in logical coords (before parallax), depth is how much they move.
  const OBJ = [
    { id: "cobweb", x: 12, y: 150, w: 90, h: 80, depth: 0.5 },
    { id: "window", x: 270, y: 170, w: 100, h: 120, depth: 0.5 },
    { id: "chair", x: 40, y: 430, w: 80, h: 130, depth: 1.0 },
    { id: "bowls", x: 140, y: 438, w: 120, h: 46, depth: 1.1 },
    { id: "photo", x: 255, y: 452, w: 60, h: 40, depth: 1.1 },
    { id: "calendar", x: 150, y: 168, w: 56, h: 74, depth: 0.5 },
    { id: "shoe", x: 196, y: 566, w: 40, h: 22, depth: 1.1 },
    { id: "drawer", x: 168, y: 492, w: 124, h: 26, depth: 1.1 },
  ];
  // objects that only exist once the drawer is open
  const DRAWER_OBJ = [
    { id: "letter1", x: 176, y: 506, w: 46, h: 26, depth: 1.1 },
    { id: "letter2", x: 230, y: 508, w: 50, h: 24, depth: 1.1 },
  ];
  const LETTERS = {
    letter1: {
      title: "Thư chưa gửi",
      body: [
        "Hạnh con,",
        "Mẹ đi bán xôi sớm, cơm nguội mẹ để trong chạn, con nhớ ăn. Nếu nước lên thì con cứ ở trên gác, đừng chạy theo mẹ. Mẹ về ngay, mẹ hứa.",
        "Mẹ để ba cái bát úp trên bàn: một cho con, một cho mẹ, một cho ai đi qua nhà mình lúc đói. Nhà mình nghèo, nhưng bát thì bao giờ cũng có một cái dành cho khách.",
        { sign: "Mẹ." },
        { stain: "Tờ giấy có một vệt nước ố vàng ở góc, đã khô từ lâu." },
      ],
      lore: "r_thu1",
    },
    letter2: {
      title: "Phong thư dán kín: “Gửi mẹ Sáu”",
      body: [
        "Mẹ ơi,",
        "Năm nay con lại nấu xôi gấc như mẹ dạy, nấu đúng cái nồi đồng mẹ để lại. Con mang lên đặt ở bậc cửa tịnh thất vì nghe thầy ở đó hay cho người đói ăn. Con không dám ra nghĩa địa, sợ nhìn thấy mộ mẹ là con khóc, mà con khóc thì mẹ lại thương.",
        "Hồi đó cả xóm nuôi con, mỗi nhà một bát cơm. Con trả mãi chưa hết. Ông nhà con khó tính lắm, nhưng ông không biết, trong cái nồi xôi con nấu mỗi năm có phần của ông nữa.",
        "Nếu mẹ còn đứng ở gốc gạo chờ con, thì con ở đây rồi. Mẹ đừng chờ nữa.",
        { sign: "Hạnh." },
      ],
      lore: "r_thu2",
    },
  };
  const TEXT = {
    calendar: "Tờ lịch cũ dừng ở một ngày khoanh đỏ: rằm tháng tám. Bên cạnh có dòng chữ nguệch ngoạc bằng than: “Nước lên. Mẹ về ngay.”",
    shoe: "Dưới gầm bàn có một chiếc dép trẻ con, một chiếc thôi. Chiếc kia chắc đang ở một nơi nào đó ngoài nghĩa địa.",
    drawerShut: "Ngăn kéo bàn kẹt cứng. Kéo mạnh một cái mới ra.",
    drawerOpen: "Trong ngăn kéo có hai lá thư: một tờ giấy gấp đôi đã ố vàng, và một phong thư dán kín.",
    sealed: "Phong thư dán kín, ngoài bì chỉ có dòng chữ “Gửi mẹ Sáu”. Có vẻ chưa đủ duyên để mở. Bạn chưa biết người viết là ai.",
    cobweb: "Mạng nhện dệt xong thì chủ nhà không về nữa. Con nhện không biết, vẫn kiên nhẫn chờ ruồi.",
    window: "Ngoài khung cửa là nghĩa địa. Nhìn từ đây, nó giống một mảnh vườn có nhiều khách ngủ say.",
    chair: "Chiếc ghế gãy một chân, dựa vào tường như người mệt đã đứng lâu.",
    bowls0: "Ba cái bát úp, bụi dày một ngón tay. Có người từng ăn ở đây, đủ ba người.",
    bowls1: "Dưới một cái bát có nắm gạo đã mốc. Ai đó định nấu mà không kịp.",
    photoDown: "Một bức ảnh úp mặt xuống bàn. Có thể lật lên, có thể để yên.",
    photoUp: "Hai người đứng bên cửa: người phụ nữ gánh quang gánh và một bé gái níu vạt áo. Sau ảnh có dòng chữ: “Sáu và Hạnh, trước nước lớn”.",
    hint: "Chạm vào đồ vật để xem. Di chuyển ngón tay để nghiêng góc nhìn.",
  };

  function build() {
    root = document.getElementById("room");
    cv = document.getElementById("room-canvas");
    cap = document.getElementById("room-caption");
    closeBtn = document.getElementById("room-close");
    ctx = cv.getContext("2d");
    closeBtn.addEventListener("click", close);
    document.getElementById("letter-close").addEventListener("click", () => { document.getElementById("room-letter").hidden = true; });
    const move = (e) => {
      const r = cv.getBoundingClientRect();
      tpx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      tpy = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerdown", (e) => { move(e); tap(e); });
    window.addEventListener("deviceorientation", (e) => {
      if (!raf || e.gamma == null) return;
      tpx = Math.max(-1, Math.min(1, e.gamma / 25));
      tpy = Math.max(-1, Math.min(1, (e.beta - 45) / 25));
    });
    window.addEventListener("resize", () => raf && fit());
  }

  function fit() {
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    scale = Math.max(r.width / LW, r.height / LH) * dpr;
    ox = (cv.width - LW * scale) / 2; oy = (cv.height - LH * scale) / 2;
  }

  function open(opts) {
    if (!root) build();
    onClose = opts.onClose; onPhoto = opts.onPhoto; onLore = opts.onLore || null;
    hasWife = !!opts.hasWife; drawerOpen = false; read.clear();
    document.getElementById("room-letter").hidden = true;
    flipped = !!opts.flipped; bowlsLifted = false; px = py = tpx = tpy = 0; t0 = performance.now(); last = t0;
    dust = Array.from({ length: 40 }, () => ({ x: Math.random() * LW, y: 80 + Math.random() * 420, v: 3 + Math.random() * 6, p: Math.random() * 6 }));
    root.hidden = false;
    fit();
    say(TEXT.hint);
    raf = requestAnimationFrame(frame);
  }
  function close() {
    cancelAnimationFrame(raf); raf = null;
    document.getElementById("room-letter").hidden = true;
    root.hidden = true;
    const cb = onClose; onClose = null;
    if (cb) cb({ flipped });
  }
  function say(text) { cap.textContent = text; cap.classList.remove("pulse"); void cap.offsetWidth; cap.classList.add("pulse"); }

  function shift(depth) { return [px * depth * 14, py * depth * 8]; }

  function tap(e) {
    const r = cv.getBoundingClientRect();
    const dpr = cv.width / r.width;
    const lx = ((e.clientX - r.left) * dpr - ox) / scale, ly = ((e.clientY - r.top) * dpr - oy) / scale;
    for (const o of [...OBJ, ...(drawerOpen ? DRAWER_OBJ : [])].reverse()) {
      const [sx, sy] = shift(o.depth);
      if (lx >= o.x + sx && lx <= o.x + o.w + sx && ly >= o.y + sy && ly <= o.y + o.h + sy) { examine(o.id); return; }
    }
  }
  function showLetter(id) {
    const L = LETTERS[id];
    document.getElementById("letter-title").textContent = L.title;
    const body = document.getElementById("letter-body");
    body.replaceChildren();
    for (const part of L.body) {
      const p = document.createElement("p");
      if (typeof part === "string") p.textContent = part;
      else if (part.sign) { p.className = "sign"; p.textContent = part.sign; }
      else { p.className = "stain"; p.textContent = part.stain; }
      body.appendChild(p);
    }
    document.getElementById("room-letter").hidden = false;
    if (onLore && !read.has(id)) onLore(L.lore);
    read.add(id);
  }
  function examine(id) {
    if (id === "drawer") {
      if (!drawerOpen) { drawerOpen = true; say(TEXT.drawerOpen); } else say(TEXT.drawerOpen);
      return;
    }
    if (id === "letter1") return showLetter("letter1");
    if (id === "letter2") { if (hasWife) return showLetter("letter2"); say(TEXT.sealed); return; }
    if (id === "bowls") { say(bowlsLifted ? TEXT.bowls1 : TEXT.bowls0); bowlsLifted = true; return; }
    if (id === "photo") {
      if (!flipped) { flipped = true; if (onPhoto) onPhoto(); say(TEXT.photoUp); }
      else say(TEXT.photoUp);
      return;
    }
    say(TEXT[id]);
  }

  function rect(x, y, w, h, fill, depth = 0) { const [sx, sy] = shift(depth); ctx.fillStyle = fill; ctx.fillRect(x + sx, y + sy, w, h); }
  function poly(pts, fill, depth = 0) {
    const [sx, sy] = shift(depth);
    ctx.fillStyle = fill; ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x + sx, y + sy) : ctx.moveTo(x + sx, y + sy)));
    ctx.closePath(); ctx.fill();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    px += (tpx - px) * Math.min(1, dt * 4); py += (tpy - py) * Math.min(1, dt * 4);
    const time = (now - t0) / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#070a0a"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.setTransform(scale, 0, 0, scale, ox, oy);

    // back wall + planks
    rect(-30, -120, LW + 60, 580, "#1b211f", 0.3);
    ctx.strokeStyle = "rgba(0,0,0,0.35)"; ctx.lineWidth = 1;
    for (let x = -20; x < LW + 30; x += 34) { const [sx] = shift(0.3); ctx.beginPath(); ctx.moveTo(x + sx, -120); ctx.lineTo(x + sx, 460); ctx.stroke(); }
    // broken hole in the roof: night sky
    poly([[130, -40], [260, -40], [245, 40], [200, 28], [160, 52]], "#0c1a24", 0.2);
    // window
    const [wx, wy] = shift(0.5);
    ctx.fillStyle = "#0b1218"; ctx.fillRect(270 + wx, 170 + wy, 100, 120);
    ctx.strokeStyle = "#3a332b"; ctx.lineWidth = 5; ctx.strokeRect(270 + wx, 170 + wy, 100, 120);
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(320 + wx, 170 + wy); ctx.lineTo(320 + wx, 290 + wy); ctx.moveTo(270 + wx, 230 + wy); ctx.lineTo(370 + wx, 230 + wy); ctx.stroke();
    ctx.fillStyle = "rgba(159,210,193,0.5)"; ctx.fillRect(338 + wx, 190 + wy, 3, 3); // far firefly
    // cobweb
    const [cx, cy] = shift(0.5);
    ctx.strokeStyle = "rgba(220,220,210,0.28)"; ctx.lineWidth = 0.8;
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(12 + cx, 150 + cy); ctx.lineTo(12 + cx + 80 * Math.cos(k * 0.38), 150 + cy + 80 * Math.sin(k * 0.38)); ctx.stroke(); }
    for (let r = 20; r <= 70; r += 18) { ctx.beginPath(); ctx.arc(12 + cx, 150 + cy, r, 0, 1.6); ctx.stroke(); }

    // wall calendar with a red-circled date
    const [kx, ky] = shift(0.5);
    ctx.fillStyle = "#cfc3a4"; ctx.fillRect(150 + kx, 168 + ky, 56, 74);
    ctx.fillStyle = "#8a2f25"; ctx.fillRect(150 + kx, 168 + ky, 56, 12);
    ctx.fillStyle = "rgba(60,50,35,0.55)";
    for (let rr = 0; rr < 4; rr++) for (let cc = 0; cc < 5; cc++) ctx.fillRect(156 + cc * 9 + kx, 188 + rr * 12 + ky, 5, 5);
    ctx.strokeStyle = "#b02a20"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(183 + kx, 212 + ky, 7, 0, 7); ctx.stroke();

    // floor with converging planks
    poly([[-60, 460], [LW + 60, 460], [LW + 140, LH + 20], [-140, LH + 20]], "#232a26", 0.8);
    const [fx] = shift(0.8);
    ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1.2;
    for (let i = -4; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(LW / 2 + (i - 2) * 46 + fx, 460); ctx.lineTo(LW / 2 + (i - 2) * 110 + fx, LH + 20); ctx.stroke(); }
    for (let y = 480; y < LH; y += 36 + (y - 460) * 0.15) { ctx.beginPath(); ctx.moveTo(-60 + fx, y); ctx.lineTo(LW + 60 + fx, y); ctx.stroke(); }

    // chair (front-left)
    const [chx, chy] = shift(1.0);
    ctx.fillStyle = "#2f2923";
    ctx.fillRect(48 + chx, 430 + chy, 8, 120); ctx.fillRect(100 + chx, 470 + chy, 8, 80); // back post, front leg (one short)
    ctx.fillRect(48 + chx, 500 + chy, 62, 8); ctx.fillRect(48 + chx, 430 + chy, 40, 7);

    // child's sandal under the table
    const [shx, shy] = shift(1.1);
    ctx.fillStyle = "#4a3a2c"; ctx.beginPath(); ctx.ellipse(214 + shx, 578 + shy, 17, 6, -0.15, 0, 7); ctx.fill();
    ctx.fillStyle = "#6a523c"; ctx.beginPath(); ctx.ellipse(214 + shx, 576 + shy, 11, 3.2, -0.15, 0, 7); ctx.fill();
    // table
    const [tx, ty] = shift(1.1);
    ctx.fillStyle = "#3a3128";
    ctx.fillRect(130 + tx, 480 + ty, 200, 10); ctx.fillRect(140 + tx, 490 + ty, 9, 90); ctx.fillRect(312 + tx, 490 + ty, 9, 90);
    // drawer under the tabletop; open it and two letters peek out
    ctx.fillStyle = "#2e261d"; ctx.fillRect(168 + tx, 490 + ty, 124, drawerOpen ? 36 : 24);
    ctx.fillStyle = "#1b150f"; ctx.fillRect(172 + tx, 494 + ty, 116, drawerOpen ? 28 : 16);
    ctx.fillStyle = "#8a7a5a"; ctx.fillRect(222 + tx, 500 + ty + (drawerOpen ? 20 : 8), 16, 3);
    if (drawerOpen) {
      ctx.fillStyle = "#d9cfae"; ctx.fillRect(176 + tx, 504 + ty, 44, 24);
      ctx.fillStyle = "rgba(90,70,40,0.5)"; for (let q = 0; q < 3; q++) ctx.fillRect(180 + tx, 509 + q * 5 + ty, 34, 1.4);
      ctx.fillStyle = hasWife ? "#e7dcc0" : "#c9c0a4"; ctx.fillRect(232 + tx, 507 + ty, 46, 22);
      ctx.strokeStyle = "rgba(90,70,40,0.6)"; ctx.lineWidth = 1; ctx.strokeRect(232 + tx, 507 + ty, 46, 22);
      ctx.beginPath(); ctx.moveTo(232 + tx, 507 + ty); ctx.lineTo(255 + tx, 520 + ty); ctx.lineTo(278 + tx, 507 + ty); ctx.stroke();
    }
    // three upturned bowls
    ctx.fillStyle = "#6a6358";
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(170 + i * 34 + tx, 480 + ty, 15, Math.PI, 0); ctx.fill(); }
    ctx.fillStyle = "rgba(220,220,210,0.18)"; for (let i = 0; i < 3; i++) ctx.fillRect(158 + i * 34 + tx, 468 + ty, 24, 2); // dust
    // photo
    ctx.save(); ctx.translate(285 + tx, 474 + ty); ctx.rotate(-0.06);
    if (!flipped) { ctx.fillStyle = "#4b4338"; ctx.fillRect(-26, -4, 52, 6); }
    else {
      ctx.translate(0, -26); ctx.rotate(0.08);
      ctx.fillStyle = "#cfc7b2"; ctx.fillRect(-26, -2, 52, 40);
      ctx.fillStyle = "#6a6050"; ctx.fillRect(-22, 2, 44, 28);
      ctx.fillStyle = "#2c2820"; ctx.fillRect(-12, 10, 5, 16); ctx.fillRect(4, 18, 4, 9);
      ctx.beginPath(); ctx.arc(-9.5, 8, 3, 0, 7); ctx.arc(6, 16, 2.4, 0, 7); ctx.fill();
    }
    ctx.restore();
    // glow on interactive objects
    const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
    for (const o of [...OBJ, ...(drawerOpen ? DRAWER_OBJ : [])]) {
      if (o.id === "photo" && flipped) continue;
      if (o.id === "drawer" && drawerOpen) continue;
      const [sx, sy] = shift(o.depth);
      ctx.strokeStyle = `rgba(230,197,111,${0.10 + 0.14 * pulse})`; ctx.lineWidth = 1;
      ctx.strokeRect(o.x + sx, o.y + sy, o.w, o.h);
    }

    // moonbeam through the roof hole onto the table/floor
    ctx.globalCompositeOperation = "lighter";
    const [bx, by] = shift(0.6);
    const g = ctx.createLinearGradient(0, 30, 0, 560);
    g.addColorStop(0, "rgba(150,190,210,0.20)"); g.addColorStop(1, "rgba(150,190,210,0.03)");
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(165 + bx, 40 + by); ctx.lineTo(247 + bx, 40 + by); ctx.lineTo(330 + bx, 560 + by); ctx.lineTo(120 + bx, 560 + by); ctx.closePath(); ctx.fill();
    // dust in the beam
    for (const d of dust) {
      d.p += dt; d.y -= d.v * dt * 0.4; d.x += Math.sin(d.p) * 4 * dt;
      if (d.y < 50) { d.y = 520; d.x = 140 + Math.random() * 120; }
      const [dx, dy] = shift(0.9);
      ctx.fillStyle = `rgba(230,235,230,${0.15 + 0.2 * Math.sin(d.p * 2) ** 2})`;
      ctx.fillRect(d.x + dx, d.y + dy, 1.6, 1.6);
    }
    ctx.globalCompositeOperation = "source-over";
    // vignette
    const v = ctx.createRadialGradient(LW / 2, LH * 0.5, 120, LW / 2, LH * 0.5, 460);
    v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = v; ctx.fillRect(-60, -40, LW + 120, LH + 80);

    raf = requestAnimationFrame(frame);
  }

  return { open, close };
})();
