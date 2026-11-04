# Một Đêm Đầu Đà

Prototype web nhiều người chơi: một đêm ở nghĩa địa đầu làng, nhìn qua ba đôi mắt.

- **Nhà sư** (thầy Tịnh): bị xua đuổi lúc khất thực, đêm ngồi giữa nghĩa địa, không nằm. Thang đo: *Tâm an*.
- **Hồn ma** (bà Sáu bán xôi): vất vưởng, đói, vẫn chờ con gái. Thang đo: *Chấp*, càng thấp càng nhẹ.
- **Người dân** (ông Tư đầu xóm): người đã đuổi nhà sư, lén theo ra xem thực hư. Thang đo: *Lòng tin*.

Chơi đủ ba vai sẽ mở đoạn kết thật.

## Cách chơi

Màn hình dọc, nghĩa địa nhìn chéo từ trên xuống. Chạm vào đâu thì nhân vật đi tới đó (hoặc bấm **Đi tới**). Tới đúng địa điểm thì khung truyện kéo lên. Chạm vào cảnh khi đang đọc để thu khung truyện lại.

Địa điểm (`World.PLACES` trong `world.js`): `gate` cổng nghĩa địa, `bamboo` bụi tre, `graves` giữa các ngôi mộ, `gao` gốc cây gạo. Mỗi cảnh trong `story.js` có `place`, cảnh ngồi thiền có `pose: "sit"`.

## Chạy

Cần Node 18 trở lên, không cần `npm install`.

```bash
npm start          # http://localhost:3000
PORT=8080 npm start
```

Muốn chơi cùng nhau: mở nhiều tab, hoặc cho máy khác trong cùng mạng LAN vào `http://<IP-máy-bạn>:3000`.

## Nhiều người chơi hoạt động thế nào

| Thứ | Cách đồng bộ | Lưu lại? |
|---|---|---|
| Ai đang ở nghĩa địa, vai gì | `presence` qua SSE (`/events`) | Không, rời trang là mất |
| Khoảnh khắc: chuông, thở dài, đèn lồng | `moment`, gửi `/api/emit` | Không |
| Dấu vết: thí thực, tụng kinh, thắp nhang… | `trace`, gửi `/api/trace` | Có, trong `data/traces.json` (giữ 500 cái gần nhất) |

Việc người khác làm trong 12 giờ gần nhất sẽ thành *flag* và đổi câu chuyện của bạn. Ví dụ:

- Nhà sư đặt cơm thí thực (`offering`), thì hồn ma thấy có vắt cơm trên mộ mình, còn người dân nhận ra mộ bà Sáu.
- Hồn ma thở dài (`sigh`), thì nhà sư nghe tiếng thở dài thật, người dân thấy vệt sáng.
- Nhà sư tụng kinh hồi hướng (`chant`), thì hồn ma có lựa chọn ngồi nghe kinh để buông.

Người chơi chỉ chọn từ câu có sẵn, không gõ chữ tự do (trừ tên hiển thị tối đa 24 ký tự), nên không cần kiểm duyệt nội dung.

## Cấu trúc

```
server.js          # static + SSE + API, không phụ thuộc gói ngoài
public/index.html  # khung trang
public/style.css   # giao diện dọc cho điện thoại
public/world.js    # thế giới 2D vẽ bằng canvas: đường, mộ, tre, cây gạo, ánh sáng, sương
public/story.js    # TOÀN BỘ kịch bản: sửa lời văn ở đây
public/audio.js    # âm thanh tạo bằng Web Audio: gió, dế, chuông, tiếng thở dài
public/app.js      # engine truyện + kết nối realtime
data/traces.json   # dấu vết đã lưu
```

### Viết thêm cảnh

Trong `story.js`, mỗi cảnh có dạng:

```js
m4: {
  time: "Canh hai",
  lines: [
    "Câu luôn hiện.",
    { if: "sigh", text: "Chỉ hiện nếu đêm nay có hồn ma thở dài." },
    { unless: "sigh", text: "Hiện khi chưa có." },
  ],
  choices: [
    { label: "…", delta: 1, next: "m5" },
    { label: "…", delta: 0, next: "m5", emit: "chime" },                     // người khác nghe thấy ngay
    { label: "…", delta: 1, next: "m5", trace: { kind: "offering", variant: 0 } }, // để lại dấu vết
  ],
},
```

Thêm loại dấu vết mới thì sửa ở hai chỗ: `TRACE_TEXT` trong `story.js` và `TRACE_KINDS` trong `server.js`.

## Hướng phát triển

