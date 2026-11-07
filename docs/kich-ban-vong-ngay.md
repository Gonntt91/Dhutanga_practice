# Kịch bản vòng ngày: sống chậm, học tâm, mỗi đêm một chuyện mới

> **Thiết kế mở rộng — không phải toàn bộ đã triển khai.** Đây là bản nội dung để đưa dần vào game trên nhánh `experiment/qls-ideas`. Tham chiếu [he-thong-tam.md](he-thong-tam.md), nhất là mục 4, 9, 15–17. Nội dung liên quan giáo lý, nghi thức, đầu-đà và tâm sở phải được một vị thầy Theravāda kiểm tra trước khi phát hành.

## 1. Lời hứa với người chơi

Một ngày không cần làm nhiều; chỉ cần **một việc có ý nghĩa, một điều bất ngờ, một phút nhìn lại**.

- **Chơi 2–3 phút:** xem "Trong lúc vắng", nhận một lời hẹn, giao một việc phù hợp vai; không hụt thưởng.
- **Chơi 10–15 phút:** một nhiệm vụ chính + một việc tự chọn + quán xét.
- **Chơi 20–30 phút:** thêm khám phá, trò chơi tương tác, nghe kinh hoặc kinh hành.
- Không bảng xếp hạng công đức, năng lượng, phạt vắng, ép online, hay thẻ tu chứng. Thẻ chỉ là **dấu đã học/nhận diện trong mô phỏng**, không phải chứng nhận tâm thật.
- **Mỗi vai có logic hành động riêng:** nhà sư tu học và giữ hạnh; dân làng làm việc, bố thí, giữ giới; bà Sáu (ngạ quỷ) nhìn lại ký ức, nỗi chờ đợi, gặp duyên nghe pháp. Hồn ma **không bế trẻ, nhặt vải, nấu cơm, dắt người sống**.

## 2. Vòng ngày chung, nhưng không bắt buộc chơi đủ một lượt

| Buổi trong game | Cảm giác | Sư Tịnh | Ông Tư / dân làng | Bà Sáu |
|---|---|---|---|---|
| Rạng sáng | thanh, có định hướng | tỉnh dậy, khất thực, đi kinh hành | nhóm bếp, ra giếng, dâng cơm | thấy người đi qua mà không gọi được |
| Buổi sáng | có tay nghề | quét sân, giặt vải, nhận bát | giúp người, dệt vải, trả đồ | ký ức cũ hiện về theo vật quen |
| Chiều | lựa chọn, ngã rẽ | vá y, nghe thầy, vào rừng | nghe tin đồn, làm lành | theo tiếng xôi, tiếng bước chân |
| Đêm | tĩnh và bất ngờ | ngồi thiền, nhận diện triền cái | nghe pháp, soi đèn, giữ lời hẹn | nghe tụng kinh, đối diện điều chấp |
| Cuối đêm | một dấu chấm | quán xét, hồi hướng | quán xét, lời hẹn ngày mai | soi lại một ký ức, không ép "siêu thoát" |

**Lịch tự do:** người chơi có thể chơi ngay nhiệm vụ đang mở, thực hành riêng, hoặc kết thúc đêm. Việc hoàn tất một `runId` mới chuyển sang ngày/đêm kế tiếp; đăng nhập lại giữa đêm phải tiếp tục đúng chỗ. Phân biệt `gameDay` với ngày thực; ngày rằm ngoài đời là sự kiện trang trí/tùy chọn, không khóa phần thưởng.

**Chống lặp:** mỗi ngày rút 1 nhiệm vụ tuyến chính còn dang dở, tối đa 2 tình huống sinh hoạt, 1 tình huống ngẫu nhiên; cùng một mẫu không xuất hiện 2 ngày liền. Tình huống chọn theo `role + place + phase + questState + recentStorylets + cards + inventory`. Hoàn thành hoặc bỏ qua đều ghi vào lịch sử để thay câu chuyện hôm sau.

## 3. Tuyến A — Sư Tịnh: "Tấm y màu đất" (5 ngày, có kết thúc)

Y phấn tảo không phải vật phẩm rơi ngẫu nhiên hay mua bằng điểm. Đây là hành trình **tìm đúng mảnh vải không còn chủ, làm sạch, nhuộm, khâu, rồi học cách dùng**. Các chi tiết thực hành y phấn tảo/hạnh đầu-đà cần kiểm chứng về luật và truyền thống.

| Ngày | Nơi, điều kiện | Cảnh ngắn và hành động trên thế giới | Biến thể/tâm sở | Dấu vết |
|---|---|---|---|---|
| 1 – Nhìn thấy | đường ngoài nghĩa địa, sáng/chiều, vai sư | Sư thấy một mảnh vải vướng cành. **Xem kỹ**: đây là vải bị bỏ, không phải áo đang phơi; có thể nhặt hoặc để nguyên. | Vội giật lấy → thấy sự nôn nóng; quan sát rồi nhặt → Niệm/Không tham *nếu đã có minh chứng* | `robe.step=collected`; vải cũ trong túi |
| 2 – Giặt | giếng làng, ngày kế | Nước đục chảy qua mép vải. **Giặt lần lượt**: nhúng, vò, xả, phơi. Có thể nhờ dân làng chỉ chỗ phơi, nhưng không để họ tu hộ. | Làm vội → phải xả lại; kiên nhẫn → Tinh tấn nếu đã mở bài học | `washed`; thay hình vải |
| 3 – Nhuộm | cạnh tịnh thất, sau phơi | Dùng nguyên liệu màu đất được chuẩn bị phù hợp; đun, ngâm, phơi. Màu không đều cũng có câu chuyện. | Bám vào "phải đẹp" → gặp Tham; chấp nhận màu giản dị → Không tham | `dyed`; hình vải màu đất |
| 4 – May | hiên tịnh thất, ngày kế | **Nối các mảnh** bằng thao tác xếp, luồn kim, khâu vài đường. Khi rời game có thể giao "chuẩn bị kim chỉ", nhưng đường may quyết định phải chơi trực tiếp. | Tâm động → có thể nghỉ đi kinh hành; tập trung vào mũi kim → Niệm, có cơ hội Định mức đời thường | `sewing`; hiển thị % tiến độ thủ công |
| 5 – Hoàn thành | tịnh thất, có sư già | Khâu mũi cuối, giũ y, nghe lời nhắc về việc dùng đúng mục đích. **Không có lễ tăng phẩm hay chứng đắc.** | Không tham hoặc Tín tùy trải nghiệm, không tự động | `finished`; mở trang phục y màu đất + cột mốc "Tấm y đầu tiên" |

