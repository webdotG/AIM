import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAnalyticsStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import Spinner from '@/shared/components/Spinner/Spinner';

const AnalyticsPage = observer(() => {
  const { navigate } = useNavigator();
  const analyticsStore = useAnalyticsStore();

  useEffect(() => {
    analyticsStore.fetchStats();
    analyticsStore.fetchEmotionDistribution();
    analyticsStore.fetchProfile();
  }, []);

  if (analyticsStore.isLoading) {
    return (
      <View style={styles.loadingCenter}>
        <Spinner size="large" />
      </View>
    );
  }

  const stats = analyticsStore.stats;
  const profile = analyticsStore.profile;
  const emDist = analyticsStore.emotionDistribution;

  if (!stats && !profile) {
    return (
      <EmptyState
        icon="📊"
        title="Нет данных"
        description="Создайте записи, чтобы увидеть аналитику"
        actionLabel="Создать"
        onAction={() => navigate('/create')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <StatCard label="Всего узлов" value={stats?.totalEntries ?? '—'} />
        <StatCard label="Связей" value={stats?.totalEdges ?? '—'} />
        <StatCard label="Эмоций" value={stats?.totalEmotions ?? '—'} />
        <StatCard label="Тегов" value={stats?.totalTags ?? '—'} />
      </View>

      {emDist?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.heading}>Эмоции</Text>
          {emDist.map((e, i) => (
            <View key={i} style={styles.emotionRow}>
              <Text style={styles.emotionName}>{e.name ?? ''}</Text>
              <View style={styles.emotionBar}>
                <View
                  style={[
                    styles.emotionFill,
                    { width: `${e.count ? e.count : 0}%` },
                  ]}
                />
              </View>
              <Text style={styles.emotionCount}>{e.count ?? 0}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const StatCard = ({ label, value }) => (
  <Card style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066ff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#888',
  },
  section: { marginTop: 16 },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionName: {
    width: 80,
    fontSize: 13,
    textAlign: 'right',
    marginRight: 8,
  },
  emotionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  emotionFill: {
    height: '100%',
    backgroundColor: '#0066ff',
    borderRadius: 4,
  },
  emotionCount: {
    fontSize: 13,
    marginLeft: 8,
    minWidth: 30,
    textAlign: 'right',
  },
});

export default AnalyticsPage;