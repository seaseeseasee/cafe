import { useState } from 'react';
import Modal from './Modal.jsx';
import { Field, Segmented } from './FormControls.jsx';
import { validateDiscount, calcDiscountAmount } from '../utils/pricing.js';
import { formatMoney } from '../utils/format.js';

const PRESETS = [5, 10, 15, 20, 50];

export default function DiscountModal({ open, onClose, subtotal, current, onApply, onRemove }) {
  const [type, setType] = useState(current?.type || 'percent');
  const [value, setValue] = useState(current?.value ? String(current.value) : '');
  const [touched, setTouched] = useState(false);

  const error = validateDiscount(type, value, subtotal);
  const preview = error ? 0 : calcDiscountAmount(subtotal, { type, value: Number(value) });

  const apply = () => {
    setTouched(true);
    if (error) return;
    onApply({ type, value: Number(value) });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="ส่วนลดท้ายบิล"
      subtitle={`ยอดรวม ${formatMoney(subtotal)}`}
      footer={
        <>
          {current && (
            <button className="btn btn-ghost-danger" onClick={onRemove}>
              ลบส่วนลด
            </button>
          )}
          <button className="btn btn-outline" onClick={onClose}>
            ยกเลิก
          </button>
          <button className="btn btn-primary" onClick={apply}>
            ใช้ส่วนลด
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <Segmented
          name="ประเภทส่วนลด"
          value={type}
          onChange={(v) => {
            setType(v);
            setValue('');
            setTouched(false);
          }}
          options={[
            { id: 'percent', label: 'เปอร์เซ็นต์ (%)' },
            { id: 'amount', label: 'จำนวนเงิน (฿)' },
          ]}
        />
        {type === 'percent' && (
          <div className="check-chips mt">
            {PRESETS.map((p) => (
              <button key={p} type="button" className={`chip ${Number(value) === p ? 'active' : ''}`} onClick={() => setValue(String(p))}>
                {p}%
              </button>
            ))}
          </div>
        )}
        <Field label={type === 'percent' ? 'ส่วนลด (%)' : 'ส่วนลด (บาท)'} error={touched ? error : null} htmlFor="discount-value">
          <input
            id="discount-value"
            className="input input-lg"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={type === 'percent' ? 'เช่น 10' : 'เช่น 20'}
          />
        </Field>
        <div className="summary-line">
          <span>ลดไป</span>
          <strong className="text-success">-{formatMoney(preview)}</strong>
        </div>
        <div className="summary-line">
          <span>ยอดหลังหักส่วนลด</span>
          <strong>{formatMoney(subtotal - preview)}</strong>
        </div>
      </form>
    </Modal>
  );
}