**Lời thoại mẫu — Ngày 1**

> "Một mảnh vải vướng trên nhánh gai. Mưa đã làm phai màu."

- **Nhìn quanh xem có ai để quên:** "Không thấy người nhận. Sư vẫn đứng chờ thêm một lát." → mở thao tác nhặt.
- **Nhặt vội:** "Gai mắc vào vải. Sư chậm tay gỡ ra." → tự quan sát sự vội vã, không phạt.
- **Để lại:** "Chưa phải lúc. Mai đi qua vẫn còn con đường này." → nhiệm vụ không mất.

**Lời thoại mẫu — Ngày 4**

> "Kim đi qua hai lớp vải. Một mũi hơi lệch."

- **Tháo khâu lại:** sự cẩn trọng.
- **Giữ đường may giản dị:** chấp nhận điều chưa hoàn hảo.
- **Đứng dậy kinh hành ít phút:** mở hoạt động tùy chọn, rồi quay lại may tiếp.

**Biến thể nhiều lượt:** ngày mưa vải lâu khô, lời nhờ từ ông Tư giúp phơi, thiếu kim có thể hỏi sư già, một mảnh rách phải vá. Đây là thay đổi câu chuyện, **không phải khóa vĩnh viễn**. Khi xong y, nhiệm vụ "vá y sau một mùa mưa" có thể tái xuất (không thưởng lại skin/thẻ theo lối cày).

## 4. Tuyến B — Bà Sáu: "Tiếng guốc trong sương" (5 đêm)

Bà Sáu đã mất trong trận nước lớn. Trong câu chuyện chính bà vẫn chờ con gái Hạnh. **Mục tiêu không phải giải cứu trẻ con** mà là từ từ nhận ra mình đang chờ điều gì. Không tự khẳng định "buông được là lập tức tái sinh"; kết thúc mở, tôn trọng tính mô phỏng và câu chuyện nền.

| Đêm | Mồi truyện/điểm đến | Người chơi làm | Nhánh cảm xúc | Kết quả |
|---|---|---|---|---|
| 1 | gốc gạo, chạng vạng | Thấy bóng người nhỏ đi qua, chỉ **quan sát**, không thể gọi, chạm hay dẫn đi. Thọ thần có thể nói về những mùa cây đã trải qua. | Chạy theo ký ức / đứng lại nhận ra đang nhớ | Mở `ghost_echo`; gợi ý Tham như bám giữ, nếu đúng ngữ cảnh |
| 2 | bụi tre | Nghe tiếng guốc: hóa ra là một đứa bé **đang sống** cùng mẹ nó, không phải Hạnh. | Muốn cất tiếng gọi / nhận ra hai người khác nhau | Mở một mảnh ký ức, không có hành động dỗ trẻ |
| 3 | cổng chùa | Nghe tiếng kinh trong tịnh thất; ngồi ngoài tường, lắng nghe hoặc bỏ đi. | Có/không có dấu vết `chant` do sư khác để lại | Một câu chuyện mới, không nhận thẻ từ việc vắng |
| 4 | mộ thấp, đêm mưa | Thấy người làng đặt hoa, cơm hoặc nhang; thử phân biệt việc đang xảy ra với chuyện đã qua. | Nếu có `offering`/`incense`, lời kể thay đổi | Mở thẻ nhận diện phù hợp nếu **người chơi chủ động** lựa chọn |
| 5 | gốc gạo và ngôi mộ | Bà không còn cố biến người lạ thành Hạnh. Có thể ngồi lại hoặc bước tới chỗ nghe kinh. | **Kết không ép:** chấp còn nhiều / đã nhẹ hơn | Khép cung truyện, mở chương sau về lời hẹn cũ chưa giải |

**Cảnh mẫu — Gốc gạo**

> "Trong sương có dáng một đứa trẻ. Bà nghe như tiếng Hạnh ngày xưa."

- **Gọi tên Hạnh:** "Không ai quay đầu. Chỉ có lá gạo lay." → nhắc lại chuyện đang giữ.
- **Đứng yên nhìn kỹ:** "Đó là một người khác. Người sống đang về nhà." → đi bụi tre nghe tiếp ký ức.
- **Rời đi:** "Một đêm khác, bà có thể trở lại." → giữ nguyên nhánh, không mất cơ hội.

**Cảnh mẫu — Cuối cung**

> "Bà nhớ tên con. Nhưng lần này, không gọi người lạ bằng tên ấy."

Không bắt nhân vật thành thiên thần, không làm cho bà có thể tác động vật lý đến người sống. **Người chơi nhận sự hiểu biết qua lựa chọn nhìn/biết/bám**, thay vì đi giao đồ.

