// Procedural night ambience: wind, crickets, a small bell. No audio files needed.
window.NightAudio = (() => {
  let ctx = null;
  let master = null;
  let cricketTimer = null;

  function start() {
    if (ctx) { ctx.resume(); master.gain.value = 0.9; scheduleCrickets(); return; }
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
  }

  function stop() {
    if (!ctx) return;
    master.gain.value = 0;
    clearTimeout(cricketTimer);
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

  return { start, stop, bell, sigh };
})();
