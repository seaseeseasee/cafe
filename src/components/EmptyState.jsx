export default function EmptyState({ icon: Icon, emoji, title, message, action, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <div className="empty-icon">{Icon ? <Icon size={compact ? 28 : 36} strokeWidth={1.6} /> : emoji}</div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
