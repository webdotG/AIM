// Пример как адаптировать EntryForm для работы в обеих платформах
import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import { useEntriesStore, useUIStore, useUrlSyncStore } from '@/store/StoreContext';

// Универсальные компоненты
import { 
  PlatformButton, 
  PlatformModal,
  usePlatformNotification 
} from '@/ui/components/common/PlatformAdapter';

// Остальные компоненты остаются те же
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';
import CircumstancesPicker from '@/ui/components/circumstances/CircumstancesPicker';
import BodyStatePicker from '../../bodyState/BodyStatePicker';
import SkillsPicker from '@/ui/components/skills/SkillsPicker';
import RelationPicker from '../../relation/RelationPicker';
import RelationGraph from '../../relation/RelationGraph';
import TagsPicker from '@/ui/components/tags/TagsPicker';
import EntryTypePicker from '../../entries/EntryType/EntryTypePicker';
import UrlStatusBar from '@/ui/components/status/UrlStatusBar';

import './EntryForm.css';

const EntryForm = observer(() => {
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const urlSyncStore = useUrlSyncStore();
  const { t } = useLanguage();
  const { utils, isTelegram } = usePlatform();
  const showNotification = usePlatformNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Модалки для пикеров
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showCircumstancesPicker, setShowCircumstancesPicker] = useState(false);
  const [showBodyPicker, setShowBodyPicker] = useState(false);
  const [showSkillsPicker, setShowSkillsPicker] = useState(false);
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showSkillProgressPicker, setShowSkillProgressPicker] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);

  // Обработчики изменений для пикеров
  const handleEmotionsChange = useCallback((updatedEmotions) => {
    urlSyncStore?.setEmotions(updatedEmotions);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const handleCircumstancesChange = useCallback((updatedCircumstances) => {
    urlSyncStore?.setCircumstances(updatedCircumstances);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const handleBodyStateChange = useCallback((updatedBodyState) => {
    urlSyncStore?.setBodyState(updatedBodyState);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const handleSkillsChange = useCallback((updatedSkills) => {
    urlSyncStore?.setSkills(updatedSkills);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const handleRelationsChange = useCallback((updatedRelations) => {
    urlSyncStore?.setRelations(updatedRelations);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const handleTagsChange = useCallback((updatedTags) => {
    urlSyncStore?.setTags(updatedTags);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const handleSkillProgressChange = useCallback((updatedProgress) => {
    urlSyncStore?.setSkillProgress(updatedProgress);
    if (isTelegram) {
      utils.hapticFeedback('success');
    }
  }, [urlSyncStore, isTelegram, utils]);

  const searchGraphs = useCallback(async (params) => {
    try {
      return await entriesStore.searchEntries({
        query: params.query,
        limit: params.limit || 10,
        type: params.type
      });
    } catch (error) {
      console.warn('Graph search error:', error);
      return [];
    }
  }, [entriesStore]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!urlSyncStore?.content?.trim()) {
      showNotification(t('common.requiredContent'), 'error');
      if (isTelegram) {
        utils.hapticFeedback('error');
      }
      return;
    }

    if (urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline) {
      showNotification(t('common.requiredDeadline'), 'error');
      if (isTelegram) {
        utils.hapticFeedback('error');
      }
      return;
    }

    setIsSubmitting(true);
    
    if (isTelegram) {
      utils.hapticFeedback('medium');
    }

    try {
      const entryData = {
        type: urlSyncStore?.type,
        content: urlSyncStore?.content.trim(),
        ...(urlSyncStore?.eventDate && { eventDate: new Date(urlSyncStore?.eventDate) }),
        ...(urlSyncStore?.deadline && { deadline: new Date(urlSyncStore?.deadline) }),
        emotions: urlSyncStore?.emotions || [],
        circumstances: urlSyncStore?.circumstances || [],
        bodyState: urlSyncStore?.bodyState || {},
        skills: urlSyncStore?.skills || [],
        relations: urlSyncStore?.relations || [],
        tags: urlSyncStore?.tags || [],
        skillProgress: urlSyncStore?.skillProgress || []
      };

      await entriesStore.createEntry(entryData);
      
      // Очищаем данные через стор
      urlSyncStore?.reset();
      
      showNotification(t('common.entryCreated'), 'success');
      
      if (isTelegram) {
        utils.hapticFeedback('success');
      }

    } catch (error) {
      console.error('Submit error:', error);
      showNotification('Ошибка при создании записи', 'error');
      
      if (isTelegram) {
        utils.hapticFeedback('error');
      }
      
      uiStore.setError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [urlSyncStore, uiStore, t, entriesStore, showNotification, isTelegram, utils]);

  const hasBodyState = urlSyncStore?.bodyState && 
    ((urlSyncStore?.bodyState.hp && urlSyncStore?.bodyState.hp > 0) || 
     (urlSyncStore?.bodyState.energy && urlSyncStore?.bodyState.energy > 0) || 
     urlSyncStore?.bodyState.location);

  const handleOpenModal = useCallback((modalSetter) => {
    return () => {
      if (isTelegram) {
        utils.hapticFeedback('light');
      }
      modalSetter(true);
    };
  }, [isTelegram, utils]);

  return (
    <>
      <form className={`entry-form ${isTelegram ? 'telegram' : 'web'}`} onSubmit={handleSubmit}>
        <h3 className="form-title">{t('entries.form.title')}</h3>

        {/* Тип записи - отдельный компонент */}
        <EntryTypePicker />

        {/* Контент */}
        <div className="form-group">
          <label className="form-label required">{t('entries.form.contentLabel')}</label>
          <textarea
            className="form-textarea"
            value={urlSyncStore?.content || ''}
            onChange={(e) => urlSyncStore?.setContent(e.target.value)}
            placeholder={t('entries.form.contentPlaceholder')}
            required
            disabled={isSubmitting}
            rows={isTelegram ? 6 : 4}
          />
          <div className="character-count">
            {(urlSyncStore?.content || '').length} символов
          </div>
        </div>

        {/* Даты */}
        <div className="date-row">
          <div className="form-group">
            <label className="form-label">{t('entries.form.dateLabel')}</label>
            <input
              className="form-input"
              type="date"
              value={urlSyncStore?.eventDate || ''}
              onChange={(e) => urlSyncStore?.setEventDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              disabled={isSubmitting}
            />
          </div>

          {urlSyncStore?.type === 'plan' && (
            <div className="form-group">
              <label className="form-label required">{t('entries.form.deadlineLabel')}</label>
              <input
                className="form-input"
                type="date"
                value={urlSyncStore?.deadline || ''}
                onChange={(e) => urlSyncStore?.setDeadline(e.target.value)}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                required
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {/* Эмоции */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.emotionsLabel') || '⊕⊖ Эмоции'}</label>
            <PlatformButton
              type="button"
              variant={(urlSyncStore?.emotions?.length || 0) > 0 ? 'secondary' : 'primary'}
              onClick={handleOpenModal(setShowEmotionPicker)}
              disabled={isSubmitting}
            >
              {(urlSyncStore?.emotions?.length || 0) > 0 
                ? `${urlSyncStore?.emotions.length} выбрано`
                : t('emotions.picker.open') || 'Добавить'
              }
            </PlatformButton>
          </div>

          {(urlSyncStore?.emotions?.length || 0) > 0 && (
            <div className="emotions-container">
              {urlSyncStore?.emotions.map((emotion, index) => (
                <div key={index} className="emotion-badge">
                  <div className="emotion-info">
                    <span className="emotion-icon">{emotion.emotion?.icon || emotion.category?.icon}</span>
                    <div className="emotion-details">
                      <div className="emotion-label">
                        {emotion.emotion?.label || emotion.category?.label}
                      </div>
                      <div className="emotion-category">{emotion.intensity}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Остальные секции аналогично... */}

        {/* Статус бар с данными из URL */}
        <UrlStatusBar />

        {/* Submit кнопка - используем PlatformButton */}
        <PlatformButton
          type="submit"
          variant="primary"
          disabled={isSubmitting || !urlSyncStore?.content?.trim()}
          haptic={true}
        >
          {isSubmitting ? `${t('common.saving')}...` : t('entries.form.submit') || 'Создать запись'}
        </PlatformButton>

        {urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline && (
          <div className="plan-warning">{t('common.planDeadlineRequired')}</div>
        )}
      </form>

      {/* Модалки - используем PlatformModal или обычный Modal */}
      {showEmotionPicker && (
        <Modal
          isOpen={showEmotionPicker}
          onClose={() => setShowEmotionPicker(false)}
          title={t('emotions.picker.title') || 'Эмоции'}
          size="lg"
        >
          <EmotionPicker
            selectedEmotions={urlSyncStore?.emotions || []}
            onChange={handleEmotionsChange}
            maxEmotions={5}
          />
        </Modal>
      )}

      {showCircumstancesPicker && (
        <Modal
          isOpen={showCircumstancesPicker}
          onClose={() => setShowCircumstancesPicker(false)}
          title={t('circumstances.picker.title') || 'Обстоятельства'}
          size="lg"
        >
          <CircumstancesPicker
            selectedCircumstances={urlSyncStore?.circumstances || []}
            onChange={handleCircumstancesChange}
            maxCircumstances={5}
          />
        </Modal>
      )}

      {showBodyPicker && (
        <Modal
          isOpen={showBodyPicker}
          onClose={() => setShowBodyPicker(false)}
          title={t('body.picker.title') || 'Состояние тела'}
          size="lg"
        >
          <BodyStatePicker
            bodyState={urlSyncStore?.bodyState || {}}
            onChange={handleBodyStateChange}
          />
        </Modal>
      )}

      {showSkillsPicker && (
        <Modal
          isOpen={showSkillsPicker}
          onClose={() => setShowSkillsPicker(false)}
          title={t('skills.picker.title') || 'Навыки'}
          size="lg"
        >
          <SkillsPicker
            selectedSkills={urlSyncStore?.skills || []}
            onChange={handleSkillsChange}
            maxSkills={10}
          />
        </Modal>
      )}

      {showRelationPicker && (
        <Modal
          isOpen={showRelationPicker}
          onClose={() => setShowRelationPicker(false)}
          title="Добавить связи"
          size="lg"
        >
          <RelationPicker
            selectedRelations={urlSyncStore?.relations || []}
            onChange={handleRelationsChange}
            maxRelations={5}
            searchGraphs={searchGraphs}
          />
        </Modal>
      )}

      {showGraph && (
        <Modal
          isOpen={showGraph}
          onClose={() => setShowGraph(false)}
          title="Граф связей"
          size="lg"
        >
          <RelationGraph
            relations={urlSyncStore?.relations || []}
            onClose={() => setShowGraph(false)}
          />
        </Modal>
      )}
            
      {showSkillProgressPicker && (
        <Modal
          isOpen={showSkillProgressPicker}
          onClose={() => setShowSkillProgressPicker(false)}
          title="Прокачка навыков"
          size="lg"
        >
          <SkillsPicker
            selectedSkills={urlSyncStore?.skillProgress || []}
            onChange={handleSkillProgressChange}
            maxSkills={5}
            mode="progress"
          />
        </Modal>
      )}

      {showTagsPicker && (
        <Modal
          isOpen={showTagsPicker}
          onClose={() => setShowTagsPicker(false)}
          title="Добавить теги"
          size="md"
        >
          <TagsPicker
            selectedTags={urlSyncStore?.tags || []}
            onChange={handleTagsChange}
            maxTags={10}
          />
        </Modal>
      )}
    </>
  );
});


export default EntryForm