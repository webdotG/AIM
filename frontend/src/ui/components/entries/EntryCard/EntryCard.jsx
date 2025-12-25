import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore } from '@/store/StoreContext'; 
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';
import CircumstancesPicker from '../../circumstances/CircumstancesPicker';
import BodyStatePicker from '../../bodyState/BodyStatePicker';
import SkillsPicker from '../../skills/SkillsPicker';
import RelationPicker from '../../relation/RelationPicker';
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
  const [showCircumstancesPicker, setShowCircumstancesPicker] = useState(false);
  const [showBodyPicker, setShowBodyPicker] = useState(false);
  const [showSkillsPicker, setShowSkillsPicker] = useState(false);
  const [showRelationPicker, setShowRelationPicker] = useState(false);

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
    circumstances = [],
    bodyState = null,
    skills = [],
    people = [],
    tags = [],
    relations = {},
    isCompleted,
    deadline
  } = entry;

  const typeConfig = {
    dream: {
      icon: 'D',
      label: t('entries.types.dream')
    },
    memory: {
      icon: 'M',
      label: t('entries.types.memory')
    },
    thought: {
      icon: 'T',
      label: t('entries.types.thought')
    },
    plan: {
      icon: 'P',
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

  // Обработчики для пикеров
  const handleEmotionsUpdate = async (updatedEmotions) => {
    try {
      await entriesStore.updateEntry(id, { emotions: updatedEmotions });
      uiStore.showSuccessMessage(t('notifications.emotionsUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  const handleCircumstancesUpdate = async (updatedCircumstances) => {
    try {
      await entriesStore.updateEntry(id, { circumstances: updatedCircumstances });
      uiStore.showSuccessMessage(t('notifications.circumstancesUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  const handleBodyStateUpdate = async (updatedBodyState) => {
    try {
      await entriesStore.updateEntry(id, { bodyState: updatedBodyState });
      uiStore.showSuccessMessage(t('notifications.bodyStateUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  const handleSkillsUpdate = async (updatedSkills) => {
    try {
      await entriesStore.updateEntry(id, { skills: updatedSkills });
      uiStore.showSuccessMessage(t('notifications.skillsUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  const handleRelationsUpdate = async (updatedRelations) => {
    try {
      await entriesStore.updateEntry(id, { relations: updatedRelations });
      uiStore.showSuccessMessage(t('notifications.relationsUpdated'));
    } catch (error) {
      uiStore.setError(error);
    }
  };

  const handleEmotionsClick = (e) => {
    e.stopPropagation();
    setShowEmotionPicker(true);
  };

  const handleCircumstancesClick = (e) => {
    e.stopPropagation();
    setShowCircumstancesPicker(true);
  };

  const handleBodyClick = (e) => {
    e.stopPropagation();
    setShowBodyPicker(true);
  };

  const handleSkillsClick = (e) => {
    e.stopPropagation();
    setShowSkillsPicker(true);
  };

  const handleRelationsClick = (e) => {
    e.stopPropagation();
    setShowRelationPicker(true);
  };

  const cardClasses = [
    'entry-card',
    compact ? 'compact' : '',
    isCompleted ? 'completed' : '',
    isOverdue ? 'overdue' : '',
    `type-${type}`
  ].filter(Boolean).join(' ');

  const hasBodyState = bodyState && (bodyState.hp > 0 || bodyState.energy > 0 || bodyState.location);

  return (
    <>
      <div
        className={cardClasses}
        onClick={handleCardClick}
      >
        {isCompleted && (
          <div className="completed-badge" title={t('common.completed')}>
            X
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
            {/* Эмоции */}
            {emotions.length > 0 ? (
              <span 
                className="meta-badge emotions-badge"
                onClick={handleEmotionsClick}
                title={t('entries.detail.clickToEdit')}
              >
                EM {emotions.length}
              </span>
            ) : (
              <button
                className="add-badge-button"
                onClick={handleEmotionsClick}
                title={t('entries.detail.addEmotions')}
              >
                +EM
              </button>
            )}

            {/* Обстоятельства */}
            {circumstances.length > 0 ? (
              <span 
                className="meta-badge circumstances-badge"
                onClick={handleCircumstancesClick}
                title={t('entries.detail.clickToEdit')}
              >
                OB {circumstances.length}
              </span>
            ) : (
              <button
                className="add-badge-button"
                onClick={handleCircumstancesClick}
                title={t('entries.detail.addCircumstances')}
              >
                +OB
              </button>
            )}

            {/* Состояние тела */}
            {hasBodyState ? (
              <span 
                className="meta-badge body-badge"
                onClick={handleBodyClick}
                title={t('entries.detail.clickToEdit')}
              >
                HP/M
              </span>
            ) : (
              <button
                className="add-badge-button"
                onClick={handleBodyClick}
                title={t('entries.detail.addBodyState')}
              >
                +HP/M
              </button>
            )}

            {/* Навыки */}
            {skills.length > 0 ? (
              <span 
                className="meta-badge skills-badge"
                onClick={handleSkillsClick}
                title={t('entries.detail.clickToEdit')}
              >
                SK {skills.length}
              </span>
            ) : (
              <button
                className="add-badge-button"
                onClick={handleSkillsClick}
                title={t('entries.detail.addSkills')}
              >
                +SK
              </button>
            )}
            
            {/* Люди */}
            {people.length > 0 && (
              <span className="meta-badge">
                PE {people.length}
              </span>
            )}
            
            {/* Теги */}
            {tags.length > 0 && (
              <span className="meta-badge">
                # {tags.length}
              </span>
            )}
            
            {/* Связи */}
            {relationsCount > 0 ? (
              <span 
                className="meta-badge relations-badge"
                onClick={handleRelationsClick}
                title={t('entries.detail.clickToEdit')}
              >
                RE {relationsCount}
              </span>
            ) : (
              <button
                className="add-badge-button"
                onClick={handleRelationsClick}
                title={t('entries.detail.addRelations')}
              >
                +RE
              </button>
            )}

            {/* Дедлайн для планов */}
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
                  {isCompleted ? 'R' : 'X'}
                </button>
              )}
              
              <button
                className="edit-button"
                onClick={handleEdit}
                title={t('common.edit')}
              >
                E
              </button>
              
              <button
                className="delete-button"
                onClick={handleDelete}
                title={t('common.delete')}
              >
                D
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модалка эмоций */}
      <Modal
        isOpen={showEmotionPicker}
        onClose={() => setShowEmotionPicker(false)}
        title={t('emotions.picker.title') || 'Эмоции'}
        size="lg"
      >
        <EmotionPicker
          selectedEmotions={emotions}
          onChange={handleEmotionsUpdate}
          maxEmotions={5}
        />
        <div className="picker-footer">
          <button className="close-button" onClick={() => setShowEmotionPicker(false)}>
            {t('common.close')}
          </button>
        </div>
      </Modal>

      {/* Модалка обстоятельств */}
      <Modal
        isOpen={showCircumstancesPicker}
        onClose={() => setShowCircumstancesPicker(false)}
        title={t('circumstances.picker.title') || 'Обстоятельства'}
        size="lg"
      >
        <CircumstancesPicker
          selectedCircumstances={circumstances}
          onChange={handleCircumstancesUpdate}
          maxCircumstances={5}
        />
        <div className="picker-footer">
          <button className="close-button" onClick={() => setShowCircumstancesPicker(false)}>
            {t('common.close')}
          </button>
        </div>
      </Modal>

      {/* Модалка состояния тела */}
      <Modal
        isOpen={showBodyPicker}
        onClose={() => setShowBodyPicker(false)}
        title={t('body.picker.title') || 'Состояние тела'}
        size="lg"
      >
        <BodyStatePicker
          bodyState={bodyState}
          onChange={handleBodyStateUpdate}
        />
        <div className="picker-footer">
          <button className="close-button" onClick={() => setShowBodyPicker(false)}>
            {t('common.close')}
          </button>
        </div>
      </Modal>

      {/* Модалка навыков */}
      <Modal
        isOpen={showSkillsPicker}
        onClose={() => setShowSkillsPicker(false)}
        title={t('skills.picker.title') || 'Навыки'}
        size="lg"
      >
        <SkillsPicker
          selectedSkills={skills}
          onChange={handleSkillsUpdate}
          maxSkills={10}
        />
        <div className="picker-footer">
          <button className="close-button" onClick={() => setShowSkillsPicker(false)}>
            {t('common.close')}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showRelationPicker}
        onClose={() => setShowRelationPicker(false)}
        title={t('relations.picker.title') || 'Связи'}
        size="lg"
      >
        <RelationPicker
          selectedRelations={relations.outgoing || []}
          onChange={handleRelationsUpdate}
          maxRelations={5}
        />
        <div className="picker-footer">
          <button className="close-button" onClick={() => setShowRelationPicker(false)}>
            {t('common.close')}
          </button>
        </div>
      </Modal>
    </>
  );
});

export default EntryCard;