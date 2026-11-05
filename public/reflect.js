// End-of-night reflection ("Quán xét cuối đêm") and the "Trong lúc vắng" sheet on return.
// Pure helpers first (testable in a vm sandbox), thin DOM code at the bottom.
window.NightReflect = (() => {
  const NIGHT_DONE_RE = /^Đi qua một đêm/;
  const EMPTY_NIGHT = "Một đêm lặng lẽ.";
  const DIARY_MAX = 8;

  const HOOKS = {
    monk: [
      "Mai, sư già hứa kể tiếp chuyện cô bé Hạnh.",
      "Nghe nói hoa sen ở ao sắp nở vào một đêm trăng.",
      "Có tiếng ai đó gõ vào tảng đá sau đồi.",
      "Cây gạo đầu ngõ vừa rụng một chiếc lá lạ.",
      "Trong tịnh thất còn một cuốn kinh chưa ai mở.",
      "Chuông sáng nay ngân lâu hơn mọi khi, không rõ vì sao.",
    ],
    villager: [
      "Mai, bà cụ đầu xóm có chuyện muốn kể.",
      "Có mùi trầm thoảng qua lối mòn lên chùa.",
      "Ai đó để quên một chiếc giỏ nhỏ bên cổng chùa.",
      "Nghe đồn ngoài nghĩa địa có đốm sáng nhỏ lúc gần sáng.",
      "Ao sen sau chùa sắp có bông đầu tiên.",
      "Tiếng tụng kinh đêm nay nghe như vọng lại từ rất xa.",
    ],
    ghost: [
      "Mai, có thể sẽ có người đến thắp một nén nhang.",
      "Bên bờ tường chùa, tiếng kinh nghe rõ hơn một chút.",
      "Có một bông hoa lạ nở cạnh ngôi mộ cũ.",
      "Gió đêm mang theo một cái tên nghe quen quen.",
      "Đốm sáng nhỏ trên đất dường như đang chờ ai đó.",
      "Có tiếng trẻ con khẽ ngân nga đâu đó sau những ngôi mộ.",
    ],
  };

  const ACTIVITIES = {
    monk: [
      { id: "sit", label: "Ngồi thiền dưới cội gạo", doing: "đang ngồi thiền dưới cội gạo" },
      { id: "study", label: "Học thuộc một bài kinh", doing: "đang học thuộc một bài kinh" },
      { id: "walk", label: "Kinh hành quanh tịnh thất", doing: "đang kinh hành quanh tịnh thất" },
      { id: "nolie", label: "Ngồi không nằm suốt đêm", doing: "đang giữ hạnh không nằm" },
    ],
    villager: [
      { id: "cook", label: "Nấu cơm để sáng mai dâng bát", doing: "đang nấu cơm để sáng mai dâng bát" },
      { id: "weave", label: "Dệt vải", doing: "đang ngồi bên khung cửi" },
      { id: "listen", label: "Lên chùa nghe pháp", doing: "đang ngồi nghe pháp trên chùa" },
    ],
    ghost: [
      { id: "wall", label: "Ngồi ngoài tường chùa nghe tụng kinh", doing: "đang ngồi ngoài tường chùa nghe tụng kinh" },
      { id: "tomb", label: "Ngồi yên bên mộ chờ người hồi hướng", doing: "đang ngồi yên bên mộ chờ người hồi hướng" },
    ],
  };

  // Three short variants per activity, picked by runId. Narrative only.
  const AWAY_STORIES = {
    sit: [
      ["Người này ngồi suốt canh ba.", "Hôn trầm đến hai lần, rồi tan.", "Sáng ra có một chiếc lá gạo rơi trên vai."],
      ["Người này ngồi lặng dưới gốc gạo.", "Hơi thở lúc dài lúc ngắn, rồi cũng đều lại.", "Sương xuống ướt vạt y mà không hay."],
      ["Người này ngồi yên, nghe tiếng côn trùng thưa dần.", "Có lúc tâm chạy đi xa, rồi được gọi về.", "Trời hửng, một con chim đậu trên cành gạo."],
    ],
    study: [
      ["Người này thuộc thêm được mấy câu Kinh Từ Bi.", "Câu “như mẹ hiền giữ con một” cứ vang trong đầu."],
      ["Người này đọc đi đọc lại một đoạn kinh dưới ánh đèn dầu.", "Đến gần sáng, những chữ ấy đã nằm yên trong trí nhớ."],
      ["Người này lẩm nhẩm kinh cho đến khi tiếng gà gáy đầu.", "Còn vài chữ chưa thuộc, để mai thầy hỏi lại cũng không sao."],
    ],
    walk: [
      ["Người này đi đi lại lại quanh tịnh thất, từng bước một.", "Dưới chân, sỏi lạo xạo rồi cũng thành quen."],
      ["Người này kinh hành chậm rãi trong gió đêm.", "Mỗi lần chân chạm đất là một lần trở về với hiện tại."],
      ["Người này bước qua bước lại dọc hiên tịnh thất.", "Đi đến khi trăng nghiêng, thấy người nhẹ hẳn."],
    ],
    nolie: [
      ["Người này ngồi suốt đêm, lưng không chạm chiếu.", "Hôn trầm kéo đến mấy lần, mỗi lần lại được nhìn thấy rồi buông.", "Sáng ra mỏi, nhưng lòng tỉnh."],
      ["Người này giữ hạnh không nằm.", "Có lúc đầu gật xuống, giật mình, ngồi thẳng lại.", "Rạng sáng, mọi thứ trong vườn hiện ra rất rõ."],
      ["Người này ngồi qua cả đêm dài.", "Đến canh tư thì buồn ngủ nhất, rồi tự nhiên qua đi.", "Tiếng chuông sáng nghe trong hơn mọi hôm."],
    ],
    cook: [
      ["Nồi cơm đã chín từ tờ mờ sáng.", "Hơi ấm còn trong bếp."],
      ["Người này vo gạo, nhóm bếp, ngồi canh lửa.", "Mùi cơm mới thơm cả gian nhà nhỏ."],
      ["Người này nấu một nồi cơm thật dẻo.", "Bát cơm được đậy khăn sạch, chờ sáng mai."],
    ],
    weave: [
      ["Tiếng thoi đưa đều đều suốt đêm.", "Một tấm vải mộc đã dài thêm một gang tay."],
      ["Người này ngồi bên khung cửi, sợi chỉ lên xuống theo nhịp thở.", "Vải chưa xong, nhưng đã đủ mềm."],
      ["Người này dệt đến khi dầu đèn gần cạn.", "Mặt vải phẳng và đều, nhìn mà thấy yên lòng."],
    ],
    listen: [
      ["Người này ngồi phía cuối chánh điện, nghe pháp.", "Có một câu cứ ở lại trong lòng suốt đường về."],
      ["Người này lên chùa, ngồi nghe pháp cùng mấy người trong xóm.", "Trên đường về, nghe được một tin đồn nhỏ về nghĩa địa."],
      ["Người này nghe pháp đến khi nén nhang cháy hết.", "Bước xuống bậc đá, thấy chân nhẹ hơn lúc lên."],
    ],
    wall: [
      ["Người này ngồi ngoài tường chùa, nghe tiếng tụng kinh vọng ra.", "Có điều gì trong lòng dịu lại, dù không rõ là gì."],
      ["Tiếng kinh qua lớp tường rêu nghe như nước chảy.", "Người này ngồi đó cho đến khi tiếng mõ thưa dần."],
      ["Người này tựa lưng vào tường chùa lạnh.", "Từng câu kinh rơi xuống như sương, nhẹ và chậm."],
    ],
    tomb: [
      ["Người này ngồi yên bên mộ, không đợi gì nhiều.", "Gió thổi qua, mang theo mùi hương rất nhạt."],
      ["Người này ngồi bên ngôi mộ cũ, nhìn đom đóm lên xuống.", "Chưa thấy ai đến, nhưng lòng không còn nặng như trước."],
      ["Người này ngồi chờ, tay đặt lên lớp cỏ ẩm.", "Xa xa có tiếng bước chân, rồi lại xa dần. Vậy cũng được."],
    ],
  };
  const GENERIC_STORY = [["Người này lặng lẽ nghỉ ngơi trong lúc vắng.", "Mọi thứ vẫn còn nguyên ở chỗ cũ."]];
  const BAND_LINES = {
    short: "Chỉ mới qua một lát, người này vẫn còn ngồi đó.",
    mid: "Đêm đã trôi qua trong yên lặng.",
    long: "Một ngày dài trôi qua, người này không thiếu gì, cũng không mất gì.",
  };

  const hash = (str) => { let h = 0; for (const c of String(str)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const pick = (list, key) => list[hash(key) % list.length];

  const hookFor = (role, runId) => pick(HOOKS[role] || HOOKS.monk, runId || "");

  function awayBand(at, now) {
    const ms = (Number(now) || 0) - (Number(at) || 0);
    if (!(ms >= 3600000)) return "short";
    if (ms < 86400000) return "mid";
    return "long"; // capped: a month away reads the same as one day
  }

  // -> { band, lines } ; narrative only, never rewards
  function awayStory(away, now, runId) {
    if (!away || typeof away !== "object") return { band: "short", lines: GENERIC_STORY[0].slice() };
    const band = awayBand(away.at, now);
    const variants = AWAY_STORIES[away.activity] || GENERIC_STORY;
    const lines = pick(variants, runId || "").slice();
    lines.push(BAND_LINES[band]);
    if (typeof away.hook === "string" && away.hook) lines.push(away.hook);
    return { band, lines };
  }

  // Lines of this night's diary: filtered, grouped, capped.
  function summarizeDiary(history, startedAt) {
    const all = Array.isArray(history) ? history.filter((e) => e && typeof e.text === "string") : [];
    let mine;
    if (typeof startedAt === "number") mine = all.filter((e) => e.at >= startedAt);
    else {
      const marks = all.map((e, i) => (NIGHT_DONE_RE.test(e.text) ? i : -1)).filter((i) => i >= 0);
      mine = marks.length >= 2 ? all.slice(marks[marks.length - 2] + 1) : marks.length === 1 ? all.slice(0, marks[0] + 1) : all.slice(-12);
    }
    const counts = new Map();
    for (const e of mine) {
      if (NIGHT_DONE_RE.test(e.text) || /^Hồi hướng công đức/.test(e.text)) continue;
      counts.set(e.text, (counts.get(e.text) || 0) + 1);
    }
    const out = [...counts].map(([t, n]) => (n > 1 ? `${t} (×${n})` : t)).slice(0, DIARY_MAX);
    return out.length ? out : [EMPTY_NIGHT];
  }

  const M = () => { try { return window.Milestones || null; } catch { return null; } };
  function notifyQuiet(event, data) {
    try { const m = M(); const r = m && m.notify ? m.notify(event, data, { quiet: true }) : []; return Array.isArray(r) ? r : []; } catch { return []; }
  }
  function milestonesSince(ts) {
    try { const m = M(); const r = m && m.since ? m.since(ts) : []; return Array.isArray(r) ? r : []; } catch { return []; }
  }

  // Once-per-runId guards live in the checkpoint so reopening the ending does not repeat them.
  function nightEvent(cp) {
    if (cp.reflectedRunId === cp.runId) return { first: false, milestones: [], cp };
    return { first: true, milestones: notifyQuiet("night", { day: cp.day, role: cp.role }), cp: { ...cp, reflectedRunId: cp.runId } };
  }
  function dedicate(cp) {
    if (cp.dedicatedRunId === cp.runId) return { first: false, milestones: [], cp };
    return { first: true, milestones: notifyQuiet("dedicate", {}), cp: { ...cp, dedicatedRunId: cp.runId } };
  }

  const activityOf = (role, id) => (ACTIVITIES[role] || []).find((a) => a.id === id);
  function chooseAway(cp, activityId, now) {
    return { ...cp, away: { activity: activityId, at: now, hook: hookFor(cp.role, cp.runId) } };
  }
  function closingLine(role, id) {
    const a = activityOf(role, id);
    return a ? `Người này ${a.doing}. Hẹn gặp lại.` : "Người này nghỉ ở đây. Hẹn gặp lại.";
  }

  // ---------- DOM (thin) ----------
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  let root = null;
  function close() { if (root) { root.remove(); root = null; } }

  function milestoneBlock(list) {
    const box = el("div", "rf-miles");
    for (const m of list) {
      const b = el("div", "rf-mile");
      b.appendChild(el("strong", null, m.title));
      b.appendChild(el("p", null, m.text));
      box.appendChild(b);
    }
    return box;
  }

  // ctx: { role, getCp(), setCp(cp) (saves), history(), log(text), newNight(), leave(), flush() }
  function open(ctx) {
    close();
    root = el("div", "reflect");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Quán xét cuối đêm");
    const col = el("div", "rf-col");
    root.appendChild(col);
    document.body.appendChild(root);
    let step = 0;
    const add = (node) => { node.classList.add("rf-step"); node.style.animationDelay = step++ * 0.5 + "s"; col.appendChild(node); return node; };

    let cp = ctx.getCp();
    const ev = nightEvent(cp);
    if (ev.first) { cp = ev.cp; ctx.setCp(cp); }

    add(el("h2", "rf-title", "Quán xét cuối đêm"));
    add(el("p", "rf-quote", "Như soi gương, nhìn lại việc mình đã làm."));

    const diary = el("div", "rf-block");
    diary.appendChild(el("h3", null, "Đêm nay"));
    for (const t of summarizeDiary(ctx.history(), cp.startedAt)) diary.appendChild(el("p", "rf-line", t));
    add(diary);

    const seen = new Set();
    const miles = [];
    for (const m of [...milestonesSince(typeof cp.startedAt === "number" ? cp.startedAt : 0), ...ev.milestones]) {
      if (m && m.id && !seen.has(m.id)) { seen.add(m.id); miles.push(m); }
    }
    if (miles.length) {
      const b = el("div", "rf-block");
      b.appendChild(el("h3", null, "Dấu mốc"));
      b.appendChild(milestoneBlock(miles));
      add(b);
    }

    const ded = el("div", "rf-block rf-dedicate");
    ded.appendChild(el("h3", null, "Hồi hướng"));
    const dbtn = el("button", "rf-btn", "Hồi hướng công đức");
    dbtn.type = "button";
    const dline = el("p", "rf-wish");
    const dmiles = el("div");
    const already = cp.dedicatedRunId === cp.runId;
    const showDedicated = () => { dbtn.disabled = true; ded.classList.add("glow"); dline.textContent = "Nguyện cho phần phước đêm nay đến với mọi loài, với người đã khuất, với chúng sinh còn khổ."; };
    if (already) showDedicated();
    dbtn.addEventListener("click", () => {
      const r = dedicate(ctx.getCp());
      if (!r.first) return;
      ctx.setCp(r.cp);
      ctx.log("Hồi hướng công đức cuối đêm.");
      showDedicated();
      if (r.milestones.length) dmiles.appendChild(milestoneBlock(r.milestones));
    });
    ded.append(dbtn, dline, dmiles);
    add(ded);

    const hook = hookFor(ctx.role, cp.runId);
    const hb = el("div", "rf-block");
    hb.appendChild(el("h3", null, "Ngày mai"));
    hb.appendChild(el("p", "rf-hook", hook));
    add(hb);

    const choices = el("div", "rf-choices");
    const nn = el("button", "rf-btn primary", "Sang đêm mới");
    nn.type = "button";
    nn.addEventListener("click", () => { close(); ctx.newNight(); });
    const rest = el("button", "rf-btn", "Nghỉ ở đây");
    rest.type = "button";
    rest.addEventListener("click", () => awayStep());
    choices.append(nn, rest);
    add(choices);

    function awayStep() {
      col.replaceChildren();
      step = 0;
      add(el("h2", "rf-title", "Trong lúc vắng, người này sẽ…"));
      const list = el("div", "rf-choices");
      for (const a of ACTIVITIES[ctx.role] || []) {
        const b = el("button", "rf-btn", a.label);
        b.type = "button";
        b.addEventListener("click", async () => {
          ctx.setCp(chooseAway(ctx.getCp(), a.id, Date.now()));
          try { await ctx.flush(); } catch {}
          col.replaceChildren();
          step = 0;
          add(el("p", "rf-wish show", closingLine(ctx.role, a.id)));
          const back = el("button", "rf-btn primary", "Về màn chọn nhân vật");
          back.type = "button";
          back.addEventListener("click", () => { close(); ctx.leave(); });
          add(back);
        });
        list.appendChild(b);
      }
      add(list);
    }
  }

  // Small sheet on return: story only. ctx: { role, away, now, runId, onStart() }
  function showAway(ctx) {
    close();
    root = el("div", "reflect");
    root.setAttribute("role", "dialog");
    const col = el("div", "rf-col");
    root.appendChild(col);
    const s = awayStory(ctx.away, ctx.now || Date.now(), ctx.runId);
    let i = 0;
    const add = (n) => { n.classList.add("rf-step"); n.style.animationDelay = i++ * 0.6 + "s"; col.appendChild(n); };
    add(el("h2", "rf-title", "Trong lúc vắng"));
    s.lines.forEach((t) => add(el("p", "rf-line", t)));
    const b = el("button", "rf-btn primary", "Bắt đầu đêm mới");
    b.type = "button";
    b.addEventListener("click", () => { close(); if (ctx.onStart) ctx.onStart(); });
    add(b);
    document.body.appendChild(root);
  }

  return { HOOKS, ACTIVITIES, AWAY_STORIES, hookFor, awayBand, awayStory, summarizeDiary, nightEvent, dedicate, milestonesSince, chooseAway, closingLine, open, showAway, close };
})();
