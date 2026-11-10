# Kế hoạch đêm cho PC người dân — bảy đêm đầu, mini game, thẻ tâm sở v0.1

> **Status:** Proposed (chờ chủ project duyệt, chưa tới mức Approved)
> **Scope:** narrative / UX / thẻ tâm sở
> **Owner doc:** [kich-ban-vong-ngay.md](kich-ban-vong-ngay.md) (vòng ngày) và [he-thong-tam.md](he-thong-tam.md) (thẻ)
> **Related:** [Player-Centric Narrative Model](player-character-narrative-model.md), [Human World Playable Scenarios](human-world-playable-scenarios.md), [Episode Pack 01](human-world-episode-pack-01.md), [Early Mysteries & HG27](human-world-early-mysteries-and-peta-quest.md), [World Exploration Bible](world-exploration-bible.md)
> **Code status:** Design-only. Chưa sửa code. Những chỗ ghi "hiện có" đã đối chiếu với `develop` ngày 2026-11-10.
> **Last reviewed:** 2026-11-10

Tài liệu này **không tạo lore mới**. Nó chọn, sắp thứ tự và nối các kịch bản đã soạn (HG05, HG06, HG07, HG09, HG12, HG13, HG14, HG20–HG27, HG03) thành bảy đêm đầu cho **PC người dân**. Vai nhà sư và hồn ma làm sau, dựa trên những gì học được khi người thật chơi vai dân.

## 1. Vì sao viết tài liệu này

Nhân vật tạo mới chơi theo chương "đến nơi" (`pa` / `pb`, xem [Player-Centric Narrative Model](player-character-narrative-model.md)). Hiện mỗi đêm của chế độ này chỉ có một cảnh ngắn với một lựa chọn, rồi tự mở quán xét và hồi hướng. Các nhiệm vụ phụ có trong tab Việc đang chờ nhưng đêm không chờ người chơi làm chúng. Kết quả: một đêm chỉ kéo dài vài phút, trong khi tài liệu [Kịch bản vòng ngày](kich-ban-vong-ngay.md) §1 nhắm tới 10–15 phút với một việc chính, một việc tự chọn và một lần quán xét.

### Quyết định đã chốt (2026-11-10, chủ project)

1. **Quán xét và hồi hướng chỉ mở khi người chơi bấm "Kết thúc đêm"**, không còn tự mở khi cảnh đầu xong.
2. **Bỏ nút "Chọn một vai khác"** ở màn kết đêm và màn quán xét. Một nhân vật gắn với một vai và đi tiếp nhiều đêm.
3. **Làm vai người dân trước**, thử với người chơi thật, rồi mới viết vai nhà sư và hồn ma.
4. **Đêm 1 và đêm 2 phải có chuyện huyền bí** (Thọ thần, bà ngoại ngạ quỷ), để người chơi thấy còn nhiều điều chưa khám phá.
5. Thêm **mini game nhẹ** vào các câu chuyện.
6. Nghiên cứu thêm **thẻ tâm sở** có thể tặng, phải phù hợp Vi Diệu Pháp (Abhidhamma).

## 2. Khung một đêm

Phần này chỉ gom lại các luật đã có trong docs, không thêm luật mới.

| Thành phần | Nội dung | Nguồn |
|---|---|---|
| Cảnh mở đầu | 1–2 câu, một lựa chọn nhỏ, rồi người chơi được đi tự do. Câu chữ cảnh này **do chủ project viết lại**; bản nháp chỉ để dựng luồng | model PC |
| Việc trong đêm | một danh sách ngắn trong tab Việc đang chờ: **1 việc chính, tối đa 2 tình huống sinh hoạt, 1 việc tự chọn** | [kich-ban-vong-ngay.md](kich-ban-vong-ngay.md) §2 |
| Hạn mức hiển thị | tại một lúc: 1 truyện đang theo, 0–2 chuyện sẵn để nhận, 1–2 dấu khám phá | [Playable Scenarios](human-world-playable-scenarios.md) §1 |
| Mở truyện | chỉ khi người chơi bấm (`explicit_interact`); không popup tự bật | [game-design-principles.md](game-design-principles.md) |
| Kết thúc | nút **Kết thúc đêm** luôn có; xong hết việc thì chỉ nhắc nhẹ một dòng, không chặn | này |
| Chống lặp | mỗi mẫu `cooldownDays = 2` hoặc `once`; không mẫu nào lặp hai đêm liền | [kich-ban-vong-ngay.md](kich-ban-vong-ngay.md) §2 |
| Bỏ qua | bỏ qua việc nào cũng không phạt; việc dở dang vẫn còn hôm sau | tiêu chí 7 §10 vòng ngày |

