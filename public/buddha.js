// An illustration of a seated Buddha image (Sakyamuni) drawn with canvas shapes.
// Features follow how such images are usually made: dark tightly curled hair with a raised bun and a small flame
// finial, a dot between the brows, long earlobes, lowered eyes, a gold robe covering both shoulders with a diagonal drape,
// the right hand reaching down to touch the earth and the left palm open in the lap, legs crossed, a round halo
// with a fan of rays behind, seated on a mat of kusa grass.
// Coordinates: x = 0 is the centre, y = 0 is the bottom of the seat, up is negative. The statue is ~350 units tall.
window.Buddha = (() => {
  const SKIN = "#f1c29c", SKIN_SHADE = "#d99a78", HAIR = "#1c2428", HAIR_HI = "#37444a", LIPS = "#c75b4b";

  function robeGradient(g, x0, y0, x1, y1) {
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, "#fff08a"); gr.addColorStop(0.28, "#f2c21a"); gr.addColorStop(0.6, "#d9a012"); gr.addColorStop(1, "#a86f06");
    return gr;
  }
  function fold(g, pts, light) {
    g.strokeStyle = light ? "rgba(255,244,160,0.7)" : "rgba(110,70,0,0.5)";
    g.lineWidth = light ? 3.2 : 2.4; g.lineCap = "round";
    g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) g.quadraticCurveTo(pts[i][0], pts[i][1], pts[i][2], pts[i][3]);
    g.stroke();
  }

  function draw(g, cx, baseY, s, time = 0, opts = {}) {
    g.save();
    g.translate(cx, baseY); g.scale(s, s);
    const flick = 0.85 + 0.15 * Math.sin(time * 7);

    // ---- glow, fan of rays and halo behind the figure
    const glow = g.createRadialGradient(0, -262, 20, 0, -262, 230);
    glow.addColorStop(0, `rgba(255,214,110,${0.38 * flick})`); glow.addColorStop(1, "rgba(255,214,110,0)");
    g.fillStyle = glow; g.fillRect(-260, -520, 520, 560);
    for (let i = 0; i < 44; i++) {
      const a = Math.PI + (i / 43) * Math.PI;
      const a0 = a - 0.026, a1 = a + 0.026;
      const gr = g.createLinearGradient(0, -262, Math.cos(a) * 190, -262 + Math.sin(a) * 190);
      gr.addColorStop(0, "rgba(214,150,40,0.9)"); gr.addColorStop(1, i % 2 ? "rgba(168,104,24,0.85)" : "rgba(232,178,70,0.85)");
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(Math.cos(a0) * 70, -262 + Math.sin(a0) * 70); g.lineTo(Math.cos(a) * (170 + (i % 2) * 22), -262 + Math.sin(a) * (170 + (i % 2) * 22)); g.lineTo(Math.cos(a1) * 70, -262 + Math.sin(a1) * 70); g.closePath(); g.fill();
    }
    g.strokeStyle = `rgba(255,220,110,${0.85 * flick})`; g.lineWidth = 7; g.beginPath(); g.arc(0, -262, 64, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = "rgba(255,244,190,0.55)"; g.lineWidth = 2; g.beginPath(); g.arc(0, -262, 58, 0, Math.PI * 2); g.stroke();

    // ---- seat: a mat of kusa grass
    for (let i = 0; i < 70; i++) {
      const x = -176 + (i / 69) * 352, h = 22 + ((i * 37) % 17), lean = (((i * 53) % 21) - 10) * 0.9;
      g.fillStyle = i % 3 === 0 ? "#b8c43c" : i % 3 === 1 ? "#e2d04a" : "#98b030";
      g.beginPath(); g.moveTo(x - 6, 8); g.lineTo(x + lean, 8 - h); g.lineTo(x + 6, 8); g.closePath(); g.fill();
    }

    // ---- lower robe over the crossed legs
    g.fillStyle = robeGradient(g, -150, -120, 150, 10);
    g.beginPath(); g.moveTo(-168, -10); g.quadraticCurveTo(-176, -74, -118, -104); g.lineTo(118, -104); g.quadraticCurveTo(176, -74, 168, -10); g.quadraticCurveTo(0, 14, -168, -10); g.closePath(); g.fill();
    g.fillStyle = "rgba(255,240,150,0.28)"; g.beginPath(); g.ellipse(-118, -50, 54, 30, -0.15, 0, 7); g.fill(); g.beginPath(); g.ellipse(120, -52, 54, 30, 0.15, 0, 7); g.fill();
    fold(g, [[-150, -30], [-110, -62, -60, -40]], false); fold(g, [[150, -30], [110, -66, 56, -44]], false);
    fold(g, [[-120, -78], [-70, -96, -20, -80]], true); fold(g, [[120, -80], [70, -98, 20, -82]], true);
    // front foot resting on the thigh
    g.fillStyle = SKIN; g.beginPath(); g.ellipse(66, -52, 42, 15, -0.18, 0, 7); g.fill();
    g.fillStyle = SKIN_SHADE; g.beginPath(); g.ellipse(40, -48, 16, 8, -0.18, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,90,60,0.6)"; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(94 + k * 4, -54 - k); g.lineTo(100 + k * 4, -50 - k); g.stroke(); }

    // ---- torso with both shoulders covered
    g.fillStyle = robeGradient(g, -90, -230, 90, -100);
    g.beginPath(); g.moveTo(-110, -104); g.lineTo(-108, -172); g.quadraticCurveTo(-84, -216, -26, -228); g.lineTo(26, -228); g.quadraticCurveTo(84, -216, 108, -172); g.lineTo(110, -104); g.closePath(); g.fill();
    // shoulders
    g.fillStyle = robeGradient(g, -120, -210, 120, -150);
    // neck and V of the neckline
    g.fillStyle = SKIN; g.fillRect(-13, -240, 26, 24);
    g.fillStyle = SKIN_SHADE; g.fillRect(-13, -240, 26, 6);
    g.fillStyle = SKIN; g.beginPath(); g.moveTo(-24, -226); g.lineTo(0, -196); g.lineTo(24, -226); g.closePath(); g.fill();
    g.strokeStyle = "rgba(190,120,80,0.5)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-9, -228); g.quadraticCurveTo(0, -222, 9, -228); g.stroke();
    // the diagonal drape of the outer robe, with folds
    g.fillStyle = "rgba(255,236,120,0.35)";
    g.beginPath(); g.moveTo(-72, -208); g.quadraticCurveTo(10, -188, 96, -112); g.lineTo(70, -104); g.quadraticCurveTo(0, -170, -88, -186); g.closePath(); g.fill();
    fold(g, [[-70, -200], [-6, -176, 80, -118]], true);
    fold(g, [[-82, -184], [-10, -160, 64, -108]], false);
    fold(g, [[-60, -166], [0, -140, 52, -110]], true);
    fold(g, [[40, -214], [64, -190, 78, -150]], false);

    // ---- left arm (right hand touching the earth)
    g.fillStyle = robeGradient(g, -130, -190, -80, -90);
    g.beginPath(); g.moveTo(-108, -196); g.quadraticCurveTo(-136, -150, -128, -108); g.lineTo(-96, -100); g.quadraticCurveTo(-92, -150, -78, -184); g.closePath(); g.fill();
    g.strokeStyle = SKIN; g.lineWidth = 21; g.lineCap = "round"; g.beginPath(); g.moveTo(-112, -108); g.lineTo(-122, -34); g.stroke();
    g.strokeStyle = "rgba(190,120,80,0.45)"; g.lineWidth = 3; g.beginPath(); g.moveTo(-104, -106); g.lineTo(-113, -36); g.stroke();
    g.fillStyle = SKIN; g.beginPath(); g.ellipse(-122, -22, 13, 20, 0.08, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,90,60,0.55)"; g.lineWidth = 1; for (let k = -1; k <= 2; k++) { g.beginPath(); g.moveTo(-126 + k * 5, -12); g.lineTo(-126 + k * 5, -1); g.stroke(); }
    // ---- right arm (open palm in the lap)
    g.fillStyle = robeGradient(g, 80, -190, 130, -90);
    g.beginPath(); g.moveTo(108, -196); g.quadraticCurveTo(138, -150, 126, -112); g.lineTo(96, -108); g.quadraticCurveTo(94, -150, 78, -184); g.closePath(); g.fill();
    g.strokeStyle = SKIN; g.lineWidth = 19; g.beginPath(); g.moveTo(112, -108); g.quadraticCurveTo(80, -96, 38, -88); g.stroke();
    g.fillStyle = SKIN; g.beginPath(); g.ellipse(26, -86, 30, 10, -0.12, 0, 7); g.fill();
    g.strokeStyle = "rgba(150,90,60,0.55)"; g.lineWidth = 1; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(8 + k * 7, -90 + k * 0.5); g.lineTo(2 + k * 7, -82); g.stroke(); }
    g.fillStyle = "rgba(210,120,100,0.5)"; g.beginPath(); g.ellipse(24, -84, 12, 4, -0.12, 0, 7); g.fill();

    // ---- head (scaled up a little from the neck so the face reads well)
    g.save(); g.translate(0, -234); g.scale(1.2, 1.2); g.translate(0, 234);
    g.fillStyle = SKIN_SHADE; g.beginPath(); g.ellipse(-33, -262, 7, 22, 0.05, 0, 7); g.ellipse(33, -262, 7, 22, -0.05, 0, 7); g.fill(); // long ears
    g.fillStyle = SKIN; g.beginPath(); g.ellipse(-32, -264, 6, 20, 0.05, 0, 7); g.ellipse(32, -264, 6, 20, -0.05, 0, 7); g.fill();
    const face = g.createLinearGradient(-30, -290, 30, -226);
    face.addColorStop(0, "#f6cfa9"); face.addColorStop(1, "#e8b08a");
    g.fillStyle = face; g.beginPath(); g.ellipse(0, -258, 29, 37, 0, 0, 7); g.fill();
    // hair: cap, curls, raised bun
    g.fillStyle = HAIR;
    g.beginPath(); g.ellipse(0, -283, 32, 22, 0, Math.PI, 0); g.lineTo(31, -278); g.quadraticCurveTo(0, -292, -31, -278); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(0, -318, 21, 19, 0, 0, 7); g.fill();
    const curls = (cxx, cyy, rx, ry, n, from, to, r) => {
      for (let i = 0; i < n; i++) {
        const a = from + (i / (n - 1)) * (to - from);
        const x = cxx + Math.cos(a) * rx, y = cyy + Math.sin(a) * ry;
        g.fillStyle = HAIR_HI; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
        g.strokeStyle = HAIR; g.lineWidth = 1.4; g.beginPath(); g.arc(x, y, r * 0.55, 0.4, 5.2); g.stroke();
      }
    };
    curls(0, -283, 30, 22, 15, Math.PI, Math.PI * 2, 5.2);
    curls(0, -318, 19, 17, 13, 0, Math.PI * 2, 4.6);
    curls(0, -300, 22, 10, 9, Math.PI * 1.05, Math.PI * 1.95, 4.6);
    g.fillStyle = HAIR_HI; g.beginPath(); g.arc(0, -318, 9, 0, 7); g.fill(); g.strokeStyle = HAIR; g.lineWidth = 1.4; g.beginPath(); g.arc(0, -318, 5, 0.4, 5.2); g.stroke();
    // flame finial
    g.fillStyle = `rgba(255,196,60,${flick})`; g.beginPath(); g.moveTo(0, -352); g.quadraticCurveTo(-6, -340, 0, -334); g.quadraticCurveTo(6, -340, 0, -352); g.fill();
    // brows, lowered eyes, nose, lips, urna
    g.strokeStyle = "#241a14"; g.lineWidth = 2.2; g.lineCap = "round";
    g.beginPath(); g.moveTo(-23, -266); g.quadraticCurveTo(-13, -274, -4, -267); g.stroke();
    g.beginPath(); g.moveTo(23, -266); g.quadraticCurveTo(13, -274, 4, -267); g.stroke();
    g.lineWidth = 1.8; g.beginPath(); g.moveTo(-20, -259); g.quadraticCurveTo(-12, -254, -5, -259); g.stroke();
    g.beginPath(); g.moveTo(20, -259); g.quadraticCurveTo(12, -254, 5, -259); g.stroke();
    g.lineWidth = 1; for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(sx * (8 + k * 5), -257 + k * 0.4); g.lineTo(sx * (8 + k * 5) + sx * 0.8, -253); g.stroke(); }
    g.strokeStyle = "rgba(170,100,70,0.55)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-3, -256); g.quadraticCurveTo(-5, -246, 0, -244); g.quadraticCurveTo(5, -246, 3, -256); g.stroke();
    g.fillStyle = LIPS; g.beginPath(); g.moveTo(-10, -236); g.quadraticCurveTo(0, -232, 10, -236); g.quadraticCurveTo(0, -240, -10, -236); g.fill();
    g.strokeStyle = "rgba(140,50,40,0.6)"; g.lineWidth = 1; g.beginPath(); g.moveTo(-10, -236); g.quadraticCurveTo(0, -234.5, 10, -236); g.stroke();
    g.fillStyle = "#f4f4f4"; g.beginPath(); g.arc(0, -273, 2.6, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(-0.8, -275, 1.4, 1.4);
    g.restore();
    g.restore();
  }

  // Tall hanging-lamp stand with a lotus cup, as often placed beside the image.
  function lampStand(g, x, baseY, s, time, dir) {
    g.save(); g.translate(x, baseY); g.scale(s * dir, s);
    g.strokeStyle = "#d29a2a"; g.lineWidth = 4; g.lineCap = "round";
    g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -230); g.quadraticCurveTo(0, -262, 22, -262); g.lineTo(26, -250); g.stroke();
    g.fillStyle = "#c98a20"; g.beginPath(); g.ellipse(0, -2, 22, 7, 0, 0, 7); g.fill();
    g.fillStyle = "#e3b04a"; g.beginPath(); g.moveTo(14, -250); g.quadraticCurveTo(26, -228, 38, -250); g.closePath(); g.fill();
    const flick = 0.85 + 0.15 * Math.sin(time * 8 + dir);
    g.fillStyle = `rgba(255,205,90,${flick})`; g.beginPath(); g.moveTo(26, -276); g.quadraticCurveTo(21, -264, 26, -256); g.quadraticCurveTo(31, -264, 26, -276); g.fill();
    for (let row = 0; row < 6; row++) {
      const y = -196 + row * 30, w = 16 - row * 0.8;
      g.fillStyle = row % 2 ? "#b8801a" : "#d9a032";
      for (const dx of [-w, 0, w]) { g.beginPath(); g.moveTo(dx, y); g.lineTo(dx + 8, y + 12); g.lineTo(dx, y + 24); g.lineTo(dx - 8, y + 12); g.closePath(); g.fill(); }
    }
    g.restore();
  }

  return { draw, lampStand };
})();
