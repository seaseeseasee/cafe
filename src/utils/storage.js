// LocalStorage = ฐานข้อมูลจำลอง
const PREFIX = 'coffee-pos:';

export const KEYS = {
  products: 'products',
  orders: 'orders',
  settings: 'settings',
  cart: 'cart',
};

export function load(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/** คืน true เมื่อบันทึกสำเร็จ, false เมื่อพื้นที่เต็มหรือเบราว์เซอร์บล็อก */
export function save(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function clearAll() {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
