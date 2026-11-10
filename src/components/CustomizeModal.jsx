import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import Modal from './Modal.jsx';
import ProductImage from './ProductImage.jsx';
import { Segmented } from './FormControls.jsx';
import { getCategory } from '../data/categories.js';
import { SIZES, SWEETNESS, STRENGTHS, MILKS, TOPPINGS, SHOT_PRICE, MAX_SHOTS, MAX_NOTE, DEFAULT_OPTIONS } from '../data/options.js';
import { normalizeOptions, calcUnitPrice } from '../utils/pricing.js';
import { formatMoney } from '../utils/format.js';

const plus = (p) => (p ? `+${p}` : '');

/** หน้าต่างปรับแต่งเครื่องดื่ม — ใช้ทั้งเพิ่มใหม่และแก้ไขรายการในตะกร้า */
export default function CustomizeModal({ product, initialOptions, initialQty = 1, mode = 'add', onClose, onSubmit }) {
  const [opts, setOpts] = useState(DEFAULT_OPTIONS);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (product) {
      setOpts({ ...DEFAULT_OPTIONS, ...(initialOptions || {}), toppings: initialOptions?.toppings || [] });
      setQty(initialQty);
    }
  }, [product, initialOptions, initialQty]);

  if (!product) return null;
  const allowed = getCategory(product.category).options;
  const has = (k) => allowed.includes(k);
  const normalized = normalizeOptions(product.category, opts);
  const unit = calcUnitPrice(product.price, normalized);
  const set = (k, v) => setOpts((o) => ({ ...o, [k]: v }));
  const toggleTopping = (id) =>
    setOpts((o) => ({ ...o, toppings: o.toppings.includes(id) ? o.toppings.filter((t) => t !== id) : [...o.toppings, id] }));

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={mode === 'edit' ? 'แก้ไขตัวเลือก' : 'เลือกตัวเลือกเพิ่มเติม'}
      footer={
        <>
          <div className="stepper lg">
            <button className="icon-btn" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="ลดจำนวน">
              <Minus size={18} />
            </button>
            <span className="stepper-value" aria-live="polite">{qty}</span>
            <button className="icon-btn" onClick={() => setQty((q) => Math.min(99, q + 1))} disabled={qty >= 99} aria-label="เพิ่มจำนวน">
              <Plus size={18} />
            </button>
          </div>
          <button className="btn btn-primary btn-lg grow" onClick={() => onSubmit(normalized, qty)}>
            {mode === 'edit' ? 'บันทึก' : 'เพิ่มลงตะกร้า'} · {formatMoney(unit * qty)}
          </button>
        </>
      }
    >
      <div className="customize-head">
        <ProductImage product={product} size={72} />
        <div>
          <h3>{product.name}</h3>
          <p className="muted">
            ราคาเริ่มต้น {formatMoney(product.price)} · ต่อแก้ว <strong className="text-accent">{formatMoney(unit)}</strong>
          </p>
        </div>
      </div>

      {has('size') && (
        <section className="opt-group">
          <h4>ขนาด</h4>
          <Segmented
            name="ขนาด"
            value={opts.size}
            onChange={(v) => set('size', v)}
            options={SIZES.map((s) => ({ id: s.id, label: s.label, sub: `${s.desc} ${plus(s.price)}` }))}
          />
        </section>
      )}

      {has('sweetness') && (
        <section className="opt-group">
          <h4>ระดับความหวาน</h4>
          <Segmented name="ความหวาน" value={Number(opts.sweetness)} onChange={(v) => set('sweetness', v)} options={SWEETNESS} />
        </section>
      )}

      {has('strength') && (
        <section className="opt-group">
          <h4>ความเข้มของกาแฟ</h4>
          <Segmented name="ความเข้ม" value={opts.strength} onChange={(v) => set('strength', v)} options={STRENGTHS} />
        </section>
      )}

      {has('milk') && (
        <section className="opt-group">
          <h4>ประเภทนม</h4>
          <Segmented
            name="ประเภทนม"
            className="wrap"
            value={opts.milk}
            onChange={(v) => set('milk', v)}
            options={MILKS.map((m) => ({ id: m.id, label: m.label, sub: plus(m.price) }))}
          />
        </section>
      )}

      {has('shot') && (
        <section className="opt-group opt-row">
          <div>
            <h4>เพิ่ม Shot</h4>
            <p className="muted small">Shot ละ {formatMoney(SHOT_PRICE)} (สูงสุด {MAX_SHOTS})</p>
          </div>
          <div className="stepper">
            <button className="icon-btn" onClick={() => set('shots', Math.max(0, opts.shots - 1))} disabled={opts.shots <= 0} aria-label="ลด Shot">
              <Minus size={16} />
            </button>
            <span className="stepper-value">{opts.shots}</span>
            <button
              className="icon-btn"
              onClick={() => set('shots', Math.min(MAX_SHOTS, opts.shots + 1))}
              disabled={opts.shots >= MAX_SHOTS}
              aria-label="เพิ่ม Shot"
            >
              <Plus size={16} />
            </button>
          </div>
        </section>
      )}

      {has('topping') && (
        <section className="opt-group">
          <h4>
            Topping <span className="muted small">(เลือกได้หลายอย่าง)</span>
          </h4>
          <div className="check-chips">
            {TOPPINGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`chip ${opts.toppings.includes(t.id) ? 'active' : ''}`}
                aria-pressed={opts.toppings.includes(t.id)}
                onClick={() => toggleTopping(t.id)}
              >
                {t.label} <small>+{t.price}</small>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="opt-group">
        <h4>หมายเหตุเพิ่มเติม</h4>
        <textarea
          className="input"
          rows={2}
          maxLength={MAX_NOTE}
          value={opts.note}
          onChange={(e) => set('note', e.target.value)}
          placeholder="เช่น น้ำแข็งน้อย, แยกน้ำแข็ง, อุ่นร้อน"
        />
        <p className="field-hint right">
          {opts.note.length}/{MAX_NOTE}
        </p>
      </section>
    </Modal>
  );
}
