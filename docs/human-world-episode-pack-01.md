# Human World Episode Pack 01 — Sáu kịch bản có thể triển khai

> **Bản thảo biên kịch v0.2, chưa có trong gameplay.** Sử dụng 11 `World.PLACES` và ba vai **Sư Tịnh (`monk`) · Ông Tư (`villager`) · Bà Sáu (`ghost`)** trong `ROLE_INFO`. Bà cụ giếng, sư già, chị Ba, bé Na, con Vàng là NPC; **không được viết ông Tư như NPC thứ hai khi `role=villager`**. Khung thời gian là *ngày trong game*, không ép người chơi đăng nhập hằng ngày.
>
> [Review](human-world-narrative-review.md) · [Danh mục kịch bản](human-world-playable-scenarios.md) · [World Bible](human-world-story-bible.md). Trừ nơi ghi chú cần nguồn, truyện là `loreBasis: fiction`; các thao tác thẻ/điều kiện là `game_interpretation`. Phải duyệt lời Phật học/giới luật trước khi đưa vào release.

## Công thức mỗi episode

`ambient` (thấy không cần bấm) → `explicit_interact` (chỉ khi muốn) → `choice` (thay đổi phù hợp) → `immediatePayoff` (cảnh, vật, lời thoại) → `returnPayoff` (lần sau đổi gì) → `exit` (có thể rời bất cứ lúc nào).

**Chính sách:** ngày êm và trời đẹp là mặc định, mưa nhẹ là biến thể hiếm, bão không được xen vào những episode này. Một scene đã xem có thể xem lại theo ngữ cảnh nhưng không nhân quà. Chưa có danh mục kiến thức hoàn chỉnh thì reward kiến thức phải trỏ `lessonId` đã được duyệt, không cấp thẻ tâm bằng timer.

---

## HG21 — Ngọn đèn dành cho người về muộn

**Vai chính:** Ông Tư; sư Tịnh có phiên bản quan sát; bà Sáu có phiên bản cảm nhận ánh đèn từ xa. **Nơi:** ngõ làng `village` ↔ bụi tre `bamboo` ↔ cổng nghĩa địa `gate`. **Loại:** 2 lần gặp, truyện không phải bắt buộc. **Không dùng `den_nho` là vật phẩm hang**: đây là đèn đường riêng, không mở cổng thần bí.

**Ambient ngày đầu — chạng vạng:** một góc ngõ hơi tối, vệt ánh đèn từ cửa nhà. Con Vàng nằm gần bậc hiên. Người chơi vẫn đi ngang bình thường.

**Cảnh 1 (chỉ Ông Tư chủ động chạm bậc hiên):**

> "Người ta về qua bụi tre mỗi khi trời tối. Cây cao che ánh trăng, đoạn đường ngắn mà tối sâu."

- **`Treo chiếc đèn cũ cạnh lối đi`** → `laneLamp.stage=installed`; đèn vẽ sáng vùng ngõ ngay; `deedId=lane_lamp_placed`. Không rơi thẻ Không tham ngay vì thao tác treo một chiếc đèn chưa đủ kết luận tâm thật.
- **`Thử tìm chỗ không chói vào nhà ai`** → `laneLamp.stage=planning`; lần sau có dấu vị trí phù hợp; người chơi vẫn dạo tự do.
- **`Để tối khác`** → không nhận lời, không phạt; một NPC có thể treo đèn ở ngày khác như ambient, không giành nhiệm vụ.

**Cảnh 2 — lần sau (nếu đã treo):** dưới bụi tre có vệt vàng ấm. Một người qua đường đi ngang không vấp. Khi Ông Tư chủ động nhìn:

> "Có người về muộn, thấy đèn thì bước chậm lại. Người ấy không biết ai đã treo. Ông Tư cũng không đi ra nói."

