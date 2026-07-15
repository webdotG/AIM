import { Platform, StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import { LayersProvider } from '@/layers';
import { StoreProvider } from '@/store/StoreContext';
import PlatformRouter from './PlatformRouter.jsx';

export default function App() {
  return (
    <StoreProvider>
      <LayersProvider>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <PlatformRouter />
        </SafeAreaView>
      </LayersProvider>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});