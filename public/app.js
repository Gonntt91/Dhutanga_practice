import "./world.js";

// Role picker, place-driven story, monk actions and live multiplayer presence.
(() => {
  const ARRIVE_DIST = 46;
  const STORE_KEY = "dhutanga.completed";
  const ACTIONS = {
    sit: { label: "Ngồi thiền", status: "Đang ngồi thiền", description: "Ngồi vững, thả lỏng vai. Nhẹ nhàng trở về với hơi thở." },
    walk: { label: "Đi kinh hành", status: "Đang đi kinh hành", description: "Bước đi thong thả, biết rõ từng bước chân chạm đất." },
    sleep: { label: "Ngủ ngồi", status: "Đang ngủ ngồi", description: "Khép mắt, nghỉ trong tư thế ngồi, giữ thân không nằm xuống." },
    eat: { label: "Thọ thực", status: "Đang thọ thực", description: "Nâng bát, dùng từng miếng chậm rãi trong sự biết ơn." },
  };
  const DARKNESS = {
    "Chiều tàn": 0.42, "Chạng vạng": 0.6, "Đầu hôm": 0.72, "Canh hai": 0.84,
    "Canh ba": 0.9, "Canh tư": 0.82, "Gà gáy": 0.68, "Rạng sáng": 0.45,
  };

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };

  const state = {
    pid: makeId(),
    connected: false,
    role: null,
    sceneId: null,
    sceneOpen: false,
    action: "walk",
    practicing: false,
    meter: 0,
    nick: "",
    peers: [],
    liveFlags: new Set(),
    soundOn: false,
    lastGesture: 0,
    lastSent: { t: 0, x: -1, y: -1, key: "" },
    completed: loadCompleted(),
  };

  function makeId() {
    try { return crypto.randomUUID(); } catch { return "p" + Math.random().toString(36).slice(2) + Date.now().toString(36); }
  }
  function loadCompleted() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch { return {}; }
  }
  function saveCompleted() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.completed)); } catch {}
  }

  const currentScene = () => (state.role ? STORY[state.role].scenes[state.sceneId] : null);
  const currentPose = () => {
    if (state.role === "monk") return state.action;
    const sc = currentScene();
    return sc && state.sceneOpen && sc.pose === "sit" ? "sit" : null;
  };

  // ---------- network ----------
  function post(url, body) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pid: state.pid, ...body }),
    }).then((r) => r.json().catch(() => ({}))).catch(() => ({ error: "offline" }));
  }

  function sendPresence(force) {
    if (!state.connected) return;
    const p = World.getPlayer();
    const key = `${state.role}|${state.sceneId}|${currentPose()}|${state.nick}`;
    const now = Date.now();
    const movedEnough = Math.abs(p.nx - state.lastSent.x) > 0.004 || Math.abs(p.ny - state.lastSent.y) > 0.002;
    if (!force && key === state.lastSent.key && (!movedEnough || now - state.lastSent.t < 350)) return;
    state.lastSent = { t: now, x: p.nx, y: p.ny, key };
    post("/api/presence", {
      role: state.role, scene: state.sceneId, nick: state.nick,
      x: state.role ? p.nx : 0.5, y: state.role ? p.ny : 0.99, pose: currentPose(),
    });
  }

  function connect() {
    const es = new EventSource("/events?pid=" + encodeURIComponent(state.pid));
    es.addEventListener("init", (e) => {
      const data = JSON.parse(e.data);
      state.connected = true;
      state.peers = data.peers;
      sendPresence(true);
      onPeers();
    });
    es.addEventListener("peers", (e) => {
      state.peers = JSON.parse(e.data);
      onPeers();
    });
    es.addEventListener("effect", (e) => {
      const effect = JSON.parse(e.data);
      state.liveFlags.add(effect.kind);
      pushView();
      if (state.sceneOpen && !currentScene().end) renderScene();
    });
    es.addEventListener("moment", (e) => onMoment(JSON.parse(e.data)));
    es.onerror = () => {
      state.connected = false;
      $("presence-count").textContent = "Mất kết nối, đang thử lại…";
    };
  }

  // ---------- flags: what other players did tonight ----------
  const flags = () => new Set(state.liveFlags);
  const passes = (item, f) => (!item.if || f.has(item.if)) && (!item.unless || !f.has(item.unless));

  function pushView() {
    const sc = currentScene();
    World.setView({
      role: state.role,
      pose: currentPose(),
      darkness: sc ? DARKNESS[sc.time] ?? 0.8 : 0.78,
      flags: flags(),
      marker: sc && !state.sceneOpen && !state.practicing ? sc.place : null,
      anchor: state.practicing ? 0.38 : state.sceneOpen && !$("sheet").classList.contains("collapsed") ? 0.24 : 0.38,
    });
  }

  // ---------- presence ----------
  function onPeers() {
    const others = state.peers.filter((p) => p.pid !== state.pid && p.role);
    World.setOthers(others);
    const total = state.peers.length - 1;
    const counts = { monk: 0, ghost: 0, villager: 0 };
    others.forEach((p) => counts[p.role]++);
    const parts = [];
    if (counts.monk) parts.push(`${counts.monk} nhà sư`);
    if (counts.ghost) parts.push(`${counts.ghost} hồn ma`);
    if (counts.villager) parts.push(`${counts.villager} người dân`);
    $("presence-count").textContent = total <= 0
      ? "Bạn đang ở đây một mình"
      : parts.length ? `Đêm nay có ${parts.join(", ")}` : `${total} người đang xem`;
  }

  const MOMENT_TEXT = {
    chime: "Có tiếng chuông nhỏ vang lên đâu đó giữa các ngôi mộ.",
    sigh: "Có tiếng thở dài, rất gần, mà không thấy ai.",
    lantern: "Một đốm đèn lồng lay động sau bụi tre.",
  };

  let toastTimer = null;
  function toast(text) {
    const t = $("toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3800);
  }

  function onMoment(m) {
    World.ripple(m.x ?? 0.5, m.y ?? 0.5, m.topic);
    if (state.soundOn) {
      if (m.topic === "chime") NightAudio.bell(m.from === state.pid ? 1 : 0.7);
      if (m.topic === "sigh") NightAudio.sigh();
    }
    state.liveFlags.add(m.topic);
    pushView();
    if (m.from === state.pid) return;
    toast(MOMENT_TEXT[m.topic]);
    if (state.sceneOpen) {
      $("whispers").appendChild(el("p", null, MOMENT_TEXT[m.topic]));
      while ($("whispers").children.length > 2) $("whispers").firstChild.remove();
    }
  }

  function shareEffect(kind) {
    state.liveFlags.add(kind);
    pushView();
    post("/api/effect", { kind });
  }

  // ---------- monk action menu ----------
  function buildActions() {
    for (const [pose, info] of Object.entries(ACTIONS)) {
      const button = el("button", "action-card");
      button.type = "button";
      button.dataset.action = pose;
      button.setAttribute("aria-pressed", "false");
      const image = el("img", "action-image");
      image.src = World.getPoseImage(pose);
      image.alt = { sit: "Nhà sư ngồi xếp bằng, tay đặt trong lòng", walk: "Nhà sư đi bộ chân trần", sleep: "Nhà sư nhắm mắt, đầu hơi cúi trong tư thế ngồi", eat: "Nhà sư ngồi nâng bát và dùng thìa thọ thực" }[pose];
      image.width = 120; image.height = 120;
      const title = el("span", "action-title", info.label);
      button.append(image, title, el("span", "action-dot"));
      button.addEventListener("click", () => selectAction(pose));
      $("action-list").appendChild(button);
    }
  }

  function renderActions() {
    const visible = state.role === "monk";
    $("monk-actions").hidden = !visible;
    $("camera-hint").hidden = !state.role;
    if (!visible) return;
    $("app").dataset.action = state.action;
    for (const button of $("action-list").children) button.setAttribute("aria-pressed", String(button.dataset.action === state.action));
    const info = ACTIONS[state.action];
    const status = state.action === "walk" && !World.getPlayer().moving ? "Sẵn sàng kinh hành" : info.status;
    if ($("action-status").textContent !== status) $("action-status").textContent = status;
    $("action-description").textContent = info.description;
    $("resume-story").hidden = !state.practicing;
  }

  function selectAction(pose, destination) {
    if (state.role !== "monk" || !ACTIONS[pose]) return;
    state.practicing = true;
    state.action = pose;
    World.stop();
    if (pose !== "walk") World.faceCamera();
    if (pose === "walk") {
      if (destination) World.walkTo(destination.x, destination.y);
      else World.startWalking();
    }
    $("sheet").hidden = true;
    $("walk-bar").hidden = true;
    pushView();
    renderActions();
    sendPresence(true);
  }

  function resumeStory() {
    state.practicing = false;
    World.stop();
    showWalkOrScene();
    sendPresence(true);
  }

  // ---------- picker ----------
  function renderPicker() {
    $("picker").hidden = false;
    $("sheet").hidden = true;
    $("walk-bar").hidden = true;
    $("role-chip").hidden = true;
    $("monk-actions").hidden = true;
    $("camera-hint").hidden = true;
    delete $("app").dataset.role;
    const list = $("role-list");
    list.replaceChildren();
    for (const role of Object.keys(ROLE_INFO)) {
      const info = ROLE_INFO[role];
      const card = el("button", "role-card");
      card.type = "button";
      card.dataset.role = role;
      const glyph = el("div", "glyph");
      glyph.appendChild(el("span"));
      card.append(glyph, el("div", "rc-name", info.name), el("div", "rc-who", info.who), el("div", "rc-blurb", info.blurb));
      if (state.completed[role]) card.appendChild(el("div", "rc-done", "Đã đi qua đêm này"));
      card.addEventListener("click", () => startRole(role));
      list.appendChild(card);
    }
    pushView();
  }

  function startRole(role) {
    state.nick = $("nick").value.replace(/\s+/g, " ").trim().slice(0, 24);
    state.role = role;
    state.sceneId = STORY[role].start;
    state.sceneOpen = false;
    state.practicing = false;
    state.action = "walk";
    state.meter = STORY[role].meterStart;
    state.liveFlags.clear();
    $("whispers").replaceChildren();
    if (!state.soundOn) toggleSound(true);
    $("picker").hidden = true;
    $("app").dataset.role = role;
    $("role-chip").hidden = false;
    $("role-chip").textContent = ROLE_INFO[role].name;
    $("meter-name").textContent = ROLE_INFO[role].meter;
    $("gesture").textContent = ROLE_INFO[role].gesture.label;
    $("gesture-walk").textContent = ROLE_INFO[role].gesture.label;
    const spawn = World.SPAWN[role];
    World.setPlayer(spawn.x, spawn.y);
    pushView();
    sendPresence(true);
    showWalkOrScene();
    renderActions();
  }

  function leaveRole() {
    state.role = null;
    state.sceneId = null;
    state.sceneOpen = false;
    state.practicing = false;
    World.stop();
    sendPresence(true);
    renderPicker();
  }

  // ---------- place-driven flow ----------
  function distanceToPlace() {
    const sc = currentScene();
    if (!sc) return Infinity;
    const place = World.PLACES[sc.place];
    const p = World.getPlayer();
    return Math.hypot(p.x - place.x, p.y - place.y);
  }

  function showWalkOrScene() {
    if (distanceToPlace() <= ARRIVE_DIST) return openScene();
    state.sceneOpen = false;
    state.action = "walk";
    const sc = currentScene();
    $("sheet").hidden = true;
    $("walk-bar").hidden = false;
    $("walk-time").textContent = sc.time;
    $("walk-text").textContent = `Đi tới ${World.PLACES[sc.place].name}`;
    pushView();
    renderActions();
  }

  function openScene() {
    state.sceneOpen = true;
    World.stop();
    state.action = currentScene().pose === "sit" ? "sit" : "walk";
    $("walk-bar").hidden = true;
    $("sheet").hidden = false;
    setCollapsed(false);
    renderScene();
    pushView();
    sendPresence(true);
    renderActions();
  }

  function setCollapsed(collapsed) {
    $("sheet").classList.toggle("collapsed", collapsed);
    $("sheet-handle").setAttribute("aria-expanded", String(!collapsed));
    pushView();
  }

  // ---------- story ----------
  function renderMeter() {
    $("meter-fill").style.width = (state.meter / 10) * 100 + "%";
    $("meter").setAttribute("aria-label", `${ROLE_INFO[state.role].meter}: ${state.meter} trên 10`);
  }

  function renderScene() {
    const scene = currentScene();
    const f = flags();
    $("time-label").textContent = scene.time;
    renderMeter();
    const lines = $("lines");
    lines.replaceChildren();
    const choices = $("choices");
    choices.replaceChildren();
    $("sheet-body").scrollTop = 0;

    if (scene.end) return renderEnding(scene);

    let i = 0;
    for (const line of scene.lines) {
      const item = typeof line === "string" ? { text: line } : line;
      if (!passes(item, f)) continue;
      const p = el("p", item.if ? "shared" : null, item.text);
      p.style.animationDelay = i++ * 0.3 + "s";
      lines.appendChild(p);
    }
    for (const c of scene.choices) {
      if (!passes(c, f)) continue;
      const b = el("button", "choice", c.label);
      b.type = "button";
      if (c.effect) b.appendChild(el("span", "tag", "Tác động đến người đang chơi"));
      else if (c.emit) b.appendChild(el("span", "tag", "Người khác sẽ nghe thấy"));
      b.addEventListener("click", () => choose(c));
      choices.appendChild(b);
    }
  }

  function choose(c) {
    state.meter = Math.max(0, Math.min(10, state.meter + (c.delta || 0)));
    if (c.effect) shareEffect(c.effect);
    if (c.emit) gesture(c.emit, true);
    state.sceneId = c.next;
    $("whispers").replaceChildren();
    showWalkOrScene();
    sendPresence(true);
  }

  function renderEnding(scene) {
    const ending = scene.endings.find((e) => state.meter <= e.max) || scene.endings[scene.endings.length - 1];
    const lines = $("lines");
    lines.appendChild(el("p", "ending", ending.text));
    if (ending.effect) shareEffect(ending.effect);
    state.completed[state.role] = true;
    saveCompleted();
    const roles = ["monk", "ghost", "villager"];
    if (roles.every((r) => state.completed[r])) {
      const box = el("div", "true-ending");
      TRUE_ENDING.forEach((t) => box.appendChild(el("p", null, t)));
      lines.appendChild(box);
    } else {
      const left = roles.filter((r) => !state.completed[r]).map((r) => ROLE_INFO[r].name.toLowerCase());
      lines.appendChild(el("p", "left-hint", `Còn ${left.join(" và ")} chưa đi qua đêm này. Mỗi đôi mắt thấy một phần khác.`));
    }
    const again = el("button", "choice", "Chọn một vai khác");
    again.type = "button";
    again.addEventListener("click", leaveRole);
    $("choices").appendChild(again);
  }

  // ---------- gestures & sound ----------
  async function gesture(topic, fromChoice) {
    const now = Date.now();
    if (!fromChoice && now - state.lastGesture < 4000) return;
    state.lastGesture = now;
    for (const id of ["gesture", "gesture-walk"]) {
      $(id).disabled = true;
      setTimeout(() => ($(id).disabled = false), 4000);
    }
    sendPresence(true);
    const res = await post("/api/emit", { topic });
    if (res.error && !state.connected) {
      const p = World.getPlayer();
      World.ripple(p.nx, p.ny, topic);
    }
  }

  function toggleSound(force) {
    state.soundOn = typeof force === "boolean" ? force : !state.soundOn;
    if (state.soundOn) NightAudio.start(); else NightAudio.stop();
    const btn = $("sound-toggle");
    btn.setAttribute("aria-pressed", String(state.soundOn));
    btn.setAttribute("aria-label", state.soundOn ? "Tắt âm thanh" : "Bật âm thanh");
  }

  // ---------- boot ----------
  try { World.init($("world"), (x, y) => {
    if (!state.role) return;
    if (state.sceneOpen && !state.practicing && !$("sheet").classList.contains("collapsed")) {
      // tapping the world while reading folds the sheet so the scene is visible
      setCollapsed(true);
      return;
    }
    if (state.role === "monk") selectAction("walk", { x, y });
    else World.walkTo(x, y);
  }); } catch (error) {
    console.error("Không thể khởi tạo cảnh 3D:", error);
    $("world-error").hidden = false;
    return;
  }
  buildActions();

  $("walk-btn").addEventListener("click", () => {
    const sc = currentScene();
    if (!sc) return;
    const place = World.PLACES[sc.place];
    state.practicing = false;
    state.action = "walk";
    World.walkTo(place.x, place.y + 6);
    pushView();
    renderActions();
    sendPresence(true);
  });
  $("sheet-handle").addEventListener("click", () => setCollapsed(!$("sheet").classList.contains("collapsed")));
  $("sound-toggle").addEventListener("click", () => toggleSound());
  const roleGesture = () => state.role && gesture(ROLE_INFO[state.role].gesture.topic, false);
  $("gesture").addEventListener("click", roleGesture);
  $("gesture-walk").addEventListener("click", roleGesture);
  $("leave").addEventListener("click", leaveRole);
  $("resume-story").addEventListener("click", resumeStory);
  $("camera-left").addEventListener("click", () => World.rotateCamera(-1));
  $("camera-right").addEventListener("click", () => World.rotateCamera(1));
  $("camera-closer").addEventListener("click", () => World.zoomCamera(0.8));
  $("camera-farther").addEventListener("click", () => World.zoomCamera(1.25));
  $("camera-reset").addEventListener("click", () => World.resetCamera());

  // arrival + presence loop
  setInterval(() => {
    if (state.role && !state.practicing && !state.sceneOpen && distanceToPlace() <= ARRIVE_DIST) openScene();
    if (state.role === "monk") renderActions();
    sendPresence(false);
  }, 200);

  renderPicker();
  connect();
})();
