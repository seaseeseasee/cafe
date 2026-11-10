// หมวดหมู่สินค้า + กลุ่มตัวเลือกที่ใช้ได้ในแต่ละหมวด
export const CATEGORIES = [
  { id: 'coffee', label: 'กาแฟ', emoji: '☕', options: ['size', 'sweetness', 'strength', 'milk', 'shot', 'topping'] },
  { id: 'tea', label: 'ชา', emoji: '🍵', options: ['size', 'sweetness', 'milk', 'topping'] },
  { id: 'milk', label: 'นม', emoji: '🥛', options: ['size', 'sweetness', 'milk', 'topping'] },
  { id: 'other', label: 'เครื่องดื่มอื่น ๆ', emoji: '🍹', options: ['size', 'sweetness', 'topping'] },
  { id: 'bakery', label: 'เบเกอรี่', emoji: '🥐', options: [] },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[3];
export const categoryLabel = (id) => getCategory(id).label;
