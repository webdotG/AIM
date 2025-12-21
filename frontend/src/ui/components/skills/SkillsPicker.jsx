import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/layers/language';
import './SkillsPicker.css';

const SkillsPicker = ({ 
  selectedSkills = [], 
  onChange,
  maxSkills = 10,
  onClose,
  mode = 'select' // 'select' или 'progress' для прокачки
}) => {
  const { t } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [experience, setExperience] = useState(mode === 'progress' ? 10 : 50);
  const [customSkillName, setCustomSkillName] = useState('');
  const [currentStep, setCurrentStep] = useState('category');

  const expSteps = mode === 'progress' ? [5, 10, 25, 50, 100] : [5, 25, 50, 75, 90, 99, 100];

  // Ref для очистки URL
  const clearUrlRef = useRef(() => {
    const url = new URL(window.location);
    url.searchParams.delete('skills');
    url.searchParams.delete('skill_progress');
    window.history.replaceState({}, '', url);
  });

  // Передаем функцию очистки наружу
  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновляем URL при изменении навыков или прокачки
  useEffect(() => {
    if (mode === 'progress') {
      // Формат для прокачки: skillId:expGained;skillId:expGained
      if (!Array.isArray(selectedSkills) || selectedSkills.length === 0) {
        const url = new URL(window.location);
        url.searchParams.delete('skill_progress');
        window.history.replaceState({}, '', url);
        return;
      }

      const encoded = selectedSkills.map(skill => {
        const skillId = skill.skill?.id || skill.skillId || 'unknown';
        const expGained = skill.experience_gained || skill.experience || 10;
        return `${skillId}:${expGained}`;
      }).join(';');
      
      const url = new URL(window.location);
      url.searchParams.set('skill_progress', encoded);
      window.history.replaceState({}, '', url);
    } else {
      // Формат для выбора навыков: category:skill:experience:level
      if (!Array.isArray(selectedSkills) || selectedSkills.length === 0) {
        const url = new URL(window.location);
        url.searchParams.delete('skills');
        window.history.replaceState({}, '', url);
        return;
      }

      const encoded = selectedSkills.map(skill => {
        const catCode = skill.category.id.charAt(0); // p, m, s, c, t
        const skillCode = skill.skill?.id?.substring(0, 3) || 'cst';
        const experience = skill.experience || 50;
        const level = skill.level || 1;
        return `${catCode}:${skillCode}:${experience}:${level}`;
      }).join(';');
      
      const url = new URL(window.location);
      url.searchParams.set('skills', encoded);
      window.history.replaceState({}, '', url);
    }
  }, [selectedSkills, mode]);

  // Чтение из URL при открытии
  useEffect(() => {
    if (mode === 'progress') {
      const params = new URLSearchParams(window.location.search);
      const progressParam = params.get('skill_progress');
      
      if (progressParam && (!selectedSkills || selectedSkills.length === 0)) {
        try {
          const progressItems = progressParam.split(';').map(part => {
            const [skillId, expStr] = part.split(':');
            const experience_gained = parseInt(expStr) || 10;
            
            // Это упрощенная версия - в реальности нужно искать навык в БД
            return {
              skill: {
                id: skillId,
                name: skillId.charAt(0).toUpperCase() + skillId.slice(1),
                icon: skillId.substring(0, 2).toUpperCase()
              },
              experience_gained,
              progress_type: 'practice',
              notes: `Прокачал +${experience_gained} XP`
            };
          }).filter(Boolean);
          
          if (progressItems.length > 0) {
            onChange(progressItems);
          }
        } catch (e) {
          console.error('Error parsing skill progress from URL:', e);
        }
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const skillsParam = params.get('skills');
      
      if (skillsParam && (!selectedSkills || selectedSkills.length === 0)) {
        try {
          const skills = skillsParam.split(';').map(part => {
            const [catCode, skillCode, expStr, levelStr] = part.split(':');
            const experience = parseInt(expStr) || 50;
            const level = parseInt(levelStr) || 1;
            
            let categoryId;
            switch(catCode) {
              case 'p': categoryId = 'physical'; break;
              case 'm': categoryId = 'mental'; break;
              case 's': categoryId = 'social'; break;
              case 'c': categoryId = 'creative'; break;
              case 't': categoryId = 'technical'; break;
              default: categoryId = 'general';
            }
            
            const category = {
              id: categoryId,
              label: t(`skills.categories.${categoryId}`) || categoryId,
              icon: categoryId === 'physical' ? 'P' : 
                    categoryId === 'mental' ? 'M' : 
                    categoryId === 'social' ? 'S' : 
                    categoryId === 'creative' ? 'C' : 'T'
            };
            
            let skillId, skillLabel;
            
            if (skillCode === 'cst') {
              skillId = `custom_${Date.now()}`;
              skillLabel = 'Пользовательский навык';
            } else {
              const skillMap = {
                'str': 'strength',
                'end': 'endurance',
                'agi': 'agility',
                'fle': 'flexibility',
                'spe': 'speed',
                'log': 'logic',
                'mem': 'memory',
                'con': 'concentration',
                'ana': 'analysis',
                'lea': 'learning',
                'cha': 'charisma',
                'dip': 'diplomacy',
                'lea': 'leadership',
                'emp': 'empathy',
                'per': 'persuasion',
                'dra': 'drawing',
                'mus': 'music',
                'wri': 'writing',
                'des': 'design',
                'imp': 'improvisation',
                'pro': 'programming',
                'eng': 'engineering',
                'mec': 'mechanics',
                'ele': 'electronics',
                'cra': 'crafting'
              };
              
              skillId = skillMap[skillCode] || 'general';
              skillLabel = t(`skills.${categoryId}.${skillId}`) || skillId;
            }
            
            const skill = {
              id: skillId,
              label: skillLabel,
              icon: skillCode.substring(0, 2).toUpperCase()
            };
            
            return {
              category,
              skill,
              experience,
              level
            };
          }).filter(Boolean);
          
          if (skills.length > 0) {
            onChange(skills);
          }
        } catch (e) {
          console.error('Error parsing skills from URL:', e);
        }
      }
    }
  }, [mode]);

  // Категории навыков
  const categories = [
    { 
      id: 'physical', 
      label: t('skills.categories.physical') || 'Физические',
      icon: 'P',
      description: t('skills.categories.physicalDesc') || 'Сила и выносливость'
    },
    { 
      id: 'mental', 
      label: t('skills.categories.mental') || 'Ментальные',
      icon: 'M',
      description: t('skills.categories.mentalDesc') || 'Интеллект и память'
    },
    { 
      id: 'social', 
      label: t('skills.categories.social') || 'Социальные',
      icon: 'S',
      description: t('skills.categories.socialDesc') || 'Общение и влияние'
    },
    { 
      id: 'creative', 
      label: t('skills.categories.creative') || 'Творческие',
      icon: 'C',
      description: t('skills.categories.creativeDesc') || 'Искусство и креатив'
    },
    { 
      id: 'technical', 
      label: t('skills.categories.technical') || 'Технические',
      icon: 'T',
      description: t('skills.categories.technicalDesc') || 'Технологии и инструменты'
    }
  ];

  // Навыки по категориям
  const allSkills = {
    physical: [
      { id: 'strength', icon: 'ST', label: t('skills.physical.strength') || 'Сила' },
      { id: 'endurance', icon: 'EN', label: t('skills.physical.endurance') || 'Выносливость' },
      { id: 'agility', icon: 'AG', label: t('skills.physical.agility') || 'Ловкость' },
      { id: 'flexibility', icon: 'FL', label: t('skills.physical.flexibility') || 'Гибкость' },
      { id: 'speed', icon: 'SP', label: t('skills.physical.speed') || 'Скорость' }
    ],
    mental: [
      { id: 'logic', icon: 'LG', label: t('skills.mental.logic') || 'Логика' },
      { id: 'memory', icon: 'MM', label: t('skills.mental.memory') || 'Память' },
      { id: 'concentration', icon: 'CN', label: t('skills.mental.concentration') || 'Концентрация' },
      { id: 'analysis', icon: 'AN', label: t('skills.mental.analysis') || 'Анализ' },
      { id: 'learning', icon: 'LN', label: t('skills.mental.learning') || 'Обучаемость' }
    ],
    social: [
      { id: 'charisma', icon: 'CH', label: t('skills.social.charisma') || 'Харизма' },
      { id: 'diplomacy', icon: 'DP', label: t('skills.social.diplomacy') || 'Дипломатия' },
      { id: 'leadership', icon: 'LD', label: t('skills.social.leadership') || 'Лидерство' },
      { id: 'empathy', icon: 'EM', label: t('skills.social.empathy') || 'Эмпатия' },
      { id: 'persuasion', icon: 'PS', label: t('skills.social.persuasion') || 'Убеждение' }
    ],
    creative: [
      { id: 'drawing', icon: 'DR', label: t('skills.creative.drawing') || 'Рисование' },
      { id: 'music', icon: 'MS', label: t('skills.creative.music') || 'Музыка' },
      { id: 'writing', icon: 'WR', label: t('skills.creative.writing') || 'Письмо' },
      { id: 'design', icon: 'DS', label: t('skills.creative.design') || 'Дизайн' },
      { id: 'improvisation', icon: 'IM', label: t('skills.creative.improvisation') || 'Импровизация' }
    ],
    technical: [
      { id: 'programming', icon: 'PR', label: t('skills.technical.programming') || 'Программирование' },
      { id: 'engineering', icon: 'EG', label: t('skills.technical.engineering') || 'Инженерия' },
      { id: 'mechanics', icon: 'MC', label: t('skills.technical.mechanics') || 'Механика' },
      { id: 'electronics', icon: 'EL', label: t('skills.technical.electronics') || 'Электроника' },
      { id: 'crafting', icon: 'CR', label: t('skills.technical.crafting') || 'Ремесло' }
    ]
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep('skill');
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill);
    setCurrentStep(mode === 'progress' ? 'experience' : 'experience');
  };

  const handleBack = () => {
    if (currentStep === 'experience') {
      setCurrentStep('skill');
    } else if (currentStep === 'skill' || currentStep === 'custom') {
      setCurrentStep('category');
      setSelectedSkill(null);
      setCustomSkillName('');
    }
  };

  const handleAddSkill = () => {
    if (!selectedCategory) return;
    
    if (selectedSkills.length >= maxSkills) {
      alert(`Максимум ${maxSkills} ${mode === 'progress' ? 'прокачек' : 'навыков'}`);
      return;
    }

    const skillName = selectedSkill?.label || customSkillName;
    if (!skillName) return;

    if (mode === 'progress') {
      const newProgress = {
        skill: {
          id: selectedSkill?.id || `custom_${Date.now()}`,
          label: skillName,
          icon: selectedSkill?.icon || 'C'
        },
        experience_gained: experience,
        progress_type: 'practice',
        notes: `Прокачал ${skillName} на +${experience} XP`
      };

      onChange([...selectedSkills, newProgress]);
    } else {
      const newSkill = {
        category: {
          id: selectedCategory,
          label: categories.find(c => c.id === selectedCategory).label,
          icon: categories.find(c => c.id === selectedCategory).icon
        },
        skill: {
          id: selectedSkill?.id || `custom_${Date.now()}`,
          label: skillName,
          icon: selectedSkill?.icon || 'C'
        },
        experience: experience,
        level: Math.floor(experience / 10) + 1
      };

      onChange([...selectedSkills, newSkill]);
    }
    
    setSelectedCategory(null);
    setSelectedSkill(null);
    setExperience(mode === 'progress' ? 10 : 50);
    setCustomSkillName('');
    setCurrentStep('category');
  };

  const handleRemove = (index) => {
    const updated = selectedSkills.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
    clearUrlRef.current();
  };

  const handleExpChange = (value) => {
    const closest = expSteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setExperience(closest);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'category':
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">
                {mode === 'progress' ? 'Выберите навык для прокачки' : 'Выберите категорию'}
              </h3>
            </div>
            <div className="categories-grid">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-name">{category.label}</div>
                  <div className="category-description">{category.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'skill':
        const skills = selectedCategory ? allSkills[selectedCategory] : [];
        const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title">
                {mode === 'progress' ? `Прокачка: ${categoryLabel}` : categoryLabel}
              </h3>
            </div>
            
            <div className="emotions-grid">
              {skills.map(skill => (
                <div
                  key={skill.id}
                  className={`emotion-card ${selectedSkill?.id === skill.id ? 'selected' : ''}`}
                  onClick={() => handleSkillSelect(skill)}
                >
                  <div className="emotion-icon">{skill.icon}</div>
                  <div className="emotion-name">{skill.label}</div>
                </div>
              ))}
              
              {mode !== 'progress' && (
                <div
                  className="emotion-card custom-card"
                  onClick={() => setCurrentStep('custom')}
                >
                  <div className="emotion-icon">+</div>
                  <div className="emotion-name">Свой навык</div>
                </div>
              )}
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title">Свой навык</h3>
            </div>
            
            <div className="custom-skill-input">
              <input
                type="text"
                className="location-input"
                placeholder="Название навыка"
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                autoFocus
              />
              
              <button 
                className="add-emotion-button"
                onClick={() => {
                  if (customSkillName.trim()) {
                    setCurrentStep('experience');
                  }
                }}
                disabled={!customSkillName.trim()}
              >
                Продолжить
              </button>
            </div>
          </div>
        );

      case 'experience':
        const skillLabel = selectedSkill?.label || customSkillName;
        const categoryName = categories.find(c => c.id === selectedCategory)?.label || '';
        
        if (mode === 'progress') {
          return (
            <div className="step-content">
              <div className="step-header">
                <button className="back-button" onClick={handleBack}>← Назад</button>
                <h3 className="step-title" style={{padding:"25px"}}>Опыт получен</h3>
              </div>
              
              <div 
                style={{
                  fontSize: '13px',
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'left',
                  margin: '-15px 0 20px 0',
                  padding: '0 25px'
                }}
              >
                {categoryName}: {skillLabel}
              </div>
              
              <div className="intensity-content">
                <div className="intensity-display">
                  <span className="intensity-value">+{experience} XP</span>
                </div>
                
                <div className="intensity-slider-container">
                  <div className="intensity-track-wrapper">
                    <input
                      className="intensity-slider"
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={experience}
                      onChange={(e) => handleExpChange(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="intensity-marks">
                    {expSteps.map(step => (
                      <span 
                        key={step}
                        className={`intensity-mark ${experience === step ? 'active' : ''}`}
                        onClick={() => setExperience(step)}
                      >
                        +{step}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="intensity-actions">
                  <button className="add-emotion-button" onClick={handleAddSkill}>
                    Добавить прокачку
                  </button>
                </div>
              </div>
            </div>
          );
        } else {
          const level = Math.floor(experience / 10) + 1;
          
          return (
            <div className="step-content">
              <div className="step-header">
                <button className="back-button" onClick={handleBack}>← Назад</button>
                <h3 className="step-title" style={{padding:"25px"}}>Опыт</h3>
              </div>
              
              <div 
                style={{
                  fontSize: '13px',
                  color: '#666',
                  fontStyle: 'italic',
                  textAlign: 'left',
                  margin: '-15px 0 20px 0',
                  padding: '0 25px'
                }}
              >
                {categoryName}: {skillLabel} — уровень {level}
              </div>
              
              <div className="intensity-content">
                <div className="intensity-display">
                  <span className="intensity-value">{experience} XP</span>
                </div>
                
                <div className="intensity-slider-container">
                  <div className="intensity-track-wrapper">
                    <input
                      className="intensity-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={experience}
                      onChange={(e) => handleExpChange(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="intensity-marks">
                    {expSteps.map(step => (
                      <span 
                        key={step}
                        className={`intensity-mark ${experience === step ? 'active' : ''}`}
                        onClick={() => setExperience(step)}
                      >
                        {step}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="intensity-actions">
                  <button className="add-emotion-button" onClick={handleAddSkill}>
                    Добавить навык
                  </button>
                </div>
              </div>
            </div>
          );
        }

      default:
        return null;
    }
  };

  const renderSelected = () => {
    if (!Array.isArray(selectedSkills) || selectedSkills.length === 0) return null;
    
    return (
      <div className="selected-emotions">
        <div className="selected-header">
          <span className="selected-count">
            {mode === 'progress' ? 'Прокачано:' : 'Выбрано:'} {selectedSkills.length} / {maxSkills}
          </span>
          <button className="clear-all-button" onClick={handleClearAll}>
            Очистить все
          </button>
        </div>
        
        <div className="selected-list">
          {selectedSkills.map((item, index) => (
            <div key={index} className="selected-emotion-item">
              <div className="selected-emotion-main">
                <span className="selected-emotion-icon">
                  {item.skill?.icon || '?'}
                </span>
                <div className="selected-emotion-info">
                  {mode === 'progress' ? (
                    <>
                      <div className="selected-emotion-subtitle">
                        Прокачка
                      </div>
                      <div className="selected-emotion-name">
                        {item.skill?.label || item.skill?.name}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="selected-emotion-subtitle">
                        {item.category?.label}
                      </div>
                      <div className="selected-emotion-name">
                        {item.skill?.label} — LVL {item.level}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="selected-emotion-controls">
                <span className="selected-intensity-value">
                  {mode === 'progress' ? `+${item.experience_gained || item.experience} XP` : `${item.experience} XP`}
                </span>
                <button
                  className="remove-emotion-button"
                  onClick={() => handleRemove(index)}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="emotion-picker">
      {renderSelected()}
      <div className="emotion-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default SkillsPicker;