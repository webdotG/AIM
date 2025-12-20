
function DotsLoader({ size = 'medium', color = 'var(--color-primary, #007bff)' }) {
  const sizes = {
    small: 6,
    medium: 10,
    large: 14
  };

  const dotSize = sizes[size];

  const containerStyle = {
    display: 'flex',
    gap: `${dotSize}px`,
    alignItems: 'center',
    justifyContent: 'center'
  };

  const dotStyle = {
    width: dotSize,
    height: dotSize,
    borderRadius: '50%',
    background: color,
    animation: 'bounce 1.4s infinite ease-in-out both'
  };

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
      
      <div style={containerStyle}>
        <div style={{ ...dotStyle, animationDelay: '-0.32s' }} />
        <div style={{ ...dotStyle, animationDelay: '-0.16s' }} />
        <div style={dotStyle} />
      </div>
    </>
  );
}

export default DotsLoader