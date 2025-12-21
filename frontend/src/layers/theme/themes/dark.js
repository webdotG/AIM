export default {
  name: 'dark',
  label: 'Темная',
  colors: {
    // Основные (инвертированные)
    '--bg-primary': '#000000',
    '--bg-secondary': '#1a1a1a',
    '--bg-tertiary': '#2d2d2d',
    
    // Текст (инвертированный)
    '--text-primary': '#ffffff',
    '--text-secondary': '#adb5bd',
    '--text-inverse': '#000000',
    
    // Акценты (те же)
    '--primary': '#007bff',
    '--primary-hover': '#0056b3',
    '--secondary': '#6c757d',
    '--success': '#28a745',
    '--danger': '#dc3545',
    '--warning': '#ffc107',
    '--info': '#17a2b8',
    
    // Границы
    '--border-color': '#495057',
    '--border-light': '#343a40',
    
    // Хедер и навигация
    '--header-bg': '#1a1a1a',
    '--nav-bg': '#1a1a1a',
    '--nav-active': '#007bff',
    
    // Формы
    '--input-bg': '#2d2d2d',
    '--input-border': '#495057',
    '--input-focus': '#80bdff',
    
    // Тени
    '--shadow-sm': '0 1px 2px rgba(255,255,255,0.05)',
    '--shadow-md': '0 4px 6px rgba(255,255,255,0.1)',
    '--shadow-lg': '0 10px 15px rgba(255,255,255,0.1)',
  }
};