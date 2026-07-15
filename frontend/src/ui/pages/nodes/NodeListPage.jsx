import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNodeStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import TabBar from '@/shared/components/TabBar/TabBar';
import Spinner from '@/shared/components/Spinner/Spinner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const typeTabs = [
  { key: 'all', label: 'Все', icon: '📋' },
  { key: 'dream', label: 'Сны', icon: '💭' },
  { key: 'thought', label: 'Мысли', icon: '💡' },
  { key: 'memory', label: 'Память', icon: '📷' },
  { key: 'plans', label: 'Планы', icon: '📋' },
  { key: 'actions', label: 'Действия', icon: '⚡' },
];

const NodeListPage = () => {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();
  const [selectedType, setSelectedType] = useState('all');

  const loadNodes = useCallback(async () => {
    const filters = selectedType === 'all' ? {} : { type: selectedType };
    await nodeStore.fetchNodes(filters);
  }, [selectedType]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

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
        icon="📭"
        title="Пока пусто"
        description="Создайте первый узел, чтобы начать строить свою графу"
        actionLabel="Создать"
        onAction={() => navigate('/create')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TabBar
        tabs={typeTabs}
        onChange={(key) => setSelectedType(key)}
      />

      <ScrollView style={styles.list}>
        {nodes.map((node) => (
          <NodeCard key={node.id} node={node} navigate={navigate} />
        ))}
      </ScrollView>
    </View>
  );
};

const NodeCard = observer(({ node, navigate }) => {
  return (
    <Card variant="clickable" onPress={() => navigate(`/nodes/${node.id}`)}>
      <View style={styles.header}>
        <Text style={styles.icon}>{node.icon()}</Text>
        <Text style={styles.title}>{node.displayTitle()}</Text>
        <Text style={styles.date}>
          {node.createdAt ? format(new Date(node.createdAt), 'dd MMM', { locale: ru }) : ''}
        </Text>
      </View>

      {node.emotions?.length > 0 && (
        <View style={styles.tags}>
          {node.emotions.slice(0, 3).map((e, i) => (
            <Badge key={i} variant="primary">{e.name}</Badge>
          ))}
        </View>
      )}

      {node.tags?.length > 0 && (
        <View style={styles.tags}>
          {node.tags.slice(0, 3).map((tag, i) => (
            <Badge key={i}>{tag.name}</Badge>
          ))}
        </View>
      )}
    </Card>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { marginTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { fontSize: 20, marginRight: 8 },
  title: { fontSize: 14, fontWeight: '600', flex: 1 },
  date: { fontSize: 12, color: '#888' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
});

export default NodeListPage;