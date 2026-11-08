# Ghost Campaign Bible v0.1 — Hồn ma: vui tinh nghịch, khám phá cõi khuất và một cuộc đời riêng

> **Thiết kế trước coding, KHÔNG triển khai gameplay.** Người chơi tự tạo tên và chọn `ghost` — **KHÔNG phải bà Sáu**. `npc.ba_sau` và `npc.peta_grandmother` là hai NPC khác nhau, giữ nội dung đã có trong `story.js` và `encounters.js`. Chưa khẳng định hồn ma có thân thể thật, phép thuật hay khả năng tái sinh chủ động theo giáo lý; các cơ chế thì thầm/giấc mơ/đi xuyên ranh giới là **fiction/game_interpretation**, phải có chú thích nguồn nếu đưa vào game.
>
> Cùng chuẩn [Player-centric Narrative Model](player-character-narrative-model.md), [World Exploration Bible](world-exploration-bible.md), [Early Mysteries & HG27](human-world-early-mysteries-and-peta-quest.md). Thiết kế vai dân → xuất gia và ending vai ma nằm ở [Role Transition & Spoiler Isolation](role-transition-and-spoiler-isolation.md).
>
> **Ranh giới game:** Nhân gian vẫn là nơi bình yên, phần cõi khuất **hơi kỳ ảo và man mác**, không làm thành game kinh dị. Cho phép chơi ngắn, tự do đi dạo và không bị khóa vì thiếu thẻ/tổng điểm tâm. Cảnh đáng nhìn hoặc pha hù người vô hại cũng là phần thưởng.

## 1. Những gì đã có / chưa có trên `develop`

| Hiện có trong code | Điều cần bổ sung hoặc thay |
|---|---|
| `story.js`, `story-nights.js`: cảnh ma từ góc nhìn **bà Sáu** với Hạnh, mẹt xôi, chiếc nón và đêm mưa/trăng | giữ các scene **làm NPC flashback**; viết mới cuộc đời của PC ma, không biến PC thành bà Sáu |
| `encounters.js` `ghost_memory`: bà Sáu nghe guốc, Hạnh và tiếng kinh, popup theo vùng `near()` | PC ma **chủ động tìm hiểu** chuyện bà Sáu; thay `auto popup` thành ambient + tap |
| `encounters.js`: đa số quest `tree/peta/cave/palace` gated qua `villageRole() = monk/villager` | tạo **ghost-only route**/storylets thay vì copy permission của người sống |
| `encounters.js`: hang modal đòi đèn, `Q('cave')` | PC ma được qua khe/vách mỏng mà **không cần đèn/đủ Niệm**, nhưng có khó khăn **khác** khi đi sâu |
| `save.js`: `dhutanga.memory/runs/completed` thuộc account; `mind/progress/history` per-character | **cô lập tiết lộ, checkpoint, lore và ending mỗi character**, legacy compatibility |
| `world-exploration-bible.md`: Hang Vọng Tâm → Bến Không Tiếng là lối người sống trong bản đồ đề xuất | thêm **lối hồn ma** từ nhà hoang/đường khuất; cùng một landmark nhưng trải nghiệm khác |

**Không mô tả** các cơ chế mới như đã chơi được. Existing NPC quest HG27 bà ngoại ngạ quỷ phục vụ người sống, có cinematic và ba milestone thẻ theo spec; PC ma không tự làm nhiệm vụ cúng cơm đó bằng cách chạm vật, nên cần độc lập.

## 2. Fantasy & hành vi riêng của PC ma

### 2.1. Quyền năng nhỏ, có vui và hậu quả

