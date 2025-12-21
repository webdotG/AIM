import React, { useState } from 'react';
import { useLanguage } from '@/layers/language';
import './EmotionPicker.css';

const EmotionPicker = ({ 
  selectedEmotions = [], 
  onChange,
  maxEmotions = 5
}) => {
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [intensity, setIntensity] = useState(50);

  // Фиксированные значения интенсивности
  const intensitySteps = [5, 25, 50, 75, 90, 99, 100];

  // Категории эмоций
  const categories = [
    { 
      id: 'positive', 
      label: t('emotions.categories.positive'),
      icon: '😊',
      description: t('emotions.picker.positiveDesc')
    },
    { 
      id: 'negative', 
      label: t('emotions.categories.negative'),
      icon: '😢',
      description: t('emotions.picker.negativeDesc')
    },
    { 
      id: 'neutral', 
      label: t('emotions.categories.neutral'),
      icon: '😐',
      description: t('emotions.picker.neutralDesc')
    }
  ];

  // Все 27 эмоций
  const allEmotions = {
    positive: [
      { id: 'admiration', emoji: '😌', label: t('emotions.list.admiration') },
      { id: 'adoration', emoji: '😍', label: t('emotions.list.adoration') },
      { id: 'aesthetic_appreciation', emoji: '🎨', label: t('emotions.list.aesthetic_appreciation') },
      { id: 'amusement', emoji: '😄', label: t('emotions.list.amusement') },
      { id: 'calmness', emoji: '😌', label: t('emotions.list.calmness') },
      { id: 'excitement', emoji: '🎉', label: t('emotions.list.excitement') },
      { id: 'joy', emoji: '😊', label: t('emotions.list.joy') },
      { id: 'relief', emoji: '😌', label: t('emotions.list.relief') },
      { id: 'romance', emoji: '💕', label: t('emotions.list.romance') },
      { id: 'satisfaction', emoji: '😌', label: t('emotions.list.satisfaction') }
    ],
    negative: [
      { id: 'anger', emoji: '😠', label: t('emotions.list.anger') },
      { id: 'anxiety', emoji: '😰', label: t('emotions.list.anxiety') },
      { id: 'awkwardness', emoji: '😅', label: t('emotions.list.awkwardness') },
      { id: 'boredom', emoji: '😐', label: t('emotions.list.boredom') },
      { id: 'confusion', emoji: '😕', label: t('emotions.list.confusion') },
      { id: 'disgust', emoji: '🤢', label: t('emotions.list.disgust') },
      { id: 'empathic_pain', emoji: '💔', label: t('emotions.list.empathic_pain') },
      { id: 'fear', emoji: '😨', label: t('emotions.list.fear') },
      { id: 'horror', emoji: '😱', label: t('emotions.list.horror') },
      { id: 'sadness', emoji: '😢', label: t('emotions.list.sadness') }
    ],
    neutral: [
      { id: 'awe', emoji: '😲', label: t('emotions.list.awe') },
      { id: 'craving', emoji: '🤤', label: t('emotions.list.craving') },
      { id: 'entrancement', emoji: '😮', label: t('emotions.list.entrancement') },
      { id: 'interest', emoji: '🧐', label: t('emotions.list.interest') },
      { id: 'nostalgia', emoji: '📜', label: t('emotions.list.nostalgia') },
      { id: 'sexual_desire', emoji: '😘', label: t('emotions.list.sexual_desire') },
      { id: 'surprise', emoji: '😮', label: t('emotions.list.surprise') }
    ]
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    // При выборе новой категории сбрасываем конкретную эмоцию
    setSelectedEmotion(null);
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
  };

  const handleAddEmotion = () => {
    if (!selectedCategory) {
      alert(t('emotions.picker.selectCategoryFirst') || 'Сначала выберите категорию');
      return;
    }

    if (selectedEmotions.length >= maxEmotions) {
      alert(t('emotions.picker.maxEmotions', { max: maxEmotions }));
      return;
    }

    const categoryData = categories.find(c => c.id === selectedCategory);
    
    const newEmotion = {
      category: {
        id: selectedCategory,
        label: categoryData.label,
        icon: categoryData.icon
      },
      emotion: selectedEmotion ? {
        id: selectedEmotion.id,
        label: selectedEmotion.label,
        emoji: selectedEmotion.emoji
      } : null,
      intensity: intensity
    };

    onChange([...selectedEmotions, newEmotion]);
    
    // Сбрасываем выбор
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setIntensity(50);
    setActiveTab('category');
  };

  const handleRemoveEmotion = (index) => {
    const updatedEmotions = selectedEmotions.filter((_, i) => i !== index);
    onChange(updatedEmotions);
  };

  const handleIntensityChangeForSelected = (index, newIntensity) => {
    // Находим ближайшее фиксированное значение
    const closest = intensitySteps.reduce((prev, curr) => {
      return Math.abs(curr - newIntensity) < Math.abs(prev - newIntensity) ? curr : prev;
    });
    
    const updatedEmotions = [...selectedEmotions];
    updatedEmotions[index] = {
      ...updatedEmotions[index],
      intensity: closest
    };
    onChange(updatedEmotions);
  };

  const getIntensityColor = (intensity) => {
    if (intensity <= 33) return '#3b82f6'; // blue
    if (intensity <= 66) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getIntensityLabel = (intensity) => {
    if (intensity <= 33) return t('emotions.intensityLevels.low') || 'Низкая';
    if (intensity <= 66) return t('emotions.intensityLevels.medium') || 'Средняя';
    return t('emotions.intensityLevels.high') || 'Высокая';
  };

  const handleIntensityClick = (value) => {
    setIntensity(value);
  };

  const handleSliderChange = (value) => {
    // Находим ближайшее фиксированное значение
    const closest = intensitySteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setIntensity(closest);
  };

  const renderCategories = () => (
    <div className="categories-grid">
      {categories.map(category => (
        <div
          key={category.id}
          className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
          data-category={category.id}
          onClick={() => handleCategorySelect(category.id)}
        >
          <div className="category-icon">{category.icon}</div>
          <div className="category-name">{category.label}</div>
          <div className="category-description">{category.description}</div>
        </div>
      ))}
    </div>
  );

  const renderEmotions = () => {
    if (!selectedCategory) {
      return (
        <div className="empty-state">
          <p>{t('emotions.picker.selectCategoryFirst') || 'Сначала выберите категорию эмоции'}</p>
        </div>
      );
    }

    const emotions = allEmotions[selectedCategory] || [];

    return (
      <div className="emotions-grid">
        {emotions.map(emotion => {
          const isSelected = selectedEmotion?.id === emotion.id;
          return (
            <div
              key={emotion.id}
              className={`emotion-card ${isSelected ? 'selected' : ''}`}
              onClick={() => handleEmotionSelect(emotion)}
            >
              <div className="emotion-emoji">{emotion.emoji}</div>
              <div className="emotion-name">{emotion.label}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderIntensityPicker = () => {
    const isDisabled = !selectedCategory;
    
    return (
      <div className={`intensity-section ${isDisabled ? 'disabled' : ''}`}>
        <h3 className="intensity-title">
          {t('emotions.picker.setIntensity') || 'Интенсивность'}
        </h3>
        
        {isDisabled && (
          <p className="intensity-warning">
            {t('emotions.picker.selectCategoryFirst') || 'Сначала выберите категорию'}
          </p>
        )}
        
        <div className="intensity-display">
          <span className="intensity-value" style={{ color: getIntensityColor(intensity) }}>
            {intensity}%
          </span>
          <span className="intensity-label-text">
            {getIntensityLabel(intensity)}
          </span>
        </div>
        
        <div className="intensity-slider-container">
          <div className="intensity-track" onClick={(e) => {
            if (isDisabled) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            handleSliderChange(percent);
          }}>
            <input
              className="intensity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={intensity}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              disabled={isDisabled}
              style={{
                '--slider-color': getIntensityColor(intensity),
                '--slider-percent': `${intensity}%`
              }}
            />
          </div>
          
          <div className="intensity-marks">
            {intensitySteps.map(step => (
              <span 
                key={step}
                className={`intensity-mark ${intensity === step ? 'active' : ''}`}
                onClick={() => !isDisabled && handleIntensityClick(step)}
              >
                {step}%
              </span>
            ))}
          </div>
        </div>
        
        <button
          className="add-emotion-button"
          onClick={handleAddEmotion}
          disabled={!selectedCategory}
        >
          {t('emotions.picker.addEmotion') || 'Добавить эмоцию'}
        </button>
      </div>
    );
  };

  const renderSelectedEmotions = () => {
    if (selectedEmotions.length === 0) return null;
    
    return (
      <div className="selected-emotions">
        <div className="selected-header">
          <span className="selected-count">
            {t('emotions.picker.selected') || 'Выбрано'}: {selectedEmotions.length} / {maxEmotions}
          </span>
          <button
            className="clear-all-button"
            onClick={() => onChange([])}
          >
            {t('common.clearAll') || 'Очистить все'}
          </button>
        </div>
        
        <div className="selected-list">
          {selectedEmotions.map((item, index) => (
            <div key={index} className="selected-emotion-item">
              <div className="selected-emotion-main">
                <span className="selected-emotion-icon">
                  {item.emotion ? item.emotion.emoji : item.category.icon}
                </span>
                <div className="selected-emotion-info">
                  <div className="selected-emotion-name">
                    {item.emotion ? item.emotion.label : item.category.label}
                  </div>
                  <div className="selected-emotion-subtitle">
                    {item.emotion && (
                      <span className="emotion-category-badge">
                        {item.category.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="selected-emotion-controls">
                <div className="selected-intensity-wrapper">
                  <div className="selected-intensity-controls-row">
                    <div className="selected-intensity-slider-track" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = ((e.clientX - rect.left) / rect.width) * 100;
                      handleIntensityChangeForSelected(index, percent);
                    }}>
                      <input
                        className="selected-intensity-slider"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={item.intensity}
                        onChange={(e) => handleIntensityChangeForSelected(index, parseInt(e.target.value))}
                        style={{
                          '--slider-color': getIntensityColor(item.intensity),
                          '--slider-percent': `${item.intensity}%`
                        }}
                      />
                    </div>
                    <span 
                      className="selected-intensity-value"
                      style={{ color: getIntensityColor(item.intensity) }}
                    >
                      {item.intensity}%
                    </span>
                  </div>
                  <div className="selected-intensity-marks">
                    {intensitySteps.map(step => (
                      <span
                        key={step}
                        className={`selected-intensity-mark ${item.intensity === step ? 'active' : ''}`}
                        onClick={() => handleIntensityChangeForSelected(index, step)}
                        style={item.intensity === step ? {
                          '--slider-color': getIntensityColor(item.intensity)
                        } : {}}
                        title={`${step}%`}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  className="remove-emotion-button"
                  onClick={() => handleRemoveEmotion(index)}
                  title={t('common.remove') || 'Удалить'}
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
      {renderSelectedEmotions()}
      
      <div className="emotion-tabs">
        <button
          className={`emotion-tab ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          {t('emotions.picker.categories') || 'Категории'}
        </button>
        <button
          className={`emotion-tab ${activeTab === 'emotion' ? 'active' : ''}`}
          onClick={() => setActiveTab('emotion')}
        >
          {t('emotions.picker.emotions') || 'Эмоции'}
        </button>
        <button
          className={`emotion-tab ${activeTab === 'intensity' ? 'active' : ''}`}
          onClick={() => setActiveTab('intensity')}
        >
          {t('emotions.picker.intensity') || 'Интенсивность'}
        </button>
      </div>
      
      <div className="emotion-content">
        {activeTab === 'category' && renderCategories()}
        {activeTab === 'emotion' && renderEmotions()}
        {activeTab === 'intensity' && renderIntensityPicker()}
      </div>
    </div>
  );
};

export default EmotionPicker;