- **`Ngắm một lúc`** → `discovery:lamp_on_lane`; hiệu ứng được ghi; có thể mở câu chuyện về người khách `HG19`.
- **`Kiểm tra dầu đèn`** → duy trì đèn trong một nhịp, không tích điểm vô hạn.
- **`Đi tiếp`** → không mở quest.

**Theo vai khác:** Sư Tịnh đi ngang có thể nhận ra lối sáng, ngồi nghe gió, hoặc hỏi Ông Tư (NPC trong trải nghiệm của vai sư) ai treo; bà Sáu chỉ **nhìn** ánh đèn, liên tưởng một đêm có người về muộn, không chạm vào đèn. Không giả định ba save của ba vai tự chia sẻ cùng một sự kiện, trừ khi đã có hệ trace xã hội hỗ trợ.

**Save:** `laneLamp.stage=unknown|planning|installed|seen_used`; `discovery:lamp_on_lane`; `worldEffect:lane_warm_light`; `story:late_traveler`. **Bỏ qua:** vẫn có lối an toàn sáng từ đèn nhà khác. **Chi phí art:** 1 sprite đèn + vòng sáng nhẹ + pose ngắm.

---

## HG22 — Tiếng chổi và chiếc lá trở lại

**Vai chính:** Sư Tịnh. **Vai phụ:** Ông Tư có thể giúp khi được mời; bà Sáu đứng ngoài hàng rào quan sát trong một cảnh riêng. **Nơi:** `hermitage`. **Loại:** sinh hoạt hai lượt, có thể biến thể nhiều ngày nhưng không farm.

**Ambient:** nắng sớm xuyên qua cây, vài chiếc lá rơi trên sân. Sư già đang đi chậm dưới hiên. Không giao nhiệm vụ.

**Cảnh 1:**

> "Sân vừa quét hôm qua. Sáng nay lá lại phủ một lớp mỏng, như chẳng ai từng quét."

- **`Quét một khoảng sân`** → tương tác ngắn 3–4 lượt quét có dừng; nền hiện một khoảng sạch; `courtyard.stage=partly_swept`; điểm thành quả ngay là **cảnh sạch một khoảng**, không nhất thiết thẻ.
- **`Nhìn một chiếc lá rơi`** → mở dấu cảnh `discovery:falling_leaf`; nếu từng học ý niệm thay đổi thì Sổ kiến thức có thêm gợi ý, không chứng đắc.
- **`Để lá ở đó hôm nay`** → vẫn là lựa chọn hợp lý; sư già/khí trời không phê phán.

**Cảnh 2 — ngày khác:** lá vẫn rơi, nhưng lối đi sạch hơn hoặc một phần được sư già dọn tiếp.

> "Chiếc lá hôm qua đã được mang đi. Một chiếc lá khác nằm đúng chỗ cũ."

- **`Đi kinh hành qua khoảng sân`** → có thể mở hoạt động tự chọn `HG17`, không tự cấp Niệm/Định.
- **`Hỏi thầy vì sao ngày nào cũng quét`** → sư già trả lời bình thường: "Vì sân có lá, nên mình quét. Mai có lá thì mai quét." **Đây là lời thoại sáng tác của game, không gắn là lời Phật.**
- **`Đi dạo`** → không cần kết thúc nhiệm vụ để trở lại.

**Ông Tư:** chỉ có tương tác `Xin góp tay quét sân` khi được sư già chấp thuận; nếu không có chuyện trước đó vẫn ngắm được. **Bà Sáu:** có thể nhìn thấy người sống quét sân từ ngoài, nhớ một việc trước đây mình hay làm, không thể cầm chổi.

**Save:** `courtyard.stage=untouched|partly_swept|visited_again`, `discoveries:falling_leaf`. Cảnh sạch một phần **không phải vĩnh viễn** — ngày sau có lá mới, nhưng nhật ký giữ ký ức. **Art:** lá rơi, 2 trạng thái nền, âm chổi ngắn.

---

## HG23 — Con Vàng và khoảng sân trước nhà

