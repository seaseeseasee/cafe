import { useMemo } from 'react';

// QR จำลอง (ไม่ใช่ QR ที่สแกนได้จริง) — สร้างลวดลายจาก hash ของข้อความ
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

const N = 25;

export default function MockQR({ value, size = 180 }) {
  const cells = useMemo(() => {
    const rnd = hash(value);
    const out = [];
    const inFinder = (x, y) =>
      (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && rnd() > 0.52) out.push([x, y]);
    return out;
  }, [value]);

  const finder = (x, y) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" fill="#1F1A17" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1F1A17" />
    </g>
  );

  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`} role="img" aria-label="QR Code จำลอง" shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      {cells.map(([x, y]) => (
        <rect key={`${x}_${y}`} x={x} y={y} width="1" height="1" fill="#1F1A17" />
      ))}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}
