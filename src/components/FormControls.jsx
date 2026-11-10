/** ส่วนประกอบฟอร์มที่ใช้ซ้ำ */
export function Field({ label, error, hint, required, children, htmlFor }) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      {label && (
        <label className="field-label" htmlFor={htmlFor}>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled, id }) {
  return (
    <label className={`toggle ${disabled ? 'disabled' : ''}`} htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}

/** ปุ่มเลือกแบบ segment (เลือกได้ 1 ค่า) */
export function Segmented({ options, value, onChange, name, className = '' }) {
  return (
    <div className={`segmented ${className}`} role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button
          key={String(o.id)}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          className={`seg-btn ${value === o.id ? 'active' : ''}`}
          onClick={() => onChange(o.id)}
        >
          <span>{o.label}</span>
          {o.sub && <small>{o.sub}</small>}
        </button>
      ))}
    </div>
  );
}
