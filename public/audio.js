// Procedural night ambience: wind, crickets, a small bell. No audio files needed.
window.NightAudio = (() => {
  let ctx = null;
  let master = null;
  let cricketTimer = null;
  let day = false; // daytime: crickets stay silent
  let night = true; // owls and crows are only heard at night

  function start() {
    if (ctx) { ctx.resume(); master.gain.value = 0.9; loadSamples(); scheduleCrickets(); scheduleFar(); return; }
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
    loadSamples();
    scheduleCrickets();
    scheduleFar();
  }

  function stop() {
    if (!ctx) return;
    master.gain.value = 0;
    clearTimeout(cricketTimer);
    clearTimeout(farTimer);
    clearTimeout(birdTimer);
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
      if (ctx && ctx.state === "running" && !day) chirp(); // daytime: no crickets (real birds instead)
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
  function owlSynth(pan = 0) {
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
  function crowSynth(pan = 0, n = 3) {
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
  function dogSynth() {
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
  function farOwlSynth() {
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

  // Rooster: "ò... ó o o ooo" — rising cry, held note, then a falling, wavering finish.
  function roosterSynth() {
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const notes = [[0, 0.28, 520, 760], [0.34, 0.4, 780, 820], [0.8, 0.22, 700, 640], [1.08, 0.7, 650, 360]];
    notes.forEach(([at, len, f0, f1]) => {
      const osc = ctx.createOscillator(); osc.type = "sawtooth";
      osc.frequency.setValueAtTime(f0, t + at);
      osc.frequency.linearRampToValueAtTime(f1, t + at + len);
      const vib = ctx.createOscillator(); const vg = ctx.createGain(); vib.frequency.value = 9; vg.gain.value = 14;
      vib.connect(vg).connect(osc.frequency);
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1300; bp.Q.value = 1.1;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + at);
      g.gain.linearRampToValueAtTime(0.05, t + at + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
      osc.connect(bp).connect(g).connect(master);
      osc.start(t + at); vib.start(t + at); osc.stop(t + at + len + 0.05); vib.stop(t + at + len + 0.05);
    });
  }
  function setNight(v) { night = !!v; }
  function setDay(v) { const was = day; day = !!v; if (day && !was) scheduleBirds(); }

  // Daytime birdsong from real recordings: one bird at a time, with long quiet gaps.
  let birdTimer = null;
  function scheduleBirds() {
    clearTimeout(birdTimer);
    birdTimer = setTimeout(() => {
      if (!day) return;
      if (ctx && ctx.state === "running") {
        const pick = ["tailorbird", "sparrow", "bulbul", "bulbul", "tailorbird", "robin"][Math.floor(Math.random() * 6)];
        const pan = Math.random() * 1.6 - 0.8;
        if (pick === "robin") { playSample("robin", { gain: 0.22, pan }); if (Math.random() < 0.6) playSample("robin", { gain: 0.16, pan, delay: 1.6 }); }
        else playSample(pick, { gain: 0.2 + Math.random() * 0.1, pan, slice: 5 + Math.random() * 4 });
      }
      scheduleBirds();
    }, 3500 + Math.random() * 9000);
  }

  // ---------- real recordings (public/sounds, see CREDITS.md); synthesis is the fallback ----------
  const SAMPLE_FILES = {
    rooster: "sounds/rooster.mp3", raven: "sounds/raven.mp3", dog: "sounds/dog.mp3", owl: "sounds/owl.mp3",
    tailorbird: "sounds/bird-tailorbird.mp3", sparrow: "sounds/bird-sparrow.mp3",
    bulbul: "sounds/bird-bulbul.mp3", robin: "sounds/bird-robin.mp3",
  };
  const samples = {};
  let samplesRequested = false;
  function loadSamples() {
    if (samplesRequested || !ctx) return;
    samplesRequested = true;
    for (const [name, url] of Object.entries(SAMPLE_FILES)) {
      fetch(url).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then((b) => ctx.decodeAudioData(b))
        .then((buf) => { samples[name] = buf; })
        .catch(() => {});
    }
  }
  function playSample(name, { gain = 0.5, pan = 0, rate = 1, lowpass = 0, delay = 0, slice = 0 } = {}) {
    const buf = samples[name];
    if (!buf || !ctx || ctx.state !== "running") return false;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    let node = src;
    if (lowpass) { const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = lowpass; node.connect(lp); node = lp; }
    const g = ctx.createGain(); node.connect(g); node = g;
    // slice: play only a random piece of a long recording, with soft fade in and out
    let offset = 0, len = buf.duration / rate;
    if (slice && buf.duration > slice + 1) { offset = Math.random() * (buf.duration - slice); len = slice / rate; }
    const t0 = ctx.currentTime + delay;
    if (slice) {
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(gain, t0 + 0.8);
      g.gain.setValueAtTime(gain, t0 + Math.max(0.9, len - 1.2));
      g.gain.linearRampToValueAtTime(0.0001, t0 + len);
    } else g.gain.value = gain;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); node.connect(p); node = p; }
    node.connect(master);
    if (slice) src.start(t0, offset, slice); else src.start(t0);
    return true;
  }
  const rand = (a, b) => a + Math.random() * (b - a);
  function owl(pan = 0) { if (!night) return; if (!playSample("owl", { gain: 0.45, pan, rate: rand(0.95, 1.02) })) owlSynth(pan); }
  function farOwl() { if (!night) return; if (!playSample("owl", { gain: 0.13, pan: rand(-0.8, 0.8), lowpass: 1100, rate: rand(0.93, 0.99) })) farOwlSynth(); }
  function crow(pan = 0, n = 3) { if (!night) return; if (!playSample("raven", { gain: 0.6, pan, rate: rand(0.85, 0.95) })) crowSynth(pan, n); }
  function rooster() { if (!playSample("rooster", { gain: 0.42 })) roosterSynth(); }
  function dog() {
    const pan = rand(-0.8, 0.8);
    if (!playSample("dog", { gain: 0.22, pan, lowpass: 1700, rate: rand(0.9, 1.05) })) return dogSynth();
    // sometimes a second, farther dog answers
    if (Math.random() < 0.5) playSample("dog", { gain: 0.1, pan: -pan, lowpass: 1000, rate: rand(1.1, 1.2), delay: rand(2.4, 3.6) });
  }


  let farTimer = null;
  function scheduleFar() {
    clearTimeout(farTimer);
    farTimer = setTimeout(() => {
      if (ctx && ctx.state === "running") (!night || Math.random() < 0.65 ? dog : farOwl)();
      scheduleFar();
    }, 22000 + Math.random() * 38000);
  }

  return { start, stop, bell, sigh, owl, crow, dog, farOwl, rooster, setDay, setNight };
})();
