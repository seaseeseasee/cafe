import { useState } from 'react';
import { Printer, Ban } from 'lucide-react';
import Modal from './Modal.jsx';
import { Field } from './FormControls.jsx';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDateTime, formatMoney } from '../utils/format.js';
import { describeOptions } from '../utils/pricing.js';
import { paymentLabel } from '../utils/orders.js';
import StatusBadge from './StatusBadge.jsx';

export default function OrderDetailModal({ order, onClose }) {
  const { printOrder, voidOrder } = useApp();
  const toast = useToast();
  const [voiding, setVoiding] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!order) return null;
  const pay = order.payment;

  const confirmVoid = () => {
    const r = reason.trim();
    if (r.length < 3) {
      setReasonError('กรุณาระบุเหตุผลอย่างน้อย 3 ตัวอักษร');
      return;
    }
    voidOrder(order.id, r);
    toast.success(`ยกเลิกออเดอร์ ${order.id} แล้ว`);
    setVoiding(false);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="md"
      title={`ออเดอร์ ${order.id}`}
      subtitle={formatDateTime(order.createdAt)}
      footer={
        voiding ? (
          <>
            <button className="btn btn-outline" onClick={() => setVoiding(false)}>
              ย้อนกลับ
            </button>
            <button className="btn btn-danger" onClick={confirmVoid}>
              <Ban size={18} /> ยืนยันยกเลิกออเดอร์
            </button>
          </>
        ) : (
          <>
            {order.status === 'completed' && (
              <button className="btn btn-ghost-danger" onClick={() => setVoiding(true)}>
                <Ban size={18} /> ยกเลิกออเดอร์
              </button>
            )}
            <button className="btn btn-primary" onClick={() => printOrder(order, { copy: true })}>
              <Printer size={18} /> พิมพ์ใบเสร็จซ้ำ
            </button>
          </>
        )
      }
    >
      {voiding ? (
        <div>
          <div className="alert alert-danger">การยกเลิกจะไม่นับยอดออเดอร์นี้ใน Dashboard และไม่สามารถกู้คืนได้</div>
          <Field label="เหตุผลการยกเลิก" required error={reasonError} htmlFor="void-reason">
            <input
              id="void-reason"
              className="input"
              autoFocus
              maxLength={100}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError('');
              }}
              placeholder="เช่น ลูกค้ายกเลิก, คิดเงินผิด"
            />
          </Field>
          <div className="check-chips">
            {['ลูกค้ายกเลิก', 'คิดเงินผิด', 'ทำเครื่องดื่มผิด'].map((r) => (
              <button key={r} className="chip" onClick={() => { setReason(r); setReasonError(''); }}>
                {r}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="detail-meta">
            <div>
              <span className="muted small">สถานะ</span>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <span className="muted small">ชำระโดย</span>
              <strong>{paymentLabel(pay.method)}</strong>
            </div>
            <div>
              <span className="muted small">จำนวน</span>
              <strong>{order.itemCount} ชิ้น</strong>
            </div>
          </div>
          {order.status === 'voided' && (
            <div className="alert alert-danger">
              ยกเลิกเมื่อ {formatDateTime(order.voidedAt)} {order.voidReason ? `· เหตุผล: ${order.voidReason}` : ''}
            </div>
          )}
          <ul className="detail-items">
            {order.items.map((i) => {
              const opts = describeOptions(i.options);
              return (
                <li key={i.key}>
                  <div className="row-between">
                    <span>
                      <span aria-hidden="true">{i.emoji}</span> <strong>{i.name}</strong> × {i.qty}
                    </span>
                    <strong>{formatMoney(i.unitPrice * i.qty)}</strong>
                  </div>
                  {(opts.length > 0 || i.options?.note) && (
                    <div className="muted small">
                      {opts.join(' · ')}
                      {i.options?.note ? ` · 📝 ${i.options.note}` : ''}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="summary-line">
            <span>ยอดรวม</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          {order.discount && (
            <div className="summary-line">
              <span>ส่วนลด {order.discount.type === 'percent' ? `(${order.discount.value}%)` : ''}</span>
              <span className="text-success">-{formatMoney(order.discount.amount)}</span>
            </div>
          )}
          <div className="summary-line summary-total">
            <span>ยอดสุทธิ</span>
            <span>{formatMoney(order.total)}</span>
          </div>
          {pay.method === 'cash' && (
            <div className="summary-line muted">
              <span>รับเงิน {formatMoney(pay.received)}</span>
              <span>ทอน {formatMoney(pay.change)}</span>
            </div>
          )}
          {pay.reference && <div className="summary-line muted"><span>เลขอ้างอิง</span><span>{pay.reference}</span></div>}
          {pay.cardLast4 && <div className="summary-line muted"><span>บัตร</span><span>**** {pay.cardLast4}</span></div>}
        </>
      )}
    </Modal>
  );
}
