// ~/aProject/AIM/frontend/src/ui/components/entries/EntryForm.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import { useTheme } from '@/layers/theme';
import { 
  useEntryDraftStore, // ИМЕННО ЭТОТ СТОР!
  useEntriesStore, 
  useUIStore,
  useBodyStatesStore, 
  useCircumstancesStore,
  useRelationsStore,
  useSkillProgressStore,
  useTagsStore,
  useEmotionsStore,
  useSkillsStore
} from '@/store/StoreContext';

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
  
  // ОСНОВНОЙ СТОР ДЛЯ ЧЕРНОВИКА!
  const entryDraftStore = useEntryDraftStore();
  
  // Остальные сторы для API операций
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const emotionsStore = useEmotionsStore();
  const bodyStatesStore = useBodyStatesStore();
  const circumstancesStore = useCircumstancesStore();
  const relationsStore = useRelationsStore();
  const skillProgressStore = useSkillProgressStore();
  const tagsStore = useTagsStore();
  const skillsStore = useSkillsStore();
  
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

  // Загрузка черновика при монтировании
  useEffect(() => {
    entryDraftStore.loadDraft();
    emotionsStore.loadDraft();
  }, [entryDraftStore, emotionsStore]);

  const openModal = useCallback((modalName) => {
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    setModals(prev => ({ ...prev, [modalName]: true }));
  }, [isTelegram, utils]);
  
  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  }, []);
  
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
    const bodyState = entryDraftStore.currentDraft.bodyState;
    if (!bodyState) return false;
    
    const { hp, energy, location } = bodyState;
    return (
      (hp !== undefined && hp !== null && hp > 0) ||
      (energy !== undefined && energy !== null && energy > 0) ||
      (location && location.trim().length > 0)
    );
  }, [entryDraftStore.currentDraft.bodyState]);
  
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
  
  // НОВЫЙ МЕТОД ДЛЯ СОХРАНЕНИЯ ИЗ ЧЕРНОВИКА
  const saveEntryFromDraft = useCallback(async () => {
    const draft = entryDraftStore.currentDraft;
    
    // ВАЛИДАЦИЯ
    if (!draft.content?.trim()) {
      throw new Error(t('common.requiredContent') || 'Заполните содержание');
    }
    
    if (draft.type === ENTRY_TYPES.PLAN && !draft.deadline) {
      throw new Error(t('common.requiredDeadline') || 'Укажите срок выполнения');
    }
    
    let bodyStateId = null;
    let circumstanceId = null;
    
    // 1. СОЗДАНИЕ СОСТОЯНИЯ ТЕЛА (если есть)
    if (draft.bodyState && hasBodyState) {
      const bodyStateData = convertBodyStateForAPI(draft.bodyState);
      if (bodyStateData) {
        const createdBodyState = await bodyStatesStore.createBodyState(bodyStateData);
        bodyStateId = createdBodyState.id;
      }
    }
    
    // 2. СОЗДАНИЕ ОБСТОЯТЕЛЬСТВ (если есть)
    if (draft.circumstances?.length > 0) {
      const circumstanceData = convertCircumstancesForAPI(draft.circumstances);
      if (circumstanceData) {
        const createdCircumstance = await circumstancesStore.createCircumstance(circumstanceData);
        circumstanceId = createdCircumstance.id;
      }
    }
    
    // 3. СОЗДАНИЕ ОСНОВНОЙ ЗАПИСИ
    const entryDto = {
      entry_type: draft.type,
      content: draft.content.trim(),
      is_completed: false,
      deadline: draft.deadline || null,
      ...(bodyStateId && { body_state_id: bodyStateId }),
      ...(circumstanceId && { circumstance_id: circumstanceId })
    };
    
    console.log('Creating entry with data:', entryDto);
    
    const createdEntry = await entriesStore.createEntry(entryDto);
    const entryId = createdEntry.id;
    
    // 4. ДОБАВЛЕНИЕ ЭМОЦИЙ (если есть)
    if (emotionsStore.hasSelection) {
      await emotionsStore.saveToEntry(entryId);
    }
    
    // 5. ДОБАВЛЕНИЕ ТЕГОВ (если есть)
    if (draft.tags?.length > 0) {
      const tagIds = [];
      
      for (const tagName of draft.tags) {
        const tag = await tagsStore.findOrCreateTag(tagName);
        tagIds.push(tag.id);
      }
      
      for (const tagId of tagIds) {
        await entriesStore.addTagToEntry(entryId, { tag_id: tagId });
      }
    }
    
    // 6. СОЗДАНИЕ СВЯЗЕЙ 
    if (draft.relations?.length > 0) {
      for (const relation of draft.relations) {
        if (relation.needsCreation) {
          const newEntry = await entriesStore.createEntry({
            entry_type: 'thought',
            content: relation.targetEntry.content,
            is_completed: false
          });
          
          await relationsStore.createRelation({
            from_entry_id: entryId,
            to_entry_id: newEntry.id,
            relation_type: relation.type || 'related_to',
            description: relation.description || null
          });
        } else {
          await relationsStore.createRelation({
            from_entry_id: entryId,
            to_entry_id: relation.targetEntry.id,
            relation_type: relation.type || 'related_to',
            description: relation.description || null
          });
        }
      }
    }
    
    // 7. ДОБАВЛЕНИЕ ПРОГРЕССА НАВЫКОВ 
    if (draft.skillProgress?.length > 0) {
      for (const progress of draft.skillProgress) {
        await skillProgressStore.addProgress(progress.skill.id, {
          entry_id: entryId, 
          body_state_id: bodyStateId || null,
          progress_type: progress.progress_type || 'practice',
          experience_gained: progress.experience_gained || 10,
          notes: progress.notes || null 
        });
      }
    }
    
    // 8. ОЧИСТКА ФОРМЫ И ЧЕРНОВИКОВ
    entryDraftStore.resetDraft();
    emotionsStore.clearSelection();
    
    return createdEntry;
  }, [
    entryDraftStore, emotionsStore, bodyStatesStore, circumstancesStore,
    relationsStore, skillProgressStore, tagsStore, entriesStore,
    t, hasBodyState, convertBodyStateForAPI, convertCircumstancesForAPI
  ]);
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSubmitting(true);
    
    if (isTelegram && utils.hapticFeedback) {
      utils.hapticFeedback('medium');
    }
    
    try {
      await saveEntryFromDraft();
      
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
    saveEntryFromDraft, uiStore,
    t, isTelegram, utils, showNotification
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
  
  // === ДАННЫЕ ИЗ ЧЕРНОВИКА ===
  const draft = entryDraftStore.currentDraft;
  
  // === ПРЕВЬЮ ЭМОЦИЙ ===
  const emotionsPreview = useMemo(() => {
    if (!emotionsStore.hasSelection) return null;
    
    return (
      <div className="emotions-preview">
        {emotionsStore.currentSelection.slice(0, 3).map((emotion, index) => (
          <div key={emotion.id} className="emotion-badge">
            <span className="emotion-label">
              {emotion.emotion?.label || emotion.category?.label || 'Эмоция'}
            </span>
          </div>
        ))}
        {emotionsStore.selectionCount > 3 && (
          <div className="more-items">+{emotionsStore.selectionCount - 3}</div>
        )}
      </div>
    );
  }, [emotionsStore.currentSelection, emotionsStore.selectionCount]);
  
  // === ПРЕВЬЮ ТЕГОВ ===
  const tagsPreview = useMemo(() => {
    const tags = draft.tags || [];
    if (tags.length === 0) return null;
    
    return (
      <div className="tags-preview">
        {tags.slice(0, 5).map((tag, index) => (
          <div key={index} className="tag-badge">
            #{tag}
          </div>
        ))}
        {tags.length > 5 && (
          <div className="more-items">+{tags.length - 5}</div>
        )}
      </div>
    );
  }, [draft.tags]);
  
  // === ПРЕВЬЮ СОСТОЯНИЯ ТЕЛА ===
  const bodyStatePreview = useMemo(() => {
    if (!hasBodyState) return null;
    
    const { hp, energy, location } = draft.bodyState || {};
    
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
  }, [hasBodyState, draft.bodyState]);
  
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
          <EntryTypePicker
            draftStore={entryDraftStore}
            draftField="type"
            compact={false}
          />
        </div>
        
        <div className="form-group">
          <TextArea
            value={draft.content || ''}
            onChange={(value) => entryDraftStore.updateDraft({ content: value })}
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
              value={draft.eventDate || ''}
              onChange={(value) => entryDraftStore.updateDraft({ eventDate: value })}
              label={t('entries.form.dateLabel') || 'Дата события'}
              disabled={isSubmitting}
            />
          </div>
          
          {draft.type === 'plan' && (
            <div className="form-group">
              <Input
                type="date"
                value={draft.deadline || ''}
                onChange={(value) => entryDraftStore.updateDraft({ deadline: value })}
                label={t('entries.form.deadlineLabel') || 'Срок выполнения'}
                required={draft.type === ENTRY_TYPES.PLAN}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>
        
        {renderPickerSection({
          label: t('entries.form.emotionsLabel') || 'Эмоции',
          icon: '',
          modalName: 'emotion',
          value: emotionsStore.hasSelection,
          buttonText: emotionsStore.hasSelection
            ? `${emotionsStore.selectionCount} ${t('common.selected') || 'выбрано'}`
            : t('emotions.picker.open') || 'Добавить эмоции',
          previewComponent: emotionsPreview
        })}
        
        {renderPickerSection({
          label: t('entries.form.circumstancesLabel') || 'Обстоятельства',
          icon: '',
          modalName: 'circumstances',
          value: draft.circumstances?.length > 0,
          buttonText: draft.circumstances?.length > 0
            ? `${draft.circumstances.length} ${t('common.selected') || 'выбрано'}`
            : t('circumstances.picker.open') || 'Добавить обстоятельства',
          previewComponent: draft.circumstances?.length > 0 && (
            <div className="circumstances-preview">
              {draft.circumstances.slice(0, 2).map((circ, index) => (
                <div key={index} className="circumstance-badge">
                  <span className="circumstance-label">
                    {circ.item?.label || circ.category?.label || 'Обстоятельство'}
                  </span>
                  <span className="circumstance-intensity">
                    {circ.intensity}{circ.isTemperature ? '°C' : '%'}
                  </span>
                </div>
              ))}
              {draft.circumstances.length > 2 && (
                <div className="more-items">+{draft.circumstances.length - 2}</div>
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
          value: draft.skills?.length > 0,
          buttonText: draft.skills?.length > 0
            ? `${draft.skills.length} ${t('common.selected') || 'выбрано'}`
            : t('skills.picker.open') || 'Добавить навыки',
          previewComponent: draft.skills?.length > 0 && (
            <div className="skills-preview">
              {draft.skills.slice(0, 2).map((skill, index) => (
                <div key={index} className="skill-badge">
                  <span className="skill-label">
                    {skill.skill?.label || 'Навык'} - LVL {skill.level}
                  </span>
                  <span className="skill-exp">{skill.experience} XP</span>
                </div>
              ))}
              {draft.skills.length > 2 && (
                <div className="more-items">+{draft.skills.length - 2}</div>
              )}
            </div>
          )
        })}
        
        {renderPickerSection({
          label: t('entries.form.relationsLabel') || 'Связи',
          icon: '',
          modalName: 'relations',
          value: draft.relations?.length > 0,
          buttonText: draft.relations?.length > 0
            ? `${draft.relations.length} ${t('common.connections') || 'связей'}`
            : t('relations.picker.open') || 'Добавить связи',
          previewComponent: draft.relations?.length > 0 && (
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
                {draft.relations.slice(0, 2).map((rel, index) => (
                  <div key={index} className="relation-item">
                    <span className="relation-description">
                      {rel.description?.slice(0, 30) || 'Связь'}...
                    </span>
                  </div>
                ))}
                {draft.relations.length > 2 && (
                  <div className="more-items">+{draft.relations.length - 2}</div>
                )}
              </div>
            </div>
          )
        })}
        
        {renderPickerSection({
          label: t('entries.form.tagsLabel') || 'Теги',
          icon: '#',
          modalName: 'tags',
          value: draft.tags?.length > 0,
          buttonText: draft.tags?.length > 0
            ? `${draft.tags.length} ${t('common.tags') || 'тегов'}`
            : t('tags.picker.open') || 'Добавить теги',
          previewComponent: tagsPreview
        })}
        
        {renderPickerSection({
          label: t('entries.form.skillProgressLabel') || 'Прокачка навыков',
          icon: '',
          modalName: 'skillProgress',
          value: draft.skillProgress?.length > 0,
          buttonText: draft.skillProgress?.length > 0
            ? `${draft.skillProgress.length} ${t('common.progress') || 'прокачки'}`
            : t('skillProgress.picker.open') || 'Добавить прокачку',
          previewComponent: draft.skillProgress?.length > 0 && (
            <div className="progress-preview">
              {draft.skillProgress.slice(0, 2).map((progress, index) => (
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
              {draft.skillProgress.length > 2 && (
                <div className="more-items">+{draft.skillProgress.length - 2}</div>
              )}
            </div>
          )
        })}
        
        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={isSubmitting || !draft.content?.trim()}
            haptic={true}
            fullWidth
            loading={isSubmitting}
          >
            {isSubmitting 
              ? `${t('common.saving') || 'Сохранение'}...` 
              : t('entries.form.submit') || 'Создать запись'
            }
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="medium"
            onClick={() => entryDraftStore.resetDraft()}
            disabled={isSubmitting}
          >
            {t('common.clear') || 'Очистить'}
          </Button>
        </div>
        
        {draft.type === ENTRY_TYPES.PLAN && !draft.deadline && (
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
          draftStore={entryDraftStore}
          draftField="emotions"
          maxEmotions={5}
          onClose={() => closeModal('emotion')}
        />
      </Modal>
      
      <Modal
        isOpen={modals.circumstances}
        onClose={() => closeModal('circumstances')}
        title={t('circumstances.picker.title') || 'Выбор обстоятельств'}
        size="lg"
      >
        <CircumstancesPicker
          draftStore={entryDraftStore}
          draftField="circumstances"
          maxCircumstances={5}
          onClose={() => closeModal('circumstances')}
        />
      </Modal>
      
      <Modal
        isOpen={modals.bodyState}
        onClose={() => closeModal('bodyState')}
        title={t('body.picker.title') || 'Состояние тела'}
        size="md"
      >
        <BodyStatePicker
          draftStore={entryDraftStore}
          draftField="bodyState"
          onClose={() => closeModal('bodyState')}
        />
      </Modal>
      
      <Modal
        isOpen={modals.skills}
        onClose={() => closeModal('skills')}
        title={t('skills.picker.title') || 'Выбор навыков'}
        size="lg"
      >
        <SkillsPicker
          draftStore={entryDraftStore}
          draftField="skills"
          maxSkills={10}
          onClose={() => closeModal('skills')}
        />
      </Modal>
      
      <Modal
        isOpen={modals.relations}
        onClose={() => closeModal('relations')}
        title={t('relations.picker.title') || 'Добавление связей'}
        size="lg"
      >
        <RelationPicker
          draftStore={entryDraftStore}
          draftField="relations"
          maxRelations={5}
          searchGraphs={searchGraphs}
          onClose={() => closeModal('relations')}
        />
      </Modal>
      
      <Modal
        isOpen={modals.graph}
        onClose={() => closeModal('graph')}
        title={t('relations.graph.title') || 'Граф связей'}
        size="xl"
      >
        <RelationGraph
          relations={draft.relations || []}
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
          draftStore={entryDraftStore}
          draftField="skillProgress"
          maxSkills={5}
          mode="progress"
          onClose={() => closeModal('skillProgress')}
        />
      </Modal>
      
      <Modal
        isOpen={modals.tags}
        onClose={() => closeModal('tags')}
        title={t('tags.picker.title') || 'Добавление теги'}
        size="md"
      >
        <TagsPicker
          draftStore={entryDraftStore}
          draftField="tags"
          maxTags={10}
          onClose={() => closeModal('tags')}
        />
      </Modal>
    </>
  );
});

export default EntryForm;