**Thời lượng mục tiêu:** đêm 1 khoảng 8–10 phút; các đêm sau 10–15 phút.

**Cần kiểm trong code trước khi chốt:** đồng hồ trời của game có đi hết một đêm (chiều tàn, khuya, rạng sáng) hay không. HG24 (bóng gốc gạo ba buổi) cần biết điều này. Nếu không đi, ba buổi của HG24 trải qua ba đêm khác nhau.

## 3. Khám phá và đóm sáng

Hiện người dân có **5 đóm sáng** (3 riêng cho vai: nồi cũ `fv_pot`, khăn cũ `fv_scarf`, đèn cũ `fv_lamp`; 2 chung: tịnh thất, phế tích), mở dần theo số đêm đã chơi. Chừng đó chưa đủ để đi dạo thành thói quen.

Hướng thống nhất với [World Exploration Bible](world-exploration-bible.md) §6 ("Bộ sưu tập của người tò mò"):

| Loại | Ý nghĩa | Khi chạm | Ghi vào |
|---|---|---|---|
| **Đóm vàng** (đang có) | kỷ vật, vật bị bỏ quên; gợi một mảnh chuyện nhỏ | một cảnh ngắn, có thể một lựa chọn | Sổ Hành Trình, phần Nơi chốn và nhân vật |
| **Đóm xanh** (mới) | dấu cảnh đẹp: trăng trên bia đá (HG11), ao sen (HG12), đốm đèn nơi xa (HG14), bóng gốc gạo (HG24) | ngắm là đủ; không nhận quest | một dòng Sổ + gợi ý đường tới nơi khác |
| **Dấu truyện** (đang có, qua tab nhiệm vụ) | chuyện lạ cần bấm vào mới bắt đầu (Thọ thần, mộ thấp) | bắt đầu truyện | tab Việc đang chờ |

Quy tắc:
- Mỗi nơi có **phần thưởng khám phá tối thiểu** dù người chơi không nhận quest.
- Mỗi đêm chỉ hiện **vài đóm gần người chơi**, không rải kín bản đồ. Số đóm vàng mỗi vai tăng dần tới 6–8 qua các đêm.
- Sổ đếm kiểu "đã thấy 7/18" nhưng **không bắt đủ**, không đổi vật phẩm hay thẻ để cày.
- Chuyện huyền bí (Thọ thần, ngạ quỷ, ngôi tháp, hang) được ghi vào **Sổ loài và cõi giới** với nhãn "trong mô phỏng"; tên Pāli chỉ ghi khi đã được thầy duyệt.

## 4. Mini game nhẹ

### Nguyên tắc

1. **Không có thất bại.** Làm hỏng thì làm lại, không phạt, không đếm số lần (khớp tiêu chí "không có cảnh thất bại" của HG17).
2. **Không thưởng thẻ theo điểm số hay tốc độ.** Thẻ chỉ rơi theo **thái độ người chơi chọn** trong truyện (xem §5), không theo việc chơi giỏi (khớp [he-thong-tam.md](he-thong-tam.md) §4a: "Không có độ hiếm").
3. **Ngắn:** 20–60 giây, một thao tác chính (chạm, kéo, giữ).
4. **Luôn có lối bỏ qua** ("để người khác làm", "để lúc khác"); bỏ qua vẫn đi tiếp được truyện, chỉ khác lời kể.
5. **Gắn vào hành động có ý nghĩa trong truyện**, không phải trò chơi đứng riêng.
6. **Truy cập được:** có chế độ thao tác một chạm cho người không muốn kéo thả; không có thao tác nhanh theo phản xạ.
7. Dùng lại khung bảng chọn sẵn có (cách `mind.js` đang vẽ minigame hái rau và quét lá trên bảng kéo lên).

### Hiện có

| Mini game | Nơi trong code | Dùng ở |
|---|---|---|
| Hái rau má | `mind.js` (khu rau) | đêm 3 (HG05) |
| Quét lá | `mind.js` (khảo sát) | pool: sân tịnh thất (HG01/HG22) |
| Ngồi giữ quả cầu | `mind.js` (sit) | việc tự chọn |
| Đẩy xe ngựa | `encounters.js` | pool: HG13 |

### Đề xuất mới (7 cái; mỗi cái gắn một truyện)

