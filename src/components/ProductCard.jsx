import { SlidersHorizontal, Plus } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { formatMoney } from '../utils/format.js';
import { getCategory } from '../data/categories.js';

export default function ProductCard({ product, inCart = 0, onAdd, onCustomize }) {
  const cat = getCategory(product.category);
  const customizable = cat.options.length > 0;
  return (
    <div className="product-card">
      <button className="product-card-main" onClick={() => onAdd(product)} aria-label={`เพิ่ม ${product.name} ลงตะกร้า`}>
        <ProductImage product={product} />
        {inCart > 0 && <span className="in-cart-badge">{inCart}</span>}
        <div className="product-info">
          <span className="product-cat">
            {cat.emoji} {cat.label}
          </span>
          <span className="product-name">{product.name}</span>
          <span className="product-price">{formatMoney(product.price)}</span>
        </div>
        <span className="product-add" aria-hidden="true">
          <Plus size={18} />
        </span>
      </button>
      {customizable && (
        <button className="product-customize" onClick={() => onCustomize(product)} title="เลือกตัวเลือกเพิ่มเติม" aria-label={`ปรับแต่ง ${product.name}`}>
          <SlidersHorizontal size={16} />
          <span>ตัวเลือก</span>
        </button>
      )}
    </div>
  );
}
