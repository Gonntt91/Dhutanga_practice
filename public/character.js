import * as THREE from "three";

// A small articulated figure. The same 3D model supplies the menu portraits.
const skin = new THREE.MeshStandardMaterial({ color: 0xb98b65, roughness: 0.83 });
const dark = new THREE.MeshStandardMaterial({ color: 0x35261e, roughness: 0.95 });
const sashMat = new THREE.MeshStandardMaterial({ color: 0xb0a181, roughness: 1, side: THREE.DoubleSide });
const metal = new THREE.MeshStandardMaterial({ color: 0x343b36, roughness: 0.37, metalness: 0.6, side: THREE.DoubleSide });
const sphere = new THREE.SphereGeometry(1, 20, 14);
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12);
const up = new THREE.Vector3(0, 1, 0);
const robeMaterials = new Map();

// Uneven salvaged panels, woven grain and small stitches, inspired by the reference.
function patchworkMaterial(version = 0) {
  const key = Math.max(0, Math.floor(version)) % 6;
  if (robeMaterials.has(key)) return robeMaterials.get(key);
  const width = 256, height = 512, bytes = new Uint8Array(width * height * 4);
  const palette = [0x263c4d, 0x286273, 0x984332, 0xbf7134, 0xc6bda0, 0x32352e, 0x4c6959, 0x776350].map((c) => new THREE.Color(c));
  let seed = 9137 + key * 157;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  let top = 0, row = 0;
  while (top < height) {
    const bottom = Math.min(height, top + 52 + Math.floor(random() * 60));
    let left = 0;
    while (left < width) {
      const right = Math.min(width, left + 42 + Math.floor(random() * 66));
      const color = palette[(Math.floor(random() * palette.length) + row + key) % palette.length];
      for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
        const edge = Math.min(x - left, right - 1 - x, y - top, bottom - 1 - y);
        const stitch = edge === 3 && ((x + y) % 9 < 4);
        const grain = 0.86 + random() * 0.2 + (x % 2 ? 0.025 : -0.025);
        const shade = edge < 2 ? 0.34 : grain;
        const offset = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) bytes[offset + c] = Math.min(255, Math.round((stitch ? [0.54, 0.47, 0.33][c] : [color.r, color.g, color.b][c] * shade) * 255));
        bytes[offset + 3] = 255;
      }
      left = right;
    }
    top = bottom; row++;
  }
  const texture = new THREE.DataTexture(bytes, width, height);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true; texture.needsUpdate = true;
  const material = new THREE.MeshStandardMaterial({ map: texture, roughness: 1, side: THREE.DoubleSide });
  robeMaterials.set(key, material);
  return material;
}

function mesh(geometry, material, parent, position, scale) {
  const object = new THREE.Mesh(geometry, material);
  if (position) object.position.set(...position);
  if (scale) object.scale.set(...scale);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function segment(parent, material, radius) {
  const group = new THREE.Group(); parent.add(group);
  const shaft = mesh(cylinder, material, group);
  const a = mesh(sphere, material, group, null, [radius, radius, radius]);
  const b = mesh(sphere, material, group, null, [radius, radius, radius]);
  const delta = new THREE.Vector3();
  return (from, to) => {
    delta.subVectors(to, from);
    shaft.position.copy(from).add(to).multiplyScalar(0.5);
    shaft.scale.set(radius, Math.max(0.001, delta.length()), radius);
    shaft.quaternion.setFromUnitVectors(up, delta.normalize());
    a.position.copy(from); b.position.copy(to);
  };
}

function cloth(profile, folds = 15) {
  const geometry = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 64);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
    const angle = Math.atan2(z, x);
    const ripple = 1 + Math.sin(angle * folds + y * 3) * 0.035 + Math.sin(angle * 7 - y * 4) * 0.018;
    p.setXYZ(i, x * ripple, y, z * ripple * 0.73);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function makeSash() {
  const geometry = new THREE.BufferGeometry();
  const positions = [], indices = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    for (let side = 0; side < 2; side++) {
      const x = -0.19 + t * 0.37 + (side - 0.5) * 0.15;
      const y = 0.61 - t * 0.55;
      const z = Math.sqrt(Math.max(0.002, 0.26 ** 2 - x * x)) * 0.74 + 0.012 + Math.sin(t * 20) * 0.006;
      positions.push(x, y, z);
    }
    if (i < 14) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices); geometry.computeVertexNormals();
  return geometry;
}

