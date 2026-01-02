import React, { useState, useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import { useTheme } from '@/layers/theme';
import { useEntriesStore, useUIStore, useUrlSyncStore } from '@/store/StoreContext';
import { useBodyStatesStore, useCircumstancesStore } from '@/store/StoreContext';
import { useRelationsStore } from '@/store/StoreContext';

import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import TextArea from '../../common/Input/TextArea';
import EmotionPicker from '../../emotions/EmotionPicker/EmotionPicker';
import CircumstancesPicker from '@/ui/components/circumstances/CircumstancesPicker';
import BodyStatePicker from '../../bodyState/BodyStatePicker';
import SkillsPicker from '@/ui/components/skills/SkillsPicker';
import RelationPicker from '../../relation/RelationPicker';
import RelationGraph from '../../relation/RelationGraph';
import TagsPicker from '@/ui/components/tags/TagsPicker';
import EntryTypePicker from '../../entries/EntryType/EntryTypePicker';

import './EntryForm.css';

const ENTRY_TYPES = {
  DREAM: 'dream',
  MEMORY: 'memory',
  THOUGHT: 'thought',
  PLAN: 'plan',
};

const EntryForm = observer(() => {
  const { t } = useLanguage();
  const { isTelegram, utils } = usePlatform();
  const { themeData } = useTheme();
  
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const urlSyncStore = useUrlSyncStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const bodyStatesStore = useBodyStatesStore();
  const circumstancesStore = useCircumstancesStore();
  
  const relationsStore = useRelationsStore();

  const openModal = useCallback((modalName) => {
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, [isTelegram, utils]);
  
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);
  
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
  
  const handleEmotionsChange = createPickerHandler('setEmotions');
  const handleCircumstancesChange = createPickerHandler('setCircumstances');
  const handleBodyStateChange = createPickerHandler('setBodyState');
  const handleSkillsChange = createPickerHandler('setSkills');
  const handleRelationsChange = createPickerHandler('setRelations');
  const handleTagsChange = createPickerHandler('setTags');
  const handleSkillProgressChange = createPickerHandler('setSkillProgress');
  
  // Функция уведомлений
  const showNotification = useCallback((message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // TODO: Подключить нормальную систему уведомлений
    if (type === 'error') {
      alert(message);
    }
  }, []);
  
  // === ПОИСК ДЛЯ ГРАФА ===
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
  
  // === ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ ===
  const hasBodyState = useMemo(() => {
    if (!urlSyncStore || !urlSyncStore.bodyState) return false;
    
    const { hp, energy, location } = urlSyncStore.bodyState;
    return (
      (hp !== undefined && hp !== null && hp > 0) ||
      (energy !== undefined && energy !== null && energy > 0) ||
      (location && location.trim().length > 0)
    );
  }, [urlSyncStore?.bodyState]);
  
  // === ФУНКЦИИ ПРЕОБРАЗОВАНИЯ ДАННЫХ ===
  const convertBodyStateForAPI = useCallback((pickerData) => {
    if (!pickerData || (!pickerData.hp && !pickerData.energy && !pickerData.location)) {
      return null;
    }
    
    return {
      timestamp: new Date().toISOString(),
      location_point: null,
      location_name: pickerData.location || null,
      location_address: null,
      location_precision: null,
      health_points: pickerData.hp > 0 ? pickerData.hp : null,
      energy_points: pickerData.energy > 0 ? pickerData.energy : null,
      circumstance_id: null
    };
  }, []);
  
  const convertCircumstancesForAPI = useCallback((pickerData) => {
    if (!pickerData || pickerData.length === 0) return null;
    
    const result = {
      timestamp: new Date().toISOString(),
      weather: null,
      temperature: null,
      moon_phase: null,
      global_event: null,
      notes: null
    };
    
    pickerData.forEach(circ => {
      if (circ.category?.id === 'weather') {
        result.weather = circ.item?.id || null;
        if (circ.isTemperature) {
          result.temperature = circ.intensity;
        }
      } else if (circ.category?.id === 'moon') {
        result.moon_phase = circ.item?.id || null;
      } else if (circ.category?.id === 'events') {
        result.global_event = circ.item?.label || null;
      }
    });
    
    if (!result.weather && !result.temperature && !result.moon_phase && !result.global_event) {
      return null;
    }
    
    return result;
  }, []);
  
  // === SUBMIT HANDLER ===
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // ВАЛИДАЦИЯ
    if (!urlSyncStore?.content?.trim()) {
      showNotification(t('common.requiredContent') || 'Заполните содержание', 'error');
      return;
    }
    
    if (urlSyncStore.type === ENTRY_TYPES.PLAN && !urlSyncStore.deadline) {
      showNotification(t('common.requiredDeadline') || 'Укажите срок выполнения', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('medium');
    }
    
    try {
      let bodyStateId = null;
      let circumstanceId = null;
      
      // 1. СОЗДАНИЕ СОСТОЯНИЯ ТЕЛА (если есть)
      if (urlSyncStore.bodyState && hasBodyState) {
        try {
          const bodyStateData = convertBodyStateForAPI(urlSyncStore.bodyState);
          if (bodyStateData) {
            const createdBodyState = await bodyStatesStore.createBodyState(bodyStateData);
            bodyStateId = createdBodyState.id;
          }
        } catch (error) {
          console.warn('Failed to create body state:', error);
        }
      }
      
      // 2. СОЗДАНИЕ ОБСТОЯТЕЛЬСТВ (если есть)
      if (urlSyncStore.circumstances?.length > 0) {
        try {
          const circumstanceData = convertCircumstancesForAPI(urlSyncStore.circumstances);
          if (circumstanceData) {
            const createdCircumstance = await circumstancesStore.createCircumstance(circumstanceData);
            circumstanceId = createdCircumstance.id;
          }
        } catch (error) {
          console.warn('Failed to create circumstance:', error);
        }
      }
      
      // 3. СОЗДАНИЕ ОСНОВНОЙ ЗАПИСИ
      const entryDto = {
        entry_type: urlSyncStore.type,
        content: urlSyncStore.content.trim(),
        is_completed: false,
        deadline: urlSyncStore.deadline || null,
        ...(bodyStateId && { body_state_id: bodyStateId }),
        ...(circumstanceId && { circumstance_id: circumstanceId })
      };
      
      console.log('Creating entry with data:', entryDto);
      
      const createdEntry = await entriesStore.createEntry(entryDto);
      const entryId = createdEntry.id;
      
      // 4. ДОБАВЛЕНИЕ ЭМОЦИЙ (если есть)
      if (urlSyncStore.emotions?.length > 0) {
        try {
          await entriesStore.addEmotionsToEntry(entryId, urlSyncStore.emotions);
        } catch (error) {
          console.warn('Failed to add emotions:', error);
        }
      }
      
      // 5. ДОБАВЛЕНИЕ ТЕГОВ (если есть)
      if (urlSyncStore.tags?.length > 0) {
        try {
          await entriesStore.addTagsToEntry(entryId, urlSyncStore.tags);
        } catch (error) {
          console.warn('Failed to add tags:', error);
        }
      }
      
      // 6. СОЗДАНИЕ СВЯЗЕЙ 
      if (urlSyncStore.relations?.length > 0) {
        try {
          for (const relation of urlSyncStore.relations) {
            if (relation.needsCreation) {
              // Создаем новую запись для связи
              const newEntry = await entriesStore.createEntry({
                entry_type: 'thought',
                content: relation.targetEntry.content,
                is_completed: false
              });
              
              // Создаем связь с новой записью
              await relationsStore.createRelationForEntry(entryId, {
                ...relation,
                targetEntry: { ...relation.targetEntry, id: newEntry.id }
              });
            } else {
              // Связь с существующей записью
              await relationsStore.createRelationForEntry(entryId, relation);
            }
          }
        } catch (error) {
          console.warn('Failed to create relations:', error);
        }
      }
      
      // 7. ОЧИСТКА ФОРМЫ
      if (urlSyncStore.reset) {
        urlSyncStore.reset();
      }
      
      // УВЕДОМЛЕНИЕ ОБ УСПЕХЕ
      showNotification(
        t('common.entryCreated') || 'Запись успешно создана!', 
        'success'
      );
      
      if (isTelegram && utils.hapticFeedback) {
        utils.hapticFeedback('success');
      }
      
      if (uiStore?.clearError) {
        uiStore.clearError();
      }
      
    } catch (error) {
      console.error('EntryForm submit error:', error);
      
      const errorMessage = error.message || t('common.error') || 'Ошибка при создании записи';
      showNotification(errorMessage, 'error');
      
      if (isTelegram && utils.hapticFeedback) {
        utils.hapticFeedback('error');
      }
      
      if (uiStore?.setError) {
        uiStore.setError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    urlSyncStore, t, entriesStore, bodyStatesStore, circumstancesStore, 
    showNotification, isTelegram, utils, hasBodyState, uiStore,
    convertBodyStateForAPI, convertCircumstancesForAPI
  ]);
  
  // === ФУНКЦИЯ РЕНДЕРА СЕКЦИЙ ===
  const renderPickerSection = useCallback(({ 
    label, 
    icon, 
    modalName, 
    value, 
    buttonText, 
    previewComponent 
  }) => (
    <div className="form-group picker-section">
      <label className="picker-label">
        {icon && <span className="picker-icon">{icon}</span>}
        {label}
      </label>
      <Button
        type="button"
        variant={value ? 'secondary' : 'ghost'}
        onClick={() => openModal(modalName)}
        disabled={isSubmitting}
        size="medium"
        fullWidth
      >
        {buttonText}
      </Button>
      {previewComponent && (
        <div className="picker-preview">
          {previewComponent}
        </div>
      )}
    </div>
  ), [openModal, isSubmitting]);
  
  // === ПРЕВЬЮ ЭМОЦИЙ ===
  const emotionsPreview = useMemo(() => {
    if (!urlSyncStore?.emotions || urlSyncStore.emotions.length === 0) return null;
    
    return (
      <div className="emotions-preview">
        {urlSyncStore.emotions.slice(0, 3).map((emotion, index) => (
          <div key={index} className="emotion-badge">
            <span className="emotion-label">
              {emotion.emotion?.label || emotion.category?.label || 'Эмоция'}
            </span>
          </div>
        ))}
        {urlSyncStore.emotions.length > 3 && (
          <div className="more-items">+{urlSyncStore.emotions.length - 3}</div>
        )}
      </div>
    );
  }, [urlSyncStore?.emotions]);
  
  // === ПРЕВЬЮ ТЕГОВ ===
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
  
  // === ПРЕВЬЮ СОСТОЯНИЯ ТЕЛА ===
  const bodyStatePreview = useMemo(() => {
    if (!hasBodyState || !urlSyncStore?.bodyState) return null;
    
    const { hp, energy, location } = urlSyncStore.bodyState;
    
    return (
      <div className="body-state-preview">
        {hp > 0 && (
          <div className="body-stat">
            <span className="stat-value">HP: {hp}%</span>
          </div>
        )}
        {energy > 0 && (
          <div className="body-stat">
            <span className="stat-value">Energy: {energy}%</span>
          </div>
        )}
        {location && location.trim() && (
          <div className="body-stat">
            <span className="stat-value">{location}</span>
          </div>
        )}
      </div>
    );
  }, [hasBodyState, urlSyncStore?.bodyState]);
  
  // === ГЛАВНЫЙ РЕНДЕР ===
  return (
    <>
      <form 
        className={`entry-form ${isTelegram ? 'telegram' : 'web'}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <h3 className="form-title">
          {t('entries.form.title') || 'Создать запись'}
        </h3>
        
        <div className="form-group">
          <EntryTypePicker />
        </div>
        
        <div className="form-group">
          <TextArea
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
        
        <div className="date-row">
          <div className="form-group">
            <Input
              type="date"
              value={urlSyncStore?.eventDate || ''}
              onChange={(value) => urlSyncStore?.setEventDate?.(value)}
              label={t('entries.form.dateLabel') || 'Дата события'}
              disabled={isSubmitting}
            />
          </div>
          
          {urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline && (
            <div className="form-group">
              <Input
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
        
        {renderPickerSection({
          label: t('entries.form.emotionsLabel') || 'Эмоции',
          icon: '',
          modalName: 'emotion',
          value: urlSyncStore?.emotions?.length > 0,
          buttonText: urlSyncStore?.emotions?.length > 0 
            ? `${urlSyncStore.emotions.length} ${t('common.selected') || 'выбрано'}`
            : t('emotions.picker.open') || 'Добавить эмоции',
          previewComponent: emotionsPreview
        })}
        
        {renderPickerSection({
          label: t('entries.form.circumstancesLabel') || 'Обстоятельства',
          icon: '',
          modalName: 'circumstances',
          value: urlSyncStore?.circumstances?.length > 0,
          buttonText: urlSyncStore?.circumstances?.length > 0 
            ? `${urlSyncStore.circumstances.length} ${t('common.selected') || 'выбрано'}`
            : t('circumstances.picker.open') || 'Добавить обстоятельства',
          previewComponent: urlSyncStore?.circumstances?.length > 0 && (
            <div className="circumstances-preview">
              {urlSyncStore.circumstances.slice(0, 2).map((circ, index) => (
                <div key={index} className="circumstance-badge">
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
        
        {renderPickerSection({
          label: t('entries.form.bodyStateLabel') || 'Состояние тела',
          icon: '',
          modalName: 'bodyState',
          value: hasBodyState,
          buttonText: hasBodyState 
            ? t('common.edit') || 'Изменить'
            : t('body.picker.open') || 'Добавить состояние',
          previewComponent: bodyStatePreview
        })}
        
        {renderPickerSection({
          label: t('entries.form.skillsLabel') || 'Навыки',
          icon: '',
          modalName: 'skills',
          value: urlSyncStore?.skills?.length > 0,
          buttonText: urlSyncStore?.skills?.length > 0 
            ? `${urlSyncStore.skills.length} ${t('common.selected') || 'выбрано'}`
            : t('skills.picker.open') || 'Добавить навыки',
          previewComponent: urlSyncStore?.skills?.length > 0 && (
            <div className="skills-preview">
              {urlSyncStore.skills.slice(0, 2).map((skill, index) => (
                <div key={index} className="skill-badge">
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
        
        {renderPickerSection({
          label: t('entries.form.relationsLabel') || 'Связи',
          icon: '',
          modalName: 'relations',
          value: urlSyncStore?.relations?.length > 0,
          buttonText: urlSyncStore?.relations?.length > 0 
            ? `${urlSyncStore.relations.length} ${t('common.connections') || 'связей'}`
            : t('relations.picker.open') || 'Добавить связи',
          previewComponent: urlSyncStore?.relations?.length > 0 && (
            <div className="relations-preview">
              <Button
                type="button"
                variant="ghost"
                onClick={() => openModal('graph')}
                disabled={isSubmitting}
                size="small"
              >
                {t('common.showGraph') || 'Показать граф'}
              </Button>
              <div className="relations-list">
                {urlSyncStore.relations.slice(0, 2).map((rel, index) => (
                  <div key={index} className="relation-item">
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
        
        {renderPickerSection({
          label: t('entries.form.skillProgressLabel') || 'Прокачка навыков',
          icon: '',
          modalName: 'skillProgress',
          value: urlSyncStore?.skillProgress?.length > 0,
          buttonText: urlSyncStore?.skillProgress?.length > 0 
            ? `${urlSyncStore.skillProgress.length} ${t('common.progress') || 'прокачки'}`
            : t('skillProgress.picker.open') || 'Добавить прокачку',
          previewComponent: urlSyncStore?.skillProgress?.length > 0 && (
            <div className="progress-preview">
              {urlSyncStore.skillProgress.slice(0, 2).map((progress, index) => (
                <div key={index} className="progress-badge">
                  <span className="progress-icon">↑</span>
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
        
        <div className="form-actions">
          <Button
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
          </Button>
        </div>
        
        {urlSyncStore?.type === ENTRY_TYPES.PLAN && !urlSyncStore?.deadline && (
          <div className="form-warning plan-warning">
            ! {t('common.planDeadlineRequired') || 'Для плана требуется срок выполнения'}
          </div>
        )}
      </form>
      
      {/* === ВСЕ МОДАЛКИ === */}
      <Modal
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
      </Modal>
      
      <Modal
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
      </Modal>
      
      <Modal
        isOpen={modals.bodyState}
        onClose={() => closeModal('bodyState')}
        title={t('body.picker.title') || 'Состояние тела'}
        size="md"
      >
        <BodyStatePicker
          bodyState={urlSyncStore?.bodyState || {}}
          onChange={handleBodyStateChange}
        />
      </Modal>
      
      <Modal
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
      </Modal>
      
      <Modal
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
      </Modal>
      
      <Modal
        isOpen={modals.graph}
        onClose={() => closeModal('graph')}
        title={t('relations.graph.title') || 'Граф связей'}
        size="xl"
      >
        <RelationGraph
          relations={urlSyncStore?.relations || []}
          onClose={() => closeModal('graph')}
        />
      </Modal>
      
      <Modal
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
      </Modal>
      
      <Modal
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
      </Modal>
    </>
  );
});

export default EntryForm;