- Thêm ngày khất thực (đi từng nhà) và cảnh nhà hoang.
- Phòng riêng theo mã, để một nhóm bạn chơi cùng một đêm.
- Deploy lên Render / Fly / VPS. SSE chạy ổn sau Nginx nếu tắt buffering (`proxy_buffering off`).
- Nhờ một vị thầy duyệt lời văn về hạnh đầu đà.


## Thêm trên branch `experiment/qls-ideas`

- **Nhìn quanh và bản đồ:** kéo màn hình để nhìn chỗ khác, nút *Bản đồ* để chạm xem một vùng. Tầm nhìn khác nhau theo vai (`LOOK_RANGE` trong `app.js`).
- **Vật bị bỏ quên** (`FINDS` trong `story.js`): đốm sáng nhỏ trên đất, chạm để đi tới và mở một thẻ ngắn. Một số mảnh là manh mối về cô bé Hạnh, giữ lại qua các đêm (`localStorage`). Ghép đủ 5 mảnh thì mở thêm đoạn kết.
- **Ký ức qua các đêm:** lựa chọn có `remember: "khóa"` được nhớ lại, và dòng truyện có `ifv` / `unlessv` đọc lại nó ở đêm sau.
- **Buổi sáng khất thực** (nhà sư), **nhà hoang** ở rìa nghĩa địa, ma ngẫu nhiên ban đêm, cú, quạ, chó sủa xa.
- Dấu vết mới giữa người chơi: `keepsake` (món đồ cũ), `lamp` (đèn nhỏ), `bowl`. Thêm loại mới thì sửa `TRACE_TEXT` và `TRACE_KINDS`.

### Chế độ phát triển

Mở `http://localhost:3000/?dev` sẽ có nút **DEV** ở góc dưới trái: ép giờ trong ngày (sáng sớm, chiều tàn, canh ba...), đổi vai, nhảy tới một cảnh bất kỳ, mở khóa hết vai và manh mối, hiện hết vật bị bỏ quên, gọi thử cú, quạ, chó, gà và cảnh nhà hoang. Không có `?dev` thì panel không xuất hiện.

### Tịnh thất và kinh

Gõ cửa tịnh thất (đốm sáng ở sân) rồi bước vào: kệ sách có 6 cuốn (`HERMIT_BOOKS` trong `story.js`): Chuyển Pháp Luân, Vô Ngã Tướng, Tứ Niệm Xứ, Kinh Từ Bi, Kinh Kālāma, Mười Ba Hạnh Đầu Đà. Đọc mỗi cuốn làm lòng lắng xuống một lần mỗi đêm, và game nhớ cuốn nào đã đọc.

Nội dung là **tóm lược theo ý kinh bằng lời của game, không phải bản dịch**, vì các bản dịch hiện đại có bản quyền. **Chưa được vị thầy Theravāda duyệt**, cần duyệt trước khi phát hành rộng.

### Màu tâm

Vòng tròn cạnh tên vai ở góc trên trái thể hiện tâm trạng: đen (sân) → đỏ (tham, chấp) → xám cam (mê mờ) → vàng (tín, hoan hỷ) → trắng như ánh trăng (sáng, thấy rõ). Nhà sư bắt đầu ở màu vàng, hồn ma ở màu đỏ (hồn ma càng buông, màu càng sáng). Lựa chọn xấu làm màu tối đi tạm thời, đọc kinh, đảnh lễ, ngồi quan sát làm màu sáng lên rồi dần trở về mức nền. Người khác thấy màu này như một quầng sáng quanh nhân vật. Ý tưởng mượn từ cách Thanh Tịnh Đạo ví màu máu ở tim của người nặng về tham, sân, si, tín, tuệ. Chưa được thầy Theravāda duyệt.

### Hình ảnh

`public/images/buddha.webp` là hình tượng Đức Phật do người làm game cung cấp (nền trong suốt, đã đổi cỡ 900px). **Cần xác nhận quyền sử dụng hình này trước khi phát hành công khai.** Nếu không dùng được, game tự quay về hình vẽ bằng code trong `public/buddha.js`.

### Khám phá tự do

Bấm *Đi dạo* trong khung truyện, hoặc thu khung truyện rồi chạm xuống đất, để đi tự do. Nút *Nhiệm vụ* cho biết việc đang chờ và đưa nhân vật về đó. Trên *Bản đồ*, chạm một chỗ để chọn rồi *Nhìn sang đó* hoặc *Đi tới đó*. Nhà sư khi tâm xao động sẽ được gợi ý về tịnh thất đọc kinh rồi quay lại.
