// ทดสอบ logic หลัก (ราคา/ส่วนลด/ออเดอร์/Dashboard) — รันด้วย `npm test`
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeOptions, calcUnitPrice, calcTotals, validateDiscount, cartItemKey, describeOptions } from '../src/utils/pricing.js';
import { generateOrderId, buildOrder, summarize, dailySeries, startOfDay } from '../src/utils/orders.js';
import { validateProduct, validateSettings } from '../src/utils/validation.js';
import { generateDemoOrders } from '../src/data/demoOrders.js';
import { DEFAULT_PRODUCTS } from '../src/data/defaultProducts.js';
import { DEFAULT_SETTINGS } from '../src/data/defaultSettings.js';

const latte = DEFAULT_PRODUCTS.find((p) => p.name === 'Latte'); // 55
const croissant = DEFAULT_PRODUCTS.find((p) => p.name === 'Croissant'); // 55

test('ราคาเปลี่ยนตามตัวเลือก', () => {
  const o = normalizeOptions('coffee', { size: 'L', milk: 'oat', shots: 2, toppings: ['whip', 'cheese'] });
  // 55 + L20 + oat15 + 2*15 + 10 + 15
  assert.equal(calcUnitPrice(latte.price, o), 145);
  assert.equal(calcUnitPrice(latte.price, normalizeOptions('coffee', {})), 55);
});

test('ตัดตัวเลือกที่ไม่เกี่ยวกับหมวดออก (เบเกอรี่ไม่มีไซซ์/นม)', () => {
  const o = normalizeOptions('bakery', { size: 'L', milk: 'oat', shots: 3, toppings: ['whip'] });
  assert.equal(calcUnitPrice(croissant.price, o), 55);
  assert.deepEqual(describeOptions(o), []);
});

test('key ตะกร้าเหมือนกันเมื่อ topping สลับลำดับ', () => {
  const a = normalizeOptions('coffee', { toppings: ['whip', 'caramel'] });
  const b = normalizeOptions('coffee', { toppings: ['caramel', 'whip'] });
  assert.equal(cartItemKey('p03', a), cartItemKey('p03', b));
});

test('ยอดรวม ส่วนลด % และจำนวนเงิน', () => {
  const items = [
    { unitPrice: 55, qty: 2 },
    { unitPrice: 65.5, qty: 1 },
  ];
  assert.deepEqual(calcTotals(items, null), { subtotal: 175.5, itemCount: 3, discountAmount: 0, total: 175.5 });
  assert.equal(calcTotals(items, { type: 'percent', value: 10 }).total, 157.95);
  assert.equal(calcTotals(items, { type: 'amount', value: 25.5 }).total, 150);
  assert.equal(calcTotals(items, { type: 'amount', value: 999 }).total, 0); // ไม่ติดลบ
});

test('validate ส่วนลด', () => {
  assert.equal(validateDiscount('percent', '', 100), 'กรุณากรอกส่วนลด');
  assert.ok(validateDiscount('percent', '120', 100));
  assert.ok(validateDiscount('amount', '150', 100));
  assert.ok(validateDiscount('amount', '-5', 100));
  assert.equal(validateDiscount('percent', '10', 100), null);
});

test('เลขที่ออเดอร์เรียงต่อรายวัน', () => {
  const d = new Date(2026, 10, 10, 9);
  assert.equal(generateOrderId([], d), 'ORD-261110-0001');
  assert.equal(generateOrderId([{ id: 'ORD-261110-0007' }, { id: 'ORD-261109-0099' }], d), 'ORD-261110-0008');
});

test('สร้างออเดอร์ + สรุป Dashboard ไม่นับออเดอร์ที่ยกเลิก', () => {
  const items = [{ key: 'k', productId: 'p03', name: 'Latte', unitPrice: 55, qty: 2, options: {} }];
  const o1 = buildOrder({ orders: [], items, discount: { type: 'percent', value: 10 }, payment: { method: 'cash', received: 100, change: 1 } });
  assert.equal(o1.total, 99);
  assert.equal(o1.discount.amount, 11);
  const o2 = { ...buildOrder({ orders: [o1], items, discount: null, payment: { method: 'qr' } }), status: 'voided' };
  const s = summarize([o1, o2], { from: startOfDay() });
  assert.equal(s.orderCount, 1);
  assert.equal(s.revenue, 99);
  assert.equal(s.itemsSold, 2);
  assert.equal(s.top[0].name, 'Latte');
  assert.equal(dailySeries([o1, o2], 7).at(-1).revenue, 99);
});

test('validate สินค้า', () => {
  assert.ok(validateProduct({ name: '', price: '50', category: 'coffee' }).name);
  assert.ok(validateProduct({ name: 'X', price: '0', category: 'coffee' }).price);
  assert.ok(validateProduct({ name: 'X', price: 'abc', category: 'coffee' }).price);
  assert.ok(validateProduct({ name: 'latte', price: '50', category: 'coffee' }, DEFAULT_PRODUCTS).name); // ชื่อซ้ำ
  assert.deepEqual(validateProduct({ name: 'Iced Latte', price: '59', category: 'coffee' }, DEFAULT_PRODUCTS), {});
});

test('validate ตั้งค่าร้าน', () => {
  assert.deepEqual(validateSettings(DEFAULT_SETTINGS), {});
  assert.ok(validateSettings({ ...DEFAULT_SETTINGS, shopName: ' ' }).shopName);
  assert.ok(validateSettings({ ...DEFAULT_SETTINGS, phone: 'abc' }).phone);
});

test('ข้อมูล Demo: มีสินค้า ≥ 15 และออเดอร์ย้อนหลังที่ยอดถูกต้อง', () => {
  assert.ok(DEFAULT_PRODUCTS.length >= 15);
  const now = new Date();
  const orders = generateDemoOrders(DEFAULT_PRODUCTS, 14, now);
  assert.ok(orders.length > 100);
  assert.equal(new Set(orders.map((o) => o.id)).size, orders.length, 'เลขออเดอร์ไม่ซ้ำ');
  for (const o of orders) {
    assert.ok(new Date(o.createdAt) <= now, 'ไม่มีออเดอร์ในอนาคต');
    assert.equal(calcTotals(o.items, o.discount).total, o.total);
    if (o.payment.method === 'cash') assert.ok(o.payment.received >= o.total);
  }
  assert.ok(summarize(orders, { from: startOfDay(now) }).orderCount >= 1, 'วันนี้มีข้อมูล');
});
