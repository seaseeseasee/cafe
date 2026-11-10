import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext.jsx';
import Receipt from './Receipt.jsx';

/** แสดงใบเสร็จเฉพาะตอนพิมพ์ (ซ่อนบนหน้าจอ) แล้วเรียก Browser Print */
export default function PrintReceipt() {
  const { printJob, settings, clearPrintJob } = useApp();

  useEffect(() => {
    if (!printJob) return undefined;
    const onAfter = () => clearPrintJob();
    window.addEventListener('afterprint', onAfter);
    // รอให้ DOM ใบเสร็จ render ก่อนเรียก print
    const timer = window.setTimeout(() => window.print(), 80);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', onAfter);
    };
  }, [printJob, clearPrintJob]);

  if (!printJob) return null;
  return createPortal(
    <div className="print-root">
      <Receipt order={printJob.order} settings={settings} copy={printJob.copy} />
    </div>,
    document.body,
  );
}
