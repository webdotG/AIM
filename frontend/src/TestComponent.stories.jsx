export default {
  title: 'Test/Component',
  parameters: {
    layout: 'centered',
  },
};

export const Primary = () => (
  <div style={{
    padding: '40px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '12px',
    fontSize: '24px',
    fontWeight: 'bold'
  }}>
    Storybook работает!
  </div>
);

export const Button = () => (
  <button style={{
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500'
  }}>
    Тестовая кнопка
  </button>
);
