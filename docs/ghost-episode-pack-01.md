# Ghost Episode Pack 01 — Ba câu chuyện có thể chơi (G01, G03, G04)

> **Narrative script v0.2 — chỉ viết truyện, CHƯA code/map/asset.** Nguồn chuẩn: [Ghost Campaign Bible](ghost-playable-campaign-bible.md), [Player-Centric Narrative Model](player-character-narrative-model.md), [Role Transition & Spoiler Isolation](role-transition-and-spoiler-isolation.md). PC ma là **nhân vật người chơi tự đặt tên**, không phải bà Sáu. Lời thoại sáng tác, không phải giáo lý Phật giáo.
>
> **Cảnh phải dùng được trên mobile:** 1–2 dòng lời dẫn; thường 1–3 lượt thoại, các chọn lựa hiển thị khi PC bấm quan sát. Tín hiệu ở nền không bật sheet tự động. Người chơi có thể rời, quay lại hay không làm gì; nhân vật/NPC vẫn sống.

## 0. Một đêm tự do — không phải tutorial ép người chơi

**Nhịp gợi ý đầu tiên (không phải thứ tự bắt buộc):**
- 0–3 phút: thấy nghĩa địa đêm trăng và Ông Tư/con Vàng ở ngõ. Một chiếc lá tự khẽ bay khi PC đi qua. Không có popup giải thích mình đã chết thế nào.
- 3–8 phút: có thể thử **hù vui** (G01), **nghe tiếng chuông bên tịnh thất** hoặc dạo gốc gạo. Biết mình không thể nhặt một chiếc lá/đồ thật nhưng có thể tác động *tín hiệu*.
- 5–15 phút: thấy người đang tìm chiếc túi khâu vá của bà cụ giếng (G03) và lối mở vào một ngôi nhà bỏ trống (G01); không cần nhận bất cứ thẻ nào.
- 10–25 phút: nếu tò mò, theo âm nước vào **Bến Không Tiếng — Bờ Chìm** (G04), hoặc về nghĩa địa nghe sư tụng kinh. Nước/bến không phải màn chơi bắt buộc.

**Mục tiêu cảm xúc:** “Mình không làm được những việc người sống làm, nhưng mình có thể nhìn thấy điều họ bỏ sót.” Tên và tiểu sử của PC không bị tự sáng tác; người chơi tự tạo ký ức bằng hành động.

## 1. G01 — Ai gõ cửa nhà hoang?

| Thông tin | Kịch bản |
|---|---|
| **Location** | `village`, `bamboo`, marker **Nhà bỏ trống** dự kiến ở mép làng. Nhà bỏ trống **CHƯA** là `World.PLACES` có thể đi trong code hiện tại |
| **Thời điểm** | chiều muộn đến đêm trăng, rộng giờ; nếu PC ghé sáng vẫn được ngắm nhà và thấy một dấu nước nhạt |
| **NPC** | Ông Tư, con Vàng (NPC độc lập; không phải PC dân) |
| **Fantasy** | tạo tiếng động nhẹ; quan sát phản ứng; đi qua một khe cửa bị khóa với người sống |
| **Không yêu cầu** | thẻ tâm, học kinh, hoàn thành HG27, điểm thiện, nhấp vào thọ thần |

### G01-S01 — Tiếng cộc bên hàng rào (ambient)

**Hình/âm:** lá tre rung như có ai chạm, con Vàng ngẩng đầu, Ông Tư đang loay hoay đặt đèn ở ngõ. Người chơi tự chọn `Thử làm lá rung`; chưa chọn thì chỉ là cảnh đẹp.

**Khi chủ động bấm:**

> Một chiếc lá tre quay một vòng, rồi rơi xuống cạnh chân con Vàng.
>
> **Ông Tư:** “Ơ? Gió đâu mà có đúng một cái lá rớt nhỉ?”
>
> Con Vàng sủa một tiếng, rồi lại nằm.

