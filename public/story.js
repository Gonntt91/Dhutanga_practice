// Story data for one night at the cemetery.
// Each role has a meter (0–10). Text lines and choices may depend on "flags":
// kinds of traces left by other players tonight, or live moments heard this session.
//   line: string | { if: flag, text } | { unless: flag, text }
//   choice: { label, delta, next, trace?: {kind, variant}, emit?: topic, if?, unless? }

window.TRACE_TEXT = {
  offering: [
    "đặt nửa vắt cơm lên một ngôi mộ không tên",
  ],
  chant: [
    "tụng kinh Từ (Mettā) bằng tiếng Pāli, hồi hướng cho những người nằm đây",
    "rải tâm từ cho người đã xua đuổi mình sáng qua",
  ],
  sigh: [
    "thở dài giữa các ngôi mộ",
  ],
  incense: [
    "thắp một nén nhang ở ngôi mộ không tên",
  ],
  alms: [
    "mang cơm ra cổng nghĩa địa lúc gà gáy",
  ],
  release: [
    "nhẹ đi khi sương tan, và không còn ở lại",
  ],
  vigil: [
    "ngồi trọn đêm, không nằm xuống",
  ],
  keepsake: [
    "để một món đồ cũ ra chỗ có thể thấy",
  ],
  lamp: [
    "đặt một ngọn đèn nhỏ ở chân bụi tre",
  ],
  bowl: [
    "để lại một bát nước và nắm cơm bên đường mòn",
  ],
};

window.ROLE_INFO = {
  monk: {
    name: "Nhà sư",
    who: "Thầy Tịnh",
    meter: "Tâm an",
    blurb: "Sáng nay bị xua đuổi. Đêm nay ngồi giữa nghĩa địa, không nằm.",
    gesture: { topic: "chime", label: "Rung chuông nhỏ" },
  },
  ghost: {
    name: "Hồn ma",
    who: "Bà Sáu bán xôi",
    meter: "Chấp",
    blurb: "Đã đứng ở chỗ đất này lâu lắm. Vẫn chờ con gái về.",
    gesture: { topic: "sigh", label: "Thở dài" },
  },
  villager: {
    name: "Người dân",
    who: "Ông Tư đầu xóm",
    meter: "Lòng tin",
    blurb: "Người đã đuổi nhà sư sáng nay. Lén theo ra nghĩa địa xem thực hư.",
    gesture: { topic: "lantern", label: "Giơ đèn lồng" },
  },
};

