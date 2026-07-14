export default function Spinner({
  size = 'medium',
  className = '',
}) {
  const sizes = { small: 20, medium: 32, large: 48 };
  const s = sizes[size] || sizes.medium;

  return (
    <div
      className={`spinner ${className}`}
      style={{
        width: s,
        height: s,
        border: '3px solid var(--color-border)',
        borderTop: '3px solid var(--color-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    />
  );
}