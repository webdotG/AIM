const dark = {
  name: 'dark',
  displayName: 'Тёмная',
  colors: {
    // Primary
    'primary': '#66b2ff',
    'primary-dark': '#3d8aff',
    'primary-light': '#99ccff',
    
    // Background
    'background': '#121212',
    'background-secondary': '#1e1e1e',
    'surface': '#1e1e1e',
    'surface-hover': '#2a2a2a',
    
    // Text
    'text': '#ffffff',
    'text-secondary': '#b0b0b0',
    'text-disabled': '#757575',
    'text-inverse': '#121212',
    
    // Border
    'border': '#333333',
    'border-hover': '#4a4a4a',
    
    // Emotions (более приглушённые в тёмной теме)
    'positive': '#66bb6a',
    'negative': '#ef5350',
    'neutral': '#bdbdbd',
    
    // Entry types
    'dream': '#ba68c8',
    'memory': '#ffb74d',
    'thought': '#64b5f6',
    'plan': '#81c784',
    
    // Status
    'success': '#66bb6a',
    'error': '#ef5350',
    'warning': '#ffb74d',
    'info': '#64b5f6',
    
    // Shadow
    'shadow': 'rgba(0, 0, 0, 0.3)',
    'shadow-hover': 'rgba(0, 0, 0, 0.5)'
  },
  
  spacing: {
    unit: 8
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

export default dark;
