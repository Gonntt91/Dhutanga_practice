// "Gặp" tracker: decides which pairs of characters have been together long enough to count.
// Pure: no I/O and no clock of its own. The caller passes the current peer list and the time.
//
// A pair is "together" while both players are in the same scene, within `range` world units of each
// other, on different accounts and with different characters. Time is summed only while they stay
// together. An observation gap longer than `maxGapMs` restarts the sum. A pair that is not together at
// an update is dropped, so it can be tracked again later. Each pair fires once per stretch together.
//
// Peer items: { key, userId, charId, scene, x, y } with x, y already in world units. Items without a
// userId (guests) or charId are ignored, so guests never count as encounters.

function createTracker(opts = {}) {
  const range = opts.range ?? 150;
  const thresholdMs = opts.thresholdMs ?? 20000;
  const maxGapMs = opts.maxGapMs ?? 3000;
  /** @type {Map<string, {keyA: any, keyB: any, charA: string, charB: string, acc: number, last: number, fired: boolean}>} */
  const pairs = new Map();

  // Returns [charIdA, charIdB] for each pair that has just reached the threshold.
  function update(peerList, nowMs) {
    const list = (Array.isArray(peerList) ? peerList : []).filter(
      (p) => p && p.key != null && p.charId && p.userId && p.scene && Number.isFinite(p.x) && Number.isFinite(p.y));
    const seen = new Set();
    const fired = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.charId === b.charId || a.userId === b.userId || a.scene !== b.scene) continue;
        if (Math.hypot(a.x - b.x, a.y - b.y) > range) continue;
        const [p, q] = String(a.key) < String(b.key) ? [a, b] : [b, a];
        const id = `${p.key}\u0001${q.key}\u0001${p.charId}\u0001${q.charId}`;
        seen.add(id);
        let st = pairs.get(id);
        if (!st) {
          st = { keyA: p.key, keyB: q.key, charA: p.charId, charB: q.charId, acc: 0, last: nowMs, fired: false };
          pairs.set(id, st);
        } else {
          const dt = nowMs - st.last;
          if (dt > maxGapMs) { st.acc = 0; st.fired = false; }
          else if (dt > 0) st.acc += dt;
          st.last = nowMs;
        }
        if (!st.fired && st.acc >= thresholdMs) {
          st.fired = true;
          fired.push([st.charA, st.charB]);
        }
      }
    }
    // Pairs not together at this update are dropped (separation).
    for (const id of [...pairs.keys()]) if (!seen.has(id)) pairs.delete(id);
    return fired;
  }

  // Drop every pair that involves this peer (disconnect, or it left the world).
  function forget(key) {
    for (const [id, st] of pairs) {
      if (st.keyA === key || st.keyB === key) pairs.delete(id);
    }
  }

  return { update, forget };
}

module.exports = { createTracker };