**Lựa chọn:**
1. **`Hù thêm một chút`** → tiếng “cộc!” ở hàng rào, Ông Tư giật mình cầm đèn soi, cau mày: “Nửa đêm còn bày trò!”; `G01.mischief=true`. Phần thưởng vui tức thì là phản ứng/ảnh động, **không rơi thẻ bất thiện từ thao tác bấm**.
2. **`Thì thầm: ‘Đèn chưa tắt kìa’`** → Ông Tư quay lại nhận ra chiếc đèn đang để sát khăn phơi, chuyển đèn về nơi an toàn; `G01.helpedWithLamp=true`. Hành động ma chỉ gợi ý, chính NPC dời đèn.
3. **`Để họ yên`** → con Vàng lại ngủ; `G01.seen=true`, vẫn có lối đi.

**Lần quay lại:** Ông Tư kể với một người rằng “Hôm nọ có tiếng gõ lạ”. Nếu đã giúp, ông tự nhắc đến đèn: “May hôm ấy nhớ xem đèn.” Không biến thành NPC biết chắc ma nào đã làm.

### G01-S02 — Một ngôi nhà chẳng ai mở cửa (discovery)

**Ambient:** cửa nhà bỏ trống cài then, vệt nước đọng dưới bậc; một tấm rèm cũ động nhẹ dù trời đẹp. Người sống chỉ thấy một ngôi nhà cũ, PC ma thấy bóng mờ của khung cửa thứ hai.

**PC bấm `Nhìn qua khe cửa`:**

> Cánh cửa không mở. Nhưng bóng của nó lại có một khe đủ rộng.
>
> Bên trong không có tiếng người, chỉ có giọt nước rơi đều trên nền.

- **`Bước theo bóng cửa`** → PC tới sân sau/hiên trong, `discover:empty_house_shadow_entry`. Đây là năng lực ghost-only **trong vị trí được thiết kế**, không phải tự do xuyên mọi bức tường.
- **`Đứng nghe một lát`** → nghe tiếng nước chảy ở nơi không có mương; ghi `G04.hintWater=true`.
- **`Đi chỗ khác`** → không mất lối mở; lần sau có thể quay lại.

**Payoff tức thì:** phòng nhỏ cũ, vệt sáng xuyên rèm, thềm gỗ và một chiếc túi **kẹt dưới gờ bậc** mà PC ma có thể nhìn thấy rõ, nhưng chạm xuyên qua. Tránh tả túi như vật ma có thể nhặt được.

**Bí mật không tiết lộ:** dưới chân tường có **một vết nước chạy ngược lên trên**; PC ma có thể ghi “Nước ở đây lạ thật” mà chưa biết Bến Không Tiếng. Không kể toàn bộ xuất xứ ngôi nhà trong cảnh đầu.

### G01-S03 — Mình chỉ tác động được một chút (practice without tutorial popups)

**Khi PC thử `Nhặt chiếc túi`:**

> Những ngón tay lướt qua vải. Chiếc túi vẫn nằm yên.
>
> Ở ngoài ngõ, có tiếng bà cụ gọi: “Cái túi kim chỉ của bà đâu rồi?”

Chỉ hiện **ba lựa chọn ngắn** `Thử gọi bà` / `Để ý chỗ túi` / `Đi tiếp`.
- `Thử gọi bà` → bà không nghe rõ; dấu `ghostWhisperAvailable=true` xuất hiện trong thanh tương tác tối giản.
- `Để ý chỗ túi` → mốc ghi vào Sổ **vị trí của túi**, mở G03 khi PC muốn.
- `Đi tiếp` → G03 vẫn có sẵn nếu sau đó PC thấy bà tìm đồ.

**Lỗi cần tránh:** PC ma không đem túi sang giếng. Không ép nhận nhiệm vụ chỉ vì biết túi ở đâu. Đừng giả định PC ma từng sống ở ngôi nhà này.

## 2. G03 — Chiếc túi kim chỉ của bà cụ