window.STORY = {
  monk: {
    start: "a0",
    meterStart: 5,
    scenes: {
      a0: {
        time: "Sáng sớm",
        place: "village",
        lines: [
          "Trời chưa sáng hẳn, sương còn đọng trên mái ngói. Thầy ôm bát ra ngõ, chân đất, mắt nhìn xuống. Khất thực là không xin, không nói, chỉ đứng yên trước cửa. Ai cho thì nhận, ai không cho thì đi tiếp.",
          "Ngõ có bảy nhà. Cái bụng thầy đi trước thầy nửa bước.",
        ],
        choices: [
          { unlessv: "v_h1", label: "Dừng trước nhà có tiếng trẻ con", delta: 0, next: "a1", set: "v_h1" },
          { unlessv: "v_h2", label: "Dừng trước nhà có con chó vàng ngồi chình ình ở cổng", delta: 0, next: "a2", set: "v_h2" },
          { label: "Đi tới nhà cuối ngõ, nhà thứ bảy", delta: 0, next: "a3" },
        ],
      },
      a1: {
        time: "Sáng sớm",
        place: "village",
        lines: [
          "Một đứa bé chạy ra, tay nắm chặt cục xôi to hơn cả bàn tay nó. Nó đặt vào bát bằng hai tay, nghiêm trang như đang làm đại lễ.",
          "Trong nhà, tiếng mẹ nó vọng ra: “Đừng có làm rơi! Đó là phần ăn sáng của con đó!”",
          "Đứa bé nhìn cục xôi, nhìn thầy, rồi nhìn lại cục xôi. Thầy cố nhịn cười.",
        ],
        choices: [
          { label: "Cúi đầu cảm ơn, đi tiếp", delta: 1, next: "a0" },
        ],
      },
      a2: {
        time: "Sáng sớm",
        place: "village",
        lines: [
          "Con chó vàng ngồi chặn đúng giữa cổng, nhìn thầy, nhìn bát, rồi nhìn thầy lần nữa. Nó có vẻ nghĩ đây là một cuộc thương lượng.",
          "Chủ nhà không thấy đâu. Thầy đứng yên ba phút. Con chó cũng đứng yên ba phút. Không ai nhường ai.",
        ],
        choices: [
          { label: "Mỉm cười, đi tiếp. Thầy không có gì để thương lượng", delta: 1, next: "a0" },
          { label: "Đứng thêm một lát, xem ai thắng", delta: 0, next: "a0" },
        ],
      },
      a3: {
        time: "Sáng sớm",
        place: "village",
        lines: [
          { ifv: "v_alms", text: "Nhà thứ bảy. Người đàn ông vẫn đứng ngoài ngõ, nhưng hôm nay ông không chặn. Ông nhìn cái bát rất lâu rồi quay vào nhà. Chưa phải là cho, nhưng cũng chưa phải là đuổi." },
          { unlessv: "v_alms", text: "Nhà thứ bảy. Một người đàn ông đứng chắn ngõ, tay chống nạnh: “Đi chỗ khác. Thời này sư giả nhiều lắm.”" },
          "Thầy không cãi, không giải thích. Thầy cúi đầu, quay đi.",
        ],
        choices: [
          { label: "Đi tiếp. Bát nhẹ, nhưng bước chân không nặng", delta: 1, next: "m1" },
          { label: "Đi tiếp, nhưng câu nói ấy đi theo", delta: -1, next: "m1" },
        ],
      },
      m1: {
        time: "Chiều tàn",
        place: "gate",
        lines: [
          "Cả ngày thầy đi, trong bát chỉ còn nửa vắt cơm nguội.",
          "Mặt trời xuống sau rặng tre. Câu nói ở nhà thứ bảy vẫn còn đâu đó trong ngực.",
        ],
        choices: [
          { label: "Nghĩ lại câu nói ấy, thấy nóng mặt", delta: -1, next: "m2" },
          { label: "Ghi nhận nó, rồi đặt xuống như đặt bát", delta: 1, next: "m2" },
        ],
      },
      m2: {
        time: "Chạng vạng",
        place: "gate",
        lines: [
          "Cổng nghĩa địa không có cánh. Mộ đất lẫn mộ vôi tróc lở, nhang tàn cắm xiêu vẹo.",
          "Thầy tự nhủ: không sợ. Cái bụng thầy nghe vậy, bèn kêu một tiếng dài, như phản đối.",
          "Xa xa có tiếng chó sủa, rồi im.",
          { if: "lantern", text: "Sau bụi tre, có một đốm đèn lồng vừa lay động rồi tắt. Có ai đó đang ở gần đây." },
        ],
        choices: [
          { label: "Đi chậm vào, mắt nhìn xuống đất", delta: 0, next: "m3" },
          { label: "Đi sâu vào giữa những ngôi mộ không ai thăm", delta: 1, next: "m3" },
        ],
      },
      m3: {
        time: "Đầu hôm",
        place: "graves",
        lines: [
          "Trước khi ngồi, thầy mở bát. Nửa vắt cơm đã khô cứng.",
          "Bên cạnh có một ngôi mộ thấp, không bia, cỏ mọc kín.",
          { if: "keepsake", text: "Sát mộ có chiếc nón lá cũ, mới lúc nãy chưa thấy. Ai đó vừa để nó ra chỗ này." },
          { if: "lamp", text: "Phía bụi tre có ngọn đèn nhỏ ai vừa đặt, ánh sáng ấm đủ để thấy đường." },
        ],
        choices: [
          { label: "Đặt cơm lên ngôi mộ không tên, khấn thí thực", delta: 1, next: "m4", trace: { kind: "offering", variant: 0 }, remember: "m_offered" },
          { label: "Giữ lại cho sáng mai", delta: 0, next: "m4" },
        ],
      },
      m4: {
        time: "Canh hai",
        place: "graves", pose: "sit",
        lines: [
          "Lá khô xào xạc phía sau lưng, đều đều như bước chân. Thầy đã định bụng là gió. Gió thì đâu có đi theo nhịp.",
          { if: "sigh", text: "Rồi có tiếng thở dài, rất gần. Không phải gió. Đêm nay thầy không ngồi một mình." },
          { unless: "sigh", text: "Thầy nín thở nghe. Chỉ có tiếng dế." },
          "Tim đập nhanh. Sợ là thật.",
        ],
        choices: [
          { label: "Mở mắt quay lại nhìn", delta: -1, next: "m5" },
          { label: "Biết mình đang sợ, để nỗi sợ ở đó, theo dõi hơi thở", delta: 2, next: "m5" },
          { label: "Rung chuông nhỏ một tiếng", delta: 1, next: "m5", emit: "chime" },
        ],
      },
      m5: {
        time: "Canh ba",
        place: "graves", pose: "sit",
        lines: [
          "Cơn buồn ngủ kéo đến như nước lên. Đầu gục xuống một lần, hai lần. Lần thứ ba, trán suýt chạm đất, thầy giật mình, nhìn quanh xem có ai thấy không. May là chỉ có người chết.",
          "Hạnh ngồi không nằm. Đất ẩm và mát. Nằm xuống một chút thôi cũng chẳng ai biết.",
          { if: "bowl", text: "Cạnh lối mòn có nồi nước ai để sẵn, chạm vào còn mát. Thầy cúi đầu cảm ơn người chưa gặp." },
        ],
        choices: [
          { label: "Nằm xuống một chút", delta: -2, next: "m6" },
          { label: "Đứng dậy đi kinh hành quanh các ngôi mộ", delta: 1, next: "m6" },
          { label: "Ngồi thẳng lưng, theo dõi hơi thở, ghi nhận từng ý nghĩ đi qua", delta: 0, next: "m5w" },
        ],
      },
      m5w: {
        time: "Canh ba",
        place: "graves", pose: "sit",
        watch: {
          seconds: 36,
          intro: "Thầy ngồi thẳng. Hơi vào, hơi ra. Ý nghĩ nào trôi tới thì chạm vào nó, gọi tên nó, rồi quay về hơi thở.",
          thoughts: [
            { kind: "nghĩ", text: "Mai ăn gì nhỉ? Mà mai thầy có gì để ăn đâu." },
            { kind: "nghĩ", text: "Câu nói sáng nay… lẽ ra thầy nên đáp lại thế này." },
            { kind: "muốn", text: "Một ly trà nóng. Chỉ một ly thôi." },
            { kind: "muốn", text: "Giá mà trời sáng sớm hơn một chút." },
            { kind: "đau", text: "Chân trái tê rồi. Chân phải cũng bắt đầu tê theo." },
            { kind: "đau", text: "Một con muỗi đang đậu ngay trên mũi thầy." },
            { kind: "nghe", text: "Có tiếng sột soạt sau lưng. Có thật không?" },
            { kind: "nghe", text: "Tiếng dế. Tiếng gió. Hình như có cả tiếng thở." },
          ],
          results: [
            { min: 0, text: "Thầy lạc hơi nhiều, lạc rồi lại nhớ ra là mình đang ngồi. Lúc nhớ ra, thầy cười thầm. Nhớ ra cũng là một lần quay về." },
            { min: 3, text: "Có những ý nghĩ trôi qua, thầy chạm vào, gọi tên, rồi thả. Muỗi thì vẫn ở trên mũi, nhưng thầy đã bớt giận nó." },
            { min: 6, text: "Ý nghĩ đến rồi đi như người qua cổng. Thầy không đuổi, không mời, chỉ đứng yên làm cái cổng." },
          ],
          delta: [0, 1, 2],
          next: "m6",
        },
      },
      m6: {
        time: "Canh tư",
        place: "graves", pose: "sit",
        lines: [
          "Sương xuống. Trời chưa sáng nhưng đã bớt đen.",
          { if: "incense", text: "Có mùi nhang mới thoang thoảng từ đâu đó. Đêm nay đã có người thắp nhang ở đây." },
          "Thầy chắp tay. Còn lại một việc trước khi trời sáng.",
        ],
        choices: [
          { label: "Tụng kinh Từ (Mettā), hồi hướng cho những người nằm đây", delta: 1, next: "end", trace: { kind: "chant", variant: 0 } },
          { label: "Rải tâm từ cho người đàn ông đã xua đuổi mình", delta: 2, next: "end", trace: { kind: "chant", variant: 1 } },
        ],
      },
      end: {
        time: "Rạng sáng",
        place: "graves", pose: "sit",
        end: true,
        endings: [
          { max: 3, text: "Trời sáng. Thầy đứng dậy, chân tê, lòng còn nặng. Đêm nay tâm đã chạy theo tiếng lá, theo cơn buồn ngủ, theo câu nói sáng qua. Không sao cả. Hạnh đầu đà là để thấy mình, không phải để thắng. Đêm mai lại ngồi." },
          { max: 7, text: "Gà gáy ở xóm dưới. Có lúc thầy sợ, có lúc thầy mệt, nhưng lần nào cũng quay về được với hơi thở. Thầy đắp lại y, cầm bát, đi về phía làng. Hôm nay sẽ đi lại con đường cũ, qua cả nhà thứ bảy." },
          { max: 10, text: "Ánh sáng đầu tiên chạm vào những tấm bia vôi. Đêm qua có sợ, có buồn ngủ, có giận, và thầy thấy rõ từng thứ khi nó đến và khi nó đi. Nghĩa địa không còn là nơi đáng sợ, chỉ là một chỗ đất có nhiều người đã nằm xuống. Thầy cúi đầu chào họ rồi đi.", trace: { kind: "vigil", variant: 0 } },
        ],
      },
    },
  },

  ghost: {
    start: "g1",
    meterStart: 7,
    scenes: {
      g1: {
        time: "Chiều tàn",
        place: "gao",
        lines: [
          "Bà đứng ở chỗ đất này đã lâu lắm, lâu đến mức không còn đếm ngày.",
          "Người ta đi ngang mà không nhìn. Có ai đó cắm nhang ở mộ bên cạnh, mộ của bà thì không.",
          "Bà nhớ mẹt xôi, nhớ cái nón, nhớ con bé Hạnh đứng chờ ở cửa.",
          { ifv: "m_offered", text: "Trên mộ bên cạnh còn vệt cơm khô của đêm trước. Bà nhìn nó rất lâu." },
        ],
        choices: [
          { label: "Gọi tên con gái", delta: 1, next: "g2" },
          { label: "Ngồi xuống bên ngôi mộ thấp không bia", delta: 0, next: "g2" },
        ],
      },
      g2: {
        time: "Chạng vạng",
        place: "gao",
        lines: [
          "Một người áo nâu sồng bước vào, chân đất, tay ôm bát. Ông ta không cắm nhang, không khấn, cứ thế ngồi xuống giữa các ngôi mộ.",
          { if: "chime", text: "Một tiếng chuông nhỏ vang lên. Đã lâu lắm rồi không ai rung chuông ở đây." },
          { if: "lamp", text: "Chân bụi tre có ngọn đèn nhỏ ai vừa đặt. Ánh sáng ấm, bà không dám lại gần." },
          "Bà thấy khó chịu. Đây là chỗ của bà.",
        ],
        choices: [
          { label: "Làm lá khô xào xạc sau lưng ông ta", delta: 1, next: "g3", emit: "sigh", trace: { kind: "sigh", variant: 0 } },
          { label: "Đứng xa mà nhìn", delta: 0, next: "g3" },
        ],
      },
      g3: {
        time: "Canh hai",
        place: "graves",
        lines: [
          "Cái đói kéo đến, cái đói không có đáy, không phải của bụng.",
          { if: "offering", text: "Trên ngôi mộ thấp không bia có nửa vắt cơm. Ai đó vừa đặt xuống đêm nay. Bà nhận ra đó là mộ của mình." },
          { unless: "offering", text: "Trên các ngôi mộ chỉ có trái cây đã thâm, cúng cho người khác." },
        ],
        choices: [
          { if: "offering", label: "Lại gần vắt cơm. Có người vẫn nhớ tới bà", delta: -2, next: "g4" },
          { unless: "offering", label: "Lục tìm đĩa trái cây trên mộ người khác", delta: 1, next: "g4" },
          { label: "Chịu đói, đứng yên", delta: 0, next: "g4" },
        ],
      },
      g4: {
        time: "Canh ba",
        place: "graves",
        lines: [
          "Có một ký ức trồi lên: năm nước lớn, bà gánh xôi đi chợ sớm, nước ngập tới gối rồi tới ngực.",
          "Con bé Hạnh đứng ở cửa đợi. Bà không về.",
          { if: "lantern", text: "Phía bụi tre có ánh đèn lồng. Bà tưởng con gái mình, chạy lại, nhưng đó là một người đàn ông lạ đang run." },
        ],
        choices: [
          { label: "Muốn quay về căn nhà ấy, bằng mọi giá", delta: 1, next: "g5" },
          { label: "Lần đầu tiên tự hỏi: mình đã đi rồi sao?", delta: -2, next: "g5" },
        ],
      },
      g5: {
        time: "Canh tư",
        place: "graves",
        lines: [
          { if: "chant", text: "Từ chỗ người áo nâu ngồi, có tiếng tụng rất khẽ. Không ai tụng cho bà từ lâu lắm rồi. Mỗi câu như một bàn tay đặt lên vai." },
          { unless: "chant", text: "Đêm im lặng. Bà chờ, mà không biết mình đang chờ gì." },
        ],
        choices: [
          { if: "chant", label: "Lại gần, ngồi xuống nghe hết bài kinh", delta: -3, next: "end" },
          { if: "chant", label: "Bịt tai, quay đi", delta: 1, next: "end" },
          { unless: "chant", label: "Chờ tiếp", delta: 1, next: "end" },
          { unless: "chant", label: "Thì thầm với con gái: “Mẹ xin lỗi, mẹ không về được”", delta: -2, next: "end" },
        ],
      },
      end: {
        time: "Rạng sáng",
        place: "graves",
        end: true,
        endings: [
          { max: 3, text: "Sương tan. Bà thấy mình nhẹ đi, như mẹt xôi đã bán hết. Căn nhà, con bé, cơn nước lớn vẫn còn đó nhưng không còn kéo bà lại. Lần đầu tiên sau rất lâu, bà không đứng chờ nữa.", trace: { kind: "release", variant: 0 } },
          { max: 7, text: "Trời sáng. Bà vẫn còn ở đây, nhưng đêm qua có một lúc bà đã quên đứng chờ. Có lẽ đêm mai sẽ dễ hơn." },
          { max: 10, text: "Mặt trời lên. Bà lùi vào bóng cây gạo, vẫn nhìn về phía con đường. Một đêm nữa đã qua, và bà còn ở lại." },
        ],
      },
    },
  },

  villager: {
    start: "v1",
    meterStart: 4,
    scenes: {
      v1: {
        time: "Chiều tàn",
        place: "gate",
        lines: [
          "Sáng nay ông Tư đứng chắn ngõ, đuổi một ông sư đi. Thời buổi này sư giả nhiều, ông nói vậy với vợ.",
          "Chiều ra đồng về, ông thấy ông sư ấy đi một mình về phía nghĩa địa, chứ không phải phía chùa.",
        ],
        choices: [
          { label: "“Chắc chắn có trò gì.” Theo xem cho biết", delta: -1, next: "v2" },
          { label: "Thấy áy náy, lặng lẽ đi theo", delta: 1, next: "v2" },
        ],
      },
      v2: {
        time: "Chạng vạng",
        place: "bamboo",
        lines: [
          "Ông nấp sau bụi tre ở bờ rào nghĩa địa. Muỗi nhiều, đất lạnh.",
          "Ông sư ngồi xuống giữa các ngôi mộ, không đèn, không nhang, không ai.",
          { if: "chime", text: "Có tiếng chuông nhỏ. Ông Tư giật mình đến suýt làm rơi đèn." },
        ],
        choices: [
          { label: "Giơ đèn lồng lên cho rõ", delta: 0, next: "v3", emit: "lantern" },
          { label: "Tắt đèn, ngồi im trong bóng tối", delta: 1, next: "v3" },
        ],
      },
      v3: {
        time: "Canh hai",
        place: "bamboo",
        lines: [
          { if: "sigh", text: "Có một vệt sáng mờ trôi giữa các ngôi mộ, nhạt như hơi sương. Rồi tiếng thở dài. Ông dụi mắt mấy lần." },
          { unless: "sigh", text: "Gió lùa qua bụi tre nghe như ai đang gọi tên. Ông tự nhủ là gió." },
          "Ông sư vẫn ngồi yên.",
        ],
        choices: [
          { label: "Lắp bắp niệm Phật", delta: 1, next: "v4" },
          { label: "Chạy một mạch ra tới cổng, rồi dừng lại", delta: 0, next: "v4" },
          { label: "“Toàn chuyện bịa. Ông ta đang diễn.”", delta: -1, next: "v4" },
        ],
      },
      v4: {
        time: "Canh ba",
        place: "graves",
        lines: [
          { if: "offering", text: "Ông thấy nửa vắt cơm đặt trên ngôi mộ thấp không bia. Đó là mộ bà Sáu bán xôi, chết năm nước lớn. Hồi nhỏ ông hay ăn chịu xôi của bà, chưa trả hết." },
          { unless: "offering", text: "Ông sư không ăn gì cả. Từ trưa tới giờ ông ta chưa ăn." },
          { if: "keepsake", text: "Cạnh mộ có chiếc nón lá cũ. Ông thấy quen quen, mà không nhớ đã thấy ở đâu." },
          "Ông Tư đã bò lại gần hơn từ lúc nào, giờ ngồi ôm gối sau một ngôi mộ. Không hiểu sao chân không đi về được.",
        ],
        choices: [
          { label: "Nghĩ: người này là thật", delta: 2, next: "v5" },
          { label: "Nghĩ: chắc sáng mai ông ta sẽ xin tiền", delta: -1, next: "v5" },
        ],
      },
      v5: {
        time: "Gà gáy",
        place: "gate",
        lines: [
          { if: "chant", text: "Trước khi trời sáng, ông nghe tiếng tụng kinh rất khẽ. Ông không hiểu chữ nào, nhưng thấy cổ họng nghẹn lại." },
          "Gà gáy ở xóm. Ông sư đứng dậy.",
        ],
        choices: [
          { label: "Về nhà nấu cơm, mang ra cổng đặt vào bát ông sư", delta: 2, next: "end", trace: { kind: "alms", variant: 0 }, remember: "v_alms" },
          { label: "Thắp một nén nhang ở ngôi mộ không tên", delta: 1, next: "end", trace: { kind: "incense", variant: 0 } },
          { label: "Về ngủ, không kể với ai", delta: -1, next: "end" },
        ],
      },
      end: {
        time: "Rạng sáng",
        place: "gate",
        end: true,
        endings: [
          { max: 3, text: "Ông Tư về ngủ một giấc dài. Chuyện đêm qua ông cho là do mệt. Nhưng sáng hôm sau, khi ông sư đi ngang ngõ, ông không đứng chắn nữa." },
          { max: 7, text: "Ông Tư kể cho vợ nghe, kể lộn xộn, chỗ nhớ chỗ quên. Vợ ông cười. Ông không cãi. Đêm đó ông nằm nghĩ mãi về ngôi mộ không tên." },
          { max: 10, text: "Sáng hôm ấy cả xóm thấy ông Tư, người khó tính nhất làng, đứng ở cổng nghĩa địa với một nồi cơm còn nóng. Ông không nói gì nhiều, chỉ cúi đầu khi đặt cơm vào bát." },
        ],
      },
    },
  },
};

