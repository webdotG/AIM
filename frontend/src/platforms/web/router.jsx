import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store/StoreContext';
import WebLayout from '../../ui/components/layout/WebLayout';
import AuthPage from '@/ui/pages/auth/AuthPage';
import TimelinePage from '../../ui/pages/analytics/AnalyticsTimelinePage';
import CreateEntryPage from '@/ui/pages/entries/CreateEntryPage';
import EntryDetailPage from '@/ui/pages/entries/detail/EntryDetailPage';
import AnalyticsPage from '@/ui/pages/analytics/AnalyticsPage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';

// const ProtectedRoute = observer(({ children }) => {
//   const { authStore } = useStores();
  
//   if (!authStore.isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
  
//   return children;
// });

export default function WebRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        {/* <Route path="/" element={
          <ProtectedRoute>
            <WebLayout />
          </ProtectedRoute>
        }> */}
          <Route index element={<TimelinePage />} />
          <Route path="entries/create" element={<CreateEntryPage />} />
          <Route path="entries/:id" element={<EntryDetailPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        {/* </Route> */}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}