| # | Tên | Gắn với | Thao tác | Điều dịu nhẹ |
|---|---|---|---|---|
| M1 | Lần theo tiếng khóc | bé Na lạc (đêm 1) | đi trong bụi tre, âm thanh to dần khi tới gần; có thể chạm gợi ý hướng | không có hết giờ |
| M2 | Xới cơm chia đều | bát cơm cho bà ngoại (đêm 2) | chạm để xới từng muỗng vào bát | không có xới nhiều hay ít sai |
| M3 | Bưng bát cơm đi vững | đưa cơm qua nghĩa địa (đêm 2) | đi chậm, giữ bát không rung (giữ ngón tay hoặc bấm đều); trào ra thì xới lại | đây là cách thể hiện "chú tâm" bằng hành động, không đo điểm |
| M4 | Siết cán gáo | HG25 hai chiếc gáo (đêm 3) | đóng chêm vào cán đúng lúc | thử lại bao nhiêu lần cũng được |
| M5 | Treo đèn ngõ | HG21 (đêm 4) | móc đèn lên đúng chỗ, căn vừa tầm | không có thua |
| M6 | Làm quen con Vàng | HG23 (đêm 4) | giơ tay chậm; cử động đột ngột làm nó lùi, lại thử | không bị cắn (đúng sửa nhập vai HG23) |
| M7 | Chia xôi vào lá | HG06 lượt 3 (đêm 6) | chia phần cho vài hộ, có hộ cần nhiều hơn | không có đáp án đúng, chỉ khác lời kể |

## 5. Thẻ tâm sở: tặng thẻ nào, khi nào, vì sao hợp Vi Diệu Pháp

> **Lưu ý duyệt:** phần này dựa trên bảng 52 tâm sở trong `public/cetasika.js` và các điều đã ghi ở [he-thong-tam.md](he-thong-tam.md) §4a–§4c (theo Vi Diệu Pháp Toát Yếu). Mọi chi tiết về tâm sở nào đi cùng tâm nào, tên thường gọi và các mặt của thẻ mới **phải được thầy Theravāda duyệt trước khi triển khai**. Đây là mô phỏng để học, không phải thước đo tâm thật.

### 5.1. Luật tặng thẻ (giữ cho đúng Abhidhamma)

| # | Luật | Lý do |
|---|---|---|
| R1 | Thẻ ghi **tâm sở nổi bật** trong lựa chọn người chơi vừa làm; không phải toàn bộ tâm | một tâm có nhiều tâm sở sinh cùng nhau; game chỉ chọn lá nổi nhất |
| R2 | **Thẻ thiện có bộ lõi**: 19 tâm sở tịnh hảo đi chung trong mọi tâm thiện. Thẻ chỉ báo lá nổi, câu chữ không được nói "chỉ có" lá ấy | [he-thong-tam.md](he-thong-tam.md) §4c |
| R3 | **Bi và Tùy hỷ** (hai vô lượng phần) chỉ ghi khi đối tượng là **chúng sinh đang khổ / đang được vui**; không ghi khi chỉ nhìn đồ vật hay cảnh | đối tượng của hai tâm sở này là chúng sinh |
| R4 | **Ba giới phần** (Chánh ngữ, Chánh nghiệp, Chánh mạng) chỉ ghi khi người chơi **thực sự dừng lại trước một cơ hội làm sai** ngay lúc đó, không phải vì "luôn là người tốt" | trong Abhidhamma, giới phần sinh riêng từng lần, đúng lúc kiêng cữ |
| R5 | **Hành xả (tatramajjhattatā) khác Thọ xả (upekkhā vedanā).** Thẻ Hành xả phải ghi rõ "lòng thăng bằng", không phải "cảm thấy dửng dưng" | hai pháp khác nhau, dễ nhầm |
| R6 | **Hỷ (pīti) khác Tùy hỷ (muditā).** Tên hiển thị dùng "Tùy hỷ" cho niềm vui với người khác (xem [HG27](human-world-early-mysteries-and-peta-quest.md)) | đã ghi ở HG27 |
| R7 | **Tinh tấn có cả trong tâm thiện lẫn bất thiện** (tài liệu hiện ghi ví dụ: hăng hái để giận). Thẻ Tinh tấn chỉ ghi khi người chơi nỗ lực **vào việc tốt**, và mặt sau nói rõ điều này | đúng với danh mục biệt cảnh |
| R8 | **Không đồng thời sân và vô sân, tham và vô tham, trong cùng một khoảnh khắc.** Nếu lựa chọn có hai hướng, rơi một thẻ theo hướng người chơi chọn | các cặp đối nghịch không sinh chung |
| R9 | **Thẻ không rơi từ hồi tưởng của NPC** hay chỉ vì xem cảnh; cũng không từ thời gian trôi hoặc việc làm khi vắng | [kich-ban-vong-ngay.md](kich-ban-vong-ngay.md) §9 |
| R10 | **Thẻ bất thiện cũng là thẻ**, chỉ để hiểu, không lên cấp (đã chốt ở he-thong-tam §4a). Không được dựng tình huống ép người chơi nhận thẻ bất thiện | khớp nguyên tắc chữa lành |
| R11 | **Gặp lại thẻ đã có thì mở mặt sau**, không tạo thẻ trùng | he-thong-tam §4a |
| R12 | Câu "lúc nãy" trên thẻ phải mô tả **đúng điều người chơi vừa làm**, theo ngôi "Người này" | luật giọng kể đã chốt |

