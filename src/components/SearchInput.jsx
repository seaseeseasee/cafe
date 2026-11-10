import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'ค้นหา...', className = '' }) {
  return (
    <div className={`search-input ${className}`}>
      <Search size={18} aria-hidden="true" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      {value && (
        <button className="icon-btn ghost sm" onClick={() => onChange('')} aria-label="ล้างคำค้นหา">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