**Chủ:** `npc.granny` — bà cụ còn sống ở giếng, **không phải bà ngoại ngạ quỷ HG27, cũng không phải bà Sáu**. **Mục đích:** một quest trọn vẹn và ấm áp về giúp người *không cần cầm đồ*. Bà vừa đi qua thềm nhà bỏ trống để trú nắng một lát, đặt túi xuống khi sửa quai thúng, rồi quên ở đó. Đủ lý do đời thường; **không phải bí vật liên quan đến trận lũ**.

| Lượt | Người chơi có thể gặp | Tín hiệu dễ hiểu |
|---|---|---|
| Đầu | chiếc túi ở bậc sân sau nhà bỏ trống | kim chỉ lộ khỏi miệng túi, đồ rơi không thể nhặt |
| Cùng hôm | bà cụ tìm túi bên giếng/đường làng | lời bà: “Cái túi kim chỉ đâu rồi nhỉ?” |
| Đêm | bà cụ trong nhà nghỉ, ghé mái hiên cũ của bà theo scene đơn giản | dấu `Có thể gợi một giấc mơ` chỉ khi đã biết túi của bà |
| Sáng sau / lần vào tiếp | bà kiểm tra bậc thềm và lấy được túi | chiếc túi biến khỏi nhà hoang, xuất hiện cạnh giỏ khâu vá của bà |

### G03-S01 — Hỏi mà không được nghe

**Điều kiện:** PC đã chủ động **nhìn thấy chiếc túi** và đã thấy bà đang tìm thứ đó. Không cần G01 hoàn thành.

> **Bà cụ (tự nói):** “Rõ ràng bà có mang theo mà.”
>
> **PC:** (có thể chọn) `Thì thầm: ‘Ở bậc thềm…’`.

**Lựa chọn:**
- **`Thì thầm khẽ`** → bà dừng bước: “Hình như có tiếng ai nhắc cái thềm…” → `G03.hintHeard=true`. Khi bà còn ở gần, có thể tự trở lại kiểm tra, kết thúc G03 trong một lượt chơi.
- **`Gõ tiếng rất nhỏ trên lá`** → bà quay đầu và đi thêm vài bước về phía bậc; không thao túng tay chân, người sống **tự quyết định** có tìm hay không.
- **`Làm bà giật mình`** → bà hơi hoảng, đi nhanh về giếng; trạng thái `G03.startled=true`. Không trừ đạo đức như phán xét, nhưng có một lựa chọn sửa: sau đó PC có thể dùng giấc mơ dịu để bà bớt lo.
- **`Rời đi`** → không phạt; sau vài ngày bà hoặc người khác tự tìm được túi, để NPC không chờ vô hạn.

### G03-S02 — Một giấc mơ rất nhỏ (đường thay thế)

**Chỉ mở** khi PC đã biết **đồ thuộc về bà** và đã có `dreamAnchor=granny_remembers_old_step` từ lời bà “hồi chiều bà ngồi ở bậc nhà cũ”. Không cho PC đọc/điều khiển suy nghĩ bất kỳ NPC nào.

**Hình mơ:** không gian ấm như giấy màu nước; bà đang vá một mép áo, kim lăn về phía bậc cửa; **một chiếc lá tre xanh nằm cạnh túi**.

**PC chọn hình ảnh:**
1. **`Cho bà thấy bậc thềm với chiếc túi`** → bà khẽ “À…” trong mơ; sáng sau có cảnh bà đi tìm.
2. **`Để chiếc lá chỉ đường`** → bóng lá dịch từ giếng về nhà hoang, cũng gợi bậc thềm; kết quả như (1), hình khác.
3. **`Không làm phiền giấc ngủ`** → không fail/không mất giấc mơ; PC có thể dùng thì thầm hôm sau.

**Giới hạn:** báo mộng là **một scene có anchor**, không phải tính năng chat xuyên giấc ngủ. Không cần đợi 24 giờ thật; nếu người chơi quay lại sau vài phút/sau ngày in-game, `dayTransition` dẫn sang sáng mới tự nhiên.

### G03-S03 — Có người tìm thấy

**Cảnh khi bà nhận ra:**

