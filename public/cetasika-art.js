// Illustrated icons for the cetasika cards, in the same hand-drawn style as items.js
// (soft radial halo, flat shapes with a little shading, warm muted palette).
window.CetasikaArt = (() => {
  let uid = 0;
  const halo = (u, c, o = 0.5) =>
    `<defs><radialGradient id="${u}g"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>` +
    `<circle cx="50" cy="50" r="47" fill="url(#${u}g)"/>`;
  const grad = (id, a, b, vertical = true) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 1}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;

  const ART = {
    // Sân: a flickering ember, hot core, smoke wisps.
    san: (u) =>
      halo(u, "#e0502a", 0.5) +
      `<defs>${grad(u + "f", "#ff9a3c", "#b8281a")}${grad(u + "c", "#fff0a0", "#ff8a2a")}</defs>` +
      `<path d="M38 20 C32 14 42 10 37 3 M52 18 C46 11 57 8 52 1 M64 22 C59 16 66 13 63 7" fill="none" stroke="#9a8f84" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M50 20 C58 34 74 42 72 62 C70 80 58 88 50 88 C40 88 27 80 28 62 C29 50 38 46 40 34 C44 38 46 40 46 44 C50 38 52 30 50 20 Z" fill="url(#${u}f)" stroke="#7a1a10" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M50 48 C56 58 64 62 62 72 C60 82 54 84 50 84 C44 84 38 80 39 72 C40 64 47 60 50 48 Z" fill="url(#${u}c)" stroke="#e0782a" stroke-width="1" stroke-linejoin="round"/>` +
      `<circle cx="22" cy="40" r="1.6" fill="#ffb060"/><circle cx="80" cy="34" r="1.3" fill="#ff8a50"/><circle cx="76" cy="56" r="1.1" fill="#ffb060"/>`,
    // Hối hận: a single withered leaf, drooping and falling.
    hoi_han: (u) =>
      halo(u, "#a07a4c", 0.35) +
      `<defs>${grad(u + "l", "#b8894a", "#6e4a28", false)}</defs>` +
      `<path d="M26 14 L30 24 M22 30 L26 36" stroke="#8a7a68" stroke-opacity=".5" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="2 5"/>` +
      `<g transform="rotate(28 50 54)">` +
      `<path d="M50 14 C70 26 74 52 62 72 C58 80 54 84 50 90 C46 84 42 80 38 72 C26 52 30 26 50 14 Z" fill="url(#${u}l)" stroke="#4a2e16" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M50 20 L50 92" stroke="#3e2812" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M50 40 L38 32 M50 52 L63 43 M50 64 L38 56 M50 74 L60 67" stroke="#3e2812" stroke-opacity=".7" stroke-width="1" stroke-linecap="round"/>` +
      `<path d="M62 30 C66 36 66 42 64 46 C60 42 58 36 62 30 Z" fill="#3a2a1c" fill-opacity=".55"/>` +
      `<path d="M36 52 C34 58 36 64 40 68" fill="none" stroke="#e0b878" stroke-opacity=".4" stroke-width="1.2" stroke-linecap="round"/></g>` +
      `<path d="M78 70 C84 76 84 82 80 86" fill="none" stroke="#8a7a68" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/>`,
    // Tham: a fist clenched around a glinting fruit, sticky drip (monkey trap resin).
    tham: (u) =>
      halo(u, "#e6c56f", 0.35) +
      `<defs>${grad(u + "f", "#f2a14a", "#c4562a")}${grad(u + "h", "#e9b48c", "#b8794e")}</defs>` +
      `<circle cx="50" cy="40" r="19" fill="url(#${u}f)" stroke="#7a3216" stroke-width="1.4"/>` +
      `<path d="M50 22 C50 16 54 13 58 13" fill="none" stroke="#4f7a3a" stroke-width="2" stroke-linecap="round"/><path d="M52 18 C58 14 63 17 62 21 C57 22 54 21 52 18 Z" fill="#6fa04a" stroke="#3f6a2c" stroke-width=".8"/>` +
      `<path d="M38 32 C40 28 44 26 47 26" fill="none" stroke="#fff3c4" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M26 52 C26 44 34 42 40 46 L60 46 C68 42 76 46 74 54 L72 70 C70 80 62 86 50 86 C38 86 30 80 29 70 Z" fill="url(#${u}h)" stroke="#6a3e22" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M36 56 C42 60 46 60 50 56 M50 56 C54 60 60 60 64 56 M38 68 C44 72 56 72 62 68" fill="none" stroke="#6a3e22" stroke-opacity=".7" stroke-width="1.2" stroke-linecap="round"/>` +
      `<path d="M58 80 C58 88 56 92 58 95" fill="none" stroke="#e6c56f" stroke-width="2.6" stroke-linecap="round"/><circle cx="58" cy="95" r="2" fill="#e6c56f"/>` +
      `<path d="M80 22 L84 28 M84 22 L80 28" stroke="#fff3c4" stroke-width="1.4" stroke-linecap="round"/>`,
    // Bỏn xẻn: a rice pot, lid tied shut with a knotted cord.
    bon_xen: (u) =>
      halo(u, "#c98a56", 0.3) +
      `<defs>${grad(u + "p", "#8a6a50", "#4a3626", false)}${grad(u + "d", "#a8845e", "#6a4e36")}</defs>` +
      `<path d="M16 46 C16 70 28 86 50 86 C72 86 84 70 84 46 Z" fill="url(#${u}p)" stroke="#2e2014" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<path d="M26 56 C28 68 34 76 42 80" fill="none" stroke="#c9a47c" stroke-opacity=".35" stroke-width="1.6" stroke-linecap="round"/>` +
      `<path d="M10 44 C10 40 14 38 18 38 L82 38 C86 38 90 40 90 44 C90 48 86 48 82 48 L18 48 C14 48 10 48 10 44 Z" fill="url(#${u}d)" stroke="#2e2014" stroke-width="1.4"/>` +
      `<path d="M22 38 C22 22 36 18 50 18 C64 18 78 22 78 38 Z" fill="url(#${u}d)" stroke="#2e2014" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<circle cx="50" cy="15" r="4" fill="#6a4e36" stroke="#2e2014" stroke-width="1.2"/>` +
      `<path d="M30 24 C32 20 38 19 44 19" fill="none" stroke="#e9d3b0" stroke-opacity=".4" stroke-width="1.4" stroke-linecap="round"/>` +
      `<path d="M30 38 L30 66 M70 38 L70 66" stroke="#e6c56f" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M30 52 C40 60 60 44 70 54" fill="none" stroke="#e6c56f" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M44 52 C40 44 50 42 52 50 C56 44 62 50 54 56 C60 62 50 64 48 58 C42 64 38 56 44 52 Z" fill="#d6ac52" stroke="#8a6420" stroke-width="1.2" stroke-linejoin="round"/>`,
    // Không sân: a calm full moon over still water.
    khong_san: (u) =>
      halo(u, "#dff0ff", 0.55) +
      `<defs><radialGradient id="${u}m" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d8e6f0"/></radialGradient>${grad(u + "w", "#3a5a78", "#1c2e44")}</defs>` +
      `<circle cx="50" cy="38" r="22" fill="url(#${u}m)" stroke="#aebfd0" stroke-width="1.2"/>` +
      `<circle cx="42" cy="32" r="4" fill="#c6d4e0" fill-opacity=".6"/><circle cx="58" cy="44" r="5" fill="#c6d4e0" fill-opacity=".5"/><circle cx="52" cy="28" r="2.4" fill="#c6d4e0" fill-opacity=".5"/>` +
      `<path d="M8 64 L92 64 L92 88 C92 90 90 92 88 92 L12 92 C10 92 8 90 8 88 Z" fill="url(#${u}w)" stroke="#142234" stroke-width="1.2"/>` +
      `<path d="M30 70 L70 70 M36 76 L64 76 M42 82 L58 82" stroke="#dff0ff" stroke-opacity=".75" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M16 66 L24 66 M76 68 L86 68 M20 86 L34 86 M66 88 L82 88" stroke="#7a9cc0" stroke-opacity=".6" stroke-width="1.2" stroke-linecap="round"/>`,
    // Không tham: a water droplet resting on a lotus leaf, not clinging.
    khong_tham: (u) =>
      halo(u, "#bfe8c8", 0.4) +
      `<defs>${grad(u + "l", "#8fcf8f", "#3f8a52", false)}<radialGradient id="${u}d" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#bfe4f6"/><stop offset="1" stop-color="#6fb4dc"/></radialGradient></defs>` +
      `<ellipse cx="50" cy="72" rx="42" ry="17" fill="url(#${u}l)" stroke="#2f6a3f" stroke-width="1.3"/>` +
      `<path d="M50 72 L16 68 M50 72 L84 68 M50 72 L26 82 M50 72 L74 82 M50 72 L50 56" stroke="#d6f0b8" stroke-opacity=".55" stroke-width=".9" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="73" rx="14" ry="4" fill="#2f6a3f" fill-opacity=".35"/>` +
      `<path d="M50 24 C50 24 33 44 33 56 C33 66 40 72 50 72 C60 72 67 66 67 56 C67 44 50 24 50 24 Z" fill="url(#${u}d)" stroke="#4a8cb4" stroke-width="1.3" stroke-linejoin="round"/>` +
      `<path d="M42 50 C40 56 41 61 44 64" fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="2.4" stroke-linecap="round"/><circle cx="58" cy="60" r="2" fill="#fff" fill-opacity=".6"/>`,
    // Niệm: the gatekeeper's lantern hanging at a small gate, steady flame.
    niem: (u) =>
      halo(u, "#ffd98a", 0.55) +
      `<defs>${grad(u + "b", "#e8b25a", "#b0652a")}${grad(u + "w", "#fff4c8", "#ffc766")}</defs>` +
      `<path d="M8 90 L8 40 M92 90 L92 40" stroke="#6a4e36" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M4 38 L96 38 M10 46 L90 46" stroke="#8a6a4a" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M50 6 L50 20" stroke="#4a3626" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M38 24 C38 20 42 18 50 18 C58 18 62 20 62 24 Z" fill="#5a3e28" stroke="#2e2014" stroke-width="1.2"/>` +
      `<path d="M38 24 L62 24 C66 40 64 58 58 66 L42 66 C36 58 34 40 38 24 Z" fill="url(#${u}b)" fill-opacity=".85" stroke="#6a3e18" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M50 32 C56 40 57 48 54 56 C52 60 48 60 46 56 C43 48 44 40 50 32 Z" fill="url(#${u}w)" stroke="#e8902a" stroke-width="1"/>` +
      `<path d="M40 66 L60 66 L56 72 L44 72 Z" fill="#5a3e28" stroke="#2e2014" stroke-width="1.2"/>` +
      `<path d="M42 28 C41 38 42 48 44 56" fill="none" stroke="#fff3c4" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>`,
    // Hỷ: a light feather lifting on a breeze, small sparkles.
    hy: (u) =>
      halo(u, "#ffe3a0", 0.5) +
      `<defs>${grad(u + "f", "#fffdf5", "#f0d58a", false)}</defs>` +
      `<path d="M10 70 C24 66 30 74 44 70 M6 80 C18 77 24 84 36 80" fill="none" stroke="#d9e6ee" stroke-opacity=".7" stroke-width="1.8" stroke-linecap="round"/>` +
      `<g transform="rotate(-38 50 52)">` +
      `<path d="M50 8 C72 20 74 52 50 80 C26 52 28 20 50 8 Z" fill="url(#${u}f)" stroke="#c9a85a" stroke-width="1.3" stroke-linejoin="round"/>` +
      `<path d="M50 12 L50 94" stroke="#b8943e" stroke-width="1.8" stroke-linecap="round"/>` +
      `<path d="M50 26 L38 20 M50 38 L35 31 M50 50 L34 43 M50 62 L38 55 M50 26 L62 20 M50 38 L65 31 M50 50 L66 43 M50 62 L62 55" stroke="#c9a85a" stroke-opacity=".7" stroke-width=".9" stroke-linecap="round"/></g>` +
      `<path d="M80 18 L82 25 L89 27 L82 29 L80 36 L78 29 L71 27 L78 25 Z" fill="#fff3c4" stroke="#e6c56f" stroke-width=".8" stroke-linejoin="round"/>` +
      `<path d="M20 28 L21.5 33 L26 34.5 L21.5 36 L20 41 L18.5 36 L14 34.5 L18.5 33 Z" fill="#fff3c4"/><circle cx="86" cy="58" r="1.6" fill="#ffe08a"/>`,
    // Bi: two cupped hands gently holding a small sparrow.
    bi: (u) =>
      halo(u, "#f0b8a0", 0.4) +
      `<defs>${grad(u + "h", "#f0c8a0", "#c4896a")}${grad(u + "b", "#b89468", "#7a5a38")}</defs>` +
      `<ellipse cx="50" cy="44" rx="17" ry="14" fill="url(#${u}b)" stroke="#4a3220" stroke-width="1.3"/>` +
      `<path d="M62 40 C70 36 76 38 80 44 C74 44 68 46 64 50 Z" fill="#7a5a38" stroke="#4a3220" stroke-width="1.1" stroke-linejoin="round"/>` +
      `<circle cx="40" cy="38" r="9" fill="#c4a478" stroke="#4a3220" stroke-width="1.2"/><path d="M31 38 L26 40 L31 42 Z" fill="#e0a040" stroke="#7a5018" stroke-width=".8" stroke-linejoin="round"/>` +
      `<circle cx="39" cy="36" r="1.6" fill="#2a1a10"/><path d="M46 46 C52 50 58 50 64 46" fill="none" stroke="#e8d0a8" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>` +
      `<path d="M10 58 C10 52 18 52 24 56 C34 62 66 62 76 56 C82 52 90 52 90 58 C90 78 72 90 50 90 C28 90 10 78 10 58 Z" fill="url(#${u}h)" stroke="#6a3e22" stroke-width="1.5" stroke-linejoin="round"/>` +
      `<path d="M24 68 C32 78 42 82 50 82 M76 68 C70 74 66 77 62 79" fill="none" stroke="#6a3e22" stroke-opacity=".5" stroke-width="1.2" stroke-linecap="round"/>` +
      `<path d="M50 18 C46 14 50 10 54 12" fill="none" stroke="#f0b8a0" stroke-width="1.6" stroke-linecap="round"/>`,
    // Tùy hỷ: joined palms (sadhu), soft rays of shared joy.
    tuy_hy: (u) =>
      halo(u, "#fff0b8", 0.6) +
      `<defs>${grad(u + "h", "#f2d2b0", "#c88c66", false)}</defs>` +
      [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) =>
        `<path transform="rotate(${a} 50 52)" d="M50 6 L50 16" stroke="#e6c56f" stroke-opacity="${a % 60 ? 0.45 : 0.85}" stroke-width="2" stroke-linecap="round"/>`).join("") +
      `<path d="M50 26 C44 34 40 44 40 56 L40 72 C40 82 44 88 50 90 Z" fill="url(#${u}h)" stroke="#6a3e22" stroke-width="1.4" stroke-linejoin="round"/>` +
      `<path d="M50 26 C56 34 60 44 60 56 L60 72 C60 82 56 88 50 90 Z" fill="url(#${u}h)" stroke="#6a3e22" stroke-width="1.4" stroke-linejoin="round" fill-opacity=".92"/>` +
      `<path d="M50 28 L50 88" stroke="#6a3e22" stroke-width="1.3" stroke-linecap="round"/>` +
      `<path d="M45 40 C43 48 43 58 44 66 M55 40 C57 48 57 58 56 66" fill="none" stroke="#fff0dc" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/>` +
      `<path d="M40 74 L60 74" stroke="#e6c56f" stroke-width="2" stroke-linecap="round"/>`,
    // Chart entries without a game card yet: a small seed sprouting.
    seed: (u) =>
      halo(u, "#bfe8a0", 0.35) +
      `<defs>${grad(u + "s", "#c9a064", "#7a5a30")}${grad(u + "l", "#9ad07a", "#4f9a54", false)}</defs>` +
      `<ellipse cx="50" cy="82" rx="30" ry="8" fill="#4a3626" fill-opacity=".7"/>` +
      `<path d="M50 80 C49 68 51 58 50 48" stroke="#4f9a54" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
      `<path d="M50 52 C34 54 26 44 28 34 C40 34 48 40 50 52 Z" fill="url(#${u}l)" stroke="#2f6a3f" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<path d="M50 48 C62 48 72 40 72 28 C60 28 51 36 50 48 Z" fill="url(#${u}l)" stroke="#2f6a3f" stroke-width="1.2" stroke-linejoin="round"/>` +
      `<ellipse cx="50" cy="80" rx="9" ry="6" fill="url(#${u}s)" stroke="#4a3018" stroke-width="1.2"/>`,
    // Unmet card: a dim silhouette with a question mark.
    unknown: () =>
      `<circle cx="50" cy="50" r="34" fill="#ffffff" fill-opacity=".04" stroke="currentColor" stroke-opacity=".4" stroke-width="2" stroke-dasharray="5 5"/>` +
      `<text x="50" y="62" text-anchor="middle" font-size="34" fill="currentColor" fill-opacity=".5">?</text>`,
  };

  function svg(gameId, size = 56) {
    const draw = ART[gameId] && gameId !== "unknown" ? ART[gameId] : ART.seed;
    const u = "cza" + ++uid + "_";
    return `<svg class="cza-svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" xmlns="http://www.w3.org/2000/svg">${draw(u)}</svg>`;
  }
  function silhouette(size = 56) {
    return `<svg class="cza-svg cza-unknown" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Chưa gặp" xmlns="http://www.w3.org/2000/svg">${ART.unknown()}</svg>`;
  }
  return { svg, silhouette };
})();
