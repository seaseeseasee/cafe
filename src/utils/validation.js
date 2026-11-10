import { CATEGORIES } from '../data/categories.js';

export function validateProduct(form, products = []) {
  const errors = {};
  const name = String(form.name || '').trim();
  if (!name) errors.name = 'กรุณากรอกชื่อสินค้า';
  else if (name.length > 40) errors.name = 'ชื่อสินค้ายาวได้ไม่เกิน 40 ตัวอักษร';
  else if (products.some((p) => p.id !== form.id && p.name.trim().toLowerCase() === name.toLowerCase()))
    errors.name = 'มีสินค้าชื่อนี้อยู่แล้ว';

  const priceStr = String(form.price ?? '').trim();
  const price = Number(priceStr);
  if (priceStr === '') errors.price = 'กรุณากรอกราคา';
  else if (!Number.isFinite(price)) errors.price = 'ราคาต้องเป็นตัวเลข';
  else if (price <= 0) errors.price = 'ราคาต้องมากกว่า 0';
  else if (price > 99999) errors.price = 'ราคาต้องไม่เกิน 99,999';
  else if (Math.round(price * 100) / 100 !== price) errors.price = 'ทศนิยมได้ไม่เกิน 2 ตำแหน่ง';

  if (!CATEGORIES.some((c) => c.id === form.category)) errors.category = 'กรุณาเลือกหมวดหมู่';
  return errors;
}

export function validateSettings(form) {
  const errors = {};
  const name = String(form.shopName || '').trim();
  if (!name) errors.shopName = 'กรุณากรอกชื่อร้าน';
  else if (name.length > 50) errors.shopName = 'ชื่อร้านยาวได้ไม่เกิน 50 ตัวอักษร';
  const phone = String(form.phone || '').trim();
  if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) errors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวเลข 6–20 หลัก)';
  if (String(form.address || '').length > 200) errors.address = 'ที่อยู่ยาวได้ไม่เกิน 200 ตัวอักษร';
  if (String(form.receiptFooter || '').length > 150) errors.receiptFooter = 'ข้อความยาวได้ไม่เกิน 150 ตัวอักษร';
  const taxId = String(form.taxId || '').trim();
  if (taxId && !/^\d{13}$/.test(taxId)) errors.taxId = 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
  if (!String(form.bankAccount || '').trim()) errors.bankAccount = 'กรุณากรอกเลขบัญชีสำหรับรับโอน';
  return errors;
}

export const hasErrors = (e) => Object.keys(e).length > 0;
