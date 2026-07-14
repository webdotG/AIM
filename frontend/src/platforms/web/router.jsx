import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import AuthPage from '@/ui/pages/auth/AuthPage';
import CreateNodePage from '@/ui/pages/nodes/CreateNodePage';
import NodeListPage from '@/ui/pages/nodes/NodeListPage';
import NodeDetailPage from '@/ui/pages/nodes/NodeDetailPage';
import GraphViewPage from '@/ui/pages/graph/GraphViewPage';
import PeoplePage from '@/ui/pages/people/PeoplePage';
import AnalyticsPage from '@/ui/pages/analytics/AnalyticsPage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';
import MainLayout from '@/ui/layouts/MainLayout';
import { useAuthStore } from '@/store/StoreContext';

const ProtectedRoute = ({ children }) => {
  const authStore = useAuthStore();
  return authStore.isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const authStore = useAuthStore();
  return !authStore.isAuthenticated ? children : <Navigate to="/" replace />;
};

const NodeDetailWrapper = () => {
  const params = useParams();
  return <NodeDetailPage params={params} />;
};

export default function WebRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<NodeListPage />} />
          <Route path="create" element={<CreateNodePage />} />
          <Route path="nodes" element={<NodeListPage />} />
          <Route path="nodes/:id" element={<NodeDetailWrapper />} />
          <Route path="graph" element={<GraphViewPage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}