export function createMonk({ villager = false } = {}) {
  const root = new THREE.Group();
  const fabric = villager ? new THREE.MeshStandardMaterial({ color: 0x374747, roughness: 1 }) : patchworkMaterial();
  const hips = new THREE.Group(); root.add(hips); hips.position.y = 0.84;
  const torso = new THREE.Group(); hips.add(torso);
  mesh(cloth([[0.19, 0], [0.22, 0.13], [0.24, 0.38], [0.26, 0.51], [0.21, 0.61]]), fabric, torso);
  mesh(sphere, fabric, torso, [0, 0.55, 0], [0.237, 0.085, 0.173]);
  if (!villager) mesh(makeSash(), sashMat, torso);
  mesh(cylinder, skin, torso, [0, 0.64, 0], [0.069, 0.1, 0.069]);

  const head = new THREE.Group(); torso.add(head); head.position.set(0, 0.78, 0);
  mesh(sphere, skin, head, [0, 0.02, 0], [0.14, 0.185, 0.145]);
  mesh(sphere, skin, head, [0, -0.002, 0.139], [0.024, 0.041, 0.032]);
  for (const side of [-1, 1]) {
    mesh(sphere, skin, head, [side * 0.139, 0.003, -0.003], [0.025, 0.045, 0.026]);
    const eye = mesh(sphere, dark, head, [side * 0.052, 0.033, 0.132], [0.023, 0.004, 0.005]);
    eye.rotation.z = side * 0.08;
    mesh(sphere, dark, head, [side * 0.051, 0.063, 0.127], [0.026, 0.004, 0.005]);
  }
  mesh(sphere, dark, head, [0, -0.072, 0.121], [0.026, 0.003, 0.005]);

  const skirt = mesh(cloth([[0.31, 0], [0.30, 0.12], [0.27, 0.38], [0.2, 0.72]]), fabric, root, [0, 0.13, 0]);
  const seated = new THREE.Group(); root.add(seated);
  mesh(cloth([[0.41, 0], [0.43, 0.07], [0.34, 0.19], [0.17, 0.28]]), fabric, seated, [0, 0.035, 0.03]);
  for (const side of [-1, 1]) {
    const knee = mesh(sphere, fabric, seated, [side * 0.25, 0.13, 0.16], [0.25, 0.115, 0.16]);
    knee.rotation.z = side * 0.12; knee.rotation.y = side * 0.35;
    mesh(sphere, skin, seated, [-side * 0.14, 0.095, 0.285], [0.12, 0.045, 0.054]);
  }

  const arms = [-1, 1].map((side) => ({
    side,
    upper: segment(torso, fabric, 0.074),
    lower: segment(torso, skin, 0.043),
    hand: mesh(sphere, skin, torso, null, [0.047, 0.029, 0.071]),
    elbow: new THREE.Vector3(side * 0.3, 0.22, 0.12),
    wrist: new THREE.Vector3(side * 0.06, 0.15, 0.3),
  }));
  const standingLegs = new THREE.Group(); root.add(standingLegs);
  const legs = [-1, 1].map((side) => ({
    side,
    upper: segment(standingLegs, fabric, 0.077),
    lower: segment(standingLegs, villager ? fabric : skin, 0.046),
    foot: mesh(sphere, skin, standingLegs, null, [0.065, 0.043, 0.13]),
  }));
  const bowl = new THREE.Group(); torso.add(bowl);
  mesh(new THREE.LatheGeometry([[0.035, 0], [0.07, 0.015], [0.115, 0.09], [0.12, 0.12]].map(([x, y]) => new THREE.Vector2(x, y)), 32), metal, bowl);
  mesh(new THREE.SphereGeometry(0.104, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xe7dfb7, roughness: 1 }), bowl, [0, 0.085, 0], [1, 0.2, 1]);
  const spoon = new THREE.Group(); torso.add(spoon);
  mesh(cylinder, metal, spoon, [0, 0.055, 0], [0.005, 0.11, 0.005]);
  mesh(sphere, metal, spoon, [0, 0.12, 0], [0.019, 0.026, 0.005]);

  const sewingCloth = new THREE.Group(); torso.add(sewingCloth);
  mesh(cloth([[0.16, 0], [0.19, 0.035], [0.15, 0.065]]), fabric, sewingCloth);
  const thread = mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.19, 5), sashMat, torso);
  const robeParts = [];
  if (!villager) root.traverse((object) => { if (object.isMesh && object.material === fabric) robeParts.push(object); });
  let robeVersion = -1;
  function setRobe(version = 0) {
    if (villager || robeVersion === version) return;
    robeVersion = version;
    for (const part of robeParts) part.material = patchworkMaterial(version);
    root.userData.robe = version;
  }
  setRobe();

  let lantern = null;
  if (villager) {
    skirt.visible = false;
    const straw = new THREE.MeshStandardMaterial({ color: 0xa68f60, roughness: 1 });
    mesh(new THREE.ConeGeometry(0.33, 0.18, 32), straw, head, [0, 0.22, 0]);
    lantern = new THREE.Group(); torso.add(lantern);
    mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.18, 10), new THREE.MeshStandardMaterial({ color: 0xe9b35e, emissive: 0xffb849, emissiveIntensity: 1.5, roughness: 0.7 }), lantern);
    for (const y of [-0.1, 0.1]) mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 10), dark, lantern, [0, y, 0]);
    const glow = new THREE.PointLight(0xffb45c, 9, 6, 2); lantern.add(glow);
  }

  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  function animate(pose, time, moving = false, dt = 1) {
    const collecting = !villager && pose === "collect", sewing = !villager && pose === "sew";
    const walk = villager || pose === "walk" || collecting;
    const sleeping = pose === "sleep", eating = pose === "eat";
    const blend = Math.min(1, dt * 8);
    const step = moving ? Math.sin(time * 5) : 0;
    const breath = Math.sin(time * (sleeping ? 1.15 : 1.6));
    hips.position.y = THREE.MathUtils.lerp(hips.position.y, collecting ? 0.55 : walk ? 0.84 + Math.abs(step) * 0.017 : 0.27 + breath * 0.003, blend);
    torso.rotation.x = THREE.MathUtils.lerp(torso.rotation.x, collecting ? 0.7 : sleeping ? 0.09 : sewing ? 0.13 : 0, blend);
    head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, sleeping ? 0.48 + breath * 0.025 : collecting ? 0.28 : sewing ? 0.32 : eating ? 0.17 : walk ? 0.04 : 0.1, blend);
    head.rotation.z = THREE.MathUtils.lerp(head.rotation.z, sleeping ? -0.13 : 0, blend);
    const sitScale = THREE.MathUtils.clamp((0.84 - hips.position.y) / 0.57, 0.001, 1);
    seated.scale.setScalar(sitScale); seated.visible = !villager && !collecting && sitScale > 0.02;
    skirt.visible = !villager && (collecting || sitScale < 0.96);
    standingLegs.visible = walk || sitScale < 0.3;
    skirt.scale.y = collecting ? 0.62 : 1 - sitScale * 0.97; skirt.rotation.z = step * 0.025;
    for (const leg of legs) {
      const stride = step * leg.side;
      a.set(leg.side * 0.105, collecting ? hips.position.y : 0.82, 0);
      b.set(leg.side * 0.11, collecting ? 0.31 : 0.43, collecting ? 0.2 : stride * 0.17);
      c.set(leg.side * 0.11, 0.07 + Math.max(0, stride) * 0.09, stride * 0.28);
      leg.upper(a, b); leg.lower(b, c); leg.foot.position.copy(c); leg.foot.position.z += 0.055;
      leg.foot.scale.set(0.065, walk ? 0.043 : 0.001, walk ? 0.13 : 0.001);
    }
    const lift = (Math.sin(time * 1.8) + 1) / 2;
    for (const arm of arms) {
      const s = arm.side;
      a.set(s * 0.235, 0.51, 0);
      b.set(s * 0.3, walk ? 0.26 : 0.2, 0.12);
      c.set(s * 0.055, walk ? 0.24 : 0.085, walk ? 0.27 : 0.3);
      if (eating) {
        if (s === -1) { b.set(-0.29, 0.19, 0.12); c.set(-0.075, 0.15, 0.37); }
        else { b.set(0.31, 0.28 + lift * 0.12, 0.19); c.set(0.07, 0.26 + lift * 0.41, 0.39 - lift * 0.17); }
      }
      if (collecting) { b.set(s * 0.24, 0.09, 0.18); c.set(s * 0.08, -0.23 + lift * 0.04, 0.31); }
      if (sewing) {
        b.set(s * 0.28, 0.18, 0.19);
        c.set(s * 0.08, 0.13 + (s === 1 ? lift * 0.17 : 0), 0.34 + (s === 1 ? lift * 0.04 : 0));
      }
      if (villager && s === -1) { b.set(-0.3, 0.12, 0); c.set(-0.31, -0.12, 0.1); }
      arm.elbow.lerp(b, blend); arm.wrist.lerp(c, blend);
      arm.upper(a, arm.elbow); arm.lower(arm.elbow, arm.wrist); arm.hand.position.copy(arm.wrist);
    }
    bowl.visible = eating; spoon.visible = eating;
    bowl.position.set(-0.025, 0.105, 0.36);
    spoon.position.copy(arms[1].wrist); spoon.rotation.x = -0.65;
    sewingCloth.visible = collecting || sewing;
    sewingCloth.position.copy(arms[0].wrist).add(a.set(0.05, -0.015, 0));
    thread.visible = sewing;
    thread.position.copy(arms[1].wrist).add(arms[0].wrist).multiplyScalar(0.5);
    thread.scale.y = Math.max(0.05, arms[1].wrist.distanceTo(arms[0].wrist) / 0.19);
    thread.quaternion.setFromUnitVectors(up, a.subVectors(arms[1].wrist, arms[0].wrist).normalize());
    if (lantern) lantern.position.copy(arms[0].wrist).add(new THREE.Vector3(0, -0.2, 0));
    root.userData.pose = pose;
  }
  animate("walk", 0);
  return { root, animate, setRobe, dispose() { root.traverse((o) => { if (o.isMesh && ![sphere, cylinder].includes(o.geometry)) o.geometry.dispose(); }); if (villager) fabric.dispose(); } };
}

export function createGhost() {
  const root = new THREE.Group();
  const mist = new THREE.MeshStandardMaterial({ color: 0xabc8b8, emissive: 0x37584e, emissiveIntensity: 0.5, transparent: true, opacity: 0.45, roughness: 1, depthWrite: false, side: THREE.DoubleSide });
  const body = mesh(cloth([[0.3, 0], [0.23, 0.35], [0.21, 0.85], [0.17, 1.1]]), mist, root, [0, 0.22, 0]);
  mesh(sphere, mist, root, [0, 1.5, 0], [0.14, 0.18, 0.14]);
  for (const s of [-1, 1]) mesh(sphere, mist, root, [s * 0.21, 0.85, 0.05], [0.06, 0.3, 0.065]);
  root.add(new THREE.PointLight(0xa4ddc3, 1.5, 3));
  return { root, animate(pose, time) { body.rotation.y = Math.sin(time * 0.4) * 0.08; root.position.y = 0.13 + Math.sin(time * 1.2) * 0.07; }, dispose() { body.geometry.dispose(); mist.dispose(); } };
}
