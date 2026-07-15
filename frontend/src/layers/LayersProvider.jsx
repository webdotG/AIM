import { View, StyleSheet } from 'react-native';
import PlatformProvider from './platform/PlatformProvider.jsx';
import { LanguageProvider } from './language';
import { ThemeProvider } from './theme';
import SecurityProvider from './security';

export const LayersProvider = ({ children }) => {
  return (
    <PlatformProvider>
      <LanguageProvider>
        <ThemeProvider>
          <SecurityProvider>
            {children}
          </SecurityProvider>
        </ThemeProvider>
      </LanguageProvider>
    </PlatformProvider>
  );
};