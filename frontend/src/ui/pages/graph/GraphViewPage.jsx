import React, { useEffect, useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNodeStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import TabBar from '@/shared/components/TabBar/TabBar';
import Spinner from '@/shared/components/Spinner/Spinner';

const GraphViewPage = observer(() => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();

  useEffect(() => {
    nodeStore.fetchNodes();
  }, []);

  const tabs = [
    { key: 'list', label: 'Все узлы' },
    { key: 'connected', label: 'Наиболее связанные' },
  ];

  if (nodeStore.isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <Spinner size="large" />
      </View>
    );
  }

  const nodes = nodeStore.nodes;
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
    <View style={styles.container}>
      <TabBar tabs={tabs} />

      <ScrollView style={styles.list}>
        {nodes.map((n) => (
          <Card
            key={n.id}
            variant="clickable"
            onPress={() => navigate(`/nodes/${n.id}`)}
            style={styles.card}
          >
            <View style={styles.cardRow}>
              <Text style={styles.icon}>{n.icon()}</Text>
              <Text style={styles.title}>{n.displayTitle()}</Text>
              <Badge>{n.edges?.length ?? 0} связей</Badge>
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
  list: { marginTop: 8 },
  card: { marginVertical: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 24, marginRight: 12 },
  title: { flex: 1, fontSize: 14, fontWeight: '500' },
});

export default GraphViewPage;