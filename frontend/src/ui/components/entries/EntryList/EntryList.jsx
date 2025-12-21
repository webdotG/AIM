import React from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore } from '@/store/StoreContext';
import EntryCard from '../EntryCard/EntryCard';
import Loader from '../../common/Loader/Loader';
import './EntryList.css';

const EntryList = observer(() => {
  const { t } = useLanguage();
  const entriesStore = useEntriesStore();

  const entries = entriesStore?.filteredEntries || entriesStore?.entries || [];
  const isLoading = entriesStore?.isLoading || false;
  const isEmpty = !isLoading && entries.length === 0;

  if (isLoading) {
    return (
      <div className="entry-list-loading">
        <Loader size="medium" />
        <p className="loading-text">{t('common.loading')}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="entry-list-empty">
        <div className="empty-icon">icon</div>
        <p className="empty-title">{t('entries.list.emptyState')}</p>
        <p className="empty-subtitle">{t('entries.list.createFirst')}</p>
      </div>
    );
  }

  return (
    <div className="entry-list">
      <div className="entry-list-header">
        <h2 className="list-title">{t('entries.list.title')}</h2>
        {entries.length > 0 && (
          <span className="list-count">
            {t('common.entriesCount', { count: entries.length })}
          </span>
        )}
      </div>
      
      <div className="entries-grid">
        {entries.map((entry) => (
          <EntryCard 
            key={entry.id}
            entryId={entry.id}
            compact={false}
            showActions={true}
          />
        ))}
      </div>
    </div>
  );
});

export default EntryList;