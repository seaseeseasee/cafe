import { CheckCircle2, Printer, Plus } from 'lucide-react';
import Modal from './Modal.jsx';
import Receipt from './Receipt.jsx';
import { useApp } from '../context/AppContext.jsx';
import { formatMoney } from '../utils/format.js';
import { paymentLabel } from '../utils/orders.js';

/** สรุปการขายหลังชำระเงินสำเร็จ */
export default function OrderSuccessModal({ order, onClose }) {
  const { settings, printOrder } = useApp();
  if (!order) return null;
  const isCash = order.payment.method === 'cash';
  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      footer={
        <>
          <button className="btn btn-outline btn-lg" onClick={() => printOrder(order)}>
            <Printer size={20} /> พิมพ์ใบเสร็จ
          </button>
          <button className="btn btn-primary btn-lg grow" onClick={onClose} autoFocus>
            <Plus size={20} /> ออเดอร์ใหม่
          </button>
        </>
      }
    >
      <div className="success-head">
        <div className="success-icon">
          <CheckCircle2 size={44} />
        </div>
        <h2>ชำระเงินสำเร็จ</h2>
        <p className="muted">
          เลขที่ออเดอร์ <strong>{order.id}</strong> · {paymentLabel(order.payment.method)}
        </p>
      </div>
      <div className="success-stats">
        <div>
          <span>ยอดสุทธิ</span>
          <strong>{formatMoney(order.total, { decimals: 2 })}</strong>
        </div>
        {isCash && (
          <>
            <div>
              <span>รับเงิน</span>
              <strong>{formatMoney(order.payment.received, { decimals: 2 })}</strong>
            </div>
            <div className="highlight">
              <span>เงินทอน</span>
              <strong>{formatMoney(order.payment.change, { decimals: 2 })}</strong>
            </div>
          </>
        )}
      </div>
      <details className="receipt-preview">
        <summary>ดูตัวอย่างใบเสร็จ</summary>
        <Receipt order={order} settings={settings} />
      </details>
    </Modal>
  );
}
