import { CATEGORIES } from '../data/categories.js';

export default function CategoryTabs({ value, onChange, counts = {} }) {
  const tabs = [{ id: 'all', label: 'ทั้งหมด', emoji: '✨' }, ...CATEGORIES];
  return (
    <div className="category-tabs" role="tablist" aria-label="หมวดหมู่สินค้า">
      {tabs.map((c) => (
        <button
          key={c.id}
          role="tab"
          aria-selected={value === c.id}
          className={`chip ${value === c.id ? 'active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          <span aria-hidden="true">{c.emoji}</span> {c.label}
          {counts[c.id] !== undefined && <span className="chip-count">{counts[c.id]}</span>}
        </button>
      ))}
    </div>
  );
}
