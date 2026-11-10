import { dateKey, pad, round2 } from './format.js';
import { calcTotals } from './pricing.js';

// สีผ่านการตรวจ CVD/contrast แล้ว (ใช้ในกราฟสัดส่วนช่องทางชำระเงิน)
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'เงินสด', labelEn: 'Cash', color: '#A0522D' },
  { id: 'transfer', label: 'โอนเงิน', labelEn: 'Bank transfer', color: '#1F8A70' },
  { id: 'qr', label: 'QR Payment', labelEn: 'QR Payment', color: '#C27C0E' },
  { id: 'card', label: 'บัตรเครดิต', labelEn: 'Credit card', color: '#4C5FC4' },
];

export const paymentLabel = (id, lang = 'th') => {
  const m = PAYMENT_METHODS.find((x) => x.id === id);
  return m ? (lang === 'en' ? m.labelEn : m.label) : id;
};

/** เลขที่ออเดอร์: ORD-YYMMDD-0001 (เรียงต่อเนื่องรายวัน) */
export function generateOrderId(orders, date = new Date()) {
  const d = new Date(date);
  const stamp = `${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const prefix = `ORD-${stamp}-`;
  let max = 0;
  for (const o of orders) {
    if (o.id.startsWith(prefix)) max = Math.max(max, Number(o.id.slice(prefix.length)) || 0);
  }
  return `${prefix}${pad(max + 1, 4)}`;
}

export function buildOrder({ orders, items, discount, payment, date = new Date() }) {
  const totals = calcTotals(items, discount);
  return {
    id: generateOrderId(orders, date),
    createdAt: new Date(date).toISOString(),
    items: items.map((i) => ({ ...i, lineTotal: round2(i.unitPrice * i.qty) })),
    subtotal: totals.subtotal,
    discount: discount && totals.discountAmount > 0 ? { ...discount, amount: totals.discountAmount } : null,
    total: totals.total,
    itemCount: totals.itemCount,
    payment,
    status: 'completed',
  };
}

export const isCompleted = (o) => o.status === 'completed';

export function startOfDay(d = new Date(), offsetDays = 0) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + offsetDays);
}

/** สรุปข้อมูลสำหรับ Dashboard (เฉพาะออเดอร์ที่สำเร็จ) */
export function summarize(orders, { from, to } = {}) {
  const list = orders.filter((o) => {
    if (!isCompleted(o)) return false;
    const t = new Date(o.createdAt);
    return (!from || t >= from) && (!to || t <= to);
  });
  const revenue = round2(list.reduce((s, o) => s + o.total, 0));
  const itemsSold = list.reduce((s, o) => s + o.itemCount, 0);
  const byProduct = new Map();
  const byPayment = new Map();
  for (const o of list) {
    for (const i of o.items) {
      const cur = byProduct.get(i.productId) || { productId: i.productId, name: i.name, emoji: i.emoji, qty: 0, revenue: 0 };
      cur.qty += i.qty;
      cur.revenue = round2(cur.revenue + i.unitPrice * i.qty);
      byProduct.set(i.productId, cur);
    }
    const p = byPayment.get(o.payment.method) || { count: 0, amount: 0 };
    p.count += 1;
    p.amount = round2(p.amount + o.total);
    byPayment.set(o.payment.method, p);
  }
  const top = [...byProduct.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, 5);
  return {
    revenue,
    orderCount: list.length,
    itemsSold,
    avgPerBill: list.length ? round2(revenue / list.length) : 0,
    top,
    byPayment,
  };
}

/** ยอดขายรายวันย้อนหลัง n วัน (รวมวันนี้) */
export function dailySeries(orders, days = 7, now = new Date()) {
  const map = new Map();
  for (const o of orders) {
    if (!isCompleted(o)) continue;
    const k = dateKey(o.createdAt);
    const cur = map.get(k) || { revenue: 0, count: 0 };
    cur.revenue = round2(cur.revenue + o.total);
    cur.count += 1;
    map.set(k, cur);
  }
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = startOfDay(now, -i);
    const k = dateKey(d);
    out.push({ date: d, key: k, ...(map.get(k) || { revenue: 0, count: 0 }) });
  }
  return out;
}
