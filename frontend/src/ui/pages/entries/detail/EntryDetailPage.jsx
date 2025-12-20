// src/ui/pages/entries/detail/EntryDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useStore } from '@/store/StoreContext';
import { useLanguage } from '@/layers/language';
import Header from '@/ui/components/layout/Header';
import EntryCard from '@/ui/components/entries/EntryCard/EntryCard';
import Button from '@/ui/components/common/Button/Button';
import Loader from '@/ui/components/common/Loader/Loader';
import './EntryDetailPage.css';

export default function EntryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const { t } = useLanguage();
  // const entriesStore = useStore(state => state.entries);
  
  useEffect(() => {
    fetchEntry();
  }, [id]);
  
  const fetchEntry = async () => {
    setLoading(true);
    try {
      // TODO: Загрузить запись по ID
      // const fetchedEntry = await entriesStore.getEntryById(id);
      // setEntry(fetchedEntry);
      
      // Временно используем заглушку
      setTimeout(() => {
        setEntry({
          id,
          type: 'thought',
          content: 'Это пример записи. Реализация детального просмотра в разработке.',
          createdAt: new Date().toISOString(),
          emotions: [],
          people: [],
          tags: []
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch entry:', error);
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    navigate(`/entries/${id}/edit`);
  };
  
  const handleDelete = async () => {
    if (confirm(t('entries.delete_confirm'))) {
      try {
        // await entriesStore.deleteEntry(id);
        navigate('/timeline');
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return <Loader message={t('entries.loading')} />;
  }
  
  if (!entry) {
    return (
      <div className="entry-detail-page">
        <Header 
          title={t('entries.not_found')}
          showBack={true}
          onBack={handleBack}
        />
        <div className="not-found">
          <p>{t('entries.entry_not_found')}</p>
          <Button onClick={() => navigate('/timeline')}>
            {t('entries.back_to_timeline')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="entry-detail-page">
      <Header 
        title={t('entries.details')}
        showBack={true}
        onBack={handleBack}
        actions={
          <>
            <Button onClick={handleEdit} variant="outline" size="small">
              {t('common.edit')}
            </Button>
            <Button onClick={handleDelete} variant="danger" size="small">
              {t('common.delete')}
            </Button>
          </>
        }
      />
      
      <main className="entry-detail-content">
        <EntryCard entry={entry} detailed={true} />
        
        <div className="entry-relations">
          <h3>{t('entries.relations')}</h3>
          <div className="empty-relations">
            <p>{t('entries.no_relations')}</p>
          </div>
        </div>
        
        <div className="entry-meta">
          <h3>{t('entries.metadata')}</h3>
          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">{t('entries.created')}</span>
              <span className="meta-value">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{t('entries.type')}</span>
              <span className="meta-value">{entry.type}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}