import React from 'react';
import { observer } from 'mobx-react-lite';
import { useEntriesStore } from '../../../store/StoreContext.jsx';
import { useTheme } from '../../../layers/theme';
import { useLanguage } from '../../../layers/language';
import EntryList from '../../components/entries/EntryList/EntryList.jsx';
import EntryForm from '../../components/entries/EntryForm/EntryForm.jsx';

const TimelinePage = observer(() => {
  const { currentTheme } = useTheme(); // Только currentTheme нужен для стилей
  const { t } = useLanguage(); // Только t нужен для переводов
  const entriesStore = useEntriesStore();

  return (
    <div style={{ 
      padding: `${currentTheme.spacing.unit * 3}px`,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Приветственный блок */}
      <div style={{ 
        marginBottom: `${currentTheme.spacing.unit * 4}px`,
        padding: `${currentTheme.spacing.unit * 3}px`,
        backgroundColor: currentTheme.colors.surface,
        borderRadius: currentTheme.borderRadius.large,
        borderLeft: `4px solid ${currentTheme.colors.primary}`,
        boxShadow: currentTheme.shadows.medium
      }}>
        <h1 style={{ 
          marginTop: 0, 
          marginBottom: `${currentTheme.spacing.unit * 2}px`,
          color: currentTheme.colors.text 
        }}>
          📊 {t('entries.list.title')}
        </h1>
        <p style={{ 
          color: currentTheme.colors.textSecondary,
          margin: 0,
          lineHeight: 1.6 
        }}>
          {entriesStore.totalEntries === 0 
            ? t('entries.list.emptyState')
            : t('common.entriesCount', { count: entriesStore.totalEntries })}
        </p>
      </div>

      {/* Основная сетка: форма и список */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: `${currentTheme.spacing.unit * 4}px`,
        marginBottom: `${currentTheme.spacing.unit * 4}px`,
        '@media (max-width: 768px)': {
          gridTemplateColumns: '1fr'
        }
      }}>
        {/* Левая колонка - форма */}
        <div>
          <EntryForm />
        </div>
        
        {/* Правая колонка - список */}
        <div>
          <EntryList />
        </div>
      </div>

      {/* Статистика */}
      <div style={{
        padding: `${currentTheme.spacing.unit * 3}px`,
        backgroundColor: currentTheme.colors.surface,
        borderRadius: currentTheme.borderRadius.medium,
        border: `1px solid ${currentTheme.colors.border}`,
        boxShadow: currentTheme.shadows.small
      }}>
        <h3 style={{ 
          color: currentTheme.colors.text,
          marginTop: 0,
          marginBottom: `${currentTheme.spacing.unit * 3}px`
        }}>
          {t('common.statistics')}
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: `${currentTheme.spacing.unit * 2}px`,
          '@media (max-width: 768px)': {
            gridTemplateColumns: 'repeat(2, 1fr)'
          },
          '@media (max-width: 480px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Всего записей */}
          <div style={{ 
            textAlign: 'center',
            padding: `${currentTheme.spacing.unit * 2}px`,
            backgroundColor: currentTheme.colors.background,
            borderRadius: currentTheme.borderRadius.medium,
            border: `1px solid ${currentTheme.colors.border}`
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: currentTheme.colors.primary,
              marginBottom: `${currentTheme.spacing.unit}px`
            }}>
              {entriesStore.totalEntries}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: currentTheme.colors.textSecondary 
            }}>
              {t('common.total')}
            </div>
          </div>

          {/* Сны */}
          <div style={{ 
            textAlign: 'center',
            padding: `${currentTheme.spacing.unit * 2}px`,
            backgroundColor: currentTheme.colors.background,
            borderRadius: currentTheme.borderRadius.medium,
            border: `1px solid ${currentTheme.colors.border}`
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: currentTheme.colors.dream,
              marginBottom: `${currentTheme.spacing.unit}px`
            }}>
              {entriesStore.entriesByType.dream || 0}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: currentTheme.colors.textSecondary 
            }}>
              {t('entries.types.dream')}
            </div>
          </div>

          {/* Выполнено планов */}
          <div style={{ 
            textAlign: 'center',
            padding: `${currentTheme.spacing.unit * 2}px`,
            backgroundColor: currentTheme.colors.background,
            borderRadius: currentTheme.borderRadius.medium,
            border: `1px solid ${currentTheme.colors.border}`
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: currentTheme.colors.success,
              marginBottom: `${currentTheme.spacing.unit}px`
            }}>
              {entriesStore.completedPlans}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: currentTheme.colors.textSecondary 
            }}>
              {t('common.completed')}
            </div>
          </div>

          {/* Просрочено планов */}
          <div style={{ 
            textAlign: 'center',
            padding: `${currentTheme.spacing.unit * 2}px`,
            backgroundColor: currentTheme.colors.background,
            borderRadius: currentTheme.borderRadius.medium,
            border: `1px solid ${currentTheme.colors.border}`
          }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: currentTheme.colors.error,
              marginBottom: `${currentTheme.spacing.unit}px`
            }}>
              {entriesStore.overduePlans}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: currentTheme.colors.textSecondary 
            }}>
              {t('common.overdue')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default TimelinePage;