// src/ui/components/entries/EntryForm/EntryForm.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import { useTheme } from '@/layers/theme';
// import { useSecurity } from '@/layers/security';
import { useEntriesStore, useUIStore, useUrlSyncStore } from '@/store/StoreContext';

// Платформенные адаптеры - ТОЛЬКО ОДИН ИМПОРТ!
import { 
  PlatformButton, 
  PlatformModal,
  PlatformTextArea,
  PlatformInput,
  usePlatformNotification 
} from '@/ui/components/common/PlatformAdapter';

// Компоненты пикеров
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';
import CircumstancesPicker from '@/ui/components/circumstances/CircumstancesPicker';
import BodyStatePicker from '../../bodyState/BodyStatePicker';
import SkillsPicker from '@/ui/components/skills/SkillsPicker';
import RelationPicker from '../../relation/RelationPicker';
import RelationGraph from '../../relation/RelationGraph';
import TagsPicker from '@/ui/components/tags/TagsPicker';
import EntryTypePicker from '../../entries/EntryType/EntryTypePicker';
import UrlStatusBar from '@/ui/components/status/UrlStatusBar';

// Константы
// import { ENTRY_TYPES } from '@/core/constants/entries';
const ENTRY_TYPES = {
  NOTE: 'note',
  MEMORY: 'memory',
  PLAN: 'plan',
  GOAL: 'goal',
  EVENT: 'event'
};

