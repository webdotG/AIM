import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNodeStore } from '@/store/StoreContext';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import Spinner from '@/shared/components/Spinner/Spinner';
import Input from '@/ui/components/common/Input/Input';
import { useNavigator } from '@/shared/platform/useNavigator';
import './PeoplePage.css';

const PeoplePage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const people = nodeStore.nodes.filter((n) => n.nodeTypeCode === 'person');
  const [search, setSearch] = useState('');

  useEffect(() => {
    nodeStore.fetchPeople();
  }, []);

  const filtered = search
    ? people.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()))
    : people;

  if (nodeStore.isLoading) {
    return (
      <div className="loading-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <EmptyState
        icon="👤"
        title="Нет людей"
        description="Добавьте людей, чтобы отслеживать связи"
        actionLabel="Добавить"
        onAction={() => navigate('/create')}
      />
    );
  }

  return (
    <div className="people-page">
      <Input
        placeholder="Поиск..."
        value={search}
        onChange={setSearch}
        className="people-page__search"
      />

      <div className="people-page__list">
        {filtered.map((p) => (
          <Card
            key={p.id}
            variant="clickable"
            className="people-page-card"
            onClick={() => navigate(`/nodes/${p.id}`)}
          >
            <span className="people-page__icon">{p.icon()}</span>
            <span className="people-page__title">{p.displayTitle()}</span>
            <Badge>{p.emotions?.length ?? 0} эмоций</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
});

export default PeoplePage;