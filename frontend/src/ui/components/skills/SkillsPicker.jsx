// SkillsPicker.jsx - основа
import React, { useState, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useSkillsStore } from '@/store';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import Loader from '../common/Loader/Loader';
import './SkillsPicker.css';

const SkillsPicker = observer(({
  selectedSkillIds = [],
  onChange,
  maxSkills = 10,
  mode = 'default',
  allowCreate = true,
  compactView = false
}) => {
  const { t } = useLanguage();
  const skillsStore = useSkillsStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category_id: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Инициализация
  useEffect(() => {
    const init = async () => {
      await skillsStore.fetchSkills();
      await skillsStore.fetchCategories();
      if (skillsStore.totalSelected === 0) {
        skillsStore.setSelection(selectedSkillIds);
      }
    };
    init();
  }, []);
  
  // Синхронизация
  useEffect(() => {
    onChange(Array.from(skillsStore.selectedSkillIds));
  }, [skillsStore.selectedSkillIds]);
  
  // Фильтрация
  const filteredSkills = useMemo(() => {
    let skills = skillsStore.filteredSkills;
    
    if (searchQuery.trim()) {
      skills = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return skills;
  }, [skillsStore.filteredSkills, searchQuery]);
  
  // Обработчики
  const handleSkillToggle = (skillId) => {
    if (skillsStore.isSkillSelected(skillId)) {
      skillsStore.removeSkillFromSelection(skillId);
    } else {
      if (!skillsStore.canAddMore(maxSkills)) {
        alert(t('skills.max_reached', { max: maxSkills }));
        return;
      }
      skillsStore.addSkillToSelection(skillId);
    }
  };
  
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    
    if (!newSkill.name.trim()) {
      alert(t('skills.name_required'));
      return;
    }
    
    setIsSubmitting(true);
    try {
      const createdSkill = await skillsStore.createSkill(newSkill);
      
      // Автоматически добавляем
      if (skillsStore.canAddMore(maxSkills)) {
        skillsStore.addSkillToSelection(createdSkill.id);
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
  };
  
  const handleClearAll = () => {
    skillsStore.clearSelection();
  };
  
  // Рендер в зависимости от режима
  if (compactView) {
    return (
      <div className="skills-picker-compact">
        {/* Компактная версия */}
        <div className="compact-skills-list">
          {skillsStore.selectedSkills.map(skill => (
            <div key={skill.id} className="selected-skill-tag">
              {skill.name}
              <button onClick={() => handleSkillToggle(skill.id)}>×</button>
            </div>
          ))}
        </div>
        <Button 
          size="small"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? t('common.cancel') : t('skills.add_new')}
        </Button>
      </div>
    );
  }
  
  // Полная версия
  return (
    <div className="skills-picker">
      {/* Заголовок и статистика */}
      <div className="skills-header">
        <h3 className="skills-title">{t('skills.picker')}</h3>
        <div className="skills-stats">
          <span className="selected-count">
            {t('skills.selected')}: {skillsStore.totalSelected} / {maxSkills}
          </span>
          {skillsStore.totalSelected > 0 && (
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
              const isSelected = skillsStore.isSkillSelected(skill.id);
              const category = skillsStore.availableCategories.find(c => c.id === skill.category_id);
              
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
                      {t('skills.level')}: {skillsStore.getSkillLevel(skill.id)}
                    </span>
                  </div>
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