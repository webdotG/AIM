import { Platform, View, StyleSheet } from 'react-native';
import { NavigationProvider } from './PlatformNavigator.jsx';

const PlatformProvider = ({ children }) => {
  return (
    <NavigationProvider>
      {children}
    </NavigationProvider>
  );
};

export default PlatformProvider;