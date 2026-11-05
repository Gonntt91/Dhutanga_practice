// The 52 cetasikas (tâm sở) as laid out on the Theravāda Abhidhamma wall chart "Bảng nêu chi pháp".
// Each one is a circle token whose ring is split into arcs: the feelings (thọ) it can arise with.
// We borrow the idea and the colours, not the picture. Study aid only; needs review by a teacher.
window.Cetasika = (() => {
  const ORDER = ["hy", "xa", "uu", "kho", "lac"];
  const FEELINGS = {
    hy: { name: "Thọ hỷ", plain: "vui", color: "#d4533f" },
    xa: { name: "Thọ xả", plain: "bình thản", color: "#5fae6e" },
    uu: { name: "Thọ ưu", plain: "buồn bực", color: "#9a6a3c" },
    kho: { name: "Thọ khổ", plain: "đau thân", color: "#1d1b1a", edge: "#a9a396" },
    lac: { name: "Thọ lạc", plain: "dễ chịu nơi thân", color: "#e8c547" },
  };
  const ALL5 = ORDER.slice(), HXU = ["hy", "xa", "uu"], HX = ["hy", "xa"];
  const GROUPS = [
    { key: "bien_hanh", title: "7 sở hữu biến hành", short: "Biến hành", parts: [{ key: null, title: "", feelings: ALL5, names: ["Xúc", "Thọ", "Tưởng", "Tư", "Nhất hành", "Mạng quyền", "Tác ý"] }] },
    { key: "biet_canh", title: "6 sở hữu biệt cảnh", short: "Biệt cảnh", parts: [
      { key: null, title: "", feelings: HXU, only: { "Hỷ": ["hy"] }, names: ["Tầm", "Tứ", "Thắng giải", "Cần", "Hỷ", "Dục"] }] },
    { key: "bat_thien", title: "14 sở hữu bất thiện", short: "tâm sở bất thiện", parts: [
      { key: "si", title: "Si phần", feelings: HXU, names: ["Si", "Vô tàm", "Vô quý", "Phóng dật"] },
      { key: "tham", title: "Tham phần", feelings: HX, names: ["Tham", "Tà kiến", "Ngã mạn"] },
      { key: "san", title: "Sân phần", feelings: ["uu"], names: ["Sân", "Tật", "Lận", "Hối"] },
      { key: "hon", title: "Hôn phần", feelings: HXU, names: ["Hôn trầm", "Thụy miên"] },
      { key: "nghi", title: "Nghi phần", feelings: ["xa"], names: ["Hoài nghi"] }] },
    { key: "tinh_hao", title: "25 sở hữu tịnh hảo", short: "tâm sở tịnh hảo", parts: [
      { key: "bien_hanh", title: "Tịnh hảo biến hành", feelings: HX, names: ["Tín", "Niệm", "Tàm", "Quý", "Vô tham", "Vô sân", "Hành xả", "Tịnh thân", "Tịnh tâm", "Khinh thân", "Khinh tâm", "Nhu thân", "Nhu tâm", "Thích thân", "Thích tâm", "Thuần thân", "Thuần tâm", "Chánh thân", "Chánh tâm"] },
      { key: "gioi", title: "Giới phần", feelings: HX, names: ["Chánh ngữ", "Chánh nghiệp", "Chánh mạng"] },
      { key: "vo_luong", title: "Vô lượng phần", feelings: HX, names: ["Bi", "Tùy hỷ"] },
      { key: "tue", title: "Trí tuệ", feelings: HX, names: ["Trí tuệ"] }] },
  ];
  const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase().replace(/[^a-z]+/g, "_");
  const all = [];
  for (const g of GROUPS) for (const p of g.parts) {
    p.items = p.names.map((name) => {
      let id = slug(name);
      if (all.some((o) => o.id === id)) id += "_" + g.key;
      const e = { id, name, group: g.key, part: p.key, feelings: (p.only && p.only[name] || p.feelings).slice() };
      all.push(e);
      return e;
    });
  }
  const GAME = { san: "Sân", hoi_han: "Hối", tham: "Tham", bon_xen: "Lận", khong_san: "Vô sân", khong_tham: "Vô tham", niem: "Niệm", hy: "Hỷ", bi: "Bi", tuy_hy: "Tùy hỷ" };
  const byId = (id) => all.find((e) => e.id === id);
  const byName = (n) => all.find((e) => e.name === n);
  const byGame = (gid) => (GAME[gid] ? byName(GAME[gid]) : null);
  const resolve = (x) => (typeof x === "string" ? byId(x) || byGame(x) : x);
  const groups = () => GROUPS;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Short line for the card: "Sân phần · 14 tâm sở bất thiện".
  function groupLine(entry) {
    const g = GROUPS.find((x) => x.key === entry.group), p = g.parts.find((x) => x.items.includes(entry));
    if (g.key === "bien_hanh") return "Biến hành · 7 tâm sở đi cùng mọi tâm";
    if (g.key === "biet_canh") return "Biệt cảnh · 6 tâm sở";
    const n = g.title.split(" ")[0];
    return `${p.title} · ${n} ${g.short}`;
  }

  // SVG token. Ring: radius 42 with pathLength 100, one equal arc per feeling.
  // Ring split into one arc per feeling, in a fixed order.
  function arcsFor(e) {
    const fs = ORDER.filter((k) => e.feelings.includes(k)), k = fs.length, seg = 100 / k, gap = k > 1 ? 2.2 : 0;
    let arcs = "";
    fs.forEach((f, i) => {
      const len = +(seg - gap).toFixed(2), start = +(i * seg + gap / 2).toFixed(2);
      const common = `cx="50" cy="50" r="42" fill="none" pathLength="100" transform="rotate(-90 50 50)" stroke-dashoffset="${-start}"`;
      if (FEELINGS[f].edge) arcs += `<circle class="cz-halo" ${common} stroke="${FEELINGS[f].edge}" stroke-width="12.5" stroke-dasharray="${len} ${100 - len}"/>`;
      arcs += `<circle class="cz-arc cz-${f}" style="--i:${i}" ${common} stroke="${FEELINGS[f].color}" stroke-width="10" stroke-dasharray="${len} ${100 - len}"/>`;
    });
    return arcs;
  }

  // faint: an unmet entry still shows its feeling colours, dimmed, like a map of the road ahead.
  function token(x, { size = 96, lit = true, label, faint = false } = {}) {
    const e = resolve(x);
    const name = label != null ? label : e ? e.name : "?";
    const cls = lit ? " lit" : faint && e ? " unlit cz-faint" : " unlit";
    const base = `<svg class="cz-token${cls}" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${esc(lit ? name : "Chưa gặp")}" xmlns="http://www.w3.org/2000/svg">`;
    if (!lit && faint && e) return base + `<circle cx="50" cy="50" r="35" fill="#10181a" fill-opacity=".6"/>` + arcsFor(e) + `</svg>`;
    if (!lit || !e) {
      return base + `<circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-opacity=".45" stroke-width="3" stroke-dasharray="5 5"/>` +
        (size >= 40 ? `<text x="50" y="58" text-anchor="middle" font-size="26" fill="currentColor" fill-opacity=".5">?</text>` : "") + `</svg>`;
    }
    let text = "";
    if (size >= 40) {
      const words = name.split(" ");
      const lines = words.length >= 2 ? [words[0], words.slice(1).join(" ")] : [name];
      const longest = Math.max(...lines.map((l) => l.length));
      const f = Math.max(9, Math.min(17, 54 / (longest * 0.58)));
      const y0 = 50 + f * 0.35 - (lines.length - 1) * f * 0.55;
      text = lines.map((l, i) => `<text x="50" y="${(y0 + i * f * 1.1).toFixed(1)}" text-anchor="middle" font-size="${f.toFixed(1)}" fill="#efe7d3" font-weight="600">${esc(l)}</text>`).join("");
    }
    return base + `<circle cx="50" cy="50" r="35" fill="#10181a" stroke="#ffffff" stroke-opacity=".08"/>` + arcsFor(e) + text + `</svg>`;
  }

  return { FEELINGS, ORDER, all, groups, byGame, byId, byName, token, groupLine };
})();
