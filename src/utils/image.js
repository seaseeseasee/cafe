export const MAX_UPLOAD_MB = 5;
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

/** อ่านไฟล์รูป + ย่อขนาดด้วย canvas เพื่อประหยัดพื้นที่ LocalStorage */
export function readImageFile(file, maxSize = 360) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('ไม่พบไฟล์'));
    if (!ACCEPT.includes(file.type)) return reject(new Error('รองรับเฉพาะไฟล์ PNG, JPG, WEBP, GIF หรือ SVG'));
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return reject(new Error(`ไฟล์ต้องมีขนาดไม่เกิน ${MAX_UPLOAD_MB} MB`));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ไฟล์รูปภาพไม่ถูกต้อง'));
      img.onload = () => {
        const w = img.width || maxSize;
        const h = img.height || maxSize;
        const scale = Math.min(1, maxSize / Math.max(w, h));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(w * scale));
        canvas.height = Math.max(1, Math.round(h * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const keepAlpha = file.type === 'image/png' || file.type === 'image/svg+xml';
        resolve(canvas.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
