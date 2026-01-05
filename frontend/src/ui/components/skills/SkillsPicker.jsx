// ~/aProject/AIM/frontend/src/ui/components/skills/SkillsPicker.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useSkillsStore } from '@/store/StoreContext';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import './SkillsPicker.css';

const SkillsPicker = observer(({
  // Режим 1: Автономный (для переиспользования)
  selectedSkills = [], 
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'skills',
  
  // Общие пропсы
  maxSkills = 10,
  mode = 'default',
  allowCreate = true,
  compactView = false
}) => {
  const { t } = useLanguage();
  const skillsStore = useSkillsStore();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentSelection = isDraftMode 
    ? draftStore.currentDraft[draftField] || []
    : selectedSkills || [];
  
  // Локальное состояние UI
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category_id: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Инициализация - загрузка данных
  useEffect(() => {
    const init = async () => {
      await skillsStore.fetchSkills();
      await skillsStore.fetchCategories();
    };
    init();
  }, [skillsStore]);
  
  // Синхронизация выбранных скиллов между стором и пропсами/draft
  useEffect(() => {
    if (currentSelection.length > 0) {
      // Конвертируем в ID для стора
      const skillIds = currentSelection.map(skill => 
        typeof skill === 'object' ? skill.id : skill
      );
      skillsStore.setSelection(skillIds);
    } else {
      skillsStore.clearSelection();
    }
  }, [currentSelection, skillsStore]);
  
  // Обработчик обновления выбора
  const handleChange = useCallback((newSkills) => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: newSkills });
    } else {
      onChange?.(newSkills);
    }
  }, [isDraftMode, draftStore, draftField, onChange]);
  
  // Конвертируем ID скиллов в полные объекты
  const getSkillsFromIds = useCallback((skillIds) => {
    return skillIds.map(id => {
      const skill = skillsStore.skills.find(s => s.id === id);
      if (!skill) return null;
      
      return {
        id: skill.id,
        name: skill.name,
        category_id: skill.category_id,
        description: skill.description,
        usage_count: skill.usage_count,
        level: skillsStore.getSkillLevel(skill.id)
      };
    }).filter(Boolean);
  }, [skillsStore]);
  
  // Обработчик добавления/удаления скилла
  const handleSkillToggle = useCallback((skillId) => {
    const skill = skillsStore.skills.find(s => s.id === skillId);
    if (!skill) return;
    
    // Проверяем выбран ли уже
    const isSelected = currentSelection.some(s => 
      (typeof s === 'object' ? s.id : s) === skillId
    );
    
    if (isSelected) {
      // Удаляем
      const newSelection = currentSelection.filter(s => 
        (typeof s === 'object' ? s.id : s) !== skillId
      );
      handleChange(newSelection);
    } else {
      // Добавляем (проверяем лимит)
      if (currentSelection.length >= maxSkills) {
        alert(t('skills.max_reached', { max: maxSkills }));
        return;
      }
      
      const skillObj = {
        id: skill.id,
        name: skill.name,
        category_id: skill.category_id,
        description: skill.description,
        usage_count: skill.usage_count,
        level: skillsStore.getSkillLevel(skill.id)
      };
      
      const newSelection = [...currentSelection, skillObj];
      handleChange(newSelection);
    }
  }, [currentSelection, maxSkills, skillsStore, handleChange, t]);
  
  // Фильтрация скиллов
  const filteredSkills = useMemo(() => {
    let skills = skillsStore.filteredSkills || [];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      skills = skills.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skillsStore.availableCategories
          .find(c => c.id === skill.category_id)
          ?.name?.toLowerCase().includes(query)
      );
    }
    
    return skills;
  }, [skillsStore.filteredSkills, skillsStore.availableCategories, searchQuery]);
  
  // Создание нового скилла
  const handleCreateSkill = useCallback(async (e) => {
    e.preventDefault();
    
    if (!newSkill.name.trim()) {
      alert(t('skills.name_required'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const createdSkill = await skillsStore.createSkill(newSkill);
      
      // Автоматически добавляем, если есть место
      if (currentSelection.length < maxSkills) {
        const skillObj = {
          id: createdSkill.id,
          name: createdSkill.name,
          category_id: createdSkill.category_id,
          description: createdSkill.description,
          usage_count: 0,
          level: 1
        };
        
        const newSelection = [...currentSelection, skillObj];
        handleChange(newSelection);
      }
      
      // Сброс формы
      setNewSkill({ name: '', category_id: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Create skill error:', error);
      alert(t('skills.creation_failed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [newSkill, currentSelection, maxSkills, skillsStore, handleChange, t]);
  
  const handleClearAll = useCallback(() => {
    handleChange([]);
  }, [handleChange]);
  
  const handleRemoveSkill = useCallback((skillId) => {
    const newSelection = currentSelection.filter(s => 
      (typeof s === 'object' ? s.id : s) !== skillId
    );
    handleChange(newSelection);
  }, [currentSelection, handleChange]);
  
  // Для режима прогресса (skillProgress)
  const isProgressMode = mode === 'progress';
  
  // Рендер в зависимости от режима
  if (compactView) {
    return (
      <div className="skills-picker-compact">
        <div className="compact-skills-list">
          {currentSelection.map(skill => {
            const skillObj = typeof skill === 'object' ? skill : skillsStore.skills.find(s => s.id === skill);
            if (!skillObj) return null;
            
            return (
              <div key={skillObj.id} className="selected-skill-tag">
                {skillObj.name}
                {isProgressMode && skillObj.experience_gained && (
                  <span className="skill-exp">+{skillObj.experience_gained} XP</span>
                )}
                <button onClick={() => handleRemoveSkill(skillObj.id)}>×</button>
              </div>
            );
          })}
        </div>
        
        {allowCreate && !showCreateForm && (
          <Button 
            size="small"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? t('common.cancel') : t('skills.add_new')}
          </Button>
        )}
        
        {showCreateForm && (
          <div className="create-skill-form-compact">
            <Input
              value={newSkill.name}
              onChange={(value) => setNewSkill({...newSkill, name: value})}
              placeholder={t('skills.name_placeholder')}
              required
            />
            <div className="form-actions">
              <Button
                size="small"
                onClick={handleCreateSkill}
                disabled={isSubmitting || !newSkill.name.trim()}
              >
                {t('skills.create')}
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Полная версия
  return (
    <div className="skills-picker">
      {/* Заголовок и статистика */}
      <div className="skills-header">
        <h3 className="skills-title">
          {isProgressMode ? t('skillProgress.picker') : t('skills.picker')}
        </h3>
        <div className="skills-stats">
          <span className="selected-count">
            {t('skills.selected')}: {currentSelection.length} / {maxSkills}
          </span>
          {currentSelection.length > 0 && (
            <Button 
              variant="secondary" 
              size="small"
              onClick={handleClearAll}
            >
              {t('skills.clear_all')}
            </Button>
          )}
        </div>
      </div>
      
      {/* Поиск и фильтры */}
      <div className="skills-search-section">
        <Input
          type="text"
          placeholder={t('skills.search_placeholder')}
          value={searchQuery}
          onChange={setSearchQuery}
          className="skills-search-input"
        />
        
        <div className="skills-filters">
          <select 
            value={skillsStore.filters.categoryId || ''}
            onChange={(e) => skillsStore.setFilter('categoryId', e.target.value || null)}
          >
            <option value="">{t('skills.all_categories')}</option>
            {skillsStore.availableCategories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          
          <select 
            value={skillsStore.filters.sort}
            onChange={(e) => skillsStore.setFilter('sort', e.target.value)}
          >
            <option value="popular">{t('skills.sort.popular')}</option>
            <option value="name">{t('skills.sort.name')}</option>
            <option value="recent">{t('skills.sort.recent')}</option>
            <option value="level">{t('skills.sort.level')}</option>
          </select>
        </div>
      </div>
      
      {/* Выбранные скиллы */}
      {currentSelection.length > 0 && (
        <div className="selected-skills-preview">
          <div className="selected-skills-list">
            {currentSelection.map(skill => {
              const skillObj = typeof skill === 'object' ? skill : skillsStore.skills.find(s => s.id === skill);
              if (!skillObj) return null;
              
              return (
                <div key={skillObj.id} className="selected-skill-card">
                  <div className="selected-skill-info">
                    <span className="selected-skill-name">{skillObj.name}</span>
                    {isProgressMode && skillObj.experience_gained && (
                      <span className="skill-progress-exp">+{skillObj.experience_gained} XP</span>
                    )}
                    <span className="selected-skill-level">
                      LVL {skillObj.level || skillsStore.getSkillLevel(skillObj.id)}
                    </span>
                  </div>
                  <button 
                    className="remove-selected-skill"
                    onClick={() => handleRemoveSkill(skillObj.id)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Список навыков */}
      <div className="skills-list-container">
        {skillsStore.isLoading ? (
          <Loader />
        ) : filteredSkills.length === 0 ? (
          <div className="no-skills-message">
            {searchQuery ? t('skills.no_results') : t('skills.no_skills')}
          </div>
        ) : (
          <div className="skills-grid">
            {filteredSkills.map(skill => {
              const isSelected = currentSelection.some(s => 
                (typeof s === 'object' ? s.id : s) === skill.id
              );
              const category = skillsStore.availableCategories.find(c => c.id === skill.category_id);
              const skillLevel = skillsStore.getSkillLevel(skill.id);
              
              return (
                <div
                  key={skill.id}
                  className={`skill-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSkillToggle(skill.id)}
                >
                  <div className="skill-card-header">
                    <span className="skill-category-icon">
                      {category?.icon || '📚'}
                    </span>
                    <span className="skill-name">{skill.name}</span>
                    {isSelected && (
                      <span className="selected-check">✓</span>
                    )}
                  </div>
                  
                  {skill.description && (
                    <div className="skill-description">{skill.description}</div>
                  )}
                  
                  <div className="skill-meta">
                    <span className="skill-usage">
                      {t('skills.used')}: {skill.usage_count || 0}
                    </span>
                    <span className="skill-level">
                      {t('skills.level')}: {skillLevel}
                    </span>
                  </div>
                  
                  {isProgressMode && isSelected && (
                    <div className="skill-progress-input">
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        placeholder="XP gained"
                        value={currentSelection.find(s => 
                          (typeof s === 'object' ? s.id : s) === skill.id
                        )?.experience_gained || ''}
                        onChange={(value) => {
                          // Обновляем опыт для выбранного скилла
                          const newSelection = currentSelection.map(s => {
                            const sId = typeof s === 'object' ? s.id : s;
                            if (sId === skill.id) {
                              return {
                                ...(typeof s === 'object' ? s : { id: s, name: skill.name }),
                                experience_gained: parseInt(value) || 0
                              };
                            }
                            return s;
                          });
                          handleChange(newSelection);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Форма создания */}
      {allowCreate && showCreateForm && (
        <div className="create-skill-form">
          <h4>{t('skills.create_new')}</h4>
          <form onSubmit={handleCreateSkill}>
            <Input
              value={newSkill.name}
              onChange={(value) => setNewSkill({...newSkill, name: value})}
              placeholder={t('skills.name_placeholder')}
              required
            />
            
            <select
              value={newSkill.category_id}
              onChange={(e) => setNewSkill({...newSkill, category_id: e.target.value})}
              className="category-select"
            >
              <option value="">{t('skills.select_category')}</option>
              {skillsStore.availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            
            <Input
              type="textarea"
              value={newSkill.description}
              onChange={(value) => setNewSkill({...newSkill, description: value})}
              placeholder={t('skills.description_placeholder')}
            />
            
            <div className="form-actions">
              <Button
                type="submit"
                disabled={isSubmitting || !newSkill.name.trim()}
              >
                {isSubmitting ? t('common.creating') : t('skills.create')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCreateForm(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      )}
      
      {allowCreate && !showCreateForm && (
        <Button
          variant="secondary"
          onClick={() => setShowCreateForm(true)}
          className="show-create-form-btn"
        >
          + {t('skills.add_new_skill')}
        </Button>
      )}
    </div>
  );
});

export default SkillsPicker;