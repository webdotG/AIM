import{ createContext } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  currentTheme: {},
  setTheme: () => {},
  toggleTheme: () => {}
});

export default ThemeContext;
