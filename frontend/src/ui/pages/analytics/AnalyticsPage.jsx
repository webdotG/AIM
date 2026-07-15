import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { View, Text, StyleSheet } from 'react-native';
import { useAnalyticsStore } from '@/store/StoreContext';
import { useNavigator } from '@/shared/platform/useNavigator';
import Card from '@/shared/components/Card.jsx';
import Badge from '@/shared/components/Badge.jsx';
import EmptyState from '@/shared/components/EmptyState.jsx';
import Spinner from '@/shared/components/Spinner.jsx';
import ErrorState from '@/shared/components/ErrorState.jsx';

const AnalyticsPage = observer(() => {
  const { navigate } = useNavigator();
  const analyticsStore = useAnalyticsStore();

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      await Promise.all([
        analyticsStore.fetchStats(),
        analyticsStore.fetchEmotionDistribution(),
        analyticsStore.fetchProfile(),
      ]);
    } catch (err) {
      console.error('Analytics load error:', err);
    }
  }

  if (analyticsStore.isLoading) {
    return <View style={s.center}><Spinner size="large" /></View>;
  }

  if (analyticsStore.error) {
    return <ErrorState title="Ошибка загрузки аналитики" description={analyticsStore.error} onRetry={loadData} />;
  }

  const stats = analyticsStore.stats;
  const profile = analyticsStore.profile;
  const emDist = analyticsStore.emotionDistribution || [];

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
    <View style={s.container}>
      <View style={s.grid}>
        <StatCard label="Всего узлов" value={stats?.totalEntries ?? '—'} />
        <StatCard label="Связей" value={stats?.totalEdges ?? '—'} />
        <StatCard label="Эмоций" value={stats?.totalEmotions ?? '—'} />
        <StatCard label="Тегов" value={stats?.totalTags ?? '—'} />
      </View>

      {emDist.length > 0 && (
        <View style={s.section}>
          <Text style={s.heading}>Эмоции</Text>
          {emDist.map((e, i) => (
            <View key={i} style={s.emotionRow}>
              <Text style={s.name}>{e?.name ?? ''}</Text>
              <View style={s.bar}>
                <View style={[s.fill, { width: `${e?.count ?? 0}%` }]} />
              </View>
              <Text style={s.count}>{e?.count ?? 0}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const StatCard = ({ label, value }) => (
  <Card style={s.stat}>
    <Text style={s.statValue}>{value}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </Card>
);

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  stat: { width: '48%', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#0066ff', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#888' },
  section: { marginTop: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emotionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { width: 80, fontSize: 13, textAlign: 'right', marginRight: 8 },
  bar: { flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4 },
  fill: { height: '100%', backgroundColor: '#0066ff', borderRadius: 4 },
  count: { fontSize: 13, marginLeft: 8, minWidth: 30, textAlign: 'right' },
});

export default AnalyticsPage;