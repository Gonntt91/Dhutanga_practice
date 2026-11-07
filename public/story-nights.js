// Later nights. They live in the same scenes maps as the first night (story.js); chapters.js decides
// which scene a night starts at. Id prefixes: m2a_ m2b_ (monk, night 2), g2a_ g2b_ (ghost), v2a_ v2b_
// (villager), and mn1_ mn2_ gn1_ gn2_ vn1_ vn2_ for the ordinary nights.
// Meter meaning is the same as the first night: monk "Tâm an" high = calm, villager "Lòng tin"
// high = trust, ghost "Chấp" LOW = released. Every chapter ends in an `end` scene with 3 endings.

Object.assign(STORY.villager.scenes, {
  // ---- night 2, trusting: "Theo thầy tu tập" ----
  v2a_0: {
    time: "Sáng sớm",
    place: "village",
    lines: [
      "Sáng nay ông Tư dậy sớm hơn gà. Vợ ông tưởng ông đau bụng.",
      "Ông nấu một nồi cơm to, to đến nỗi con Vàng đứng ngó vào bếp, nghĩ nhà sắp có đám.",
      "Rồi ông ra cổng, hai tay ôm cái nồi, đứng như người đợi đò. Ông sư đi tới. Mấy câu ông tập từ đêm qua bay đâu mất hết.",
    ],
    choices: [
      { label: "Múc cơm vào bát thầy, không nói gì, chỉ gật đầu", delta: 2, next: "v2a_1" },
      { label: "Múc cơm, rồi lắp bắp: “Hôm qua… tôi nói hơi quá.”", delta: 2, next: "v2a_1" },
      { label: "Đứng đó, tay vẫn ôm nồi. Tay chưa chịu nhúc nhích", delta: 0, next: "v2a_1" },
    ],
  },
  v2a_1: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Chiều ra đồng về, ông Tư không rẽ về nhà. Chân ông tự rẽ về phía nghĩa địa.",
      "Vợ ông dặn với theo: “Đi đâu thì cầm đèn!” Ông cầm đèn, còn mang thêm cái chiếu rách, phòng khi… phòng khi gì thì ông chưa nghĩ ra.",
      "Ông sư đã ngồi sẵn chỗ hôm qua. Thấy ông, thầy không giật mình, chỉ gật đầu như chào người hàng xóm.",
      "“Thầy… cho tôi ngồi nhờ một chút.” Ông nói to hơn định nói.",
    ],
    choices: [
      { label: "“Tôi ngồi xem thôi. Xem thôi nhé.”", delta: 0, next: "v2a_2" },
      { label: "“Chỉ tôi cách ngồi với. Nghe nói ngồi thì đỡ nóng tính.”", delta: 1, next: "v2a_2" },
      { label: "Giơ đèn lồng lên chào, chào cho chắc ăn", delta: 0, next: "v2a_2", emit: "lantern" },
    ],
  },
  v2a_2: {
    time: "Đầu hôm",
    place: "graves", pose: "sit",
    lines: [
      "Thầy chỉ nói ba câu: “Ngồi thẳng lưng. Thở bình thường. Biết hơi thở vào, biết hơi thở ra.”",
      "Ông Tư ngồi thẳng. Thẳng như cột đình.",
      "Hơi thở thứ nhất: được. Hơi thở thứ hai: được. Hơi thở thứ ba: muỗi đốt vào mắt cá. Hơi thở thứ tư: ông đang nghĩ không biết con Vàng có ăn trộm miếng cá khô không.",
      "Chân trái tê. Chân phải tê theo, cho có bạn.",
      { if: "chime", text: "Có tiếng chuông nhỏ. Ông Tư giật mình, nhưng lần này không đến nỗi làm rơi đèn." },
      "Thầy chỉ nói thêm một câu: “Nhớ ra là mình đang ngồi thì quay về hơi thở. Vậy là đúng rồi.”",
    ],
    choices: [
      { label: "Quay về hơi thở. Lần thứ mười một trong năm phút", delta: 2, next: "v2a_3", remember: "v_sat" },
      { label: "Gãi muỗi. Gãi xong, ngồi lại", delta: 1, next: "v2a_3", remember: "v_sat" },
      { label: "Duỗi chân ra, rên khe khẽ", delta: 0, next: "v2a_3" },
    ],
  },
  v2a_3: {
    time: "Canh ba",
    place: "graves", pose: "sit",
    lines: [
      "Ngồi được nửa nén nhang, ông Tư thấy chuyện lạ: ngồi yên mà trong đầu lại ồn hơn lúc đi cày.",
      "Ồn nhất là một chuyện cũ: ba bát xôi chưa trả bà Sáu. Hồi nhỏ ông đói, bà cho ăn chịu. Bà mất, món nợ nằm lại, ông cũng để nó nằm lại, ba mươi mấy năm.",
      { if: "offering", text: "Trên mộ thấp không bia có nửa vắt cơm của ông sư. Ông nhìn mà nóng cả tai." },
      "Thầy không hỏi gì. Thầy ngồi đó, như thể món nợ cũng được phép ngồi cùng.",
      "Cạnh gốc tre có một cây chổi tre ai bỏ quên, và một chỗ đất bằng vừa đủ để đặt đèn.",
    ],
    choices: [
      { label: "Quét sạch lối vào nghĩa địa. Coi như trả dần", delta: 2, next: "v2a_end", remember: "v_debt" },
      { label: "Đặt ngọn đèn nhỏ ở chân bụi tre, để người đi ngang có ánh sáng", delta: 2, next: "v2a_end", trace: { kind: "lamp", variant: 0 }, remember: "v_debt" },
      { label: "Nhẩm tính: ba bát, giá xôi bây giờ chắc gấp mười", delta: 0, next: "v2a_end" },
    ],
  },
  v2a_end: {
    time: "Rạng sáng",
    place: "gate",
    end: true,
    endings: [
      { max: 3, text: "Gà gáy. Ông Tư đứng dậy, chân tê, lưng đau, đầu ong ong như tổ ong. Ông tự nhủ chắc mình không hợp với món này. Nhưng khi về đến ngõ, ông thấy mình quay lại nhìn về phía nghĩa địa." },
      { max: 7, text: "Trời hửng. Ông Tư về nhà, vợ hỏi đi đâu cả đêm. Ông bảo đi học ngồi. Vợ ông cười đến chảy nước mắt, rồi múc cho ông bát cháo nóng. Ông ăn hết, rồi hỏi: tối nay có đi nữa không nhỉ?" },
      { max: 10, text: "Sương tan. Cả đêm không ngủ mà ông Tư không thấy buồn ngủ. Trên đường về, con Vàng chạy ra, ông xoa đầu nó: “Tối nay đi ngồi nữa.” Con Vàng nghiêng đầu. Nó không hiểu, nhưng nó đi theo." },
    ],
  },

  // ---- night 2, still doubting: "Còn nghi ngờ" ----
  v2b_0: {
    time: "Sáng sớm",
    place: "well",
    lines: [
      "Sáng nay ông Tư ra giếng sớm, mang hai cái xô, không phải vì khát. Ông muốn biết ông sư kia có thật hay không, thế thôi. Ông tự nhủ vậy ba lần.",
      "Bà cụ hàng xóm đang loay hoay với hai thùng nước đầy. Ông sư đi ngang, dừng lại, cúi chào, rồi xách giúp một thùng. Không nói nhiều, không đòi gì.",
      "Giếng thì không có chỗ nấp. Ông đứng sau cây chuối.",
    ],
    choices: [
      { label: "“Làm màu. Có người nhìn thấy mới giúp.” Nhìn quanh, chỉ có ông và một con gà", delta: -1, next: "v2b_1" },
      { label: "Im lặng nhìn theo", delta: 0, next: "v2b_1" },
      { label: "Bước ra, xách nốt thùng nước còn lại cho bà cụ", delta: 2, next: "v2b_1" },
    ],
  },
  v2b_1: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Cả ngày làm đồng, đầu ông Tư cứ nghĩ tới cái thùng nước. Sư giả mà giả công phu đến mức xách nước cho người lạ lúc không ai thấy thì… hơi tốn sức.",
      "Con Vàng đi sau ông, nhưng tới cổng nghĩa địa nó dừng lại, ngồi xuống, ngó vào trong, rồi ngó ông. Con Vàng đã quyết định thay ông.",
      { if: "chime", text: "Từ trong nghĩa địa vọng ra tiếng chuông nhỏ, đều đều, không vội." },
    ],
    choices: [
      { label: "Đứng ngoài cổng, chưa dám vào", delta: 0, next: "v2b_2" },
      { label: "Đi vòng ra bụi tre, đứng xa xa nhìn", delta: 0, next: "v2b_2" },
      { label: "Để con Vàng dẫn đường", delta: 1, next: "v2b_2" },
    ],
  },
  v2b_2: {
    time: "Canh hai",
    place: "bamboo",
    lines: [
      "Ông Tư không nấp nữa. Nấp hoài cũng mệt. Ông ngồi hẳn lên một gốc tre cụt, đèn để dưới chân, đủ xa để chạy, đủ gần để nhìn.",
      "Ông sư ngồi đó, y như đêm trước. Giả mà giả được hai đêm liền thì cũng đáng nể.",
      { if: "lamp", text: "Chân bụi tre có ngọn đèn nhỏ ai vừa đặt. Ông thấy đỡ lẻ loi." },
      "Ông nhớ lại cái thùng nước. Nhớ cách ông sư cúi chào bà cụ: chào như chào một vị quan. Ông chưa từng thấy ai chào bà cụ như vậy. Ông cũng chưa từng chào bà cụ như vậy.",
    ],
    choices: [
      { label: "Vẫn còn nghi ngờ. Ông có quyền nghi ngờ mà", delta: 0, next: "v2b_end" },
      { label: "Thôi, để mai nghi ngờ tiếp. Đêm nay chỉ ngồi xem", delta: 1, next: "v2b_end" },
      { label: "Để lại ngọn đèn nhỏ ở chân tre rồi về", delta: 2, next: "v2b_end", trace: { kind: "lamp", variant: 0 } },
    ],
  },
  v2b_end: {
    time: "Rạng sáng",
    place: "gate",
    end: true,
    endings: [
      { max: 3, text: "Ông Tư về nhà muộn. Vợ hỏi, ông bảo đi tìm con Vàng. Con Vàng nằm ngủ ngay cửa từ chiều. Hai vợ chồng im lặng nhìn nhau. Ông nghi ngờ thêm được một ngày nữa." },
      { max: 7, text: "Gà gáy, ông Tư xách đèn về. Ông vẫn chưa tin hẳn. Nhưng ông nhận ra mình không còn đi tìm lý do để nghi ngờ như hôm trước. Nghi ngờ hoài cũng mệt." },
      { max: 10, text: "Trời hửng. Ông Tư đi ngang giếng, thấy bà cụ đang gánh nước. Lần đầu tiên trong đời ông cúi chào bà trước. Bà cụ nhìn ông, nhìn trời, rồi nhìn lại ông: “Hôm nay có mưa không ông?”" },
    ],
  },

  // ---- ordinary night: trăng ----
  vn1_0: {
    time: "Chạng vạng",
    place: "gate",
    lines: [
      "Tối nay không có gì lạ. Cơm xong, ông Tư ngồi hiên nhai trầu, nhìn trăng lên.",
      "Con Vàng nằm dưới chân, ngáy. Vợ ông nói, không quay đầu: “Đi thì cầm đèn.” Ông chưa nói là sẽ đi. Bà biết ông hơn ông biết ông.",
      { if: "chime", text: "Xa xa có tiếng chuông nhỏ. Ông nghe mà không giật mình. Tiến bộ lớn." },
    ],
    choices: [
      { label: "Cầm đèn, huýt con Vàng, đi ra nghĩa địa", delta: 1, next: "vn1_1" },
      { label: "Ngồi thêm một lát. Trăng đẹp thế này", delta: 0, next: "vn1_1" },
    ],
  },
  vn1_1: {
    time: "Canh hai",
    place: "bamboo",
    lines: [
      "Trăng sáng đến nỗi ông Tư định tắt đèn lồng cho đỡ tốn dầu. Ông sư vẫn ngồi chỗ cũ, dưới trăng nhìn như tượng đất.",
      { if: "offering", text: "Trên mộ không tên có vắt cơm, cạnh đó có thêm bông hoa dại. Ai hái? Ông liếc con Vàng. Con Vàng liếc đi chỗ khác." },
      { if: "incense", text: "Có mùi nhang mới. Đêm nay đã có người thắp ở mộ không tên." },
      "Ông ngồi xuống cạnh một gốc tre. Không nấp. Lâu lắm rồi ông không ngồi mà chẳng phải làm gì.",
    ],
    choices: [
      { label: "Ngồi yên, nhìn trăng. Chỉ nhìn trăng", delta: 1, next: "vn1_end" },
      { label: "Lấy trầu ra nhai, nhai nhẹ thôi", delta: 0, next: "vn1_end" },
      { label: "Đặt đèn lồng ở chân tre, để trăng khỏi lẻ loi", delta: 1, next: "vn1_end", trace: { kind: "lamp", variant: 0 } },
    ],
  },
  vn1_end: {
    time: "Rạng sáng",
    place: "gate",
    end: true,
    endings: [
      { max: 3, text: "Trăng lặn sớm. Ông Tư về nhà, vấp ngưỡng cửa, làm con Vàng giật mình. Một đêm bình thường, chẳng có gì để kể. Ông ngủ ngon hơn mọi hôm." },
      { max: 7, text: "Gà gáy. Ông Tư dụi mắt, thấy chân đã tê từ lúc nào. Ông đứng dậy, chào ông sư bằng một cái gật đầu rất nhỏ rồi về. Cái gật đầu ấy đã thành thói quen." },
      { max: 10, text: "Ông Tư về lúc trời hửng, đầu óc nhẹ lạ. Trăng chưa lặn hẳn, còn treo mờ phía tây như người khách chưa muốn về. Ông đứng nhìn nó một lúc. Việc ấy, trước đây ông chưa từng làm." },
    ],
  },

  // ---- ordinary night: mưa phùn ----
  vn2_0: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Mưa phùn từ trưa, không đủ ướt áo mà đủ ướt tính. Ông Tư mặc áo tơi, đội nón, soi mình trong chậu nước: trông như cái nấm biết đi.",
      "Vợ ông bảo mưa thế này ai ra nghĩa địa. Ông bảo ông ra xem mái lá của ông sư có dột không. Mái lá nào thì ông cũng không biết, vì ông sư ngồi ngoài trời.",
    ],
    choices: [
      { label: "Mang theo cái tơi dư, phòng khi ông sư cần", delta: 1, next: "vn2_1", set: "vn2_toi" },
      { label: "Chỉ mang cái nón. Cái tơi là của ông", delta: 0, next: "vn2_1" },
    ],
  },
  vn2_1: {
    time: "Canh ba",
    place: "graves",
    lines: [
      "Ông sư ngồi dưới mưa phùn, y thấm nước, mặt yên như đá. Mưa rơi trên y nghe như ai gõ nhẹ vào cửa.",
      { ifv: "vn2_toi", text: "Ông Tư đưa cái tơi ra. Ông sư lắc đầu, mỉm cười: “Cảm ơn ông. Mưa nhỏ, tôi ngồi được.” Ông Tư đem cái tơi khoác lại lên vai mình, hơi ngượng, nhưng ấm." },
      { if: "bowl", text: "Dọc đường mòn có bát nước ai để sẵn, đầy nước mưa. Ông cười: nước đựng trong bát, mưa đổ thêm vào." },
      "Ông ngồi một lát bên cạnh. Mưa không vội, ông cũng không vội.",
    ],
    choices: [
      { label: "Ngồi cạnh, cùng nghe mưa", delta: 1, next: "vn2_end" },
      { label: "Để lại bát nước và nắm cơm khô bên đường mòn, cho ai đi ngang dưới mưa", delta: 1, next: "vn2_end", trace: { kind: "bowl", variant: 0 } },
      { label: "Hắt hơi một cái thật to. Cả nghĩa địa nghe thấy", delta: 0, next: "vn2_end" },
    ],
  },
  vn2_end: {
    time: "Rạng sáng",
    place: "gate",
    end: true,
    endings: [
      { max: 3, text: "Mưa tạnh lúc gần sáng. Ông Tư về, ướt từ đầu tới chân, hắt hơi ba cái liên tiếp. Vợ ông nấu nồi nước gừng, bảo: lần sau mang thêm nón cho con chó. Con Vàng ngẩng đầu, vẻ biết ơn." },
      { max: 7, text: "Sáng ra mưa ngớt, lá tre nhỏ nước từng giọt. Ông Tư về nhà, thay áo, lòng ấm hơn người. Ông tự hỏi từ bao giờ mình ra nghĩa địa mà không còn thấy sợ." },
      { max: 10, text: "Trời hửng, hơi nước bốc lên từ mặt đường như khói bếp. Ông Tư đứng một lát nghe tiếng mưa còn sót trong lá. Ông chợt nghĩ: thì ra mưa cũng ngồi yên được, cứ rơi hoài mà không vội đi đâu." },
    ],
  },
});

