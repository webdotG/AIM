import { Platform, View, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/StoreContext';
import AuthPage from '@/ui/pages/auth/AuthPage';
import CreateNodePage from '@/ui/pages/nodes/CreateNodePage';
import NodeListPage from '@/ui/pages/nodes/NodeListPage';
import NodeDetailPage from '@/ui/pages/nodes/NodeDetailPage';
import GraphViewPage from '@/ui/pages/graph/GraphViewPage';
import PeoplePage from '@/ui/pages/people/PeoplePage';
import AnalyticsPage from '@/ui/pages/analytics/AnalyticsPage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';
import Header from '@/ui/components/layout/Header';
import Navigation from '@/ui/layouts/Navigation';

const ProtectedRoute = ({ children }) => {
  const authStore = useAuthStore();
  return authStore.isAuthenticated ? children : <AuthPage />;
};

const PublicRoute = ({ children }) => {
  const authStore = useAuthStore();
  return !authStore.isAuthenticated ? children : children;
};

export default function WebRouter() {
  return (
    <ProtectedRoute>
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
          <View style={styles.routes}>
            <CreateNodePage />
            <NodeListPage />
            <NodeDetailPage />
            <GraphViewPage />
            <PeoplePage />
            <AnalyticsPage />
            <SettingsPage />
          </View>
        </View>
        <Navigation />
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  routes: { flexDirection: 'row' },
  container: { flex: 1, backgroundColor: '#fff', flexDirection: 'column' },
  content: { flex: 1 },
});