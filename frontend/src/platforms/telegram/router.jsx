import { Platform, View, StyleSheet } from 'react-native';
import { useNavigation } from '@/layers/platform';
import AuthPage from '@/ui/pages/auth/AuthPage';
import CreateNodePage from '@/ui/pages/nodes/CreateNodePage';
import NodeListPage from '@/ui/pages/nodes/NodeListPage';
import NodeDetailPage from '@/ui/pages/nodes/NodeDetailPage';
import GraphViewPage from '@/ui/pages/graph/GraphViewPage';
import PeoplePage from '@/ui/pages/people/PeoplePage';
import AnalyticsPage from '@/ui/pages/analytics/AnalyticsPage';
import SettingsPage from '@/ui/pages/settings/SettingsPage';
import TelegramLayout from '../../ui/layouts/TelegramLayout.jsx';

const RouterContent = () => {
  const nav = useNavigation();
  const { screen, params } = nav.currentRoute || { screen: 'list', params: {} };

  switch (screen) {
    case 'create':
      return <CreateNodePage />;
    case 'nodeDetail':
      return <NodeDetailPage params={params} />;
    case 'graph':
      return <GraphViewPage />;
    case 'people':
      return <PeoplePage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'list':
    default:
      return <NodeListPage />;
  }
};

const TelegramRouter = () => {
  return (
    <TelegramLayout>
      <RouterContent />
    </TelegramLayout>
  );
};

export default TelegramRouter;