> Bà cụ cúi xuống cạnh bậc thềm, kéo chiếc túi ra.
>
> “Ôi, ở đây này. Bảo sao tìm mãi không ra.”
>
> Bà phủi bụi, nhét chiếc kim trở lại túi rồi cười một mình.

**Người chơi từ xa chọn:**
- **`Thấy vui cho bà`** → mở mốc `G03.sharedJoy=true`, có thể xét thẻ **Tùy hỷ** nếu chưa sở hữu và nếu luật thẻ duyệt; không tự xem người chơi thật có tâm Tùy hỷ.
- **`Đi theo xem bà làm gì`** → thấy bà vá lại quai thúng dưới hiên; `discovery:repaired_basket`.
- **`Đi chơi tiếp`** → quest `G03` hoàn tất với dấu **giúp người âm thầm**, không đòi xem cảnh thưởng.

**Kết quả lưu:** bà cụ **tự nhặt** túi, túi biến khỏi sàn nhà hoang; góc khâu vá có túi. Nếu PC từng làm bà hoảng, lời bà khi tìm được túi có thể là “Hồi tối bà còn nghe tiếng lạ. May sáng nay lại nhớ chỗ này.” Vật phẩm không xuất hiện trong inventory ma, reward không nhân khi reload.

**Giá trị truyện:** bà không biết ai giúp; PC vẫn cảm thấy có ích. **G03 độc lập với bí mật Hạnh/bà Sáu.** Sau này chiếc túi của bà cụ có thể tái xuất như một vật trang trí quen thuộc, không cần trở thành “chìa khóa giải mọi twist”.

## 3. G04 — Bến Không Tiếng, bờ mà người sống ít thấy

### G04-S01 — Vết nước đi ngược

**Nơi:** phòng nhỏ nhà bỏ trống, hoặc ngay mép bụi tre nếu PC chưa vào nhà; cả hai đều cho dấu vào tuyến, nhưng cảnh trong nhà đẹp/đậm hơn.

> Dưới nền nhà có vệt nước cũ. Nó không chảy xuống ngõ.
>
> Nó chạy về phía bức tường không có cửa.

- **`Theo vệt nước`** → cảnh PC đi qua phần bóng tường tới **Lối Nước Khuất**.
- **`Ngồi nghe âm thanh`** → vệt nước phản chiếu tiếng mái chèo, ghi một dấu Sổ; lại chọn đường khi muốn.
- **`Để sau`** → không khóa, lần sau vẫn có vệt nước.

**Không cần:** đèn địa thần, cửa sâu của sư/dân, thẻ Niệm/Định, thành tựu G03. **Không phải mọi bóng tường đều có thể xuyên**; có dấu nước và ranh giới đã định.

### G04-S02 — Chọn tiếng nước (puzzle nhẹ, không thất bại nặng)

Trước mặt có ba dấu âm thanh: `tiếng gõ mái hiên`, `tiếng sỏi rơi`, `tiếng mái chèo trên nước`.

- PC chọn **`Theo tiếng mái chèo`** → vào Bờ Chìm, mở `discovery:shadow_pier_arrived`.
- Chọn âm khác → một góc cảnh đẹp của sân sau/bờ cỏ, nghe lại tiếng nước rõ hơn; **không mất vật phẩm/không quay đầu hoàn toàn**. Gợi ý sau một lần thử sai.
- Nếu PC đã nói chuyện với một vong đứng ở lối nước, có thể chọn **`Nhờ chỉ hướng`**, cũng vào bến.

**Bản thiết kế này thử người chơi quan sát âm thanh**, không kiểm tra sự thanh tịnh.

### G04-S03 — Ba nơi đáng dừng lại

