import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, StyleSheet } from 'react-native';
import { useNodeStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Badge from '@/shared/components/Badge.jsx';
import Spinner from '@/shared/components/Spinner.jsx';
import ErrorState from '@/shared/components/ErrorState.jsx';
import Button from '@/ui/components/common/Button/Button.jsx';

const NodeDetailPage = observer(({ params }) => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const id = params?.id ?? window.location.pathname.split('/').pop();

  useEffect(() => {
    loadNode();
  }, [id]);

  const loadNode = async () => {
    try {
      await nodeStore.fetchNodeById(id);
    } catch (err) {
      console.error('Failed to load node:', err);
    }
  };

  if (nodeStore.isLoading) {
    return <View style={s.center}><Spinner size="large" /></View>;
  }

  if (nodeStore.error) {
    return <ErrorState title="Ошибка загрузки" description={nodeStore.error} onRetry={loadNode} />;
  }

  const node = nodeStore.currentNode;
  if (!node) {
    return <ErrorState title="Узел не найден" />;
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.icon}>{node?.icon?.() || '📝'}</Text>
        <View style={s.headerText}>
          <Text style={s.title}>{node?.displayTitle?.() || 'Без названия'}</Text>
          <Badge variant="primary">{node?.label?.() || ''}</Badge>
        </View>
      </View>

      {node?.createdAt && (
        <Text style={s.meta}>
          Создан: {new Date(node.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>
      )}

      {node?.emotions?.length > 0 && (
        <View style={s.section}>
          <Text style={s.label}>Эмоции</Text>
          <View style={s.tags}>
            {node.emotions.map((e, i) => (
              <Badge key={i} variant="primary">{e?.label ?? e?.name ?? ''}</Badge>
            ))}
          </View>
        </View>
      )}

      {node?.tags?.length > 0 && (
        <View style={s.section}>
          <Text style={s.label}>Теги</Text>
          <View style={s.tags}>
            {node.tags.map((tag, i) => (
              <Badge key={i}>{tag?.name ?? tag}</Badge>
            ))}
          </View>
        </View>
      )}

      <View style={s.content}>
        <Text style={s.contentText}>{node?.content || 'Нет контента'}</Text>
      </View>

      <View style={s.actions}>
        <Button variant="secondary" onPress={() => navigate('/graph')}>Граф</Button>
        <Button variant="danger" onPress={() => handleDelete(node?.id)}>Удалить</Button>
      </View>
    </View>
  );

  async function handleDelete(nid) {
    try {
      await nodeStore.deleteNode(nid);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }
});

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon: { fontSize: 24, marginRight: 8 },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 12 },
  section: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  content: { marginTop: 12, marginBottom: 16 },
  contentText: { fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 8 },
});

export default NodeDetailPage;