**P0 role fix:** `villager` **là chính Ông Tư**, chủ con Vàng. Tuyến `mind.js` hiện nói chó **nhà Ông Tư cắn "bạn"** rồi cho "bạn" mang rau đến nhà Ông Tư; cách viết đó chỉ có nghĩa khi vai "bạn" là người khác. **Không tái sử dụng nguyên hội thoại đó cho Ông Tư**. Phiên bản mới cần chặn va chạm tự bật và phân vai.

**Vai:** Ông Tư hoặc Sư Tịnh. **Nơi:** `village` và `gate`. **Loại:** 2 ngày, có thể bỏ qua. **Không biến con chó thành kẻ xấu**.

**Ngày 1 — Ông Tư:**

> "Con Vàng nằm dài trước cửa, nhưng hễ có người lạ qua thì sủa to. Ông Tư nghe tiếng sủa, bỗng nhớ một buổi sáng mình cũng đứng chắn ngay lối ấy."

- **`Dắt Vàng vào sân khi có người qua`** → `dog.stage=secured`, hoạt ảnh chó chuyển vào hiên, đường đi yên ổn.
- **`Hỏi xem ai từng bị Vàng làm sợ`** → một NPC kể có người đã phải đi vòng, mở `dog.stage=needs_attention`.
- **`Ngồi cạnh Vàng một lát`** → khám phá một cảnh êm, không phạt, vẫn mở chuyện sau.

**Ngày 2 — người qua đường đi ngang:** Vàng nhìn ra nhưng đã đứng bên trong. Một người đi qua bình yên. Ông Tư có thể hỏi thăm, **không có sự cố cắn lặp để farm Sân**.

> "Con Vàng ngẩng đầu rồi lại đặt cằm xuống chân. Ông Tư thấy con đường hôm nay rộng thêm được một chút."

- Nếu từng ngăn Vàng sủa → người qua đường gật đầu; `worldEffect:lane_safe`.
- Nếu chưa → có lời gợi ý Ông Tư chủ động giữ Vàng trong nhà, rồi một hôm khác cảnh đổi.
- Vai sư đi ngang thấy sự đổi thay của ngõ; nếu từng có xích mích có thêm lời nói về việc xin lỗi, **không ép sư giảng đạo**.

**Không có cơ chế thưởng thẻ bất thiện khi cố tình chọc chó hoặc làm người khác bị cắn.** Không cần NPC/vật mới trừ một pose chó nằm/đi vào sân. **Save:** `dog.stage=noticed|needs_attention|secured|lane_safe`, `apologySeen`. **Khi vắng:** không tạo thêm lần chó cắn.

---

## HG24 — Bóng gốc gạo qua ba buổi

**Vai:** cả ba nhưng các góc nhìn khác nhau. **Nơi:** `gao` ↔ `graves`. **Loại:** khám phá môi trường 3 thời điểm, **không phải nhiệm vụ**. **Cảm xúc:** dịu, hơi kỳ ảo, không kinh dị.

**Buổi sáng:** ánh sáng rơi dưới tán cây, một chiếc lá lạ nghiêng trên rễ. Chạm `Ngắm chiếc lá`:

> "Lá gạo nằm im. Chỉ bóng của nó dịch một đoạn nhỏ khi mặt trời lên."

**Chiều:** bóng cây dài đến con đường men nghĩa địa. Chạm `Theo bóng cây` → nhìn thấy mộ thấp ở xa, chỉ ghi `discovery:gao_shadow_afternoon`, không ép hỏi ai.

**Đêm trăng:** một tiếng gió đi qua tán cây, lá lấp lánh nhẹ (không cần giải thích thần linh). Người chơi tự chọn `Đứng lặng một lúc`:

