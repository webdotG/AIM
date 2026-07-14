import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useNodeStore } from '@/store/StoreContext';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import TabBar from '@/shared/components/TabBar/TabBar';
import Spinner from '@/shared/components/Spinner/Spinner';
import { useNavigator } from '@/shared/platform/useNavigator';
import { useLanguage } from '@/layers/language';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import './NodeListPage.css';

const typeTabs = [
  { key: 'all', label: 'Все', icon: '📋' },
  { key: 'dream', label: 'Сны', icon: '💭' },
  { key: 'thought', label: 'МЫсли', icon: '💡' },
  { key: 'memory', label: 'Память', icon: '📷' },
  { key: 'plans', label: 'Планы', icon: '📋' },
  { key: 'actions', label: 'Действия', icon: '⚡' },
];

const NodeListPage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = React.useState('all');

  const loadNodes = useCallback(async () => {
    const typeFilters = selectedType === 'all' ? {} : { type: selectedType };
    await nodeStore.fetchNodes(typeFilters);
  }, [selectedType]);

  React.useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const handleTabChange = (key) => {
    setSelectedType(key);
  };

  if (nodeStore.isLoading) {
    return (
      <div className="loading-center">
        <Spinner size="large" />
      </div>
    );
  }

  const nodes = nodeStore.nodes;

  if (nodes.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="Пока пусто"
        description="Создайте первый узел, чтобы начать строить свою графу"
        actionLabel="Создать"
        onAction={() => navigate('/create')}
      />
    );
  }

  return (
    <div className="nodes-page-container">
      <TabBar
        tabs={typeTabs}
        onChange={handleTabChange}
        className="nodes-page-tabs"
      />

      <div className="nodes-page-list">
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} navigate={navigate} />
        ))}
      </div>
    </div>
  );
});

const NodeCard = observer(({ node, navigate }) => {
  return (
    <Card
      variant="clickable"
      className="nodes-page-card"
      onClick={() => navigate(`/nodes/${node.id}`)}
    >
      <div className="nodes-page-card__header">
        <span className="nodes-page-card__icon">{node.icon()}</span>
        <h3 className="nodes-page-card__title">{node.displayTitle()}</h3>
        <div
          className="nodes-page-card__date"
          title={node.createdAt ?? ''}
        >
          {node.createdAt ? format(new Date(node.createdAt), 'dd MMM', { locale: ru }) : ''}
        </div>
      </div>

      {node.emotions?.length > 0 && (
        <div className="nodes-page-card__tags">
          {node.emotions.slice(0, 3).map((e, i) => (
            <Badge key={i} variant="primary">
              {e.name}
            </Badge>
          ))}
        </div>
      )}

      {node.tags?.length > 0 && (
        <div className="nodes-page-card__tags">
          {node.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i}>{tag.name}</Badge>
          ))}
        </div>
      )}
    </Card>
  );
});

export default NodeListPage;