import { useState } from 'react';
import { Minus, Plus, Trash2, Pencil, ShoppingBag, TicketPercent, X, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from './EmptyState.jsx';
import DiscountModal from './DiscountModal.jsx';
import { formatMoney } from '../utils/format.js';
import { describeOptions } from '../utils/pricing.js';
import { getCategory } from '../data/categories.js';

export default function CartPanel({ onEditItem, onCheckout, onClose }) {
  const { cart, totals, setQty, removeFromCart, clearCart, setDiscount } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const [discountOpen, setDiscountOpen] = useState(false);
  const empty = cart.items.length === 0;

  const handleClear = async () => {
    const ok = await confirm({
      title: 'ล้างตะกร้าสินค้า?',
      message: `รายการทั้งหมด ${totals.itemCount} ชิ้นจะถูกนำออกจากตะกร้า`,
      confirmText: 'ล้างตะกร้า',
      danger: true,
    });
    if (ok) {
      clearCart();
      toast.info('ล้างตะกร้าแล้ว');
    }
  };

  const handleRemove = (item) => {
    removeFromCart(item.key);
    toast.info(`นำ ${item.name} ออกจากตะกร้าแล้ว`);
  };

  return (
    <aside className="cart-panel" aria-label="ตะกร้าสินค้า">
      <div className="cart-header">
        <div>
          <h2>ออเดอร์ปัจจุบัน</h2>
          <p className="muted small">{empty ? 'ยังไม่มีสินค้า' : `${totals.itemCount} ชิ้น · ${cart.items.length} รายการ`}</p>
        </div>
        <div className="row-gap">
          <button className="btn btn-ghost-danger sm" onClick={handleClear} disabled={empty}>
            <Trash2 size={16} /> ล้าง
          </button>
          {onClose && (
            <button className="icon-btn ghost" onClick={onClose} aria-label="ปิดตะกร้า">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="cart-items">
        {empty ? (
          <EmptyState icon={ShoppingBag} title="ตะกร้ายังว่าง" message="แตะที่เมนูทางซ้ายเพื่อเพิ่มสินค้าลงตะกร้า" compact />
        ) : (
          cart.items.map((item) => {
            const opts = describeOptions(item.options);
            const customizable = getCategory(item.category).options.length > 0;
            return (
              <div key={item.key} className="cart-item">
                <div className="cart-item-top">
                  <div className="cart-item-name">
                    <span aria-hidden="true">{item.emoji}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <span className="muted small">{formatMoney(item.unitPrice)} / ชิ้น</span>
                    </div>
                  </div>
                  <strong className="cart-line-total">{formatMoney(item.unitPrice * item.qty)}</strong>
                </div>
                {(opts.length > 0 || item.options.note) && (
                  <div className="cart-item-opts">
                    {opts.map((o) => (
                      <span key={o} className="tag">
                        {o}
                      </span>
                    ))}
                    {item.options.note && <span className="tag tag-note">📝 {item.options.note}</span>}
                  </div>
                )}
                <div className="cart-item-actions">
                  <div className="stepper">
                    <button className="icon-btn" onClick={() => setQty(item.key, item.qty - 1)} aria-label={`ลดจำนวน ${item.name}`}>
                      <Minus size={16} />
                    </button>
                    <span className="stepper-value">{item.qty}</span>
                    <button
                      className="icon-btn"
                      onClick={() => setQty(item.key, Math.min(99, item.qty + 1))}
                      disabled={item.qty >= 99}
                      aria-label={`เพิ่มจำนวน ${item.name}`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="row-gap">
                    {customizable && (
                      <button className="btn btn-ghost sm" onClick={() => onEditItem(item)}>
                        <Pencil size={15} /> แก้ไข
                      </button>
                    )}
                    <button className="icon-btn ghost danger" onClick={() => handleRemove(item)} aria-label={`ลบ ${item.name}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="cart-footer">
        <div className="summary-line">
          <span>ยอดรวม</span>
          <span>{formatMoney(totals.subtotal)}</span>
        </div>
        <div className="summary-line">
          <span className="row-gap">
            ส่วนลด
            {cart.discount && (
              <span className="tag tag-success">
                {cart.discount.type === 'percent' ? `${cart.discount.value}%` : formatMoney(cart.discount.value)}
              </span>
            )}
          </span>
          <span className="row-gap">
            <span className={totals.discountAmount ? 'text-success' : 'muted'}>-{formatMoney(totals.discountAmount)}</span>
            <button className="btn btn-ghost sm" onClick={() => setDiscountOpen(true)} disabled={empty}>
              <TicketPercent size={15} /> {cart.discount ? 'แก้ไข' : 'เพิ่ม'}
            </button>
          </span>
        </div>
        <div className="summary-line summary-total">
          <span>ยอดสุทธิ</span>
          <span>{formatMoney(totals.total)}</span>
        </div>
        <button className="btn btn-primary btn-lg btn-block" onClick={onCheckout} disabled={empty}>
          <CreditCard size={20} /> ชำระเงิน {empty ? '' : formatMoney(totals.total)}
        </button>
      </div>

      {discountOpen && (
        <DiscountModal
          open
          subtotal={totals.subtotal}
          current={cart.discount}
          onClose={() => setDiscountOpen(false)}
          onApply={(d) => {
            setDiscount(d);
            setDiscountOpen(false);
            toast.success('ใช้ส่วนลดเรียบร้อย');
          }}
          onRemove={() => {
            setDiscount(null);
            setDiscountOpen(false);
            toast.info('ลบส่วนลดแล้ว');
          }}
        />
      )}
    </aside>
  );
}