window.TRUE_ENDING = [
  "Bạn đã đi qua đêm này ba lần, bằng ba đôi mắt.",
  "Tiếng lá mà thầy Tịnh tưởng là bước chân, là bà Sáu đang làm ồn vì sợ mất chỗ. Vệt sáng mà ông Tư thấy, là bà đi ngang. Nửa vắt cơm trên ngôi mộ không tên là của bà, và món nợ xôi là của ông.",
  "Một đêm, ba người, không ai thấy hết.",
  "Linh tại ngã, bất linh tại ngã.",
];


// Things lying around the graveyard. role: who sees it ("any" = everyone). Tapping one walks
// the player there and opens a short card. A step may reveal a clue (kept across nights),
// and a choice may change the meter, leave a trace for others, or go to another step.
window.FINDS = [
  // ---- monk ----
  { id: "fm_unnamed", role: "monk", x: 262, y: 1042, start: "s0", steps: { s0: {
    lines: ["Ngôi mộ thấp không bia, cỏ mọc kín. Không ai nhớ tên người nằm đây, nhưng đất ở đây vẫn ẩm và mềm như mọi nơi."],
    choices: [
      { label: "Thắp một nén nhang, khấn thí thực", delta: 1, trace: { kind: "incense", variant: 0 } },
      { label: "Đứng lặng một lát rồi đi", delta: 0 },
    ] } } },
  { id: "fm_bowl", role: "monk", x: 118, y: 955, start: "s0", steps: { s0: {
    clue: "c_bat",
    lines: ["Một cái bát sứ sứt miệng nằm nghiêng trong cỏ. Đáy bát có khắc nét chữ run run: “Sáu, cho Hạnh”."],
    choices: [
      { label: "Lau sạch, đặt ngay ngắn bên mộ", delta: 1 },
      { label: "Để nguyên chỗ cũ", delta: 0 },
    ] } } },
  { id: "fm_incense", role: "monk", x: 292, y: 828, start: "s0", steps: { s0: {
    lines: ["Một bó nhang đã cháy hết cắm trước bia vôi, tro còn nguyên hình từng nén. Hôm nay là ngày giỗ của ai đó, và người ấy đã đến rồi đi."],
    choices: [
      { label: "Tụng một đoạn kinh Từ cho người nằm đây", delta: 1, trace: { kind: "chant", variant: 0 } },
      { label: "Chắp tay rồi đi", delta: 0 },
    ] } } },

  // ---- ghost ----
  { id: "fg_hat", role: "ghost", x: 150, y: 692, start: "s0", steps: {
    s0: {
      clue: "c_non",
      lines: ["Chiếc nón lá mục nằm dưới gốc gạo. Quai nón buộc bằng một nút thắt lạ, đúng kiểu bà vẫn thắt cho con gái."],
      choices: [
        { label: "Đội nón lên, như ngày xưa", delta: 1, next: "s1" },
        { label: "Lặng lẽ đặt nón ra chỗ có thể thấy", delta: 0, trace: { kind: "keepsake", variant: 0 } },
      ] },
    s1: {
      lines: ["Trong lòng nón có thêu một chữ H bằng chỉ đỏ đã phai. Bà nhớ là bà thêu, và nhớ là bà thêu cho ai."],
      choices: [
        { label: "Gỡ nón ra, ôm vào lòng", delta: 1, trace: { kind: "keepsake", variant: 0 } },
      ] } } },
  { id: "fg_sandal", role: "ghost", minRuns: 1, x: 272, y: 1236, start: "s0", steps: {
    s0: {
      clue: "c_dep",
      lines: ["Một chiếc dép nhỏ, mòn gót. Chiếc kia không biết ở đâu."],
      choices: [
        { label: "Tìm chiếc còn lại", delta: 1, next: "s1" },
        { label: "Đặt dép lên mộ, rồi đứng yên", delta: -1 },
      ] },
    s1: {
      lines: ["Không có. Nhưng bà nhớ: con bé đi một chiếc dép vào ngày nước lớn, chạy theo bà đến tận cửa. Chắc có ai đó đã nhặt chiếc kia về."],
      choices: [{ label: "Đặt chiếc này lại chỗ cũ", delta: -1 }] } } },
  { id: "fg_tray", role: "ghost", x: 132, y: 1122, start: "s0", steps: { s0: {
    lines: ["Cái mẹt tre mục, nan gãy. Bà nhớ mùi xôi gấc đỏ, nhớ nắng sớm trên mẹt, nhớ tiếng người mua xôi mặc cả mà vẫn cười."],
    choices: [
      { label: "Hít thật sâu mùi ngày cũ", delta: 1 },
      { label: "Quay đi, đừng nhớ nữa", delta: -1 },
    ] } } },

  // ---- villager ----
  { id: "fv_pot", role: "villager", x: 262, y: 1362, start: "s0", steps: { s0: {
    lines: ["Cái nồi đồng nhỏ bị bỏ quên, đáy còn dính cháy xôi. Ông nhận ra nồi của bà Sáu. Ông còn nợ bà ba bát xôi."],
    choices: [
      { label: "Nhẩm tính: ba bát, giá xôi bây giờ đã khác, chắc phải trả nhiều hơn", delta: 1 },
      { label: "Lẩm bẩm xin lỗi bà", delta: 2 },
      { label: "Múc nước suối đổ đầy nồi, đặt cạnh đường mòn cho người đi qua", delta: 1, trace: { kind: "bowl", variant: 0 } },
    ] } } },
  { id: "fv_scarf", role: "villager", minRuns: 1, x: 96, y: 1558, start: "s0", steps: { s0: {
    clue: "c_vo",
    lines: ["Chiếc khăn mỏ quạ vắt trên rào tre. Ông nhận ra màu khăn: của vợ ông.", "Mỗi năm vào ngày nước lớn, bà nấu một mâm xôi, không nói cho ai, rồi đi mất cả buổi chiều. Ông chưa bao giờ hỏi."],
    choices: [
      { label: "Lần này ông thấy muốn hỏi", delta: 2 },
      { label: "Gỡ khăn, giấu vào áo, giả như chưa thấy", delta: 0 },
    ] } } },
  { id: "fv_lamp", role: "villager", x: 232, y: 1592, start: "s0", steps: { s0: {
    lines: ["Chân bụi tre có một chỗ đất bằng, vừa đủ để đặt đèn."],
    choices: [
      { label: "Đặt ngọn đèn nhỏ lại đó cho người đi ngang", delta: 1, trace: { kind: "lamp", variant: 0 } },
      { label: "Giữ đèn, tắt đi cho đỡ sợ", delta: 0 },
    ] } } },

  // ---- everyone ----
  { id: "f_hermit", role: "any", x: 205, y: 296, start: "s0", steps: {
    s0: {
      lines: ["Một tịnh thất nhỏ trên đồi, mái lá, sân đất quét sạch đến lạ. Cửa khép, một ngọn đèn dầu treo hiên, và tiếng chổi quét rất khẽ từ phía sau."],
      choices: [
        { label: "Gõ cửa nhẹ", delta: 0, next: "s1" },
        { label: "Đứng chắp tay một lát rồi đi", delta: 1 },
      ] },
    s1: {
      lines: ["Không ai ra mở. Từ trong vọng ra tiếng một người già, chậm rãi: “Đêm còn dài, cứ ngồi cho trọn. Sáng ta mở cửa.”"],
      choices: [{ label: "Cúi đầu, lùi ra", delta: 1 }] } } },
  { id: "f_ruin", role: "any", x: 335, y: 1308, start: "s0", steps: {
    s0: {
      lines: ["Nhà hoang bên rìa nghĩa địa. Cửa không còn cánh, mái dột. Trong nhà tối hơn ngoài sân."],
      choices: [
        { label: "Bước vào", delta: 0, next: "s1" },
        { label: "Đứng ngoài nhìn thôi", delta: 0 },
      ] },
    s1: { room: true, lines: [], choices: [] } } },
];

