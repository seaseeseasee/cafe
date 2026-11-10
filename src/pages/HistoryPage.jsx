import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReceiptText, Printer, Eye, SearchX } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import SearchInput from '../components/SearchInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import OrderDetailModal from '../components/OrderDetailModal.jsx';
import { formatDateTime, formatMoney } from '../utils/format.js';
import { PAYMENT_METHODS, paymentLabel, startOfDay } from '../utils/orders.js';

const RANGES = [
  { id: 'today', label: 'วันนี้', days: 0 },
  { id: '7d', label: '7 วัน', days: 6 },
  { id: '30d', label: '30 วัน', days: 29 },
  { id: 'all', label: 'ทั้งหมด' },
];
const PAGE = 20;

export default function HistoryPage() {
  const { orders, printOrder } = useApp();
  const [search, setSearch] = useState('');
  const [range, setRange] = useState('all');
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [limit, setLimit] = useState(PAGE);
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const r = RANGES.find((x) => x.id === range);
    const from = r.days !== undefined ? startOfDay(new Date(), -r.days) : null;
    return orders.filter(
      (o) =>
        (!from || new Date(o.createdAt) >= from) &&
        (method === 'all' || o.payment.method === method) &&
        (status === 'all' || o.status === status) &&
        (!q || o.id.toLowerCase().includes(q) || o.items.some((i) => i.name.toLowerCase().includes(q))),
    );
  }, [orders, search, range, method, status]);

  const sum = filtered.filter((o) => o.status === 'completed').reduce((s, o) => s + o.total, 0);
  const selected = orders.find((o) => o.id === selectedId);
  const reset = () => {
    setSearch('');
    setRange('all');
    setMethod('all');
    setStatus('all');
  };

  return (
    <div className="page">
      <PageHeader title="ประวัติการขาย" subtitle={`ทั้งหมด ${orders.length.toLocaleString()} ออเดอร์`} />

      {orders.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="ยังไม่มีประวัติการขาย"
          message="เมื่อชำระเงินที่หน้าขายสินค้า ออเดอร์จะแสดงที่นี่"
          action={
            <Link to="/" className="btn btn-primary">
              ไปหน้าขายสินค้า
            </Link>
          }
        />
      ) : (
        <>
          <div className="filters card">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setLimit(PAGE); }} placeholder="ค้นหาเลขที่ออเดอร์ หรือชื่อเมนู" className="grow" />
            <div className="segmented sm" role="radiogroup" aria-label="ช่วงเวลา">
              {RANGES.map((r) => (
                <button key={r.id} role="radio" aria-checked={range === r.id} className={`seg-btn ${range === r.id ? 'active' : ''}`} onClick={() => { setRange(r.id); setLimit(PAGE); }}>
                  {r.label}
                </button>
              ))}
            </div>
            <select className="input select" value={method} onChange={(e) => { setMethod(e.target.value); setLimit(PAGE); }} aria-label="วิธีชำระเงิน">
              <option value="all">ทุกวิธีชำระ</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <select className="input select" value={status} onChange={(e) => { setStatus(e.target.value); setLimit(PAGE); }} aria-label="สถานะ">
              <option value="all">ทุกสถานะ</option>
              <option value="completed">สำเร็จ</option>
              <option value="voided">ยกเลิก</option>
            </select>
          </div>

          <p className="muted small result-line">
            พบ {filtered.length.toLocaleString()} ออเดอร์ · ยอดขายสุทธิ (เฉพาะสำเร็จ) <strong>{formatMoney(sum)}</strong>
          </p>

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="ไม่พบออเดอร์"
              message="ลองเปลี่ยนคำค้นหาหรือตัวกรอง"
              action={<button className="btn btn-outline" onClick={reset}>ล้างตัวกรอง</button>}
            />
          ) : (
            <div className="card table-card">
              <table className="table orders-table">
                <thead>
                  <tr>
                    <th>เลขที่ออเดอร์</th>
                    <th>วันที่ / เวลา</th>
                    <th>รายการสินค้า</th>
                    <th className="num">ยอดขาย</th>
                    <th>ชำระโดย</th>
                    <th>สถานะ</th>
                    <th className="actions-col"><span className="sr-only">จัดการ</span></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, limit).map((o) => (
                    <tr key={o.id} className={o.status === 'voided' ? 'is-voided' : ''} onClick={() => setSelectedId(o.id)}>
                      <td data-label="เลขที่"><strong className="mono">{o.id}</strong></td>
                      <td data-label="เวลา">{formatDateTime(o.createdAt)}</td>
                      <td data-label="รายการ" className="items-cell">
                        {o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                      </td>
                      <td data-label="ยอดขาย" className="num"><strong>{formatMoney(o.total)}</strong></td>
                      <td data-label="ชำระโดย">{paymentLabel(o.payment.method)}</td>
                      <td data-label="สถานะ"><StatusBadge status={o.status} /></td>
                      <td className="actions-col" onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn ghost" onClick={() => setSelectedId(o.id)} aria-label={`ดูรายละเอียด ${o.id}`} title="ดูรายละเอียด">
                          <Eye size={18} />
                        </button>
                        <button className="icon-btn ghost" onClick={() => printOrder(o, { copy: true })} aria-label={`พิมพ์ใบเสร็จ ${o.id}`} title="พิมพ์ใบเสร็จซ้ำ">
                          <Printer size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > limit && (
                <div className="load-more">
                  <button className="btn btn-outline" onClick={() => setLimit((l) => l + PAGE)}>
                    แสดงเพิ่มอีก ({(filtered.length - limit).toLocaleString()} รายการ)
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {selected && <OrderDetailModal order={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