## 5. Tuyến C — Ông Tư: "Món nợ ba bát xôi" (4 ngày)

Dựa trên quan hệ đã có giữa ông Tư và bà Sáu trong `story.js`. Không cần phát minh thêm NPC:

1. **Ngày 1 – Chuyện cũ ở giếng.** Bà cụ nhắc ba bát xôi ăn chịu. Ông Tư có thể chối, nhận, hoặc xin bà kể lại. Lựa chọn không chặn truyện.
2. **Ngày 2 – Gói xôi sáng.** Nấu và chia phần xôi cho người cần; không "trả nợ cho ma" bằng cách trực tiếp đưa vật cho hồn ma. Nếu ghé nghĩa địa, ông chỉ đặt hoa và nhớ người cũ.
3. **Ngày 3 – Tấm vải mộc.** Người làng dệt vải cúng dường đúng cách hoặc mang nước giúp tại giếng. Có thể liên kết vật liệu với tuyến may y của sư (thế giới nhớ một việc, không tự chuyển đồ giữa tài khoản nếu chưa có thiết kế multiplayer).
4. **Ngày 4 – Nói điều chưa nói.** Ông Tư kể cho người trong nhà nghe chuyện bà Sáu, không đổ lỗi cho người khác. Cảnh cuối thay đổi theo những việc ông đã làm. Bà Sáu nếu tồn tại như NPC chỉ thấy dấu vết, không nhận thông điệp thần giao cách cảm.

Ví dụ: "Con Vàng nằm dưới chân. Ông Tư đếm ba bát bằng ba đốt ngón tay, rồi buông bàn tay xuống." → **Nấu một phần xôi để chia / ra giếng hỏi cho rõ / im lặng để ngày mai**.

## 6. Kho tình huống ngắn để không lặp nhiệm vụ

| ID | Vai | Điều kiện | Tương tác chính | Kết quả/đường mở |
|---|---|---|---|---|
| M01 | Sư | sáng, gần giếng | xách nước, chia sức | nếu trước đó nóng giận, có câu nhớ lại |
| M02 | Sư | sau buổi ngồi xao động | kinh hành từng đoạn ngắn | lượt tập quan sát, không tự có thẻ |
| M03 | Sư | đêm, trăng mờ | nghe cú, thở, nhận diện sợ | mở một thẻ nếu đủ điều kiện |
| M04 | Sư | đã giặt vải, trời mưa | tìm chỗ phơi, giữ vải sạch | biến thể `robe` |
| M05 | Sư | tịnh thất, đã đọc kinh | sư già hỏi một câu ứng dụng | học thêm mặt sau thẻ nếu trả lời qua tình huống |
| V01 | Dân | sáng, thấy gói đồ | tìm người đánh rơi | bài học thật thà, không chọn đáp án đạo đức sẵn |
| V02 | Dân | chiều, ông lái buôn đến | đẩy bánh xe, nghe một tin | mảnh bản đồ mới |
| V03 | Dân | sau chó cắn | gặp ông Tư và con Vàng | đổi lời thoại theo lịch sử làm lành |
| V04 | Dân | gần chùa, đêm | đặt đèn cho lối đi | người đi sau thấy dấu vết |
| V05 | Dân | đang dệt vải | chọn giữ một phần hay chia | lời hẹn ngày sau |
| G01 | Ma | gốc gạo, chạng vạng | nhìn bóng người sống, nhận ra nhầm ký ức | `ghost_echo` |
| G02 | Ma | nghĩa địa, đêm mưa | thấy mộ bên cạnh có hoa, mộ mình không | nhận diện ganh tị/nỗi buồn, **không cướp hoa** |
| G03 | Ma | tường chùa, có dấu `chant` | ở lại nghe hoặc quay về | mở hồi tưởng |
| G04 | Ma | giếng, trời sáng | thấy gánh xôi nhưng không lấy được | phân biệt ký ức và hiện tại |
| G05 | Ma | sương gần tan | chọn tiếp tục chờ hay thôi gọi người lạ | nhánh kết khác nhau |

**Máy chọn storylet:** gắn `cooldownDays=2` cho mẫu thường, `once=true` cho dấu mốc, `weight` theo giờ/trăng/thẻ/sự kiện cộng đồng. Nếu không có mẫu hợp, cho người chơi **thực hành tự chọn** thay vì ép lặp "đưa rau / ngồi với sư".

## 7. Thẻ tâm: không phải cứ ngồi đủ giờ là được Niệm

Ba lớp cần tách: **chỉ số ngầm** (phục vụ cân bằng game), **trải nghiệm quan sát được** (nhấn/nhận diện/lựa chọn), **thẻ kiến thức** (đã từng gặp một hiện tượng trong game). Không lấy thẻ tâm sở làm bằng chứng một người thật đã có phẩm chất hay chứng đắc.

