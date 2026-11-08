# Narrative Review — Nhân gian v0.2

> **Biên tập nội dung, chưa thay đổi gameplay.** Review dựa trên `develop` và bộ tài liệu hiện tại. Chuẩn áp dụng: [Game Design Principles](game-design-principles.md) và [Human World Story Bible](human-world-story-bible.md). Các kết quả/bản ghi trong tài liệu này là **đề xuất**, không phải tính năng đã chạy.
>
> Xem [Human World Playable Scenarios](human-world-playable-scenarios.md) (danh mục) và [Human World Episode Pack 01](human-world-episode-pack-01.md) (cảnh, lựa chọn, thay đổi thế giới, điều kiện quay lại).

## 1. Kết luận review

**Không nên viết 40 nhiệm vụ mới rồi mới thử.** Nhân gian đã có truyện khởi đầu đáng giữ, nhưng còn thiếu **lịch sống của NPC**, **cảnh đẹp không giao việc**, **hậu quả hiện trên map**, **tình huống ngắn thay đổi theo người chơi**, và **tính nhất quán khi trở lại**. Viết sâu 4–6 cụm dùng chung nhân vật và địa điểm sẽ tiết kiệm asset hơn thêm 20 NPC.

| Trục kiểm tra | Đã có ở code/tài liệu | Khoảng trống chính | Hướng biên tập |
|---|---|---|---|
| Truyện chính ba vai | `story.js`, `story-nights.js`; sư / ông Tư / bà Sáu | nhiều tuyến chỉ có một kết, không đủ sau 2–3 ngày | **hậu truyện ngắn theo ký ức**, không kể lại mở đầu |
| Quest quanh làng | `mind.js`, `encounters.js` | auto popup; lời hứa rau má lệch; lựa chọn không đổi NPC/đồ vật nhiều | giao việc chủ động, lời hứa và hậu quả |
| Tịnh thất / tu tập | ngồi với sư, `robe.js` 5 ngày, hoạt động `reflect.js` | bước y còn dùng nút để qua; không có mô hình học → vận dụng | lời sư đổi theo thẻ học, tiến trình vật dụng hiển thị |
| Cảnh khám phá | ao, gốc gạo, bia đá, hang và tháp | đa phần chỉ một popup hoặc chữ | chu kỳ cảnh, ánh sáng, dấu tích, đường vòng nhỏ |
| Khi vắng | `reflect.js` có báo cáo narrative | chưa có sản phẩm / kiến thức được lưu server đúng một lần | kết quả thật, tránh thưởng trải nghiệm thiền tự động |
| Thời tiết | `story-nights.js` có đêm trăng, mưa phùn; `world.js` có sương | chưa cần engine thời tiết toàn cục | **nắng dịu/trăng/sương là chủ đạo**; mưa nhẹ đôi khi; bão chỉ episode tự chọn |

## 2. Ma trận chống viết trùng với kịch bản trong code

| Ý tưởng trong danh mục | Nền đang tồn tại | Cách viết tiếp hợp lý | Cần tránh |
|---|---|---|---|
| HG02 "Bảy ngôi nhà — một chiếc bát" | `STORY.monk.scenes.a0...a3` đã có nhà có trẻ, chó vàng, nhà thứ bảy từ chối | **hậu truyện của người ở nhà thứ bảy**: lần sau thấy người quét sân hoặc để bát nước, không bắt người ta phải tin | làm lại y nguyên màn khất thực 7 nhà |
| HG06 "Ba bát xôi chưa trả" | `STORY.villager` đã nhắc việc ông Tư ăn chịu xôi bà Sáu | câu chuyện **nhận nợ/nhớ ơn người cũ** sau đêm nghĩa địa; không trao vật trực tiếp cho ma | lặp đoạn ông Tư bỗng nhớ nợ lần đầu |
| HG09 "Bức tranh bé Na" | `encounters.js` có tuyến bé Na và thọ thần | **hậu chuyện** chị Ba/bé Na khi nhiệm vụ bé Na đã xong; nếu chưa chơi vẫn có một hình vẽ ngoài sân để ngắm | tiếp tục bắt người chơi dỗ trẻ lần hai |
| HG18 "Bà Sáu nghe tiếng xôi" | `STORY.ghost`, `ghost_memory` đều kể ký ức bà Sáu–Hạnh | phản ứng mới của bà **sau khi đã phân biệt bóng người khác với con**; viết cả trường hợp chưa nhận ra | "khám phá" lại thông tin Hạnh là con bà |
| HG04 "Mũi khâu dưới hiên" | `robe.js` đã có 5 bước theo ngày | tăng tương tác cụ thể + dấu y trong cảnh; **không** tạo quest y mới độc lập | nhân đôi `robe.step` hoặc nhận hai tấm y |
| HG05 rau má | `mind.js` hiện cho mang cho bà hoặc ông Tư sau khi đã nhận lời bà | sửa **vật phẩm đã hứa**, phát sinh nhánh giúp ông Tư riêng sau đó | tự thưởng Không tham khi không giữ lời |