| Marker (Ghost Bờ Chìm) | Cảm giác | Interaction chủ động | Kết quả |
|---|---|---|---|
| **Giếng cạn** | nước phản chiếu một bầu trời khác, có đom đóm xanh bạc | `Ngó xuống giếng` | `discovery:dry_well_reverse_sky` |
| **Xóm không khói** | ba mái nhà không có bếp lửa, ánh đèn xa | `Nghe một tiếng gọi` | dấu lore `shadow_hamlet_call`; không tự spawn NPC mỗi lần |
| **Ba cột đá cũ** | cây cột chạm mặt nước; dưới trăng thấy mặt sau có đường khắc | `Nhìn mặt sau cột` | `discovery:three_pillars_ghostside`, landmark giao với tuyến người sống |

**Không bắt gặp ma mới liên tục**. Phần lớn Bờ Chìm là khám phá đẹp và lạ. Người giữ bến chỉ xuất hiện trong một cửa sổ storylet có dấu báo trước, không đứng chờ 24/7.

### G04-S04 — Người nhớ tiếng mái chèo

**NPC mới (chưa chốt tên):** một người giữ đò già ở bờ âm. Chỉ biết chuyện nơi này theo ký ức không hoàn chỉnh, không phải narrator toàn tri. **Không vội kết luận** ông là linh hồn của người từng đưa Hạnh đi, một vị thần, hay người duy nhất chứng kiến trận lũ.

**Đến đúng dấu cột đá và chọn `Nghe chuyện bến nước`:**

> **Người giữ đò:** “Bến này từng ồn lắm. Mùa nước lớn thì ai cũng gọi nhau.”
>
> **PC:** “Ông còn nhớ ai qua đây không?”
>
> **Người giữ đò:** “Có tiếng trẻ con khóc. Còn ai đã về được bờ… tôi không nhớ.”

**Lựa chọn:**
- **`Hỏi về tiếng trẻ con`** → chỉ thêm `lore:flood_child_cry`; chưa có tên, không biết số phận/quan hệ.
- **`Hỏi vì sao cột đá có hai mặt`** → ông: “Người ở bờ nào cũng chỉ nhìn được một mặt thôi.” Đây là lời thoại sáng tác gợi **hai perspective**, không giải nghĩa bí ẩn.
- **`Đứng nghe nước / Đi tiếp`** → vẫn có trải nghiệm, không ghi bước nhiệm vụ.

**Nếu người chơi quay lại sau đó:** ông có thể không đứng đó; ở cột đá còn một khúc dây cũ. Khi gặp lại theo story state, thêm một câu nhỏ, không kể reveal Hạnh chỉ vì người chơi bấm nhiều lần.

### G04-S05 — Một cảnh gợi cảm giác quen khi đổi nhân vật

**PC ma:** đứng trước cột, thấy **vết khắc ở mặt sau**, nghe tiếng mái chèo từ dưới nước. **PC sống sau này:** đi Hang Vọng Tâm qua Bờ Nổi, thấy **mặt trước cùng ba cột đá**, tiếng nước nghe như tiếng đá; nhìn được một nửa khác. Cùng ánh trăng/đá, không reuse cùng đoạn thoại/quest. Người chơi ngoài đời có thể tự nhận ra “mình từng đến đây”, nhưng Sổ của PC sống **không tự có** `ghostside` và ngược lại.

**Cấm spoiler tự động:**
- Bến không nói ngay “đứa bé Hạnh vẫn sống, làm vợ Ông Tư”.
- Không có NPC vong biết mọi kiếp, mọi mối quan hệ và giải toàn bộ quest khi hỏi.
- Không tự chia sẻ mốc lore giữa `characterId`; NPC canone liên quan vẫn giữ câu chuyện thống nhất, nhưng trải nghiệm PC khác nhau.

## 4. Các liên kết nhẹ sau Episode Pack 01

| Đã khám phá | Mở một cơ hội, không ép |
|---|---|
| G01 nhìn thấy vệt nước | G04 tới Bến Không Tiếng sớm |
| G01 thấy chiếc túi | G03 quan sát bà cụ tìm đồ |
| G03 giúp bà tìm túi | G06 PC hiểu mình vẫn có thể giúp người dù không chạm được đồ; **không** yêu cầu G03 để nghe sư |
| G04 nghe người giữ bến | G05 có thêm câu hỏi về đêm nước lớn khi gặp NPC bà Sáu |
| G04 thấy cột đá | người chơi đổi PC về sau có một cảnh “quen thuộc nhưng khác”, **không copy journal** |
| G02/G06 nghe hồi hướng | G07 có thể mở **tùy chọn** khép chuyện, còn PC ma muốn khám phá bao lâu vẫn được |

