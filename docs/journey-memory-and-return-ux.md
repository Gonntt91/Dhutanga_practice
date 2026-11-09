# Sổ Hành Trình & Hồi tưởng khi quay lại — Journey Memory UX v0.1

> **Design-only, CHƯA triển khai code/UI/save.** Người chơi tự tạo nhân vật có tên và vai riêng. Tài liệu này quy định ký ức, tổng hợp mạch truyện, tóm tắt khi trở lại sau lúc vắng, nơi nghỉ linh hoạt. Đọc kèm [Player-Centric Narrative Model](player-character-narrative-model.md), [Ghost Campaign Bible](ghost-playable-campaign-bible.md), [Ghost Episode Pack 01](ghost-episode-pack-01.md), [Ghost Episode Pack 02](ghost-episode-pack-02.md), [Role Transition & Spoiler Isolation](role-transition-and-spoiler-isolation.md).
>
> **Điều chỉnh bắt buộc:** **Nhà hoang chỉ là MỘT địa điểm nghỉ tùy chọn của PC hồn ma**, không phải nhà/chỗ ở mặc định, không phải tất cả hồn ma cùng sống tại đó, không phải checkpoint cố định, không yêu cầu về nhà mới được save/thoát/nhận hồi tưởng. PC hồn ma có thể tự chọn hoặc thay đổi địa điểm nghỉ tùy câu chuyện và sở thích.

## 1. Mục tiêu trải nghiệm

- **Trở lại là nhớ được câu chuyện đang tới đâu**, không phải học lại đoạn thoại hàng chục dòng.
- **Làm một việc xong, thế giới nhớ**: gặp ai, hứa gì, đã giúp chưa, nhân chứng nói gì, địa điểm đổi ra sao.
- **Bí ẩn có tầng thông tin**: tách rõ những gì **PC tự thấy**, **nghe NPC kể**, **đang suy đoán** và **đã có chứng cứ xác nhận**; không tiết lộ Hạnh/bà Sáu trước khi PC đi đúng tuyến.
- **Hồi tưởng dịu, ngắn, có quyền bỏ qua**. Đọc sâu tự chọn trong Sổ, không auto-popup khi mới rời game vài phút hoặc cứ vào map.
- **Tách nhân vật:** PC ma và PC sống cùng account vẫn có `characterId`, hành trình, manh mối, kết quả NPC và checkpoint độc lập. Người chơi ngoài đời có thể nhận ra một landmark, nhưng Sổ PC mới không tự biết điều PC kia thấy.

## 2. Điểm nghỉ tự do theo vai — không mặc định “ma ở nhà hoang”

| Vai | Ví dụ địa điểm nghỉ (chọn lựa, không ràng buộc nơi ở) | Không gian hồi tưởng |
|---|---|---|
| **PC hồn ma** | nhà hoang, bên mộ cũ, dưới gốc gạo, bờ khe suối rừng tre, Bến Không Tiếng — Bờ Chìm, mái hiên bỏ trống, một gốc cây yên tĩnh | ánh trăng, gió, sóng nước, tiếng dế; lời hồi tưởng theo nơi chọn |
| **PC người dân** | hiên nhà, nhà người thân phù hợp truyện tự tạo, bến giếng, ghế dưới cây, nơi được người ta cho trú | tiếng bếp, tiếng người, chuyện bên đường |
| **PC nhà sư** | tịnh thất, gốc cây, chỗ thiền hành/nơi nghỉ phù hợp giới luật và cảnh đã được duyệt | tiếng chuông, sương sáng, bước chân kinh hành |

**Mọi điểm nghỉ đều tùy chọn**, không cưỡng chế về một hub. Một PC ma có thể quay về mộ thường xuyên, PC khác thích ngắm suối, PC khác thích nhà hoang. Không có địa chỉ thường trú ngầm định khi chọn `role=ghost`, không chuyển hết các vong NPC vào cùng nhà.

