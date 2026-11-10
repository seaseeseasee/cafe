/** รูปสินค้า: ใช้รูปที่อัปโหลด ถ้าไม่มีจะแสดงภาพประกอบ emoji บนพื้นสีของสินค้า */
export default function ProductImage({ product, size, className = '' }) {
  const style = size ? { width: size, height: size } : undefined;
  if (product?.image) {
    return (
      <div className={`product-img ${className}`} style={style}>
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
    );
  }
  const color = product?.color || '#9C6644';
  return (
    <div
      className={`product-img product-img-fallback ${className}`}
      style={{ ...style, '--tile': color }}
      role="img"
      aria-label={product?.name}
    >
      <span className="product-emoji">{product?.emoji || '☕'}</span>
    </div>
  );
}