- **Sư Tịnh:** nhớ buổi tu dưới bóng cây, một câu về việc thấy lá đổi vị trí.
- **Ông Tư:** nhớ chuyện đã từng ngại bước qua nghĩa địa; nếu đã thay đổi trong truyện cũ, lời nghĩ khác.
- **Bà Sáu:** có ký ức về Hạnh và tiếng gọi cũ; nếu `ghost_memory.looked`, bà không còn gọi bóng người lạ là Hạnh. **Không khẳng định buông là siêu thoát.**

**Lưu:** `discovery:gao_three_lights` sau khi đã nhìn đủ ba thời điểm, không phát thưởng vật phẩm/thẻ. Mỗi thời điểm vẫn có cảnh để ngắm dù chưa đủ bộ. **Bỏ qua một ngày:** không làm lại ba buổi từ đầu; có thể trở lại khi đúng ánh sáng. **Art:** cùng một cây, ba overlay bóng/màu, không vẽ map riêng.

---

## HG25 — Hai chiếc gáo bên giếng

**Vai chính:** Ông Tư; Sư Tịnh có phiên bản quan sát hoặc nhận sự giúp đỡ phù hợp vai; bà Sáu không được múc nước. **Nơi:** `well`, `village`. **Loại:** một cuộc gặp và một lần quay lại. **Không gắn với rau má nếu chưa trả lời hứa.**

**Ambient sáng sớm:** bà cụ đặt hai chiếc gáo cạnh giếng, một chiếc cán long, một chiếc cán ngắn. Ông Tư đi ngang.

> "Bà cụ phải kéo gầu hơi nghiêng. Cán gáo dài làm nước đổ ra ngoài mép thùng."

- **`Hỏi bà muốn giúp việc gì`** → bà chỉ chiếc gáo có cán cần buộc lại, nếu ông Tư nhận mới có `wellPromise=accepted`.
- **`Buộc lại cán gáo`** → một thao tác nhỏ, ghi `wellLadle=secured`, hôm sau bà cụ kéo nước dễ hơn.
- **`Ngồi nghe tiếng nước`** → nhận `discovery:well_echo_morning`, không tự nhận Niệm.
- **`Đi tiếp`** → không có lời hứa, NPC có thể tự nhờ người khác sửa; không phạt.

**Ngày sau:**

> "Chiếc gáo nằm ngay ngắn. Nước chảy tròn vào miệng thùng. Bà cụ ngẩng lên: ‘Hôm nay nhẹ tay hơn hẳn.’"

Nếu `wellPromise=accepted` mà chưa sửa, bà hỏi "Con còn nhớ chuyện cán gáo không?" rồi có thể đề xuất sửa, xin để sau hoặc nhờ người khác. Không gắn nhãn đạo đức nếu người chơi bận.

**Hệ quả:** một sprite gáo ngay ngắn, NPC nhớ, dấu sinh hoạt. **Tín hiệu cho hệ chung:** cùng một địa điểm có thể có HG05 về rau và HG25 về gáo, nhưng **không được bật cả hai popup hoặc hai quest cùng lúc**. Người chơi chọn `Nghe chuyện với bà` rồi thấy danh sách ngắn; việc đã nhận ưu tiên trên ambient.

---

## HG26 — Nghe chuông, không cần làm gì

**Vai:** Sư Tịnh, Ông Tư, Bà Sáu ở ngoài tường. **Nơi:** `hermitage`, hoàng hôn hoặc đêm trăng. **Loại:** **không quest**. **Mục tiêu:** xác nhận người chơi không làm việc vẫn có trải nghiệm được công nhận.

**Ambient:** chuông ngân ngắn, ánh đèn từ mái, đôi chim cuối chiều bay về. Không hiện biểu tượng nhiệm vụ trừ khi người chơi chủ động nhấn chuông/kệ sách.

**Nếu bấm `Nghe thêm một tiếng chuông`:**

> "Tiếng chuông đi qua mái hiên, qua lá cây rồi nhỏ dần. Khi tiếng cuối cùng mất, xung quanh vẫn còn tiếng dế."

