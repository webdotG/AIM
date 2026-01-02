import React, { useState, useEffect, useRef, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useSkillsStore } from '@/store';
import { useSkillProgressStore } from '@/store';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import './SkillProgressPicker.css';

const SkillProgressPicker = observer(({
  selectedProgresses = [],
  onChange,
  maxProgresses = 10,
  onClose
}) => {
  const { t } = useLanguage();
  const skillsStore = useSkillsStore();
  const progressStore = useSkillProgressStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [experience, setExperience] = useState(10);
  const [description, setDescription] = useState('');
  const [currentStep, setCurrentStep] = useState('select');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearUrlRef = useRef(() => {
    const url = new URL(window.location);
    url.searchParams.delete('progress');
    window.history.replaceState({}, '', url);
  });

  // Инициализация
  useEffect(() => {
    const init = async () => {
      await skillsStore.fetchSkills();
      await skillsStore.fetchCategories();
    };
    init();
  }, []);

  // Передаем clearUrl наружу
  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновление URL
  useEffect(() => {
    if (selectedProgresses.length === 0) {
      clearUrlRef.current();
      return;
    }

    const encoded = progressStore.encodeToUrl(selectedProgresses);
    if (encoded) {
      const url = new URL(window.location);
      url.searchParams.set('progress', encoded);
      window.history.replaceState({}, '', url);
    }
  }, [selectedProgresses, progressStore]);

  // Чтение из URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const progressParam = params.get('progress');
    
    if (progressParam && selectedProgresses.length === 0) {
      const progresses = progressStore.decodeFromUrl(progressParam, skillsStore.skills);
      if (progresses.length > 0) {
        onChange(progresses);
      }
    }
  }, [selectedProgresses.length, skillsStore.skills.length, progressStore, onChange]);

  // Фильтрация навыков
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return skillsStore.skills;
    
    const query = searchQuery.toLowerCase();
    return skillsStore.skills.filter(skill => {
      const category = skillsStore.categories.find(c => c.id === skill.category_id);
      return (
        skill.name.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        category?.name?.toLowerCase().includes(query)
      );
    });
  }, [skillsStore.skills, skillsStore.categories, searchQuery]);

  // Обработчики
  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setCurrentStep('progress');
  };

  const handleAddProgress = () => {
    if (!selectedSkill) return;
    
    if (selectedProgresses.length >= maxProgresses) {
      alert(t('progress.max_reached', { max: maxProgresses }));
      return;
    }

    const newProgress = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skill: {
        id: selectedSkill.id,
        name: selectedSkill.name,
        icon: selectedSkill.icon || '🎯',
        level: selectedSkill.level || 1
      },
      experience_gained: experience,
      description: description.trim(),
      created_at: new Date().toISOString(),
      isTemp: true
    };

    const updated = [...selectedProgresses, newProgress];
    onChange(updated);
    
    // Сброс
    setSelectedSkill(null);
    setExperience(10);
    setDescription('');
    setCurrentStep('select');
    setSearchQuery('');
  };

  const handleRemoveProgress = (index) => {
    const updated = selectedProgresses.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
    clearUrlRef.current();
  };

  const handleBack = () => {
    if (currentStep === 'progress') {
      setCurrentStep('select');
      setSelectedSkill(null);
    }
  };

  const handleSaveToServer = async () => {
    if (selectedProgresses.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const results = [];
      
      for (const progress of selectedProgresses) {
        if (progress.isTemp && !progress.savedToServer) {
          try {
            const saved = await progressStore.addProgress(
              progress.skill.id,
              {
                experience_gained: progress.experience_gained,
                description: progress.description
              }
            );
            results.push({ ...progress, id: saved.id, savedToServer: true, isTemp: false });
          } catch (error) {
            console.error(`Failed to save progress for ${progress.skill.name}:`, error);
            results.push(progress); // Оставляем как есть
          }
        } else {
          results.push(progress);
        }
      }
      
      onChange(results);
      
      if (results.some(p => p.savedToServer)) {
        alert(t('progress.saved_success'));
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      alert(t('progress.save_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Уровни опыта
  const experienceLevels = [
    { value: 1, label: t('progress.levels.minimum'), icon: '↗' },
    { value: 5, label: t('progress.levels.small'), icon: '↑' },
    { value: 10, label: t('progress.levels.normal'), icon: '↑↑' },
    { value: 25, label: t('progress.levels.large'), icon: '↑↑↑' },
    { value: 50, label: t('progress.levels.breakthrough'), icon: '🚀' },
    { value: 100, label: t('progress.levels.epic'), icon: '⚡' }
  ];

  // Расчет общего прогресса
  const totalExperience = selectedProgresses.reduce((sum, p) => sum + (p.experience_gained || 0), 0);
  const uniqueSkills = new Set(selectedProgresses.map(p => p.skill?.id)).size;

  // Рендеринг шагов
  const renderCurrentStep = () => {
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
            
            {skillsStore.isLoading ? (
              <Loader />
            ) : filteredSkills.length === 0 ? (
              <div className="no-skills-message">
                {searchQuery ? t('progress.no_results') : t('progress.no_skills')}
              </div>
            ) : (
              <div className="skills-progress-grid">
                {filteredSkills.map(skill => {
                  const category = skillsStore.categories.find(c => c.id === skill.category_id);
                  const existingProgress = selectedProgresses.find(p => p.skill?.id === skill.id);
                  
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
                          {t('progress.level')}: {skill.level || 1}
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
                onClick={() => setCurrentStep('add-new')}
              >
                + {t('progress.add_new_skill')}
              </Button>
            </div>
          </div>
        );
      
      case 'add-new':
        return (
          <div className="progress-step-content">
            <div className="progress-step-header">
              <button className="back-button btn-secondary" onClick={() => setCurrentStep('select')}>
                ← {t('common.back')}
              </button>
              <h3 className="progress-step-title">{t('progress.create_skill')}</h3>
            </div>
            
            <div className="create-skill-form">
              <p className="form-note">{t('progress.create_note')}</p>
              <Button
                variant="secondary"
                onClick={() => setCurrentStep('select')}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        );
      
      case 'progress':
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
                <span className="skill-icon">{selectedSkill?.icon || '🎯'}</span>
                <span className="skill-name">{selectedSkill?.name}</span>
              </div>
              <div className="selected-skill-level">
                {t('progress.current_level')}: {selectedSkill?.level || 1}
              </div>
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
    if (selectedProgresses.length === 0) return null;
    
    const hasTempProgress = selectedProgresses.some(p => p.isTemp);
    
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
              {t('progress.items')}: {selectedProgresses.length}/{maxProgresses}
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
            {hasTempProgress && (
              <Button
                variant="primary"
                size="small"
                onClick={handleSaveToServer}
                disabled={isSubmitting}
              >
                {isSubmitting ? t('common.saving') : t('progress.save_all')}
              </Button>
            )}
          </div>
        </div>
        
        <div className="selected-progress-list">
          {selectedProgresses.map((progress, index) => {
            const skill = progress.skill;
            
            return (
              <div key={progress.id || index} className="progress-item">
                <div className="progress-item-main">
                  <div className="progress-skill-info">
                    <span className="progress-skill-icon">
                      {skill?.icon || '🎯'}
                    </span>
                    <div className="progress-skill-details">
                      <div className="progress-skill-name">{skill?.name}</div>
                      <div className="progress-skill-level">
                        {t('progress.level')} {skill?.level || 1}
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
                    {progress.fromUrl && (
                      <span className="url-badge">{t('progress.from_url')}</span>
                    )}
                  </div>
                </div>
                
                {progress.description && (
                  <div className="progress-description">
                    {progress.description}
                  </div>
                )}
                
                <div className="progress-item-actions">
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    value={progress.experience_gained}
                    onChange={(value) => {
                      const updated = [...selectedProgresses];
                      updated[index].experience_gained = parseInt(value) || 1;
                      onChange(updated);
                    }}
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