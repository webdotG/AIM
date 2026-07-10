import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/store/StoreContext';
import TelegramLayout from '../../ui/layouts/TelegramLayout';
import AuthPage from '@/ui/pages/auth/AuthPage';
import CreateNodePage from '@/ui/pages/nodes/CreateNodePage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';

const RouterContent = observer(() => {
  const [currentRoute, setCurrentRoute] = useState('home');

  switch (currentRoute) {
    case 'create':
      return <CreateNodePage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <CreateNodePage />;
  }
});

const TelegramRouter = observer(() => {
  const { authStore } = useStores();

  if (!authStore.isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <TelegramLayout>
      <RouterContent />
    </TelegramLayout>
  );
});

export default TelegramRouter;