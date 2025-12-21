import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/layers/language';
import './EmotionPicker.css';

const EmotionPicker = ({ 
  selectedEmotions = [], 
  onChange,
  maxEmotions = 5,
  onClose,
  clearUrl // Этот пропс будет вызываться извне для очистки URL
}) => {
  const { t } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [currentStep, setCurrentStep] = useState('category');

  const intensitySteps = [5, 25, 50, 75, 90, 99, 100];

  // Создаем ref для функции очистки URL, чтобы можно было вызывать извне
  const clearUrlRef = useRef(() => {
    const url = new URL(window.location);
    url.searchParams.delete('emo');
    window.history.replaceState({}, '', url);
  });

  // Передаем функцию наружу через onClose
  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновляем URL при изменении эмоций
  useEffect(() => {
    if (!Array.isArray(selectedEmotions)) return;
    
    if (selectedEmotions.length === 0) {
      clearUrlRef.current();
      return;
    }

    // Формат: +joy75;-ang50
    const encoded = selectedEmotions.map(em => {
      const catCode = em.category.id === 'positive' ? '+' : 
                     em.category.id === 'negative' ? '-' : '0';
      const emotionCode = em.emotion?.id?.substring(0, 2) || 'gn';
      return `${catCode}${emotionCode}${em.intensity}`;
    }).join(';');
    
    const url = new URL(window.location);
    url.searchParams.set('emo', encoded);
    window.history.replaceState({}, '', url);
  }, [selectedEmotions]);

  // Чтение из URL при открытии
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emoParam = params.get('emo');
    
    if (emoParam && (!selectedEmotions || selectedEmotions.length === 0)) {
      try {
        const emotions = emoParam.split(';').map(part => {
          const catCode = part[0];
          const emotionCode = part.substring(1, 3);
          const intensity = parseInt(part.substring(3)) || 50;
          
          let categoryId;
          switch(catCode) {
            case '+': categoryId = 'positive'; break;
            case '-': categoryId = 'negative'; break;
            case '0': categoryId = 'neutral'; break;
            default: return null;
          }
          
          // Просто создаем базовый объект
          const category = {
            id: categoryId,
            label: t(`emotions.categories.${categoryId}`),
            icon: categoryId === 'positive' ? '⊕' : categoryId === 'negative' ? '⊖' : '⊙'
          };
          
          return {
            category,
            emotion: emotionCode !== 'gn' ? { id: 'emotion', label: 'Эмоция', icon: 'E' } : null,
            intensity
          };
        }).filter(Boolean);
        
        if (emotions.length > 0) {
          onChange(emotions);
        }
      } catch (e) {
        console.error('Error parsing emotions from URL:', e);
      }
    }
  }, []);

  // Если передали clearUrl извне - вызываем
  useEffect(() => {
    if (clearUrl) {
      clearUrlRef.current();
    }
  }, [clearUrl]);

  // Остальной код без изменений...
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep('emotion');
  };

  const handleEmotionSelect = (emotion) => {
    setSelectedEmotion(emotion);
    setCurrentStep('intensity');
  };

  const handleBack = () => {
    if (currentStep === 'intensity') {
      setCurrentStep('emotion');
    } else if (currentStep === 'emotion') {
      setCurrentStep('category');
      setSelectedEmotion(null);
    }
  };

  const handleAddEmotion = () => {
    if (!selectedCategory) return;
    
    if (selectedEmotions.length >= maxEmotions) {
      alert(`Максимум ${maxEmotions} эмоций`);
      return;
    }

    const newEmotion = {
      category: {
        id: selectedCategory,
        label: t(`emotions.categories.${selectedCategory}`),
        icon: selectedCategory === 'positive' ? '⊕' : 
              selectedCategory === 'negative' ? '⊖' : '⊙'
      },
      emotion: selectedEmotion ? {
        id: selectedEmotion.id,
        label: selectedEmotion.label,
        icon: selectedEmotion.icon
      } : null,
      intensity: intensity
    };

    const updated = Array.isArray(selectedEmotions) ? [...selectedEmotions, newEmotion] : [newEmotion];
    onChange(updated);
    
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setIntensity(50);
    setCurrentStep('category');
  };

  const handleRemoveEmotion = (index) => {
    if (!Array.isArray(selectedEmotions)) return;
    const updated = selectedEmotions.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
    clearUrlRef.current(); // Очищаем URL
  };

  const handleSliderChange = (value) => {
    const closest = intensitySteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setIntensity(closest);
  };

  const removeEmotionFromUrl = (indexToRemove) => {
  if (!selectedEmotions || !Array.isArray(selectedEmotions)) return;
  
  const updated = selectedEmotions.filter((_, i) => i !== indexToRemove);
  updateURL(updated); // Обновляем URL без удаленной эмоции
};

  // Категории для рендеринга
  const categories = [
    { id: 'positive', label: t('emotions.categories.positive'), icon: '⊕', description: t('emotions.picker.positiveDesc') },
    { id: 'negative', label: t('emotions.categories.negative'), icon: '⊖', description: t('emotions.picker.negativeDesc') },
    { id: 'neutral', label: t('emotions.categories.neutral'), icon: '⊙', description: t('emotions.picker.neutralDesc') }
  ];

  // Эмоции для рендеринга
  const allEmotions = {
    positive: [
      { id: 'admiration', icon: 'A', label: t('emotions.list.admiration') },
      { id: 'adoration', icon: 'AD', label: t('emotions.list.adoration') },
      { id: 'aesthetic_appreciation', icon: 'Æ', label: t('emotions.list.aesthetic_appreciation') },
      { id: 'amusement', icon: 'AM', label: t('emotions.list.amusement') },
      { id: 'calmness', icon: 'C', label: t('emotions.list.calmness') },
      { id: 'excitement', icon: 'EX', label: t('emotions.list.excitement') },
      { id: 'joy', icon: 'J', label: t('emotions.list.joy') },
      { id: 'relief', icon: 'R', label: t('emotions.list.relief') },
      { id: 'romance', icon: 'RM', label: t('emotions.list.romance') },
      { id: 'satisfaction', icon: 'S', label: t('emotions.list.satisfaction') }
    ],
    negative: [
      { id: 'anger', icon: 'AN', label: t('emotions.list.anger') },
      { id: 'anxiety', icon: 'AX', label: t('emotions.list.anxiety') },
      { id: 'awkwardness', icon: 'AW', label: t('emotions.list.awkwardness') },
      { id: 'boredom', icon: 'B', label: t('emotions.list.boredom') },
      { id: 'confusion', icon: 'CF', label: t('emotions.list.confusion') },
      { id: 'disgust', icon: 'D', label: t('emotions.list.disgust') },
      { id: 'empathic_pain', icon: 'EP', label: t('emotions.list.empathic_pain') },
      { id: 'fear', icon: 'F', label: t('emotions.list.fear') },
      { id: 'horror', icon: 'H', label: t('emotions.list.horror') },
      { id: 'sadness', icon: 'SD', label: t('emotions.list.sadness') }
    ],
    neutral: [
      { id: 'awe', icon: 'AW', label: t('emotions.list.awe') },
      { id: 'craving', icon: 'CR', label: t('emotions.list.craving') },
      { id: 'entrancement', icon: 'EN', label: t('emotions.list.entrancement') },
      { id: 'interest', icon: 'I', label: t('emotions.list.interest') },
      { id: 'nostalgia', icon: 'N', label: t('emotions.list.nostalgia') },
      { id: 'sexual_desire', icon: 'SX', label: t('emotions.list.sexual_desire') },
      { id: 'surprise', icon: 'SP', label: t('emotions.list.surprise') }
    ]
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'category':
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">Выберите категорию</h3>
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

      case 'emotion':
        const emotions = selectedCategory ? allEmotions[selectedCategory] : [];
        const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title">{categoryLabel}: Выберите эмоцию</h3>
            </div>
            
            {emotions.length === 0 ? (
              <div className="empty-state"><p>Нет доступных эмоций</p></div>
            ) : (
              <div className="emotions-grid">
                {emotions.map(emotion => {
                  const isSelected = selectedEmotion?.id === emotion.id;
                  return (
                    <div
                      key={emotion.id}
                      className={`emotion-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleEmotionSelect(emotion)}
                    >
                      <div className="emotion-icon">{emotion.icon}</div>
                      <div className="emotion-name">{emotion.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );


case 'intensity':
  const selectedEmotionName = selectedEmotion?.label || t('emotions.picker.general');
  const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.label || '';

  return (
    <div className="step-content">
      <div className="step-header">
        <button className="back-button" onClick={handleBack}>← Назад</button>
        <h3 className="step-title" style={{padding:"25px"}}>
          Интенсивность
        </h3>
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
        {selectedCategoryName}: {selectedEmotionName}
      </div>
      
      <div className="intensity-content">
        <div className="intensity-display">
          <span className="intensity-value">{intensity}%</span>
        </div>
        
        <div className="intensity-slider-container">
          <div className="intensity-track-wrapper">
            <div className="intensity-track-fill" style={{ width: `${intensity}%` }} />
            <input
              className="intensity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={intensity}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            />
          </div>
          
          <div className="intensity-marks">
            {intensitySteps.map(step => (
              <span 
                key={step}
                className={`intensity-mark ${intensity === step ? 'active' : ''}`}
                onClick={() => setIntensity(step)}
              >
                {step}%
              </span>
            ))}
          </div>
        </div>
        
        <div className="intensity-actions">
          <button className="add-emotion-button" onClick={handleAddEmotion}>
            Добавить эмоцию
          </button>
        </div>
      </div>
    </div>
  );

      default:
        return null;
    }
  };

  const renderSelectedEmotions = () => {
    if (!Array.isArray(selectedEmotions) || selectedEmotions.length === 0) return null;
    
    return (
      <div className="selected-emotions">
        <div className="selected-header">
          <span className="selected-count">
            Выбрано: {selectedEmotions.length} / {maxEmotions}
          </span>
          <button className="clear-all-button" onClick={handleClearAll}>
            Очистить все
          </button>
        </div>
        
        <div className="selected-list">
          {selectedEmotions.map((item, index) => (
            <div key={index} className="selected-emotion-item">
              <div className="selected-emotion-main">
                <span className="selected-emotion-icon">
                  {item.emotion?.icon || item.category?.icon || '?'}
                </span>
                <div className="selected-emotion-info">
                  <div className="selected-emotion-subtitle">
                    {item.category?.label || 'Без категории'}
                  </div>
                  <div className="selected-emotion-name">
                    {item.emotion?.label || item.category?.label || 'Эмоция'}
                  </div>
                </div>
              </div>
              
              <div className="selected-emotion-controls">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.intensity || 50}
                  onChange={(e) => {
                    const updated = [...selectedEmotions];
                    updated[index].intensity = parseInt(e.target.value);
                    onChange(updated);
                  }}
                  className="selected-intensity-slider"
                />
                <span className="selected-intensity-value">
                  {item.intensity || 50}%
                </span>
                <button
                  className="remove-emotion-button"
                  onClick={() => handleRemoveEmotion(index)}
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
      <div className="emotion-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default EmotionPicker;