### 5.2. Thẻ hiện có trong game (15)

Tham, Sân, Si, Hôn trầm, Hoài nghi, Phóng dật, Hối, Lận, Không tham, Không sân, Niệm, Nhất hành (`dinh`), Hỷ, Bi, Tùy hỷ.

### 5.3. Thẻ đề xuất thêm cho người dân (5 thẻ trong bảy đêm đầu, 4 thẻ dự bị)

| Thẻ mới | Tâm sở (Pāli) | Nhóm | Khoảnh khắc nhận | Lý do khớp Abhidhamma | Cần thầy duyệt |
|---|---|---|---|---|---|
| **Tinh tấn** | Cần / Viriya | biệt cảnh | làm lại việc tốt dù lần đầu chưa được (sửa gáo, đóng chêm lại) | đúng R7 | cách diễn đạt "chánh tinh tấn" so với tinh tấn nói chung |
| **Hành xả** | Trung bình / Tatramajjhattatā | tịnh hảo biến hành | gáo sửa xong vẫn chưa hoàn hảo, người chơi chọn "vậy cũng được" thay vì làm mãi | đúng R5 | câu mô tả phân biệt với thọ xả |
| **Chánh nghiệp** | Chánh nghiệp / Sammā-kammanta | giới phần | nhặt được giỏ trái cây hay gói đồ không ai coi, có thể lấy nhưng chọn trả lại (HG07) | đúng R4 | điều kiện "đúng lúc có cơ hội" |
| **Chánh ngữ** | Chánh ngữ / Sammā-vācā | giới phần | ông Tư nói gắt (HG06 lượt 2), người chơi đáp lời nhẹ thay vì cãi lại | đúng R4 | tránh đồng nhất với "lịch sự" |
| **Tật** (ganh tị) | Tật / Issā | sân phần | nghe bà cụ khen nhà khác hơn mình, thấy khó chịu trong lòng (storylet pool) | khớp bảng "họ hàng của Sân" ở he-thong-tam §4c | chỉ là thẻ bất thiện để hiểu, không ép; giữ ở pool, không đặt cố định trong bảy đêm |
| *dự bị* **Tàm** | Hiri | tịnh hảo | định giữ lại đồ rồi thấy "việc này không hợp với mình" | tâm thiện, đối lập vô tàm | khác Quý thế nào |
| *dự bị* **Quý** | Ottappa | tịnh hảo | định làm rồi e ngại hậu quả | như trên | tránh nhập nhằng với thương người mất |
| *dự bị* **Tín** | Saddhā | tịnh hảo | dâng hoa sen, tin vào điều chưa thấy | khác "tin mù quáng" | nhấn "niềm tin trong sáng" |
| *dự bị* **Ngã mạn** | Māna | tham phần | khoe công sau khi giúp người | thuộc nhóm tham, cẩn thận nội dung | chỉ pool |

Thẻ **không** dự kiến cho người dân ở giai đoạn này: các thẻ liên quan thiền định (Tầm, Tứ, các khinh an, tịnh...), Trí tuệ, Dục, Thắng giải. Chưa có tình huống tự nhiên cho chúng ở vai dân, và [he-thong-tam.md](he-thong-tam.md) §4a đã ghi tâm thiền, tâm siêu thế không rơi từ nhiệm vụ.

Tổng cộng 15 + 5 = **20 thẻ** sau bảy đêm. Mỗi thẻ mới cần hình trong `cetasika-art.js`, các mặt sau theo Chú giải/Thanh Tịnh Đạo (xem [he-thong-tam.md](he-thong-tam.md) mục "Mặt sau"), và cập nhật bảng thẻ trong test catalog.

## 6. Kịch bản từng đêm (PC người dân)

