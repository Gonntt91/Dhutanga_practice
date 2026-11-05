// More beings and errands, built on Mind.kit (see mind.js):
// thọ thần and the lost child, the hungry-ghost grandmother and sharing merit, địa thần's lamp,
// the cave of hungry ghosts, the lotus pond, and the heavenly palace at the old stupa.
// Stories are short retellings in the spirit of the Vimānavatthu / Petavatthu and still need a teacher's review.
(() => {
  const K = Mind.kit;
  const P = () => World.PLACES;
  const api = () => K.api();
  const dark = () => (api() ? api().darkness() : 0);
  const dusk = () => dark() >= 0.4;
  const night = () => dark() >= 0.5;
  const Q = (k) => (K.S.q[k] = K.S.q[k] || { step: "none" });
  const has = (id) => K.S.items.includes(id);
  const villageRole = () => ["monk", "villager"].includes(K.role());
  const snoozed = (q) => q.snooze && Date.now() < q.snooze;
  const snooze = (q, ms = 60000) => { q.snooze = Date.now() + ms; K.save(); };
  const toast = (t) => api() && api().toast(t);
  const sound = () => api() && api().sound();
  const fx = { treeT: 0, peta: null, earth: 0, sparks: [] };

  const spot = {
    tree: () => ({ x: P().gao.x + 38, y: P().gao.y + 14 }),
    child: () => ({ x: P().bamboo.x - 14, y: P().bamboo.y + 30 }),
    mother: () => ({ x: P().village.x - 46, y: P().village.y - 8 }),
    peta: () => ({ x: P().graves.x + 44, y: P().graves.y - 26 }),
    granny: () => ({ x: P().well.x + 22, y: P().well.y + 8 }),
    earth: () => ({ x: P().gate.x + 58, y: P().gate.y + 4 }),
  };
  const place = (k) => P()[k] || null;
  const stand = (pt, dx = 26, dy = 6) => ({ x: pt.x + dx, y: pt.y + dy });

  // ---------- thọ thần and bé Na ----------
  function treeMeet() {
    const q = Q("tree");
    if (sound()) NightAudio.bell(0.4);
    K.showSheet({
      label: "Gốc cây gạo",
      lines: ["Lá cây gạo sáng lên từng chiếc. Một bà cụ hiền hậu hiện ra từ thân cây.", "“Có đứa bé lạc trong bụi tre, khóc mãi. Đưa nó về nhà giúp ta nhé.”"],
      choices: [
        { label: "Đi tìm đứa bé", primary: true, fn: () => { q.step = "child"; K.save(); K.closeSheet(); api().goTo(spot.child().x + 24, spot.child().y + 8); } },
        { label: "Xem tâm vị ấy", fn: () => K.beingMind("Tâm của thọ thần", "Vị này hiền, thương người, ít giận.", [["Không tham", 70, true], ["Không sân", 84, true], ["Không si", 60, true], ["Tham", 22, false], ["Sân", 10, false], ["Si", 30, false]], "Theo kinh điển, thọ thần là chư thiên ở mặt đất, nương nơi cây lớn, nhờ phước đời trước.", treeMeet) },
        { label: "Để sau", fn: () => { snooze(q); K.closeSheet(); } },
      ],
    });
  }
  function childFound() {
    const q = Q("tree");
    if (sound()) NightAudio.sigh && NightAudio.sigh();
    K.showSheet({
      label: "Bụi tre",
      lines: ["Bé Na ngồi thu lu sau bụi tre, khóc nấc. Hai bàn tay lấm đất."],
      choices: [
        { label: "Quát: “Về nhà ngay!”", fn: () => {
          K.grow("san", 2); q.step = "follow"; q.scared = true; K.save(); K.closeSheet(); api().swingMood(-0.15);
          K.award("san", "Người này thấy đứa bé lạc mà bực, quát lên.", () => { K.cooldown(2500); toast("Bé Na càng khóc to hơn, nhưng vẫn lẽo đẽo đi theo."); });
        } },
        { label: "Ngồi xuống, dỗ dành", primary: true, fn: () => {
          K.grow("san", -1.5); K.grow("tin", 1); q.step = "follow"; K.save(); K.closeSheet(); api().swingMood(0.2);
          K.award("bi", "Người này thấy bé Na khóc, ngồi xuống dỗ dành, muốn bé bớt sợ.", () => { K.cooldown(2500); toast("Bé Na nắm tay, đi theo về làng."); api().goTo(spot.mother().x + 24, spot.mother().y + 10); });
        } },
      ],
    });
  }
  function childHome() {
    const q = Q("tree");
    K.showSheet({
      label: "Ngõ làng",
      lines: ["Mẹ bé Na chạy ra ôm chầm lấy con, khóc mà cười.", "“Con tôi đây rồi. Cảm ơn, cảm ơn.”"],
      choices: [{ label: "Tiếp", primary: true, fn: () => {
        q.step = "thank"; K.save(); K.closeSheet(); api().swingMood(0.25);
        K.award("tuy_hy", "Người này thấy hai mẹ con đoàn tụ và vui lây niềm vui của họ.", () => { K.cooldown(2500); toast(dusk() ? "Ở gốc cây gạo, lá lại sáng lên." : "Lúc chạng vạng, quay lại gốc cây gạo nhé."); });
      } }],
    });
  }
  function treeThanks() {
    const q = Q("tree");
    K.showSheet({
      label: "Gốc cây gạo",
      lines: ["Thọ thần mỉm cười. Một chiếc lá gạo rơi xuống, vẫn còn sáng.", "“Giữ lấy. Có những dấu vết chỉ hiện ra cho người có lòng.”"],
      choices: [{ label: "Nhận chiếc lá", primary: true, fn: () => {
        q.step = "done"; K.giveItem("la_gao"); K.save(); K.closeSheet(); K.setOpen(true);
        K.gotItem("la_gao", () => { K.setOpen(false); K.cooldown(2500); });
      } }],
    });
  }

  // ---------- the hungry-ghost grandmother (Kinh Ngoài Bức Tường) ----------
  function petaMeet() {
    const q = Q("peta");
    K.showSheet({
      label: "Giữa các ngôi mộ",
      lines: ["Một bóng người gầy guộc đứng mãi bên ngôi mộ thấp. Sương lạnh quanh chân.", "“Đói lắm… không ai nhớ.”"],
      choices: [
        { label: "Hỏi bà là ai", primary: true, fn: () => K.showSheet({
          label: "Giữa các ngôi mộ",
          lines: ["“Bà là bà ngoại đây. Lúc sống, bà tiếc từng hạt gạo, không cho ai cái gì.”", "“Giờ thì đói. Nếu có ai làm phước rồi hồi hướng, bà mới được no.”"],
          choices: [{ label: "Tiếp", primary: true, fn: () => {
            q.step = "rice"; K.save(); K.closeSheet();
            K.award("bon_xen", "Người này thấy nơi bà ngoại một đời tiếc của, không chịu chia cho ai.", () => { K.cooldown(2500); toast("Bà cụ ở giếng làng thường nấu cơm. Thử ra đó xin một bát."); });
          } }],
        }) },
        { label: "Xem tâm bà", fn: () => K.beingMind("Tâm của ngạ quỷ", "Bà đói, tiếc, nhớ nhà.", [["Tham", 80, false], ["Bỏn xẻn", 86, false], ["Si", 58, false], ["Không tham", 12, true], ["Không sân", 30, true]], "Theo kinh điển, người nặng tham và bỏn xẻn có thể sinh vào cõi ngạ quỷ, luôn đói khát.", petaMeet) },
        { label: "Sợ quá, lùi lại", fn: () => { snooze(q, 45000); K.closeSheet(); api().swingMood(-0.1); } },
      ],
    });
  }
  function grannyRice() {
    const q = Q("peta");
    K.showSheet({
      label: "Giếng làng",
      lines: ["Bà cụ nghe chuyện, gật gù: “Ừ, phải làm phước cho người đã khuất.”", "Bà xới đầy một bát cơm trắng còn nóng."],
      choices: [{ label: "Nhận bát cơm", primary: true, fn: () => {
        q.step = "offer"; K.giveItem("bat_com"); K.save(); K.closeSheet(); K.setOpen(true);
        K.gotItem("bat_com", () => { K.setOpen(false); K.cooldown(2500); toast("Đem bát cơm dâng vị sư già ở nghĩa địa."); });
      } }],
    });
  }
  function offerRice() {
    const q = Q("peta");
    K.showSheet({
      label: "Dâng cơm",
      lines: ["Sư già nhận bát cơm, chắp tay.", "“Phước này, xin hồi hướng cho bà ngoại. Mong bà được no, được an.”"],
      choices: [{ label: "Cùng hồi hướng: “Lành thay”", primary: true, fn: () => {
        q.step = "release"; K.dropItem("bat_com"); K.grow("tham", -2.5); K.grow("tin", 2); K.save(); K.closeSheet(); K.setOpen(true);
        fx.peta = { t: 0 };
        if (sound()) NightAudio.bell(0.8);
        World.lookAt(spot.peta().y - 20, spot.peta().x);
        setTimeout(() => {
          K.showSheet({
            label: "Giữa các ngôi mộ",
            lines: ["Bà ngoại ngẩng lên, cái bóng gầy guộc sáng dần.", "“Lành thay, lành thay…”, rồi bà tan vào ánh trăng."],
            choices: [{ label: "Chắp tay", primary: true, fn: () => {
              q.step = "done"; K.save(); K.closeSheet(); fx.peta = null; World.resetLook();
              K.award("khong_tham", "Người này dâng cơm và hồi hướng phước cho bà ngoại đã khuất.", () => K.cooldown(2500));
            } }],
          });
        }, 3800);
      } }],
    });
  }

  // ---------- địa thần at the village gate ----------
  function earthMeet() {
    const q = Q("earth");
    fx.earth = 0;
    K.showSheet({
      label: "Cổng làng",
      lines: ["Mặt đất ấm lên. Đom đóm xếp thành vòng. Một ông lão râu tóc bạc phơ chống gậy hiện ra.", "“Người giữ lòng ngay thì đất cũng thương. Cầm lấy ngọn đèn này.”", "“Phía đông có một tảng đá lớn. Ai chịu ngồi yên bên nó sẽ thấy điều người vội không thấy. Đèn chỉ sáng khi lòng không sợ.”"],
      choices: [
        { label: "Nhận ngọn đèn", primary: true, fn: () => {
          q.step = "done"; K.giveItem("den_nho"); K.save(); K.closeSheet(); K.setOpen(true);
          K.gotItem("den_nho", () => { K.setOpen(false); K.cooldown(2500); });
        } },
        { label: "Xem tâm vị ấy", fn: () => K.beingMind("Tâm của địa thần", "Vị này điềm tĩnh, ngay thẳng, thương người.", [["Không tham", 74, true], ["Không sân", 80, true], ["Không si", 70, true], ["Tham", 18, false], ["Sân", 14, false], ["Si", 22, false]], "Theo kinh điển, địa thần là chư thiên ở mặt đất, che chở nơi mình ở.", earthMeet) },
      ],
    });
  }

  // ---------- the cave of hungry ghosts ----------
  const CAVE = [
    { line: "Đèn soi lên vách đá ẩm. Một bóng gầy ngồi co ro: “Xưa tôi giấu cơm, nói với sư là nhà hết gạo.”" },
    { line: "Sâu hơn, một bóng khác cúi gằm: “Cả đời tôi cân thiếu cho người nghèo. Giờ tay tôi chẳng cầm được gì.”" },
  ];
  // The cave is hidden: only a big boulder shows. Sitting quietly beside it, one feels cold air from behind and finds the opening.
  function boulderVisit() {
    const q = Q("cave");
    K.showSheet({
      label: "Tảng đá lớn",
      lines: ["Một tảng đá lớn phủ rêu, mặt đá mát lạnh. Xung quanh im ắng."],
      choices: [
        { label: "Ngồi xuống nghỉ một lát", primary: true, fn: () => {
          K.showSheet({ label: "Tảng đá lớn", lines: ["Người này ngồi tựa lưng vào đá, thở chậm lại…"], choices: [] });
          api().setPose && api().setPose("sit");
          setTimeout(() => {
            api().setPose && api().setPose(null);
            q.found = true; K.save(); syncCave();
            if (sound()) NightAudio.sigh && NightAudio.sigh();
            World.lookAt(place("hang").y - 30, place("hang").x);
            K.showSheet({
              label: "Tảng đá lớn",
              lines: ["Có luồng gió lạnh lùa qua khe đá sau lưng.", "Người này quay lại nhìn: sau tảng đá là một khe hở tối om, rộng vừa một người. Một cái hang!"],
              choices: [{ label: "Lại gần miệng hang", primary: true, fn: () => { World.resetLook(); caveEnter(); } }, { label: "Để lúc khác", fn: () => { World.resetLook(); snooze(q); K.closeSheet(); } }],
            });
          }, 3200);
        } },
        { label: "Đi tiếp", fn: () => { snooze(q, 90000); K.closeSheet(); } },
      ],
    });
  }
  function syncCave() {
    const found = !!Q("cave").found;
    World.setView({ caveFound: found });
    if (place("hang")) place("hang").name = found ? "Hang đá" : "Tảng đá lớn";
  }
  function caveEnter() {
    const q = Q("cave");
    if (!has("den_nho")) {
      snooze(q, 40000);
      return K.showSheet({ label: "Hang đá", lines: ["Miệng hang tối om, gió lạnh thổi ra.", "Không có đèn thì chẳng thấy gì. Người làng nói địa thần ở cổng làng có đèn cho người ngay thẳng."], choices: [{ label: "Quay ra", fn: K.closeSheet }] });
    }
    let lamp = 3, i = 0;
    const lampText = () => ["Đèn tắt.", "Đèn leo lét.", "Đèn sáng mờ.", "Đèn sáng ấm."][lamp];
    const chamber = () => {
      if (i >= CAVE.length) return deepest();
      K.showSheet({
        label: `Hang đá · ${lampText()}`,
        lines: [CAVE[i].line],
        choices: [
          { label: "Hoảng sợ, lùi lại", fn: () => { lamp--; K.grow("san", 1); step(); } },
          { label: "Biết mình đang sợ, thở một hơi", fn: () => { K.grow("niem", 1.5); step(); } },
          { label: "Thương họ, chắp tay", primary: true, fn: () => { K.grow("san", -1); K.grow("tham", -0.5); step(); } },
        ],
      });
    };
    const step = () => {
      if (lamp <= 0) {
        K.save();
        return K.showSheet({ label: "Hang đá", lines: ["Đèn tắt. Người này lần theo vách đá ra ngoài, tim đập thình thịch.", "Lần sau, thử biết nỗi sợ thay vì chạy theo nó."], choices: [{ label: "Ra ngoài", fn: () => { snooze(q, 30000); K.closeSheet(); } }] });
      }
      i++; chamber();
    };
    const deepest = () => {
      K.showSheet({
        label: `Hang đá · ${lampText()}`,
        lines: ["Cuối hang, một bóng nhỏ ngồi ôm gối, tay cầm một mảnh giấy cũ.", "“Có cô bé tên Hạnh từng làm rơi cái này ở nghĩa địa. Tôi giữ mãi, giờ đưa lại cho người.”"],
        choices: [{ label: "Nhận mảnh giấy, chắp tay", primary: true, fn: () => {
          q.step = "done"; K.giveItem("manh_ky_uc"); K.save(); K.closeSheet(); K.setOpen(true);
          K.gotItem("manh_ky_uc", () => K.award("bi", "Người này đi sâu vào hang, gặp những hồn đói mà không bỏ chạy, chỉ thấy thương.", () => K.cooldown(4000)));
        } }],
      });
    };
    K.showSheet({
      label: "Hang đá",
      lines: ["Ngọn đèn nhỏ của địa thần sáng lên. Lối vào hang hun hút."],
      choices: [{ label: "Bước vào", primary: true, fn: chamber }, { label: "Để lúc khác", fn: () => { snooze(q); K.closeSheet(); } }],
    });
  }

  // ---------- lotus pond ----------
  function pondVisit() {
    const q = Q("pond");
    snooze(q, 8 * 60000);
    const choices = [
      { label: "Ngồi ngắm một lát", primary: true, fn: () => { K.grow("niem", 0.8); K.grow("dinh", 0.8); K.closeSheet(); api().swingMood(0.25); toast("Người này ngồi yên. Gió mát, lòng lắng xuống như mặt ao."); } },
    ];
    if (!has("hoa_sen")) choices.push({ label: "Hái nhẹ một đóa sen trắng", fn: () => { K.giveItem("hoa_sen"); K.save(); K.closeSheet(); K.setOpen(true); K.gotItem("hoa_sen", () => { K.setOpen(false); K.cooldown(2500); toast("Có thể dâng hoa lên bàn thờ ở tịnh thất."); }); } });
    choices.push({ label: "Đi tiếp", fn: K.closeSheet });
    K.showSheet({ label: "Ao sen", lines: night() ? ["Mặt ao lặng. Trăng in dưới nước, sen trắng khép cánh.", "Có tiếng ếch kêu đâu đó."] : ["Ao sen xanh mát. Chuồn chuồn đậu trên lá."], choices });
  }
  function offerLotus() {
    K.showSheet({
      label: "Tịnh thất",
      lines: ["Người này đặt đóa sen trắng lên bàn thờ, chắp tay đảnh lễ."],
      choices: [{ label: "Đảnh lễ ba lần", primary: true, fn: () => {
        K.dropItem("hoa_sen"); K.grow("tin", 2.5); K.save(); K.closeSheet(); api().swingMood(0.3);
        if (sound()) NightAudio.bell(0.7);
        K.award("hy", "Người này dâng hoa lên Đức Phật, lòng vui và nhẹ.", () => K.cooldown(2500));
      } }, { label: "Để sau", fn: () => { snooze(Q("lotus")); K.closeSheet(); } }],
    });
  }

  // ---------- the old stupa and the heavenly palace ----------
  function stupaVisit() {
    const q = Q("palace");
    if (!has("mandarava") || !night()) {
      snooze(q, 60000);
      return K.showSheet({ label: "Tháp cổ", lines: ["Ngọn tháp cổ phủ rêu, gạch đã sẫm màu.", "Người làng kể: đêm khuya, ai mang hoa trời thì thấy được lối lên."], choices: [{ label: "Chắp tay rồi đi", fn: K.closeSheet }] });
    }
    K.showSheet({
      label: "Tháp cổ",
      lines: ["Bông hoa mạn-đà-la trong túi sáng lên. Quanh tháp cổ hiện ra một lối sáng dẫn lên mây."],
      choices: [{ label: "Bước vào", primary: true, fn: enterPalace }, { label: "Để lúc khác", fn: () => { snooze(q); K.closeSheet(); } }],
    });
  }
  function enterPalace() {
    const q = Q("palace");
    K.closeSheet(); K.setOpen(true);
    if (!window.Palace) { K.setOpen(false); return toast("Lối lên thiên cung chưa mở được."); }
    if (sound()) NightAudio.bell(1);
    Palace.open({
      host: "Vị thiên",
      lines: ["Ánh sáng mở ra một tòa lâu đài trên mây.", "“Chào người lành. Xưa tôi chỉ quét sân chùa làng và thắp một ngọn đèn mỗi tối.”", "“Chừng ấy việc nhỏ mà thành chốn này.”"],
      steps: [{ text: "Một thiên nữ vội vàng làm đổ nước cam lồ lên áo người này.", choices: [{ label: "Bực bội, quát lên", outcome: "fade" }, { label: "Cười xòa, không sao", outcome: "stay" }] }],
      onEnd: (outcome) => {
        q.visits = (q.visits || 0) + 1;
        if (outcome === "stay") {
          q.step = "done"; K.grow("tin", 2); K.grow("san", -1); K.save();
          setTimeout(() => { K.award("tuy_hy", "Người này thấy vị thiên an vui nhờ việc thiện nhỏ, và vui theo.", () => { K.setOpen(false); K.cooldown(4000); }); }, 400);
        } else if (outcome === "fade") {
          K.grow("san", 2); K.save();
          setTimeout(() => { K.setOpen(false); K.cooldown(4000); toast("Tòa lâu đài tan vào sương. Người này đứng một mình bên tháp cổ. Tâm nào thì cõi nấy."); api().swingMood(-0.2); }, 2400);
        } else { K.setOpen(false); K.cooldown(4000); }
        snooze(q, 5 * 60000);
      },
    });
  }

  // ---------- registration ----------
  Mind.register({
    actors() {
      const out = [];
      if (!K.role()) return out;
      const tq = Q("tree");
      if (dusk() && tq.step !== "done") out.push({ kind: "treegod", ...spot.tree(), alpha: 0.85, label: "thọ thần" });
      else if (night() && tq.step === "done") out.push({ kind: "treegod", ...spot.tree(), alpha: 0.5, label: "" });
      if (tq.step === "child") out.push({ kind: "child", ...spot.child(), crying: true, label: "bé Na" });
      if (tq.step === "follow") { const p = World.getPlayer(); out.push({ kind: "child", x: p.x - 16, y: p.y + 4, moving: p.moving, crying: !!tq.scared, label: "bé Na" }); }
      if (tq.step === "follow" || tq.step === "thank" || tq.step === "done") out.push({ kind: "mother", ...spot.mother(), label: "mẹ bé Na" });
      if (villageRole()) {
        const pq = Q("peta");
        if (fx.peta) out.push({ kind: "peta", ...spot.peta(), glow: Math.min(1, fx.peta.t / 3), alpha: Math.max(0, 1 - Math.max(0, fx.peta.t - 3) / 1.5), label: "bà ngoại" });
        else if (night() && pq.step !== "done" && pq.step !== "release") out.push({ kind: "peta", ...spot.peta(), label: pq.step === "none" ? "" : "bà ngoại" });
        const dogStep = K.S.quest.step;
        if ((pq.step === "offer" || pq.step === "release") && !["monk", "sit", "deva", "done"].includes(dogStep)) out.push({ kind: "monk", ...K.MONK_SPOT(), label: "sư già" });
      }
      const eq = Q("earth");
      if (eq.step !== "done" && earthReady()) out.push({ kind: "earthgod", ...spot.earth(), alpha: Math.min(1, fx.earth), label: fx.earth > 0.6 ? "địa thần" : "" });
      return out;
    },
    targets() {
      const out = [];
      const tq = Q("tree"), pq = Q("peta");
      if (tq.step === "child") out.push({ title: "Tìm bé Na trong bụi tre", body: "Thọ thần nhờ đưa đứa bé lạc về nhà.", ...stand(spot.child(), 24, 8), name: "Bé Na" });
      if (tq.step === "follow") out.push({ title: "Đưa bé Na về ngõ làng", body: "Mẹ bé đang đứng chờ ở ngõ làng.", ...stand(spot.mother()), name: "Mẹ bé Na" });
      if (tq.step === "thank") out.push({ title: "Quay lại gốc cây gạo", body: dusk() ? "Thọ thần đang đợi ở gốc gạo." : "Thọ thần chỉ hiện ra lúc chạng vạng trở đi.", ...stand(spot.tree(), -30, 10), name: "Thọ thần" });
      if (villageRole()) {
        if (pq.step === "rice") out.push({ title: "Xin một bát cơm ở giếng làng", body: "Để làm phước rồi hồi hướng cho bà ngoại.", ...stand(spot.granny(), -26, 10), name: "Bà cụ" });
        if (pq.step === "offer") out.push({ title: "Dâng cơm cho sư già", body: "Sư già ngồi giữa các ngôi mộ.", ...stand(K.MONK_SPOT(), 30, 4), name: "Sư già" });
      }
      if (has("hoa_sen")) out.push({ title: "Dâng sen ở tịnh thất", body: "Đóa sen trắng đặt lên bàn thờ Đức Phật.", ...stand(P().hermitage, 0, 30), name: "Tịnh thất" });
      // rumours: no marker, only a hint and a way there
      if (tq.step === "none") out.push({ title: "Chuyện lạ ở gốc cây gạo", body: "Người làng kể lúc chạng vạng, lá cây gạo có khi sáng lên.", ...stand(P().gao, 0, 30) });
      if (villageRole() && pq.step === "none") out.push({ title: "Bóng người bên ngôi mộ thấp", body: "Ban đêm, có ai đó đứng mãi giữa nghĩa địa.", ...stand(spot.peta(), 0, 30) });
      if (place("hang") && Q("cave").step !== "done") {
        if (Q("cave").found) out.push({ title: "Hang đá sau tảng đá", body: has("den_nho") ? "Mang ngọn đèn của địa thần vào hang." : "Trong hang tối om. Cần một ngọn đèn.", ...stand(place("hang"), 0, 30), name: "Hang đá" });
        else if (has("den_nho")) out.push({ title: "Tảng đá lớn phía đông", body: "Địa thần nói: ai chịu ngồi yên bên tảng đá sẽ thấy điều người vội không thấy.", ...stand(place("hang"), 0, 30) });
      }
      if (has("mandarava") && Q("palace").step !== "done" && place("thap")) out.push({ title: "Tháp cổ trên đồi", body: night() ? "Hoa mạn-đà-la có thể mở lối lên thiên cung." : "Đợi đêm xuống rồi mang hoa mạn-đà-la tới tháp cổ.", ...stand(place("thap"), 0, 30), name: "Tháp cổ" });
      return out;
    },
    loop() {
      if (!K.role()) return false;
      if (!!Q("cave").found !== !!World.getMap().caveFound) syncCave();
      const near = K.near;
      const tq = Q("tree");
      if (!snoozed(tq)) {
        if (tq.step === "none" && dusk() && near(spot.tree(), 60)) { treeMeet(); return true; }
        if (tq.step === "child" && near(spot.child(), 40)) { childFound(); return true; }
        if (tq.step === "follow" && near(spot.mother(), 44)) { childHome(); return true; }
        if (tq.step === "thank" && dusk() && near(spot.tree(), 60)) { treeThanks(); return true; }
      }
      if (villageRole()) {
        const pq = Q("peta");
        if (!snoozed(pq)) {
          if (pq.step === "none" && night() && near(spot.peta(), 50)) { petaMeet(); return true; }
          if (pq.step === "rice" && near(spot.granny(), 44)) { grannyRice(); return true; }
          if (pq.step === "offer" && near(K.MONK_SPOT(), 54)) { offerRice(); return true; }
        }
      }
      const eq = Q("earth");
      if (eq.step !== "done" && earthReady() && !snoozed(eq) && near(spot.earth(), 56)) { earthMeet(); return true; }
      const cq = Q("cave");
      if (place("hang") && cq.step !== "done" && !snoozed(cq) && near(place("hang"), 50)) { if (cq.found) caveEnter(); else boulderVisit(); return true; }
      const oq = Q("pond");
      if (place("ao") && !snoozed(oq) && near(place("ao"), 64)) { pondVisit(); return true; }
      if (has("hoa_sen") && !snoozed(Q("lotus")) && near(P().hermitage, 50)) { offerLotus(); return true; }
      const sq = Q("palace");
      if (place("thap") && !snoozed(sq) && near(place("thap"), 52)) { stupaVisit(); return true; }
      return false;
    },
    fx(ctx, v, dt) {
      if (!K.role()) return;
      // glowing leaves drifting around the silk-cotton tree while the tree spirit is near
      if (dusk() && Q("tree").step !== "done") {
        const g = P().gao;
        if (fx.sparks.length < 26 && Math.random() < 0.5) fx.sparks.push({ x: g.x - 40 + Math.random() * 110, y: g.y - 70 - Math.random() * 60, v: 6 + Math.random() * 10, t: 0, life: 3 + Math.random() * 2 });
      }
      ctx.globalCompositeOperation = "lighter";
      for (const s of fx.sparks) {
        s.t += dt; s.y += s.v * dt; s.x += Math.sin(s.t * 2 + s.v) * 0.3;
        const a = Math.sin(Math.PI * Math.min(1, s.t / s.life)) * (1 - 0.6 * v.dayMix);
        ctx.fillStyle = `rgba(210,240,150,${0.75 * a})`;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, 2.4, 1.3, s.t, 0, 7); ctx.fill();
      }
      fx.sparks = fx.sparks.filter((s) => s.t < s.life);
      if (fx.peta) {
        fx.peta.t += dt;
        const p = spot.peta(), k = Math.min(1, fx.peta.t / 3) * Math.max(0, 1 - Math.max(0, fx.peta.t - 3.5) / 1.5);
        const g = ctx.createRadialGradient(p.x, p.y - 20, 0, p.x, p.y - 20, 90);
        g.addColorStop(0, `rgba(255,244,214,${0.45 * k})`); g.addColorStop(1, "rgba(255,244,214,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y - 20, 90, 0, 7); ctx.fill();
      }
      if (Q("earth").step !== "done" && earthReady()) {
        fx.earth = Math.min(1, fx.earth + dt * 0.5);
        const e = spot.earth();
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 60);
        g.addColorStop(0, `rgba(240,200,130,${0.2 * fx.earth})`); g.addColorStop(1, "rgba(240,200,130,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(e.x, e.y, 60, 26, 0, 0, 7); ctx.fill();
      } else fx.earth = 0;
      ctx.globalCompositeOperation = "source-over";
    },
  });
  // địa thần shows up for someone who has already done a kind deed, at dusk or night, with a fairly bright mind
  function earthReady() {
    const did = Q("tree").step === "done" || Q("peta").step === "done" || K.S.quest.step === "done";
    return did && dusk() && api() && api().mood() >= 0.5;
  }
})();

