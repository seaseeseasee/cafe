import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, SearchX, PackagePlus, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import ProductCard from '../components/ProductCard.jsx';
import CategoryTabs from '../components/CategoryTabs.jsx';
import SearchInput from '../components/SearchInput.jsx';
import CartPanel from '../components/CartPanel.jsx';
import CustomizeModal from '../components/CustomizeModal.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import OrderSuccessModal from '../components/OrderSuccessModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getCategory } from '../data/categories.js';
import { formatMoney } from '../utils/format.js';

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <span className="clock">
      {now.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
      {now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function POSPage() {
  const { products, cart, totals, settings, addToCart, replaceCartItem, checkout } = useApp();
  const toast = useToast();
  const isCompact = useMediaQuery('(max-width: 1023px)');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [customize, setCustomize] = useState(null); // { product, item? }
  const [payOpen, setPayOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  const active = useMemo(() => products.filter((p) => p.active), [products]);
  const q = search.trim().toLowerCase();
  const searched = useMemo(
    () => active.filter((p) => !q || p.name.toLowerCase().includes(q) || getCategory(p.category).label.includes(q)),
    [active, q],
  );
  const visible = category === 'all' ? searched : searched.filter((p) => p.category === category);
  const counts = useMemo(() => {
    const c = { all: searched.length };
    for (const p of searched) c[p.category] = (c[p.category] || 0) + 1;
    return c;
  }, [searched]);

  const inCartQty = useMemo(() => {
    const m = {};
    for (const i of cart.items) m[i.productId] = (m[i.productId] || 0) + i.qty;
    return m;
  }, [cart.items]);

  useEffect(() => {
    if (!isCompact) setCartOpen(false);
  }, [isCompact]);

  const quickAdd = (product) => {
    if (settings.askOptionsOnTap && getCategory(product.category).options.length > 0) {
      setCustomize({ product });
      return;
    }
    addToCart(product);
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`, 1400);
  };

  const handleCustomSubmit = (options, qty) => {
    const { product, item } = customize;
    if (item) {
      replaceCartItem(item.key, product, options, qty);
      toast.success(`แก้ไข ${product.name} แล้ว`);
    } else {
      addToCart(product, options, qty);
      toast.success(`เพิ่ม ${product.name} × ${qty} ลงตะกร้าแล้ว`);
    }
    setCustomize(null);
  };

  const editCartItem = (item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      toast.error('ไม่พบสินค้านี้ในระบบแล้ว (อาจถูกลบ) — แก้ไขตัวเลือกไม่ได้');
      return;
    }
    setCustomize({ product, item });
  };

  const openCheckout = () => {
    if (!cart.items.length) {
      toast.warning('กรุณาเพิ่มสินค้าลงตะกร้าก่อนชำระเงิน');
      return;
    }
    setCartOpen(false);
    setPayOpen(true);
  };

  const handlePaid = (payment) => {
    const order = checkout(payment);
    setPayOpen(false);
    setSuccessOrder(order);
    toast.success(`บันทึกออเดอร์ ${order.id} เรียบร้อย`);
  };

  return (
    <div className="pos">
      <section className="pos-products">
        <header className="pos-toolbar">
          <div className="pos-title">
            <h1>เมนู</h1>
            <Clock />
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="ค้นหาเมนู เช่น Latte, ชา..." className="grow" />
        </header>
        <CategoryTabs value={category} onChange={setCategory} counts={counts} />

        {active.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="ยังไม่มีสินค้าที่เปิดขาย"
            message="เพิ่มสินค้าหรือเปิดการขายสินค้าที่หน้าจัดการสินค้า"
            action={
              <Link to="/products" className="btn btn-primary">
                ไปหน้าจัดการสินค้า
              </Link>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="ไม่พบเมนูที่ค้นหา"
            message={q ? `ไม่มีเมนูที่ตรงกับ “${search}” ในหมวดนี้` : 'ยังไม่มีสินค้าในหมวดนี้'}
            action={
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                }}
              >
                แสดงเมนูทั้งหมด
              </button>
            }
          />
        ) : (
          <div className="product-grid">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} inCart={inCartQty[p.id] || 0} onAdd={quickAdd} onCustomize={(product) => setCustomize({ product })} />
            ))}
          </div>
        )}
      </section>

      {!isCompact && <CartPanel onEditItem={editCartItem} onCheckout={openCheckout} />}

      {isCompact && (
        <>
          <button className={`cart-fab ${totals.itemCount ? '' : 'empty'}`} onClick={() => setCartOpen(true)} aria-label="เปิดตะกร้าสินค้า">
            <span className="row-gap">
              <ShoppingBag size={20} />
              ตะกร้า <span className="fab-count">{totals.itemCount}</span>
            </span>
            <span className="row-gap">
              <strong>{formatMoney(totals.total)}</strong>
              <ChevronUp size={18} />
            </span>
          </button>
          {cartOpen && (
            <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setCartOpen(false)}>
              <div className="drawer">
                <CartPanel onEditItem={editCartItem} onCheckout={openCheckout} onClose={() => setCartOpen(false)} />
              </div>
            </div>
          )}
        </>
      )}

      {customize && (
        <CustomizeModal
          product={customize.product}
          initialOptions={customize.item?.options}
          initialQty={customize.item?.qty || 1}
          mode={customize.item ? 'edit' : 'add'}
          onClose={() => setCustomize(null)}
          onSubmit={handleCustomSubmit}
        />
      )}
      <PaymentModal open={payOpen} total={totals.total} onClose={() => setPayOpen(false)} onConfirm={handlePaid} />
      <OrderSuccessModal order={successOrder} onClose={() => setSuccessOrder(null)} />
    </div>
  );
}
