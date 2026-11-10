export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export function formatMoney(value, { symbol = true, decimals } = {}) {
  const n = round2(Number(value) || 0);
  const hasFraction = Math.abs(n % 1) > 0.0001;
  const d = decimals ?? (hasFraction ? 2 : 0);
  const text = n.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d });
  return symbol ? `฿${text}` : text;
}

export const pad = (n, l = 2) => String(n).padStart(l, '0');

/** วันที่แบบ local YYYY-MM-DD (ใช้จัดกลุ่มรายวัน) */
export function dateKey(input) {
  const d = new Date(input);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDateTime(input, lang = 'th') {
  const d = new Date(input);
  return d.toLocaleString(lang === 'en' ? 'en-GB' : 'th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(input, lang = 'th', opts = { day: 'numeric', month: 'short' }) {
  return new Date(input).toLocaleDateString(lang === 'en' ? 'en-GB' : 'th-TH', opts);
}

export function formatTime(input) {
  return new Date(input).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
