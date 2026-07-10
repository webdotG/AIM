// src/platforms/web/router.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '@/ui/pages/auth/AuthPage';
import CreateNodePage from '@/ui/pages/nodes/CreateNodePage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';
import MainLayout from '@/ui/layouts/MainLayout';
import { useAuthStore } from '../../store/StoreContext';

const ProtectedRoute = ({ children }) => {
  const authStore = useAuthStore();
  return authStore.isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const authStore = useAuthStore();
  return !authStore.isAuthenticated ? children : <Navigate to="/" replace />;
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
          <Route index element={<CreateNodePage />} />
          <Route path="create" element={<CreateNodePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}