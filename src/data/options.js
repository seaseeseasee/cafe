// ตัวเลือกปรับแต่งเครื่องดื่ม — ราคาเป็นบาท (บวกเพิ่มจากราคาฐาน)
export const SIZES = [
  { id: 'S', label: 'S', desc: '12 oz', price: 0 },
  { id: 'M', label: 'M', desc: '16 oz', price: 10 },
  { id: 'L', label: 'L', desc: '22 oz', price: 20 },
];

export const SWEETNESS = [0, 25, 50, 75, 100].map((v) => ({ id: v, label: `${v}%` }));

export const STRENGTHS = [
  { id: 'light', label: 'อ่อน' },
  { id: 'normal', label: 'ปกติ' },
  { id: 'strong', label: 'เข้ม' },
];

export const MILKS = [
  { id: 'fresh', label: 'นมสด', price: 0 },
  { id: 'oat', label: 'นมโอ๊ต', price: 15 },
  { id: 'almond', label: 'นมอัลมอนด์', price: 15 },
  { id: 'soy', label: 'นมถั่วเหลือง', price: 10 },
  { id: 'none', label: 'ไม่ใส่นม', price: 0 },
];

export const SHOT_PRICE = 15;
export const MAX_SHOTS = 3;

export const TOPPINGS = [
  { id: 'whip', label: 'วิปครีม', price: 10 },
  { id: 'pearl', label: 'ไข่มุก', price: 10 },
  { id: 'caramel', label: 'ซอสคาราเมล', price: 10 },
  { id: 'choco', label: 'ซอสช็อกโกแลต', price: 10 },
  { id: 'cheese', label: 'ชีสโฟม', price: 15 },
];

export const MAX_NOTE = 100;

export const DEFAULT_OPTIONS = {
  size: 'S',
  sweetness: 100,
  strength: 'normal',
  milk: 'fresh',
  shots: 0,
  toppings: [],
  note: '',
};
