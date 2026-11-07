// Village memory (làng có trí nhớ): people in the village remember what the player did for them.
// Deeds live in the character's mind state (Mind.parts.villageState()); the lines are narrative only.
// Pure logic first (testable in a vm sandbox); the on-screen part is in app.js.
window.Village = (() => {
  // {you} = how this person addresses the player. Peers (chị Ba) and elders (sư già) have their own words.
  const YOU = {
    default: { monk: "thầy", villager: "cháu" },
    peer: { monk: "thầy", villager: "bạn" },
    sage: { monk: "con", villager: "con" },
  };

  const DEEDS = {
    granny_herbs: {
      place: "well", npc: "granny", who: "Bà cụ", you: "default",
      lines: {
        recent: [
          "Hôm qua {you} cho bà nắm rau, bà nấu được nồi canh. Nay bà để dành quả chuối.",
          "Nắm rau hôm qua ngọt lắm. Bà còn nhớ mùi canh đến giờ.",
        ],
        mid: [
          "Hôm trước {you} mang rau về cho bà. Lại đây, bà có nước chè.",
          "Mấy bữa trước {you} cho bà nắm rau. Nồi canh ấy cả xóm đều khen.",
        ],
        old: [
          "Dạo nọ {you} hái rau cho bà, chuyện ấy bà chưa quên.",
          "Dạo nọ có nắm rau má của {you}. Đến giờ bà còn thấy ngọt.",
        ],
      },
    },
    tu_herbs: {
      place: "village", npc: "dog", who: "Ông Tư", you: "default",
      lines: {
        recent: [
          "Ông Tư: “Con Vàng nay thấy {you} là vẫy đuôi đấy.”",
          "Ông Tư: “Hôm qua nhận nắm rau của {you}, tôi còn áy náy. Con Vàng thì hết sủa rồi.”",
        ],
        mid: [
          "Ông Tư: “Mấy bữa nay con Vàng hiền hẳn. Chắc nó nhớ {you}.”",
          "Ông Tư: “Hôm trước {you} sang nhà tôi, tôi chưa kịp cảm ơn cho tử tế.”",
        ],
        old: [
          "Ông Tư: “Dạo nọ {you} mang rau sang, giờ con Vàng thấy {you} là chạy ra đón.”",
          "Ông Tư: “Từ dạo ấy con Vàng không sủa ai đi qua ngõ nữa. Tôi vẫn nhớ ơn {you}.”",
        ],
      },
    },
    na_home: {
      place: "village", npc: "mother", who: "Chị Ba", you: "peer",
      lines: {
        recent: [
          "Chị Ba: “Bé Na cứ nhắc mãi người dắt nó về.”",
          "Chị Ba: “Hôm qua về nhà, bé Na ăn hai bát cơm, còn kể chuyện {you} cho cả nhà nghe.”",
        ],
        mid: [
          "Chị Ba: “Hôm trước bé Na vẽ một hình người trên nền đất, bảo là {you}.”",
          "Chị Ba: “Bé Na giờ không dám chạy ra bụi tre nữa. Mà vẫn nhắc {you} hoài.”",
        ],
        old: [
          "Chị Ba: “Dạo nọ {you} dắt bé Na về, nhà tôi không quên đâu.”",
          "Chị Ba: “Bé Na lớn thêm một chút rồi. Nó vẫn hỏi bao giờ {you} ghé chơi.”",
        ],
      },
    },
    peta_fed: {
      place: "graves", npc: "monk", who: "Sư già", you: "sage",
      lines: {
        recent: [
          "Từ hôm {you} dâng bát cơm, bên mộ thấp không còn ai đứng nữa.",
          "Hôm qua thầy đi qua mộ thấp, thấy cỏ xanh hơn. Chắc bà đã yên.",
        ],
        mid: [
          "Mấy hôm nay mộ thấp lặng hẳn. Thầy cứ nghĩ tới bát cơm của {you}.",
          "Hôm trước {you} hồi hướng cùng thầy. Thầy còn nhớ giọng {you} nói “Lành thay”.",
        ],
        old: [
          "Dạo nọ {you} dâng cơm cho bà ngoại. Bên mộ thấp từ đó chỉ còn cỏ và gió.",
          "Chuyện bát cơm dạo nọ, thầy vẫn kể cho người mới đến chùa nghe.",
        ],
      },
    },
    sat_with_monk: {
      place: "graves", npc: "monk", who: "Sư già", you: "sage",
      lines: {
        recent: [
          "Hôm qua {you} ngồi với thầy lâu hơn thầy tưởng. Hôm nay ngồi tiếp nhé?",
          "Chỗ {you} ngồi hôm qua, cỏ còn hơi lõm. Thầy chưa dọn.",
        ],
        mid: [
          "Hôm trước {you} ngồi với thầy, lúc ấy gió cũng dừng lại nghe.",
          "Mấy bữa nay thầy ngồi một mình, thấy thiếu tiếng thở của {you}.",
        ],
        old: [
          "Dạo nọ {you} ngồi với thầy. Thầy còn nhớ dáng ngồi ấy, lưng thẳng, vai thả lỏng.",
          "Dạo nọ {you} ngồi đây, thầy vẫn giữ chỗ cho {you} đến giờ.",
        ],
      },
    },
  };
  const ORDER = Object.keys(DEEDS);

  const hash = (str) => { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const bandOf = (age) => (age <= 1 ? "recent" : age <= 6 ? "mid" : "old");

  // ---------- state (always read from Mind: Mind.reload() swaps it) ----------
  const fallback = { deeds: {}, said: null, save() {} };
  function state() {
    let s = null;
    try { const p = window.Mind && Mind.parts; s = p && p.villageState ? p.villageState() : null; } catch {}
    return s || fallback;
  }
  const isNum = (n) => typeof n === "number" && isFinite(n);

  function record(deedId, day) {
    if (!DEEDS[deedId]) return null;
    const s = state();
    const d = isNum(day) ? day : 1;
    const prev = s.deeds[deedId];
    s.deeds[deedId] = { day: d, count: (prev && isNum(prev.count) ? prev.count : 0) + 1 };
    s.save();
    return s.deeds[deedId];
  }

  // -> { id, text, npc, who, place } or null. Marks the line as said for this night.
  function next(place, day, role) {
    if (role === "ghost" || !isNum(day)) return null; // villagers cannot see a ghost
    const s = state();
    const said = s.said && s.said.day === day && Array.isArray(s.said.ids) ? s.said.ids : [];
    const cands = ORDER.filter((id) => {
      const d = s.deeds[id];
      return DEEDS[id].place === place && d && isNum(d.day) && day - d.day >= 1 && !said.includes(id);
    }).sort((a, b) => s.deeds[b].day - s.deeds[a].day || ORDER.indexOf(a) - ORDER.indexOf(b));
    if (!cands.length) return null;
    const id = cands[0], def = DEEDS[id];
    const variants = def.lines[bandOf(day - s.deeds[id].day)];
    const you = (YOU[def.you] || YOU.default)[role] || (YOU[def.you] || YOU.default).villager;
    const text = variants[hash(day + ":" + id) % variants.length].replace(/\{you\}/g, you);
    s.said = { day, ids: [...said, id] };
    s.save();
    return { id, text, npc: def.npc, who: def.who, place };
  }
  const lineFor = (place, day, role) => { const n = next(place, day, role); return n ? n.text : null; };

  // Places where some deed has been done (for the walking check).
  function places() {
    const s = state();
    return [...new Set(ORDER.filter((id) => s.deeds[id]).map((id) => DEEDS[id].place))];
  }

  return { DEEDS, record, next, lineFor, places, bandOf };
})();
