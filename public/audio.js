// Procedural night ambience: wind, crickets, a small bell. No audio files needed.
window.NightAudio = (() => {
  let ctx = null;
  let master = null;
  let cricketTimer = null;

  function start() {
    if (ctx) { ctx.resume(); master.gain.value = 0.9; scheduleCrickets(); scheduleFar(); return; }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    // wind: looped brown-ish noise through a low-pass filter
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const wind = ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.18;
    wind.connect(lp).connect(windGain).connect(master);
    wind.start();
    scheduleCrickets();
    scheduleFar();
  }

  function stop() {
    if (!ctx) return;
    master.gain.value = 0;
    clearTimeout(cricketTimer);
    clearTimeout(farTimer);
    ctx.suspend();
  }

  function chirp() {
    const t = ctx.currentTime;
    const pulses = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < pulses; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = 4300 + Math.random() * 300;
      const s = t + i * 0.07;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.025, s + 0.01);
      g.gain.linearRampToValueAtTime(0, s + 0.045);
      osc.connect(g).connect(master);
      osc.start(s);
      osc.stop(s + 0.06);
    }
  }

  function scheduleCrickets() {
    clearTimeout(cricketTimer);
    cricketTimer = setTimeout(() => {
      if (ctx && ctx.state === "running") chirp();
      scheduleCrickets();
    }, 700 + Math.random() * 1800);
  }

  function bell(soft = 1) {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    [[620, 1], [1240, 0.4], [1705, 0.22], [2480, 0.1]].forEach(([freq, amp]) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12 * amp * soft, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
      osc.connect(g).connect(master);
      osc.start(t);
      osc.stop(t + 4.1);
    });
  }

  function sigh() {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const len = 1.8;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
    const d = buffer.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(900, t);
    bp.frequency.linearRampToValueAtTime(380, t + len);
    bp.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 0.5);
    g.gain.linearRampToValueAtTime(0.0001, t + len);
    src.connect(bp).connect(g).connect(master);
    src.start(t);
  }

  // Low owl hoot: "hu-hu... huuu", slight vibrato, panned to where the owl is.
  function owl(pan = 0) {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const out = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (out) { out.pan.value = Math.max(-1, Math.min(1, pan)); out.connect(master); }
    [[0, 0.22, 400, 0.05], [0.36, 0.22, 380, 0.05], [1.0, 0.9, 330, 0.06]].forEach(([at, len, f, amp]) => {
      const osc = ctx.createOscillator();
      const vib = ctx.createOscillator();
      const vg = ctx.createGain();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f * 1.06, t + at);
      osc.frequency.exponentialRampToValueAtTime(f, t + at + len * 0.5);
      vib.frequency.value = 7; vg.gain.value = 5;
      vib.connect(vg).connect(osc.frequency);
      g.gain.setValueAtTime(0.0001, t + at);
      g.gain.linearRampToValueAtTime(amp, t + at + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
      osc.connect(g).connect(out || master);
      osc.start(t + at); vib.start(t + at);
      osc.stop(t + at + len + 0.05); vib.stop(t + at + len + 0.05);
    });
  }

  // Crow: harsh, rasping "kaa!" — sawtooth through distortion and a nasal band-pass,
  // pitch falling, with a noise burst for the rasp. Eerier than the owl on purpose.
  function crow(pan = 0, n = 3) {
    if (!ctx || ctx.state !== "running") return;
    const out = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (out) { out.pan.value = Math.max(-1, Math.min(1, pan)); out.connect(master); }
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) { const x = (i / 128) - 1; curve[i] = Math.tanh(x * 4); }
    let at = ctx.currentTime;
    for (let i = 0; i < n; i++) {
      const len = 0.3 + Math.random() * 0.12;
      const f0 = 520 + Math.random() * 90;
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f0 * 0.8, at);
      osc.frequency.linearRampToValueAtTime(f0, at + 0.04);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.55, at + len);
      const shaper = ctx.createWaveShaper(); shaper.curve = curve;
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1100; bp.Q.value = 1.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.11, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + len);
      osc.connect(shaper).connect(bp).connect(g).connect(out || master);
      osc.start(at); osc.stop(at + len + 0.05);
      // rasp
      const nb = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
      const d = nb.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource(); ns.buffer = nb;
      const nbp = ctx.createBiquadFilter(); nbp.type = "bandpass"; nbp.frequency.value = 1700; nbp.Q.value = 0.9;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, at);
      ng.gain.exponentialRampToValueAtTime(0.07, at + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.0001, at + len);
      ns.connect(nbp).connect(ng).connect(out || master);
      ns.start(at);
      at += len + 0.12 + Math.random() * 0.18;
    }
  }

  // Distant dog: a short run of muffled barks (low-passed so it sounds far away),
  // sometimes answered by a second dog farther off.
  function dogBark(at, base, vol, muffle, pan) {
    const out = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (out) { out.pan.value = pan; out.connect(master); }
    const len = 0.17 + Math.random() * 0.05;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(base * 1.25, at);
    osc.frequency.exponentialRampToValueAtTime(base * 0.7, at + len);
    const f1 = ctx.createBiquadFilter(); f1.type = "bandpass"; f1.frequency.value = 650; f1.Q.value = 2.2;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = muffle;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    osc.connect(f1).connect(lp).connect(g).connect(out || master);
    osc.start(at); osc.stop(at + len + 0.05);
  }
  function dog() {
    if (!ctx || ctx.state !== "running") return;
    const pan = Math.random() * 1.6 - 0.8;
    const run = (start, base, vol, muffle, p) => {
      const n = 3 + Math.floor(Math.random() * 4);
      let at = start;
      for (let i = 0; i < n; i++) { dogBark(at, base + Math.random() * 25, vol, muffle, p); at += 0.34 + Math.random() * 0.2 + (i === n - 2 ? 0.25 : 0); }
      return at;
    };
    const t = ctx.currentTime;
    const end = run(t, 230, 0.07, 900, pan);
    if (Math.random() < 0.5) run(end + 0.5 + Math.random() * 0.6, 300, 0.04, 650, -pan);
  }

  // Occasional far-off owl, quieter than the one that flies over.
  function farOwl() {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    [[0, 0.2, 360], [0.4, 0.2, 340], [1.05, 0.8, 300]].forEach(([at, len, f]) => {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = f;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + at);
      g.gain.linearRampToValueAtTime(0.018, t + at + 0.07);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
      osc.connect(lp).connect(g).connect(master);
      osc.start(t + at); osc.stop(t + at + len + 0.05);
    });
  }

  let farTimer = null;
  function scheduleFar() {
    clearTimeout(farTimer);
    farTimer = setTimeout(() => {
      if (ctx && ctx.state === "running") (Math.random() < 0.65 ? dog : farOwl)();
      scheduleFar();
    }, 22000 + Math.random() * 38000);
  }

  return { start, stop, bell, sigh, owl, crow, dog, farOwl };
})();
