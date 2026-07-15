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
import Button from '@/ui/components/common/Button/Button';
import Input from '@/ui/components/common/Input/Input';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function NodeDetailPage() {
  const { navigate } = useNavigator();
  const nodeStore = useNodeStore();

  // Get ID from URL
  const id = React.useMemo(() => {
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1];
  }, []);

  useEffect(() => {
    nodeStore.fetchNodeById(id);
  }, [id]);

  const node = nodeStore.currentNode;

  if (nodeStore.isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <Spinner size="large" />
      </View>
    );
  }

  if (!node) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Узел не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{node.icon()}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{node.displayTitle()}</Text>
          <Badge variant="primary">{node.label()}</Badge>
        </View>
      </View>

      {node.createdAt && (
        <Text style={styles.meta}>
          Создан: {new Date(node.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </Text>
      )}

      {node.emotions?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Эмоции</Text>
          <View style={styles.tags}>
            {node.emotions.map((e, i) => (
              <Badge key={i} variant="primary">
                {e.label ?? e.name ?? e.category ?? ''}
                {e.intensity != null ? ` (${e.intensity})` : ''}
              </Badge>
            ))}
          </View>
        </View>
      )}

      {node.tags?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Теги</Text>
          <View style={styles.tags}>
            {node.tags.map((tag, i) => (
              <Badge key={i}>{tag.name ?? tag}</Badge>
            ))}
          </View>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.contentText}>{node.content || 'Нет контента'}</Text>
      </View>

      <View style={styles.actions}>
        <Button variant="secondary" onPress={() => navigate('/graph')}>Граф</Button>
        <Button variant="danger" onPress={() => nodeStore.deleteNode(node.id)}>Удалить</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  icon: { fontSize: 24, marginRight: 8 },
  titleContainer: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  meta: { fontSize: 13, color: '#888', marginBottom: 12 },
  section: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  tags: { flexDirection: 'row', flexWrap: 'wrap' },
  content: { marginTop: 12, marginBottom: 16 },
  contentText: { fontSize: 14, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 8 },
});