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
