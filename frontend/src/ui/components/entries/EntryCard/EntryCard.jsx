import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore } from '@/store/StoreContext'; 
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';
import './EntryCard.css';

const EntryCard = observer(({ 
  entryId,
  compact = false,
  showActions = true 
}) => {
  const { t, language } = useLanguage();
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);

  const entry = entriesStore.entries.find(e => e.id === entryId);
  
  if (!entry) {
    return (
      <div className="entry-not-found">
        {t('common.entryNotFound')}
      </div>
    );
  }

  const {
    id,
    type,
    content,
    createdAt,
    emotions = [],
    people = [],
    tags = [],
    relations = {},
    isCompleted,
    deadline
  } = entry;

  const typeConfig = {
    dream: {
      icon: 'x',
      colorClass: 'type-dream',
      label: t('entries.types.dream')
    },
    memory: {
      icon: 'a',
      colorClass: 'type-memory',
      label: t('entries.types.memory')
    },
    thought: {
      icon: 'o',
      colorClass: 'type-thought',
      label: t('entries.types.thought')
    },
    plan: {
      icon: 'l',
      colorClass: 'type-plan',
      label: t('entries.types.plan')
    }
  };

  const config = typeConfig[type] || typeConfig.thought;

  // Вычисляем количество связей
  const relationsCount = (relations.incoming?.length || 0) + (relations.outgoing?.length || 0);

  // Форматирование даты
  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('time.today');
    if (diffDays === 1) return t('time.yesterday');
    if (diffDays < 7) return `${diffDays} ${t('time.daysAgo')}`;
    
    return d.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Проверка просроченного плана
  const isOverdue = type === 'plan' && !isCompleted && deadline && new Date(deadline) < new Date();

  // Обработчики событий
  const handleCardClick = () => {
    entriesStore.setCurrentEntry(entry);
    uiStore.openModal('entryDetail');
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    entriesStore.setCurrentEntry(entry);
    uiStore.openModal('editEntry');
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(t('entries.detail.deleteConfirmation'))) {
      try {
        await entriesStore.deleteEntry(id);
        uiStore.showSuccessMessage(t('notifications.entryDeleted'));
      } catch (error) {
        uiStore.setError(error);
      }
    }
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    if (type === 'plan') {
      try {
        await entriesStore.updateEntry(id, { 
          isCompleted: !isCompleted 
        });
        uiStore.showSuccessMessage(
          t(isCompleted 
            ? 'entries.detail.markAsIncomplete'
            : 'entries.detail.markAsComplete'
          )
        );
      } catch (error) {
        uiStore.setError(error);
      }
    }
  };

  const handleEmotionsUpdate = async (updatedEmotions) => {
    try {
      await entriesStore.updateEntry(id, { emotions: updatedEmotions });
      uiStore.showSuccessMessage(t('notifications.emotionsUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  const handleEmotionsClick = (e) => {
    e.stopPropagation();
    setShowEmotionPicker(true);
  };

  const cardClasses = [
    'entry-card',
    compact ? 'compact' : '',
    isCompleted ? 'completed' : '',
    isOverdue ? 'overdue' : '',
    config.colorClass
  ].filter(Boolean).join(' ');

  return (
    <>
      <div
        className={cardClasses}
        onClick={handleCardClick}
      >
        {isCompleted && (
          <div className="completed-badge" title={t('common.completed')}>
            ✓
          </div>
        )}

        {isOverdue && (
          <div className="overdue-badge" title={t('common.overdue')}>
            !
          </div>
        )}

        <div className="entry-header">
          <div className="entry-type">
            <span className="entry-icon">{config.icon}</span>
            <span className="entry-label">{config.label}</span>
          </div>
          <span className="entry-date">{formatDate(createdAt)}</span>
        </div>

        <div className="entry-content">{content}</div>

        <div className="entry-footer">
          <div className="entry-meta">
            {/* Бейдж эмоций - кликабельный */}
            {emotions.length > 0 ? (
              <span 
                className="emotions-badge"
                onClick={handleEmotionsClick}
                title={t('entries.detail.clickToEditEmotions')}
              >
                {t('entries.detail.emotions')} {emotions.length}
              </span>
            ) : (
              <button
                className="add-emotions-button"
                onClick={handleEmotionsClick}
                title={t('entries.detail.addEmotions')}
              >
                {t('entries.detail.addEmotions')}
              </button>
            )}
            
            {people.length > 0 && (
              <span className="meta-badge">
                {t('entries.detail.people')} {people.length}
              </span>
            )}
            
            {tags.length > 0 && (
              <span className="meta-badge">
                {t('entries.detail.tags')} {tags.length}
              </span>
            )}
            
            {relationsCount > 0 && (
              <span className="meta-badge">
                {t('entries.detail.relations')} {relationsCount}
              </span>
            )}

            {type === 'plan' && deadline && (
              <span className={`deadline-badge ${isOverdue ? 'overdue' : ''}`}>
                {formatDate(deadline)}
              </span>
            )}
          </div>

          {showActions && (
            <div className="entry-actions">
              {type === 'plan' && (
                <button
                  className={`complete-button ${isCompleted ? 'completed' : ''}`}
                  onClick={handleToggleComplete}
                  title={t(isCompleted 
                    ? 'entries.detail.markAsIncomplete'
                    : 'entries.detail.markAsComplete'
                  )}
                >
                  {isCompleted ? '↶' : '✓'}
                </button>
              )}
              
              <button
                className="edit-button"
                onClick={handleEdit}
                title={t('common.edit')}
              >
                ✎
              </button>
              
              <button
                className="delete-button"
                onClick={handleDelete}
                title={t('common.delete')}
              >
                delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модалка для выбора эмоций */}
      <Modal
        isOpen={showEmotionPicker}
        onClose={() => setShowEmotionPicker(false)}
        title={t('emotions.picker.title')}
        size="lg"
        footer={null}
      >
        <EmotionPicker
          selectedEmotions={emotions}
          onChange={handleEmotionsUpdate}
          maxEmotions={5}
        />
        
        <div className="emotion-picker-footer">
          <button
            className="close-button"
            onClick={() => setShowEmotionPicker(false)}
          >
            {t('common.close')}
          </button>
        </div>
      </Modal>
    </>
  );
});

export default EntryCard;