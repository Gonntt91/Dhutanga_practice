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
    "tụng Bát Nhã, hồi hướng cho những người nằm đây",
    "hồi hướng cho người đã xua đuổi mình sáng qua",
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
    start: "m1",
    meterStart: 5,
    scenes: {
      m1: {
        time: "Chiều tàn",
        place: "gate",
        lines: [
          "Bát còn nửa vắt cơm nguội. Sáng nay đi khất thực qua bảy nhà. Hai nhà đặt cơm, bốn nhà đóng cửa.",
          "Nhà thứ bảy, một người đàn ông đứng chắn ngõ: “Đi chỗ khác. Thời này sư giả nhiều lắm.”",
          "Mặt trời xuống sau rặng tre. Câu nói ấy vẫn còn đâu đó trong ngực.",
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
        ],
        choices: [
          { label: "Đặt cơm lên ngôi mộ không tên, khấn thí thực", delta: 1, next: "m4", trace: { kind: "offering", variant: 0 } },
          { label: "Giữ lại cho sáng mai", delta: 0, next: "m4" },
        ],
      },
      m4: {
        time: "Canh hai",
        place: "graves", pose: "sit",
        lines: [
          "Lá khô xào xạc phía sau lưng, đều đều như bước chân.",
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
          "Cơn buồn ngủ kéo đến như nước lên. Đầu gục xuống một lần, hai lần.",
          "Hạnh ngồi không nằm. Đất ẩm và mát. Nằm xuống một chút thôi cũng chẳng ai biết.",
        ],
        choices: [
          { label: "Nằm xuống một chút", delta: -2, next: "m6" },
          { label: "Đứng dậy đi kinh hành quanh các ngôi mộ", delta: 1, next: "m6" },
          { label: "Ngồi thẳng lưng, đếm hơi thở từ một đến mười", delta: 1, next: "m6" },
        ],
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
          { label: "Tụng Bát Nhã, hồi hướng cho những người nằm đây", delta: 1, next: "end", trace: { kind: "chant", variant: 0 } },
          { label: "Hồi hướng cho người đàn ông đã xua đuổi mình", delta: 2, next: "end", trace: { kind: "chant", variant: 1 } },
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
          { label: "Về nhà nấu cơm, mang ra cổng đặt vào bát ông sư", delta: 2, next: "end", trace: { kind: "alms", variant: 0 } },
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
