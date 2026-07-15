import { Platform, StyleSheet, View } from 'react-native';
import APP from './App';
import { StoreProvider } from './store/StoreContext';
import { LayersProvider } from './layers';

// Expose Telegram WebApp for RN
window.Telegram = window.Telegram || {};

// Load fonts
const loadFonts = async () => {
  await Font.loadAsync({});
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(
      <StoreProvider>
        <LayersProvider>
          <View style={styles.container}>
            <App />
            <StatusBar style={Platform.OS === 'ios' ? 'dark' : 'auto'} />
          </View>
        </LayersProvider>
      </StoreProvider>,
      root,
    );
  }
};

loadFonts();

const styles = StyleSheet.create({
  container: { flex: 1 },
});