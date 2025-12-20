// src/ui/components/entries/EntryList/EntryList.jsx
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTheme } from '@/layers/theme'; // ← Заменяем useThemeStore
import { useLanguage } from '@/layers/language'; // ← Заменяем useLanguageStore
import { useEntriesStore, useUIStore } from '@/store/StoreContext'; // ← Только эти из Store
import EntryCard from '../EntryCard/EntryCard';

const EntryList = observer(() => {
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  
  // Из Layers
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'type' | 'content'

  // Функция для получения цвета
  const getColor = (colorName) => {
    return currentTheme.colors[colorName] || '#000000';
  };

  // Сортируем записи
  const sortedEntries = [...entriesStore.filteredEntries].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'content':
        return a.content.localeCompare(b.content);
      default:
        return 0;
    }
  });

  // Стили
  const containerStyle = {
    padding: '20px',
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  };

  const titleStyle = {
    margin: 0,
    color: 'var(--color-text)',
    fontSize: '18px',
    fontWeight: '600'
  };

  const controlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  };

  const filterButtonStyle = (active) => ({
    padding: '6px 12px',
    background: active ? 'var(--color-primary)' : 'var(--color-surface-hover)',
    color: active ? 'white' : 'var(--color-text-secondary)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s'
  });

  const selectStyle = {
    padding: '6px 12px',
    background: 'var(--color-surface-hover)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  };

  const viewToggleStyle = {
    display: 'flex',
    background: 'var(--color-surface-hover)',
    borderRadius: '6px',
    padding: '2px'
  };

  const viewButtonStyle = (active) => ({
    padding: '6px 12px',
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? 'white' : 'var(--color-text-secondary)',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  });

  const listStyle = {
    display: viewMode === 'grid' ? 'grid' : 'flex',
    gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
    flexDirection: viewMode === 'list' ? 'column' : 'row',
    gap: '15px'
  };

  const emptyStateStyle = {
    padding: '40px 20px',
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
    border: '2px dashed var(--color-border)',
    borderRadius: '8px'
  };

  const statsStyle = {
    display: 'flex',
    gap: '15px',
    marginTop: '15px',
    flexWrap: 'wrap'
  };

  const statItemStyle = {
    padding: '8px 12px',
    background: 'var(--color-surface-hover)',
    borderRadius: '6px',
    fontSize: '12px',
    color: 'var(--color-text-secondary)'
  };

  const handleFilterChange = (filterType, value) => {
    entriesStore.setFilters({ [filterType]: value === 'all' ? null : value });
  };

  const handleClearFilters = () => {
    entriesStore.clearFilters();
  };

  const hasActiveFilters = Object.values(entriesStore.filters).some(
    value => value !== null && value !== ''
  );

  if (entriesStore.isLoading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: `3px solid ${getColor('border')}`,
            borderTopColor: getColor('primary'),
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '15px', color: 'var(--color-text-secondary)' }}>
            {t('common.loading')} {/* ← Используем t из useLanguage */}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          {t('entries.list.title')} ({sortedEntries.length}) {/* ← Используем t */}
        </h3>

        <div style={controlsStyle}>
          {/* Фильтр по типу */}
          <select
            value={entriesStore.filters.type || 'all'}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={selectStyle}
          >
            <option value="all">{t('entries.list.filterByType')}</option>
            <option value="dream">{t('entries.types.dream')}</option>
            <option value="memory">{t('entries.types.memory')}</option>
            <option value="thought">{t('entries.types.thought')}</option>
            <option value="plan">{t('entries.types.plan')}</option>
          </select>

          {/* Поиск */}
          <input
            type="text"
            value={entriesStore.filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder={t('common.search')}
            style={{
              ...selectStyle,
              padding: '6px 12px',
              width: '150px'
            }}
          />

          {/* Сортировка */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={selectStyle}
          >
            <option value="date">{t('common.sortByDate')}</option>
            <option value="type">{t('common.sortByType')}</option>
            <option value="content">{t('common.sortByContent')}</option>
          </select>

          {/* Переключение вида */}
          <div style={viewToggleStyle}>
            <button
              onClick={() => setViewMode('list')}
              style={viewButtonStyle(viewMode === 'list')}
              title={t('common.listView')}
            >
              ≡
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={viewButtonStyle(viewMode === 'grid')}
              title={t('common.gridView')}
            >
              ☷
            </button>
          </div>

          {/* Очистка фильтров */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              style={{
                ...filterButtonStyle(false),
                color: getColor('error') // ← Используем getColor
              }}
            >
              {t('common.clearAll')}
            </button>
          )}
        </div>
      </div>

      {/* Статистика */}
      <div style={statsStyle}>
        <div style={statItemStyle}>
          {t('common.total')}: {entriesStore.totalEntries}
        </div>
        <div style={statItemStyle}>
          {t('entries.types.dream')}: {entriesStore.entriesByType.dream || 0}
        </div>
        <div style={statItemStyle}>
          {t('entries.types.memory')}: {entriesStore.entriesByType.memory || 0}
        </div>
        <div style={statItemStyle}>
          {t('entries.types.thought')}: {entriesStore.entriesByType.thought || 0}
        </div>
        <div style={statItemStyle}>
          {t('entries.types.plan')}: {entriesStore.entriesByType.plan || 0}
        </div>
      </div>

      {/* Список записей */}
      <div style={listStyle}>
        {sortedEntries.length === 0 ? (
          <div style={emptyStateStyle}>
            <p style={{ fontSize: '16px', marginBottom: '10px' }}>
              {t('entries.list.emptyState')}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {hasActiveFilters
                ? t('common.noResults')
                : t('entries.list.createFirst')}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {t('common.clearFilters')}
              </button>
            )}
          </div>
        ) : (
          sortedEntries.map(entry => (
            <EntryCard
              key={entry.id}
              entryId={entry.id}
              compact={viewMode === 'grid'}
              showActions={viewMode === 'list'}
            />
          ))
        )}
      </div>

      {/* Стили для анимации загрузки */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

export default EntryList;