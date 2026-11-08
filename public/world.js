import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { createMonk, createGhost } from "./character.js";
import { mergeGeometries } from "./vendor/BufferGeometryUtils.js";
import { FABRIC_PIECES } from "./fabric.js";

// Story coordinates stay compatible; 25 units in the story = 1 metre in 3D.
window.World = (() => {
  const W = 400, H = 2000;
  const PLACES = {
    gate: { x: 200, y: 1850, name: "Cổng nghĩa địa" },
    bamboo: { x: 95, y: 1490, name: "Bụi tre" },
    graves: { x: 222, y: 1065, name: "Giữa các ngôi mộ" },
    gao: { x: 150, y: 625, name: "Gốc cây gạo" },
  };
  const SPAWN = { monk: { x: 205, y: 1950 }, ghost: { x: 160, y: 650 }, villager: { x: 172, y: 1965 } };
  const PATH = [[198, 2300], [200, 2000], [208, 1840], [168, 1660], [150, 1500], [195, 1320], [240, 1150], [226, 980], [175, 800], [152, 640], [186, 440], [200, 270]];
  const player = { ...SPAWN.monk, tx: null, ty: null, moving: false, facing: Math.PI, phase: 0 };
  const view = { role: null, pose: "walk", darkness: 0.75, flags: new Set(), marker: null, anchor: 0.4 };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const others = new Map(), ripples = [], bamboo = [], previews = new Map(), scraps = new Map();
  let renderer, scene, camera, controls, canvas, ground, actor, marker, moon, ambient, warmth;
  let offering, incense, fireflies, labels, destinationLabel, fabricLabel, onTap;
  let width = 1, height = 1, time = 0, last = 0, patrol = null, seed = 87612, contextLost = false;
  const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
  const target = new THREE.Vector3(), delta = new THREE.Vector3();
  const to3D = (x, y, lift = 0) => new THREE.Vector3((x - W / 2) / 25, lift, (y - H / 2) / 25);
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const stone = new THREE.MeshStandardMaterial({ color: 0x858a7b, roughness: 1 });
  const oldStone = new THREE.MeshStandardMaterial({ color: 0x626d60, roughness: 1 });
  const earth = new THREE.MeshStandardMaterial({ color: 0x363c2b, roughness: 1 });
  const bark = new THREE.MeshStandardMaterial({ color: 0x3c362b, roughness: 1 });
  const leaves = new THREE.MeshStandardMaterial({ color: 0x263c2b, roughness: 1 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x465c35, roughness: 0.87 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x554940, roughness: 1 });
  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const unitSphere = new THREE.SphereGeometry(1, 12, 8);
  const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 9);

  function add(geometry, material, parent, x, y, z, sx = 1, sy = 1, sz = 1) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z); object.scale.set(sx, sy, sz);
    object.castShadow = true; object.receiveShadow = true; parent.add(object); return object;
  }
  function pole(parent, from, to, radius, material) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const object = add(unitCylinder, material, parent, 0, 0, 0, radius, a.distanceTo(b), radius);
    object.position.copy(a).add(b).multiplyScalar(0.5);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize()); return object;
  }
  function noiseTexture(base, size = 128) {
    const bytes = new Uint8Array(size * size * 4), color = new THREE.Color(base);
    for (let i = 0; i < size * size; i++) {
      const x = i % size, y = Math.floor(i / size);
      const n = 0.73 + random() * 0.35 + Math.sin(x * 0.22) * Math.cos(y * 0.17) * 0.07;
      for (let c = 0; c < 3; c++) bytes[i * 4 + c] = Math.min(255, [color.r, color.g, color.b][c] * n * 255);
      bytes[i * 4 + 3] = 255;
    }
    const texture = new THREE.DataTexture(bytes, size, size);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true; texture.needsUpdate = true; return texture;
  }
  function distanceToPath(x, y) {
    let d = Infinity;
    for (let i = 0; i < PATH.length - 1; i++) {
      const [ax, ay] = PATH[i], [bx, by] = PATH[i + 1], dx = bx - ax, dy = by - ay;
      const t = THREE.MathUtils.clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy), 0, 1);
      d = Math.min(d, Math.hypot(x - ax - dx * t, y - ay - dy * t));
    }
    return d;
  }
  function makeTerrain() {
    const soil = noiseTexture(0xa8a690); soil.repeat.set(24, 65);
    ground = add(new THREE.PlaneGeometry(38, 110), new THREE.MeshStandardMaterial({ color: 0x4b5040, map: soil, bumpMap: soil, bumpScale: 0.07, roughness: 1 }), scene, 0, -0.025, 0);
    ground.rotation.x = -Math.PI / 2; ground.castShadow = false;
    const texture = noiseTexture(0xc4b698); texture.repeat.set(1, 6);
    const trailMat = new THREE.MeshStandardMaterial({ color: 0x797261, map: texture, bumpMap: texture, bumpScale: 0.035, roughness: 1 });
    for (let i = 0; i < PATH.length - 1; i++) {
      const a = to3D(...PATH[i]), b = to3D(...PATH[i + 1]);
      const path = add(new THREE.PlaneGeometry(1.3, a.distanceTo(b) + 0.08), trailMat, scene, (a.x + b.x) / 2, 0.002, (a.z + b.z) / 2);
      path.rotation.set(-Math.PI / 2, 0, -Math.atan2(b.x - a.x, b.z - a.z)); path.castShadow = false;
    }
    const weather = noiseTexture(0xb9b9a7, 64);
    for (const mat of [stone, oldStone]) { mat.map = mat.bumpMap = weather; mat.bumpScale = 0.025; }
    const blade = new THREE.BufferGeometry();
    blade.setAttribute("position", new THREE.Float32BufferAttribute([-0.045, 0, 0, 0.015, 0.32, 0.015, 0.04, 0, 0], 3)); blade.computeVertexNormals();
    const grass = new THREE.InstancedMesh(blade, new THREE.MeshStandardMaterial({ color: 0x3b5034, roughness: 1, side: THREE.DoubleSide }), 1600);
    const dummy = new THREE.Object3D(); let index = 0;
    while (index < 1600) {
      const x = (random() - 0.5) * 29, z = (random() - 0.5) * 96;
      if (distanceToPath(x * 25 + 200, z * 25 + 1000) < 24) continue;
      dummy.position.set(x, 0, z); dummy.rotation.y = random() * 6.28; dummy.scale.setScalar(0.5 + random() * 1.1); dummy.updateMatrix(); grass.setMatrixAt(index++, dummy.matrix);
    }
    scene.add(grass);
  }
  function makeGrave(x, z, type, turn = 0) {
    const group = new THREE.Group(); group.userData.static = true; group.position.set(x, 0, z); group.rotation.y = turn; scene.add(group);
    add(unitSphere, earth, group, 0, 0.015, 0.3, 0.49, 0.15, 0.87);
    if (!type) return;
    add(unitBox, oldStone, group, 0, 0.06, 0.26, 0.86, 0.12, 1.52);
    const shape = new THREE.Shape(); shape.moveTo(-0.3, 0); shape.lineTo(-0.3, 0.65);
    shape.quadraticCurveTo(-0.3, 0.98, 0, 0.98); shape.quadraticCurveTo(0.3, 0.98, 0.3, 0.65); shape.lineTo(0.3, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.02, bevelSegments: 2, steps: 1 });
    add(geometry, type === 1 ? stone : oldStone, group, 0, 0.13, -0.35);
    add(unitBox, stone, group, 0, 0.13, -0.3, 0.8, 0.16, 0.34);
    add(unitBox, oldStone, group, 0, 0.65, -0.193, 0.36, 0.43, 0.012);
    for (let i = 0; i < 4; i++) add(unitBox, stone, group, 0, 0.77 - i * 0.07, -0.181, 0.16 - i * 0.015, 0.009, 0.006);
    if (type === 2) for (const s of [-1, 1]) add(unitBox, oldStone, group, s * 0.41, 0.15, 0.35, 0.06, 0.12, 1.4);
  }
  function makeTree(x, z, size = 1) {
    const group = new THREE.Group(); group.userData.static = true; group.position.set(x, 0, z); group.scale.setScalar(size); scene.add(group);
    add(new THREE.CylinderGeometry(0.12, 0.24, 4.6, 10), bark, group, 0, 2.3, 0);
    for (let i = 0; i < 5; i++) {
      const angle = i * 2.4, ex = Math.cos(angle) * (1 + random()), ez = Math.sin(angle) * (1 + random());
      pole(group, [0, 2.6 + i * 0.25, 0], [ex, 4.1 + random(), ez], 0.065, bark);
      add(unitSphere, leaves, group, ex, 4.6 + random(), ez, 1.5, 0.8, 1.4);
      pole(group, [0, 0.08, 0], [Math.cos(angle) * 0.7, 0.02, Math.sin(angle) * 0.7], 0.07, bark);
    }
  }
  function makeBamboo(x, z) {
    const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group); bamboo.push(group);
    for (let i = 0; i < 8; i++) {
      const bx = (random() - 0.5) * 1.4, bz = (random() - 0.5) * 1.4, h = 3.4 + random() * 1.9;
      const stem = new THREE.Group(); stem.position.set(bx, 0, bz); stem.rotation.z = (random() - 0.5) * 0.18; group.add(stem);
      add(unitCylinder, stemMat, stem, 0, h / 2, 0, 0.035, h, 0.035);
      for (let j = 1; j < h / 0.4; j++) add(unitCylinder, leaves, stem, 0, j * 0.4, 0, 0.043, 0.028, 0.043);
      for (let j = 0; j < 5; j++) {
        const a = random() * 6.28, ey = h - random() * 1.5;
        const leaf = add(unitSphere, leaves, stem, Math.cos(a) * 0.3, ey, Math.sin(a) * 0.3, 0.48, 0.026, 0.12); leaf.rotation.y = -a; leaf.rotation.z = -0.2;
      }
    }
  }
  function makeGate() {
    const gate = new THREE.Group(); gate.userData.static = true; gate.position.copy(to3D(200, 1850)); scene.add(gate);
    for (const s of [-1, 1]) {
      add(unitBox, oldStone, gate, s * 1.4, 1.3, 0, 0.38, 2.6, 0.42);
      add(unitBox, stone, gate, s * 1.4, 0.12, 0, 0.64, 0.24, 0.7);
      add(unitBox, stone, gate, s * 1.4, 2.58, 0, 0.54, 0.18, 0.58);
      const lamp = add(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({ color: 0xffd28a, emissive: 0xffb75a, emissiveIntensity: 2 }), gate, s * 1.4, 1.8, 0.28);
      const light = new THREE.PointLight(0xffb362, 7, 5); light.position.copy(lamp.position); gate.add(light);
    }
    add(unitBox, oldStone, gate, 0, 2.67, 0, 3.3, 0.3, 0.4);
    for (const s of [-1, 1]) {
      const roof = add(unitBox, roofMat, gate, 0, 2.95, s * 0.29, 3.8, 0.12, 0.85); roof.rotation.x = s * 0.35;
      for (let i = -10; i <= 10; i++) { const tile = add(unitCylinder, roofMat, gate, i * 0.17, 3.01, s * 0.31, 0.045, 0.84, 0.045); tile.rotation.x = Math.PI / 2 + s * 0.35; }
      add(unitBox, oldStone, gate, s * 4.5, 0.37, 0, 5.8, 0.74, 0.3);
    }
  }
  function makeEnvironment() {
    makeTerrain(); makeGate();
    for (let i = 0; i < 68; i++) {
      const x = 26 + random() * 348, y = 330 + random() * 1430;
      if (distanceToPath(x, y) < 32 || Math.hypot(x - 222, y - 1065) < 34) continue;
      const p = to3D(x, y); makeGrave(p.x, p.z, Math.floor(random() * 3), (random() - 0.5) * 0.35);
    }
    const unnamed = to3D(262, 1032); makeGrave(unnamed.x, unnamed.z, 0);
    offering = new THREE.Group(); offering.position.copy(unnamed); scene.add(offering);
    add(new THREE.CylinderGeometry(0.13, 0.1, 0.025, 16), stone, offering, 0, 0.19, 0.25);
    add(unitSphere, new THREE.MeshStandardMaterial({ color: 0xe8dfbb, roughness: 1 }), offering, 0, 0.22, 0.25, 0.09, 0.035, 0.07);
    incense = new THREE.Group(); incense.position.copy(unnamed); scene.add(incense);
    pole(incense, [0.25, 0.12, -0.1], [0.27, 0.5, -0.1], 0.008, bark);
    add(unitSphere, new THREE.MeshBasicMaterial({ color: 0xee9255 }), incense, 0.27, 0.5, -0.1, 0.015, 0.015, 0.015);
    offering.visible = incense.visible = false;
    for (let i = 0; i < 28; i++) makeTree((i % 2 ? -1 : 1) * (7.5 + random() * 6), -38 + random() * 82, 0.8 + random() * 0.6);
    const gao = to3D(150, 625); makeTree(gao.x - 1.7, gao.z - 1, 1.65);
    for (const [x, y] of [[55, 1490], [65, 1440], [345, 1660], [350, 840], [38, 1160]]) { const p = to3D(x, y); makeBamboo(p.x, p.z); }
    const stars = new Float32Array(180 * 3);
    for (let i = 0; i < 180; i++) { stars[i * 3] = (random() - 0.5) * 110; stars[i * 3 + 1] = 22 + random() * 20; stars[i * 3 + 2] = (random() - 0.5) * 140; }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(stars, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xc4d3db, size: 0.055, transparent: true, opacity: 0.7, depthWrite: false })));
    const points = new Float32Array(32 * 3);
    for (let i = 0; i < 32; i++) { points[i * 3] = (random() - 0.5) * 12; points[i * 3 + 1] = 0.4 + random() * 1.8; points[i * 3 + 2] = (random() - 0.5) * 65; }
    const flies = new THREE.BufferGeometry(); flies.setAttribute("position", new THREE.BufferAttribute(points, 3));
    fireflies = new THREE.Points(flies, new THREE.PointsMaterial({ color: 0xd9e6a6, size: 0.045, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(fireflies);
    marker = new THREE.Group();
    const ring = add(new THREE.TorusGeometry(0.43, 0.012, 6, 48), new THREE.MeshBasicMaterial({ color: 0xdfc887, transparent: true, opacity: 0.75 }), marker, 0, 0.025, 0); ring.rotation.x = -Math.PI / 2;
    scene.add(marker); marker.visible = false;
    makeFabricScraps();
  }
  function makeFabricScraps() {
    for (const piece of FABRIC_PIECES) {
      const group = new THREE.Group(); group.position.copy(to3D(piece.x, piece.y, 0.025));
      group.rotation.y = piece.x * 0.19; scene.add(group);
      const geometry = new THREE.PlaneGeometry(0.62, 0.45, 7, 6);
      geometry.rotateX(-Math.PI / 2);
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i), z = positions.getZ(i);
        positions.setY(i, 0.02 + Math.abs(Math.sin(x * 21 + z * 13)) * 0.045 + Math.cos(z * 23) * 0.01);
        if (i % 8 === 0 || i % 8 === 7) positions.setX(i, x + Math.sin(i * 5) * 0.025);
      }
      geometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({ color: piece.color, roughness: 1, side: THREE.DoubleSide, emissive: piece.color, emissiveIntensity: 0.08 });
      add(geometry, material, group, 0, 0, 0);
      const fold = add(geometry, material, group, 0.09, 0.045, 0.02, 0.55, 1, 0.8); fold.rotation.z = 0.15;
      scraps.set(piece.id, { piece, group });
    }
    fabricLabel = makeLabel("Vải bỏ đi · Bấm Nhặt vải"); fabricLabel.classList.add("fabric-label"); fabricLabel.hidden = true;
  }
  // Bake scenery into a few material batches; bamboo keeps its own swaying pivot.
  function batchGroup(group) {
    scene.updateMatrixWorld(true);
    const inverse = group.matrixWorld.clone().invert(), batches = new Map(), objects = [];
    group.traverse((object) => {
      if (!object.isMesh || object.isInstancedMesh) return;
      const key = object.material.uuid;
      if (!batches.has(key)) batches.set(key, { material: object.material, geometries: [] });
      let geometry = object.geometry.clone();
      if (geometry.index) { const flat = geometry.toNonIndexed(); geometry.dispose(); geometry = flat; }
      geometry.applyMatrix4(inverse.clone().multiply(object.matrixWorld));
      batches.get(key).geometries.push(geometry); objects.push(object);
    });
    for (const object of objects) object.removeFromParent();
    for (const { material, geometries } of batches.values()) {
      const geometry = mergeGeometries(geometries);
      geometries.forEach((g) => g.dispose());
      if (geometry) add(geometry, material, group, 0, 0, 0);
    }
  }
  function optimizeScenery() {
    const scenery = new THREE.Group();
    for (const object of [...scene.children]) if (object.userData.static) scenery.add(object);
    scene.add(scenery); batchGroup(scenery);
    for (const group of bamboo) batchGroup(group);
  }
  function makeLabel(text) { const node = document.createElement("div"); node.className = "world-label"; node.textContent = text; labels.appendChild(node); return node; }
  function newActor(role) { return role === "ghost" ? createGhost() : createMonk({ villager: role === "villager" }); }
  function removeActor(object) { scene.remove(object.root); object.label?.remove(); object.dispose(); }
  function init(canvasEl, tapHandler) {
    canvas = canvasEl; onTap = tapHandler;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35;
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x273834); scene.fog = new THREE.FogExp2(0x273834, 0.029);
    camera = new THREE.PerspectiveCamera(43, 1, 0.08, 140);
    controls = new OrbitControls(camera, canvas); controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.enablePan = false; controls.minDistance = 2.7; controls.maxDistance = 13; controls.minPolarAngle = 0.35; controls.maxPolarAngle = 1.43;
    controls.rotateSpeed = 0.65; controls.zoomSpeed = 0.7;
    ambient = new THREE.HemisphereLight(0xc5d6d7, 0x4e4933, 1.65); scene.add(ambient);
    moon = new THREE.DirectionalLight(0xd6ddcb, 2); moon.position.set(-4, 12, 5); moon.castShadow = true;
    moon.shadow.mapSize.set(1024, 1024); moon.shadow.camera.left = moon.shadow.camera.bottom = -12; moon.shadow.camera.right = moon.shadow.camera.top = 12; moon.shadow.normalBias = 0.035; moon.shadow.bias = -0.0003;
    scene.add(moon, moon.target); warmth = new THREE.PointLight(0xf3b66c, 2.6, 5); scene.add(warmth);
    labels = document.getElementById("world-labels"); destinationLabel = document.getElementById("destination-label");
    makeEnvironment(); optimizeScenery(); resize(); setPlayer(player.x, player.y); makePreviews(); resize();
    let down = null;
    canvas.addEventListener("pointerdown", (event) => { down = { x: event.clientX, y: event.clientY, time: performance.now(), id: event.pointerId }; });
    canvas.addEventListener("pointerup", (event) => {
      if (!down || down.id !== event.pointerId || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6 || performance.now() - down.time > 500) { down = null; return; }
      down = null; const rect = canvas.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1); raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(ground)[0]; if (hit && onTap) onTap(hit.point.x * 25 + 200, hit.point.z * 25 + 1000);
    });
    canvas.addEventListener("pointercancel", () => { down = null; });
    canvas.addEventListener("webglcontextlost", (event) => { event.preventDefault(); contextLost = true; document.getElementById("world-error").hidden = false; });
    canvas.addEventListener("webglcontextrestored", () => { contextLost = false; document.getElementById("world-error").hidden = true; });
    window.addEventListener("resize", resize); new ResizeObserver(resize).observe(canvas);
    document.addEventListener("visibilitychange", () => { last = performance.now(); }); requestAnimationFrame(frame);
  }
  function resize() {
    if (!renderer) return; const rect = canvas.getBoundingClientRect(); width = rect.width; height = rect.height; if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height;
    camera.setViewOffset(width, height, 0, height * (0.5 - view.anchor), width, height); camera.updateProjectionMatrix();
  }
  function resetCamera() {
    target.copy(to3D(player.x, player.y, 0.7)); controls.target.copy(target);
    camera.position.copy(target).add(new THREE.Vector3(3.3, 3.2, 5.3)); controls.update();
  }
  function faceCamera() {
    const position = to3D(player.x, player.y);
    player.facing = Math.atan2(camera.position.x - position.x, camera.position.z - position.z) - 0.2;
  }
  function facePoint(x, y) { player.facing = Math.atan2(x - player.x, y - player.y); }
  function rotateCamera(direction) {
    const offset = camera.position.clone().sub(controls.target); offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * Math.PI / 4);
    camera.position.copy(controls.target).add(offset); controls.update();
  }
  function zoomCamera(factor) {
    const offset = camera.position.clone().sub(controls.target); offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
    camera.position.copy(controls.target).add(offset); controls.update();
  }
  function setView(patch) {
    const oldRole = view.role, oldAnchor = view.anchor; Object.assign(view, patch); if (!scene) return;
    if (oldRole !== view.role) {
      if (actor) removeActor(actor); actor = view.role ? newActor(view.role) : null;
      if (actor) { scene.add(actor.root); actor.label = makeLabel("Bạn"); }
    }
    if (view.role === "monk") actor?.setRobe(view.robe || 0);
    const picked = new Set(view.picked || []);
    for (const [id, scrap] of scraps) scrap.group.visible = !picked.has(id);
    const destination = view.fabricTarget ? FABRIC_PIECES.find((p) => p.id === view.fabricTarget) : PLACES[view.marker];
    offering.visible = view.flags.has("offering"); incense.visible = view.flags.has("incense"); marker.visible = !!destination;
    if (marker.visible) marker.position.copy(to3D(destination.x, destination.y));
    const daylight = 1 - view.darkness;
    scene.background.set(0x15262c).lerp(new THREE.Color(0x6d7160), daylight * 0.7); scene.fog.color.copy(scene.background);
    ambient.intensity = 1.1 + daylight * 1.4; moon.intensity = 1.1 + daylight * 2; if (oldAnchor !== view.anchor) resize();
  }
  function setPlayer(x, y) { player.x = x; player.y = y; stop(); if (controls) resetCamera(); }
  function setTarget(x, y) { player.tx = THREE.MathUtils.clamp(x, 12, W - 12); player.ty = THREE.MathUtils.clamp(y, 60, H - 20); player.moving = true; }
  function walkTo(x, y) { patrol = null; setTarget(x, y); }
  function startWalking() {
    const center = THREE.MathUtils.clamp(player.y, 115, H - 75); patrol = { x: player.x, min: center - 48, max: center + 48, forward: true }; setTarget(patrol.x, patrol.min);
  }
  function stop() { patrol = null; player.tx = null; player.moving = false; }
  function getPlayer() { return { x: player.x, y: player.y, moving: player.moving, nx: player.x / W, ny: player.y / H }; }
  function setOthers(list) {
    if (!scene) return; const seen = new Set();
    for (const p of list) {
      seen.add(p.pid); let o = others.get(p.pid);
      if (o && o.role !== p.role) { removeActor(o.actor); others.delete(p.pid); o = null; }
      if (!o) {
        const person = newActor(p.role); scene.add(person.root); person.label = makeLabel(p.nick || window.ROLE_INFO[p.role].name);
        o = { actor: person, role: p.role, x: p.x * W, y: p.y * H, rx: p.x * W, ry: p.y * H, angle: Math.PI, phase: random() * 6 }; others.set(p.pid, o);
      }
      Object.assign(o, { x: p.x * W, y: p.y * H, pose: p.pose }); o.actor.label.textContent = p.nick || window.ROLE_INFO[p.role].name;
      if (p.role === "monk") o.actor.setRobe(p.robe || 0);
    }
    for (const [id, o] of others) if (!seen.has(id)) { removeActor(o.actor); others.delete(id); }
  }
  function ripple(nx, ny, kind) {
    if (!scene) return;
    const object = add(new THREE.RingGeometry(0.3, 0.32, 48), new THREE.MeshBasicMaterial({ color: kind === "sigh" ? 0xa6dac3 : 0xe6c56f, side: THREE.DoubleSide, transparent: true, opacity: 0.6, depthWrite: false }), scene, 0, 0.04, 0);
    object.position.copy(to3D(nx * W, ny * H, 0.04)); object.rotation.x = -Math.PI / 2; ripples.push({ object, age: 0 });
  }
  function makePreviews() {
    const studio = new THREE.Scene(); studio.background = new THREE.Color(0x1b2723);
    studio.add(new THREE.HemisphereLight(0xf0e8da, 0x6d7966, 2.6));
    const key = new THREE.DirectionalLight(0xffddae, 3.4); key.position.set(-2, 4, 4); studio.add(key);
    const rim = new THREE.DirectionalLight(0xabc8da, 2); rim.position.set(3, 2, -2); studio.add(rim);
    const person = createMonk(); studio.add(person.root);
    const floor = add(new THREE.CircleGeometry(0.8, 48), new THREE.MeshStandardMaterial({ color: 0x394338, roughness: 1 }), studio, 0, -0.015, 0); floor.rotation.x = -Math.PI / 2;
    const portraitCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 10); renderer.setSize(240, 240, false);
    for (const pose of ["sit", "walk", "sleep", "eat", "collect", "sew"]) {
      person.animate(pose, pose === "eat" ? 0.45 : 0.25, pose === "walk", 1);
      portraitCamera.position.set(1.65, pose === "walk" ? 1.6 : 1.3, pose === "walk" ? 3.45 : 2.9); portraitCamera.lookAt(0, pose === "walk" ? 0.88 : 0.62, 0);
      renderer.render(studio, portraitCamera); previews.set(pose, canvas.toDataURL("image/png"));
    }
    person.dispose(); floor.geometry.dispose(); floor.material.dispose();
  }
  function projectLabel(label, position) {
    const p = position.clone().project(camera);
    label.style.transform = `translate(-50%, -100%) translate(${(p.x + 1) / 2 * width}px, ${(-p.y + 1) / 2 * height}px)`;
    label.style.visibility = p.z < 1 && p.z > -1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1 ? "visible" : "hidden";
  }
  function updatePerson(person, x, y, pose, phase, moving, angle, dt) {
    person.root.position.x = (x - 200) / 25; person.root.position.z = (y - 1000) / 25;
    person.root.rotation.y += Math.atan2(Math.sin(angle - person.root.rotation.y), Math.cos(angle - person.root.rotation.y)) * Math.min(1, dt * 7);
    person.animate(pose || "walk", moving ? phase : reducedMotion.matches ? 0 : time, moving, dt);
    person.label.hidden = !!(person !== actor && person.root.userData.ghost && view.role !== "ghost");
    const point = person.root.position.clone(); point.y += pose && pose !== "walk" ? 1.42 : 2.05; projectLabel(person.label, point);
  }
  function frame(timestamp) {
    requestAnimationFrame(frame); if (document.hidden || contextLost) { last = timestamp; return; }
    const dt = Math.min(0.05, (timestamp - last) / 1000 || 0.016); last = timestamp; time += dt;
    if (player.tx != null) {
      const dx = player.tx - player.x, dy = player.ty - player.y, d = Math.hypot(dx, dy);
      if (d < 1) { player.tx = null; player.moving = false; if (patrol) { patrol.forward = !patrol.forward; setTarget(patrol.x, patrol.forward ? patrol.min : patrol.max); } }
      else { const step = Math.min(d, dt * (view.role === "ghost" ? 55 : 34)); player.x += dx / d * step; player.y += dy / d * step; player.facing = Math.atan2(dx, dy); player.moving = true; player.phase += dt; }
    }
    target.copy(to3D(player.x, player.y, 0.7)); delta.subVectors(target, controls.target).multiplyScalar(Math.min(1, dt * 4)); controls.target.add(delta); camera.position.add(delta); controls.update();
    moon.position.copy(target).add(new THREE.Vector3(-5, 12, 5)); moon.target.position.copy(target); warmth.position.copy(target).add(new THREE.Vector3(0, 1.1, 1));
    if (actor) updatePerson(actor, player.x, player.y, view.pose, player.phase, player.moving, player.facing, dt);
    for (const o of others.values()) {
      const dx = o.x - o.rx, dy = o.y - o.ry, moving = Math.hypot(dx, dy) > 1; o.rx += dx * Math.min(1, dt * 8); o.ry += dy * Math.min(1, dt * 8);
      if (moving) { o.angle = Math.atan2(dx, dy); o.phase += dt; } o.actor.root.userData.ghost = o.role === "ghost";
      updatePerson(o.actor, o.rx, o.ry, o.pose, o.phase, moving, o.angle, dt);
    }
    bamboo.forEach((group, i) => { group.rotation.z = reducedMotion.matches ? 0 : Math.sin(time * 0.7 + i) * 0.012; }); fireflies.material.opacity = 0.35 + Math.sin(time * 1.8) * 0.2; fireflies.position.y = Math.sin(time * 0.5) * 0.1;
    marker.scale.setScalar(1 + Math.sin(time * 2) * 0.08); destinationLabel.hidden = !marker.visible;
    if (marker.visible) {
      const p = view.fabricTarget ? FABRIC_PIECES.find((piece) => piece.id === view.fabricTarget) : PLACES[view.marker];
      const metres = Math.round(Math.hypot(p.x - player.x, p.y - player.y) / 25); destinationLabel.textContent = `${view.fabricTarget ? "Vải bỏ đi" : p.name} · ${metres} m`;
      const projected = marker.position.clone().add(new THREE.Vector3(0, 0.4, 0)).project(camera);
      destinationLabel.style.left = `${THREE.MathUtils.clamp((projected.x + 1) * width / 2, 100, width - 100)}px`; destinationLabel.style.top = `${THREE.MathUtils.clamp((-projected.y + 1) * height / 2, 100, height * 0.57)}px`;
    }
    let nearby = null, nearest = 75;
    if (view.role === "monk") for (const scrap of scraps.values()) {
      const distance = Math.hypot(scrap.piece.x - player.x, scrap.piece.y - player.y);
      if (scrap.group.visible && distance < nearest) { nearest = distance; nearby = scrap; }
    }
    fabricLabel.hidden = !nearby;
    if (nearby) projectLabel(fabricLabel, nearby.group.position.clone().add(new THREE.Vector3(0, 0.25, 0)));
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i]; r.age += dt; r.object.scale.setScalar(1 + r.age * 3); r.object.material.opacity = Math.max(0, 0.6 - r.age * 0.25);
      if (r.age > 2.4) { scene.remove(r.object); r.object.geometry.dispose(); r.object.material.dispose(); ripples.splice(i, 1); }
    }
    renderer.render(scene, camera);
  }
  return { W, H, PLACES, SPAWN, init, setView, setPlayer, walkTo, startWalking, stop, getPlayer, setOthers, ripple, resetCamera, faceCamera, facePoint, rotateCamera, zoomCamera, getPoseImage: (pose) => previews.get(pose) };
})();
