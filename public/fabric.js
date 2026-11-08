// Personal collection: scraps and finished robes survive changing roles or reloading.
export const FABRIC_STORAGE_KEY = "dhutanga.fabric.v1";
export const CLOTH_REQUIRED = 6;
export const PICKUP_RADIUS = 10;
export const PICKUP_TIME = 1400;
export const SEW_TIME = 4800;

export const FABRIC_PIECES = [
  [223, 1920, 0x376575, "xanh chàm"], [179, 1858, 0xa05236, "nâu đỏ"],
  [215, 1770, 0xbab199, "trắng ngà"], [145, 1660, 0x516c57, "xanh rêu"],
  [174, 1560, 0xb88037, "vàng đất"], [129, 1480, 0x4e5262, "xám xanh"],
  [190, 1370, 0x8c403b, "đỏ sẫm"], [211, 1260, 0x536b74, "xanh bạc"],
  [257, 1150, 0xb7aa88, "màu cát"], [204, 1000, 0x475449, "rêu sẫm"],
  [157, 840, 0x9a633b, "nâu đất"], [176, 725, 0xb3b6a9, "xám nhạt"],
  [127, 620, 0x35556b, "xanh lam"], [202, 465, 0x9d764b, "nâu vàng"],
  [180, 365, 0x6b5953, "nâu xám"], [213, 290, 0x797e53, "xanh úa"],
  [170, 530, 0xc0b494, "be"], [172, 915, 0x8b4e3d, "đất nung"],
].map(([x, y, color, name], i) => Object.freeze({ id: `cloth-${i + 1}`, x, y, color, name }));

export function restoreFabric(value) {
  const ids = new Set(FABRIC_PIECES.map((p) => p.id));
  const picked = [...new Set(Array.isArray(value?.picked) ? value.picked.filter((id) => ids.has(id)) : [])];
  const robes = Number.isSafeInteger(value?.robes) ? Math.max(0, Math.min(value.robes, Math.floor(picked.length / CLOTH_REQUIRED))) : 0;
  return { picked, robes };
}

export const fabricCount = (inventory) => inventory.picked.length - inventory.robes * CLOTH_REQUIRED;

export function nearestFabric(inventory, x, y) {
  const picked = new Set(inventory.picked);
  return FABRIC_PIECES.filter((piece) => !picked.has(piece.id))
    .reduce((best, piece) => !best || Math.hypot(piece.x - x, piece.y - y) < Math.hypot(best.x - x, best.y - y) ? piece : best, null);
}

export function takeFabric(inventory, id, x, y) {
  const piece = FABRIC_PIECES.find((p) => p.id === id);
  if (!piece || inventory.picked.includes(id) || Math.hypot(piece.x - x, piece.y - y) > PICKUP_RADIUS) return null;
  return { picked: [...inventory.picked, id], robes: inventory.robes };
}

export function sewRobe(inventory) {
  return fabricCount(inventory) >= CLOTH_REQUIRED ? { picked: [...inventory.picked], robes: inventory.robes + 1 } : null;
}