Quy ước: **Chính** là việc chính của đêm; **Phụ** là tình huống sinh hoạt (tối đa 2); **Tự chọn** là việc người chơi chọn làm hay không; **Thẻ** là thẻ có thể rơi; **Thế giới đổi** là hệ quả nhìn thấy. Tất cả lời thoại dưới đây là **gợi ý**, chủ project sẽ viết lại. Giọng dân: "bạn" ở cảnh mở đầu, "Người này" ở mô tả tâm và thẻ.

### Đêm 1 — Lá gạo sáng (huyền bí 1: Thọ thần)

*Nền:* chuyện lạ cây gạo và bé Na lạc là chuỗi đã có trong `encounters.js` (Thọ thần nhờ đưa đứa bé lạc về nhà). Giữ nguyên mạch, thêm mini game và đóm khám phá.

| Nhịp | Nội dung |
|---|---|
| Mở đầu | cảnh `pa` (tới làng; hàng xóm chỉ giếng, nhắc "ngõ này tối sớm") — **viết lại** |
| Giếng | gặp bà cụ; nghe lời đồn "lá cây gạo có khi sáng lên lúc chạng vạng". Bà đang xoay mãi cán gáo lỏng (mầm HG25, chưa nhận việc) |
| Dạo | đóm vàng nồi cũ; ao sen buổi chiều (HG12, đóm xanh) |
| **Chính** | chạng vạng, **lá gạo sáng** → Thọ thần xin đưa đứa bé đang lạc về. Chạm vào để bắt đầu |
| Mini game | **M1** lần theo tiếng khóc trong bụi tre; gặp bé Na; chọn dỗ dành / quát (lối bất thiện vẫn có, hiếm người chọn) |
| Hệ quả | đưa bé về ngõ làng, mẹ bé (chị Ba) ôm con; trở lại gốc gạo, lá sáng |
| Phụ | HG26 nghe chuông chiều ở tịnh thất (không nhiệm vụ, không thẻ) |
| Kết đêm | bà cụ nói nhỏ: "Mộ thấp bên nghĩa địa dạo này có tiếng khẽ, như ai kêu đói." → mầm đêm 2 |
| **Thẻ** | **Bi** (dỗ dành), **Tùy hỷ** (thấy hai mẹ con đoàn tụ); hoặc **Sân** nếu quát |
| Khám phá | gốc gạo (lá sáng), **Thọ thần** vào Sổ loài và cõi giới, ngõ làng, bụi tre, giếng, ao |
| Thế giới đổi | lá cây gạo sáng lúc chạng vạng những đêm sau; bé Na nhận ra người chơi (HG09 về sau) |

### Đêm 2 — Bà ngoại bên mộ thấp (huyền bí 2: ngạ quỷ, HG27)

*Nền:* HG27 là "signature quest đầu game", nâng cấp chuỗi `Q("peta")` đã có. Đêm 2 chạy trọn chặng 0–7 trong một đêm.

| Nhịp | Nội dung |
|---|---|
| Mở đầu | trời chạng vạng; ở giếng bà cụ nhắc lại "tiếng đói" |
| Chặng 1–2 | tới mộ thấp, **bóng gầy** dưới gốc mộ: "Có ai còn nhớ đến bà không?" → chọn Đến gần / Đứng nghe / Đi tiếp |
| **Chính** | bà kể mình đói đã lâu; người chơi chọn giúp. Hỏi bà cụ giếng, bà cụ cho một bát cơm nóng |
| Mini game | **M2** xới cơm chia đều; **M3** bưng bát đi vững qua nghĩa địa |
| Chặng 4 | trao vật cúng cho **vị sư già** ngồi giữa mộ; người chơi chọn "Cùng hồi hướng" (ba nhịp thở, không bấm hàng chục lần) |
| Chặng 5 | **cinematic** bà sáng dần, mỉm cười, tan vào ánh trăng (giữ hiệu ứng cũ) |
| Phụ | không thêm gì; đêm đủ đầy |
| Tự chọn | đứng lặng bên mộ thêm một lúc |
| **Thẻ** | **Bi** (nghe chuyện và chọn giúp; gặp lại thẻ từ đêm 1 nên mở mặt "đặc tính"), **Không tham** (thực sự bố thí để hồi hướng), **Tùy hỷ** (vui vì bà được an; gặp lại, mở mặt thứ hai) |
| Khám phá | **Ngạ quỷ (peta)** vào Sổ loài, nhãn "trong mô phỏng" (phần nguồn Khp 7 / Pv 1.5 cần thầy duyệt); mục Sổ "Một lần giúp được người đang khổ" |
| Thế giới đổi | mộ thấp yên, chỉ còn gió và chiếc lá; **không spawn lại** bà |
| Lưu ý | không đổi đây thành thưởng: không hộp phần thưởng che cảnh kết; ba mốc thẻ ghi đúng lúc, tổng kết nhẹ sau khoảng lặng |

