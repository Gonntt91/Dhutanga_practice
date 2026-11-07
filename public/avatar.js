// Character portraits drawn as layered SVG: background glow → body/clothes → head → hair → headwear → held item.
// Each layer reads from a "skin" object, so clothes, hair and items can be swapped later
// (a character's skin will live in its saved data; for now every role uses its default skin).
window.Avatar = (() => {
  const DEFAULT_SKIN = {
    monk: { robe: "#c9782f", robeShade: "#8f4f1c", sash: "#a85d22", skin: "#c99a6e", hair: "shaved", headwear: null, item: "bowl", aura: "#d08a4d" },
    villager: { robe: "#5d4a37", robeShade: "#3e3125", sash: "#7a5f3e", pants: "#2e2a26", skin: "#b88a62", hair: "short", hairColor: "#1d1a17", headwear: "nonla", item: "lantern", aura: "#e6c56f" },
    ghost: { robe: "#dfeee8", robeShade: "#9fd2c1", sash: "#bfe1d6", skin: "#e7f1ec", hair: "long", hairColor: "#141a19", headwear: null, item: null, aura: "#9fd2c1", ghost: true },
  };
  let uid = 0;

  function skinFor(role, override) { return { ...(DEFAULT_SKIN[role] || DEFAULT_SKIN.villager), ...(override || {}) }; }

  // ---------- layers ----------
  function aura(s, id) {
    return `<defs><radialGradient id="au${id}" cx="50%" cy="46%" r="55%"><stop offset="0" stop-color="${s.aura}" stop-opacity="0.35"/><stop offset="1" stop-color="${s.aura}" stop-opacity="0"/></radialGradient>
      <linearGradient id="rb${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.robe}"/><stop offset="1" stop-color="${s.robeShade}"/></linearGradient>
      ${s.ghost ? `<linearGradient id="gf${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.robe}" stop-opacity="0.95"/><stop offset="0.75" stop-color="${s.robeShade}" stop-opacity="0.55"/><stop offset="1" stop-color="${s.robeShade}" stop-opacity="0"/></linearGradient>` : ""}
    </defs>
    <ellipse cx="60" cy="74" rx="58" ry="70" fill="url(#au${id})"/>
    ${s.ghost ? "" : `<ellipse cx="60" cy="150" rx="30" ry="5" fill="#000" opacity="0.35"/>`}`;
  }

  function body(role, s, id) {
    if (s.ghost) {
      // a flowing áo dài-like gown fading into mist, no feet
      return `<path d="M44 70 Q34 100 30 128 Q38 140 46 150 Q52 142 60 152 Q68 142 74 150 Q82 140 90 128 Q86 100 76 70 Q60 64 44 70Z" fill="url(#gf${id})"/>
        <path d="M44 72 Q30 88 26 108 M76 72 Q90 88 94 108" stroke="${s.robe}" stroke-opacity="0.6" stroke-width="7" stroke-linecap="round" fill="none"/>
        <path d="M54 70 L60 92 L66 70" fill="none" stroke="${s.robeShade}" stroke-width="1.4" opacity="0.8"/>`;
    }
    if (role === "monk") {
      // robe over one shoulder (right shoulder bare), long hem
      return `<path d="M40 72 Q32 104 34 146 L86 146 Q88 104 80 72 Q60 64 40 72Z" fill="url(#rb${id})"/>
        <path d="M72 70 Q82 74 82 86 Q78 82 74 84Z" fill="${s.skin}"/>
        <path d="M42 74 Q60 96 78 72" fill="none" stroke="${s.sash}" stroke-width="4" stroke-linecap="round"/>
        <path d="M44 100 Q60 108 78 98 M42 122 Q60 132 80 120" fill="none" stroke="${s.robeShade}" stroke-width="1.6" opacity="0.7"/>
        <path d="M38 84 Q30 104 44 112" fill="none" stroke="url(#rb${id})" stroke-width="10" stroke-linecap="round"/>`;
    }
    // villager: brown shirt, dark trousers, sash
    return `<rect x="47" y="118" width="11" height="28" rx="3" fill="${s.pants}"/><rect x="62" y="118" width="11" height="28" rx="3" fill="${s.pants}"/>
      <path d="M42 74 Q36 98 40 124 L80 124 Q84 98 78 74 Q60 66 42 74Z" fill="url(#rb${id})"/>
      <rect x="40" y="110" width="40" height="5" rx="2" fill="${s.sash}"/>
      <path d="M60 74 L60 110" stroke="${s.robeShade}" stroke-width="1.4"/>
      <path d="M42 80 Q32 98 36 112" fill="none" stroke="url(#rb${id})" stroke-width="10" stroke-linecap="round"/>
      <path d="M78 80 Q90 92 92 102" fill="none" stroke="url(#rb${id})" stroke-width="10" stroke-linecap="round"/>`;
  }

  function head(s) {
    const op = s.ghost ? ' opacity="0.92"' : "";
    return `<rect x="55" y="58" width="10" height="12" rx="4" fill="${s.skin}"${op}/>
      <ellipse cx="60" cy="46" rx="14" ry="16" fill="${s.skin}"${op}/>
      <path d="M53 47 Q55 49 57 47 M63 47 Q65 49 67 47" stroke="#2a1e14" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="${s.ghost ? 0.55 : 0.8}"/>
      <path d="M57 55 Q60 57 63 55" stroke="#7a4a32" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  }

  function hair(s) {
    if (s.hair === "shaved") return `<path d="M47 40 Q60 26 73 40" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="3"/>`;
    if (s.hair === "long") return `<path d="M45 46 Q44 28 60 28 Q76 28 75 46 Q78 74 84 96 Q74 88 72 62 Q70 40 60 36 Q50 40 48 62 Q46 88 36 96 Q42 74 45 46Z" fill="${s.hairColor}" opacity="0.92"/>`;
    return `<path d="M46 44 Q46 28 60 29 Q74 28 74 44 Q68 36 60 37 Q52 36 46 44Z" fill="${s.hairColor}"/>`;
  }

  function headwear(s) {
    if (s.headwear === "nonla") {
      return `<path d="M30 44 L60 16 L90 44 Q60 50 30 44Z" fill="#d9c48c"/>
        <path d="M30 44 Q60 50 90 44" fill="none" stroke="#a8925a" stroke-width="1.4"/>
        <path d="M40 35 L80 35 M48 28 L72 28" stroke="#b8a46a" stroke-width="0.9" opacity="0.8"/>`;
    }
    return "";
  }

  function item(s) {
    if (s.item === "bowl") {
      // alms bowl held in front with both hands
      return `<ellipse cx="60" cy="104" rx="15" ry="5" fill="#2b2420"/>
        <path d="M45 104 Q46 120 60 121 Q74 120 75 104Z" fill="#3a302a"/>
        <path d="M48 108 Q60 114 72 108" fill="none" stroke="#5a4a3e" stroke-width="1"/>
        <ellipse cx="46" cy="110" rx="5" ry="4" fill="${s.skin}"/><ellipse cx="74" cy="110" rx="5" ry="4" fill="${s.skin}"/>`;
    }
    if (s.item === "lantern") {
      return `<path d="M92 102 L100 82" stroke="#5a4630" stroke-width="2" stroke-linecap="round"/>
        <path d="M100 82 L100 88" stroke="#5a4630" stroke-width="1"/>
        <circle cx="100" cy="96" r="12" fill="#e6c56f" opacity="0.25"/>
        <rect x="95" y="88" width="10" height="13" rx="3" fill="#e6c56f"/>
        <rect x="95" y="88" width="10" height="13" rx="3" fill="none" stroke="#a8823a" stroke-width="1"/>
        <ellipse cx="92" cy="104" rx="4" ry="3.6" fill="${s.skin}"/>`;
    }
    return "";
  }

  // Full portrait as an SVG string. size = rendered width in px (height is 4/3 of it).
  function svg(role, override, size = 120) {
    const s = skinFor(role, override);
    const id = "av" + (++uid);
    const parts = [aura(s, id), body(role, s, id), head(s), hair(s), headwear(s), item(s)].join("");
    const ghostAnim = s.ghost ? `<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="4s" repeatCount="indefinite"/>` : "";
    return `<svg class="avatar-svg" width="${size}" height="${Math.round(size * 4 / 3)}" viewBox="0 0 120 160" role="img" aria-label="${role}"><g>${ghostAnim}${parts}</g></svg>`;
  }
  function node(role, override, size) {
    const wrap = document.createElement("div");
    wrap.className = "portrait portrait-" + role;
    wrap.innerHTML = svg(role, override, size);
    return wrap;
  }

  return { svg, node, skinFor, DEFAULT_SKIN };
})();
