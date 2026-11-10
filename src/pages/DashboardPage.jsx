import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ReceiptText, Coffee, Calculator, Trophy, Table2, BarChart3, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { BarChart, ShareBar } from '../components/charts.jsx';
import { summarize, dailySeries, startOfDay, PAYMENT_METHODS } from '../utils/orders.js';
import { formatMoney, formatDate } from '../utils/format.js';

const RANGES = [
  { id: 'today', label: 'วันนี้', days: 0 },
  { id: '7d', label: '7 วัน', days: 6 },
  { id: '30d', label: '30 วัน', days: 29 },
];

function RangeToggle({ value, onChange, options = RANGES, label }) {
  return (
    <div className="segmented sm" role="radiogroup" aria-label={label}>
      {options.map((r) => (
        <button key={r.id} role="radio" aria-checked={value === r.id} className={`seg-btn ${value === r.id ? 'active' : ''}`} onClick={() => onChange(r.id)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { orders } = useApp();
  const [range, setRange] = useState('7d');
  const [chartDays, setChartDays] = useState('14');
  const [tableView, setTableView] = useState(false);

  const now = new Date();
  const today = useMemo(() => summarize(orders, { from: startOfDay(now) }), [orders]); // eslint-disable-line react-hooks/exhaustive-deps
  // เทียบกับเมื่อวาน "ถึงเวลาเดียวกัน" เพื่อไม่ให้วันนี้ (ที่ยังไม่จบวัน) ดูต่ำเกินจริง
  const yesterday = useMemo(
    () => summarize(orders, { from: startOfDay(now, -1), to: new Date(now.getTime() - 24 * 60 * 60 * 1000) }),
    [orders], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const rangeDays = RANGES.find((r) => r.id === range).days;
  const inRange = useMemo(() => summarize(orders, { from: startOfDay(now, -rangeDays) }), [orders, rangeDays]); // eslint-disable-line react-hooks/exhaustive-deps
  const series = useMemo(() => dailySeries(orders, Number(chartDays)), [orders, chartDays]);

  if (!orders.some((o) => o.status === 'completed')) {
    return (
      <div className="page">
        <PageHeader title="แดชบอร์ด" />
        <EmptyState
          icon={LayoutDashboard}
          title="ยังไม่มีข้อมูลการขาย"
          message="เริ่มขายสินค้า หรือรีเซ็ตข้อมูล Demo ที่หน้าตั้งค่า เพื่อดูสรุปยอดขาย"
          action={<Link to="/" className="btn btn-primary">เริ่มขายสินค้า</Link>}
        />
      </div>
    );
  }

  const chartData = series.map((d, i) => ({
    key: d.key,
    label: Number(chartDays) > 7 ? formatDate(d.date, 'th', { day: 'numeric' }) : formatDate(d.date, 'th', { weekday: 'short' }),
    tipTitle: formatDate(d.date, 'th', { weekday: 'long', day: 'numeric', month: 'short' }),
    value: d.revenue,
    sub: `${d.count} ออเดอร์`,
    highlight: i === series.length - 1,
  }));
  const seriesTotal = series.reduce((s, d) => s + d.revenue, 0);
  const topMax = inRange.top[0]?.qty || 1;
  const shareItems = PAYMENT_METHODS.map((m) => ({
    id: m.id,
    label: m.label,
    color: m.color,
    value: inRange.byPayment.get(m.id)?.amount || 0,
    count: inRange.byPayment.get(m.id)?.count || 0,
  }));
  const rangeLabel = RANGES.find((r) => r.id === range).label;

  return (
    <div className="page">
      <PageHeader
        title="แดชบอร์ด"
        subtitle={`ข้อมูล ณ ${now.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })} · ตัวเลขเทียบกับเมื่อวาน ณ เวลาเดียวกัน`}
      />

      <div className="stat-grid">
        <StatCard icon={Wallet} label="ยอดขายวันนี้" value={formatMoney(today.revenue)} current={today.revenue} previous={yesterday.revenue} />
        <StatCard icon={ReceiptText} label="ออเดอร์วันนี้" value={`${today.orderCount} บิล`} current={today.orderCount} previous={yesterday.orderCount} />
        <StatCard icon={Coffee} label="สินค้าที่ขายได้วันนี้" value={`${today.itemsSold} ชิ้น`} current={today.itemsSold} previous={yesterday.itemsSold} />
        <StatCard icon={Calculator} label="ยอดเฉลี่ยต่อบิล (วันนี้)" value={formatMoney(today.avgPerBill)} current={today.avgPerBill} previous={yesterday.avgPerBill} />
      </div>

      <section className="card chart-card">
        <div className="card-head">
          <div>
            <h2>ยอดขายรายวัน</h2>
            <p className="muted small">
              รวม {chartDays} วันล่าสุด <strong>{formatMoney(seriesTotal)}</strong> · แท่งสีเข้ม = วันนี้
            </p>
          </div>
          <div className="row-gap wrap">
            <RangeToggle
              label="จำนวนวัน"
              value={chartDays}
              onChange={setChartDays}
              options={[{ id: '7', label: '7 วัน' }, { id: '14', label: '14 วัน' }]}
            />
            <button className="btn btn-ghost sm" onClick={() => setTableView((v) => !v)} aria-pressed={tableView}>
              {tableView ? <BarChart3 size={16} /> : <Table2 size={16} />} {tableView ? 'ดูกราฟ' : 'ดูตาราง'}
            </button>
          </div>
        </div>
        {tableView ? (
          <div className="table-scroll">
            <table className="table compact">
              <thead>
                <tr><th>วันที่</th><th className="num">ออเดอร์</th><th className="num">ยอดขาย</th></tr>
              </thead>
              <tbody>
                {[...series].reverse().map((d) => (
                  <tr key={d.key}>
                    <td>{formatDate(d.date, 'th', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                    <td className="num">{d.count}</td>
                    <td className="num">{formatMoney(d.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <BarChart data={chartData} ariaLabel={`กราฟยอดขายรายวัน ${chartDays} วัน`} />
        )}
      </section>

      <div className="two-col">
        <section className="card">
          <div className="card-head">
            <h2><Trophy size={20} className="text-accent" /> เมนูขายดี 5 อันดับ</h2>
            <RangeToggle label="ช่วงเวลาเมนูขายดี" value={range} onChange={setRange} />
          </div>
          {inRange.top.length === 0 ? (
            <EmptyState icon={Coffee} title={`ยังไม่มียอดขาย${rangeLabel}`} compact />
          ) : (
            <ol className="top-list">
              {inRange.top.map((p, idx) => (
                <li key={p.productId}>
                  <span className={`rank rank-${idx + 1}`}>{idx + 1}</span>
                  <span className="top-emoji" aria-hidden="true">{p.emoji}</span>
                  <div className="grow">
                    <div className="row-between">
                      <strong>{p.name}</strong>
                      <span className="small"><strong>{p.qty}</strong> แก้ว/ชิ้น</span>
                    </div>
                    <div className="top-bar-track">
                      <div className="top-bar" style={{ width: `${(p.qty / topMax) * 100}%` }} />
                    </div>
                    <span className="muted small">{formatMoney(p.revenue)}</span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>สัดส่วนช่องทางการชำระเงิน</h2>
            <RangeToggle label="ช่วงเวลาช่องทางชำระเงิน" value={range} onChange={setRange} />
          </div>
          {inRange.orderCount === 0 ? (
            <EmptyState icon={Wallet} title={`ยังไม่มียอดขาย${rangeLabel}`} compact />
          ) : (
            <>
              <p className="muted small">
                {rangeLabel}: {inRange.orderCount} บิล · {formatMoney(inRange.revenue)} · เฉลี่ย {formatMoney(inRange.avgPerBill)}/บิล
              </p>
              <ShareBar items={shareItems} ariaLabel="สัดส่วนยอดขายตามช่องทางชำระเงิน" />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