window.CLUE_TOTAL = 5;

window.HANH_REVEAL = [
  "Bạn đã nhặt đủ những thứ bị bỏ quên: cái nón thêu chữ H, chiếc dép nhỏ một bên, cái bát khắc “Sáu, cho Hạnh”, bức ảnh trước ngày nước lớn, và chiếc khăn mỏ quạ trên rào tre.",
  "Cô bé Hạnh năm ấy đứng chờ ở cửa không hề mất. Cả xóm đã nuôi em lớn, mỗi nhà một bát cơm. Em lớn lên, làm vợ người khó tính nhất xóm, và mỗi năm vào ngày nước lớn, em nấu một mâm xôi mà không nói với ai.",
  "Bà Sáu chờ con gái về. Con gái vẫn về, mỗi năm một lần, nhưng bà đứng ở gốc gạo và chưa bao giờ nhìn ra.",
  "Chỉ cần có ai đó nói cho bà biết.",
];


// After all three nights are done, the monk can go up to the hermitage at dawn.
Object.assign(STORY.monk.scenes, {
  t1: {
    time: "Sáng", place: "hermitage",
    lines: [
      "Đường lên đồi dài hơn thầy nhớ. Tịnh thất hiện ra giữa sương: mái lá, một chuông gió bằng vỏ ốc, và một vị sư già đang quét sân.",
      "Thầy Minh quét một nhát, lá rơi thêm hai chiếc. Ngài quét thêm. Lá rơi thêm.",
      "“Thầy Tịnh về rồi à,” ngài không ngẩng lên. “Con thấy cái sân này không? Ta quét ba mươi năm rồi, chưa lần nào sạch.”",
    ],
    choices: [
      { label: "Cúi chào, đỡ lấy cây chổi", delta: 1, next: "t2" },
      { label: "Hỏi: sao thầy không để lá yên?", delta: 0, next: "t2" },
    ],
  },
  t2: {
    time: "Sáng", place: "hermitage",
    lines: [
      "Thầy Minh cười, rót hai chén trà. “Ta kể con nghe chuyện cái chổi.”",
      "“Có ông thợ quét lá, quét cả đời cho sân sạch. Lúc nằm xuống, ông tính ra mình đã quét đủ lá để chất thành một quả núi. Nhưng cái ông nhớ nhất không phải quả núi, mà là những buổi sáng được ngồi nghe lá rơi.”",
      "Ngài nhấp trà. “Còn con? Đêm qua ngồi nghĩa địa, con quét được gì?”",
    ],
    choices: [
      { label: "Con không quét được gì. Con chỉ ngồi", delta: 1, next: "t3" },
      { label: "Quét được nửa đêm. Nửa kia con ngủ gật", delta: 1, next: "t3" },
    ],
  },
  t3: {
    time: "Sáng", place: "hermitage",
    lines: [
      "Thầy Minh gật đầu như chuyện đáng nghe. “Mà này, mỗi năm đến ngày nước lớn có một bà khách lên đây. Bà không xin gì, chỉ đặt một mâm xôi ở bậc cửa rồi đi, không nói tên.”",
      { ifv: "c_vo", text: "Thầy Tịnh nhớ chiếc khăn mỏ quạ trên rào tre. Mâm xôi, ngày nước lớn, người vợ lặng lẽ của ông Tư. Mọi mảnh ghép nằm chung một chỗ." },
      { unlessv: "c_vo", text: "Thầy Tịnh thấy trong ngực có điều gì đó chưa khớp. Ngài không hỏi thêm." },
      "“Ta không biết bà là ai,” thầy Minh nói. “Ta chỉ giữ mâm xôi đến trưa rồi mang ra nghĩa địa. Không biết có đúng chỗ không.”",
    ],
    choices: [
      { ifv: "c_vo", label: "“Con biết bà ấy là ai. Xin thầy cho con mang mâm xôi ra gốc cây gạo.”", delta: 2, next: "t4" },
      { unlessv: "c_vo", label: "Xin phép mang mâm xôi ra đặt ở gốc cây gạo", delta: 1, next: "t4" },
    ],
  },
  t4: {
    time: "Sáng", place: "gao", end: true, epilogue: true,
    lines: [
      "Thầy bưng mâm xuống đồi. Xôi gấc đỏ còn ấm, thơm mùi nắng, đúng mùi xôi bà Sáu từng bán.",
      "Dưới gốc cây gạo, thầy đặt mâm xuống rồi ngồi bên cạnh. Gió lay tán hoa, một cánh hoa rơi đúng vào mâm.",
      { ifv: "c_vo", text: "“Bà Sáu,” thầy nói khẽ. “Con gái bà vẫn về, mỗi năm một lần. Bà chỉ chưa nhìn thấy thôi.”" },
      { unlessv: "c_vo", text: "“Có người vẫn mang xôi cho bà,” thầy nói khẽ. “Bà không còn phải chờ trong im lặng.”" },
      "Sương tan. Một vệt sáng rất mỏng đi ngang mâm xôi, dừng lại một chút, rồi bay lên cùng nắng.",
    ],
  },
});