**Vấn đề hiển thị thẻ:** album, Sổ kiến thức và Sổ khám phá phải tách ý nghĩa; môi trường có thể thưởng một dấu khám phá mà không cấp tâm sở. Các lời kể như "ngồi xong được định", "tâm nào cõi nấy" cần rà lại vì game chỉ đang dùng mô phỏng, không được quảng bá là quan hệ nghiệp báo chính xác.

### P0 — Vai người dân là Ông Tư, không phải avatar vô danh

`public/story.js` định nghĩa `ROLE_INFO.villager.who = "Ông Tư đầu xóm"`, con Vàng là chó **nhà ông Tư**. Trong khi `public/mind.js` dùng cùng chuỗi chó cắn/rau má cho vai người chơi, rồi cho lựa chọn **"Mang rau sang nhà ông Tư"**. Nếu `role=villager`, nhân vật vừa là ông Tư vừa đi gặp ông Tư — **lỗi nhập vai có thật**, cần sửa trước khi thêm bất kỳ quest phụ cùng tuyến. Không chỉ đổi lời thoại: cần viết riêng phản ứng khi chủ chó chính là người chơi, chủ động xử lý chuyện con Vàng, và giữ lời hứa với bà cụ. [HG23](human-world-episode-pack-01.md#hg23--con-vàng-và-khoảng-sân-trước-nhà) là phương án biên kịch.

**Phân tuyến rõ:** Sư Tịnh (`monk`) có thể bị chó làm sợ trong một chuyện nếu hợp lý nhưng không được ép bị cắn mỗi lần đi ngang; Ông Tư (`villager`) chịu trách nhiệm với chó nhà; Bà Sáu (`ghost`) chỉ quan sát. Hiện trạng code **chưa sửa** trong PR tài liệu này.

## 3. Quy tắc biên tập mới: một cảnh đáng chơi gồm 9 thông tin

Mỗi scene nộp để dựng phải có:

1. **Promise:** vì sao đáng dừng lại dù không cần quest?
2. **Signal/ambient:** người chơi thấy/nghe gì từ xa, không ngắt điều khiển?
3. **Trigger chủ động:** bấm `Quan sát / Nghe / Làm thử`, không auto popup theo khoảng cách.
4. **Prerequisite:** điều kiện vai, nơi, thời điểm, ký ức, weather; điều kiện không đạt thì có cảnh bình thường nào?
5. **Choice có khác biệt:** mỗi lựa chọn tối thiểu thay đổi một trong **lời thoại, dấu sổ, vật thể, quan hệ, lối phụ**. Nếu hai nút chỉ cùng một lời kết, gom lại.
6. **Payoff ngay:** ít nhất một phản hồi hữu hình (animation, đồ vật, NPC, khung cảnh, dòng Sổ), không yêu cầu đợi ngày hôm sau để có thứ gì.
7. **Payoff lần sau:** một chi tiết đổi khi trở lại, nhưng NPC không đứng chờ vô hạn khi người chơi bỏ qua.
8. **Skip/revisit:** bỏ qua vẫn đi tiếp, xem lại không nhân quà, không mở lại cảnh giới thiệu đã biết.
9. **Lore & role:** `loreBasis` rõ, hành động phù hợp vai, lời Phật học dẫn nguồn nếu ghi là kinh/chú giải.

**Một scene không quest vẫn cần phần thưởng**: dấu cảnh trong Sổ, biến thể của âm thanh/ánh sáng, một góc nhìn hoặc một câu gợi tò mò. Không phải lúc nào cũng tăng thẻ.

## 4. Nhịp sinh hoạt tại 11 địa danh không cần quest

Bản sau là **lịch diễn xuất ambient, không phải lịch mở khóa cưỡng bức**. Không thêm NPC mới nếu có thể dùng nhân vật hiện hữu.

| Khung giờ trong game | Làng / giếng / gốc mít | Ao / bụi tre / cổng nghĩa địa | Tịnh thất / gốc gạo / mộ / tháp |
|---|---|---|---|
| Rạng sáng | ông Tư nhóm bếp, bà cụ kéo gầu | sương ao, tiếng chim nhỏ, con Vàng ngủ | sư già bước chậm dưới hiên, giọt sương trên lá gạo |
| Sáng | chị Ba phơi khăn, bé Na vẽ (nếu đã về nhà), đồ hàng đổi | sen mở, chuồn chuồn, bước chân qua tre | sư xem y, mặt tháp sáng hơn; mộ có bóng tre |
| Chiều | ông Tư sửa giỏ/nhà, bà cụ ngồi đan | ánh nắng xiên, tiếng bánh xe xa | tiếng chuông, sách còn mở, bóng cây gạo dài |
| Chạng vạng | đèn nhà thắp, người đi về | đom đóm, gió qua tre | ánh đèn dưới tháp, vệt rêu nổi, nghĩa địa tĩnh |
| Đêm | đèn hiên, con Vàng nằm yên | trăng trên ao, tiếng ếch | sư ngồi, bà Sáu nhìn từ xa, chuông rất khẽ |

**Phụ thuộc trạng thái:** bé Na chỉ xuất hiện ở nhà trong cảnh "đã về" nếu nhiệm vụ cứu trẻ hoàn tất; không có hậu cảnh cho NPC chưa được giới thiệu làm lộ bí mật. Bà Sáu chỉ quan sát người sống, không cầm vật; sư không hái cây sống. Khi không có người chơi, NPC vẫn có một chu kỳ tự đi từ trạng thái *đang làm → xong* để làng không bị đứng hình.

**Phương án giảm chi phí:** ban đầu dùng chuyển sprite/pose và lời thoại ambient, không lập hệ AI NPC tự do. Đúng thời điểm và trạng thái là đủ.

## 5. Thế giới nhất quán qua từng lần trở lại

### 5.1. Ba loại thay đổi

- **Ambient (không lưu từng hạt bụi):** ánh sáng, hoa, gió, tiếng bước chân, sinh hoạt thường; mỗi ngày thay một ít, không cần đếm "đã thu thập".
- **World effects (lưu):** sân đã quét; đèn đã treo; vải dưới hiên; rau đã trả; hình bé Na đã đặt trên tường; mái đã sửa. Ghi `effectId`, `sourceQuestId`, `visibleAtPlace`, `expiresOrEvolves`.
- **Character memory (lưu):** ai đã nhận lời, ai đang chờ, ai đã xin lỗi, ai đã nghe câu chuyện nào; dùng mở lời thoại/lối phụ, không "tăng thân thiện" vô hạn.

### 5.2. Ví dụ cùng một vị trí, ba thời điểm

**Giếng làng**:
- Lần đầu: bà cụ đang rửa chiếc rổ. Có thể ngắm giếng; bà chủ động nhờ rau nếu người chơi nhấn hỏi.
- Sau khi trả rau: bà cụ đun nồi canh dưới hiên; khi gặp nói "Con giúp bà hôm trước đó" thay vì lại nhờ cùng một việc.
- Sau vài ngày: bà cụ đã tự làm việc khác; nồi canh không đứng mãi như phần thưởng treo; có thể hỏi về ông Tư hoặc chiếc giỏ mới.

**Tịnh thất**:
- Chưa đọc: cuốn kinh còn khép.
- Giao học: nhân vật đang học; khi trở lại có trang được đánh dấu.
- Đã học: cuốn kinh được xếp lại; sư hỏi về một ý đã nghe. Không phát lại popup "Lần đầu thấy kệ kinh".

**Gốc gạo**:
- Lúc quang: bóng mát, tiếng lá.
- Có câu chuyện bà Sáu: có một lời nói về ký ức, tùy vai người nghe.
- Trở lại đêm khác: sự thay đổi là âm thanh/đốm sáng và một mảnh chuyện, không tự xuất hiện quest bé Na với vai ma.

## 6. Nguyên tắc xác suất câu chuyện (phân bổ không phải luật cứng)

- **Cảnh thư giãn/tự khám phá:** luôn sẵn hoặc xuất hiện theo giờ/mùa, không cần random quest.
- **Một câu chuyện theo quan hệ/NPC:** có 1 lựa chọn ngắn rõ; có cooldown; chỉ đề nghị khi đúng điều kiện.
- **Một bất ngờ trong ngày:** có thể có hoặc không; không phải ngày nào cũng 2–3 nhiệm vụ. `recentStoryletIds` ngăn lặp và tránh spam.
- **Thời tiết:** bầu trời đẹp/dễ chịu **85–90%+ thời gian dạo chơi** là mục tiêu thử; mưa nhẹ đôi khi mở cảnh riêng. **Bão không random; chỉ là chương tự chọn**. Không khóa thưởng chính bởi mưa/bão.
- **Một góc nhìn được phát hiện nhưng chưa hiểu:** cho phép Sổ ghi `seen`; khi học được kiến thức hoặc gặp người khác mới thêm `understood`, không xóa `seen`.

## 7. Rủi ro biên tập và Phật học cần duyệt

- **Thực hành của vai sư:** trong `story.js` có cảnh mang cơm đặt lên mộ; `mind.js` có nhánh hái rau và `encounters.js` có hái sen. Cần **giáo thọ duyệt** tính phù hợp với giới luật và truyền thống; không lấy logic game làm cách mô tả nghi thức Theravāda.
- **Ngạ quỷ:** không trao vật trực tiếp cho hồn ma, không cho bà Sáu dắt trẻ/hái hoa/giao hàng; hồi hướng phải là mạch truyện có nguồn và được duyệt, không bảo đảm kết quả siêu nhiên.
- **Cơ chế thẻ và tâm:** không nói một lựa chọn "lấy điểm Định" tương đương tu chứng; Tín không được dùng để trừng phạt người ham đặt câu hỏi.
- **Truyện mới HG21–HG26:** mặc định `loreBasis=fiction` hoặc `game_interpretation` đối với thao tác, chưa tuyên bố là trích kinh.
- **Trẻ nhỏ:** bé Na là người sống có mẹ chị Ba; không làm trẻ bị lạc liên tục chỉ để tạo nhiệm vụ.
- **Bối cảnh xã hội:** vật thể/trace có thể phản ánh ảnh hưởng của người khác nếu đã có hệ thống phù hợp, nhưng không bắt online/chờ người chơi khác, không biến nơi vắng thành trống rỗng.

## 8. Ưu tiên sau review

**P0 — viết & rà nội dung:** thống nhất vai và hậu truyện; giữ lời hứa; phân loại nguồn; mô tả "đi ngang không popup"; gói tập nhân gian nhỏ trong [Episode Pack 01](human-world-episode-pack-01.md).

**P1 — prototype nội dung không asset mới:** HG01 sân tịnh thất → HG03 kiến thức học lúc vắng → HG05 rau má (sửa) → HG11/HG12 cảnh nhìn → HG21 đèn đầu ngõ. Việc có thể dùng cùng 11 địa danh và asset tạm.

**P2 — chiều sâu theo vai:** HG18 ký ức bà Sáu; HG23 chuyện con Vàng; HG24 chuyện chiếc khăn/cây gạo; tạo phản hồi khác theo lịch sử đã làm.

**P3 — sau thử nghiệm người thật:** phát triển 2–3 biến thể cho mỗi cảnh được quay lại nhiều; tính tiếp hang, cõi ngạ quỷ và trời. **Không dựng map mới trước khi vòng Nhân gian gây tò mò và để lại kết quả hoạt động.**

## 9. Checklist review PR về sau

- [ ] Từng story có owner NPC/role rõ, không biến nhân vật khác thành vai không phù hợp.
- [ ] Đường vào và đường ra thuộc 11 địa danh hiện hữu, hoặc ghi rõ cần asset/map mới.
- [ ] Một lần nhìn đầu tiên có đủ giá trị, không bắt quest.
- [ ] Lời thoại không dạy đạo một cách máy móc; những câu giải thích kinh/luận có nguồn.
- [ ] Khi trở lại sau 1, 3, 7 ngày có sự thay đổi/đường tiếp, nhưng không phạt vì nghỉ.
- [ ] Vật phẩm và phần thưởng được lưu đúng một lần, không nhân do mở lại popup.
- [ ] Một NPC không thể ở hai nơi không tương thích cùng lúc trong cùng thời điểm.
- [ ] Một sự kiện đã hoàn thành không bị phát lại ở trạng thái "chưa biết".
- [ ] Trong ngày có thể **không làm gì** mà vẫn ngắm cảnh, nghe âm thanh, trở lại.
- [ ] Mọi feature chưa có đều ghi **design-only**, không lẫn với code đã ship.
