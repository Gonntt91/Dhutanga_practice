// Per-character checkpoint of the night in progress (pure logic, no DOM).
// Shaped to grow into a day loop: `day` counts nights; time of day / place / activity can be added later.
window.Progress = (() => {
  const VERSION = 1;
  let seq = 0;
  const newRunId = () => "r" + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 8);
  const strList = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === "string") : []);
  const num = (n, d) => (typeof n === "number" && isFinite(n) ? n : d);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  // The story arc: which chapter this night plays, and how each finished night ended.
  // history entries are { chapter, band, day }; band = index of the ending (0 low max, 1 mid, 2 high).
  const normArc = (arc) => {
    const a = arc && typeof arc === "object" ? arc : {};
    const history = (Array.isArray(a.history) ? a.history : [])
      .filter((h) => h && typeof h.chapter === "string")
      .map((h) => ({ chapter: h.chapter, band: num(h.band, 1), day: num(h.day, 1) }));
    return { chapter: typeof a.chapter === "string" && a.chapter ? a.chapter : "c1", history };
  };

  // start / meterStart / arc override where the night begins (a later chapter); default is the first night
  function create({ role, story, spawn, day, runId, start, meterStart, arc }) {
    return {
      v: VERSION, runId: runId || newRunId(), role, sceneId: start || story.start, meter: typeof meterStart === "number" ? meterStart : story.meterStart,
      arc: normArc(arc),
      found: [], readTonight: [], vars: [], x: spawn.x, y: spawn.y,
      day: day || 1, endedRunId: null, startedAt: Date.now(), savedAt: Date.now(),
    };
  }

  // Structural check against the story; never throws.
  function valid(cp, role, story) {
    try {
      return !!cp && typeof cp === "object" && cp.v === VERSION && cp.role === role && typeof cp.runId === "string" && !!cp.runId &&
        typeof cp.sceneId === "string" && !!story.scenes[cp.sceneId] && typeof cp.meter === "number" && isFinite(cp.meter);
    } catch { return false; }
  }

  // The chapter the next night plays, from the arc so far. Falls back to the story's own start when
  // chapters.js is missing or names a scene this story does not have.
  function nextChapter(role, story, arc, day, opts) {
    try {
      const pick = window.Chapters && window.Chapters.startFor(role, arc, day, { mem: opts && opts.mem, story });
      if (pick && story.scenes[pick.start] && typeof pick.meterStart === "number") return pick;
    } catch {}
    return { chapter: "c1", start: story.start, meterStart: story.meterStart };
  }

  // -> { mode: "resume" | "fresh" | "newnight", cp }
  // opts.mem: account memory keys (Set | Array); the villager's v_alms counts as trust for old saves.
  function decide(cp, role, story, spawn, bounds, opts) {
    let ok = false;
    try { ok = valid(cp, role, story); } catch {}
    if (!ok) return { mode: "fresh", cp: create({ role, story, spawn }) };
    if (cp.endedRunId === cp.runId) {
      const day = Math.max(1, num(cp.day, 1)) + 1;
      let arc = normArc(cp.arc);
      if (!cp.arc) {
        // saved before chapters existed: that night was the original story; read its band from where it ended
        const sc = story.scenes[cp.sceneId];
        const band = sc && sc.endings ? sc.endings.findIndex((e) => cp.meter <= e.max) : -1;
        arc = { chapter: "c1", history: [{ chapter: "c1", band: band < 0 ? 1 : band, day: Math.max(1, num(cp.day, 1)) }] };
      }
      const pick = nextChapter(role, story, arc, day, opts);
      const next = create({ role, story, spawn, day, start: pick.start, meterStart: pick.meterStart, arc: { chapter: pick.chapter, history: arc.history } });
      // what the character was doing while the player was away is shown once on return, then cleared
      if (cp.away && typeof cp.away === "object") next.returnFrom = cp.away;
      // the promise made at the end of this night is kept for the next one only
      const np = cp.nextPromise;
      if (np && typeof np.id === "string" && np.day === cp.day) next.promise = { id: np.id, day: np.day };
      return { mode: "newnight", cp: next };
    }
    const b = bounds || { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    return {
      mode: "resume",
      cp: {
        ...cp,
        meter: clamp(cp.meter, 0, 10), arc: normArc(cp.arc),
        found: strList(cp.found), readTonight: strList(cp.readTonight), vars: strList(cp.vars),
        day: Math.max(1, num(cp.day, 1)),
        x: clamp(num(cp.x, spawn.x), b.minX, b.maxX), y: clamp(num(cp.y, spawn.y), b.minY, b.maxY),
      },
    };
  }

  // Marks the run as finished. `first` is true only the first time for this runId.
  // `band` (index of the ending shown) is written into the arc history together with the chapter and day.
  function complete(cp, band) {
    if (cp.endedRunId === cp.runId) return { first: false, cp };
    const arc = normArc(cp.arc);
    const entry = { chapter: arc.chapter, band: num(band, 1), day: Math.max(1, num(cp.day, 1)) };
    return { first: true, cp: { ...cp, arc: { chapter: arc.chapter, history: [...arc.history, entry] }, endedRunId: cp.runId, savedAt: Date.now() } };
  }

  // live: { sceneId, meter, found, readTonight, x, y, nightVars }
  function snapshot(cp, live) {
    return {
      ...cp, sceneId: live.sceneId, meter: live.meter,
      found: [...live.found], readTonight: [...live.readTonight], vars: [...(live.nightVars || [])],
      x: Math.round(live.x), y: Math.round(live.y), savedAt: Date.now(),
    };
  }

  return { VERSION, newRunId, create, valid, decide, complete, snapshot, normArc };
})();
