import { formatDateTime, formatMoney } from '../utils/format.js';
import { describeOptions } from '../utils/pricing.js';
import { paymentLabel } from '../utils/orders.js';
import { receiptText } from '../utils/receiptText.js';

/** ใบเสร็จขนาด 80mm — ใช้ทั้งแสดงตัวอย่างบนจอและพิมพ์ */
export default function Receipt({ order, settings, copy = false }) {
  const lang = settings.language;
  const t = receiptText(lang);
  const pay = order.payment || {};
  return (
    <div className="receipt">
      <div className="receipt-head">
        {settings.logo && <img className="receipt-logo" src={settings.logo} alt="" />}
        <div className="receipt-shop">{settings.shopName}</div>
        {settings.address && <div>{settings.address}</div>}
        {settings.phone && (
          <div>
            {t.tel} {settings.phone}
          </div>
        )}
        {settings.taxId && (
          <div>
            {t.taxId} {settings.taxId}
          </div>
        )}
        <div className="receipt-title">
          {t.receipt}
          {copy ? ` (${t.copy})` : ''}
        </div>
      </div>
      <div className="receipt-row">
        <span>{t.order}</span>
        <span>{order.id}</span>
      </div>
      <div className="receipt-row">
        <span>{t.date}</span>
        <span>{formatDateTime(order.createdAt, lang)}</span>
      </div>
      <div className="receipt-sep" />
      {order.items.map((i) => {
        const opts = describeOptions(i.options);
        return (
          <div key={i.key} className="receipt-item">
            <div className="receipt-row">
              <span>
                {i.qty} × {i.name}
              </span>
              <span>{formatMoney(i.unitPrice * i.qty, { decimals: 2, symbol: false })}</span>
            </div>
            {opts.length > 0 && <div className="receipt-opt">{opts.join(', ')}</div>}
            {i.options?.note && (
              <div className="receipt-opt">
                {t.note}: {i.options.note}
              </div>
            )}
          </div>
        );
      })}
      <div className="receipt-sep" />
      <div className="receipt-row">
        <span>
          {t.subtotal} ({order.itemCount} {t.items})
        </span>
        <span>{formatMoney(order.subtotal, { decimals: 2, symbol: false })}</span>
      </div>
      {order.discount && (
        <div className="receipt-row">
          <span>
            {t.discount}
            {order.discount.type === 'percent' ? ` ${order.discount.value}%` : ''}
          </span>
          <span>-{formatMoney(order.discount.amount, { decimals: 2, symbol: false })}</span>
        </div>
      )}
      <div className="receipt-row receipt-total">
        <span>{t.total}</span>
        <span>{formatMoney(order.total, { decimals: 2 })}</span>
      </div>
      <div className="receipt-sep" />
      <div className="receipt-row">
        <span>{t.payment}</span>
        <span>{paymentLabel(pay.method, lang)}</span>
      </div>
      {pay.method === 'cash' && (
        <>
          <div className="receipt-row">
            <span>{t.received}</span>
            <span>{formatMoney(pay.received, { decimals: 2, symbol: false })}</span>
          </div>
          <div className="receipt-row">
            <span>{t.change}</span>
            <span>{formatMoney(pay.change, { decimals: 2, symbol: false })}</span>
          </div>
        </>
      )}
      {pay.cardLast4 && (
        <div className="receipt-row">
          <span>{t.card}</span>
          <span>**** {pay.cardLast4}</span>
        </div>
      )}
      {pay.reference && (
        <div className="receipt-row">
          <span>{t.ref}</span>
          <span>{pay.reference}</span>
        </div>
      )}
      {order.status === 'voided' && <div className="receipt-void">{t.voided}</div>}
      {settings.receiptFooter && <div className="receipt-footer">{settings.receiptFooter}</div>}
    </div>
  );
}