| Năng lực | Được làm trong game | Giới hạn giữ logic | Tình huống dùng |
|---|---|---|---|
| **Lượn qua bóng** | bước qua khe hẹp, lối bị che, một số cửa nhà hoang; nhìn lớp dấu vết khuất | không đi xuyên mọi map/teleport khắp thế giới; ranh giới cõi có ngưỡng riêng | `G01` nhà hoang, `G04` bến |
| **Thì thầm** | NPC người sống thoáng nghe 1–2 từ, quay đầu, thắc mắc hoặc nhớ việc đã nói | **không điều khiển ý nghĩ**, không đảm bảo NPC tin | chỉ người đi tìm vật nhớ nhìn chỗ rơi |
| **Tiếng động/đốm lạnh** | lá xào xạc, tiếng gõ cửa, ngọn đèn lay, bóng vụt qua | không cầm, dời, ném, mở khóa hoặc gây thương tích vật lý; không ép sợ hãi quá mức | hù Ông Tư, đánh lạc hướng người tìm đồ |
| **Báo mộng** | gặp người đang ngủ trong một **scene mộng ngắn**, gợi hình một vật/địa điểm có liên hệ | hiếm, cần `dreamAnchor` (người đó có ký ức/dấu vết về đồ bị mất); không cho tự viết mộng toàn năng hoặc ép NPC làm việc | hoàn thành truyện “Vật ở dưới gốc tre” |
| **Nghe lời hồi hướng** | nghe lời sư tụng sau một đêm tu, thấy cảnh đổi và được hỏi liệu có sẵn lòng khép lại hành trình | không mặc định mọi lời tụng đều giải thoát tất cả hồn ma; phải có hoàn cảnh truyện và lựa chọn PC | `G06`, ending |
| **Dõi theo hương cơm cúng** | phát hiện cảnh có phẩm vật dâng/câu chuyện hồi hướng; tìm nơi người sống còn nhớ tới chúng sinh đã khuất | không `pickUp(food)`, không tự đi ăn cơm vật chất như item; khả năng hưởng phước tùy kịch bản được duyệt | `G02` |
| **Nghe lời của cõi khuất** | nói với một số vong linh/NPC chỉ hiện trong `ghostLayer`, thấy dấu chân ký ức | các NPC ngạ quỷ không vô hạn kiến thức, không biết toàn bộ mạch bà Sáu | `G04`, `G05` |

**Năng lực KHÔNG phải skill tree dựa vào điểm "thiện".** Thời điểm mở cần thỏa story condition ngắn, minh chứng tương tác (ví dụ thử thì thầm, biết NPC đang tìm), không yêu cầu farm thẻ/tâm.

### 2.2. Cơ chế hù dọa phải vui

**Hù dọa được chơi, không bắt buộc bị phán xét.** Ông Tư hoặc khách đi đêm có thể bị dọa, giật mình rồi cười; con Vàng dựng tai, sủa lên; một lá tre rơi trúng nón ông, ông tự nghĩ có ma. Cho PC chọn `Hù nhẹ`, `Để người ta yên`, `Thì thầm giúp`. Phản hồi khác nhau tùy lịch sử NPC và thời điểm. Không tạo mini-game khủng bố trẻ nhỏ hoặc lặp hù để farm thẻ Sân/Thiện. Nếu PC làm NPC hoảng đến đi lạc, nên có đường sửa chữa: dùng lời thì thầm để họ bình tĩnh/tìm lối về.

**Ví dụ:**
> Ông Tư nghe cửa kêu “cộc” một tiếng, quay lại nhìn.
>
> “Con Vàng! Mày lại làm gì đấy?”
>
> Con Vàng vẫn ngủ. 
>
> `Hù thêm một chút` → ông chạy vào hiên, vài hôm sau ông kể chuyện nghe tiếng lạ.
>
> `Thì thầm: ‘Bên trái…’` → ông nhìn sang và thấy cái đèn bị quên tắt.
>
> `Đi dạo tiếp` → không quest.

## 3. Ghost-only map: “Lối nước khuất” và Bến Không Tiếng

**Đề xuất đồ thị theo góc nhìn:**

```text
Nhân gian (PC sống): Làng → gốc gạo → [Hang Vọng Tâm] → hồ âm vang
                                            ↓
                                       ngưỡng sâu
                                            ↓
                                  [Bến Không Tiếng — BỜ NỔI]
                                            ↕  (chỉ 1 khu giao)
Nhân gian (PC ma): Gốc gạo → nghĩa địa → nhà hoang → lối nước khuất
                                                  ↓
                                     [Bến Không Tiếng — BỜ CHÌM]
                                             ├─ giếng cạn
                                             ├─ xóm không khói
                                             ├─ bến đò nghe tiếng
                                             └─ Cột đá cũ — phần giao
```

**Lưu ý:** đây là **logic truyện và hình ảnh, không phải tuyên bố địa lý giữa các cõi Phật giáo**. "Cùng một bến" là fantasy thiết kế; con người có thể tới qua hang, PC ma qua đường khuất mà không cần đèn. Về nguyên tắc, **chỉ khoảng 20–30% landmark/tên địa điểm chung**, còn phần trải nghiệm, câu chuyện, màu/âm thanh/đường đi **70–80% khác nhau** (tỷ lệ thiết kế thử, không áp đặt content).

