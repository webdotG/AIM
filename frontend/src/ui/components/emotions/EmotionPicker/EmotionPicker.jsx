// ~/aProject/AIM/frontend/src/ui/components/emotions/EmotionPicker/EmotionPicker.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEmotionsStore } from '@/store/StoreContext';
import './EmotionPicker.css';

const EmotionPicker = observer(({ 
  // Режим 1: Автономный (для переиспользования)
  selectedEmotions = [], 
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'emotions',
  
  // Общие пропсы
  maxEmotions = 5
}) => {
  const { t } = useLanguage();
  const emotionsStore = useEmotionsStore();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentSelection = isDraftMode 
    ? draftStore.currentDraft[draftField] || []
    : selectedEmotions || [];
  
  // Локальное состояние UI
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [currentStep, setCurrentStep] = useState('category');

  const intensitySteps = [5, 25, 50, 75, 90, 99, 100];

  // Синхронизация при изменении пропсов
  useEffect(() => {
    if (!isDraftMode) {
      // Сбрасываем UI состояние если изменились пропсы
      setSelectedCategory(null);
      setSelectedEmotion(null);
      setIntensity(50);
      setCurrentStep('category');
    }
  }, [isDraftMode, selectedEmotions]);

  // Обработчик обновления выбора
  const handleChange = useCallback((newEmotions) => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: newEmotions });
    } else {
      onChange?.(newEmotions);
    }
  }, [isDraftMode, draftStore, draftField, onChange]);

  // Категории для рендеринга
  const categories = useCallback(() => [
    { id: 'positive', label: t('emotions.categories.positive'), icon: '⊕', description: t('emotions.picker.positiveDesc') },
    { id: 'negative', label: t('emotions.categories.negative'), icon: '⊖', description: t('emotions.picker.negativeDesc') },
    { id: 'neutral', label: t('emotions.categories.neutral'), icon: '⊙', description: t('emotions.picker.neutralDesc') }
  ], [t]);

  // Получаем эмоции из стора
  const allEmotions = useCallback(() => {
    if (!emotionsStore.emotionsCatalog || emotionsStore.emotionsCatalog.length === 0) {
      return {
        positive: [],
        negative: [],
        neutral: []
      };
    }
    
    // Группируем эмоции по категориям из API
    const grouped = {
      positive: [],
      negative: [],
      neutral: []
    };
    
    emotionsStore.emotionsCatalog.forEach(emotion => {
      if (grouped[emotion.category]) {
        grouped[emotion.category].push({
          id: emotion.id,
          icon: emotionsStore.getEmotionIcon(emotion.name_en),
          label: emotion.name_ru || emotion.name_en,
          name_en: emotion.name_en
        });
      }
    });
    
    return grouped;
  }, [emotionsStore]);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep('emotion');
  }, []);

  const handleEmotionSelect = useCallback((emotion) => {
    setSelectedEmotion(emotion);
    setCurrentStep('intensity');
  }, []);

  const handleBack = useCallback(() => {
    if (currentStep === 'intensity') {
      setCurrentStep('emotion');
    } else if (currentStep === 'emotion') {
      setCurrentStep('category');
      setSelectedEmotion(null);
    }
  }, [currentStep]);

  const handleAddEmotion = useCallback(() => {
    if (!selectedCategory) return;
    
    if (currentSelection.length >= maxEmotions) {
      alert(`Максимум ${maxEmotions} эмоций`);
      return;
    }

    const category = categories().find(c => c.id === selectedCategory);
    
    const newEmotion = {
      category: {
        id: selectedCategory,
        label: category?.label,
        icon: category?.icon
      },
      emotion: selectedEmotion ? {
        id: selectedEmotion.id,
        name_en: selectedEmotion.name_en,
        label: selectedEmotion.label,
        icon: selectedEmotion.icon
      } : null,
      intensity: intensity
    };

    const newSelection = [...currentSelection, newEmotion];
    handleChange(newSelection);
    
    setSelectedCategory(null);
    setSelectedEmotion(null);
    setIntensity(50);
    setCurrentStep('category');
  }, [selectedCategory, selectedEmotion, currentSelection, maxEmotions, intensity, categories, handleChange]);

  const handleRemoveEmotion = useCallback((index) => {
    const newSelection = currentSelection.filter((_, i) => i !== index);
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  const handleClearAll = useCallback(() => {
    handleChange([]);
  }, [handleChange]);

  const handleSliderChange = useCallback((value) => {
    const closest = intensitySteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setIntensity(closest);
  }, [intensitySteps]);

  const handleUpdateIntensity = useCallback((index, newIntensity) => {
    const newSelection = currentSelection.map((item, i) => 
      i === index ? { ...item, intensity: newIntensity } : item
    );
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  const renderCurrentStep = () => {
    // Если данные еще не загружены
    if (emotionsStore.isLoadingCatalog) {
      return (
        <div className="step-content loading">
          <p>{t('emotions.picker.loading')}</p>
        </div>
      );
    }

    switch (currentStep) {
      case 'category':
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">{t('emotions.picker.selectCategory')}</h3>

            </div>
            <div className="categories-grid">
              {categories().map(category => (
                <div
                  key={category.id}
                  className={`category-card ${selectedCategory === category.id ? 'selected' : ''}`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <div className="category-name">{category.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'emotion':
        const emotions = selectedCategory ? allEmotions()[selectedCategory] : [];
        const categoryLabel = categories().find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                {t('emotions.picker.back')}
              </button>

              <h3 className="step-title">{categoryLabel}: {t('emotions.picker.selectEmotion')}</h3>
            </div>
            
            {emotions.length === 0 ? (
             <div className="empty-state"><p>{t('emotions.picker.noEmotions')}</p></div>
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
        const selectedCategoryName = categories().find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                {t('emotions.picker.back')}
              </button>
              <h3 className="step-title" style={{padding:"25px"}}>
                {t('emotions.picker.intensity')}
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
                  {t('emotions.picker.addEmotion')}
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
    if (!Array.isArray(currentSelection) || currentSelection.length === 0) return null;
    
    return (
      <div className="selected-emotions">
        <div className="selected-header">
          <span className="selected-count">
            {t('emotions.picker.selectedCount', {
              current: currentSelection.length,
              max: maxEmotions
            })}
          </span>

          <button className="clear-all-button" onClick={handleClearAll}>
            {t('emotions.picker.clearAll')}
          </button>
        </div>
        
        <div className="selected-list">
          {currentSelection.map((item, index) => (
            <div key={index} className="selected-emotion-item">
              <div className="selected-emotion-main">
                <span className="selected-emotion-icon">
                  {item.emotion?.icon || item.category?.icon || '?'}
                </span>
                <div className="selected-emotion-info">
                  <div className="selected-emotion-subtitle">
                    {item.category?.label || t('emotions.picker.noCategory')}
                  </div>
                  <div className="selected-emotion-name">
                   {item.emotion?.label || item.category?.label || t('emotions.picker.emotion')}
                  </div>
                </div>
              </div>
              
              <div className="selected-emotion-controls">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={item.intensity || 50}
                  onChange={(e) => handleUpdateIntensity(index, parseInt(e.target.value))}
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
});

export default EmotionPicker;