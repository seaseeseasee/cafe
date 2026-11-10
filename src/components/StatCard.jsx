import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/** การ์ดตัวเลขสรุป พร้อมเทียบกับเมื่อวาน */
export default function StatCard({ icon: Icon, label, value, current, previous, compareLabel = 'เทียบเมื่อวาน' }) {
  let delta = null;
  if (previous !== undefined) {
    if (previous === 0) delta = current > 0 ? null : 0;
    else delta = ((current - previous) / previous) * 100;
  }
  const dir = delta === null ? 'none' : delta > 0.5 ? 'up' : delta < -0.5 ? 'down' : 'flat';
  const DeltaIcon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus;
  return (
    <div className="stat-card card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">
          <Icon size={20} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      {previous !== undefined && (
        <div className={`stat-delta ${dir}`}>
          {delta === null ? (
            <span>ยังไม่มีข้อมูลเมื่อวาน</span>
          ) : (
            <>
              <DeltaIcon size={15} />
              <span>
                {delta > 0 ? '+' : ''}
                {delta.toFixed(1)}% {compareLabel}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
