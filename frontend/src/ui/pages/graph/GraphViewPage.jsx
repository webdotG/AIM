import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNodeStore } from '@/store/StoreContext';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import Spinner from '@/shared/components/Spinner/Spinner';
import TabBar from '@/shared/components/TabBar/TabBar';
import { useNavigator } from '@/shared/platform/useNavigator';
import './GraphViewPage.css';

const GraphViewPage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const nodes = nodeStore.nodes;
  const [tab, setTab] = useState('list');
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    nodeStore.fetchNodes();
  }, []);

  const tabs = [
    { key: 'list', label: 'Все узлы' },
    { key: 'connected', label: 'Наиболее связанные' },
  ];

  if (nodeStore.isLoading) {
    return (
      <div className="loading-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <EmptyState
        icon="🔗"
        title="Граф пуст"
        description="Создайте узлы и связи между ними, чтобы построить граф"
        actionLabel="Создать"
        onAction={() => navigate('/create')}
      />
    );
  }

  return (
    <div className="graph-page">
      <TabBar tabs={tabs} onChange={(k) => setTab(k)} />

      <div className="graph-page__list">
        {nodes.map((n) => (
          <Card
            key={n.id}
            variant="clickable"
            className="graph-page-card"
            onClick={() => navigate(`/nodes/${n.id}`)}
          >
            <span className="graph-page__icon">{n.icon()}</span>
            <span className="graph-page__title">{n.displayTitle()}</span>
            <Badge>{n.edges?.length ?? 0} связей</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default GraphViewPage;