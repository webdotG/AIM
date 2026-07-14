import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useNodeStore } from '@/store/StoreContext';
import Badge from '@/shared/components/Badge/Badge';
import Spinner from '@/shared/components/Spinner/Spinner';
import Button from '@/ui/components/common/Button/Button';
import { useNavigator } from '@/shared/platform/useNavigator';
import './NodeDetailPage.css';

const NodeDetailPage = observer(({ params }) => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const id = params?.id ?? window.location.pathname.split('/').pop();

  useEffect(() => {
    nodeStore.fetchNodeById(id);
  }, [id]);

  const node = nodeStore.currentNode;

  if (nodeStore.isLoading) {
    return (
      <div className="loading-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (!node) {
    return <div className="node-detail-empty">Узел не найден</div>;
  }

  return (
    <div className="node-detail">
      <div className="node-detail__header">
        <span className="node-detail__icon">{node.icon()}</span>
        <h1 className="node-detail__title">{node.displayTitle()}</h1>
        <span className="node-detail__badge">{node.label()}</span>
      </div>

      <div className="node-detail__meta">
        {node.createdAt && (
          <span className="node-detail__date">
            {new Date(node.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        )}
        {node.updatedAt && (
          <span className="node-detail__date">
            изменён:{' '}
            {new Date(node.updatedAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
            })}
          </span>
        )}
      </div>

      {node.emotions?.length > 0 && (
        <div className="node-detail__item">
          <h3 className="node-detail__label">Эмоции</h3>
          <div className="node-detail__tagds">
            {node.emotions.map((e, i) => (
              <Badge key={i} variant="primary">
                {e.label ?? e.name ?? e.category ?? ''}{' '}
                {e.intensity != null ? `(${e.intensity})` : ''}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {node.tags?.length > 0 && (
        <div className="node-detail__item">
          <h3 className="node-detail__label">Теги</h3>
          <div className="node-detail__tagds">
            {node.tags.map((tag, i) => (
              <Badge key={i}>{tag.name ?? tag}</Badge>
            ))}
          </div>
        </div>
      )}

      {node.measurement?.length > 0 && (
        <div className="node-detail__item">
          <h3 className="node-detail__label">Измерения</h3>
          <div className="node-detail__tags">
            {node.measurement.map((m, i) => (
              <Badge key={i} variant="warning">
                {m.value ?? ''}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="node-detail__content">
        <p>{node.content || 'Нет контента'}</p>
      </div>

      <div className="node-detail__actions">
        <Button variant="secondary" onClick={() => navigate('/graph')}>
          Граф
        </Button>
        <Button variant="danger" onClick={() => nodeStore.deleteNode(node.id)}>
          Удалить
        </Button>
      </div>
    </div>
  );
});

export default NodeDetailPage;