**Gợi ý hành động tại bất kỳ điểm nghỉ hợp vai:**
- `Nghỉ một lát` hoặc `Lắng lại một đêm`: chọn hoạt động khi vắng, không đồng nghĩa chết/tái sinh.
- `Nhớ lại hành trình`: mở Sổ tại **mạch đang theo** hoặc Hồi tưởng gần nhất.
- `Lắng nghe chuyện quanh đây`: chỉ các hint dựa trên NPC/sự kiện có thật đã hiện diện, không sinh bí mật vô cớ.
- `Tiếp tục khám phá`: đóng nhẹ, về map.
- **Không bấm nghỉ cũng luôn lưu progress** ở thời điểm an toàn, save khi rời/đổi nhân vật; không bắt PC hoàn thành đêm mới có thể thoát.

**Nhà hoang trong G01/G03** còn có chức năng riêng (hù vui, phát hiện túi kim chỉ, ngắm cảnh). Chọn nghỉ ở đó chỉ là **một lựa chọn thêm**, không là tuyến duy nhất hoặc một nơi chứa mọi hồn ma.

## 3. Sổ Hành Trình khác Nhật ký và Album thẻ

| Lớp | Chức năng | Ví dụ |
|---|---|---|
| **Nhật ký thời gian** (`eventLog`) | ghi những sự kiện PC trải qua theo thời gian, có nguồn và eventId | “Nghe Ông Tư kể tiếng lạ lúc tối”, “Bà cụ đã lấy được túi kim chỉ” |
| **Mạch truyện** (`storyThreads`) | gom sự kiện theo `storyId`, trạng thái `chưa gặp/đang mở/chờ diễn biến/đã khép`, tóm tắt cập nhật theo sự thật đã biết | G03 — thấy túi → tìm cách gợi → bà đã lấy được |
| **Sổ manh mối** (`clues`) | phân biệt `observed / reported / hypothesis / confirmed`, có `sourceRef`, `confidence` và `revealTier` | Người giữ bến *nghe* tiếng trẻ khóc, chưa chắc có liên quan Hạnh |
| **Hồi tưởng** (`recapSnapshots`) | tóm tắt ngắn có thể xem lại, lấy từ event thật và sự kiện offline đã commit | “Túi vẫn ở bậc thềm; bà cụ đang tìm, bạn từng thử thì thầm” |
| **Album thẻ tâm** | thẻ đã gặp, được nhận đúng hành động/ý định trong truyện | G01 hù người → các mốc tâm bất thiện có căn cứ, không đồng nhất nỗi sợ của **nạn nhân** với tâm PC |

**Tuyệt đối không** tạo suy đoán thành sự thật chỉ để tóm tắt hay “làm câu chuyện hấp dẫn”; không lấy `accountMeta.storySeen` để mở manh mối hoặc thoại chưa trải qua ở PC này.

## 4. UX đề xuất: một nút vào Sổ, một bản nhắc ngắn lúc trở lại

**Trong map:** icon quyển sổ nhỏ ở menu/vùng Profile, không che cảnh, có dấu chấm chỉ khi *mạch người chơi đang theo có sự kiện mới đã ghi thật*. **Trong Profile:** tab `Hành trình` nằm cạnh `Nhật ký` và `Album thẻ`, có các mục `Đang theo / Manh mối / Đã khép`. Không duplicate hai hệ nhật ký độc lập.

**Mục “Đang theo”:** một thẻ truyện gồm tên, tóm tắt 1–2 câu, điều PC đang biết, nút `Nhớ lại`, `Ghim để theo dõi` (tùy chọn), `Xem manh mối`. Không tự “nhận quest” khi chỉ đi ngang. Tính `lastMeaningfulEvent` để ưu tiên các tuyến người chơi thực sự quan tâm, không ép bảng TODO.

**Mục “Manh mối”:** hiển thị `Tôi đã thấy / Tôi nghe kể / Tôi đang nghi / Đã xác nhận` rõ ràng. Một manh mối `reported` không được viết thành “Sự thật là...”.

**Mục “Đã khép”:** các chuyện hoàn thành (G03 bà cụ lấy được túi, HG27 bà ngoại được an và rời cảnh khổ), có hình và hồi tưởng, *không cấp lại thẻ/vật phẩm khi xem*.

