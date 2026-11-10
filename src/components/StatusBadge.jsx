import { CheckCircle2, Ban } from 'lucide-react';

export default function StatusBadge({ status }) {
  return status === 'voided' ? (
    <span className="badge badge-danger">
      <Ban size={13} /> ยกเลิก
    </span>
  ) : (
    <span className="badge badge-success">
      <CheckCircle2 size={13} /> สำเร็จ
    </span>
  );
}