| Thẻ đề xuất | Khi nào có cơ hội mở (mô phỏng) | Tình huống không nên tự thưởng |
|---|---|---|
| **Niệm** (sati) | người chơi chủ động nhận diện xao lãng và quay lại đề mục nhiều lần | ngồi hết giờ nhưng không tương tác |
| **Định / Nhất tâm** (ekaggatā, samādhi theo ngữ cảnh) | sau nhiều buổi; một buổi thực sự ít gián đoạn, có hành động trở về đề mục | chỉ vì thanh "quả cầu" đầy; tuyệt đối không ghi "đắc định" |
| **Phóng dật** (uddhacca) | ở nhiều tình huống tâm bất thiện xao động; game cho lựa chọn nhận ra tâm lao xao | một ý nghĩ bất chợt trong đời thường chưa đủ kết luận "tâm bất thiện" |
| **Si** (moha) | kịch bản cho thấy nhầm lẫn/không thấy rõ và người chơi tự nhận ra sau khi kiểm chứng | không gán Si chỉ vì chơi kém hoặc bỏ lỡ nút |
| **Hôn trầm / Thụy miên** | khi ngồi, mí nặng, người chơi thử đối trị hoặc không | ngủ gật ngoài đời không phải "tội" |
| **Hoài nghi** (vicikicchā) | phân vân làm gián đoạn thực hành trong tình huống được viết rõ | câu hỏi tìm hiểu pháp chân thành không tự bị coi là hoài nghi bất thiện |
| **Tinh tấn** | chủ động tiếp tục một việc đúng sau khi gián đoạn, nhiều buổi | chỉ đếm số ngày đăng nhập |
| **Tín / Tuệ** | nghe/đọc một đoạn kinh và áp dụng vào hành động phù hợp | bấm "đã đọc" rồi đóng sách |
| **Không tham** | có lựa chọn thật giữa giữ và chia, không phải nhận thẻ tự động | công việc offline xong |

**Đặc biệt:** "Định" ở bài học **không đồng nghĩa thiền-na/đắc thiền**; nhất tâm (`ekaggatā`) là tâm sở biến hành, còn định thiện trong thực hành là phạm trù có bối cảnh. "Phóng dật" không đồng nhất với bất cứ suy nghĩ nào, "Si" không phải nhãn cho người học chưa giỏi. Phần ánh xạ chính xác cần thầy duyệt.

### Ví dụ thuật toán rơi thẻ (giá trị chỉ để prototype, cần thử người chơi)

```js
function candidateCard({ active, notes, missed, stableSeconds, practicedDays, eventTags }) {
  if (!active) return null; // không thưởng khi chỉ treo máy hoặc offline
  if (eventTags.includes('misunderstanding_seen')) return 'si';
  if (eventTags.includes('unwholesome_agitation_seen')) return 'phong_dat';
  if (practicedDays >= 2 && notes >= 3 && missed <= 2 && stableSeconds >= 25) return 'dinh';
  if (notes >= 2) return 'niem';
  return null; // còn lại: nhật ký và gợi ý thực hành, không phạt
}
```

- **Một buổi tối đa một thẻ chính**; không bắt buộc phải rơi thẻ; thẻ đã biết có thể mở mặt hoặc chỉ ghi "gặp lại", tránh spam.
- Vài tình huống có thể mở thẻ bất thiện để *hiểu*, không đồng nghĩa khen thưởng việc bất thiện.
- Chỉ phần việc người chơi **chủ động thực hành** mới có cơ hội mở thẻ. Hoạt động offline không tăng chỉ số tu chứng và không rơi thẻ.
- Sự may rủi nhỏ chỉ ảnh hưởng biến thể câu chuyện, không thay thế điều kiện quan sát được.

## 8. Thực hành tự do: menu "Hôm nay muốn làm gì?"

| Hoạt động | Tương tác thật | Kết quả có ý nghĩa |
|---|---|---|
| Ngồi thiền 2/5/10 phút | nhận diện một số xao lãng; giữ **một đề mục**, không chơi chạm liên tục để ăn điểm | nhật ký: mấy lần quay lại đề mục; thẻ **theo điều kiện** |
| Kinh hành 1–3 vòng | người chơi chọn điểm dừng, chú ý bước; không phạt nếu tạm dừng | tiến trình buổi tập, đôi khi nhiệm vụ gặp người trên đường |
| Học kinh | chọn đoạn ngắn có nguồn, đọc/nghe, chọn cách ứng dụng vào hoàn cảnh trong làng | sư hỏi lại hôm sau, không thưởng do click suông |
| Quét sân / xách nước | thao tác nhẹ, đủ đa dạng theo thời tiết | vật dụng, sự thay đổi của cảnh, quan hệ |
| May y | khâu từng mũi qua câu chuyện nhiều ngày | mảnh vải thay đổi trên hình nhân vật |
| Nghe pháp bên tường (vai ma) | chọn dừng lắng nghe/nhìn ký ức | văn bản hồi tưởng, không có tác động vật lý lên người sống |

Người chơi có thể **dừng giữa chừng, đi dạo, hoặc thoát**; lưu `practice.session` với `startAt, elapsedActiveSeconds, interruptions, notes, stage`. Không cho timer chạy như "đang thực hành" khi tab tắt. Có thể vào lại tiếp tục hoặc kết thúc một buổi chưa trọn mà không bị chê.

## 9. Vòng chơi "gieo — lớn — gặt": đi vắng phải có kết quả thật

> **Quyết định thiết kế mới (07-11-2026):** thay mô hình "việc khi vắng chỉ sinh lời kể" của bản đầu bằng **tiến trình có trạng thái, có kết quả hữu hình và có khả năng mở thêm cách chơi**. Đây là thiết kế **chưa được triển khai trong mã**. Đối chiếu mục 16.3 của [he-thong-tam.md](he-thong-tam.md); mục 18 ở đó đánh dấu thay đổi quyết định.

### 9.1. Tại sao người chơi sẽ muốn quay lại?

Lấy phép so sánh game làm vườn: gieo hạt → thấy mầm → tưới → cây lớn → thu hoạch. Trong game này: **giao việc có chủ đích → thấy việc tiến triển → nhận một kết quả có tên → cất vào sổ/túi → dùng kết quả trong tình huống tương lai**.

