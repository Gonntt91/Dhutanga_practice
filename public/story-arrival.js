// The player's own first nights ("player_arrival"): short, neutral scenes for a character who has a name of their own.
// Sư Tịnh, Ông Tư and Bà Sáu are NPCs the player may meet, never the player (docs/player-character-narrative-model.md).
// PLACEHOLDER CONTENT: written to make the new flow playable; the owner will rewrite the wording.
// Chapters (chapters.js): pa = the first night, pb = every ordinary night after it.
// Voice: "bạn", one or two short lines, then one small choice. Meter meaning as in story.js:
// monk "Tâm an" and villager "Lòng tin" high = good, ghost "Chấp" LOW = lighter, so the ghost endings run the other way.

Object.assign(STORY.monk.scenes, {
  pa_0: {
    time: "Chiều tàn",
    place: "gate",
    lines: [
      "Bạn tới cổng nghĩa địa khi nắng vừa tắt. Chiếc bát trong tay còn ấm hơi cơm dân làng mới cho.",
      "Xa xa có tiếng chuông nhỏ từ tịnh thất. Đêm nay chưa ai giao việc gì cho bạn.",
    ],
    choices: [
      { label: "Đi một vòng giữa các ngôi mộ", delta: 1, next: "pa_end" },
      { label: "Ngồi lại ở cổng, nhìn trời tối dần", delta: 0, next: "pa_end" },
    ],
  },
  pa_end: {
    time: "Rạng sáng",
    place: "graves", pose: "sit",
    end: true,
    endings: [
      { max: 4, text: "Đêm đầu tiên trôi qua bằng những bước chân còn lạ. Không sao. Mai bạn sẽ quen đường hơn." },
      { max: 6, text: "Đêm yên. Bạn nghe gió, nghe chuông, và biết mình đã đặt chân đúng nơi." },
      { max: 10, text: "Trời hửng, bạn thấy lòng nhẹ như sương trên cỏ. Chuyện của làng này còn dài, và bạn mới bắt đầu." },
    ],
  },
  pb_0: {
    time: "Chạng vạng",
    place: "hermitage",
    lines: [
      "Đêm nay trời quang. Bạn ngồi dưới hiên tịnh thất, nghe sư già gõ mõ ở đằng xa.",
    ],
    choices: [
      { label: "Đi kinh hành vài vòng", delta: 1, next: "pb_end" },
      { label: "Ngồi yên một lát", delta: 0, next: "pb_end" },
    ],
  },
  pb_end: {
    time: "Rạng sáng",
    place: "hermitage", pose: "sit",
    end: true,
    endings: [
      { max: 4, text: "Đêm nay tâm bạn hơi bận. Không sao, cái gì đến rồi cũng sẽ đi." },
      { max: 6, text: "Một đêm bình thường. Bạn thấy bình thường cũng là một món quà." },
      { max: 10, text: "Rạng sáng. Chim đầu tiên kêu khi bạn mở mắt, lòng yên như mặt ao không gió." },
    ],
  },
});

Object.assign(STORY.villager.scenes, {
  pa_0: {
    time: "Chiều tàn",
    place: "village",
    lines: [
      "Bạn mới về ở làng. Hàng xóm chỉ cho bạn cái giếng đầu ngõ, bảo ngõ này tối sớm lắm.",
      "Có người nhắc: ngoài nghĩa địa dạo này có vị sư ở lại. Ai cũng tò mò, chưa ai dám hỏi.",
    ],
    choices: [
      { label: "Ra giếng làm quen với mọi người", delta: 1, next: "pa_end" },
      { label: "Về nhà trước, mai tính", delta: 0, next: "pa_end" },
    ],
  },
  pa_end: {
    time: "Rạng sáng",
    place: "village",
    end: true,
    endings: [
      { max: 4, text: "Đêm đầu ở làng mới hơi lạ giường. Mai chắc sẽ khác." },
      { max: 6, text: "Một đêm yên. Bạn nằm nghe tiếng dế và nghĩ: ở đây cũng được." },
      { max: 10, text: "Sáng ra đã có người chào bạn ngoài ngõ. Làng này đã bắt đầu quen mặt bạn." },
    ],
  },
  pb_0: {
    time: "Chạng vạng",
    place: "village",
    lines: [
      "Cơm xong, bạn ra hiên. Trăng lên sau rặng tre, con chó nhà ai nằm dưới ngõ.",
    ],
    choices: [
      { label: "Đi dạo ra giếng", delta: 1, next: "pb_end" },
      { label: "Ngồi hóng mát thêm chút nữa", delta: 0, next: "pb_end" },
    ],
  },
  pb_end: {
    time: "Rạng sáng",
    place: "village",
    end: true,
    endings: [
      { max: 4, text: "Một đêm nhiều nghĩ ngợi. Sáng ra bạn thấy nhẹ hơn một chút." },
      { max: 6, text: "Đêm êm. Chẳng có gì xảy ra, và thế là đủ." },
      { max: 10, text: "Gà gáy, bạn thức dậy với lòng nhẹ. Hôm nay chắc sẽ có chuyện nhỏ vui vui." },
    ],
  },
});

Object.assign(STORY.ghost.scenes, {
  pa_0: {
    time: "Chạng vạng",
    place: "graves",
    lines: [
      "Bạn nhận ra mình đang đứng giữa các ngôi mộ, không nhớ đã đến đây từ bao giờ.",
      "Gió lướt qua mà không chạm vào bạn. Ở đâu đó có tiếng chuông rất nhỏ.",
    ],
    choices: [
      { label: "Lắng nghe tiếng chuông", delta: -1, next: "pa_end" },
      { label: "Ngắm quanh nghĩa địa trước", delta: 0, next: "pa_end" },
    ],
  },
  pa_end: {
    time: "Rạng sáng",
    place: "graves",
    end: true,
    endings: [
      { max: 3, text: "Đêm đầu tiên nhẹ hơn bạn tưởng. Tiếng chuông vẫn còn đọng đâu đó." },
      { max: 6, text: "Bạn đi hết đêm mà không biết mình tìm gì. Không sao. Chỗ này còn nhiều điều để nhìn." },
      { max: 10, text: "Trời sáng, bạn vẫn còn đứng đó. Có điều gì đó giữ bạn lại, và bạn chưa biết là gì." },
    ],
  },
  pb_0: {
    time: "Chạng vạng",
    place: "graves",
    lines: [
      "Trăng lên. Bóng bạn đổ lên bia đá cũ, nhạt như hơi thở.",
    ],
    choices: [
      { label: "Lượn qua rặng tre", delta: -1, next: "pb_end" },
      { label: "Ở lại nghe gió", delta: 0, next: "pb_end" },
    ],
  },
  pb_end: {
    time: "Rạng sáng",
    place: "graves",
    end: true,
    endings: [
      { max: 3, text: "Đêm nay bạn thấy mình nhẹ, như một làn khói nghe được tiếng dế." },
      { max: 6, text: "Một đêm lặng. Bạn ngắm trăng lặn và không đòi hỏi gì hơn." },
      { max: 10, text: "Gần sáng, bạn vẫn còn nặng một điều chưa gọi được tên. Mai bạn sẽ thử lại." },
    ],
  },
});
