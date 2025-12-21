import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore } from '@/store/StoreContext';
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';
import CircumstancesPicker from '@/ui/components/circumstances/CircumstancesPicker';
import BodyStatePicker from '../../bodyState/BodyStatePicker';
import SkillsPicker from '@/ui/components/skills/SkillsPicker';
import RelationPicker from '../../relation/RelationPicker';
import RelationGraph from '../../relation/RelationGraph';
import TagsPicker from '@/ui/components/tags/TagsPicker';
import './EntryForm.css';

const EntryForm = observer(() => {
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const { t } = useLanguage();

  // Читаем начальные данные из URL
  const getInitialFormData = () => {
    const params = new URLSearchParams(window.location.search);
    
    return {
      type: params.get('type') || 'thought',
      content: decodeURIComponent(params.get('content') || ''),
      eventDate: params.get('date') || '',
      deadline: params.get('deadline') || '',
      emotions: [],
      circumstances: [],
      bodyState: null,
      skills: [],
      relations: [],
      people: [],
      tags: []
    };
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillProgress, setSkillProgress] = useState([]);
  
  // Модалки для пикеров
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [showCircumstancesPicker, setShowCircumstancesPicker] = useState(false);
  const [showBodyPicker, setShowBodyPicker] = useState(false);
  const [showSkillsPicker, setShowSkillsPicker] = useState(false);
  const [showRelationPicker, setShowRelationPicker] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showSkillProgressPicker, setShowSkillProgressPicker] = useState(false);
  const [showTagsPicker, setShowTagsPicker] = useState(false);

  // Обновление URL при изменении основных полей
  useEffect(() => {
    const url = new URL(window.location);
    
    // Обновляем или удаляем параметры
    if (formData.type && formData.type !== 'thought') {
      url.searchParams.set('type', formData.type);
    } else {
      url.searchParams.delete('type');
    }
    
    if (formData.content.trim()) {
      url.searchParams.set('content', encodeURIComponent(formData.content));
    } else {
      url.searchParams.delete('content');
    }
    
    if (formData.eventDate) {
      url.searchParams.set('date', formData.eventDate);
    } else {
      url.searchParams.delete('date');
    }
    
    if (formData.deadline) {
      url.searchParams.set('deadline', formData.deadline);
    } else {
      url.searchParams.delete('deadline');
    }
    
    window.history.replaceState({}, '', url);
  }, [formData.type, formData.content, formData.eventDate, formData.deadline]);

  // Функция для чтения данных из всех пикеров из URL
  const readAllPickerData = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const data = {
      emotionsCount: 0,
      circumstancesCount: 0,
      hasBodyState: false,
      skillsCount: 0,
      relationsCount: 0,
      tagsCount: 0,
      skillProgressCount: 0
    };

    // Эмоции
    const emoParam = params.get('emo');
    if (emoParam) {
      data.emotionsCount = emoParam.split(';').length;
    }

    // Обстоятельства
    const circParam = params.get('circ');
    if (circParam) {
      data.circumstancesCount = circParam.split(';').length;
    }

    // Состояние тела
    const bodyParam = params.get('body');
    if (bodyParam && bodyParam !== '0|0|') {
      data.hasBodyState = true;
    }

    // Навыки
    const skillsParam = params.get('skills');
    if (skillsParam) {
      data.skillsCount = skillsParam.split(';').length;
    }

    // Связи
    const relParam = params.get('rel');
    if (relParam) {
      data.relationsCount = relParam.split(';').length;
    }

    // Теги
    const tagsParam = params.get('tags');
    if (tagsParam) {
      data.tagsCount = tagsParam.split(',').length;
    }

    // Прокачка скиллов
    const skillProgressParam = params.get('skill_progress');
    if (skillProgressParam) {
      data.skillProgressCount = skillProgressParam.split(';').length;
    }

    return data;
  }, []);

  // Стейт для отображения данных из URL
  const [urlData, setUrlData] = useState(() => readAllPickerData());

  // Обновляем данные при изменении URL
  useEffect(() => {
    const handleUrlChange = () => {
      setUrlData(readAllPickerData());
    };

    // Слушаем изменения URL
    window.addEventListener('popstate', handleUrlChange);
    
    // Также проверяем при каждом рендере
    handleUrlChange();

    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [readAllPickerData]);

  const handleTagsChange = useCallback((updatedTags) => {
    setFormData(prev => ({ ...prev, tags: updatedTags }));
  }, []);

  const handleSkillProgressChange = useCallback((updatedProgress) => {
    setSkillProgress(updatedProgress);
  }, []);

  const typeConfig = useMemo(() => ({
    dream: { icon: 'DRE', label: t('entries.types.dream'), className: 'type-dream' },
    memory: { icon: 'MEM', label: t('entries.types.memory'), className: 'type-memory' },
    thought: { icon: 'THO', label: t('entries.types.thought'), className: 'type-thought' },
    plan: { icon: 'PLA', label: t('entries.types.plan'), className: 'type-plan' }
  }), [t]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTypeChange = useCallback((type) => {
    setFormData(prev => ({
      ...prev,
      type,
      deadline: type !== 'plan' ? '' : prev.deadline
    }));
  }, []);

  // Обработчики изменений для пикеров
  const handleEmotionsChange = useCallback((updatedEmotions) => {
    setFormData(prev => ({ ...prev, emotions: updatedEmotions }));
  }, []);

  const handleCircumstancesChange = useCallback((updatedCircumstances) => {
    setFormData(prev => ({ ...prev, circumstances: updatedCircumstances }));
  }, []);

  const handleBodyStateChange = useCallback((updatedBodyState) => {
    setFormData(prev => ({ ...prev, bodyState: updatedBodyState }));
  }, []);

  const handleSkillsChange = useCallback((updatedSkills) => {
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
  }, []);

  const handleRelationsChange = useCallback((updatedRelations) => {
    setFormData(prev => ({ ...prev, relations: updatedRelations }));
  }, []);

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
    
    if (!formData.content.trim()) {
      uiStore.showErrorMessage(t('common.requiredContent'));
      return;
    }

    if (formData.type === 'plan' && !formData.deadline) {
      uiStore.showErrorMessage(t('common.requiredDeadline'));
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        type: formData.type,
        content: formData.content.trim(),
        ...(formData.eventDate && { eventDate: new Date(formData.eventDate) }),
        ...(formData.deadline && { deadline: new Date(formData.deadline) }),
        emotions: formData.emotions,
        circumstances: formData.circumstances,
        bodyState: formData.bodyState,
        skills: formData.skills,
        relations: formData.relations,
        people: formData.people,
        tags: formData.tags
      };

      await entriesStore.createEntry(entryData);
      
      // Очищаем URL после успешного сохранения
      window.history.replaceState({}, '', window.location.pathname);
      
      setFormData({
        type: 'thought',
        content: '',
        eventDate: '',
        deadline: '',
        emotions: [],
        circumstances: [],
        bodyState: null,
        skills: [],
        relations: [],
        people: [],
        tags: []
      });
      setSkillProgress([]);
      
      uiStore.showSuccessMessage(t('common.entryCreated'));

    } catch (error) {
      console.error('Submit error:', error);
      uiStore.setError(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, uiStore, t, entriesStore]);

  const dateUtils = useMemo(() => ({
    current: () => new Date().toISOString().split('T')[0],
    tomorrow: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }
  }), []);

  const hasBodyState = formData.bodyState && 
    (formData.bodyState.hp > 0 || formData.bodyState.energy > 0 || formData.bodyState.location);

  // Компонент для отображения актуального состояния из URL
  const UrlStatusBar = () => {
    const hasAnyData = 
      formData.content.trim() || 
      formData.type !== 'thought' ||
      formData.eventDate ||
      formData.deadline ||
      urlData.emotionsCount > 0 ||
      urlData.circumstancesCount > 0 ||
      urlData.hasBodyState ||
      urlData.skillsCount > 0 ||
      urlData.relationsCount > 0 ||
      urlData.tagsCount > 0 ||
      urlData.skillProgressCount > 0;

    if (!hasAnyData) return null;

    return (
      <div className="url-status-bar">
        <div className="status-title">Будет сохранено:</div>
        <div className="status-items">
          {formData.type !== 'thought' && (
            <span className="status-item">
              <span className="status-icon">{typeConfig[formData.type]?.icon}</span>
              {typeConfig[formData.type]?.label}
            </span>
          )}
          
          {formData.content.trim() && (
            <span className="status-item">
              <span className="status-icon">📝</span>
              {formData.content.length > 50 
                ? `${formData.content.substring(0, 50)}...` 
                : formData.content}
            </span>
          )}
          
          {formData.eventDate && (
            <span className="status-item">
              <span className="status-icon">📅</span>
              {formData.eventDate}
            </span>
          )}
          
          {formData.deadline && (
            <span className="status-item">
              <span className="status-icon">⏰</span>
              {formData.deadline}
            </span>
          )}
          
          {urlData.emotionsCount > 0 && (
            <span className="status-item">
              <span className="status-icon">⊕⊖</span>
              {urlData.emotionsCount} эмоций
            </span>
          )}
          
          {urlData.circumstancesCount > 0 && (
            <span className="status-item">
              <span className="status-icon">WME</span>
              {urlData.circumstancesCount} обстоятельств
            </span>
          )}
          
          {urlData.hasBodyState && (
            <span className="status-item">
              <span className="status-icon">⚕</span>
              Состояние тела
            </span>
          )}
          
          {urlData.skillsCount > 0 && (
            <span className="status-item">
              <span className="status-icon">💪</span>
              {urlData.skillsCount} навыков
            </span>
          )}
          
          {urlData.skillProgressCount > 0 && (
            <span className="status-item">
              <span className="status-icon">⬆</span>
              {urlData.skillProgressCount} прокачек
            </span>
          )}
          
          {urlData.relationsCount > 0 && (
            <span className="status-item">
              <span className="status-icon">↔</span>
              {urlData.relationsCount} связей
            </span>
          )}
          
          {urlData.tagsCount > 0 && (
            <span className="status-item">
              <span className="status-icon">#</span>
              {urlData.tagsCount} тегов
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <form className="entry-form" onSubmit={handleSubmit}>
        <h3 className="form-title">{t('entries.form.title')}</h3>

        {/* Тип записи */}
        <div className="type-buttons">
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              type="button"
              className={`type-button ${config.className} ${formData.type === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
              disabled={isSubmitting}
            >
              <span className="type-icon">{config.icon}</span>
              <span className="type-label">{config.label}</span>
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="form-group">
          <label className="form-label required">{t('entries.form.contentLabel')}</label>
          <textarea
            className="form-textarea"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder={t('entries.form.contentPlaceholder')}
            required
            disabled={isSubmitting}
            rows={4}
          />
          <div className="character-count">
            {formData.content.length} символов
          </div>
        </div>

        {/* Даты */}
        <div className="date-row">
          <div className="form-group">
            <label className="form-label">{t('entries.form.dateLabel')}</label>
            <input
              className="form-input"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              max={dateUtils.current()}
              disabled={isSubmitting}
            />
          </div>

          {formData.type === 'plan' && (
            <div className="form-group">
              <label className="form-label required">{t('entries.form.deadlineLabel')}</label>
              <input
                className="form-input"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={dateUtils.tomorrow()}
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
              className={`${formData.emotions.length > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowEmotionPicker(true)}
              disabled={isSubmitting}
            >
              {formData.emotions.length > 0 
                ? `${formData.emotions.length} выбрано`
                : t('emotions.picker.open') || 'Добавить'
              }
            </button>
          </div>

          {formData.emotions.length > 0 && (
            <div className="emotions-container">
              {formData.emotions.map((emotion, index) => (
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
              className={`${formData.circumstances.length > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowCircumstancesPicker(true)}
              disabled={isSubmitting}
            >
              {formData.circumstances.length > 0 
                ? `${formData.circumstances.length} выбрано`
                : 'Добавить'
              }
            </button>
          </div>

          {formData.circumstances.length > 0 && (
            <div className="emotions-container">
              {formData.circumstances.map((circ, index) => (
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

          {hasBodyState && (
            <div className="body-state-preview">
              {formData.bodyState.hp > 0 && (
                <span className="body-stat">HP: {formData.bodyState.hp}%</span>
              )}
              {formData.bodyState.energy > 0 && (
                <span className="body-stat">MANA: {formData.bodyState.energy}%</span>
              )}
              {formData.bodyState.location && (
                <span className="body-stat">📍 {formData.bodyState.location}</span>
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
              className={`${formData.skills.length > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowSkillsPicker(true)}
              disabled={isSubmitting}
            >
              {formData.skills.length > 0 
                ? `${formData.skills.length} выбрано`
                : 'Добавить'
              }
            </button>
          </div>

          {formData.skills.length > 0 && (
            <div className="emotions-container">
              {formData.skills.map((skill, index) => (
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
              className={`${skillProgress.length > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowSkillProgressPicker(true)}
              disabled={isSubmitting}
            >
              {skillProgress.length > 0 
                ? `${skillProgress.length} прокачки`
                : 'Добавить прокачку'
              }
            </button>
          </div>

          {skillProgress.length > 0 && (
            <div className="emotions-container">
              {skillProgress.map((progress, index) => (
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
                className={`${formData.relations.length > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
                onClick={() => setShowRelationPicker(true)}
                disabled={isSubmitting}
              >
                {formData.relations.length > 0 
                  ? `${formData.relations.length} связей`
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
          
          {formData.relations.length > 0 && (
            <div className="relations-preview">
              {formData.relations.slice(0, 2).map((rel, index) => (
                <div key={index} className="relation-preview-item">
                  <span className="relation-preview-icon">{rel.type?.icon || '↔'}</span>
                  <span className="relation-preview-text">
                    {rel.description && rel.description.length > 30 
                      ? rel.description.substring(0, 30) + '...' 
                      : rel.description}
                  </span>
                </div>
              ))}
              {formData.relations.length > 2 && (
                <div className="more-relations">
                  +{formData.relations.length - 2} еще
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
              className={`${formData.tags.length > 0 ? 'emotions-preview-button' : 'add-emotions-button'}`}
              onClick={() => setShowTagsPicker(true)}
              disabled={isSubmitting}
            >
              {formData.tags.length > 0 
                ? `${formData.tags.length} тегов`
                : 'Добавить теги'
              }
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="tags-container">
              {formData.tags.map((tag, index) => (
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
          disabled={isSubmitting || !formData.content.trim()}
        >
          {isSubmitting ? `${t('common.saving')}...` : t('entries.form.submit') || 'Создать запись'}
        </button>

        {formData.type === 'plan' && !formData.deadline && (
          <div className="plan-warning">{t('common.planDeadlineRequired')}</div>
        )}
      </form>

      {/* Все модалки остаются без изменений */}
      {showEmotionPicker && (
        <Modal
          isOpen={showEmotionPicker}
          onClose={() => setShowEmotionPicker(false)}
          title={t('emotions.picker.title') || 'Эмоции'}
          size="lg"
        >
          <EmotionPicker
            selectedEmotions={formData.emotions}
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
            selectedCircumstances={formData.circumstances}
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
            bodyState={formData.bodyState}
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
            selectedSkills={formData.skills}
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
            selectedRelations={formData.relations}
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
            relations={formData.relations}
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
            selectedSkills={skillProgress}
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
            selectedTags={formData.tags}
            onChange={handleTagsChange}
            maxTags={10}
          />
        </Modal>
      )}
    </>
  );
});

export default EntryForm;