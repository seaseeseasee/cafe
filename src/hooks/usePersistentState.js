import { useEffect, useRef, useState } from 'react';
import { load, save } from '../utils/storage.js';

/**
 * useState ที่ซิงก์กับ LocalStorage อัตโนมัติ
 * @param {string} key
 * @param {() => any} init ค่าเริ่มต้นเมื่อยังไม่มีข้อมูลใน LocalStorage
 * @param {(key: string) => void} onSaveError เรียกเมื่อบันทึกไม่สำเร็จ (เช่น พื้นที่เต็ม)
 */
export function usePersistentState(key, init, onSaveError) {
  const [value, setValue] = useState(() => {
    const stored = load(key, undefined);
    return stored === undefined ? init() : stored;
  });
  const errRef = useRef(onSaveError);
  errRef.current = onSaveError;

  useEffect(() => {
    if (!save(key, value)) errRef.current?.(key);
  }, [key, value]);

  return [value, setValue];
}
