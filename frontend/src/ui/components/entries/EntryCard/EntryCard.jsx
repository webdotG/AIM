import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore } from '@/store/StoreContext'; 
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';

const EntryCard = observer(({ 
  entryId,
  compact = false,
  showActions = true 
}) => {
  const { currentTheme } = useTheme();
  const { t, language } = useLanguage();
  
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);

  const entry = entriesStore.entries.find(e => e.id === entryId);
  
  if (!entry) {
    return (
      <div style={{
        padding: '20px',
        background: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: '12px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)'
      }}>
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

  // Функция для получения цвета из текущей темы
  const getColor = (colorName) => {
    return currentTheme.colors[colorName] || '#000000';
  };

  const typeConfig = {
    dream: {
      icon: '🌙',
      color: getColor('dream'),
      label: t('entries.types.dream')
    },
    memory: {
      icon: '📸',
      color: getColor('memory'),
      label: t('entries.types.memory')
    },
    thought: {
      icon: '💭',
      color: getColor('thought'),
      label: t('entries.types.thought')
    },
    plan: {
      icon: '📋',
      color: getColor('plan'),
      label: t('entries.types.plan')
    }
  };

  const config = typeConfig[type] || typeConfig.thought;

  // Вычисляем количество связей
  const relationsCount = (relations.incoming?.length || 0) + (relations.outgoing?.length || 0);

  // Стили
  const cardStyle = {
    background: 'var(--color-surface)',
    borderRadius: '12px',
    padding: compact ? '12px' : '16px',
    border: '1px solid var(--color-border)',
    borderLeft: `4px solid ${config.color}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px var(--color-shadow)',
    position: 'relative',
    opacity: isCompleted ? 0.8 : 1
  };

  const completedBadgeStyle = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: getColor('success'),
    color: 'white',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: compact ? '8px' : '12px'
  };

  const typeInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const iconStyle = {
    fontSize: compact ? '18px' : '20px'
  };

  const typeLabelStyle = {
    fontSize: compact ? '13px' : '14px',
    fontWeight: '600',
    color: config.color
  };

  const dateStyle = {
    fontSize: '12px',
    color: 'var(--color-text-secondary)'
  };

  const contentStyle = {
    fontSize: compact ? '13px' : '14px',
    color: 'var(--color-text)',
    lineHeight: '1.5',
    marginBottom: compact ? '8px' : '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: compact ? 2 : 3,
    WebkitBoxOrient: 'vertical'
  };

  const footerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  };

  const metaStyle = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    flex: 1
  };

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'var(--color-surface-hover)',
    borderRadius: '12px',
    fontSize: '11px',
    color: 'var(--color-text-secondary)'
  };

  const actionsStyle = {
    display: 'flex',
    gap: '6px'
  };

  const actionButtonStyle = {
    padding: '4px 8px',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '11px',
    color: 'var(--color-text-secondary)',
    transition: 'all 0.2s'
  };

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

  // Обработчик выбора эмоций
  const handleEmotionsUpdate = async (updatedEmotions) => {
    try {
      await entriesStore.updateEntry(id, { emotions: updatedEmotions });
      uiStore.showSuccessMessage(t('notifications.emotionsUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  // Клик по баджу эмоций для открытия пикера
  const handleEmotionsClick = (e) => {
    e.stopPropagation();
    setShowEmotionPicker(true);
  };

  return (
    <>
      <div
        style={cardStyle}
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px var(--color-shadow-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px var(--color-shadow)';
        }}
      >
        {isCompleted && (
          <div style={completedBadgeStyle} title={t('common.completed')}>
            ✓
          </div>
        )}

        {isOverdue && (
          <div style={{
            ...completedBadgeStyle,
            background: getColor('error'),
            right: isCompleted ? '20px' : '-8px'
          }} title={t('common.overdue')}>
            !
          </div>
        )}

        <div style={headerStyle}>
          <div style={typeInfoStyle}>
            <span style={iconStyle}>{config.icon}</span>
            <span style={typeLabelStyle}>{config.label}</span>
          </div>
          <span style={dateStyle}>{formatDate(createdAt)}</span>
        </div>

        <div style={contentStyle}>{content}</div>

        <div style={footerStyle}>
          <div style={metaStyle}>
            {/* Бейдж эмоций - кликабельный */}
            {emotions.length > 0 && (
              <span 
                style={{
                  ...badgeStyle,
                  cursor: 'pointer',
                  background: `${getColor('primary')}20`,
                  color: getColor('primary'),
                  border: `1px solid ${getColor('primary')}40`
                }}
                onClick={handleEmotionsClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${getColor('primary')}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${getColor('primary')}20`;
                }}
                title={t('entries.detail.clickToEditEmotions')}
              >
                😊 {t('entries.detail.emotions')} {emotions.length}
              </span>
            )}
            
            {/* Кнопка добавления эмоций, если их нет */}
            {emotions.length === 0 && (
              <button
                onClick={handleEmotionsClick}
                style={{
                  ...badgeStyle,
                  cursor: 'pointer',
                  background: `${getColor('primary')}10`,
                  border: `1px dashed ${getColor('primary')}50`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${getColor('primary')}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${getColor('primary')}10`;
                }}
                title={t('entries.detail.addEmotions')}
              >
                😊 {t('entries.detail.addEmotions')}
              </button>
            )}
            
            {people.length > 0 && (
              <span style={badgeStyle}>
                👥 {t('entries.detail.people')} {people.length}
              </span>
            )}
            
            {tags.length > 0 && (
              <span style={badgeStyle}>
                🏷️ {t('entries.detail.tags')} {tags.length}
              </span>
            )}
            
            {relationsCount > 0 && (
              <span style={badgeStyle}>
                🔗 {t('entries.detail.relations')} {relationsCount}
              </span>
            )}

            {type === 'plan' && deadline && (
              <span style={{
                ...badgeStyle,
                background: isOverdue ? `${getColor('error')}20` : 'var(--color-surface-hover)',
                color: isOverdue ? getColor('error') : 'var(--color-text-secondary)'
              }}>
                📅 {formatDate(deadline)}
              </span>
            )}
          </div>

          {showActions && (
            <div style={actionsStyle}>
              {type === 'plan' && (
                <button
                  onClick={handleToggleComplete}
                  style={{
                    ...actionButtonStyle,
                    color: isCompleted ? getColor('success') : 'var(--color-text-secondary)'
                  }}
                  title={t(isCompleted 
                    ? 'entries.detail.markAsIncomplete'
                    : 'entries.detail.markAsComplete'
                  )}
                  onMouseEnter={(e) => {
                    e.target.style.background = isCompleted 
                      ? `${getColor('success')}20`
                      : 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  {isCompleted ? '↶' : '✓'}
                </button>
              )}
              
              <button
                onClick={handleEdit}
                style={actionButtonStyle}
                title={t('common.edit')}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--color-surface-hover)';
                  e.target.style.color = 'var(--color-text)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--color-text-secondary)';
                }}
              >
                ✎
              </button>
              
              <button
                onClick={handleDelete}
                style={{
                  ...actionButtonStyle,
                  color: getColor('error')
                }}
                title={t('common.delete')}
                onMouseEnter={(e) => {
                  e.target.style.background = getColor('error');
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = getColor('error');
                }}
              >
                🗑️
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
        
        {/* Кнопка закрытия внизу */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${currentTheme.colors.border}`
        }}>
          <button
            onClick={() => setShowEmotionPicker(false)}
            style={{
              padding: '10px 20px',
              background: currentTheme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('common.close')}
          </button>
        </div>
      </Modal>
    </>
  );
});

export default EntryCard;