Tránh hai cực đoan: (1) chờ 8 giờ rồi chỉ nhận ba dòng chuyện kể; (2) treo game qua đêm rồi tự nhận mọi thẻ tu chứng. Chỉ khoảng vài phút trong game cũng cần được ghi nhận, nhưng không phải lần nào cũng tự sinh kiến thức mới nếu chưa hoàn thành phần học đó.

| Người chơi quay lại | Phản hồi bắt buộc | Kết quả/việc kế tiếp |
|---|---|---|
| Sau một lát | vị trí và tư thế của nhân vật; việc đã tiến tới đâu | một dấu tiến triển nhìn thấy, ví dụ đã mở kinh, đã đọc đến trang 2/4; có thể chuyển sang việc khác |
| Sau khi hoàn thành một **đơn vị công việc** | **màn nhận kết quả riêng**, một nội dung cụ thể | kiến thức đã nghe/đọc, vật liệu đã hoàn thiện, manh mối hoặc quan hệ; lưu vào sổ/túi và có thể sử dụng |
| Quay lại sau nhiều ngày | một kết quả cho **lượt giao việc đó**, không sinh hàng chục lượt giả | không phạt; xem điều đã xảy ra và chọn việc mới |

**Phân biệt:** kết quả có thể chắc chắn khi đủ điều kiện (một mẩu kiến thức/chiếc khăn/đoạn vải), còn sự kiện bất ngờ có thể thêm biến thể để tạo cảm giác sống động. Không dùng xác suất gacha để quyết định có được kiến thức cơ bản hay không. Định mức thời gian chỉ là cân bằng gameplay, không phải chỉ số đo tâm.

### 9.2. Hai loại "thẻ" và Sổ kiến thức

Cần hỗ trợ **nhận thẻ sau việc vắng** mà không ngụ ý nhân vật đã thực tu hay người chơi chứng đắc.

| | **Thẻ kiến thức / Sổ kiến thức** | **Thẻ tâm sở qua trải nghiệm** |
|---|---|---|
| Nhận bằng | nhân vật **học kinh / nghe pháp / ôn bài** khi vắng hoặc người chơi đọc trong game | người chơi **chủ động đối diện, nhận diện, lựa chọn** trong tình huống/mini-game |
| Ghi nhãn | "Đã nghe về Niệm", "Đã học khái niệm năm triền cái" | "Đã gặp tình huống minh họa về Niệm/Phóng dật…" |
| Ghi vào | **Sổ kiến thức**: chương, mục, đoạn học, nguồn, thời điểm, ví dụ | **Album thẻ tâm** và nhật ký trải nghiệm |
| Khi có lại | ôn/làm rõ mặt sau, mở ví dụ, kết nối khái niệm; không sinh bản sao vô hạn | theo quy tắc gặp lại của thẻ tâm, không tự lên cấp khi offline |
| Dùng về sau | thêm một lựa chọn đối thoại, biết tên hiện tượng, mở đoạn giảng/sự kiện phụ, gợi ý chính xác hơn | dùng hệ thống thẻ đối trị/nhận diện theo điều kiện active của mục 4b |
| Tuyệt đối không | ghi "đã chứng định", "đã đoạn trừ phiền não" | tự cấp do đồng hồ offline hoặc click nhận thưởng |

**Ba trạng thái từng mục trong Sổ kiến thức:**

1. **Đã nghe/đã đọc:** nhân vật đã tiếp xúc một đoạn kinh; tự động lưu khi nhiệm vụ học hoàn thành; không tuyên bố đã hiểu sâu.
2. **Đã ôn:** người chơi mở mục kiến thức xem lại hoặc trả lời một câu liên hệ đời thường. Có thể xem không cần câu hỏi bắt buộc.
3. **Đã vận dụng trong truyện:** lựa chọn phù hợp trong một tình huống sau này; mở ghi chú "Bạn từng dùng điều này khi…". Không biến thành phép cộng "công đức".

Một kiến thức có thể chứa một **thẻ minh họa về tâm sở** nhưng đó vẫn là thẻ học, không được tự đặt vào Album thẻ tâm trải nghiệm. UI có thể dùng chung kiểu thẻ, nhưng nhãn và đường phát triển phải phân biệt được.

**Mẫu trang kiến thức:**

> **Năm triền cái — Những điều cản trở việc tu tập**  
> Đã nghe: đoạn giải thích ngắn về tham dục, sân, hôn trầm–thụy miên, trạo cử–hối quá, nghi.  
> Gợi ý: "Buồn ngủ lúc ngồi? Hãy nhận ra tình trạng ấy; có thể thử kinh hành."  
> Lần sau: "Sư già có điều muốn hỏi về một chướng ngại thường gặp."  
> Nguồn: liên kết đến kinh/bài giảng và ghi rõ đây là bản tóm ý của game, cần duyệt.

### 9.3. Kịch bản mẫu A — giao "Học một đoạn kinh", thoát, quay lại nhận thẻ kiến thức

**Lần vào thứ nhất (1–2 phút):**

- Tại kệ kinh hoặc màn **Việc khi vắng**, người chơi chọn *Học về năm triền cái* thay vì một mục mơ hồ như "Học kinh".
- Game hiện mục tiêu rất rõ: "Đọc một đoạn ngắn. Lần sau sẽ ghi vào Sổ kiến thức."
- Nhân vật ngồi mở sách. Lưu `activityId=study`, `lessonId=kn_five_hindrances_01`, `startedAt`, `status=running`, `role`. Người chơi thoát.

**Lần vào thứ hai:**

> **Trong lúc vắng**  
> Thầy đã đọc xong một đoạn kinh về những điều cản trở tâm yên. Có lúc mắt mỏi, thầy gấp sách nghỉ, rồi xem lại.  
> **Mở khóa kiến thức: Năm triền cái**  
> Đã lưu vào **Sổ kiến thức**.  
> Gợi ý: *Sư già có thể chỉ cho bạn cách nhận ra cơn buồn ngủ khi ngồi.*

