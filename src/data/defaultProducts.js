// สินค้าเริ่มต้น (Demo) — image ว่างไว้ = ใช้ภาพประกอบ emoji อัตโนมัติ
const p = (id, category, name, price, emoji, color) => ({
  id, category, name, price, emoji, color, image: '', active: true,
});

export const DEFAULT_PRODUCTS = [
  p('p01', 'coffee', 'Espresso', 45, '☕', '#5B3A29'),
  p('p02', 'coffee', 'Americano', 50, '☕', '#6F4E37'),
  p('p03', 'coffee', 'Latte', 55, '🥛', '#B08968'),
  p('p04', 'coffee', 'Cappuccino', 55, '☕', '#9C6644'),
  p('p05', 'coffee', 'Mocha', 60, '🍫', '#7F5539'),
  p('p06', 'coffee', 'Caramel Macchiato', 65, '🍮', '#C08552'),
  p('p07', 'tea', 'Thai Tea', 45, '🧋', '#D9773B'),
  p('p08', 'tea', 'Green Tea', 50, '🍵', '#6A994E'),
  p('p09', 'tea', 'Matcha Latte', 65, '🍵', '#7FA16B'),
  p('p10', 'milk', 'Fresh Milk', 40, '🥛', '#C9B79C'),
  p('p11', 'milk', 'Cocoa', 50, '🍫', '#6B4226'),
  p('p12', 'other', 'Lemon Tea', 45, '🍋', '#D4A72C'),
  p('p13', 'other', 'Strawberry Soda', 50, '🍓', '#C9485B'),
  p('p14', 'bakery', 'Croissant', 55, '🥐', '#C68B59'),
  p('p15', 'bakery', 'Brownie', 45, '🍫', '#4E342E'),
  p('p16', 'bakery', 'Blueberry Cheesecake', 75, '🍰', '#6C5B9E'),
];

export const PRODUCT_COLORS = ['#5B3A29', '#6F4E37', '#9C6644', '#C08552', '#D9773B', '#6A994E', '#D4A72C', '#C9485B', '#6C5B9E', '#4E342E'];
export const PRODUCT_EMOJIS = ['☕', '🥛', '🧋', '🍵', '🍫', '🍮', '🍋', '🍓', '🍹', '🥤', '🧃', '🥐', '🍰', '🧁', '🍪', '🥪', '🍩', '🥯'];
