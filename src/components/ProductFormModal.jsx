import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';
import ProductImage from './ProductImage.jsx';
import { Field, Toggle } from './FormControls.jsx';
import { CATEGORIES } from '../data/categories.js';
import { PRODUCT_COLORS, PRODUCT_EMOJIS } from '../data/defaultProducts.js';
import { validateProduct, hasErrors } from '../utils/validation.js';
import { readImageFile, MAX_UPLOAD_MB } from '../utils/image.js';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = { name: '', price: '', category: 'coffee', emoji: '☕', color: PRODUCT_COLORS[1], image: '', active: true };

export default function ProductFormModal({ product, products, onClose, onSave }) {
  const toast = useToast();
  const fileRef = useRef(null);
  const [form, setForm] = useState(() => (product ? { ...product, price: String(product.price) } : EMPTY));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);

  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (submitted) setErrors(validateProduct(next, products));
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLoadingImg(true);
    try {
      set('image', await readImageFile(file));
      toast.success('อัปโหลดรูปภาพแล้ว');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingImg(false);
    }
  };

  const submit = (e) => {
    e?.preventDefault();
    setSubmitted(true);
    const errs = validateProduct(form, products);
    setErrors(errs);
    if (hasErrors(errs)) {
      toast.error('กรุณาตรวจสอบข้อมูลสินค้าให้ถูกต้อง');
      return;
    }
    onSave({ ...form, name: form.name.trim(), price: Number(form.price) });
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
      footer={
        <>
          <button className="btn btn-outline" onClick={onClose}>ยกเลิก</button>
          <button className="btn btn-primary" onClick={submit} disabled={loadingImg}>
            {product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </>
      }
    >
      <form className="product-form" onSubmit={submit} noValidate>
        <div className="product-form-image">
          <ProductImage product={form} size={150} />
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden onChange={onFile} />
          <div className="row-gap wrap center">
            <button type="button" className="btn btn-outline sm" onClick={() => fileRef.current?.click()} disabled={loadingImg}>
              {loadingImg ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />} {form.image ? 'เปลี่ยนรูป' : 'อัปโหลดรูป'}
            </button>
            {form.image && (
              <button type="button" className="btn btn-ghost-danger sm" onClick={() => set('image', '')}>
                <Trash2 size={15} /> ลบรูป
              </button>
            )}
          </div>
          <p className="field-hint center">PNG/JPG/WEBP ไม่เกิน {MAX_UPLOAD_MB}MB (ระบบย่อขนาดให้อัตโนมัติ)</p>
        </div>

        <div className="product-form-fields">
          <Field label="ชื่อสินค้า" required error={errors.name} htmlFor="pf-name">
            <input id="pf-name" className="input" value={form.name} maxLength={40} onChange={(e) => set('name', e.target.value)} placeholder="เช่น Iced Latte" autoFocus />
          </Field>
          <div className="grid-2">
            <Field label="ราคา (บาท)" required error={errors.price} htmlFor="pf-price">
              <input id="pf-price" className="input" type="number" inputMode="decimal" min="0" step="any" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0" />
            </Field>
            <Field label="หมวดหมู่" required error={errors.category} htmlFor="pf-cat">
              <select id="pf-cat" className="input select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {!form.image && (
            <>
              <Field label="ไอคอน (ใช้เมื่อไม่มีรูปภาพ)">
                <div className="emoji-pick">
                  {PRODUCT_EMOJIS.map((em) => (
                    <button type="button" key={em} className={`emoji-btn ${form.emoji === em ? 'active' : ''}`} onClick={() => set('emoji', em)} aria-label={`ไอคอน ${em}`} aria-pressed={form.emoji === em}>
                      {em}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="สีพื้นหลัง">
                <div className="color-pick">
                  {PRODUCT_COLORS.map((c) => (
                    <button type="button" key={c} className={`color-btn ${form.color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => set('color', c)} aria-label={`สี ${c}`} aria-pressed={form.color === c} />
                  ))}
                </div>
              </Field>
            </>
          )}
          <Toggle id="pf-active" checked={form.active} onChange={(v) => set('active', v)} label={form.active ? 'เปิดขาย (แสดงในหน้าขาย)' : 'ปิดการขาย (ซ่อนจากหน้าขาย)'} />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
