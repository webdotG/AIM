import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useNodeStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import Spinner from '@/shared/components/Spinner/Spinner';

const PeoplePage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    nodeStore.fetchPeople();
  }, []);

  const people = nodeStore.nodes.filter((n) => n.nodeTypeCode === 'person');

  const filtered = search
    ? people.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()))
    : people;

  if (nodeStore.isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <Spinner size="large" />
      </View>
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
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Поиск..."
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView style={styles.list}>
        {filtered.map((p) => (
          <Card
            key={p.id}
            variant="clickable"
            onPress={() => navigate(`/nodes/${p.id}`)}
          >
            <View style={styles.cardRow}>
              <Text style={styles.icon}>{p.icon()}</Text>
              <Text style={styles.title}>{p.displayTitle()}</Text>
              <Badge>{p.emotions?.length ?? 0} эмоций</Badge>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  list: { marginTop: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 24, marginRight: 12 },
  title: { flex: 1, fontSize: 14, fontWeight: '500' },
});

export default PeoplePage;