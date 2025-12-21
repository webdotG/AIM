import React from 'react';
import { observer } from 'mobx-react-lite';
import { useEntriesStore } from '../../../store/StoreContext.jsx';
import { useTheme } from '../../../layers/theme/index.js';
import { useLanguage } from '../../../layers/language/index.js';
import EntryList from '../../components/entries/EntryList/EntryList.jsx';
import EntryForm from '../../components/entries/EntryForm/EntryForm.jsx';
import './AnalyticsTimelinePage.css';
import Header  from '../../components/layout/Header.jsx';
const TimelinePage = observer(() => {
  const { theme } = useTheme(); 
  const { t } = useLanguage(); 
  const entriesStore = useEntriesStore();

  // Проверяем и получаем значения с fallback
  const totalEntries = entriesStore?.totalEntries || 0;
  const entriesByType = entriesStore?.entriesByType || {};
  const completedPlans = entriesStore?.completedPlans || 0;
  const overduePlans = entriesStore?.overduePlans || 0;
  const dreamCount = entriesByType.dream || 0;

  return (
    <div className="timeline-page" data-theme={theme}>
      {/* Заголовок */}
      <div className="timeline-header">
        {/* <Header /> */}
        {/* <h1 className="timeline-title">{t('entries.list.title')}</h1> */}
        <p style={{textAlign:"center"}}className="timeline-subtitle">
          {totalEntries === 0 
            ? t('entries.list.emptyState')
            : t('common.entriesCount', { count: totalEntries })}
        </p>
      </div>

      {/* Статистика */}
      <div className="timeline-stats">
        <h3 className="stats-title">{t('common.statistics')}</h3>
        
        <div className="stats-grid">
          {/* Всего записей */}
          <div className="stat-card">
            <div className="stat-value stat-total">{totalEntries}</div>
            <div className="stat-label">{t('common.total')}</div>
          </div>

          {/* Сны */}
          <div className="stat-card">
            <div className="stat-value stat-dreams">
              {dreamCount}
            </div>
            <div className="stat-label">{t('entries.types.dream')}</div>
          </div>

          {/* Выполнено планов */}
          <div className="stat-card">
            <div className="stat-value stat-completed">
              {completedPlans}
            </div>
            <div className="stat-label">{t('common.completed')}</div>
          </div>

          {/* Просрочено планов */}
          <div className="stat-card">
            <div className="stat-value stat-overdue">
              {overduePlans}
            </div>
            <div className="stat-label">{t('common.overdue')}</div>
          </div>
        </div>
      </div>


      {/* Основная сетка: форма и список */}
      <div className="timeline-grid">
        <div className="timeline-column">
          <EntryList />
        </div>
      </div>


    </div>
  );
});

export default TimelinePage;