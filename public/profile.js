// Profile screen for signed-in players: all characters, and for the chosen one its temperament,
// mind stats, cards, bag and diary. Read-only; "Chơi tiếp" hands back to app.js.
// Later this is where appearance (clothes, hair…) will be shown and changed.
window.Profile = (() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  let hooks = {};
  let selected = null;
  let live = null; // the character being played right now (opened from the mind orb); null when opened from the picker
  const cache = new Map(); // id -> character (with data)

  const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); } catch { return ""; } };
  function ago(iso) {
    if (!iso) return "";
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "vừa xong";
    if (mins < 60) return `${mins} phút trước`;
    const h = Math.round(mins / 60);
    if (h < 24) return `${h} giờ trước`;
    return `${Math.round(h / 24)} ngày trước`;
  }

  async function fetchCharacter(id) {
    if (cache.has(id)) return cache.get(id);
    const r = await fetch("/api/characters/" + id, { credentials: "same-origin" });
    if (!r.ok) throw new Error("load failed");
    const { character } = await r.json();
    cache.set(id, character);
    return character;
  }

  function renderList() {
    const list = $("profile-list"); list.replaceChildren();
    list.hidden = !!live && live.id === "guest";
    const chars = (Save.me().characters || []);
    if (!chars.length) {
      list.appendChild(el("p", "hint", "Chưa có nhân vật nào. Quay lại và chọn một vai để tạo nhân vật đầu tiên."));
      return;
    }
    for (const c of chars) {
      const b = el("button", "profile-chip");
      b.type = "button";
      b.dataset.role = c.role;
      b.setAttribute("aria-pressed", String(c.id === selected));
      const glyph = el("span", "chip-avatar"); glyph.innerHTML = Avatar.svg(c.role, c.skin, 34);
      const txt = el("span", "chip-text");
      txt.appendChild(el("b", null, c.name));
      txt.appendChild(el("small", null, `${ROLE_INFO[c.role] ? ROLE_INFO[c.role].name : c.role} · ${live && live.id === c.id ? "đang chơi" : ago(c.updatedAt)}`));
      b.append(glyph, txt);
      b.addEventListener("click", () => select(c.id));
      list.appendChild(b);
    }
  }

  function section(title, extra) {
    const s = el("section", "profile-sec");
    const h = el("h3", "profile-sec-title", title);
    if (extra) h.appendChild(el("span", "count", extra));
    s.appendChild(h);
    return s;
  }

  async function select(id) {
    selected = id;
    renderList();
    const box = $("profile-detail");
    box.replaceChildren(el("p", "hint", "Đang mở…"));
    const isLive = !!live && live.id === id;
    let c;
    if (isLive) c = { id, name: live.name, role: live.role, data: { mind: live.mind, history: live.history, skin: live.skin } };
    else {
      try { c = await fetchCharacter(id); } catch { box.replaceChildren(el("p", "hint", "Chưa mở được nhân vật này, thử lại nhé.")); return; }
    }
    if (selected !== id) return;
    const summary = (Save.me().characters || []).find((x) => x.id === id) || {};
    const mind = (c.data && c.data.mind) || {};
    const history = (c.data && c.data.history) || [];
    const P = Mind.parts;
    box.replaceChildren();

    // header
    const head = el("div", "profile-head");
    head.dataset.role = c.role;
    // portrait: drawn in layers so clothes, hair and items can be changed later (skin kept in character data)
    const glyph = Avatar.node(c.role, c.data && c.data.skin, 132);
    glyph.classList.add("profile-portrait");
    const who = el("div", "profile-who");
    const nameRow = el("div", "profile-name-row");
    const nameEl = el("h2", "profile-name", c.name);
    const rename = el("button", "text-btn", "Đổi tên"); rename.type = "button";
    rename.addEventListener("click", () => {
      const input = el("input", "profile-rename"); input.maxLength = 24; input.value = c.name;
      const ok = el("button", "pill", "Lưu"); ok.type = "button";
      const cancel = el("button", "text-btn", "Hủy"); cancel.type = "button";
      const form = el("div", "profile-name-row"); form.append(input, ok, cancel);
      nameRow.replaceWith(form); input.focus(); input.select();
      const done = async () => {
        const v = input.value.replace(/\s+/g, " ").trim();
        if (!v || v === c.name) { form.replaceWith(nameRow); return; }
        try { c.name = await Save.renameCharacter(id, v); cache.set(id, c); if (live && live.id === id) live.name = c.name; } catch { alert("Chưa đổi được tên."); }
        hooks.changed && hooks.changed();
        select(id);
      };
      ok.addEventListener("click", done);
      cancel.addEventListener("click", () => form.replaceWith(nameRow));
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") done(); if (e.key === "Escape") form.replaceWith(nameRow); e.stopPropagation(); });
    });
    nameRow.append(nameEl);
    if (id !== "guest") nameRow.append(rename);
    who.appendChild(nameRow);
    who.appendChild(el("p", "rc-who", `${ROLE_INFO[c.role] ? ROLE_INFO[c.role].name : c.role}${isLive ? " · đang chơi" : ""}${id === "guest" ? " · chơi thử, chưa lưu" : ""}${summary.createdAt ? " · tạo ngày " + fmtDate(summary.createdAt) : ""}${summary.updatedAt ? " · chơi " + ago(summary.updatedAt) : ""}`));
    if (mind.carita) who.appendChild(el("p", "mind-carita", `Người này thiên về tính ${P.caritaName(mind.carita)}.`));
    head.append(glyph, who);
    box.appendChild(head);
    const actions = el("div", "profile-actions");
    const play = el("button", "primary", "Chơi tiếp"); play.type = "button";
    play.addEventListener("click", () => { close(); hooks.play && hooks.play(id); });
    const del = el("button", "text-btn", "Xóa nhân vật"); del.type = "button";
    del.addEventListener("click", async () => {
      if (!confirm(`Xóa nhân vật “${c.name}”? Thẻ, vật phẩm và nhật ký của nhân vật này sẽ mất.`)) return;
      try { await Save.deleteCharacter(id); } catch { alert("Chưa xóa được."); return; }
      cache.delete(id);
      selected = (Save.me().characters || [])[0]?.id || null;
      hooks.changed && hooks.changed();
      if (selected) select(selected); else { renderList(); $("profile-detail").replaceChildren(); }
    });
    if (isLive) {
      const back = el("button", "primary", "Quay lại chơi"); back.type = "button";
      back.addEventListener("click", close);
      actions.appendChild(back);
      if (id === "guest" && hooks.login) {
        const login = el("button", "pill", "Đăng nhập để lưu nhân vật"); login.type = "button";
        login.addEventListener("click", () => { close(); hooks.login(); });
        actions.appendChild(login);
      }
    } else if (live) {
      // looking at another character while playing: switch to it
      play.textContent = "Chơi nhân vật này";
      actions.append(play);
    } else actions.append(play, del);
    box.appendChild(actions);

    // the mind right now (only for the character in play)
    if (isLive && live.mood) {
      const now = section("Tâm lúc này");
      const row = el("div", "mood-now");
      const dot = el("span", "mood-dot"); dot.style.background = live.mood.color; dot.style.boxShadow = `0 0 16px ${live.mood.color}`;
      row.append(dot, el("b", null, live.mood.label));
      now.appendChild(row);
      if (live.suggestion) now.appendChild(el("p", "quest-tip", live.suggestion));
      const legend = document.querySelector("#mind-info .mind-legend");
      if (legend) {
        const det = el("details", "mood-legend");
        det.appendChild(el("summary", null, "Ý nghĩa các màu"));
        det.appendChild(legend.cloneNode(true));
        document.querySelectorAll("#mind-info > p.hint").forEach((p) => det.appendChild(p.cloneNode(true)));
        now.appendChild(det);
      }
      box.appendChild(now);
    }

    // stats
    const st = section("Chỉ số tâm");
    if (mind.stats) {
      const g = el("div", "stat-bars"); P.GOOD.forEach(([k, n]) => g.appendChild(P.bar(n, mind.stats[k], true)));
      const b = el("div", "stat-bars"); P.BAD.forEach(([k, n]) => b.appendChild(P.bar(n, mind.stats[k], false)));
      st.append(g, b);
      st.appendChild(el("p", "hint", "Mô phỏng để chơi, có lên có xuống, xoay quanh một mốc. Không phải thước đo tâm thật."));
    } else st.appendChild(el("p", "hint", "Chưa có chỉ số. Vào chơi một lần để biết tính cách của nhân vật này."));
    box.appendChild(st);

    // cards
    const owned = mind.cards || {};
    for (const sec of P.cardSections(owned)) {
      const cs = section(sec.title, sec.extra);
      const grid = el("div", "album-grid");
      for (const it of sec.items) {
        const t = el("button", "album-slot " + it.cls);
        t.type = "button";
        if (it.own) { t.appendChild(el("b", null, P.CARDS[it.id].name)); t.appendChild(el("span", null, it.sub)); t.addEventListener("click", () => P.viewCard(it.id, it.own, owned)); }
        else { t.appendChild(el("b", null, "?")); t.appendChild(el("span", null, "chưa gặp")); t.disabled = true; }
        grid.appendChild(t);
      }
      cs.appendChild(grid);
      box.appendChild(cs);
    }

    // milestones (private; hidden ones stay unlisted until reached)
    box.appendChild(milestoneSection(mind));

    // bag
    const items = (mind.items || []).filter((i) => window.Items && Items.def(i));
    const bs = section("Túi đồ", String(items.length));
    if (items.length && window.Items) { const bag = el("div", "bag"); Items.renderBag(bag, items, (iid) => Items.showDetail(iid)); bs.appendChild(bag); }
    else bs.appendChild(el("p", "hint", "Túi còn trống."));
    box.appendChild(bs);

    // diary
    const ds = section("Nhật ký");
    if (!history.length) ds.appendChild(el("p", "hint", "Chưa có gì."));
    else {
      const ol = el("ol", "trace-list");
      for (const h of history.slice(-20).reverse()) {
        const li = el("li"); li.appendChild(el("span", "dot"));
        const body = el("div", null, h.text);
        body.appendChild(el("span", "when", new Date(h.at).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })));
        li.appendChild(body); ol.appendChild(li);
      }
      ds.appendChild(ol);
    }
    box.appendChild(ds);
  }

  function milestoneSection(mind) {
    const sec = section("Dấu mốc");
    const got = mind.milestones || {};
    const defs = (window.Milestones && Milestones.defs) || [];
    const reached = defs.filter((d) => got[d.id]).sort((a, b) => got[b.id].at - got[a.id].at);
    if (!reached.length) sec.appendChild(el("p", "hint", "Chưa có dấu mốc nào."));
    const ol = el("ol", "ms-list");
    for (const d of reached) {
      const name = got[d.id].ctx && got[d.id].ctx.name || "";
      const fill = (t) => t.replace(/\{Tên\}/g, name);
      const li = el("li", "ms-item");
      li.appendChild(Milestones.emblem(30));
      const body = el("div", "ms-body");
      body.append(el("b", null, fill(d.title)), el("p", null, fill(d.text)), el("span", "when", new Date(got[d.id].at).toLocaleDateString("vi-VN")));
      li.appendChild(body); ol.appendChild(li);
    }
    if (reached.length) sec.appendChild(ol);
    if (defs.some((d) => d.hidden && !got[d.id])) sec.appendChild(el("p", "hint ms-more", "Còn những dấu mốc chưa lộ diện."));
    return sec;
  }

  // Opened from the mind orb while playing: the character in play first (guests too).
  async function openCurrent(info) {
    live = info;
    $("profile-user").textContent = Save.me().user ? Save.me().user.name || "" : "";
    $("profile").hidden = false;
    selected = info.id;
    if (Save.signedIn()) { await Save.refresh().catch(() => {}); cache.clear(); }
    renderList();
    select(info.id);
  }

  async function open(id) {
    live = null;
    if (!Save.signedIn()) return;
    cache.clear();
    await Save.refresh().catch(() => {});
    $("profile-user").textContent = Save.me().user ? Save.me().user.name || "" : "";
    $("profile").hidden = false;
    const chars = Save.me().characters || [];
    selected = id || selected || (chars[0] && chars[0].id) || null;
    if (selected && !chars.some((c) => c.id === selected)) selected = chars[0] ? chars[0].id : null;
    renderList();
    if (selected) select(selected); else $("profile-detail").replaceChildren();
  }
  function close() { $("profile").hidden = true; }

  function init(h) {
    hooks = h || {};
    $("profile-close").addEventListener("click", close);
  }
  return { init, open, openCurrent, close, isOpen: () => !$("profile").hidden };
})();
