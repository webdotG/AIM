import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAnalyticsStore } from '@/store/StoreContext';
import Card from '@/shared/components/Card/Card';
import Badge from '@/shared/components/Badge/Badge';
import EmptyState from '@/shared/components/EmptyState/EmptyState';
import Spinner from '@/shared/components/Spinner/Spinner';
import { useNavigator } from '@/shared/platform/useNavigator';
import './AnalyticsPage.css';

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
      <div className="loading-center">
        <Spinner size="large" />
      </div>
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
    <div className="analytics-page">
      <div className="analytics-page__stats">
        <StatCard label="Всего узлов" value={stats?.totalEntries ?? '—'} />
        <StatCard label="Связей" value={stats?.totalEdges ?? '—'} />
        <StatCard label="Эмоций" value={stats?.totalEmotions ?? '—'} />
        <StatCard label="Тегов" value={stats?.totalTags ?? '—'} />
      </div>

      {emDist?.length > 0 && (
        <div className="analytics-page__emotions">
          <h2 className="analytics-page__heading">Эмоции</h2>
          {emDist.map((e, i) => (
            <div key={i} className="analytics-page__emotion-row">
              <span className="analytics-page__emotion-name">{e.name ?? ''}</span>
              <div className="analytics-page__emotion-bar">
                <div
                  className="analytics-page__emotion-fill"
                  style={{ width: `${e.count ? e.count : 0}%` }}
                />
              </div>
              <span className="analytics-page__emotion-count">{e.count ?? 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const StatCard = ({ label, value }) => (
  <Card variant="clickable" className="analytics-page__stat-card">
    <span className="analytics-page__stat-value">{value}</span>
    <span className="analytics-page__stat-label">{label}</span>
  </Card>
);

export default AnalyticsPage;