// import  validateEntry  from '@/security/validators/schemas/entrySchema';
const validateEntry = (entryData) => {
  const errors = [];
  
  if (!entryData.content || entryData.content.trim().length === 0) {
    errors.push('Содержание обязательно');
  }
  
  if (entryData.type === ENTRY_TYPES.PLAN && !entryData.deadline) {
    errors.push('Для плана требуется срок выполнения');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

import './EntryForm.css';

const EntryForm = observer(() => {
  // === 1. ВСЕ СЛОИ ===
  const { t } = useLanguage();
  const { isTelegram, utils } = usePlatform();
  const { themeData } = useTheme();
  
  // === 2. ВСЕ STORES ===
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const urlSyncStore = useUrlSyncStore();
  
  // === 3. СОСТОЯНИЯ ===
  const showNotification = usePlatformNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // === 4. МОДАЛКИ (единый объект) ===
  const [modals, setModals] = useState({
    emotion: false,
    circumstances: false,
    bodyState: false,
    skills: false,
    relations: false,
    graph: false,
    skillProgress: false,
    tags: false,
  });
  
  // === 5. ОТКРЫТИЕ/ЗАКРЫТИЕ МОДАЛОК ===
  const openModal = useCallback((modalName) => {
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, [isTelegram, utils]);
  
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);
  
  // === 6. УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК ПИКЕРОВ ===
  const createPickerHandler = useCallback((setterName, hapticType = 'success') => 
    (data) => {
      if (urlSyncStore && urlSyncStore[setterName]) {
        urlSyncStore[setterName](data);
      }
      if (isTelegram && utils.hapticFeedback) {
        utils.hapticFeedback(hapticType);
      }
    },
  [urlSyncStore, isTelegram, utils]);
  
  // === 7. ВСЕ ОБРАБОТЧИКИ ===
  const handleEmotionsChange = createPickerHandler('setEmotions');
  const handleCircumstancesChange = createPickerHandler('setCircumstances');
  const handleBodyStateChange = createPickerHandler('setBodyState');
  const handleSkillsChange = createPickerHandler('setSkills');
  const handleRelationsChange = createPickerHandler('setRelations');
  const handleTagsChange = createPickerHandler('setTags');
  const handleSkillProgressChange = createPickerHandler('setSkillProgress');
  
  // === 8. ПОИСК ДЛЯ ГРАФА ===
  const searchGraphs = useCallback(async (params) => {
    try {
      return await entriesStore.searchEntries({
        query: params.query || '',
        limit: params.limit || 10,
        type: params.type
      });
    } catch (error) {
      console.warn('Graph search error:', error);
      return [];
    }
  }, [entriesStore]);
  
  // === 9. ОТПРАВКА ФОРМЫ ===
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 9.1. ПРОВЕРКА ДАННЫХ
    if (!urlSyncStore || !urlSyncStore.content || !urlSyncStore.content.trim()) {
      showNotification(t('common.requiredContent') || 'Заполните содержание', 'error');
      return;
    }
    
    if (urlSyncStore.type === ENTRY_TYPES.PLAN && !urlSyncStore.deadline) {
      showNotification(t('common.requiredDeadline') || 'Укажите срок выполнения', 'error');
      return;
    }
    
    // 9.2. НАЧАЛО ОТПРАВКИ
    setIsSubmitting(true);
    
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('medium');
    }
    
    try {
      // 9.3. ПОДГОТОВКА ДАННЫХ
      const entryData = {
        type: urlSyncStore.type || ENTRY_TYPES.NOTE,
        content: urlSyncStore.content.trim(),
        ...(urlSyncStore.eventDate && { eventDate: new Date(urlSyncStore.eventDate) }),
        ...(urlSyncStore.deadline && { deadline: new Date(urlSyncStore.deadline) }),
        emotions: urlSyncStore.emotions || [],
        circumstances: urlSyncStore.circumstances || [],
        bodyState: urlSyncStore.bodyState || {},
        skills: urlSyncStore.skills || [],
        relations: urlSyncStore.relations || [],
        tags: urlSyncStore.tags || [],
        skillProgress: urlSyncStore.skillProgress || [],
        theme: themeData.name || 'light',
        platform: isTelegram ? 'telegram' : 'web',
        createdAt: new Date().toISOString()
      };
      
      // 9.4. ВАЛИДАЦИЯ
      const validation = validateEntry(entryData);
      if (!validation.isValid) {
        throw new Error(validation.errors?.join(', ') || 'Некорректные данные');
      }
      
      // 9.5. ОТПРАВКА В STORE
      await entriesStore.createEntry(entryData);
      
      // 9.6. УСПЕШНОЕ СОЗДАНИЕ
      if (urlSyncStore.reset) {
        urlSyncStore.reset();
      }
      
      showNotification(
        t('common.entryCreated') || 'Запись успешно создана!', 
        'success'
      );
      
      if (isTelegram && utils.hapticFeedback) {
        utils.hapticFeedback('success');
      }
      
      // 9.7. ДОПОЛНИТЕЛЬНЫЕ ДЕЙСТВИЯ
      if (uiStore && uiStore.clearError) {
        uiStore.clearError();
      }
      
    } catch (error) {
      // 9.8. ОБРАБОТКА ОШИБОК
      console.error('EntryForm submit error:', error);
      
      const errorMessage = error.message || t('common.error') || 'Ошибка при создании записи';
      showNotification(errorMessage, 'error');
      
      if (isTelegram && utils.hapticFeedback) {
        utils.hapticFeedback('error');
      }
      
      if (uiStore && uiStore.setError) {
        uiStore.setError(error);
      }
    } finally {
      // 9.9. ЗАВЕРШЕНИЕ
      setIsSubmitting(false);
    }
  }, [
    urlSyncStore, t, entriesStore, showNotification, 
    isTelegram, utils, themeData, uiStore
  ]);
  
  // === 10. ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ===
  const hasBodyState = useMemo(() => {
    if (!urlSyncStore || !urlSyncStore.bodyState) return false;
    
    const { hp, energy, location } = urlSyncStore.bodyState;
    return (
      (hp !== undefined && hp !== null && hp > 0) ||
      (energy !== undefined && energy !== null && energy > 0) ||
      (location && location.trim().length > 0)
    );
  }, [urlSyncStore?.bodyState]);
  
  const formStyle = useMemo(() => ({
    maxWidth: isTelegram ? '100%' : '400px',
    margin: isTelegram ? '10px' : '0 auto',
    padding: isTelegram ? '15px' : '20px',
    backgroundColor: themeData.colors?.['--bg-secondary'] || '#ffffff',
    borderRadius: '12px',
    boxShadow: isTelegram ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: isTelegram ? '1px solid var(--border-color, #ddd)' : 'none'
  }), [isTelegram, themeData]);
  
  // === 11. РЕНДЕР СЕКЦИИ ПИКЕРА ===
  const renderPickerSection = useCallback(({
    label,
    icon,
    modalName,
    value,
    previewComponent,
    buttonText
  }) => (
    <div className="form-group">
      <div className="picker-header">
        <label className="form-label">
          <span className="picker-icon">{icon}</span>
          <span className="picker-label">{label}</span>
        </label>
        <PlatformButton
          variant={value ? 'secondary' : 'primary'}
          onClick={() => openModal(modalName)}
          disabled={isSubmitting}
          haptic={true}
          size="small"
        >
          {buttonText}
        </PlatformButton>
      </div>
      {value && previewComponent && (
        <div className="picker-preview">
          {previewComponent}
        </div>
      )}
    </div>
  ), [openModal, isSubmitting]);
  
  // === 12. ПРЕВЬЮ ЭМОЦИЙ ===
  const emotionsPreview = useMemo(() => {
    if (!urlSyncStore?.emotions || urlSyncStore.emotions.length === 0) return null;
    
    return (
      <div className="emotions-preview">
        {urlSyncStore.emotions.slice(0, 3).map((emotion, index) => (
          <div key={index} className="emotion-badge">
            <span className="emotion-icon">
              {emotion.emotion?.icon || emotion.category?.icon || '⊕'}
            </span>
            <span className="emotion-label">
              {emotion.emotion?.label || emotion.category?.label || 'Эмоция'}
            </span>
            <span className="emotion-intensity">{emotion.intensity}%</span>
          </div>
        ))}
        {urlSyncStore.emotions.length > 3 && (
          <div className="more-items">+{urlSyncStore.emotions.length - 3}</div>
        )}
      </div>
    );
  }, [urlSyncStore?.emotions]);
  
  // === 13. ПРЕВЬЮ ТЕГОВ ===
  const tagsPreview = useMemo(() => {
    if (!urlSyncStore?.tags || urlSyncStore.tags.length === 0) return null;
    
    return (
      <div className="tags-preview">
        {urlSyncStore.tags.slice(0, 5).map((tag, index) => (
          <div key={index} className="tag-badge">
            #{tag}
          </div>
        ))}
        {urlSyncStore.tags.length > 5 && (
          <div className="more-items">+{urlSyncStore.tags.length - 5}</div>
        )}
      </div>
    );
  }, [urlSyncStore?.tags]);
  
  // === 14. ПРЕВЬЮ СОСТОЯНИЯ ТЕЛА ===
  const bodyStatePreview = useMemo(() => {
    if (!hasBodyState || !urlSyncStore?.bodyState) return null;
    
    const { hp, energy, location } = urlSyncStore.bodyState;
    
    return (
      <div className="body-state-preview">
        {hp > 0 && (
          <div className="body-stat">
            <span className="stat-icon">❤️</span>
            <span className="stat-value">HP: {hp}%</span>
          </div>
        )}
        {energy > 0 && (
          <div className="body-stat">
            <span className="stat-icon">⚡</span>
            <span className="stat-value">Energy: {energy}%</span>
          </div>
        )}
        {location && location.trim() && (
          <div className="body-stat">
            <span className="stat-icon">📍</span>
            <span className="stat-value">{location}</span>
          </div>
        )}
      </div>
    );
  }, [hasBodyState, urlSyncStore?.bodyState]);
  
  // === 15. ГЛАВНЫЙ РЕНДЕР ===
  return (
    <>
      <form 
        className={`entry-form ${isTelegram ? 'telegram' : 'web'}`}
        onSubmit={handleSubmit}
        style={formStyle}
        noValidate
      >
        {/* 15.1. ЗАГОЛОВОК */}
        <h3 className="form-title">
          {t('entries.form.title') || 'Создать запись'}
        </h3>
        
        {/* 15.2. ТИП ЗАПИСИ */}
        <div className="form-group">
          <EntryTypePicker />
        </div>
        
        {/* 15.3. КОНТЕНТ */}
        <div className="form-group">
          <PlatformTextArea
            value={urlSyncStore?.content || ''}
            onChange={(value) => urlSyncStore?.setContent?.(value)}
            label={t('entries.form.contentLabel') || 'Содержание'}
            placeholder={t('entries.form.contentPlaceholder') || 'Опишите что произошло...'}
            required
            disabled={isSubmitting}
            rows={isTelegram ? 4 : 3}
            maxLength={5000}
          />
        </div>
        
        {/* 15.4. ДАТЫ */}
        <div className="date-row">
          <div className="form-group">
            <PlatformInput
              type="date"
              value={urlSyncStore?.eventDate || ''}
              onChange={(value) => urlSyncStore?.setEventDate?.(value)}
              label={t('entries.form.dateLabel') || 'Дата события'}
              disabled={isSubmitting}
            />
          </div>
          
          {/* {urlSyncStore?.type === ENTRY_TYPES.PLAN && ( */}
          {urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline && (
            <div className="form-group">
              <PlatformInput
                type="date"
                value={urlSyncStore?.deadline || ''}
                onChange={(value) => urlSyncStore?.setDeadline?.(value)}
                label={t('entries.form.deadlineLabel') || 'Срок выполнения'}
                required={urlSyncStore?.type === ENTRY_TYPES.PLAN}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
        
        {/* 15.5. СЕКЦИЯ ЭМОЦИЙ */}
        {renderPickerSection({
          label: t('entries.form.emotionsLabel') || 'Эмоции',
          icon: '⊕⊖',
          modalName: 'emotion',
          value: urlSyncStore?.emotions?.length > 0,
          buttonText: urlSyncStore?.emotions?.length > 0 
            ? `${urlSyncStore.emotions.length} ${t('common.selected') || 'выбрано'}`
            : t('emotions.picker.open') || 'Добавить эмоции',
          previewComponent: emotionsPreview
        })}
        
        {/* 15.6. СЕКЦИЯ ОБСТОЯТЕЛЬСТВ */}
        {renderPickerSection({
          label: t('entries.form.circumstancesLabel') || 'Обстоятельства',
          icon: '☁☽⚡',
          modalName: 'circumstances',
          value: urlSyncStore?.circumstances?.length > 0,
          buttonText: urlSyncStore?.circumstances?.length > 0 
            ? `${urlSyncStore.circumstances.length} ${t('common.selected') || 'выбрано'}`
            : t('circumstances.picker.open') || 'Добавить обстоятельства',
          previewComponent: urlSyncStore?.circumstances?.length > 0 && (
            <div className="circumstances-preview">
              {urlSyncStore.circumstances.slice(0, 2).map((circ, index) => (
                <div key={index} className="circumstance-badge">
                  <span className="circumstance-icon">
                    {circ.item?.icon || circ.category?.icon || '☁'}
                  </span>
                  <span className="circumstance-label">
                    {circ.item?.label || circ.category?.label || 'Обстоятельство'}
                  </span>
                  <span className="circumstance-intensity">
                    {circ.intensity}{circ.isTemperature ? '°C' : '%'}
                  </span>
                </div>
              ))}
              {urlSyncStore.circumstances.length > 2 && (
                <div className="more-items">+{urlSyncStore.circumstances.length - 2}</div>
              )}
            </div>
          )
        })}
        
        {/* 15.7. СОСТОЯНИЕ ТЕЛА */}
        {renderPickerSection({
          label: t('entries.form.bodyStateLabel') || 'Состояние тела',
          icon: '❤️⚡',
          modalName: 'bodyState',
          value: hasBodyState,
          buttonText: hasBodyState 
            ? t('common.edit') || 'Изменить'
            : t('body.picker.open') || 'Добавить состояние',
          previewComponent: bodyStatePreview
        })}
        
        {/* 15.8. НАВЫКИ */}
        {renderPickerSection({
          label: t('entries.form.skillsLabel') || 'Навыки',
          icon: '💪🧠',
          modalName: 'skills',
          value: urlSyncStore?.skills?.length > 0,
          buttonText: urlSyncStore?.skills?.length > 0 
            ? `${urlSyncStore.skills.length} ${t('common.selected') || 'выбрано'}`
            : t('skills.picker.open') || 'Добавить навыки',
          previewComponent: urlSyncStore?.skills?.length > 0 && (
            <div className="skills-preview">
              {urlSyncStore.skills.slice(0, 2).map((skill, index) => (
                <div key={index} className="skill-badge">
                  <span className="skill-icon">
                    {skill.skill?.icon || '💪'}
                  </span>
                  <span className="skill-label">
                    {skill.skill?.label || 'Навык'} - LVL {skill.level}
                  </span>
                  <span className="skill-exp">{skill.experience} XP</span>
                </div>
              ))}
              {urlSyncStore.skills.length > 2 && (
                <div className="more-items">+{urlSyncStore.skills.length - 2}</div>
              )}
            </div>
          )
        })}
        
        {/* 15.9. СВЯЗИ */}
        {renderPickerSection({
          label: t('entries.form.relationsLabel') || 'Связи',
          icon: '↔',
          modalName: 'relations',
          value: urlSyncStore?.relations?.length > 0,
          buttonText: urlSyncStore?.relations?.length > 0 
            ? `${urlSyncStore.relations.length} ${t('common.connections') || 'связей'}`
            : t('relations.picker.open') || 'Добавить связи',
          previewComponent: urlSyncStore?.relations?.length > 0 && (
            <div className="relations-preview">
              <PlatformButton
                type="button"
                variant="ghost"
                onClick={() => openModal('graph')}
                disabled={isSubmitting}
                size="small"
              >
                {t('common.showGraph') || 'Показать граф'}
              </PlatformButton>
              <div className="relations-list">
                {urlSyncStore.relations.slice(0, 2).map((rel, index) => (
                  <div key={index} className="relation-item">
                    <span className="relation-icon">
                      {rel.type?.icon || '↔'}
                    </span>
                    <span className="relation-description">
                      {rel.description?.slice(0, 30) || 'Связь'}...
                    </span>
                  </div>
                ))}
                {urlSyncStore.relations.length > 2 && (
                  <div className="more-items">+{urlSyncStore.relations.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
        
        {/* 15.10. ТЕГИ */}
        {renderPickerSection({
          label: t('entries.form.tagsLabel') || 'Теги',
          icon: '#',
          modalName: 'tags',
          value: urlSyncStore?.tags?.length > 0,
          buttonText: urlSyncStore?.tags?.length > 0 
            ? `${urlSyncStore.tags.length} ${t('common.tags') || 'тегов'}`
            : t('tags.picker.open') || 'Добавить теги',
          previewComponent: tagsPreview
        })}
        
        {/* 15.11. ПРОКАЧКА НАВЫКОВ */}
        {renderPickerSection({
          label: t('entries.form.skillProgressLabel') || 'Прокачка навыков',
          icon: '⬆',
          modalName: 'skillProgress',
          value: urlSyncStore?.skillProgress?.length > 0,
          buttonText: urlSyncStore?.skillProgress?.length > 0 
            ? `${urlSyncStore.skillProgress.length} ${t('common.progress') || 'прокачки'}`
            : t('skillProgress.picker.open') || 'Добавить прокачку',
          previewComponent: urlSyncStore?.skillProgress?.length > 0 && (
            <div className="progress-preview">
              {urlSyncStore.skillProgress.slice(0, 2).map((progress, index) => (
                <div key={index} className="progress-badge">
                  <span className="progress-icon">⬆</span>
                  <span className="progress-skill">
                    {progress.skill?.label || progress.skill?.name || 'Навык'}
                  </span>
                  <span className="progress-exp">
                    +{progress.experience_gained || progress.experience || 0} XP
                  </span>
                </div>
              ))}
              {urlSyncStore.skillProgress.length > 2 && (
                <div className="more-items">+{urlSyncStore.skillProgress.length - 2}</div>
              )}
            </div>
          )
        })}
        
        {/* 15.12. СТАТУС БАР */}
        <div className="form-group">
          <UrlStatusBar />
        </div>
        
        {/* 15.13. КНОПКА ОТПРАВКИ */}
        <div className="form-actions">
          <PlatformButton
            type="submit"
            variant="primary"
            size="large"
            disabled={isSubmitting || !urlSyncStore?.content?.trim()}
            haptic={true}
            fullWidth
            loading={isSubmitting}
          >
            {isSubmitting 
              ? `${t('common.saving') || 'Сохранение'}...` 
              : t('entries.form.submit') || 'Создать запись'
            }
          </PlatformButton>
        </div>
        
        {/* 15.14. ПРЕДУПРЕЖДЕНИЯ */}
        {urlSyncStore?.type === ENTRY_TYPES.PLAN && !urlSyncStore?.deadline && (
          <div className="form-warning plan-warning">
            ⚠️ {t('common.planDeadlineRequired') || 'Для плана требуется срок выполнения'}
          </div>
        )}
        
        {!urlSyncStore?.content?.trim() && (
          <div className="form-hint content-hint">
            ✏️ {t('common.requiredContentHint') || 'Начните вводить текст'}
          </div>
        )}
      </form>
      
      {/* === 16. ВСЕ МОДАЛКИ === */}
      
      {/* 16.1. ЭМОЦИИ */}
      <PlatformModal
        isOpen={modals.emotion}
        onClose={() => closeModal('emotion')}
        title={t('emotions.picker.title') || 'Выбор эмоций'}
        size="lg"
      >
        <EmotionPicker
          selectedEmotions={urlSyncStore?.emotions || []}
          onChange={handleEmotionsChange}
          maxEmotions={5}
        />
      </PlatformModal>
      
      {/* 16.2. ОБСТОЯТЕЛЬСТВА */}
      <PlatformModal
        isOpen={modals.circumstances}
        onClose={() => closeModal('circumstances')}
        title={t('circumstances.picker.title') || 'Выбор обстоятельств'}
        size="lg"
      >
        <CircumstancesPicker
          selectedCircumstances={urlSyncStore?.circumstances || []}
          onChange={handleCircumstancesChange}
          maxCircumstances={5}
        />
      </PlatformModal>
      
      {/* 16.3. СОСТОЯНИЕ ТЕЛА */}
      <PlatformModal
        isOpen={modals.bodyState}
        onClose={() => closeModal('bodyState')}
        title={t('body.picker.title') || 'Состояние тела'}
        size="md"
      >
        <BodyStatePicker
          bodyState={urlSyncStore?.bodyState || {}}
          onChange={handleBodyStateChange}
        />
      </PlatformModal>
      
      {/* 16.4. НАВЫКИ */}
      <PlatformModal
        isOpen={modals.skills}
        onClose={() => closeModal('skills')}
        title={t('skills.picker.title') || 'Выбор навыков'}
        size="lg"
      >
        <SkillsPicker
          selectedSkills={urlSyncStore?.skills || []}
          onChange={handleSkillsChange}
          maxSkills={10}
        />
      </PlatformModal>
      
      {/* 16.5. СВЯЗИ */}
      <PlatformModal
        isOpen={modals.relations}
        onClose={() => closeModal('relations')}
        title={t('relations.picker.title') || 'Добавление связей'}
        size="lg"
      >
        <RelationPicker
          selectedRelations={urlSyncStore?.relations || []}
          onChange={handleRelationsChange}
          maxRelations={5}
          searchGraphs={searchGraphs}
        />
      </PlatformModal>
      
      {/* 16.6. ГРАФ СВЯЗЕЙ */}
      <PlatformModal
        isOpen={modals.graph}
        onClose={() => closeModal('graph')}
        title={t('relations.graph.title') || 'Граф связей'}
        size="xl"
      >
        <RelationGraph
          relations={urlSyncStore?.relations || []}
          onClose={() => closeModal('graph')}
        />
      </PlatformModal>
      
      {/* 16.7. ПРОКАЧКА НАВЫКОВ */}
      <PlatformModal
        isOpen={modals.skillProgress}
        onClose={() => closeModal('skillProgress')}
        title={t('skillProgress.picker.title') || 'Прокачка навыков'}
        size="lg"
      >
        <SkillsPicker
          selectedSkills={urlSyncStore?.skillProgress || []}
          onChange={handleSkillProgressChange}
          maxSkills={5}
          mode="progress"
        />
      </PlatformModal>
      
      {/* 16.8. ТЕГИ */}
      <PlatformModal
        isOpen={modals.tags}
        onClose={() => closeModal('tags')}
        title={t('tags.picker.title') || 'Добавление тегов'}
        size="md"
      >
        <TagsPicker
          selectedTags={urlSyncStore?.tags || []}
          onChange={handleTagsChange}
          maxTags={10}
        />
      </PlatformModal>
    </>
  );
});

export default EntryForm;