Nút: **Xem kiến thức mới** · **Đến gặp sư già** · **Giao việc khác**. Người chơi chọn đi dạo thì kiến thức vẫn nằm trong sổ, không mất.

**Lần vào kế tiếp / gặp sư:**

- Không có kiến thức: sư nói "Khi mắt nặng, con có thể thay bằng đi kinh hành"; nhiệm vụ vẫn chơi được.
- Có `kn_five_hindrances_01`: sư hỏi "Con đã nghe đến hôn trầm. Lúc nó đến, con muốn thử cách nào?" → hiện thêm lựa chọn **"Xin chỉ cách kinh hành khi tâm chìm xuống"**, mở buổi kinh hành/hội thoại mở rộng.
- Có thêm một buổi tự tập, người chơi nhận diện đúng tình huống: Sổ ghi **Đã vận dụng**; khi đó có thể mở thêm mặt kiến thức hoặc có cơ hội nhận **thẻ tâm sở qua trải nghiệm** theo luật riêng.

**Khác biệt giữa kiến thức và thực hành:** nghe nói về hôn trầm không tự chứng minh rằng người chơi đang có hôn trầm; hiểu khái niệm Định không tương đương đắc định.

**Gợi ý danh sách bài học đầu tiên:** Niệm là gì; năm triền cái; tâm từ; vô thường (ở cấp khái niệm); bố thí và giữ lời hứa; các hạnh đầu-đà; mỗi bài 1 đoạn ngắn gắn với tình huống ở làng, không giả định ai học một đêm là thuộc trọn một bộ kinh.

### 9.4. Kịch bản mẫu B — không chỉ học kinh, việc thường cũng "lớn lên"

| Vai và công việc vắng | Tiến trình nhìn thấy | Thành quả khi quay lại | Cách sử dụng về sau |
|---|---|---|---|
| **Sư: đọc một đoạn kinh** | trang 1/3 → 2/3 → xong đoạn | một mục **Sổ kiến thức**, một gợi ý mới | thêm nhánh đối thoại với sư, thêm gợi ý khi ngồi/kinh hành |
| **Sư: chuẩn bị may y** | kim chỉ đã chuẩn bị, vải đã phơi | `robe.materialReady`, hình vải đổi | khâu bằng tay ở lần chơi tới; offline **không tự may xong cả bộ** |
| **Sư: ngồi yên / kinh hành** | hoạt ảnh, ước lượng thời gian sinh hoạt | nhật ký sinh hoạt + một tình huống để thực hành **khi quay lại** | không thưởng Niệm, Định hay giác chi chỉ vì vắng |
| **Dân: nấu cơm** | bếp có lửa, cơm đã chín | một phần cơm chuẩn bị để dâng | sáng đến gặp sư/giúp người, **lúc ấy** có cơ hội thẻ Không tham |
| **Dân: dệt vải** | tấm vải dài lên từng đoạn | `cloth_progress`, tấm vải thật nếu hoàn thành | cúng dường hoặc mở nhiệm vụ nối với tuyến làm y |
| **Dân: nghe pháp** | đã nghe tới đoạn nào | kiến thức đã nghe + tin tức có nguồn trong truyện | nhận ra lời đồn nào cần kiểm chứng, hội thoại mới |
| **Ma: đứng ngoài tường nghe kinh** | tiếng tụng kinh thay đổi theo canh, ký ức chuyển nhẹ | mảnh **Đã nghe câu kinh** trong Sổ ký ức (không là thẻ tu chứng) | một lựa chọn mới khi gặp hình bóng Hạnh; không thao tác vật lý |
| **Ma: nhìn lại ký ức cũ** | mảnh ký ức được xâu nối | một mảnh chuyện thật về bà Sáu | thêm nhánh tự nhận biết ở gốc gạo, không tự "siêu thoát" theo timer |

**Tính kế thừa:** công việc vắng chuẩn bị "nguyên liệu / kiến thức / cơ hội", người chơi quay lại có hoạt động **chủ động** để sử dụng kết quả. Nhưng ít nhất **kết quả học và chuẩn bị** phải nhận được thật, không chỉ là lời hứa.

### 9.5. Khi có kiến thức, câu chuyện đổi cách — không chặn người mới

| Điều kiện đã có | Nhiệm vụ cũ vẫn có | Cơ hội bổ sung khi đã học |
|---|---|---|
| `kn_five_hindrances_01` | ngồi yên, nhận diện buồn ngủ | sư già nhắc đến triền cái, mở kinh hành hướng dẫn |
| `kn_metta_01` | làm lành với ông Tư | thêm lời đáp dịu dàng, tình huống rải tâm từ |
| `kn_impermanence_01` | ngắm hoa sen | nhận thấy hoa nở/rụng, mở hội thoại suy xét |
| `kn_generosity_01` | làm việc thiện cho dân làng | nhìn rõ khác biệt giữa việc hứa, giữ lời và chia vật dụng của mình |
| `kn_dhutanga_01` | nhặt và may vải theo tuyến y | có đoạn sư già giải thích lý do sử dụng y giản dị |

**Thiết kế cân bằng:** kiến thức là **chìa khóa mở thêm lựa chọn hoặc cách hiểu**, không phải vật phẩm tăng 50% "hiệu quả thiền" hay bắt buộc để qua cốt truyện. Người không muốn học vẫn có lối chơi phù hợp. Một lựa chọn thêm không nhất thiết là "đáp án đúng" duy nhất.

