import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store/StoreContext'
import  TelegramLayout from '../../ui/layouts/TelegramLayout';
import AuthPage from '@/ui/pages/auth/AuthPage';
import TimelinePage from '../../\/ui/pages/analytics/AnalyticsTimelinePage';
import CreateEntryPage from '@/ui/pages/entries/CreateEntryPage';
import EntryDetailPage from '@/ui/pages/entries/detail/EntryDetailPage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';

const RouterContent = observer(() => {
    const [currentRoute, setCurrentRoute] = useState('home');

  switch(currentRoute.screen) {
    case 'timeline':
      return <TimelinePage />;
    case 'create-entry':
      return <CreateEntryPage />;
    case 'entry-detail':
      return <EntryDetailPage id={currentRoute.params.id} />;
    case 'analytics':
      return <TimelinePage />;
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
    <TelegramLayout >
 
        <RouterContent />
    </TelegramLayout>
  );
});

export default TelegramRouter;