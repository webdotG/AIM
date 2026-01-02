// src/platforms/web/router.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '@/ui/pages/auth/AuthPage';
import TimelinePage from '../../ui/pages/analytics/AnalyticsTimelinePage';
import CreateEntryPage from '@/ui/pages/entries/CreateEntryPage';
import EntryDetailPage from '@/ui/pages/entries/detail/EntryDetailPage';
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
          <Route index element={<TimelinePage />} />
          <Route path="entries/create" element={<CreateEntryPage />} />
          <Route path="entries/:id" element={<EntryDetailPage />} />
          <Route path="analytics" element={<TimelinePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}