### 9.6. Điều kiện, phần thưởng, lưu trữ — chống nhận lặp

**Đề xuất tách ba lớp dữ liệu theo nhân vật:**

```js
// MINH HỌA SCHEMA, không phải API hiện hành
knowledge = {
  kn_five_hindrances_01: {
    stage: "heard", // heard | reviewed | applied
    firstLearnedAt: 1790000000000,
    sourceId: "sutta_or_commentary_ref",
    relatedCards: ["hon_tram", "hoai_nghi"],
    unlocks: ["monk_hindrance_dialogue", "walking_instruction"],
    examples: []
  }
}
awayJob = {
  jobId: "job_per_character_unique_id",
  activity: "study",
  lessonId: "kn_five_hindrances_01",
  startedAt: 1790000000000,
  progress: 0,
  status: "running", // running | ready | claimed
  rewardId: "knowledge:kn_five_hindrances_01",
  resolvedAt: null
}
```

- Sau giao việc, **mọi lần quay lại đều thấy trạng thái**: còn đang học / đã sẵn kết quả / đã nhận. Chọn thời gian hợp với thời lượng một *đoạn* ngắn. Không buộc người chơi mở game đúng lúc; không thưởng "điểm danh".
- Hoàn thành công việc = **một phần thưởng hữu hình theo catalog**, xác định trước và hợp vai. Nếu bài học đã có, thưởng mặt giải thích/đoạn ví dụ hoặc cơ hội ôn, không rơi lại thẻ mới vô hạn.
- `jobId` + `rewardId` phải xử lý **idempotent** khi đăng nhập lại/tải lại trang/chuyển thiết bị. Kết quả sẵn sàng thì lưu vào nhân vật **trước** khi hiển thị popup, không phụ thuộc người chơi có bấm "Nhận" hay không.
- Phân biệt **thời gian ngoài game** (mô phỏng việc nhân vật làm và tính tiến trình) với **thời gian chủ động của người chơi** (thực hành để gặp thẻ tâm): timer offline **không** cộng `practiceSessions`, không tăng cấp thiện tâm hoặc chứng đắc.
- Nghỉ một tháng không bị phạt, nhưng một việc không tự sinh ra 30 lần quà. Hoàn thành rồi chuyển `ready`, chờ người chơi vào giao việc tiếp. Không có quá trình lao động vô hạn.
- Cần quyết định sau về storage xuyên thiết bị: hiện `NightReflect` và `Progress` giữ `away`, `returnFrom`, còn `Mind.S` và `Save` lưu trạng thái nhân vật. Nên có **hàm hoàn tất công việc duy nhất**, thay vì mỗi UI tự cấp thẻ/vật phẩm.

### 9.7. Sửa lỗi logic: Bà cụ nhờ hái rau má nhưng người chơi lại đem cho ông Tư

**Đã xác nhận trong mã** `public/mind.js`: `atWell()` cho bà nhờ hái rau; `atMit() → picked2()` ngay lập tức cho chọn `Mang về cho bà cụ`, `Mang sang nhà ông Tư`, hoặc `Giữ lại nấu canh`. Nhánh `deliver()` thưởng khác nhau, nhưng không xử lý **lời nhờ và sự chờ đợi** của bà nếu đem đi nơi khác. Đây là lỗi **nhân quả và nhất quán lời hứa**, không chỉ lỗi diễn đạt.

**Luồng đề xuất:**

1. Bà nhờ: "Hái giúp bà một nắm rau má." Người chơi chọn **Nhận lời**, sinh `grannyHerbs.status=accepted`. Có thể **Từ chối/để sau**, không bị ép và không gắn lời hứa.
2. Sau khi hái: nhiệm vụ chính là **"Mang rau về cho bà"**. Không đưa ra lựa chọn tặng cả nắm rau của bà cho người khác như một hành động thiện mặc định.
3. Trở về giếng: bà nhận rau, cám ơn; ghi `fulfilled`. **Sau đó** mở nhánh tùy chọn: bà chia cho một phần, hoặc nhờ hái thêm nắm riêng để đem cho ông Tư. Như vậy việc hòa giải là **một nhiệm vụ mới có nguồn vật phẩm rõ**, không lấy vật đã hứa.
4. Nếu muốn cho phép người chơi **tự ý đổi ý**, phải kể hậu quả trung thực: bà vẫn chờ; hôm sau hỏi "Hôm qua con định mang rau về mà?" Người chơi có thể xin lỗi, quay lại hái cho bà. **Không** tự thưởng Không tham/Không sân rồi coi như đã hoàn thành lời hứa.
5. Các nhánh phải ghi vào ký ức của làng (bà cụ, ông Tư), nhật ký và `questList`; không được nhân đôi cùng một nắm `rau_ma`.

**Phân vai và giới luật phải duyệt:** hiện chuỗi chó cắn/hái rau chạy cho cả `monk` và `villager`. Với **tỳ-kheo Theravāda**, việc chủ ý cắt/bứt cây sống có quy tắc giới luật liên quan (Pācittiya 11). Cần giáo thọ duyệt lại toàn bộ thao tác hái rau/hoa sen và xác nhận vai. Hướng an toàn để viết: **dân làng hái rau**, còn nhà sư có thể nhận vật được dâng hoặc tham gia một câu chuyện khác phù hợp giới luật, thay vì tự bứt cây. Nguồn rà soát: https://www.dhammatalks.org/vinaya/bmc/Section0017.html và https://dhamma.gift/pli-tv-bu-pm?mode=multi

