import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider } from '../src/store/StoreContext';
import { LayersProvider } from '../src/layers';

export default function Layout() {
  return (
    <StoreProvider>
      <LayersProvider>
        <Slot />
        <StatusBar style="dark" />
      </LayersProvider>
    </StoreProvider>
  );
}