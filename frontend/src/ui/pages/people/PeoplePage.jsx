import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useNodeStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card.jsx';
import Badge from '@/shared/components/Badge.jsx';
import EmptyState from '@/shared/components/EmptyState.jsx';
import Spinner from '@/shared/components/Spinner.jsx';
import ErrorState from '@/shared/components/ErrorState.jsx';

const PeoplePage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const [search, setSearch] = useState('');

  useEffect(() => { loadPeople(); }, []);

  async function loadPeople() {
    try { await nodeStore.fetchPeople(); } catch (err) { console.error('People load error:', err); }
  }

  const people = (nodeStore.nodes || []).filter((n) => n?.nodeTypeCode === 'person');
  const filtered = search
    ? people.filter((p) => p?.title?.toLowerCase?.()?.includes(search.toLowerCase()))
    : people;

  if (nodeStore.isLoading) {
    return <View style={s.center}><Spinner size="large" /></View>;
  }

  if (nodeStore.error) {
    return <ErrorState title="Ошибка загрузки" description={nodeStore.error} onRetry={loadPeople} />;
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
    <View style={s.container}>
      <TextInput
        style={s.search}
        placeholder="Поиск..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView style={s.list}>
        {filtered.map((p) => (
          <Card key={p?.id} variant="clickable" onPress={() => navigate(`/nodes/${p?.id}`)}>
            <View style={s.row}>
              <Text style={s.icon}>{p?.icon?.() || '👤'}</Text>
              <Text style={s.title}>{p?.displayTitle?.() || 'Без названия'}</Text>
              <Badge>{p?.emotions?.length ?? 0} эмоций</Badge>
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
  search: { padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, marginBottom: 12, fontSize: 14 },
  list: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 24, marginRight: 12 },
  title: { flex: 1, fontSize: 14, fontWeight: '500' },
});

export default PeoplePage;