**Tiêu chí nghiệm thu:** nhận lời bà → hái → đưa ông Tư **không thể hoàn tất êm xuôi** như đã trả bà; nếu trả bà trước mới mở tùy chọn hòa giải; lưu/reload giữa chừng giữ đúng chủ sở hữu và trạng thái lời hứa.

### 9.8. Kế hoạch triển khai phần thưởng lúc vắng (ưu tiên hơn thêm nhiều quest ngẫu nhiên)

1. **Sổ kiến thức MVP:** định nghĩa khoảng 6 kiến thức ngắn gắn với các kinh/sách đã có ở tịnh thất; lưu trạng thái `heard/reviewed/applied` và nội dung/tài liệu tham chiếu.
2. **Nâng hoạt động vắng:** `study` và `weave`/`cook` có tiến trình, báo cáo, kết quả `ready` và nhận duy nhất một lần; việc đọc kinh thưởng *kiến thức*, không phải tâm sở thiện đã tu tập.
3. **Kết quả mở chuyện thật:** 2–3 hội thoại phụ có điều kiện `kn_*`, thêm nút **Xem Sổ kiến thức** ngay trong phần thưởng và trang hồ sơ.
4. **Sửa lời hứa rau má** theo mục 9.7, thêm kiểm tra giới luật/tuyến vai.
5. Sau khi kiểm thử vòng giao việc → offline → quay lại → nhận → dùng, mới mở rộng danh mục cho tất cả ba vai.

**Tests cần có:** quay lại sớm thấy progress; đủ thời gian có kết quả; reload không nhân thưởng; giao cùng một bài đã học không sinh bản sao; kiến thức mở một nhánh phụ nhưng không chặn nhánh thường; offline không cấp thẻ tâm trải nghiệm; giao việc dệt vải có vật liệu thật; lời nhờ của bà được xử lý nhất quán; vai sư không có thao tác hái cây sống khi chưa duyệt.

## 10. Thứ tự triển khai và tiêu chí nghiệm thu

**Đợt A — sửa sai nhập vai và đa dạng hóa ngay**: giới hạn nhiệm vụ bé Na cho sư/dân; thêm cung ký ức nhỏ cho ma; ma không hái hoa/dâng hoa bằng tay; thêm thẻ Định và Phóng dật theo điều kiện quan sát. Tạo test cho `role` và điều kiện nhận thẻ.

**Đợt B — tuyến y phấn tảo thực sự chơi được**: 5 bước, `robe.step` lưu theo nhân vật, dùng asset vải/y, thao tác nhỏ cho mỗi bước, xuất hiện trong bảng Nhiệm vụ, skin khi xong, không skip bằng offline.

**Đợt C — vòng quay lại có phần thưởng thật (ưu tiên cao)**: Sổ kiến thức, hoạt động khi vắng có tiến trình và phần thưởng, kiến thức mở hội thoại phụ, sửa lỗi lời hẹn rau má; sau đó mở kinh hành/ngồi/học kinh bất kỳ lúc, 10–15 storylet theo trạng thái.

**Đợt D — cân bằng và giáo lý**: giáo thọ duyệt thuật ngữ; kiểm tra 5 người chơi mới qua 3–5 đêm; đo mức lặp nhiệm vụ, số buổi ngồi tự chọn, số người quay lại chỉ để xem "Trong lúc vắng", chỗ người chơi dừng.

**Bài test chấp nhận:**

1. Hồn ma đến gốc gạo: **không bao giờ** nhận "Tìm bé Na / dỗ dành / dẫn bé về"; thay bằng nhớ và quan sát.
2. Dân/sư vẫn đưa bé Na về được như trước; save cũ không mất.
3. Ngồi xong chỉ vì đồng hồ chạy **không bảo đảm** rơi thẻ Niệm, Định.
4. Định chỉ có cơ hội xuất hiện khi đủ minh chứng buổi thực hành chủ động; không hiển thị "đắc thiền".
5. Tuyến y phấn tảo qua ít nhất 3 ngày/đêm, không xong ngay trong 3 phút.
6. Rời game 7 ngày rồi quay lại: **một công việc có một kết quả hữu hình được lưu vào sổ/túi** (kiến thức, vật liệu, manh mối), không nhân thành 7 lượt và không tự cộng 7 ngày tu tập/7 thẻ tâm trải nghiệm.
7. Người chơi bỏ qua việc hôm nay: ngày mai vẫn có thể trở lại, không phạt.
8. Cùng một storylet không tự động lặp hai ngày liên tục; lời hẹn "ngày mai" phải dẫn đến cảnh thực.
9. Học kinh khi vắng → Sổ kiến thức có mục mới và một hội thoại phụ mở ra; reload không nhân bản phần thưởng.
10. Bà cụ nhờ hái rau → không thể tặng nguyên nắm cho ông Tư mà vẫn tính hoàn thành lời hẹn với bà; cần duyệt vai sư trước khi cho tự hái cây sống.

## 11. Trạng thái hiện tại so với tài liệu

- **Đã có trong mã trước đợt này:** câu chuyện đầu, chuỗi chó cắn, 10 thẻ, ngồi với sư, nhật ký, lời hẹn, hoạt động khi vắng (chủ yếu kể chuyện), truyện ma chính trong `story.js`.
- **Thiết kế ở tài liệu này:** vòng ngày 5 buổi, cung y phấn tảo đủ 5 ngày, tuyến ông Tư 4 ngày, hoạt động tự do, **offline rewards + Sổ kiến thức + dùng kiến thức mở tương tác**, và sửa logic lời nhờ hái rau má.
- **Bản mã thử của đợt A:** xem mô tả PR; các hạng mục chưa code **không** được ghi là "đã triển khai" trong README hoặc tài liệu hệ thống tâm.