| Góc nhìn | PC sống nhìn thấy | PC ma nhìn thấy |
|---|---|---|
| **Cửa vào** | khe đá, hồ hang, ngưỡng sâu, cần nguồn sáng hoặc cách đi riêng | lối nước in bóng dưới rễ cây/cửa nhà hoang, theo tiếng gọi, không cần ngọn đèn người sống |
| **Bến** | bờ đá ẩm, thuyền mục, dấu bước và người đứng xa | cùng ba cột đá nhưng bến ngập ánh trăng lạnh, nhà không có bóng người sống, lời thì thầm của các vong |
| **Cột đá cũ** | thấy một vết khắc chưa hiểu | thấy dấu chữ/chuyện từ phía đối diện nhưng **thiếu văn cảnh của người sống** |
| **Nhà/bến phía xa** | chưa vào được do lối/hang | có thể tới giếng cạn hoặc xóm không khói qua đường khuất, cần tìm lời hẹn/nhân chứng |
| **Trở lại sau manh mối** | các ký hiệu trở nên hiểu được | một NPC vong kể thêm ý nghĩa của điều nghe được |

**Quan trọng:** PC ma **không được mở sẵn toàn bộ sự thật Hạnh → vợ Ông Tư** chỉ vì tới bến trước người sống. Ở Bến Không Tiếng, chỉ nghe chuyện về trận nước lớn, một chiếc thuyền, một đứa trẻ được chở qua hoặc sự có mặt của một người khác — **mảnh đúng nhưng chưa giải được kết**. Truyện bà Sáu phải giữ cú reveal có điều kiện ở mạch riêng. Sau đó nếu account có nhân vật sư/dân, **chính nhân vật ấy vẫn phải tự tìm chứng cứ**; người chơi ngoài đời có thể nhận ra landmark, nhưng hệ thống không tự ghi vào journal PC khác.

### 3.1. Đường vào hang cho PC ma

- Ghost có thể khám phá **cửa hang** và đi qua một số khe khuất **ngay từ đầu**, **không cần `den_nho`/Niệm/Định**.
- Ngưỡng sâu của ghost không phải bài test `sợ hãi + nguồn sáng` của người; thay bằng **"đường vang sai"**: lạc hướng do tiếng vọng ký ức hoặc tên người khác, cần nghe phân biệt âm thanh hoặc hỏi một vong dẫn đường.
- Có tối thiểu 2 lựa chọn qua ngưỡng: `Theo tiếng nước thật` (đã từng nghe ở nhà hoang) hoặc `Nhờ người đưa đường` (đã gặp vong già ở bến). Một người thích đi dạo có thể thấy bờ ngoài ngay, không phải "xong 5 quest" mới được vào.
- Lối hồn ma và lối người chỉ giao ở khu **Cột đá cũ**, không copy nguyên map. Các vật phẩm người sống nhặt không tạo bản thể vật chất tương đương cho ghost; họ chỉ có thể ghi **dấu vị trí/ký ức**.

## 4. Playable story arcs và các quest cụ thể (mẫu để review)

### G01 — Đêm đầu, nhà không có ai (10 phút mở đầu; solo ghost)

**Nơi:** nghĩa địa → nhà hoang → cổng. **Ambient:** người làng truyền miệng nhà bỏ không đêm hay có tiếng gõ, khung cửa khép hờ. PC ma mới đặt tên dạo tự do, thử một cách hù nhẹ (tùy chọn) và nhận ra cửa nhà hoang không cản mình.

**Cảnh A:** PC đi ngang ngõ, Ông Tư treo đèn, con Vàng sủa. Bấm `Thử làm lá tre xào xạc` → Ông Tư: “Nó rụng lá thôi. Làm gì mà dữ vậy, Vàng?” Có dấu `ability:echo`, không phát thẻ thiện/bất thiện theo click.

**Cảnh B:** PC ma đến nhà hoang, bức tường có mảng sơn tróc; **đi xuyên qua vết nứt** tới sân sau. Tại đó có `vệt dấu bàn tay` chỉ PC ma thấy; ghi Sổ `discovery:abandoned_house_backroom`.

