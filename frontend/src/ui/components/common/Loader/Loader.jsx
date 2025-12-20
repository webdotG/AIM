
function Loader({
  size = 'medium',
  text = '',
  fullscreen = false,
  color = 'var(--color-primary, #007bff)'
}) {
  const sizes = {
    small: 20,
    medium: 40,
    large: 60
  };

  const spinnerSize = sizes[size];

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `${Math.max(2, spinnerSize / 10)}px solid rgba(0, 123, 255, 0.1)`,
    borderTop: `${Math.max(2, spinnerSize / 10)}px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  };

  const containerStyle = fullscreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.9)',
    zIndex: 9999
  } : {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px'
  };

  const textStyle = {
    marginTop: '12px',
    fontSize: size === 'small' ? '13px' : size === 'large' ? '16px' : '14px',
    color: 'var(--color-text-secondary, #757575)'
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={containerStyle}>
        <div style={spinnerStyle} />
        {text && <div style={textStyle}>{text}</div>}
      </div>
    </>
  );
}

export default Loader

// ============================================
// DEMO
// ============================================

// function Demo() {
//   const [loading, setLoading] = React.useState(false);
//   const [fullscreenLoading, setFullscreenLoading] = React.useState(false);

//   const simulateLoading = () => {
//     setLoading(true);
//     setTimeout(() => setLoading(false), 3000);
//   };

//   const simulateFullscreenLoading = () => {
//     setFullscreenLoading(true);
//     setTimeout(() => setFullscreenLoading(false), 2000);
//   };

//   return (
//     <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
//       <div style={{ maxWidth: '800px', margin: '0 auto' }}>
//         <h1 style={{ marginBottom: '32px' }}>Loader Component Demo</h1>

//         {/* Basic Loaders */}
//         <section style={{
//           padding: '24px',
//           background: 'white',
//           borderRadius: '8px',
//           marginBottom: '24px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Spinner Sizes</h2>
//           <div style={{
//             display: 'flex',
//             gap: '32px',
//             alignItems: 'center',
//             flexWrap: 'wrap'
//           }}>
//             <Loader size="small" text="Small" />
//             <Loader size="medium" text="Medium" />
//             <Loader size="large" text="Large" />
//           </div>
//         </section>

//         {/* Colors */}
//         <section style={{
//           padding: '24px',
//           background: 'white',
//           borderRadius: '8px',
//           marginBottom: '24px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Colors</h2>
//           <div style={{
//             display: 'flex',
//             gap: '32px',
//             alignItems: 'center',
//             flexWrap: 'wrap'
//           }}>
//             <Loader color="#007bff" text="Primary" />
//             <Loader color="#28a745" text="Success" />
//             <Loader color="#dc3545" text="Danger" />
//             <Loader color="#9C27B0" text="Purple" />
//           </div>
//         </section>

//         {/* Dots Loader */}
//         <section style={{
//           padding: '24px',
//           background: 'white',
//           borderRadius: '8px',
//           marginBottom: '24px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Dots Loader</h2>
//           <div style={{
//             display: 'flex',
//             gap: '32px',
//             alignItems: 'center',
//             flexWrap: 'wrap'
//           }}>
//             <div style={{ textAlign: 'center' }}>
//               <DotsLoader size="small" />
//               <div style={{ marginTop: '8px', fontSize: '13px', color: '#757575' }}>Small</div>
//             </div>
//             <div style={{ textAlign: 'center' }}>
//               <DotsLoader size="medium" />
//               <div style={{ marginTop: '8px', fontSize: '14px', color: '#757575' }}>Medium</div>
//             </div>
//             <div style={{ textAlign: 'center' }}>
//               <DotsLoader size="large" />
//               <div style={{ marginTop: '8px', fontSize: '16px', color: '#757575' }}>Large</div>
//             </div>
//           </div>
//         </section>

//         {/* Skeleton Loader */}
//         <section style={{
//           padding: '24px',
//           background: 'white',
//           borderRadius: '8px',
//           marginBottom: '24px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Skeleton Loader</h2>
          
//           <div style={{ marginBottom: '24px' }}>
//             <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Card Skeleton</h3>
//             <Skeleton width="100%" height="120px" borderRadius="8px" />
//           </div>

//           <div style={{ marginBottom: '24px' }}>
//             <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Text Skeleton</h3>
//             <Skeleton count={3} height="16px" gap="8px" />
//           </div>

//           <div>
//             <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>List Skeleton</h3>
//             <Skeleton count={5} height="60px" gap="12px" borderRadius="8px" />
//           </div>
//         </section>

//         {/* Interactive Examples */}
//         <section style={{
//           padding: '24px',
//           background: 'white',
//           borderRadius: '8px',
//           marginBottom: '24px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Interactive Examples</h2>
          
//           <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
//             <button
//               onClick={simulateLoading}
//               disabled={loading}
//               style={{
//                 padding: '12px 20px',
//                 background: loading ? '#6c757d' : '#007bff',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               Загрузить данные
//             </button>

//             <button
//               onClick={simulateFullscreenLoading}
//               style={{
//                 padding: '12px 20px',
//                 background: '#9C27B0',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '8px',
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               Fullscreen Loader
//             </button>
//           </div>

//           {loading && (
//             <div style={{
//               padding: '40px',
//               background: '#f8f9fa',
//               borderRadius: '8px',
//               display: 'flex',
//               justifyContent: 'center'
//             }}>
//               <Loader text="Загрузка данных..." />
//             </div>
//           )}
//         </section>

//         {/* Button with Loader */}
//         <section style={{
//           padding: '24px',
//           background: 'white',
//           borderRadius: '8px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
//         }}>
//           <h2 style={{ marginBottom: '16px', fontSize: '18px' }}>Button with Loader</h2>
          
//           <button
//             onClick={simulateLoading}
//             disabled={loading}
//             style={{
//               padding: '12px 24px',
//               background: loading ? '#6c757d' : '#28a745',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontSize: '14px',
//               fontWeight: '500',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px',
//               opacity: loading ? 0.7 : 1
//             }}
//           >
//             {loading && <DotsLoader size="small" color="white" />}
//             {loading ? 'Сохранение...' : 'Сохранить'}
//           </button>
//         </section>

//         {/* Fullscreen Loader */}
//         {fullscreenLoading && (
//           <Loader
//             size="large"
//             text="Загрузка приложения..."
//             fullscreen
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// export default Demo;