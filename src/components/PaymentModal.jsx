import { useEffect, useMemo, useState } from 'react';
import { Banknote, Landmark, QrCode, CreditCard, Loader2, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import Modal from './Modal.jsx';
import MockQR from './MockQR.jsx';
import { Field } from './FormControls.jsx';
import { formatMoney, round2 } from '../utils/format.js';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const METHODS = [
  { id: 'cash', label: 'เงินสด', icon: Banknote },
  { id: 'transfer', label: 'โอนเงิน', icon: Landmark },
  { id: 'qr', label: 'QR Payment', icon: QrCode, demo: true },
  { id: 'card', label: 'บัตรเครดิต', icon: CreditCard, demo: true },
];

function quickCash(total) {
  const set = new Set([total]);
  for (const step of [20, 50, 100]) set.add(Math.ceil(total / step) * step);
  for (const bill of [500, 1000]) if (bill >= total) set.add(bill);
  return [...set].filter((v) => v >= total).sort((a, b) => a - b).slice(0, 5);
}

export default function PaymentModal({ open, total, onClose, onConfirm }) {
  const { settings } = useApp();
  const toast = useToast();
  const [method, setMethod] = useState('cash');
  const [received, setReceived] = useState('');
  const [reference, setReference] = useState('');
  const [last4, setLast4] = useState('');
  const [touched, setTouched] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (open) {
      setMethod('cash');
      setReceived('');
      setReference('');
      setLast4('');
      setTouched(false);
      setProcessing(false);
    }
  }, [open]);

  const quick = useMemo(() => quickCash(total), [total]);
  const receivedNum = Number(received);
  const change = round2(receivedNum - total);

  const error = useMemo(() => {
    if (method === 'cash') {
      if (received === '') return 'กรุณากรอกจำนวนเงินที่รับจากลูกค้า';
      if (!Number.isFinite(receivedNum) || receivedNum < 0) return 'จำนวนเงินไม่ถูกต้อง';
      if (receivedNum < total) return `รับเงินไม่ครบ ขาดอีก ${formatMoney(total - receivedNum)}`;
      if (receivedNum > 1000000) return 'จำนวนเงินสูงเกินไป';
    }
    if (method === 'transfer' && reference && !/^[A-Za-z0-9-]{4,30}$/.test(reference))
      return 'เลขอ้างอิงต้องเป็นตัวอักษรอังกฤษ/ตัวเลข 4–30 ตัว';
    if (method === 'card' && !/^\d{4}$/.test(last4)) return 'กรุณากรอกเลขท้ายบัตร 4 หลัก';
    return null;
  }, [method, received, receivedNum, total, reference, last4]);

  const submit = () => {
    setTouched(true);
    if (error) {
      toast.error(error);
      return;
    }
    const payment = { method };
    if (method === 'cash') Object.assign(payment, { received: receivedNum, change });
    if (method === 'transfer' && reference) payment.reference = reference.toUpperCase();
    if (method === 'qr') payment.reference = `QR${Date.now().toString().slice(-8)}`;
    if (method === 'card') payment.cardLast4 = last4;

    if (method === 'card' || method === 'qr') {
      // จำลองการติดต่อเครื่องรับบัตร / ตรวจสอบการชำระเงิน
      setProcessing(true);
      window.setTimeout(() => onConfirm(payment), 1200);
      return;
    }
    onConfirm(payment);
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(settings.bankAccount.replace(/\D/g, ''));
      toast.success('คัดลอกเลขบัญชีแล้ว');
    } catch {
      toast.error('คัดลอกไม่สำเร็จ');
    }
  };

  const confirmLabel = {
    cash: 'ยืนยันรับเงินสด',
    transfer: 'ยืนยันได้รับเงินโอนแล้ว',
    qr: 'ลูกค้าสแกนชำระแล้ว',
    card: 'ชำระด้วยบัตร',
  }[method];

  return (
    <Modal
      open={open}
      onClose={processing ? undefined : onClose}
      dismissable={!processing}
      size="lg"
      title="ชำระเงิน"
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={processing}>
            ยกเลิก
          </button>
          <button className="btn btn-primary btn-lg grow" onClick={submit} disabled={processing || (method === 'cash' && touched && !!error)}>
            {processing ? (
              <>
                <Loader2 size={20} className="spin" /> กำลังตรวจสอบการชำระเงิน...
              </>
            ) : (
              <>
                <CheckCircle2 size={20} /> {confirmLabel}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="pay-total">
        <span>ยอดที่ต้องชำระ</span>
        <strong>{formatMoney(total, { decimals: 2 })}</strong>
      </div>

      <div className="pay-methods" role="radiogroup" aria-label="วิธีชำระเงิน">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              role="radio"
              aria-checked={method === m.id}
              className={`pay-method ${method === m.id ? 'active' : ''}`}
              onClick={() => {
                setMethod(m.id);
                setTouched(false);
              }}
              disabled={processing}
            >
              <Icon size={26} />
              <span>{m.label}</span>
              {m.demo && <small>จำลอง</small>}
            </button>
          );
        })}
      </div>

      {method === 'cash' && (
        <div className="pay-panel">
          <Field label="รับเงินจากลูกค้า (บาท)" error={touched && error ? error : null} htmlFor="cash-received">
            <input
              id="cash-received"
              className="input input-xl"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              autoFocus
              value={received}
              onChange={(e) => {
                setReceived(e.target.value);
                setTouched(true);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="0"
            />
          </Field>
          <div className="quick-cash">
            {quick.map((v, idx) => (
              <button key={v} className={`chip lg ${receivedNum === v ? 'active' : ''}`} onClick={() => { setReceived(String(v)); setTouched(true); }}>
                {idx === 0 ? `พอดี ${formatMoney(v)}` : formatMoney(v)}
              </button>
            ))}
          </div>
          <div className={`change-box ${received !== '' && receivedNum < total ? 'warn' : ''}`}>
            {received !== '' && receivedNum < total ? (
              <>
                <AlertCircle size={20} />
                <span>รับเงินไม่ครบ ขาดอีก</span>
                <strong>{formatMoney(total - receivedNum, { decimals: 2 })}</strong>
              </>
            ) : (
              <>
                <span>เงินทอน</span>
                <strong>{formatMoney(received === '' ? 0 : change, { decimals: 2 })}</strong>
              </>
            )}
          </div>
        </div>
      )}

      {method === 'transfer' && (
        <div className="pay-panel">
          <div className="bank-card">
            <Landmark size={28} />
            <div className="grow">
              <div className="muted small">ธนาคาร{settings.bankName}</div>
              <div className="bank-no">{settings.bankAccount}</div>
              <div className="small">{settings.bankAccountName}</div>
            </div>
            <button className="btn btn-outline sm" onClick={copyAccount}>
              <Copy size={15} /> คัดลอก
            </button>
          </div>
          <Field label="เลขอ้างอิงการโอน (ไม่บังคับ)" error={touched && error ? error : null} hint="ตรวจสอบสลิปจากลูกค้าก่อนยืนยัน" htmlFor="ref">
            <input id="ref" className="input" value={reference} maxLength={30} onChange={(e) => setReference(e.target.value.trim())} placeholder="เช่น 0123ABCD" />
          </Field>
        </div>
      )}

      {method === 'qr' && (
        <div className="pay-panel center">
          <div className="qr-box">
            <div className="qr-brand">PromptPay · QR จำลอง</div>
            <MockQR value={`${settings.shopName}-${total}`} size={190} />
            <div className="qr-amount">{formatMoney(total, { decimals: 2 })}</div>
            <div className="muted small">{settings.shopName}</div>
          </div>
          <p className="muted small">ให้ลูกค้าสแกน QR แล้วกดยืนยันเมื่อได้รับการชำระ (โหมด Demo ไม่มีการตัดเงินจริง)</p>
        </div>
      )}

      {method === 'card' && (
        <div className="pay-panel">
          <div className="card-mock">
            <div className="card-chip" />
            <div className="card-number">**** **** **** {last4.padEnd(4, '•')}</div>
            <div className="card-label">DEMO CARD</div>
          </div>
          <Field label="เลขท้ายบัตร 4 หลัก" error={touched && error ? error : null} hint="จำลองการรูด/แตะบัตร — ไม่มีการเก็บข้อมูลบัตรจริง" htmlFor="last4">
            <input
              id="last4"
              className="input input-lg"
              inputMode="numeric"
              maxLength={4}
              value={last4}
              onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="1234"
              autoFocus
            />
          </Field>
        </div>
      )}
    </Modal>
  );
}
