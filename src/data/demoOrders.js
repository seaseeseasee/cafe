import { buildOrder } from '../utils/orders.js';
import { normalizeOptions, calcUnitPrice, cartItemKey } from '../utils/pricing.js';
import { round2 } from '../utils/format.js';

// PRNG แบบกำหนด seed — ข้อมูล Demo คงที่ทุกครั้งที่สร้าง
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const weighted = (rnd, entries) => {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rnd() * total;
  for (const [v, w] of entries) if ((r -= w) <= 0) return v;
  return entries[0][0];
};

const POPULAR = new Map([['p07', 4], ['p03', 4], ['p02', 3], ['p09', 3], ['p14', 2]]);

/** สร้างออเดอร์ตัวอย่างย้อนหลัง `days` วัน (วันนี้สร้างถึงเวลาปัจจุบันเท่านั้น) */
export function generateDemoOrders(products, days = 14, now = new Date()) {
  const rnd = mulberry32(20261110);
  const pool = products.filter((p) => p.active).map((p) => [p, POPULAR.get(p.id) || 1]);
  if (!pool.length) return [];
  const orders = [];

  for (let d = days - 1; d >= 0; d--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    const count = 8 + Math.floor(rnd() * 8) + (weekend ? 5 : 0);
    const times = [];
    for (let i = 0; i < count; i++) {
      const t = new Date(day);
      t.setHours(7 + Math.floor(rnd() * 12), Math.floor(rnd() * 60), Math.floor(rnd() * 60));
      times.push(t);
    }
    times.sort((a, b) => a - b);
    let dayTimes = d === 0 ? times.filter((t) => t <= now) : times;
    if (d === 0 && dayTimes.length < 3) {
      // เปิดเช้ามืด: สร้างออเดอร์ย้อนหลังไม่กี่นาที เพื่อให้ Dashboard วันนี้มีข้อมูลให้ดู
      dayTimes = [60, 40, 20].map((m) => new Date(now.getTime() - m * 60 * 1000)).filter((t) => t >= day);
    }

    for (const t of dayTimes) {
      const lines = 1 + Math.floor(rnd() * 3);
      const items = [];
      for (let l = 0; l < lines; l++) {
        const product = weighted(rnd, pool);
        const options = normalizeOptions(product.category, {
          size: weighted(rnd, [['S', 3], ['M', 5], ['L', 2]]),
          sweetness: pick(rnd, [25, 50, 50, 75, 100, 100]),
          milk: weighted(rnd, [['fresh', 8], ['oat', 2]]),
          shots: rnd() < 0.15 ? 1 : 0,
          toppings: rnd() < 0.15 ? [pick(rnd, ['whip', 'pearl', 'caramel'])] : [],
        });
        const key = cartItemKey(product.id, options);
        const existing = items.find((i) => i.key === key);
        if (existing) {
          existing.qty += 1;
          continue;
        }
        items.push({
          key,
          productId: product.id,
          name: product.name,
          category: product.category,
          emoji: product.emoji,
          basePrice: product.price,
          unitPrice: calcUnitPrice(product.price, options),
          qty: rnd() < 0.2 ? 2 : 1,
          options,
        });
      }
      const discount = rnd() < 0.1 ? { type: 'percent', value: 10 } : null;
      const method = weighted(rnd, [['cash', 40], ['qr', 32], ['transfer', 15], ['card', 13]]);
      const order = buildOrder({ orders, items, discount, payment: { method }, date: t });
      if (method === 'cash') {
        const received = [100, 500, 1000].find((b) => b >= order.total) || Math.ceil(order.total / 100) * 100;
        order.payment = { method, received, change: round2(received - order.total) };
      }
      if (method === 'card') order.payment.cardLast4 = String(1000 + Math.floor(rnd() * 9000));
      if (method === 'transfer') order.payment.reference = `TRX${Math.floor(rnd() * 1e8)}`;
      if (d > 0 && rnd() < 0.03) {
        order.status = 'voided';
        order.voidedAt = new Date(t.getTime() + 5 * 60 * 1000).toISOString();
        order.voidReason = 'ลูกค้ายกเลิก';
      }
      order.isDemo = true;
      orders.push(order);
    }
  }
  return orders.reverse(); // ล่าสุดก่อน
}