**Cảnh C:** thấy người sống đang tìm chiếc chìa rơi trước nhà, PC biết nó ở dưới bậc thềm nhưng **không nhặt**. Gợi `G03 — Vật người sống bỏ quên`.

**Bỏ qua:** vẫn thoải mái đi ngắm gốc gạo và bến, không ép thử hù, không ép quest bắt buộc.

### G02 — Hương cơm chiều và tiếng hồi hướng (1–2 lần ghé)

**Nơi:** nghĩa địa/hiên tịnh thất. **Lời mở:** có mùi cơm nếp thoáng qua trong gió, nhưng PC ma không cầm được thứ gì. Chọn `Theo hương cơm` → thấy người sống đặt đồ cúng, sư già nhận cúng dường rồi hồi hướng khi phù hợp chuyện. PC ma chọn `Đứng nghe` hoặc `Bỏ đi`. Cảnh nghe có ánh ấm và câu nói từ sư: “Mong những ai hữu duyên được an.”

**Kết quả:** `ghost.heardDedication=true`, khám phá **việc bố thí/hồi hướng từ phía chúng sinh đang khổ**; không tự đạt Niết-bàn, không auto tái sinh. Nếu PC quay lại, sư có thể tụng thời kinh khác nhưng không spawn vô hạn vật phẩm/thẻ.

**Nhu cầu “kiếm cơm cúng”:** thiết kế thành mini route `nghe tin → tới mộ có dấu mới → nhận ra ai còn nhớ mình → nghe/dự phần hồi hướng`. **Không biến cơm vật chất thành item nhặt được**. Trò chơi có thể diễn tả “hương cơm, sự ấm áp” như hình tượng, phải gắn là giả tưởng, không khẳng định peta nào cũng nhận được lợi ích từ mọi đồ cúng.

### G03 — Vật dưới gốc tre: giúp người mà không chạm được (2–3 lần ghé)

**Chủ:** một NPC người dân độc lập, không phải Ông Tư/Hạnh, để tránh nhân vật ai cũng có twist. **Mục tiêu:** người sống đang tìm **hộp thuốc của người già** hoặc **chiếc túi chứa giấy quan trọng** (chốt một vật phù hợp art), PC ma thấy nơi rơi ở sân nhà hoang nhưng không nhặt.

1. **Thấy mà không thể lấy:** `discovery:lost_item_location` và `ghostKnowsItemSpot`. Không cần quest marker to; PC tự nghe NPC lẩm bẩm tìm đồ.
2. **Thử thì thầm:** khi NPC đi qua, PC chọn `Lá dưới bậc…`; người nghe chỉ cảm thấy “Có ai nói gì không nhỉ?”, `npc.noticedHint`. Chọn hù quá mạnh có thể khiến NPC đi xa tạm thời, nhưng không khóa vĩnh viễn, có cách khắc phục.
3. **Báo mộng nếu không được nghe:** sau khi PC đã **biết vật gì đang mất và gặp người tìm vật**, đến lúc NPC ngủ có dấu `dreamAnchor`. PC chọn hình ảnh **bậc thềm với một chiếc lá** để hiện trong mộng, không gửi nguyên text giải đố. Sáng hôm sau NPC kiểm tra chỗ ấy.
4. **Thế giới đổi:** NPC nhặt lại vật, nói “Hóa ra nó nằm ở đây!”; PC ma thấy cảnh người đó giúp được người khác. Nếu chọn khiến NPC hoảng, hôm sau có đoạn xin lỗi gián tiếp hoặc chỉ dẫn lại, **không khóa**.
5. **Thưởng:** `discovery:unseen_help`, mảnh chuyện nhân gian và một **tình huống Bi/Không tham được minh họa** tùy hành vi đã làm; không auto rơi thẻ chỉ vì click gió, không giải thích giáo lý dài.

**Đường bỏ qua:** sau vài ngày NPC hoặc người khác tự tìm ra; PC vẫn có thể nghe hậu chuyện. Truyện không cần thần linh xuất hiện để chỉ từng bước.

### G04 — Lối nước khuất (khám phá ghost-only sau G01, không cần theo chuỗi)

**Nơi:** nhà hoang → bến bờ chìm. **Đầu mối:** trong nhà hoang PC thấy đường nước loang mà người sống chỉ thấy vệt ẩm. Chạm `Lắng nghe dưới vách` → tiếng mái chèo nhẹ. Chọn `Theo tiếng mái chèo`, vào **Bến Không Tiếng — Bờ chìm**.

