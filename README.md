# Một Đêm Đầu Đà — 3D

Trải nghiệm web nhiều người chơi: một đêm ở nghĩa địa đầu làng, nhìn qua ba đôi mắt. Khung cảnh, nhân vật và các tư thế được dựng bằng Three.js/WebGL 2, thay cho phần vẽ Canvas 2D.

- **Nhà sư** — thầy Tịnh. Thang đo: *Tâm an*.
- **Hồn ma** — bà Sáu bán xôi. Thang đo: *Chấp*, càng thấp càng nhẹ.
- **Người dân** — ông Tư đầu xóm. Thang đo: *Lòng tin*.

Chơi đủ ba vai sẽ mở đoạn kết thật. Đây là mô phỏng để chiêm nghiệm, không phải hướng dẫn thực hành tôn giáo.

## Chạy

Cần Node 18 trở lên; không cần `npm install` hay công cụ build.

```bash
cd /Users/gonton/Tech/Game/Dhutanga
npm start          # http://localhost:3000
PORT=8080 npm start
npm test           # kiểm tra API và đồng bộ tư thế
```

Mở nhiều tab hoặc cho thiết bị cùng mạng LAN truy cập `http://<IP-máy-bạn>:3000` để chơi cùng nhau. Trình duyệt cần hỗ trợ WebGL 2 và bật tăng tốc đồ họa. Thư viện Three.js 0.180.0 được lưu trong `public/vendor/`; game không tải thư viện 3D từ CDN khi chạy. Phông chữ Google Fonts là tùy chọn, có phông hệ thống thay thế.

## Góc nhìn và di chuyển

- **Kéo** trên khung cảnh để xoay quanh nhân vật.
- **Cuộn chuột / chụm hai ngón** để thu phóng.
- **Chạm đất** để đi tới vị trí đó. Kéo xoay góc nhìn không làm nhân vật di chuyển.
- Các nút **↶ / ↷ / + / − / ⌖** hỗ trợ xoay, thu phóng và đặt lại góc nhìn bằng bàn phím hoặc chuột.
- Nút **Đi tới** dẫn nhân vật đến địa điểm tiếp theo của câu chuyện. Khi tới nơi, khung truyện mở. Chạm cảnh để thu khung truyện, hoặc bấm thanh tiêu đề để mở lại.

## Menu hành động của nhà sư

Mỗi nút có hình chụp từ chính mô hình 3D đang dùng trong cảnh:

| Hành động | Tư thế và chuyển động |
|---|---|
| Ngồi thiền | Ngồi xếp bằng, tay đặt trong lòng, chuyển động thở nhẹ |
| Đi kinh hành | Đi bộ qua lại một đoạn ngắn; có thể chạm đất để chọn hướng đi |
| Ngủ ngồi | Giữ tư thế ngồi, khép mắt, đầu hơi cúi |
| Thọ thực | Ngồi ôm bát, đưa thìa lên theo nhịp chậm |

Chọn một hành động sẽ tạm thu câu chuyện để quan sát nhân vật. Các tư thế ngồi dừng di chuyển ngay. Bấm **Về câu chuyện** để tiếp tục; tiến độ truyện được giữ trong lượt chơi. Hành trì tự do không tự tăng điểm hoặc thay đổi kết thúc. Những người đang chơi cùng thấy tư thế và vị trí được đồng bộ.

## Nhiều người chơi

`/events` dùng Server-Sent Events để đồng bộ:

- `presence`: người chơi, vai, vị trí và tư thế.
- `moment` qua `/api/emit`: tiếng chuông, tiếng thở dài, đèn lồng.
- `effect` qua `/api/effect`: hành động trong truyện như thí thực, hồi hướng hoặc thắp nhang, tác động trực tiếp tới người đang kết nối.

Không có bảng lịch sử hoạt động hoặc cơ chế lưu hoạt động xuống máy chủ. Hành động không được phát lại cho người vào sau. Các sự kiện đã nghe chỉ ảnh hưởng tới lượt chơi hiện tại. Trạng thái hoàn thành ba vai được lưu trong `localStorage` của trình duyệt.

## Cấu trúc

```text
server.js             static + SSE + API, không phụ thuộc gói ngoài
public/index.html     giao diện và import map
public/style.css      bố cục điện thoại và máy tính
public/world.js       thế giới 3D, camera, di chuyển, người chơi và ảnh menu
public/character.js   mô hình nhân vật, khớp và bốn tư thế nhà sư
public/story.js       lời văn, địa điểm, lựa chọn và kết thúc
public/audio.js       âm thanh môi trường bằng Web Audio
public/app.js         engine truyện, menu hành động và kết nối realtime
public/vendor/        Three.js, OrbitControls và giấy phép MIT
test/server.test.js   kiểm tra giao thức và các tệp phục vụ cho cảnh 3D
```

Nhân vật hiện là mô hình dựng bằng hình học với hoạt ảnh khớp, không phải mô hình quét người thật hay motion capture. Có thể nâng độ chân thực tiếp bằng mô hình GLB có rig và hoạt ảnh chuyên nghiệp.

## Viết thêm cảnh

```js
m4: {
  time: "Canh hai",
  place: "graves",
  pose: "sit",
  lines: [
    "Câu luôn hiện.",
    { if: "sigh", text: "Hiện khi nghe hồn ma thở dài trong lượt chơi." },
    { unless: "sigh", text: "Hiện khi chưa nghe." },
  ],
  choices: [
    { label: "…", delta: 1, next: "m5" },
    { label: "…", delta: 0, next: "m5", emit: "chime" },
    { label: "…", delta: 1, next: "m5", effect: "offering" },
  ],
},
```

Địa điểm nằm trong `World.PLACES`: `gate`, `bamboo`, `graves`, `gao`. Khi thêm hiệu ứng truyện, khai báo quyền theo vai trong `EFFECT_KINDS` ở `server.js` và phần biểu diễn tương ứng nếu cần trong `world.js`.
