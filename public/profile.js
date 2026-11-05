// Profile screen for signed-in players: all characters, and for the chosen one its temperament,
// mind stats, cards, bag and diary. Read-only; "Chơi tiếp" hands back to app.js.
// Later this is where appearance (clothes, hair…) will be shown and changed.
window.Profile = (() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  let hooks = {};
  let selected = null;
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
      const glyph = el("span", "glyph"); glyph.appendChild(el("span"));
      const txt = el("span", "chip-text");
      txt.appendChild(el("b", null, c.name));
      txt.appendChild(el("small", null, `${ROLE_INFO[c.role] ? ROLE_INFO[c.role].name : c.role} · ${ago(c.updatedAt)}`));
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
    let c;
    try { c = await fetchCharacter(id); } catch { box.replaceChildren(el("p", "hint", "Chưa mở được nhân vật này, thử lại nhé.")); return; }
    if (selected !== id) return;
    const summary = (Save.me().characters || []).find((x) => x.id === id) || {};
    const mind = (c.data && c.data.mind) || {};
    const history = (c.data && c.data.history) || [];
    const P = Mind.parts;
    box.replaceChildren();

    // header
    const head = el("div", "profile-head");
    head.dataset.role = c.role;
    const glyph = el("div", "glyph"); glyph.appendChild(el("span"));
    const who = el("div", "profile-who");
    who.appendChild(el("h2", "profile-name", c.name));
    who.appendChild(el("p", "rc-who", `${ROLE_INFO[c.role] ? ROLE_INFO[c.role].name : c.role}${summary.createdAt ? " · tạo ngày " + fmtDate(summary.createdAt) : ""}${summary.updatedAt ? " · chơi " + ago(summary.updatedAt) : ""}`));
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
    actions.append(play, del);
    box.appendChild(actions);

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
    const cs = section("Thẻ tâm sở", `${Object.keys(owned).length}/${P.CARD_ORDER.length}`);
    const grid = el("div", "album-grid");
    for (const cid of P.CARD_ORDER) {
      const def = P.CARDS[cid], own = owned[cid];
      const t = el("button", "album-slot " + (own ? (def.good ? "good" : "bad") : "empty"));
      t.type = "button";
      if (own) { t.appendChild(el("b", null, def.name)); t.appendChild(el("span", null, `gặp ${own.n} lần`)); t.addEventListener("click", () => P.viewCard(cid, own)); }
      else { t.appendChild(el("b", null, "?")); t.appendChild(el("span", null, "chưa gặp")); t.disabled = true; }
      grid.appendChild(t);
    }
    cs.appendChild(grid);
    box.appendChild(cs);

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

  async function open(id) {
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
  return { init, open, close, isOpen: () => !$("profile").hidden };
})();
