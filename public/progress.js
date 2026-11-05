// Per-character checkpoint of the night in progress (pure logic, no DOM).
// Shaped to grow into a day loop: `day` counts nights; time of day / place / activity can be added later.
window.Progress = (() => {
  const VERSION = 1;
  let seq = 0;
  const newRunId = () => "r" + Date.now().toString(36) + (seq++).toString(36) + Math.random().toString(36).slice(2, 8);
  const strList = (a) => (Array.isArray(a) ? a.filter((s) => typeof s === "string") : []);
  const num = (n, d) => (typeof n === "number" && isFinite(n) ? n : d);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function create({ role, story, spawn, day, runId }) {
    return {
      v: VERSION, runId: runId || newRunId(), role, sceneId: story.start, meter: story.meterStart,
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

  // -> { mode: "resume" | "fresh" | "newnight", cp }
  function decide(cp, role, story, spawn, bounds) {
    let ok = false;
    try { ok = valid(cp, role, story); } catch {}
    if (!ok) return { mode: "fresh", cp: create({ role, story, spawn }) };
    if (cp.endedRunId === cp.runId) {
      const next = create({ role, story, spawn, day: Math.max(1, num(cp.day, 1)) + 1 });
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
        meter: clamp(cp.meter, 0, 10),
        found: strList(cp.found), readTonight: strList(cp.readTonight), vars: strList(cp.vars),
        day: Math.max(1, num(cp.day, 1)),
        x: clamp(num(cp.x, spawn.x), b.minX, b.maxX), y: clamp(num(cp.y, spawn.y), b.minY, b.maxY),
      },
    };
  }

  // Marks the run as finished. `first` is true only the first time for this runId.
  function complete(cp) {
    if (cp.endedRunId === cp.runId) return { first: false, cp };
    return { first: true, cp: { ...cp, endedRunId: cp.runId, savedAt: Date.now() } };
  }

  // live: { sceneId, meter, found, readTonight, x, y, nightVars }
  function snapshot(cp, live) {
    return {
      ...cp, sceneId: live.sceneId, meter: live.meter,
      found: [...live.found], readTonight: [...live.readTonight], vars: [...(live.nightVars || [])],
      x: Math.round(live.x), y: Math.round(live.y), savedAt: Date.now(),
    };
  }

  return { VERSION, newRunId, create, valid, decide, complete, snapshot };
})();