**Popup khi trở lại:** chỉ xuất hiện trong tình huống có **mốc chuyện đáng kể hoặc đã vắng đủ lâu**, không phải mọi lần mở game. Dùng màn `Trong lúc vắng` sẵn có nếu PC đã chọn một hoạt động nghỉ trước đó. Tối đa **1 đoạn đã làm/vắng**, **1 điều đang theo**, **1 manh mối đáng nhớ**, 1–2 nút `Xem lại Sổ` / `Tiếp tục khám phá`; có tùy chọn không hiện nhắc tự động. Nếu không có gì mới, vào map bình thường.

**Không auto claim:** story recap là **read-only**; thẻ chỉ từ mốc hành động đã hoàn thành theo logic sự kiện, không thưởng khi người chơi bấm `Nhớ lại` hoặc chuyển nhân vật.

## 5. Ví dụ hồi tưởng cho PC ma (có thể nghỉ ở bất kỳ nơi nào)

### Sau khi nghỉ dưới gốc gạo

> **Một đêm đã qua.** Gió lùa qua những bông gạo cuối mùa.
>
> **Chiếc túi kim chỉ:** Bạn từng thấy nó ở bậc thềm nhà hoang. Bà cụ vẫn đang tìm.
>
> **Điều còn thắc mắc:** Ở khe suối rừng tre, có tiếng mái chèo vọng lại dù chẳng thấy con thuyền.
>
> `Xem lại hành trình` / `Tiếp tục khám phá`.

### Sau khi nghỉ trong nhà hoang

> **Đêm bên mái cũ.** Bụi trăng rơi qua cửa sổ không còn cánh.
>
> **Chuyện đã đổi:** Bà cụ trở lại bậc thềm và tìm được chiếc túi. Lần sau bạn thấy bà ngồi vá quai thúng.
>
> **Mạch khác:** Bà Sáu vẫn chờ dưới gốc gạo. Bạn chưa biết bà đang đợi ai.
>
> `Xem lại hành trình` / `Tiếp tục khám phá`.

### Sau khi nghỉ trên Bờ Chìm

> **Đêm gần Bến Không Tiếng.** Dòng nước phẳng như gương.
>
> **Điều đã nghe kể:** Người giữ bến nhớ tiếng trẻ con khóc trong một đêm lũ, **không chắc** ai đã qua được bờ.
>
> **Điều cần tự tìm hiểu:** Có mối liên quan nào với lời bà Sáu hay không?
>
> `Xem manh mối` / `Tiếp tục dạo bến`.

**Những câu trên chỉ được render khi các event tương ứng thật sự có trong save của PC.** Khi không có đủ dữ liệu, thay bằng đoạn cảnh đẹp ngắn, không bịa sự kiện/NPC.

## 6. Hệ dữ liệu sự kiện — yêu cầu trước code (schema mô tả, chưa API)

```js
const memoryEvent = {
  id: "evt_char123_G03_itemSeen",
  characterId: "char123", // bắt buộc cho khám phá cá nhân
  storyId: "G03",
  kind: "clue_observed", // action | clue_observed | npc_report | world_change | card_milestone
  sourceActorId: "npc.granny", // null nếu từ môi trường
  placeId: "abandoned_house",
  at: "server_time",
  factKey: "granny.sewing_pouch_lost",
  certainty: "observed", // observed | reported | hypothesis | confirmed
  revealTier: "early",
  payload: { clueId: "pouch_under_step" }
};
const storyThread = {
  characterId: "char123",
  storyId: "G03",
  stage: "hint_sent", // hoặc observed/owner_known/dream_sent/delivered/completed
  seenEventIds: ["evt_char123_G03_itemSeen"],
  recapRevision: 3,
  followUpPlace: "village_well",
  lastMeaningfulEventId: "evt_char123_G03_itemSeen"
};
const restChoice = {
  characterId: "char123",
  chosenPlaceId: "gao_tree", // hoặc ruined_house, graves, shadow_pier, v.v.
  activityId: "rest_listen",
  startedAt: "server_time"
}; // lựa chọn mỗi lần nghỉ; KHÔNG định nghĩa homeId cố định cho mọi PC ma
```