- Có ba landmark để dạo: **giếng cạn**, **xóm không khói**, **ba cột đá cũ**. Không đứng ngay giữa nơi nguy hiểm hoặc bắt gặp NPC liên tục.
- Một người đưa đò (vong NPC mới, chưa đặt tên canon) đôi khi xuất hiện theo story state, không làm NPC luôn đứng đó. Hỏi: “Có hôm nước lớn, tôi chở nhiều người. Chẳng nhớ mặt, chỉ nhớ có đứa trẻ ôm chiếc nón.”
- Người chơi chọn **`Hỏi thêm về ngày nước lớn`** → lore fragment `flood_ferry_passenger`, nhưng chưa biết Hạnh là ai, ai còn sống, ai vợ Ông Tư.
- Tại cột đá cũ, thấy vết khắc bên mặt sau mà người sống không nhìn rõ. Ghi `discovery:three_pillars_ghostside`.

**Quay lại:** mặt nước thay ánh sáng hoặc người đưa đò chưa tới; một dấu nhắc nhỏ “có thể trở lại lúc nước lặng”, không random hiếm vô lý.

### G05 — Người chỉ nhớ một nửa (gợi bà Sáu; độc lập tuyến bà Sáu)

**Nơi:** gốc gạo → bến. **Chủ:** `npc.ba_sau`. Bà có ký ức riêng về Hạnh; PC ma không thành bà. Sau G04 PC thấy dấu đò, có thể tới gốc gạo và chủ động hỏi bà:

> **PC:** “Bà có nghe về bến nước năm lũ không?”
>
> **Bà Sáu:** “Có chứ. Nhưng từ hôm đó, bà chỉ nhớ tiếng nước. Không nhớ ai đưa ai qua.”

- `Kể bà nghe chuyện người đưa đò` → bà lắng nghe, thêm **một câu hỏi** về bến; bà không lập tức “siêu thoát”, không tiết lộ Hạnh là vợ Ông Tư.
- `Giữ lại chuyện này` → PC chỉ ghi vào Sổ, không bắt tiết lộ.
- `Đi tiếp` → được quay lại.

**Điều tiết spoiler:** ghost có thể biết *đã có đứa trẻ qua bến*, nhưng **không biết cô bé giờ là ai**. Mảnh nhân gian của ông Tư/mộ/hàng xóm mới đủ ghép khác biệt. Kết nối không bắt mọi vong bến là họ hàng hoặc tiền kiếp bà Sáu.

### G06 — Đêm sư tu bên mộ, lời hồi hướng (mạch ngắn có thể dẫn ending)

**Nơi:** nghĩa địa → tịnh thất nghe từ ngoài. **Chủ:** Sư Tịnh hoặc sư già theo lịch đã duyệt; không bắt PC ma có quan hệ cũ với nhà sư.

**Ambient:** đêm trăng, một sư đang ngồi tu yên giữa mộ. PC ma có thể `Làm lá xào xạc để thử hù` → sư chỉ liếc, lại tiếp tục ngồi; `Ngồi nghe` → tiếng tụng/lời hồi hướng về cuối đêm; `Đi chơi tiếp` → không bị phạt.

**Cảnh chủ động:** khi sư hồi hướng cho các chúng sinh hữu duyên, PC có thể chọn `Nghe hết` / `Nhớ một điều mình chưa làm` / `Để đêm khác`. Một NPC vong khác có thể chỉ: “Có khi có người nhớ, nhưng mình chưa dám tin.” Đây là **thoại sáng tác**, không phải trích kinh.

**Phần thưởng:** một tín hiệu về **ending tự chọn**, `receivedDedicationStory=true`, một dấu Sổ. **Không tự động kết thúc nhân vật** chỉ vì sư tụng kinh, đếm ngày, hay vì PC đạt điểm tâm. Khi người chơi muốn kết thúc, mở `G07 — Đêm cuối`.

### G07 — Đêm cuối của một bóng người (ending **tự nguyện, có thể sớm**)

