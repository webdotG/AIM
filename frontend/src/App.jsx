import { LayersProvider } from '@/layers';
import { StoreProvider } from '@/store/StoreContext';
import PlatformRouter from './PlatformRouter';

export default function App() {
  return (
    <StoreProvider>
      <LayersProvider>
        <PlatformRouter />
      </LayersProvider>
    </StoreProvider>
  );
}