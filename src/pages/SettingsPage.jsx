import { useEffect, useRef, useState } from 'react';
import { Save, ImagePlus, Trash2, RotateCcw, Eraser, Store, Printer, Database, Loader2, Undo2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { useConfirm } from '../context/ConfirmContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Receipt from '../components/Receipt.jsx';
import { Field, Toggle, Segmented } from '../components/FormControls.jsx';
import { validateSettings, hasErrors } from '../utils/validation.js';
import { readImageFile } from '../utils/image.js';

const SAMPLE_ORDER = {
  id: 'ORD-SAMPLE-0001',
  createdAt: new Date().toISOString(),
  items: [
    { key: 'a', name: 'Latte', qty: 1, unitPrice: 65, options: { size: 'M', sweetness: 50, milk: 'fresh', shots: 0, toppings: [] } },
    { key: 'b', name: 'Croissant', qty: 2, unitPrice: 55, options: {} },
  ],
  itemCount: 3,
  subtotal: 175,
  discount: null,
  total: 175,
  payment: { method: 'cash', received: 200, change: 25 },
  status: 'completed',
};

export default function SettingsPage() {
  const { settings, updateSettings, resetDemo, clearSales, orders, printOrder } = useApp();
  const confirm = useConfirm();
  const toast = useToast();
  const logoRef = useRef(null);
  const [form, setForm] = useState(settings);
  const [errors, setErrors] = useState({});
  const [loadingLogo, setLoadingLogo] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const dirty = JSON.stringify(form) !== JSON.stringify(settings);
  const set = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (errors[k]) setErrors(validateSettings(next));
  };

  const save = (e) => {
    e?.preventDefault();
    const errs = validateSettings(form);
    setErrors(errs);
    if (hasErrors(errs)) {
      toast.error('กรุณาตรวจสอบข้อมูลให้ถูกต้อง');
      return;
    }
    updateSettings({ ...form, shopName: form.shopName.trim(), phone: form.phone.trim(), taxId: form.taxId.trim() });
    toast.success('บันทึกการตั้งค่าร้านค้าแล้ว');
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLoadingLogo(true);
    try {
      set('logo', await readImageFile(file, 200));
      toast.info('อัปโหลดโลโก้แล้ว — กด “บันทึก” เพื่อยืนยัน');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingLogo(false);
    }
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: 'รีเซ็ตเป็นข้อมูล Demo?',
      message: 'สินค้า ประวัติการขาย การตั้งค่า และตะกร้าทั้งหมดจะถูกแทนที่ด้วยข้อมูลตัวอย่างเริ่มต้น',
      confirmText: 'รีเซ็ตข้อมูล',
      danger: true,
    });
    if (ok) {
      resetDemo();
      toast.success('รีเซ็ตข้อมูล Demo เรียบร้อย');
    }
  };

  const handleClearSales = async () => {
    const ok = await confirm({
      title: 'ลบประวัติการขายทั้งหมด?',
      message: `ออเดอร์ ${orders.length.toLocaleString()} รายการจะถูกลบถาวร Dashboard จะไม่มีข้อมูล`,
      confirmText: 'ลบประวัติทั้งหมด',
      danger: true,
    });
    if (ok) {
      clearSales();
      toast.success('ลบประวัติการขายแล้ว');
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="ตั้งค่าร้านค้า"
        subtitle="ข้อมูลนี้ใช้แสดงบนเมนูและใบเสร็จ"
        actions={
          <>
            <button className="btn btn-outline" onClick={() => { setForm(settings); setErrors({}); }} disabled={!dirty}>
              <Undo2 size={18} /> คืนค่า
            </button>
            <button className="btn btn-primary" onClick={save} disabled={!dirty}>
              <Save size={18} /> บันทึก
            </button>
          </>
        }
      />

      <div className="settings-layout">
        <form className="settings-forms" onSubmit={save} noValidate>
          <section className="card">
            <h2 className="section-title"><Store size={20} /> ข้อมูลร้าน</h2>
            <div className="logo-row">
              {form.logo ? <img src={form.logo} alt="โลโก้ร้าน" className="logo-preview" /> : <div className="logo-preview empty">☕</div>}
              <div>
                <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={onLogo} />
                <div className="row-gap wrap">
                  <button type="button" className="btn btn-outline sm" onClick={() => logoRef.current?.click()} disabled={loadingLogo}>
                    {loadingLogo ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />} {form.logo ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้'}
                  </button>
                  {form.logo && (
                    <button type="button" className="btn btn-ghost-danger sm" onClick={() => set('logo', '')}>
                      <Trash2 size={15} /> ลบโลโก้
                    </button>
                  )}
                </div>
                <p className="field-hint">แนะนำรูปสี่เหลี่ยมจัตุรัส PNG พื้นใส</p>
              </div>
            </div>
            <Field label="ชื่อร้าน" required error={errors.shopName} htmlFor="s-name">
              <input id="s-name" className="input" maxLength={50} value={form.shopName} onChange={(e) => set('shopName', e.target.value)} />
            </Field>
            <Field label="ที่อยู่ร้าน" error={errors.address} htmlFor="s-addr">
              <textarea id="s-addr" className="input" rows={2} maxLength={200} value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <div className="grid-2">
              <Field label="เบอร์โทรศัพท์" error={errors.phone} htmlFor="s-phone">
                <input id="s-phone" className="input" inputMode="tel" maxLength={20} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="02-123-4567" />
              </Field>
              <Field label="เลขประจำตัวผู้เสียภาษี (ถ้ามี)" error={errors.taxId} htmlFor="s-tax">
                <input id="s-tax" className="input" inputMode="numeric" maxLength={13} value={form.taxId} onChange={(e) => set('taxId', e.target.value.replace(/\D/g, ''))} placeholder="13 หลัก" />
              </Field>
            </div>
          </section>

          <section className="card">
            <h2 className="section-title"><Printer size={20} /> ใบเสร็จ & การชำระเงิน</h2>
            <Field label="ข้อความท้ายใบเสร็จ" error={errors.receiptFooter} hint={`${(form.receiptFooter || '').length}/150`} htmlFor="s-footer">
              <textarea id="s-footer" className="input" rows={2} maxLength={150} value={form.receiptFooter} onChange={(e) => set('receiptFooter', e.target.value)} />
            </Field>
            <div className="grid-2">
              <Field label="สกุลเงิน" hint="เวอร์ชัน Demo รองรับเฉพาะเงินบาท" htmlFor="s-cur">
                <select id="s-cur" className="input select" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  <option value="THB">THB – บาทไทย (฿)</option>
                </select>
              </Field>
              <Field label="ภาษาบนใบเสร็จ">
                <Segmented name="ภาษา" value={form.language} onChange={(v) => set('language', v)} options={[{ id: 'th', label: 'ไทย' }, { id: 'en', label: 'English' }]} />
              </Field>
            </div>
            <div className="grid-3">
              <Field label="ธนาคาร (รับโอน)" htmlFor="s-bank">
                <input id="s-bank" className="input" maxLength={30} value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
              </Field>
              <Field label="เลขบัญชี" required error={errors.bankAccount} htmlFor="s-acc">
                <input id="s-acc" className="input" maxLength={20} value={form.bankAccount} onChange={(e) => set('bankAccount', e.target.value)} />
              </Field>
              <Field label="ชื่อบัญชี" htmlFor="s-accname">
                <input id="s-accname" className="input" maxLength={50} value={form.bankAccountName} onChange={(e) => set('bankAccountName', e.target.value)} />
              </Field>
            </div>
            <Toggle id="s-ask" checked={form.askOptionsOnTap} onChange={(v) => set('askOptionsOnTap', v)} label="เปิดหน้าต่างตัวเลือกทุกครั้งที่แตะเครื่องดื่มในหน้าขาย" />
          </section>

          <section className="card">
            <h2 className="section-title"><Database size={20} /> ข้อมูล Demo</h2>
            <p className="muted small">ข้อมูลทั้งหมดเก็บใน LocalStorage ของเบราว์เซอร์นี้เท่านั้น ({orders.length.toLocaleString()} ออเดอร์)</p>
            <div className="row-gap wrap">
              <button type="button" className="btn btn-outline" onClick={handleReset}>
                <RotateCcw size={18} /> รีเซ็ตเป็นข้อมูล Demo
              </button>
              <button type="button" className="btn btn-ghost-danger" onClick={handleClearSales} disabled={!orders.length}>
                <Eraser size={18} /> ลบประวัติการขายทั้งหมด
              </button>
            </div>
          </section>
          <button type="submit" hidden />
        </form>

        <aside className="receipt-side">
          <div className="card">
            <div className="card-head">
              <h2>ตัวอย่างใบเสร็จ</h2>
              <button className="btn btn-ghost sm" onClick={() => printOrder({ ...SAMPLE_ORDER, createdAt: new Date().toISOString() })}>
                <Printer size={16} /> ทดลองพิมพ์
              </button>
            </div>
            <div className="receipt-frame">
              <Receipt order={SAMPLE_ORDER} settings={form} />
            </div>
            {dirty && <p className="field-hint">แสดงตามข้อมูลที่ยังไม่บันทึก · ทดลองพิมพ์ใช้ค่าที่บันทึกแล้ว</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