**Điều kiện truyện nhẹ:** PC đã (a) nghe một lần hồi hướng/biết một mối duyên giúp mình được an, và (b) trải qua **một việc có nghĩa** như G03 hoặc G05, hoặc tìm một ký ức quan trọng của chính PC. Không bắt tất cả 6 chuyện/đi hết bến/cày điểm tâm. Cho `Tiếp tục khám phá` **bất cứ lúc nào** trước khi xác nhận ending.

Khi muốn kết, PC thấy ánh sáng đầu sáng, nghe một câu: “Con đường phía trước có thể không còn là con đường này.” PC chọn **`Khép lại hành trình`** hoặc **`Tôi vẫn muốn đi thêm`**.

**Ending candidates (là 3 kết truyện hư cấu, không phải PC chọn cõi như mua hàng):**

1. **G07-H — Một mùa sáng ở làng:** đoạn hồi tưởng ánh ban mai, một gia đình chào đón một đứa trẻ. Chỉ nói **hành trình PC ma khép và câu chuyện gợi tái sinh về người**; không tiếp tục chơi ngay thành người đó, không xác nhận đồng nhất với NPC hiện có.
2. **G07-T — Lá sáng trên cây gạo:** một vị thiên nương cây cất lời trong cảnh kết, không phải PC được điều khiển `treegod`. Nêu rõ đây là **kết tái sinh vào hàng chư thiên/thọ thần trong hư cấu**, không phải upgrade kỹ năng avatar.
3. **G07-D — Phía trời có tiếng chuông:** ánh mây, tiếng chuông xa, một cảnh trời thoáng hiện; kết gợi tái sinh cõi chư thiên. **Không mở gameplay Thiên giới ở phiên bản này.**

**Không có công thức:** `thẻ tâm X >= 70 → deva` là sai tinh thần. Ending căn cứ các **mảnh chuyện của chính PC**, lựa chọn khám phá/chăm sóc và cách kể đã được biên tập; một kết chung “được an và bước sang một cuộc đời khác” là phương án nếu chưa đủ chất liệu để viết ba ending sâu. *Không khẳng định làm một việc tốt hoặc nghe một lần hồi hướng bảo đảm tái sinh cõi nào theo Phật học.*

**Archive:** sau khi người chơi xác nhận ending, `character.status=story_completed`, lưu journal/thẻ/ảnh cảnh và `endingId`. Avatar này **không chơi tiếp chương ma** (theo yêu cầu kết truyện); người chơi có thể xem Sổ, đọc lại cảnh và tạo PC mới. Không delete nhân vật hoặc thay `role=ghost` thành `role=monk/deva` trong save. **Cảnh xác nhận hai bước** vì đây là ending không thể rollback tùy tiện.

## 5. Một vòng chơi mẫu 20–30 phút cho PC ma

| Giai đoạn | Người chơi làm được | Kết quả làm họ muốn quay lại |
|---|---|---|
| 0–5 phút | tự đặt tên; nghe tiếng lá gạo; thử hù Ông Tư/con Vàng hoặc ngắm cảnh | biết mình **khác người sống** |
| 5–10 phút | vào nhà hoang qua lối khuất, nhìn thấy món đồ người sống bỏ quên | có một **vấn đề chỉ mình nhìn thấy** |
| 10–15 phút | thì thầm/báo mộng để người sống tìm đồ | thấy việc tốt thật sự xảy ra dù không cầm được đồ |
| 15–20 phút | theo tiếng nước tới bờ chìm của Bến Không Tiếng | **thế giới ma lớn hơn nghĩa địa** |
| 20–30 phút | gặp dấu chuyện năm lũ, thấy người sư ngồi tu đêm, nghe một đoạn hồi hướng | có bí ẩn bà Sáu và **cách kết nhân vật về sau** |

**Đây là nhịp cơ hội, không bắt buộc thứ tự/tốc độ.** Nếu người chơi chỉ muốn ngắm nghĩa địa, họ có thể nghe tiếng chuông, nhìn trăng, dạo bờ bến, không popup.

## 6. Art direction và asset MVP

