
import PlatformProvider from './platform/PlatformProvider';
import { ThemeProvider } from './theme/ThemeProvider';
import LanguageProvider from './language/LanguageProvider';

export const LayersProvider = ({ children }) => {
  return (
    <PlatformProvider>
      <LanguageProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </LanguageProvider>
    </PlatformProvider>
  );
};