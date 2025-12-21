// EntryForm.jsx - ПОЛНЫЙ ИСПРАВЛЕННЫЙ КОД
import React, { useState, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore, useUrlSyncStore } from '@/store/StoreContext';
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
  // ИСПРАВЛЕНО: Проверка что хуки вернули данные
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const urlSyncStore = useUrlSyncStore();
  const { t } = useLanguage();

  // если store не загружен
  // if (!urlSyncStore? || !entriesStore || !uiStore) {
  //   return <div className="loading-state">Loading form...</div>;
  // }

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
  }, [urlSyncStore]);

  const handleCircumstancesChange = useCallback((updatedCircumstances) => {
    urlSyncStore?.setCircumstances(updatedCircumstances);
  }, [urlSyncStore]);

  const handleBodyStateChange = useCallback((updatedBodyState) => {
    urlSyncStore?.setBodyState(updatedBodyState);
  }, [urlSyncStore]);

  const handleSkillsChange = useCallback((updatedSkills) => {
    urlSyncStore?.setSkills(updatedSkills);
  }, [urlSyncStore]);

  const handleRelationsChange = useCallback((updatedRelations) => {
    urlSyncStore?.setRelations(updatedRelations);
  }, [urlSyncStore]);

  const handleTagsChange = useCallback((updatedTags) => {
    urlSyncStore?.setTags(updatedTags);
  }, [urlSyncStore]);

  const handleSkillProgressChange = useCallback((updatedProgress) => {
    urlSyncStore?.setSkillProgress(updatedProgress);
  }, [urlSyncStore]);

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
      uiStore.showErrorMessage(t('common.requiredContent'));
      return;
    }

    if (urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline) {
      uiStore.showErrorMessage(t('common.requiredDeadline'));
      return;
    }

    setIsSubmitting(true);

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
      
      uiStore.showSuccessMessage(t('common.entryCreated'));

    } catch (error) {
      console.error('Submit error:', error);
      uiStore.setError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [urlSyncStore, uiStore, t, entriesStore]);

  // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: безопасная проверка bodyState
  const hasBodyState = urlSyncStore?.bodyState && 
    ((urlSyncStore?.bodyState.hp && urlSyncStore?.bodyState.hp > 0) || 
     (urlSyncStore?.bodyState.energy && urlSyncStore?.bodyState.energy > 0) || 
     urlSyncStore?.bodyState.location);

  return (
    <>
      <form className="entry-form" onSubmit={handleSubmit}>
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
            rows={4}
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
            <button
              type="button"
              className={`${(urlSyncStore?.emotions?.length || 0) > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowEmotionPicker(true)}
              disabled={isSubmitting}
            >
              {(urlSyncStore?.emotions?.length || 0) > 0 
                ? `${urlSyncStore?.emotions.length} выбрано`
                : t('emotions.picker.open') || 'Добавить'
              }
            </button>
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

        {/* Обстоятельства */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.circumstancesLabel') || '☁☽⚡ Обстоятельства'}</label>
            <button
              type="button"
              className={`${(urlSyncStore?.circumstances?.length || 0) > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowCircumstancesPicker(true)}
              disabled={isSubmitting}
            >
              {(urlSyncStore?.circumstances?.length || 0) > 0 
                ? `${urlSyncStore?.circumstances.length} выбрано`
                : 'Добавить'
              }
            </button>
          </div>

          {(urlSyncStore?.circumstances?.length || 0) > 0 && (
            <div className="emotions-container">
              {urlSyncStore?.circumstances.map((circ, index) => (
                <div key={index} className="emotion-badge">
                  <div className="emotion-info">
                    <span className="emotion-icon">{circ.item?.icon || circ.category?.icon}</span>
                    <div className="emotion-details">
                      <div className="emotion-label">
                        {circ.item?.label || circ.category?.label}
                      </div>
                      <div className="emotion-category">
                        {circ.isTemperature ? `${circ.intensity}°C` : `${circ.intensity}%`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Состояние тела */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.bodyStateLabel') || 'HP/MANA Состояние'}</label>
            <button
              type="button"
              className={`${hasBodyState ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowBodyPicker(true)}
              disabled={isSubmitting}
            >
              {hasBodyState ? 'Изменить' : 'Добавить'}
            </button>
          </div>

          {hasBodyState && urlSyncStore?.bodyState && (
            <div className="body-state-preview">
              {urlSyncStore?.bodyState.hp > 0 && (
                <span className="body-stat">HP: {urlSyncStore?.bodyState.hp}%</span>
              )}
              {urlSyncStore?.bodyState.energy > 0 && (
                <span className="body-stat">MANA: {urlSyncStore?.bodyState.energy}%</span>
              )}
              {urlSyncStore?.bodyState.location && (
                <span className="body-stat">📍 {urlSyncStore?.bodyState.location}</span>
              )}
            </div>
          )}
        </div>

        {/* Навыки */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.skillsLabel') || '💪🧠 Навыки'}</label>
            <button
              type="button"
              className={`${(urlSyncStore?.skills?.length || 0) > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowSkillsPicker(true)}
              disabled={isSubmitting}
            >
              {(urlSyncStore?.skills?.length || 0) > 0 
                ? `${urlSyncStore?.skills.length} выбрано`
                : 'Добавить'
              }
            </button>
          </div>

          {(urlSyncStore?.skills?.length || 0) > 0 && (
            <div className="emotions-container">
              {urlSyncStore?.skills.map((skill, index) => (
                <div key={index} className="emotion-badge">
                  <div className="emotion-info">
                    <span className="emotion-icon">{skill.skill?.icon}</span>
                    <div className="emotion-details">
                      <div className="emotion-label">
                        {skill.skill?.label} — LVL {skill.level}
                      </div>
                      <div className="emotion-category">{skill.experience} XP</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Прокачка скиллов */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.skillProgressLabel') || '⬆ Прокачка навыков'}</label>
            <button
              type="button"
              className={`${(urlSyncStore?.skillProgress?.length || 0) > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowSkillProgressPicker(true)}
              disabled={isSubmitting}
            >
              {(urlSyncStore?.skillProgress?.length || 0) > 0 
                ? `${urlSyncStore?.skillProgress.length} прокачки`
                : 'Добавить прокачку'
              }
            </button>
          </div>

          {(urlSyncStore?.skillProgress?.length || 0) > 0 && (
            <div className="emotions-container">
              {urlSyncStore?.skillProgress.map((progress, index) => (
                <div key={index} className="emotion-badge">
                  <div className="emotion-info">
                    <span className="emotion-icon">{progress.skill?.icon || '⬆'}</span>
                    <div className="emotion-details">
                      <div className="emotion-label">
                        {progress.skill?.label || progress.skill?.name}
                      </div>
                      <div className="emotion-category">
                        +{progress.experience_gained || progress.experience} XP
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Связи с другими записями */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.relationsLabel') || '↔ Связи'}</label>
            <div className="buttons-row">
              <button
                type="button"
                className={`${(urlSyncStore?.relations?.length || 0) > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
                onClick={() => setShowRelationPicker(true)}
                disabled={isSubmitting}
              >
                {(urlSyncStore?.relations?.length || 0) > 0 
                  ? `${urlSyncStore?.relations.length} связей`
                  : 'Добавить связи'
                }
              </button>
              
              <button
                type="button"
                className="show-graph-button"
                onClick={() => setShowGraph(true)}
                disabled={isSubmitting}
              >
                Показать граф
              </button>
            </div>
          </div>
          
          {(urlSyncStore?.relations?.length || 0) > 0 && (
            <div className="relations-preview">
              {urlSyncStore?.relations.slice(0, 2).map((rel, index) => (
                <div key={index} className="relation-preview-item">
                  <span className="relation-preview-icon">{rel.type?.icon || '↔'}</span>
                  <span className="relation-preview-text">
                    {rel.description && rel.description.length > 30 
                      ? rel.description.substring(0, 30) + '...' 
                      : rel.description}
                  </span>
                </div>
              ))}
              {urlSyncStore?.relations.length > 2 && (
                <div className="more-relations">
                  +{urlSyncStore?.relations.length - 2} еще
                </div>
              )}
            </div>
          )}
        </div>

        {/* Теги */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">{t('entries.form.tagsLabel') || '# Теги'}</label>
            <button
              type="button"
              className={`${(urlSyncStore?.tags?.length || 0) > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowTagsPicker(true)}
              disabled={isSubmitting}
            >
              {(urlSyncStore?.tags?.length || 0) > 0 
                ? `${urlSyncStore?.tags.length} тегов`
                : 'Добавить теги'
              }
            </button>
          </div>

          {(urlSyncStore?.tags?.length || 0) > 0 && (
            <div className="tags-container">
              {urlSyncStore?.tags.map((tag, index) => (
                <div key={index} className="tag-badge">
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Статус бар с данными из URL */}
        <UrlStatusBar />

        {/* Submit кнопка */}
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !urlSyncStore?.content?.trim()}
        >
          {isSubmitting ? `${t('common.saving')}...` : t('entries.form.submit') || 'Создать запись'}
        </button>

        {urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline && (
          <div className="plan-warning">{t('common.planDeadlineRequired')}</div>
        )}
      </form>

      {/* Модалки */}
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

export default EntryForm;