- **Hai lớp cùng thế giới:** Nhân gian ngày êm/ánh vàng; PC ma có vùng mát xanh bạc, nhưng không làm toàn bộ map u ám. Ban đầu chỉ dùng shader/overlay/sprite/âm thanh nhẹ trên nền Canvas có sẵn.
- **Không jumpscare:** ánh đom đóm, bụi trăng, bóng nước, tiếng gõ xa, lời thì thầm mơ hồ. Khi hù NPC là tình huống hài duyên, không horror.
- **Ghost UI:** icon `Lắng nghe`, `Thì thầm`, `Tạo dấu hiệu`, `Mộng`, `Theo dấu`, `Đi tiếp`; không có `Nhặt vật`/inventory vật chất hoặc `Dâng cơm` như người sống.
- **MVP map:** reuse 11 địa danh, nhà hoang đang tồn tại trong `FINDS`; thêm 1 **bờ chìm** như scene nhỏ, 1 **Cột đá cũ** dùng lại landmark cho route người sau này, 1 NPC người tìm đồ, 1 dấu mất đồ. Không cần dựng ngay cả cõi dưới.
- **Một hành động ma chỉ tác động nhỏ lên người sống:** âm thanh/lời nhắc/mộng, không có hiệu ứng vật lý làm thay đổi cây cầu, mở cửa hay kéo người.

## 7. Ranh giới Phật học và nguồn cần duyệt

- `Khp 7 / Petavatthu 1.5 (Tirokuḍḍa)` có nội dung về cúng dường/hồi hướng và lợi ích cho chúng sinh đã khuất trong bối cảnh tương ứng; **không khẳng định mọi peta đều ăn cơm cúng trực tiếp hoặc chỉ cần nghe một câu là siêu thoát**. Tham khảo: https://www.dhammatalks.org/suttas/KN/Khp/khp7.html
- Cảnh **ma thì thầm trong mơ, xuyên khe, thấy bờ chìm** là **giả tưởng tự định nghĩa**, không phải quyền năng phổ quát của ngạ quỷ trong kinh Nikāya.
- **Rời cảnh ngạ quỷ/tái sinh** không đồng nhất với **đắc giải thoát/Niết-bàn**. Dùng “khép một kiếp sống”, “được an và tái sinh” trong ending, có chú thích nguồn/cảnh giả tưởng.
- **Thọ thần** trong một số chuyện/chú giải là một loại `rukkhadevatā` (thiên ở cây); kết thọ thần là một dạng tái sinh làm deva trong hư cấu, **không phải một “loài thứ ba” cộng ngang mọi deva**. Duyệt giáo thọ trước.
- Không dùng thang điểm `good/bad karma` có vẻ như mô hình nghiệp báo chính xác hoặc đảm bảo kết quả tái sinh dựa trên lựa chọn nhỏ.

## 8. Kiểm thử khi chuyển thành PR code sau

- [ ] PC ma tạo tên riêng, không bị gọi là “bà Sáu”, không tự có con Hạnh/tiền kiếp NPC.
- [ ] Có ít nhất 1 tương tác hù NPC vui và 1 đường “chỉ đi tiếp”; không ép người chơi thực hiện điều xấu.
- [ ] PC ma không nhặt, cầm hoặc dâng vật chất; chỉ **thấy vị trí**, khiến NPC người sống tự quyết định nhặt đồ.
- [ ] Thì thầm có phản ứng khác báo mộng, không điều khiển NPC bất hợp lý; hint đủ để hoàn thành, không random 1% xác suất.
- [ ] Ghost vào nhà hoang và tới **bờ chìm** mà không phải đạt điều kiện `cave` của người sống; có ngưỡng/khó khăn **riêng** nhưng không gating quá sâu.
- [ ] Có ít nhất một cảnh chung `Cột đá cũ` giữa human route và ghost route, nhưng nội dung/ánh sáng/đường đi khác biệt.
- [ ] Bà Sáu vẫn có cốt truyện riêng; ghost nghe manh mối về nước lớn, không được tiết lộ tự động Hạnh là vợ ông Tư.
- [ ] Nhân vật ma có thể **nghe hồi hướng từ sư sau đêm tu**, nhưng không bị auto ending.
- [ ] Đã đủ mạch truyện nhẹ thì **có ending tự nguyện sớm**, archive đọc lại, không xóa thẻ/progress và không thể dùng save cũ để farm phần thưởng.
- [ ] Người có nhiều PC không bị auto bật lore/codex/quest/reveal của PC này sang PC khác.
- [ ] Có ít nhất 5–10 phút chỉ đi dạo ngắm trăng/gió/nước, không tự mở sheet.
- [ ] Cơ chế nào gắn từ kinh phải có `loreBasis/sourceRefs`; giấc mơ/thì thầm/tái sinh ấn định là fictional.
