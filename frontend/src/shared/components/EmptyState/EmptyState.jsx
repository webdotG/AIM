import './EmptyState.css';

export default function EmptyState({
  icon = '📭',
  title = 'Нет данных',
  description = '',
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <div className="empty-state__title">{title}</div>
      {description && (
        <div className="empty-state__description">{description}</div>
      )}
      {actionLabel && onAction && (
        <button className="empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}