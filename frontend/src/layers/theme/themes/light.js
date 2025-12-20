const light = {
  name: 'light',
  displayName: 'Светлая',
  colors: {
    // Primary
    'primary': '#007bff',
    'primary-dark': '#0056b3',
    'primary-light': '#66b2ff',
    
    // Background
    'background': '#ffffff',
    'background-secondary': '#f8f9fa',
    'surface': '#ffffff',
    'surface-hover': '#f5f5f5',
    
    // Text
    'text': '#212121',
    'text-secondary': '#757575',
    'text-disabled': '#bdbdbd',
    'text-inverse': '#ffffff',
    
    // Border
    'border': '#e0e0e0',
    'border-hover': '#bdbdbd',
    
    // Emotions
    'positive': '#4CAF50',
    'negative': '#F44336',
    'neutral': '#9E9E9E',
    
    // Entry types
    'dream': '#9C27B0',
    'memory': '#FF9800',
    'thought': '#2196F3',
    'plan': '#4CAF50',
    
    // Status
    'success': '#4CAF50',
    'error': '#F44336',
    'warning': '#FF9800',
    'info': '#2196F3',
    
    // Shadow
    'shadow': 'rgba(0, 0, 0, 0.1)',
    'shadow-hover': 'rgba(0, 0, 0, 0.2)'
  },
  
  // Дополнительные параметры темы
  spacing: {
    unit: 8 // 8px базовый unit
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '50%'
  },
  
  shadows: {
    small: '0 2px 4px var(--color-shadow)',
    medium: '0 4px 8px var(--color-shadow)',
    large: '0 8px 16px var(--color-shadow)'
  }
};

export default light;