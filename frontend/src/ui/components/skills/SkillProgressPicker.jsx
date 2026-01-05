// ~/aProject/AIM/frontend/src/ui/components/skills/SkillProgressPicker.jsx
import React, { useState, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useSkillsStore } from '@/store/StoreContext';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import './SkillProgressPicker.css';

const SkillProgressPicker = observer(({
  // Режим 1: Автономный (для переиспользования)
  selectedProgresses = [],
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'skillProgress',
  
  // Общие пропсы
  maxProgresses = 10
}) => {
  const { t } = useLanguage();
  const skillsStore = useSkillsStore();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentSelection = isDraftMode 
    ? draftStore.currentDraft[draftField] || []
    : selectedProgresses || [];
  
  // Локальное состояние UI
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [experience, setExperience] = useState(10);
  const [description, setDescription] = useState('');
  const [currentStep, setCurrentStep] = useState('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Загрузка данных при инициализации
  const initData = useCallback(async () => {
    try {
      await skillsStore.fetchSkills();
      await skillsStore.fetchCategories();
    } catch (error) {
      console.error('Failed to initialize skills data:', error);
      setLocalError(t('progress.init_failed'));
    }
  }, [skillsStore, t]);

  // Обработчик обновления выбора
  const handleChange = useCallback((newProgresses) => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: newProgresses });
    } else {
      onChange?.(newProgresses);
    }
  }, [isDraftMode, draftStore, draftField, onChange]);

  // Фильтрация навыков
  const filteredSkills = useMemo(() => {
    if (!skillsStore.skills || skillsStore.skills.length === 0) {
      return [];
    }
    
    let skills = [...skillsStore.skills];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      skills = skills.filter(skill => {
        const category = skillsStore.categories.find(c => c.id === skill.category_id);
        return (
          skill.name.toLowerCase().includes(query) ||
          skill.description?.toLowerCase().includes(query) ||
          category?.name?.toLowerCase().includes(query)
        );
      });
    }
    
    return skills;
  }, [skillsStore.skills, skillsStore.categories, searchQuery]);

  // Обработчики шагов
  const handleSkillSelect = useCallback((skill) => {
    setSelectedSkill(skill);
    setCurrentStep('progress');
    setLocalError(null);
  }, []);

  const handleAddProgress = useCallback(() => {
    if (!selectedSkill) {
      setLocalError(t('progress.select_skill_first'));
      return;
    }
    
    if (currentSelection.length >= maxProgresses) {
      setLocalError(t('progress.max_reached', { max: maxProgresses }));
      return;
    }

    // Проверяем, не добавлен ли уже этот навык
    const alreadyAdded = currentSelection.some(p => p.skill?.id === selectedSkill.id);
    if (alreadyAdded) {
      setLocalError(t('progress.skill_already_added'));
      return;
    }

    const newProgress = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skill: {
        id: selectedSkill.id,
        name: selectedSkill.name,
        description: selectedSkill.description,
        category_id: selectedSkill.category_id,
        icon: selectedSkill.icon || '🎯',
        level: skillsStore.getSkillLevel(selectedSkill.id) || 1
      },
      experience_gained: experience,
      description: description.trim(),
      progress_type: 'practice',
      notes: description.trim() || null,
      created_at: new Date().toISOString(),
      isTemp: true
    };

    const newSelection = [...currentSelection, newProgress];
    handleChange(newSelection);
    
    // Сброс UI состояния
    setSelectedSkill(null);
    setExperience(10);
    setDescription('');
    setCurrentStep('select');
    setSearchQuery('');
    setLocalError(null);
  }, [selectedSkill, currentSelection, maxProgresses, experience, description, skillsStore, handleChange, t]);

  const handleRemoveProgress = useCallback((index) => {
    const newSelection = currentSelection.filter((_, i) => i !== index);
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  const handleClearAll = useCallback(() => {
    handleChange([]);
  }, [handleChange]);

  const handleBack = useCallback(() => {
    if (currentStep === 'progress') {
      setCurrentStep('select');
      setSelectedSkill(null);
      setExperience(10);
      setDescription('');
    }
    setLocalError(null);
  }, [currentStep]);

  const handleUpdateExperience = useCallback((index, newExperience) => {
    const newSelection = currentSelection.map((progress, i) => 
      i === index ? { ...progress, experience_gained: parseInt(newExperience) || 1 } : progress
    );
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  const handleUpdateDescription = useCallback((index, newDescription) => {
    const newSelection = currentSelection.map((progress, i) => 
      i === index ? { ...progress, description: newDescription, notes: newDescription } : progress
    );
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  // Уровни опыта
  const experienceLevels = useMemo(() => [
    { value: 1, label: t('progress.levels.minimum'), icon: '↗' },
    { value: 5, label: t('progress.levels.small'), icon: '↑' },
    { value: 10, label: t('progress.levels.normal'), icon: '↑↑' },
    { value: 25, label: t('progress.levels.large'), icon: '↑↑↑' },
    { value: 50, label: t('progress.levels.breakthrough'), icon: '🚀' },
    { value: 100, label: t('progress.levels.epic'), icon: '⚡' }
  ], [t]);

  // Расчет статистики
  const totalExperience = useMemo(() => 
    currentSelection.reduce((sum, p) => sum + (p.experience_gained || 0), 0),
    [currentSelection]
  );
  
  const uniqueSkills = useMemo(() => 
    new Set(currentSelection.map(p => p.skill?.id)).size,
    [currentSelection]
  );

  // Рендеринг шагов
  const renderCurrentStep = () => {
    // Если данные еще не загружены
    if (skillsStore.isLoading) {
      return (
        <div className="progress-step-content loading">
          <Loader />
          <p>{t('progress.loading_skills')}</p>
        </div>
      );
    }

    if (localError) {
      return (
        <div className="progress-step-content error">
          <div className="error-message">{localError}</div>
          <Button onClick={initData}>
            {t('common.retry')}
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 'select':
        return (
          <div className="progress-step-content">
            <div className="progress-step-header">
              <h3 className="progress-step-title">{t('progress.select_skill')}</h3>
              <div className="progress-search-container">
                <Input
                  type="text"
                  placeholder={t('progress.search_skills')}
                  value={searchQuery}
                  onChange={setSearchQuery}
                  className="progress-search-input"
                />
              </div>
            </div>
            
            {filteredSkills.length === 0 ? (
              <div className="no-skills-message">
                {searchQuery ? t('progress.no_results') : t('progress.no_skills')}
              </div>
            ) : (
              <div className="skills-progress-grid">
                {filteredSkills.map(skill => {
                  const category = skillsStore.categories.find(c => c.id === skill.category_id);
                  const existingProgress = currentSelection.find(p => p.skill?.id === skill.id);
                  const skillLevel = skillsStore.getSkillLevel(skill.id);
                  
                  return (
                    <div
                      key={skill.id}
                      className={`skill-progress-card ${existingProgress ? 'has-progress' : ''}`}
                      onClick={() => handleSkillSelect(skill)}
                    >
                      <div className="skill-card-header">
                        <span className="skill-category-icon">
                          {category?.icon || '📚'}
                        </span>
                        <span className="skill-name">{skill.name}</span>
                        {existingProgress && (
                          <span className="skill-progress-badge">
                            +{existingProgress.experience_gained} XP
                          </span>
                        )}
                      </div>
                      
                      {skill.description && (
                        <div className="skill-description">{skill.description}</div>
                      )}
                      
                      <div className="skill-meta">
                        <span className="skill-level">
                          {t('progress.level')}: {skillLevel}
                        </span>
                        <span className="skill-usage">
                          {t('progress.used')}: {skill.usage_count || 0}
                        </span>
                      </div>
                      
                      {existingProgress && (
                        <div className="existing-progress-note">
                          {t('progress.already_added')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="progress-actions">
              <Button
                variant="secondary"
                onClick={initData}
              >
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        );
      
      case 'progress':
        const category = selectedSkill ? 
          skillsStore.categories.find(c => c.id === selectedSkill.category_id) : 
          null;
        
        return (
          <div className="progress-step-content">
            <div className="progress-step-header">
              <button className="back-button btn-secondary" onClick={handleBack}>
                ← {t('common.back')}
              </button>
              <h3 className="progress-step-title">
                {t('progress.add_progress')}
              </h3>
            </div>
            
            <div className="selected-skill-info">
              <div className="selected-skill-header">
                <span className="skill-category-icon">
                  {category?.icon || '📚'}
                </span>
                <div className="skill-info-text">
                  <span className="skill-name">{selectedSkill?.name}</span>
                  <div className="selected-skill-level">
                    {t('progress.current_level')}: {skillsStore.getSkillLevel(selectedSkill?.id) || 1}
                  </div>
                </div>
              </div>
              
              {selectedSkill?.description && (
                <div className="selected-skill-description">
                  {selectedSkill.description}
                </div>
              )}
            </div>
            
            <div className="progress-inputs">
              <div className="experience-section">
                <h4 className="section-title">{t('progress.experience_gained')}</h4>
                
                <div className="experience-levels">
                  {experienceLevels.map(level => (
                    <button
                      key={level.value}
                      className={`experience-level ${experience === level.value ? 'selected' : ''}`}
                      onClick={() => setExperience(level.value)}
                    >
                      <span className="level-icon">{level.icon}</span>
                      <span className="level-label">{level.label}</span>
                    </button>
                  ))}
                </div>
                
                <div className="custom-experience">
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={experience}
                    onChange={(value) => setExperience(parseInt(value) || 1)}
                    label={t('progress.custom_experience')}
                    placeholder="10"
                  />
                </div>
              </div>
              
              <div className="description-section">
                <h4 className="section-title">{t('progress.description')}</h4>
                <Input
                  type="textarea"
                  value={description}
                  onChange={setDescription}
                  placeholder={t('progress.description_placeholder')}
                  rows="3"
                />
                <div className="description-hint">
                  {t('progress.description_hint')}
                </div>
              </div>
            </div>
            
            <div className="progress-preview">
              <div className="preview-title">{t('progress.preview')}</div>
              <div className="preview-content">
                <span className="preview-skill">{selectedSkill?.name}</span>
                <span className="preview-experience">+{experience} XP</span>
                {description && (
                  <div className="preview-description">"{description}"</div>
                )}
              </div>
            </div>
            
            <div className="progress-actions">
              <Button
                variant="primary"
                onClick={handleAddProgress}
                disabled={!selectedSkill || experience < 1}
                fullWidth
              >
                {t('progress.add_to_list')}
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Рендеринг выбранного прогресса
  const renderSelectedProgress = () => {
    if (currentSelection.length === 0) return null;
    
    return (
      <div className="selected-progress-section">
        <div className="selected-progress-header">
          <div className="progress-stats">
            <span className="stats-item">
              {t('progress.skills')}: {uniqueSkills}
            </span>
            <span className="stats-item">
              {t('progress.total_xp')}: {totalExperience}
            </span>
            <span className="stats-item">
              {t('progress.items')}: {currentSelection.length}/{maxProgresses}
            </span>
          </div>
          <div className="progress-actions-header">
            <Button
              variant="secondary"
              size="small"
              onClick={handleClearAll}
            >
              {t('common.clear_all')}
            </Button>
          </div>
        </div>
        
        <div className="selected-progress-list">
          {currentSelection.map((progress, index) => {
            const skill = progress.skill;
            const category = skill?.category_id ? 
              skillsStore.categories.find(c => c.id === skill.category_id) : 
              null;
            
            return (
              <div key={progress.id || index} className="progress-item">
                <div className="progress-item-main">
                  <div className="progress-skill-info">
                    <span className="progress-skill-icon">
                      {category?.icon || skill?.icon || '🎯'}
                    </span>
                    <div className="progress-skill-details">
                      <div className="progress-skill-name">{skill?.name}</div>
                      <div className="progress-skill-level">
                        {t('progress.level')} {skill?.level || skillsStore.getSkillLevel(skill?.id) || 1}
                      </div>
                    </div>
                  </div>
                  
                  <div className="progress-experience">
                    <span className="experience-amount">
                      +{progress.experience_gained} XP
                    </span>
                    {progress.isTemp && (
                      <span className="temp-badge">{t('progress.temp')}</span>
                    )}
                  </div>
                </div>
                
                <div className="progress-description-edit">
                  <Input
                    type="textarea"
                    value={progress.description || ''}
                    onChange={(value) => handleUpdateDescription(index, value)}
                    placeholder={t('progress.add_notes')}
                    rows="1"
                    size="small"
                  />
                </div>
                
                <div className="progress-item-actions">
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={progress.experience_gained}
                    onChange={(value) => handleUpdateExperience(index, value)}
                    size="small"
                    className="progress-edit-input"
                  />
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleRemoveProgress(index)}
                  >
                    {t('common.remove')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="skill-progress-picker">
      {renderSelectedProgress()}
      
      <div className="progress-picker-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
});

export default SkillProgressPicker;