Object.assign(STORY.monk.scenes, {
  // ---- night 2, calm: "Người ngồi cạnh" ----
  m2a_0: {
    time: "Sáng sớm",
    place: "village",
    lines: [
      "Sáng hôm sau thầy đi lại con đường cũ. Bảy nhà, bảy cánh cửa. Cái bụng thầy vẫn đi trước nửa bước, không hề hối lỗi.",
      { ifv: "v_alms", text: "Tới nhà thứ bảy, cửa mở. Ông Tư đứng đó, ôm cái nồi to đến che cả mặt. Ông múc cơm vào bát thầy, múc đầy rồi múc thêm, đến khi cơm trào ra. Trong nhà, vợ ông nói vọng: “Ông ơi, đủ rồi!”" },
      { unlessv: "v_alms", text: "Tới nhà thứ bảy, cánh cửa khép hờ. Hôm nay không ai chặn ngõ, cũng chưa ai mở cửa. Qua khe cửa, thầy thấy một con chó vàng ngồi nhìn ra, và sau lưng nó, bóng một người đàn ông đứng im. Thầy cúi đầu thêm lần nữa rồi đi." },
    ],
    choices: [
      { ifv: "v_alms", label: "Cúi đầu cảm ơn bằng cả hai tay", delta: 1, next: "m2a_1" },
      { unlessv: "v_alms", label: "Đi tiếp. Chuyện nhà thứ bảy, để thời gian lo", delta: 1, next: "m2a_1" },
      { label: "Đi tiếp. Cơm đầy hay vơi, bước chân vẫn một nhịp", delta: 0, next: "m2a_1" },
    ],
  },
  m2a_1: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Thầy tới nghĩa địa khi mặt trời còn một sợi. Có người đứng ở cổng, xách đèn lồng chưa thắp, tay kia giữ cái chiếu rách.",
      "Là ông Tư. Ông nhìn trời, nhìn đất, nhìn con chó, chỉ không nhìn thầy. Ông ho một tiếng. Ông ho thêm tiếng nữa, cho chắc ăn.",
      { ifv: "v_sat", text: "“Tôi thử ngồi một lần rồi,” ông nói nhanh. “Được mười hơi thở. Có muỗi.”" },
      "“Vợ tôi bảo tôi nóng tính. Tôi bảo tôi không nóng tính. Bà ấy bảo: ‘Đấy!’ Thầy… chỉ tôi ngồi với.”",
    ],
    choices: [
      { label: "Dạy ông ba điều: ngồi thẳng, thở bình thường, biết hơi thở vào ra", delta: 1, next: "m2a_2", set: "m_taught" },
      { label: "Mời ông ngồi cạnh. Không dạy gì, chỉ ngồi", delta: 1, next: "m2a_2" },
      { label: "Nói: “Nghĩa địa không phải chỗ dễ ngồi. Ông thử ở nhà trước?”", delta: 0, next: "m2a_2" },
    ],
  },
  m2a_2: {
    time: "Canh hai",
    place: "graves", pose: "sit",
    lines: [
      "Ông Tư ngồi bên phải thầy, thẳng như cột đình, thở như người sắp lặn.",
      "Mười hơi thở, ông ngọ nguậy. Hai mươi hơi thở, ông gãi chân. Ba mươi hơi thở, ông thì thầm: “Thầy ơi, muỗi.” Thầy thì thầm lại: “Biết. Nó mời ông ăn tối đấy.”",
      { ifv: "m_taught", text: "Ông Tư lẩm nhẩm ba điều thầy dạy, như học thuộc bài trước kỳ thi." },
      "Rồi ông im. Hơi thở chậm dần, chậm đến nỗi thầy tưởng ông ngủ. Không, ông vẫn thức. Ông chỉ đang ngồi.",
    ],
    choices: [
      { label: "Ngồi cạnh. Không nhắc, không sửa. Để ông ngồi theo cách của ông", delta: 2, next: "m2a_3" },
      { label: "Khẽ chỉnh lại tư thế cho ông", delta: 1, next: "m2a_3" },
      { label: "Rung chuông nhỏ một tiếng", delta: 1, next: "m2a_3", emit: "chime" },
    ],
  },
  m2a_3: {
    time: "Canh ba",
    place: "graves", pose: "sit",
    lines: [
      "Ông Tư về lúc canh ba, hứa sẽ quay lại, hứa xong lại sợ lời hứa của mình nên nói thêm: “Nếu không bận.”",
      "Rồi có tiếng gậy gõ nhẹ trên đất. Thầy Minh từ trên đồi xuống, chậm rãi, xách ấm trà còn ấm, như đi dạo.",
      "“Ta già, ngủ ít,” ngài ngồi xuống cạnh thầy Tịnh. “Chỗ này nhiều bạn quá, ta ghé thăm.” Ngài rót trà. Hơi nước bay lên, tan vào sương.",
      "Một lúc lâu, ngài nói: “Nước lớn năm ấy cuốn nhiều nhà. Có một bé gái được cả xóm nuôi, mỗi nhà một bát cơm. Ta chỉ nhớ bé hay ghé cổng chùa, đứng lâu lắm rồi đi. Ta hỏi chờ ai, bé nói: không chờ ai, con đi ngang thôi.”",
      { if: "chant", text: "Từ đâu đó có tiếng tụng khẽ. Thầy Minh gật đầu, như nghe một người quen." },
    ],
    choices: [
      { label: "Rót thêm trà cho thầy Minh, ngồi nghe tiếp", delta: 2, next: "m2a_end" },
      { label: "Khẽ tụng một đoạn kinh Từ cho người nằm ở đây", delta: 1, next: "m2a_end", trace: { kind: "chant", variant: 0 } },
      { label: "Im lặng. Có những câu chuyện chỉ để nghe, không phải để hỏi", delta: 1, next: "m2a_end" },
    ],
  },
  m2a_end: {
    time: "Rạng sáng",
    place: "graves", pose: "sit",
    end: true,
    endings: [
      { max: 3, text: "Gà gáy. Thầy Minh đã xuống đồi từ lúc nào thầy không hay. Chén trà còn ấm. Đêm nay thầy lơ đãng nhiều, nhớ hơi thở ít. Không sao. Mai lại ngồi, và có thể lại có người ngồi cạnh." },
      { max: 7, text: "Sương xuống rồi tan. Thầy cầm bát đi về làng. Đêm nay thầy chỉ cho một người cách ngồi, và hình như người chỉ cũng học được chút gì: ngồi cạnh một người đang loay hoay hóa ra cũng là một cách ngồi." },
      { max: 10, text: "Rạng sáng. Chiếc chiếu rách của ông Tư vẫn nằm bên cạnh chỗ thầy, phủ sương. Thầy không dọn. Có ai đó sẽ lại tới. Thầy chắp tay chào những người nằm đây rồi cầm bát đi.", trace: { kind: "vigil", variant: 0 } },
    ],
  },

  // ---- night 2, restless: "Ngồi lại với cơn buồn ngủ" ----
  m2b_0: {
    time: "Sáng sớm",
    place: "village",
    lines: [
      "Bảy nhà, bảy cánh cửa. Cái bụng thầy kêu từ nhà thứ nhất. Đêm qua cơn buồn ngủ thắng ba hiệp. Không sao, thầy tự nhủ. Mình đâu có thi.",
      { ifv: "v_alms", text: "Ở nhà thứ bảy, ông Tư đặt vào bát thầy một vắt cơm còn nóng, mắt nhìn đi chỗ khác." },
      { unlessv: "v_alms", text: "Ở nhà thứ bảy cánh cửa khép. Không ai chặn ngõ. Thầy cúi đầu rồi quay đi." },
      "Thầy ngồi ăn bữa duy nhất trong ngày trước giờ ngọ, ngồi một chỗ, trong bát của mình.",
    ],
    choices: [
      { label: "Ăn chậm, biết từng miếng cơm", delta: 1, next: "m2b_1" },
      { label: "Ăn nhanh vì đói, rồi thấy ngượng", delta: 0, next: "m2b_1" },
      { label: "Để dành nửa vắt cho đêm", delta: 0, next: "m2b_1" },
    ],
  },
  m2b_1: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Thầy tới nghĩa địa khi nắng còn vàng. Tối nay thầy mang theo một ý: hôm qua mình đánh trận với cơn buồn ngủ, đánh ba hiệp, thua cả ba. Hôm nay thử đừng đánh.",
      "Nghĩa địa ban ngày trông hiền lắm. Ban ngày thì cái gì cũng hiền. Lát nữa trời tối, thầy nhớ.",
    ],
    choices: [
      { label: "Đi kinh hành một vòng, cho thân tỉnh trước khi ngồi", delta: 1, next: "m2b_2" },
      { label: "Ngồi ngay, ngồi sớm cho quen chỗ", delta: 0, next: "m2b_2" },
      { label: "Rửa mặt bằng sương trên lá, rồi ngồi", delta: 1, next: "m2b_2" },
    ],
  },
  m2b_2: {
    time: "Canh hai",
    place: "graves", pose: "sit",
    lines: [
      "Trời tối. Nỗi sợ quay lại, đúng giờ như người đòi nợ.",
      { if: "sigh", text: "Có tiếng thở dài ở đâu đó. Hôm nay thầy không giật mình. Thầy nghĩ: chắc là người quen." },
      { unless: "sigh", text: "Lá khô xào xạc. Hôm qua thầy định bụng là gió. Hôm nay thầy chưa định bụng gì cả." },
      "Lần này thầy thử cách khác. Thay vì xem ngoài kia có gì, thầy hỏi: sợ nằm ở đâu trong thân? Ngực hơi thắt. Bụng hơi lạnh. Hai bàn tay ẩm. Chỉ có vậy: ngực, bụng, tay.",
    ],
    choices: [
      { label: "Ở yên với cái thắt ở ngực. Thở vào, thở ra", delta: 2, next: "m2b_3" },
      { label: "Mở mắt xem sao. Xem mà vẫn sợ", delta: -1, next: "m2b_3" },
      { label: "Rung chuông nhỏ một tiếng cho đỡ vắng", delta: 1, next: "m2b_3", emit: "chime" },
      { needLow: true, detour: "hermitage", label: "Lòng chưa vững. Đi về tịnh thất đọc vài trang rồi quay lại ngồi tiếp" },
    ],
  },
  m2b_3: {
    time: "Canh ba",
    place: "graves", pose: "sit",
    lines: [
      "Giờ ấy lại tới: cơn buồn ngủ. Nó đến như bạn cũ, không gõ cửa. Đầu gục, mắt díp, thầy thấy mình đang nghĩ rằng nằm xuống một chút cũng dễ thương.",
      "Đêm nay thầy có một cách khác: không chống. Mở hé mắt, nhìn xuống chóp mũi, chỉ biết hơi thở đi qua lỗ mũi.",
      { if: "bowl", text: "Cạnh lối mòn có bát nước ai để sẵn. Thầy vốc nước lên mặt, thấy ơn người chưa gặp." },
    ],
    choices: [
      { label: "Mở hé mắt, nhìn một điểm, thở. Buồn ngủ đến thì biết là buồn ngủ", delta: 2, next: "m2b_end" },
      { label: "Đứng dậy kinh hành, đi tới rồi đi lui", delta: 1, next: "m2b_end" },
      { label: "Nằm xuống một chút. Chỉ một chút", delta: -2, next: "m2b_end" },
    ],
  },
  m2b_end: {
    time: "Rạng sáng",
    place: "graves", pose: "sit",
    end: true,
    endings: [
      { max: 3, text: "Rạng sáng, thầy tỉnh dậy trên đất lạnh, không biết mình nằm từ lúc nào. Y ướt sương. Thầy ngồi dậy, cười một mình. Hạnh ngồi không nằm đã đứt giữa chừng. Mai ngồi lại. Không ai giữ sổ." },
      { max: 7, text: "Gà gáy. Cơn buồn ngủ vẫn tới rồi đi như thủy triều, nhưng thầy đã biết đứng trên bờ. Thầy đắp lại y, cầm bát. Người mệt, lòng nhẹ hơn hôm qua một chút. Một chút cũng đủ." },
      { max: 10, text: "Trời sáng. Thầy nhìn lại đêm qua: có sợ, có buồn ngủ, và lần này thầy biết mình đang sợ, đang buồn ngủ, chứ không phải đang bị chúng dắt đi. Nghĩa địa buổi sớm hiền như bao giờ. Thầy cúi chào rồi đi.", trace: { kind: "vigil", variant: 0 } },
    ],
  },

  // ---- ordinary night: trăng ----
  mn1_0: {
    time: "Chạng vạng",
    place: "gate",
    lines: [
      "Trăng lên sớm, sáng đến nỗi thầy thấy cả bóng mình. Thầy trải chiếu ở chỗ quen. Đã thành thói: giờ nào chỗ nấy.",
      { if: "lamp", text: "Ngọn đèn nhỏ ở chân tre vẫn cháy, ai đó thắp từ trước." },
      { if: "alms", text: "Mùi cơm nóng còn vương ở cổng. Hình như có người vừa mang cơm ra." },
      "Nghĩa địa đêm nay không khác đêm qua, trừ việc bóng các tấm bia ngắn hơn, vì trăng ở trên cao.",
    ],
    choices: [
      { label: "Ngồi xuống, đặt bát bên cạnh", delta: 0, next: "mn1_1" },
      { label: "Đi kinh hành một vòng trước", delta: 1, next: "mn1_1" },
    ],
  },
  mn1_1: {
    time: "Canh hai",
    place: "graves", pose: "sit",
    lines: [
      "Trăng đi qua đỉnh đầu. Tiếng côn trùng rộ lên rồi lặng. Thầy nhận ra mình đang ngồi, và ngồi dễ hơn thầy tưởng.",
      "Ý nghĩ vẫn đến: mai ăn gì, ông Tư sao rồi, sao chân lại tê. Thầy chạm vào từng cái, gọi nó là “nghĩ”, rồi thả.",
      { if: "chant", text: "Xa xa vọng lại tiếng tụng khẽ của ai đó. Thầy không mở mắt. Có bạn ngồi cùng, dù chẳng thấy mặt." },
    ],
    choices: [
      { label: "Thở. Chỉ thở", delta: 2, next: "mn1_end" },
      { label: "Rung chuông nhỏ một tiếng cho đêm trăng", delta: 1, next: "mn1_end", emit: "chime" },
      { label: "Đặt nửa vắt cơm lên ngôi mộ không tên", delta: 1, next: "mn1_end", trace: { kind: "offering", variant: 0 }, remember: "m_offered" },
    ],
  },
  mn1_end: {
    time: "Rạng sáng",
    place: "graves", pose: "sit",
    end: true,
    endings: [
      { max: 3, text: "Sáng ra, trăng còn lại một mảnh mờ. Đêm nay thầy nghĩ nhiều hơn ngồi. Không sao. Nghĩ cũng là việc để biết." },
      { max: 7, text: "Trăng lặn sau rặng tre, trời hửng dần. Một đêm bình thường: có muỗi, có tê chân, có vài lần tâm đi chơi rồi tự về. Thầy nghĩ bình thường cũng là một món quà." },
      { max: 10, text: "Rạng sáng. Thầy mở mắt khi chim đầu tiên kêu, lòng yên như mặt ao không gió. Không có gì xảy ra. Thầy cúi đầu cảm ơn cái không-có-gì ấy.", trace: { kind: "vigil", variant: 0 } },
    ],
  },

  // ---- ordinary night: mưa phùn ----
  mn2_0: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Mưa phùn từ trưa. Y thầy ẩm, bát thầy ẩm, chỉ có cái bụng là khô ráo, và nó không hài lòng.",
      "Nghĩa địa dưới mưa nhỏ có mùi đất, mùi lá mục, mùi nhang tàn. Không khó chịu, chỉ là mùi của một nơi đã ở đây rất lâu.",
      { if: "bowl", text: "Cạnh đường mòn có bát nước ai để lại, đầy nước mưa." },
    ],
    choices: [
      { label: "Tìm chỗ ít ướt nhất, trải chiếu", delta: 0, next: "mn2_1" },
      { label: "Ngồi ngay chỗ quen, mặc mưa", delta: 1, next: "mn2_1" },
    ],
  },
  mn2_1: {
    time: "Canh ba",
    place: "graves", pose: "sit",
    lines: [
      "Mưa rơi trên lá nghe như ai đang đếm. Thầy đếm theo: một, hai, ba… rồi nhận ra mình đang đếm mưa thay vì thở. Thầy mỉm cười, quay về hơi thở. Mưa vẫn đếm một mình.",
      { if: "incense", text: "Nén nhang ai thắp bên mộ không tên đã tắt vì mưa, còn mùi." },
    ],
    choices: [
      { label: "Ngồi tiếp, để mưa đếm giùm", delta: 2, next: "mn2_end" },
      { label: "Co người lại cho đỡ lạnh, rồi ngồi thẳng lại", delta: 1, next: "mn2_end" },
      { label: "Tụng khẽ kinh Từ cho những người nằm dưới mưa", delta: 1, next: "mn2_end", trace: { kind: "chant", variant: 0 } },
    ],
  },
  mn2_end: {
    time: "Rạng sáng",
    place: "graves", pose: "sit",
    end: true,
    endings: [
      { max: 3, text: "Mưa tạnh gần sáng. Thầy run vì lạnh, vì đói, vì còn lơ mơ. Bát nước mưa đã đầy một nửa. Thầy uống, nước mát. Đêm khó, nhưng nước mưa vẫn ngon." },
      { max: 7, text: "Gà gáy. Giọt mưa cuối cùng rơi từ lá tre xuống vai thầy, lạnh một cái rồi thôi. Thầy đứng dậy, vai ẩm, lòng khô ráo. Hôm nay lại đi khất thực." },
      { max: 10, text: "Trời hửng, hơi đất bốc lên. Cả đêm thầy ngồi dưới mưa mà không thấy mưa là kẻ quấy rầy. Mưa chỉ là mưa. Thầy chắp tay chào cơn mưa như chào một người ngồi cạnh.", trace: { kind: "vigil", variant: 0 } },
    ],
  },
});

