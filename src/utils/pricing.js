import { SIZES, MILKS, TOPPINGS, SHOT_PRICE, STRENGTHS, DEFAULT_OPTIONS } from '../data/options.js';
import { getCategory } from '../data/categories.js';
import { round2 } from './format.js';

/** คืนค่าตัวเลือกที่ "ใช้ได้จริง" ตามหมวดของสินค้า (ตัดตัวเลือกที่ไม่เกี่ยวข้องออก) */
export function normalizeOptions(category, options = {}) {
  const allowed = getCategory(category).options;
  const o = { ...DEFAULT_OPTIONS, ...options };
  return {
    size: allowed.includes('size') ? o.size : null,
    sweetness: allowed.includes('sweetness') ? Number(o.sweetness) : null,
    strength: allowed.includes('strength') ? o.strength : null,
    milk: allowed.includes('milk') ? o.milk : null,
    shots: allowed.includes('shot') ? Math.max(0, Number(o.shots) || 0) : 0,
    toppings: allowed.includes('topping') ? [...(o.toppings || [])].sort() : [],
    note: String(o.note || '').trim(),
  };
}

export function optionsExtraPrice(options) {
  let extra = 0;
  if (options.size) extra += SIZES.find((s) => s.id === options.size)?.price || 0;
  if (options.milk) extra += MILKS.find((m) => m.id === options.milk)?.price || 0;
  extra += (options.shots || 0) * SHOT_PRICE;
  for (const t of options.toppings || []) extra += TOPPINGS.find((x) => x.id === t)?.price || 0;
  return extra;
}

export function calcUnitPrice(basePrice, options) {
  return round2(Number(basePrice) + optionsExtraPrice(options));
}

/** ข้อความสรุปตัวเลือก เช่น ["ไซซ์ M", "หวาน 50%", "นมโอ๊ต"] */
export function describeOptions(options) {
  if (!options) return [];
  const parts = [];
  if (options.size) parts.push(`ไซซ์ ${options.size}`);
  if (options.sweetness !== null && options.sweetness !== undefined) parts.push(`หวาน ${options.sweetness}%`);
  if (options.strength && options.strength !== 'normal')
    parts.push(`รส${STRENGTHS.find((s) => s.id === options.strength)?.label}`);
  if (options.milk && options.milk !== 'fresh') parts.push(MILKS.find((m) => m.id === options.milk)?.label);
  if (options.shots) parts.push(`+${options.shots} Shot`);
  for (const t of options.toppings || []) parts.push(`+${TOPPINGS.find((x) => x.id === t)?.label}`);
  return parts.filter(Boolean);
}

/** key เดียวกัน = สินค้า+ตัวเลือกเหมือนกัน → รวมจำนวนในตะกร้า */
export function cartItemKey(productId, options) {
  return `${productId}|${JSON.stringify(options)}`;
}

export function calcDiscountAmount(subtotal, discount) {
  if (!discount || !discount.value) return 0;
  const v = Number(discount.value);
  if (!(v > 0)) return 0;
  const amount = discount.type === 'percent' ? (subtotal * Math.min(v, 100)) / 100 : v;
  return round2(Math.min(amount, subtotal));
}

export function calcTotals(items, discount) {
  const subtotal = round2(items.reduce((s, i) => s + i.unitPrice * i.qty, 0));
  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const discountAmount = calcDiscountAmount(subtotal, discount);
  return { subtotal, itemCount, discountAmount, total: round2(subtotal - discountAmount) };
}

/** ตรวจสอบส่วนลด — คืนข้อความ error หรือ null */
export function validateDiscount(type, rawValue, subtotal) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return 'กรุณากรอกส่วนลด';
  const v = Number(rawValue);
  if (!Number.isFinite(v)) return 'ส่วนลดต้องเป็นตัวเลข';
  if (v <= 0) return 'ส่วนลดต้องมากกว่า 0';
  if (type === 'percent' && v > 100) return 'ส่วนลดต้องไม่เกิน 100%';
  if (type === 'amount' && v > subtotal) return 'ส่วนลดต้องไม่เกินยอดรวม';
  if (round2(v) !== v) return 'ทศนิยมได้ไม่เกิน 2 ตำแหน่ง';
  return null;
}
