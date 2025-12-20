import LanguageProvider from './language/LanguageProvider';
import ThemeProvider from './theme/ThemeProvider';
import PlatformProvider from './platform/PlatformProvider';

function LayersProvider({ children }) {
  const getPlatform = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      return 'telegram';
    }
    return 'web';
  };

  return (
    <PlatformProvider platform={getPlatform()}>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider defaultLanguage="ru">
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </PlatformProvider>
  );
}

export default LayersProvider;