// ---------- a horse cart passing along the road now and then ----------
// An old trader drives it slowly from the village up to the hermitage (or back). Walk up to it to talk:
// hear news from the road, help push a stuck wheel, or swap a gift. Nothing is bought or sold.
(() => {
  const K = Mind.kit;
  const api = () => K.api();
  const cart = { on: false, d: 0, dir: 1, speed: 24, wait: 25 + Math.random() * 30, stuckAt: -1, stuck: false, talked: false, pause: false, phase: 0 };
  let path = null, segs = null, total = 0;
  function buildPath() {
    const m = World.getMap();
    path = m.path.map(([x, y]) => ({ x, y }));
    segs = []; total = 0;
    for (let i = 0; i < path.length - 1; i++) { const l = Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y); segs.push(l); total += l; }
  }
  function at(d) {
    let rest = Math.max(0, Math.min(total, d));
    for (let i = 0; i < segs.length; i++) {
      if (rest <= segs[i]) { const t = rest / segs[i], a = path[i], b = path[i + 1]; return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, dx: b.x - a.x, dy: b.y - a.y }; }
      rest -= segs[i];
    }
    const a = path[path.length - 2], b = path[path.length - 1];
    return { x: b.x, y: b.y, dx: b.x - a.x, dy: b.y - a.y };
  }
  const RUMOURS = [
    "“Đi ngang hang đá sau đồi, tôi nghe như có tiếng người than đói.”",
    "“Đêm rằm, người ta thấy ánh sáng quanh cái tháp cổ trên đồi.”",
    "“Ao sen đầu làng mà trăng lên thì đẹp lắm, ngồi đó lòng nhẹ hẳn.”",
    "“Cây gạo già ấy có thần đấy. Chạng vạng mà thấy lá sáng thì chớ sợ.”",
    "“Trên đường, tôi gặp một vị sư đi khất thực từ sáng sớm, chân không, mà mặt an lắm.”",
  ];
  function talk() {
    cart.pause = true;
    const S = K.S;
    const has = (id) => S.items.includes(id);
    const done = () => { cart.talked = true; cart.pause = false; cart.stuck = false; K.closeSheet(); };
    const choices = [];
    if (cart.stuck) choices.push({ label: "Ghé vai đẩy giúp", primary: true, fn: () => {
      K.grow("tan", 1.5); K.grow("tham", -0.5);
      cart.talked = true; cart.stuck = false; cart.pause = false; K.closeSheet(); api().swingMood(0.15);
      if (!has("khan_ran") && window.Items && Items.def("khan_ran")) {
        K.giveItem("khan_ran"); K.save(); K.setOpen(true);
        K.gotItem("khan_ran", () => { K.setOpen(false); K.cooldown(2500); api().toast("“Cảm ơn nhé! Cái khăn rằn này tặng người, đi đêm cho ấm.”"); });
      } else api().toast("Bánh xe lên khỏi ổ gà. Ông lái buôn cười, vẫy tay cảm ơn.");
    } });
    choices.push({ label: "Hỏi chuyện đường xa", fn: () => K.showSheet({ label: "Xe ngựa", lines: [RUMOURS[Math.floor(Math.random() * RUMOURS.length)]], choices: [{ label: "Cảm ơn ông", fn: done }] }) });
    if (has("rau_ma") && !has("banh_da")) choices.push({ label: "Tặng ông nắm rau má", fn: () => {
      K.dropItem("rau_ma"); K.giveItem("banh_da"); K.grow("tham", -1.5); K.save(); cart.talked = true; cart.pause = false; K.closeSheet(); K.setOpen(true);
      K.gotItem("banh_da", () => K.award("khong_tham", "Người này tặng ông lái buôn nắm rau má, ông đổi lại gói bánh đa.", () => K.cooldown(2500)));
    } });
    choices.push({ label: "Chào ông rồi đi", fn: done });
    K.showSheet({
      label: "Xe ngựa",
      lines: cart.stuck
        ? ["Bánh xe ngựa sa xuống ổ gà. Ông lái buôn đội nón, loay hoay đẩy mãi.", "“Ai đó giúp một tay với!”"]
        : ["Chiếc xe ngựa chậm rãi đi tới, đèn treo đung đưa. Ông lái buôn ghìm cương.", "“Đi đâu mà giờ này còn ngoài đường thế?”"],
      choices,
    });
  }
  function drawCart(ctx, v, p) {
    const night = 1 - v.dayMix;
    const shade = (r, g, b) => `rgb(${Math.round(r * (1 - 0.45 * night))},${Math.round(g * (1 - 0.45 * night))},${Math.round(b * (1 - 0.4 * night))})`;
    const f = p.dx >= 0 ? 1 : -1;
    const legs = cart.on && !cart.pause && !cart.stuck ? Math.sin(cart.phase * 9) : 0;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(f, 1);
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(4, 2, 36, 6, 0, 0, 7); ctx.fill();
    // horse (in front)
    ctx.fillStyle = shade(122, 82, 52);
    for (const [lx, ph] of [[18, 1], [22, -1], [30, -1], [34, 1]]) ctx.fillRect(lx + legs * ph * 1.6, -10, 2.4, 10);
    ctx.beginPath(); ctx.ellipse(26, -14, 11, 6, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(33, -17); ctx.lineTo(39, -27); ctx.lineTo(43, -25); ctx.lineTo(38, -14); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(42, -25, 4.2, 2.6, 0.3, 0, 7); ctx.fill();
    ctx.fillStyle = shade(60, 40, 26); ctx.fillRect(15, -18, 2, 7); // tail
    ctx.beginPath(); ctx.moveTo(34, -22); ctx.lineTo(37, -28); ctx.lineTo(35, -21); ctx.fill(); // mane
    // shafts
    ctx.strokeStyle = shade(90, 66, 40); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, -12); ctx.lineTo(24, -14); ctx.stroke();
    // cart body with a curved roof (mui)
    ctx.fillStyle = shade(140, 98, 58); ctx.fillRect(-26, -22, 28, 12);
    ctx.fillStyle = shade(96, 70, 44);
    ctx.beginPath(); ctx.moveTo(-28, -22); ctx.quadraticCurveTo(-12, -40, 4, -22); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = shade(70, 50, 30); ctx.lineWidth = 0.8;
    for (let k = -22; k <= 0; k += 6) { ctx.beginPath(); ctx.moveTo(k, -22); ctx.quadraticCurveTo(k + 2, -32, k + 4, -22); ctx.stroke(); }
    // sacks
    ctx.fillStyle = shade(196, 178, 130); ctx.beginPath(); ctx.ellipse(-18, -23, 5, 3.4, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-10, -24, 4.4, 3, 0, 0, 7); ctx.fill();
    // wheels with turning spokes
    const rot = cart.phase * 2.4;
    for (const wx of [-20, -2]) {
      ctx.strokeStyle = shade(60, 44, 28); ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(wx, -6, 6.5, 0, 7); ctx.stroke();
      ctx.lineWidth = 0.9;
      for (let s = 0; s < 4; s++) { const a = rot + s * Math.PI / 4; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 6, -6 + Math.sin(a) * 6); ctx.lineTo(wx - Math.cos(a) * 6, -6 - Math.sin(a) * 6); ctx.stroke(); }
    }
    // driver with a conical hat
    ctx.fillStyle = shade(70, 84, 88); ctx.fillRect(4, -30, 7, 10);
    ctx.fillStyle = shade(180, 140, 100); ctx.beginPath(); ctx.arc(7.5, -33, 3, 0, 7); ctx.fill();
    ctx.fillStyle = shade(214, 196, 140); ctx.beginPath(); ctx.moveTo(1, -34); ctx.lineTo(7.5, -42); ctx.lineTo(14, -34); ctx.closePath(); ctx.fill();
    // hanging lantern
    const sw = Math.sin(v.time * 2.2) * 1.4;
    ctx.strokeStyle = shade(70, 50, 30); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-28, -24); ctx.lineTo(-30 + sw, -16); ctx.stroke();
    ctx.fillStyle = "#e6c56f"; ctx.fillRect(-32.5 + sw, -16, 5, 6);
    ctx.restore();
    if (night > 0.3) {
      ctx.globalCompositeOperation = "lighter";
      const lx = p.x + f * -30, ly = p.y - 13;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 46);
      g.addColorStop(0, `rgba(230,180,100,${0.32 * night})`); g.addColorStop(1, "rgba(230,180,100,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(lx, ly, 46, 0, 7); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
    if (cart.stuck && !cart.talked) {
      ctx.font = '500 9px "Be Vietnam Pro", system-ui, sans-serif'; ctx.textAlign = "center";
      ctx.fillStyle = v.dayMix > 0.5 ? "#3a2a10" : "rgba(230,197,111,0.95)";
      ctx.fillText("xe sa lầy", p.x, p.y - 50);
    }
  }
  Mind.register({
    loop() {
      if (!K.role() || !cart.on || cart.talked || cart.pause) return false;
      const p = at(cart.d);
      if (K.near(p, 42)) { talk(); return true; }
      return false;
    },
    targets() {
      if (!cart.on || cart.talked) return [];
      const p = at(cart.d);
      return [{ title: cart.stuck ? "Xe ngựa sa lầy trên đường" : "Xe ngựa đang đi qua", body: cart.stuck ? "Ông lái buôn cần người đẩy giúp." : "Lại gần để bắt chuyện với ông lái buôn.", x: p.x + 30, y: p.y + 10 }];
    },
    fx(ctx, v, dt) {
      if (!K.role()) { cart.on = false; return; }
      if (!path) buildPath();
      if (!cart.on) {
        cart.wait -= dt;
        if (cart.wait > 0) return;
        Object.assign(cart, { on: true, dir: Math.random() < 0.6 ? -1 : 1, talked: false, stuck: false, pause: false });
        cart.d = cart.dir < 0 ? total - 10 : 10; // dir -1: from the village end up toward the hermitage
        cart.stuckAt = Math.random() < 0.4 ? total * (0.25 + Math.random() * 0.5) : -1;
      }
      if (!cart.pause && !cart.stuck) {
        cart.d += cart.dir * cart.speed * dt;
        cart.phase += dt;
        if (cart.stuckAt > 0 && Math.abs(cart.d - cart.stuckAt) < 3) { cart.stuck = true; cart.stuckUntil = performance.now() + 45000; cart.stuckAt = -1; }
      }
      if (cart.stuck && !cart.pause && performance.now() > cart.stuckUntil) cart.stuck = false; // gets out by himself eventually
      if (cart.d < 0 || cart.d > total) { cart.on = false; cart.wait = 70 + Math.random() * 110; return; }
      const p = at(cart.d);
      if (p.y > v.camY - 80 && p.y < v.camY + v.viewH + 80) drawCart(ctx, v, p);
    },
  });
  window.Cart = { spawn() { cart.wait = 0; cart.on = false; }, stuck() { cart.wait = 0; cart.on = false; setTimeout(() => { cart.stuckAt = -1; cart.stuck = true; cart.stuckUntil = performance.now() + 60000; }, 50); } };
})();