Object.assign(STORY.ghost.scenes, {
  // ---- night 2, released: "Đêm không còn chờ" (Chấp: low is light) ----
  g2a_0: {
    time: "Chiều tàn",
    place: "gao",
    lines: [
      "Chiều xuống. Bà Sáu đứng dưới gốc gạo, theo thói cũ, nhìn ra con đường.",
      "Rồi bà nhận ra: bà đang nhìn con đường nhưng không đợi ai. Chỉ nhìn thôi. Thật lạ. Nhìn mà không đợi cũng được.",
      "Bà vẫn là hồn ma, vẫn ở đây, vẫn nhớ mẹt xôi. Chỉ là chân không còn nặng như đá.",
    ],
    choices: [
      { label: "Thử đi dạo. Hồn ma đi dạo, nghe có vẻ vô lý", delta: -1, next: "g2a_1" },
      { label: "Đứng thêm một lát dưới gốc gạo, nhìn hoa rụng", delta: 0, next: "g2a_1" },
      { label: "Nhìn ra con đường, thử xem mình còn ngóng không", delta: 1, next: "g2a_1" },
    ],
  },
  g2a_1: {
    time: "Chạng vạng",
    place: "mit",
    lines: [
      "Bà đi theo con đường, nhẹ như hơi sương. Đã bao lâu bà không rời khỏi gốc gạo? Bà không đếm.",
      "Gốc mít đầu ngõ vẫn ở đó. Chỗ bà trải mẹt xôi ngày xưa, nắng sớm đổ xuống từng vệt. Bây giờ có đứa bé ngồi chơi, bóc vỏ mít. Nó không thấy bà. Bà cũng không buồn vì chuyện đó.",
      "Bà nhớ mùi xôi gấc, nhớ tiếng người mặc cả. Nhớ mà không đau. Giống như nhớ một bài hát cũ.",
    ],
    choices: [
      { label: "Ngồi xuống chỗ cũ, như bày một mẹt xôi vô hình", delta: -1, next: "g2a_2" },
      { label: "Đứng nhìn đứa bé, mỉm cười", delta: -1, next: "g2a_2" },
      { label: "Rao khẽ: “Xôi nóng đây!” Chẳng ai nghe, bà cười một mình", delta: 0, next: "g2a_2" },
    ],
  },
  g2a_2: {
    time: "Đầu hôm",
    place: "well",
    lines: [
      "Từ gốc mít, bà trôi ra giếng làng. Giếng làng là nơi người ta biết hết chuyện của nhau, và chia sẻ hết cho nhau.",
      { ifv: "v_alms", text: "Bà nghe bà cụ kể với một người đàn bà khác: “Cái ông Tư đầu xóm ấy dạo này lạ lắm. Nấu cơm mang ra nghĩa địa. Hôm qua còn mang cả chổi.” Người kia: “Ông Tư á?” Cả hai cùng nhìn trời, xem có sao rơi không." },
      { unlessv: "v_alms", text: "Bà nghe người ta bàn chuyện mùa gặt, giá muối, chuyện con gà nhà ai đẻ trứng hai lòng đỏ. Chuyện làng, nghe như tiếng suối." },
      "Rồi bà cụ nói: “Năm nào cũng vậy, tới ngày nước lớn là có người nấu một mâm xôi gấc, xách đi từ sáng sớm, không nói với ai.” Người kia gật: “Ừ, không nói với ai.”",
      "Bà Sáu đứng sau lưng họ. Xôi gấc đỏ. Bà nhớ một đứa bé từng bốc xôi gấc ăn bằng tay, đỏ cả mép.",
    ],
    choices: [
      { label: "Nghe hết, không chen vào. Bà mỉm cười", delta: -1, next: "g2a_3" },
      { label: "Thở dài nhẹ một cái, không phải vì buồn", delta: 0, next: "g2a_3", emit: "sigh" },
      { label: "Nghe xong mà ngóng thêm: ai nấu mâm xôi ấy?", delta: 1, next: "g2a_3" },
    ],
  },
  g2a_3: {
    time: "Canh ba",
    place: "graves",
    lines: [
      "Bà quay lại nghĩa địa khi đêm đã sâu. Người áo nâu vẫn ngồi đó, y như mọi đêm.",
      { if: "chant", text: "Có tiếng tụng khẽ. Bà đứng nghe, không phải để chờ. Chỉ để nghe." },
      { ifv: "v_debt", text: "Ở mộ không tên, cỏ hơi ép xuống như có người vừa quỳ. Hình như ai đó nợ bà ba bát xôi và đã đến xin lỗi. Bà không nhớ ai nợ. Bà chỉ nhớ ai ăn xôi cũng khen." },
      { if: "lamp", text: "Chân bụi tre có ngọn đèn nhỏ ai thắp. Ánh đèn ấm. Lần này bà dám đến gần." },
      "Mâm xôi gấc. Ngày nước lớn. Không nói với ai. Bà nghĩ tới nó, nhẹ như nghĩ tới một con đò đang đi xa.",
    ],
    choices: [
      { label: "Ngồi xuống bên mộ mình, nghĩ về mâm xôi. Không cần biết ai nấu", delta: -2, next: "g2a_end" },
      { label: "Hỏi vu vơ vào đêm: “Con có khỏe không?”", delta: -1, next: "g2a_end" },
      { label: "Quay về gốc gạo, đứng nhìn đường như mọi khi", delta: 1, next: "g2a_end" },
    ],
  },
  g2a_end: {
    time: "Rạng sáng",
    place: "gao",
    end: true,
    endings: [
      { max: 3, text: "Sương tan. Bà Sáu ngồi dưới gốc gạo, hoa rơi trên vai. Bà vẫn là bà Sáu bán xôi, vẫn nhớ con. Nhưng hôm nay bà không đợi ai, và nhớ mà không đợi hóa ra nhẹ hơn bà tưởng. Bà ngồi đó nhìn trời sáng, như người đã bán hết mẹt xôi và đang thong thả đếm tiền lẻ." },
      { max: 7, text: "Trời sáng. Hai chân bà vẫn hơi kéo về phía con đường, nhưng chỉ hơi thôi. Một mâm xôi đỏ cứ hiện ra trong đầu. Bà ở lại thêm một ngày, không vội." },
      { max: 10, text: "Mặt trời lên. Bà lùi vào bóng gạo, mắt vẫn hướng ra đường. Đêm nay bà đi xa hơn mọi đêm, nhưng cuối cùng chân vẫn đưa về chỗ cũ. Không sao. Gốc gạo vẫn đứng đó, đợi bà về." },
    ],
  },

  // ---- night 2, still clinging: "Còn chờ" ----
  g2b_0: {
    time: "Chiều tàn",
    place: "gao",
    lines: [
      "Bà Sáu lại đứng ở gốc gạo, như đêm nào. Bà tưởng đêm qua đã đỡ, nhưng chiều xuống chân lại nặng như cũ.",
      "Dưới gốc gạo, chiếc nón lá mục nằm đó, quai buộc nút lạ. Đêm qua bà đã nhìn nó. Hôm nay bà không muốn nhìn, rồi vẫn nhìn.",
      "Trong lòng nón có chữ H thêu chỉ đỏ. Bà nhớ bàn tay mình xỏ kim: tay run vì lạnh, mắt kém, mà vẫn thêu cho thẳng.",
    ],
    choices: [
      { label: "Ôm nón vào lòng, như ôm đầu con trẻ", delta: 1, next: "g2b_1" },
      { label: "Đội nón lên, nhìn ra đường như ngày xưa", delta: 1, next: "g2b_1" },
      { label: "Đặt nón ra chỗ có thể thấy, để ai đi ngang biết có người nhớ", delta: -1, next: "g2b_1", trace: { kind: "keepsake", variant: 0 } },
    ],
  },
  g2b_1: {
    time: "Canh hai",
    place: "graves",
    lines: [
      "Cái đói lại tới, cái đói không phải của bụng. Nhưng đêm nay bà thấy nó có hình dạng: một cái mẹt tre, trống trơn.",
      "Bà nhớ buổi sáng cuối: xôi gấc còn nóng, bà dậy từ canh tư để đồ xôi, sợ khách đói. Khách nào? Khách quen: ông thợ, cô giáo, thằng bé hay ăn chịu. Họ không cần xôi ngon lắm. Họ cần có người dậy sớm vì họ.",
      { if: "offering", text: "Nửa vắt cơm trên mộ không tên, ai đó đặt đêm nay. Cơm nguội, cơm khô, nhưng là cơm cho bà." },
      "Bà nhận ra: cả đời bà dậy sớm vì người khác. Chết rồi vẫn dậy sớm. Vẫn đứng chờ.",
    ],
    choices: [
      { label: "Ngồi xuống bên cái mẹt, giả bán xôi. Một bát, hai bát", delta: 1, next: "g2b_2" },
      { label: "Úp cái mẹt xuống, như đóng hàng cuối ngày", delta: -2, next: "g2b_2" },
      { if: "offering", label: "Lại gần nửa vắt cơm. Có người vẫn nhớ tới bà", delta: -1, next: "g2b_2" },
    ],
  },
  g2b_2: {
    time: "Canh ba",
    place: "bamboo",
    lines: [
      "Gió thổi qua bụi tre, nghe như có người gọi. Mọi đêm bà vẫn tưởng là gió. Đêm nay bà nghe kỹ: gió gọi “Hạnh… Hạnh…”. Hay chính bà đang gọi?",
      "Bà thử gọi to. Tiếng bà thành hơi lạnh, tan vào lá. Tên con. Bà gọi nó cả ngàn lần mà chưa lần nào nghe nó đáp. Nhưng cái tên vẫn còn nguyên, không phai, không mất.",
      { if: "lantern", text: "Có đốm đèn lồng sau bụi tre. Lần này bà không chạy tới. Bà biết đó không phải con. Bà chỉ đứng nhìn." },
    ],
    choices: [
      { label: "Gọi tên con thêm một lần, nhẹ như thở", delta: 0, next: "g2b_end" },
      { label: "Gọi mạnh, gọi hoài, gọi tới khi con đáp", delta: 2, next: "g2b_end" },
      { label: "Giữ tên con trong lòng, không gọi nữa. Tên vẫn còn đó", delta: -2, next: "g2b_end" },
    ],
  },
  g2b_end: {
    time: "Rạng sáng",
    place: "gao",
    end: true,
    endings: [
      { max: 3, text: "Sương tan. Bà Sáu thấy mình nhẹ đi một chút, chỉ một chút, như vừa đặt xuống một gánh nhỏ trong cái gánh lớn. Gánh lớn vẫn còn, nhưng bà đã biết là mình đặt xuống được." },
      { max: 7, text: "Trời sáng. Bà vẫn còn chờ, nhưng cái chờ không còn nhọn như mọi hôm. Cái nón, cái mẹt, cái tên, bà ôm từng thứ một. Đêm mai có thể bà ôm nhẹ hơn." },
      { max: 10, text: "Mặt trời lên. Bà lùi vào bóng gạo, vẫn nhìn về phía con đường. Đêm nay bà gọi nhiều, nhớ nhiều, và chân vẫn kéo về căn nhà cũ. Bà còn ở lại, và biết mình còn ở lại. Biết như vậy cũng là một bước nhỏ." },
    ],
  },

  // ---- ordinary night: trăng ----
  gn1_0: {
    time: "Chạng vạng",
    place: "gao",
    lines: [
      "Trăng lên, sáng đến mức bóng bà đổ xuống đất. Hồn ma mà còn có bóng, bà thấy buồn cười. Hóa ra là bóng của gốc gạo.",
      "Đêm nay không có gì đặc biệt. Không ai khóc, không ai gọi. Chỉ có trăng, gió và tiếng dế.",
      { if: "chime", text: "Một tiếng chuông nhỏ vang lên từ xa. Bà nghe như nghe tiếng chuông của gánh hàng rong ngày xưa." },
    ],
    choices: [
      { label: "Đi dạo giữa các ngôi mộ, hỏi thăm hàng xóm", delta: 0, next: "gn1_1" },
      { label: "Đứng dưới trăng, như đang chờ ai", delta: 1, next: "gn1_1" },
    ],
  },
  gn1_1: {
    time: "Canh hai",
    place: "graves",
    lines: [
      "Các ngôi mộ, mỗi nhà một kiểu: nhà này cỏ cao, nhà kia có hoa. Bà ghé từng nhà, không gõ cửa, chỉ chào.",
      { if: "offering", text: "Mộ không tên có vắt cơm, vẫn là của bà. Ai đó cứ nhớ." },
      { if: "lamp", text: "Ngọn đèn nhỏ dưới chân tre vẫn cháy. Bà ngồi cạnh cho ấm, dù hồn ma thì chẳng cần ấm." },
    ],
    choices: [
      { label: "Ngồi nghe tiếng thở của người áo nâu", delta: -1, next: "gn1_end" },
      { label: "Làm lá khô xào xạc, trêu người áo nâu một chút", delta: 1, next: "gn1_end", emit: "sigh", trace: { kind: "sigh", variant: 0 } },
      { label: "Nhìn trăng, không nghĩ gì", delta: -1, next: "gn1_end" },
    ],
  },
  gn1_end: {
    time: "Rạng sáng",
    place: "gao",
    end: true,
    endings: [
      { max: 3, text: "Trăng nhạt dần. Bà thấy nhẹ, như tối nay có ai đó quét nhà giùm. Bà không biết nhẹ vì sao, và cũng không hỏi." },
      { max: 7, text: "Trăng lặn, sương lên. Một đêm vừa phải: có nhớ, có quên, có lúc vui vì cái bóng của gốc gạo. Bà thấy vậy cũng ổn." },
      { max: 10, text: "Rạng sáng. Bà vẫn đứng dưới gốc gạo, nhìn con đường. Trăng đi rồi, con đường vẫn trơ ra. Bà ở lại một ngày nữa, như mọi ngày." },
    ],
  },

  // ---- ordinary night: mưa phùn ----
  gn2_0: {
    time: "Chiều tàn",
    place: "gao",
    lines: [
      "Mưa phùn rơi xuyên qua bà. Hồn ma thì không ướt, nhưng bà vẫn co vai theo thói quen. Thói quen của người sống thật khó bỏ.",
      "Hồi còn gánh xôi, trời mưa là phải lấy lá chuối che mẹt. Bà vẫn nhớ cách gấp lá.",
    ],
    choices: [
      { label: "Gấp một chiếc lá chuối vô hình che cho mẹt xôi vô hình", delta: 0, next: "gn2_1" },
      { label: "Đứng trơ ra cho mưa đi qua", delta: -1, next: "gn2_1" },
    ],
  },
  gn2_1: {
    time: "Canh ba",
    place: "graves",
    lines: [
      "Mưa đều. Nghĩa địa thơm mùi đất ướt. Người áo nâu ngồi đó, y ướt, mặt yên.",
      { if: "release", text: "Đêm nay có một vệt sáng nhạt bay lên từ gốc gạo. Hình như một người quen vừa đi qua, đi rất nhẹ." },
      { if: "bowl", text: "Có bát nước và nắm cơm ai để ven đường mòn. Dưới mưa vẫn không trôi." },
    ],
    choices: [
      { label: "Ngồi bên người áo nâu cho đỡ vắng", delta: -1, next: "gn2_end" },
      { label: "Đếm giọt mưa trên lá tre", delta: 0, next: "gn2_end" },
      { label: "Nhớ con. Nhớ thật nhiều. Nhớ trong mưa", delta: 1, next: "gn2_end" },
    ],
  },
  gn2_end: {
    time: "Rạng sáng",
    place: "gao",
    end: true,
    endings: [
      { max: 3, text: "Mưa tạnh. Lá gạo còn nhỏ từng giọt. Bà thấy nhẹ như vừa được ai lau mặt. Hóa ra hồn ma cũng cần được lau mặt." },
      { max: 7, text: "Trời hửng, mưa còn sót trong các kẽ lá. Bà đứng nghe nước nhỏ giọt, một giọt, hai giọt. Không đợi gì, mà cũng chưa đi đâu." },
      { max: 10, text: "Sáng. Mưa tạnh, đường vẫn ướt. Bà nhìn nó, nhớ con. Nhớ xong, bà lại đứng đợi, như mưa xong lại có nắng, rồi lại có mưa." },
    ],
  },
});