- `storyThreads` nên là **projection** được tạo từ event xác nhận, không là nguồn dữ liệu thứ hai ghi mâu thuẫn với quest state.
- `recapSnapshot` có thể tạo bằng **template theo stage** hoặc event reducer, **không cần AI runtime** cho MVP; nhất quán, dễ dịch en/ja/vi, kiểm thử được.
- Không tin `payload` client để nhận thẻ/spoiler; server xác thực event, game state và reward milestone.
- Offline progression chỉ cập nhật điều đã được **chọn rõ, có logic và có kết quả thực sự**. Ví dụ nghỉ nghe tiếng kinh không đương nhiên nhận một cuộc gặp chư thiên/hoàn thành G07, NPC tự tìm được túi cần event `npc_finds_item` để cập nhật.
- Mỗi `characterId/storyId/eventId` ghi idempotent. Khác PC cùng account không sync `storyThreads` hoặc `clues`; account meta chỉ tổng thành tựu ngoài truyện nếu cần.
- Chuyển vai **dân → tập sự xuất gia** giữ cùng `characterId` và toàn bộ lịch sử; **ending PC ma** đưa Sổ vào archive read-only, không mất nội dung.
- Save legacy hiện có `dhutanga.history` (200 dòng), `dhutanga.progress` per-character và `dhutanga.memory` account-wide. **Không âm thầm chuyển toàn bộ account memory thành fact PC**, cần `saveVersion`, mapping scene IDs, archive legacy và tests.

## 7. Giao tiếp người chơi thật — lưu ký ức sự kiện, không auto đọc suy nghĩ

Nếu PC ma gặp player sư/dân và nghe lời hồi hướng/thấy gesture đã được **server phát trong thế giới**:
- Hồn ma có thể tự chọn `Lắng nghe` và lưu event “Tôi đã nghe lời hồi hướng gần tịnh thất”, chỉ khi có sự kiện thực, trong vị trí và điều kiện hợp lệ.
- **Không giả định** lời hồi hướng có hiệu lực tái sinh tự động hoặc lời player thật đương nhiên làm quest hoàn thành. Phân biệt `dedication_npc` với `dedication_player`, cần consent/rate limit/test trước khi code.
- Không auto lưu nguyên văn chat riêng, tên/ID người chơi khác trong Sổ nếu không có lý do rõ; ưu tiên lưu event mô tả chung, tôn trọng chặn/ẩn hồ sơ.

## 8. Checklist trước coding

- [ ] PC ma nghỉ ở **nhiều nơi**; nhà hoang là một lựa chọn, không bắt buộc, không có `ghost.home = ruin` mặc định.
- [ ] Có `Tiếp tục khám phá` khi đứng gần điểm nghỉ; save khi rời game không phụ thuộc địa điểm.
- [ ] Tab Hành trình giúp nhớ story G01/G03/G04/G05, không là bảng bắt làm quest.
- [ ] G03: PC chỉ thấy túi thì Sổ ghi vị trí; chỉ sau khi chủ động biết bà tìm thì ghi bà là chủ; nếu bà tự tìm không ghi PC đã giúp.
- [ ] Bến: lời ferryman là `reported`, không biến thành chứng cứ Hạnh là ai.
- [ ] Popup `Trong lúc vắng` không spam với session ngắn, có skip và cách xem lại; recap không phát thẻ.
- [ ] PC có thể chuyển dân → sư giữ Sổ; PC ma ending vẫn đọc được Sổ ở archive.
- [ ] Guest, signed-in, nhiều PC cùng account không lộ spoiler; giữ được save cũ sau migrate.
- [ ] Recap render từ event có thật, không bịa sự kiện khi vắng, không lộ bí mật chưa khám phá.
- [ ] Người chơi thật khác không bị lưu chat riêng/danh tính vào hồ sơ game ngoài mục đích hợp lệ.
