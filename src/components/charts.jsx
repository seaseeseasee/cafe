import { useState } from 'react';
import { formatMoney } from '../utils/format.js';

function niceMax(v) {
  if (v <= 0) return 100;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
}

/** กราฟแท่งแนวตั้ง (series เดียว) + tooltip เมื่อชี้/แตะ */
export function BarChart({ data, height = 240, formatValue = formatMoney, ariaLabel }) {
  const [hover, setHover] = useState(null);
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const maxIdx = data.reduce((best, d, i) => (d.value > (data[best]?.value ?? -1) ? i : best), 0);

  return (
    <div className="bar-chart" style={{ height }} role="img" aria-label={ariaLabel}>
      <div className="bar-y">
        {[...ticks].reverse().map((t) => (
          <span key={t}>{formatValue(t, { symbol: false })}</span>
        ))}
      </div>
      <div className="bar-plot" onMouseLeave={() => setHover(null)}>
        <div className="bar-grids" aria-hidden="true">
          {ticks.map((t) => (
            <div key={t} className="bar-grid" style={{ bottom: `${(t / max) * 100}%` }} />
          ))}
        </div>
        <div className="bar-cols">
          {data.map((d, i) => (
            <div
              key={d.key}
              className={`bar-col ${hover === i ? 'hover' : ''}`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setHover(i)}
              tabIndex={0}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              aria-label={`${d.label}: ${formatValue(d.value)}`}
            >
              <div className="bar-track">
                <div className={`bar ${d.highlight ? 'today' : ''}`} style={{ height: `${(d.value / max) * 100}%` }}>
                  {i === maxIdx && d.value > 0 && hover === null && <span className="bar-direct">{formatValue(d.value)}</span>}
                </div>
              </div>
              <span className="bar-x">{d.label}</span>
              {hover === i && (
                <div className={`chart-tip ${i > data.length / 2 ? 'left' : ''}`}>
                  <strong>{d.tipTitle || d.label}</strong>
                  <span>{formatValue(d.value)}</span>
                  {d.sub && <span className="muted">{d.sub}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** สัดส่วนแบบแถบ 100% + legend ที่มีตัวเลขกำกับ (ไม่พึ่งสีอย่างเดียว) */
export function ShareBar({ items, ariaLabel }) {
  const [hover, setHover] = useState(null);
  const total = items.reduce((s, i) => s + i.value, 0);
  return (
    <div className="share" aria-label={ariaLabel}>
      <div className="share-bar" onMouseLeave={() => setHover(null)}>
        {items
          .filter((i) => i.value > 0)
          .map((i) => (
            <div
              key={i.id}
              className={`share-seg ${hover && hover !== i.id ? 'dim' : ''}`}
              style={{ flexGrow: i.value, background: i.color }}
              onMouseEnter={() => setHover(i.id)}
              title={`${i.label}: ${((i.value / total) * 100).toFixed(1)}%`}
            />
          ))}
      </div>
      <ul className="share-legend">
        {items.map((i) => {
          const pct = total ? (i.value / total) * 100 : 0;
          return (
            <li key={i.id} className={hover === i.id ? 'hover' : ''} onMouseEnter={() => setHover(i.id)} onMouseLeave={() => setHover(null)}>
              <span className="swatch" style={{ background: i.color }} aria-hidden="true" />
              <span className="grow">{i.label}</span>
              <span className="muted small">{i.count} บิล</span>
              <span className="num share-amt">{formatMoney(i.value)}</span>
              <strong className="num share-pct">{pct.toFixed(0)}%</strong>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