*Quyết định liên quan:* thẻ **Lận** (`bon_xen`) hiện được cấp ngay khi nghe chuyện bà ngoại một đời tiếc của. HG27 chỉ định ba thẻ (Bi, Không tham, Tùy hỷ). Đề xuất: **dời Lận** sang lớp truyện sâu hơn về bà (mở khi người chơi hỏi về đời trước của bà), để đêm 2 gọn và đúng tài liệu.

### Đêm 3 — Nắm rau má và chiếc gáo

| Nhịp | Nội dung |
|---|---|
| Mở đầu | sáng sớm ở giếng; bà cụ đau chân, chiếc thúng trống |
| **Chính** | **HG05** bà nhờ hái nắm rau má cho canh. Nhận lời → ra gốc mít |
| Mini game | hái rau má (**đã có**); mang về giếng |
| Rẽ | giữ lại cho mình / đưa đúng cho bà. **Không** cho đem sang ông Tư thay lời hứa (sửa nợ code ở `mind.js`) |
| Phụ | **HG25** hai chiếc gáo: bà xoay cán lỏng; chơi **M4**. Chọn làm lại cho kỹ hoặc "thôi, vậy cũng được" |
| Tự chọn | HG13 ông lái buôn, xe sa lầy (đẩy xe, mini game có sẵn) |
| **Thẻ** | giữ rau → **Tham**; đưa bà đúng → **Không tham** (gặp lại, mở mặt 2); làm lại gáo → **Tinh tấn**; chấp nhận gáo hơi lệch → **Hành xả** |
| Thế giới đổi | nồi canh bà nấu; gáo mới; lần sau bà kéo nước dễ hơn |
| Khám phá | đóm vàng khăn cũ; HG11 trăng trên bia đá (đóm xanh, buổi tối) |

### Đêm 4 — Ngõ có đèn

| Nhịp | Nội dung |
|---|---|
| Mở đầu | chiều muộn, ngõ hơi tối; ông Tư xem chiếc đèn cũ, con Vàng ngủ trên thềm |
| **Chính** | **HG21** ngọn đèn: phụ ông Tư treo đèn — **M5** |
| Phụ | **HG23** con Vàng sủa người lạ; ông Tư gọi nó vào hiên. **Không** có cảnh chó cắn tự động (sửa nhập vai). Chơi **M6** làm quen |
| Tự chọn | dạo ra bụi tre ngắm đèn từ xa |
| **Thẻ** | giữ bình tĩnh khi chó sủa → **Không sân** (gặp lại); nếu hoảng và quát → không thẻ, chỉ có lời ông Tư |
| Thế giới đổi | ngõ làng sáng; lần sau con Vàng hiền hơn |
| Khám phá | đóm vàng đèn cũ |

### Đêm 5 — Ba bát xôi (1)

| Nhịp | Nội dung |
|---|---|
| **Chính** | **HG06 lượt 1–2.** Lượt 1: bà cụ nhắc người bán xôi năm trước (giếng). Lượt 2: ông Tư bên hiên, ông nhìn nồi xôi và lặng một lát; ông nói gắt vì lo |
| Phụ | **HG07** chiếc giỏ bên đường: giỏ trái cây không ai coi |
| Tự chọn | **HG24** gốc gạo, lượt 1 (một trong ba buổi) |
| **Thẻ** | đáp lời nhẹ khi ông gắt → **Chánh ngữ**; trả giỏ cho chủ thay vì lấy → **Chánh nghiệp**; bỏ qua cả hai thì không thẻ |
| Khám phá | HG14 đốm đèn nơi xa (đóm xanh) |

### Đêm 6 — Ba bát xôi (2)

| Nhịp | Nội dung |
|---|---|
| **Chính** | **HG06 lượt 3**: một việc nhỏ. Người chơi tự chọn phụ gói xôi chia cho người khó khăn; nếu không tham gia, ông Tư vẫn tự làm |
| Mini game | **M7** chia xôi vào lá |
| Phụ | **HG09** bé Na vẽ tranh; chị Ba kể về bức tranh. Hoặc **Tật**: bà cụ khen nhà bên có nồi xôi ngon hơn (pool) |
| Tự chọn | HG24 lượt 2 |
| **Thẻ** | chia sẻ thật lòng → **Không tham**; vui khi thấy người nhận vui → **Tùy hỷ**; thấy khó chịu khi bà khen người khác → **Tật** |
| Thế giới đổi | những phần xôi được chia; tranh bé Na treo ở nhà chị Ba |