**Lộ trình tự do:** G01, G03, G04 có thể vào theo thứ tự bất kỳ; G03 cần thấy túi và người tìm, G04 cần thấy lối nước nhưng không cần thành tích G01. Kết thúc G07 không yêu cầu G04/bến. Truyện Hạnh–Bà Sáu là tuyến NPC độc lập, không ép người chơi tìm xong hết để được chọn kết thúc.

## 5. Quy tắc thiết kế state, không phải schema code

| Biến trạng thái nội dung | Tác dụng khi quay lại |
|---|---|
| `G01.seen / mischief / helpedWithLamp` | Ông Tư/con Vàng có câu ngắn/pose khác, không dựng lại đoạn đầu |
| `G01.shadowHouseEntered / waterHintSeen` | PC ma vào nhà theo lối bóng, ghi địa điểm đã tìm |
| `G03.itemSeen / ownerKnown / hintHeard / dreamAnchor / dreamSent` | câu chuyện có đường thì thầm hoặc báo mộng; không cần cả hai |
| `G03.itemReturned / sharedJoy / frightened` | túi biến khỏi nhà, xuất hiện cạnh bà cụ; không nhân reward |
| `G04.arrived / locationsSeen / ferrymanHeard` | bến phản hồi theo thăm lại, ông giữ bến có lore fragment |
| `ghostCardEvents` | ghi từ **hành động PC**, không tặng thẻ vì nghe hồi tưởng NPC; idempotent per character |
| `legacyAccountMemory` | chỉ phục vụ archive/codex meta theo kế hoạch migration, **không unlock** bí mật cho PC khác |

**G03 có nhiều kiểu hoàn tất hợp lệ:** bà tự tìm nhờ hint tức thì; bà nhận mộng sáng sau; người làng nhặt hộ nếu PC bỏ qua. Chỉ hai trường hợp đầu **có mốc PC giúp**, trường hợp cuối chỉ là scene NPC tự sống, không tự nhận thẻ.

## 6. Checklist review game designer trước khi code

- [ ] Người chơi có thể đi dạo 5–10 phút, ngắm cảnh ma, không bị bất kỳ auto popup.
- [ ] G01 đủ vui từ một hoạt ảnh lá rung và câu ông Tư, không cần hù bằng jump-scare.
- [ ] Hù vui không thành hệ thống farm thẻ bất thiện; người chơi thích chữa lành có thể không hù.
- [ ] G03 rõ **ai mất gì, vì sao làm rơi, PC biết gì và tại sao NPC cuối cùng tìm được**.
- [ ] Báo mộng có anchor, không phải ngoại năng đọc/tạo giấc mơ cho mọi người.
- [ ] Không có thao tác nhặt/trao đồ vật trong giao diện vai ma.
- [ ] G04 vào Bờ Chìm không cần đèn hoặc mini-game thiền của người sống; có hai đường giải câu đố âm thanh.
- [ ] Bến có ít nhất 3 landmark đáng ngắm trước khi bất cứ quest NPC nào xuất hiện.
- [ ] Kết nối Hạnh chỉ là manh mối, không spoil tên/vai trò hoặc chuyện người sống sót.
- [ ] Có phản hồi cảnh vật/NPC khi quay lại sau một ngày game hoặc sau thời gian offline.
- [ ] Nhà bỏ trống / Bờ Chìm **chưa phải playable zones trên `develop`**, ghi asset/graybox dependencies rõ.
- [ ] Mọi trường hợp chưa đủ có **lối đi tiếp/để sau**, không ép grind thẻ, đăng nhập đúng giờ hoặc hoàn thành G03 mới được tới bến.