- **Sư:** có thể `Đi kinh hành dọc hiên` chủ động hoặc `Ở lại nghe`.
- **Ông Tư:** nếu từng nóng tính với sư, nghĩ lại một câu nói của mình; nếu chưa, chỉ đơn giản thấy trời đẹp.
- **Bà Sáu:** chỉ nghe từ ngoài, nhớ tiếng người từng gọi về ăn cơm, không vào cầm chuông.

**Kết quả:** `discovery:evening_bell`, một bản ghi tùy chọn trong nhật ký cảnh, không thẻ tâm. **Không spawn cùng dấu sổ mỗi lần nghe**. Sau một thời gian, âm chuông có biến thể khác nhưng không đòi thêm chức năng.

---

## Quy tắc phối trộn và hậu quả

| Nếu người chơi… | Không nên làm | Nên làm |
|---|---|---|
| Đã giúp ông Tư / chính Ông Tư đã sửa đường | phát lại mở đầu như chưa có gì | đèn, đường hoặc chó đổi trạng thái; người qua đường có phản ứng mới |
| Đã học đoạn kinh khi vắng | cộng Niệm/Định tự động | Sổ kiến thức thêm `heard`, lần sau sư có câu hỏi/hướng dẫn |
| Đã thấy gốc gạo sáng/chiều | bắt học 3 buổi mới được đi hang ngoài | mở một ghi chú cảnh, vẫn cho dạo tự do |
| Đã bỏ qua một việc | tạo thông báo trách móc/lỡ streak | NPC sinh hoạt tiếp; nhiệm vụ vẫn có thể nhận lại hoặc người khác tự làm |
| Vai dân là **Ông Tư** | cho "người chơi" đem đồ sang nhà ông Tư (tự gặp chính mình) | dùng đối thoại ngôi thứ nhất hoặc một NPC thật; tách hậu truyện chó theo vai |
| Vai ma là bà Sáu | cho ma cầm giỏ, thắp đèn, đưa em bé về | quan sát, nghe, nhớ, tự đặt câu hỏi; có thể nhận mảnh ký ức |
| Người thích dạo 5 phút | mở popup xin quest lần lượt | một vài ambient khác nhau, ít nhất một dấu khám phá nếu tự ngắm |

## Sơ đồ trạng thái tối thiểu để test

```text
HG21 đèn: unknown → noticed → planning? → installed → seen_used
HG22 sân: untouched → partly_swept → visited_again (sân vẫn có thể có lá mới)
HG23 Vàng: noticed → needs_attention? → secured → lane_safe
HG24 cây gạo: seen_morning + seen_afternoon + seen_night → discovery
HG25 gáo: available → accepted? → secured → npc_acknowledged
HG26 chuông: never_heard → heard → (variants; không nhân thưởng)
```

**Tương thích:** không tạo state mới thay thế `q.tree`, `q.ghost_memory`, `q.robe`, `S.quest` nếu chưa có migration. Vẽ tư duy xong rồi map các effect sang cấu trúc hiện hành. Không có hệ chia sẻ một thế giới liên nhân vật thì các storylet chỉ **tham chiếu bối cảnh**, không khẳng định đã đồng bộ hành động giữa save của Ông Tư, Sư Tịnh và Bà Sáu.

**Kiểm tra chấp nhận:**
1. Đi ngang 6 cảnh của gói này không bị popup và không ngừng di chuyển.
2. Cả ba vai có nội dung hợp vai, không có Ông Tư gặp "Ông Tư thứ hai".
3. Mỗi episode có ít nhất một phản hồi ngay và một biến thể khi quay lại, hoặc chỉ rõ là ambient-only.
4. Lần thứ hai vào scene không tự nhận lại `discovery`/vật phẩm.
5. Người chơi để dở vẫn quay lại được, NPC không bị kẹt vĩnh viễn.
6. Không có cơn mưa/bão bắt buộc để hoàn thành sáu episode.
7. Không cần thẻ tâm để **được đi dạo** hoặc nghe chuông.