### Đêm 7 — Điều chưa nói

| Nhịp | Nội dung |
|---|---|
| **Chính** | **HG06 lượt 4**: ông Tư kể một câu ngắn về chuyện được ăn chịu hồi nhỏ. Người chơi nghe, hỏi thêm, hoặc ra ngõ ngắm đèn |
| Phụ | **HG03** trang kinh: người chơi gặp khó khăn thật (đã thử ngồi mà mệt) rồi **chủ động hỏi sư già** về triền cái; có thể giao "học một đoạn" khi vắng |
| Tự chọn | HG24 lượt 3; HG20 một buổi sáng bình thường |
| **Thẻ** | không ép thẻ; HG03 chỉ cấp **kiến thức đã nghe** ở khu Đã học của Sổ, không phải thẻ tâm sở (luật đã chốt [he-thong-tam.md](he-thong-tam.md) §4a) |
| Thế giới đổi | ngõ sáng đèn, nồi xôi chia, ông Tư nhớ người chơi; mở dòng thời gian "Bảy đêm ở làng" |
| Dấu mốc | một dòng tổng kết nhẹ trong Sổ; **không** huy hiệu hay điểm |

### Đêm thường (đêm 8 trở đi)

Mỗi đêm bốc 1–2 mẫu từ kho, có `cooldown`, `once`, điều kiện vai, nơi, giờ:

- Sinh hoạt: HG07 (giỏ), HG13 (lái buôn), HG19 (người khách), HG20, HG11/12/14, HG15/16 (mưa nhẹ, sau mưa, thỉnh thoảng), HG17 (kinh hành).
- Chuyện đã có trong code, mở theo điều kiện thẻ như hiện tại: hoa sen dâng Phật, hang, tháp cổ, địa thần, chư thiên.
- Mẫu thẻ mới (pool): Tật, Tàm, Quý, Tín, Ngã mạn (sau khi thầy duyệt).

## 7. Đánh giá độ hấp dẫn sau khi triển khai

**Đủ để thử nghiệm:** khoảng 7 đêm chính (70–100 phút) cho người dân, một câu chuyện cảm xúc chính (HG27), một tuyến nhân vật dài (ông Tư), hai chuyện huyền bí ở hai đêm đầu, 20 thẻ, và các đóm khám phá.

| Điểm mạnh | Rủi ro | Cách xử lý |
|---|---|---|
| HG27 và Thọ thần ở hai đêm đầu cho cảm giác "còn nhiều điều chưa biết" | nhiều tình huống chỉ là đọc rồi chọn hai nút | mỗi tình huống chính có một mini game M1–M7 |
| NPC nhớ việc người chơi làm ("lần sau") | kho chỉ còn khoảng 12 mẫu sau bảy đêm, dễ lặp | viết đợt 2 (HG02, HG08, HG10, HG19…) theo số liệu thử |
| Thế giới đổi nhìn thấy được (canh, gáo, đèn, mộ yên) | thẻ ít | thêm 5 thẻ mới, Sổ, đóm khám phá, thay đổi thế giới |
| Không có áp lực, hợp tinh thần chữa lành | thiếu mục tiêu dài | cung ông Tư, bộ sưu tập khám phá, mở mặt sau của thẻ |

**Điều cần đo khi người thật chơi** (kiểu "thử 5 người, 3–5 đêm", theo [kich-ban-vong-ngay.md](kich-ban-vong-ngay.md) §10 Đợt D):
- thời lượng thật của mỗi đêm;
- bao nhiêu người bấm "Kết thúc đêm" sớm khi chưa làm việc chính;
- đêm nào họ dừng chơi;
- mini game nào bị bỏ qua nhiều nhất;
- thẻ nào hay rơi, thẻ nào không ai thấy;
- có ai nhận ra mình đang "thu thập" hay chỉ thấy trải nghiệm.

## 8. Dữ liệu đề xuất (chưa code)

Mỗi tình huống là dữ liệu, theo khuôn trong [Playable Scenarios](human-world-playable-scenarios.md) §6 (`id`, `role`, `place`, `timeBand`, `prerequisite`, `state`, `cooldownDays`, `once`, `choices`, `result`, `loreBasis`, `sourceRefs`, `reviewed`). Thêm:

