function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  count = 1,
  gap = '8px'
}) {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
      
      <div style={containerStyle}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={skeletonStyle} />
        ))}
      </div>
    </>
  );
}

export default Skeleton