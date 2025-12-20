import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store/StoreContext';
import { NavigationProvider, useNavigation } from '@/layers/platform/PlatformNavigator';
import PlatformLayout from '@/ui/layouts/PlatformLayout';
import AuthPage from '@/ui/pages/auth/AuthPage';
import TimelinePage from '@/ui/pages/analytics/TimelinePage';
import CreateEntryPage from '@/ui/pages/entries/CreateEntryPage';
import EntryDetailPage from '@/ui/pages/entries/detail/EntryDetailPage';
import AnalyticsPage from '@/ui/pages/analytics/AnalyticsPage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';

const RouterContent = observer(() => {
  const { currentRoute } = useNavigation();

  switch(currentRoute.screen) {
    case 'timeline':
      return <TimelinePage />;
    case 'create-entry':
      return <CreateEntryPage />;
    case 'entry-detail':
      return <EntryDetailPage id={currentRoute.params.id} />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <TimelinePage />;
  }
});

const TelegramRouter = observer(() => {
  const { authStore } = useStores();
  
  if (!authStore.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <NavigationProvider>
      <PlatformLayout>
        <RouterContent />
      </PlatformLayout>
    </NavigationProvider>
  );
});

export default TelegramRouter;