```js
// Pseudocode, chưa phải API.
const nightPlan = {
  role: "villager", nights: [
    { n: 1, main: "HG_THO_THAN", side: ["HG26"], free: [], seeds: ["HG27"] },
    { n: 2, main: "HG27",       side: [],       free: [] },
    // ...
  ],
  afterSeven: { pool: ["HG07","HG13","HG19", /* ... */], perNight: [1, 2] },
};
```

- Tiến độ đêm lưu **theo nhân vật** (`characterId`), đăng nhập lại giữa đêm thì tiếp tục đúng chỗ.
- Mỗi lần hoàn thành tình huống ghi một sự kiện vào nhật ký Sổ Hành Trình với **id cố định** (không nhân đôi), theo hợp đồng ở [journey-memory-and-return-ux.md](journey-memory-and-return-ux.md) §6.1.
- Thẻ và mini game tách bạch: kết quả mini game không đi vào điều kiện rơi thẻ.

## 9. Lộ trình PR và tiêu chí nghiệm thu

| PR | Nội dung |
|---|---|
| 0 | **PR tài liệu này** (chờ duyệt) |
| 1 | Khung đêm: bỏ tự đóng đêm, "Việc trong đêm", nút "Kết thúc đêm", bỏ "Chọn một vai khác" |
| 2 | Bộ chọn tình huống theo dữ liệu (`cooldown`, `once`, điều kiện), lưu tiến độ, ghi Sổ |
| 3 | Đêm 1 (Thọ thần, M1) và đêm 2 (HG27, M2, M3) |
| 4 | Đêm 3 (HG05 sửa lỗi, HG25, M4) và thẻ Tinh tấn, Hành xả |
| 5 | Đêm 4 (HG21, HG23, M5, M6) |
| 6 | Đêm 5–7 (HG06, HG07, HG09, HG24, HG03, M7) và thẻ Chánh ngữ, Chánh nghiệp, Tật |
| 7 | Lớp đóm sáng mới và Sổ khám phá có đếm |
| 8 | Đêm thường (kho quay vòng, thời tiết nhẹ) |

**Tiêu chí nghiệm thu giai đoạn người dân:**
- [ ] Đêm 1 và đêm 2 mỗi đêm có một chuyện huyền bí chơi được trọn vẹn.
- [ ] Quán xét chỉ mở khi bấm Kết thúc đêm; không còn nút chọn vai khác.
- [ ] Mỗi mini game đều bỏ qua được, không có thất bại, không phụ thuộc điểm.
- [ ] Không thẻ nào rơi chỉ vì thời gian, vì xem cảnh, hay vì thắng mini game.
- [ ] Thẻ mới có nguồn và đã qua thầy duyệt trước khi bật.
- [ ] Nhắc bà cụ nhờ hái rau thì không thể đưa nguyên nắm sang ông Tư mà vẫn tính hoàn thành lời hứa.
- [ ] Con Vàng không cắn tự động.
- [ ] PC người dân không có ký ức hay món nợ của ông Tư.
- [ ] Nhân vật cũ (legacy) và các save cũ không bị đổi.
- [ ] Reload không nhân đôi phần thưởng; ghi Sổ đúng một lần.

## 10. Câu hỏi mở

1. Đồng hồ trời có đi trọn một đêm không (ảnh hưởng HG24)?
2. Lận (`bon_xen`) có dời khỏi đêm 2 như đề xuất không?
3. Thẻ Tật có nên để trong pool từ đầu hay chờ sau khi thử nghiệm?
4. Tàm / Quý / Tín / Ngã mạn: duyệt tên và mặt thẻ trước hay sau bảy đêm đầu?
5. Cảnh mở đầu `pa` / `pb`: chủ project sẽ viết lại; trong lúc chờ có dùng bản tạm hiện có không?
6. Thầy duyệt phần nào trước: hồi hướng ở HG27, nguồn Khp 7 / Pv 1.5, hay bảng thẻ mới?

## 11. Việc cần giáo thọ duyệt (gom lại)

- Thành phần tâm và danh sách tâm sở đi cùng ở các thẻ mới.
- Mặt sau (đặc tính, phận sự, biểu hiện, nhân gần) của năm thẻ mới.
- Phân biệt Hành xả với Thọ xả; Hỷ với Tùy hỷ; Tàm với Quý.
- Câu chữ về hồi hướng và ngạ quỷ ở HG27; ranh giới "đã được an" với "giải thoát tối hậu".
- Việc giới phần chỉ sinh khi có cơ hội và kiêng cữ (R4).
