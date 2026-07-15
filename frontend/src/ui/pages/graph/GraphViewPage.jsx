import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNodeStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card.jsx';
import Badge from '@/shared/components/Badge.jsx';
import EmptyState from '@/shared/components/EmptyState.jsx';
import TabBar from '@/shared/components/TabBar.jsx';
import Spinner from '@/shared/components/Spinner.jsx';
import ErrorState from '@/shared/components/ErrorState.jsx';

const GraphViewPage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();

  useEffect(() => { loadNodes(); }, []);

  async function loadNodes() {
    try { await nodeStore.fetchNodes(); } catch (err) { console.error('Graph load error:', err); }
  }

  if (nodeStore.isLoading) {
    return <View style={s.center}><Spinner size="large" /></View>;
  }

  if (nodeStore.error) {
    return <ErrorState title="Ошибка загрузки графа" description={nodeStore.error} onRetry={loadNodes} />;
  }

  const nodes = nodeStore.nodes || [];

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
    <View style={s.container}>
      <TabBar tabs={[
        { key: 'list', label: 'Все узлы' },
        { key: 'connected', label: 'Связанные' },
      ]} />

      <ScrollView style={s.list}>
        {nodes.map((n) => (
          <Card key={n?.id} variant="clickable" onPress={() => navigate(`/nodes/${n?.id}`)}>
            <View style={s.row}>
              <Text style={s.icon}>{n?.icon?.() || '📝'}</Text>
              <Text style={s.title}>{n?.displayTitle?.() || 'Без названия'}</Text>
              <Badge>{n?.edges?.length ?? 0} связей</Badge>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
});

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 24, marginRight: 12 },
  title: { flex: 1, fontSize: 14, fontWeight: '500' },
});

export default GraphViewPage;