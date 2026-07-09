// ~/aProject/AIM/frontend/src/ui/components/circumstances/CircumstancesPicker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import './CircumstancesPicker.css';

const CircumstancesPicker = observer(({ 
  // Режим 1: Автономный (для переиспользования)
  selectedCircumstances = [], 
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'circumstances',
  
  // Общие пропсы
  maxCircumstances = 5
}) => {
  const { t } = useLanguage();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentSelection = isDraftMode 
    ? draftStore.currentDraft[draftField] || []
    : selectedCircumstances || [];
  
  // Локальное состояние UI
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [temperature, setTemperature] = useState(20);
  const [currentStep, setCurrentStep] = useState('category');

  const intensitySteps = [5, 25, 50, 75, 90, 99, 100];

  // Синхронизация при изменении пропсов
  useEffect(() => {
    if (!isDraftMode) {
      // Сбрасываем UI состояние если изменились пропсы
      setSelectedCategory(null);
      setSelectedItem(null);
      setIntensity(50);
      setTemperature(20);
      setCurrentStep('category');
    }
  }, [isDraftMode, selectedCircumstances]);

  // Обработчик обновления выбора
  const handleChange = useCallback((newCircumstances) => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: newCircumstances });
    } else {
      onChange?.(newCircumstances);
    }
  }, [isDraftMode, draftStore, draftField, onChange]);

  // Категории обстоятельств
  const categories = useCallback(() => [
    { 
      id: 'weather', 
      label: t('circumstances.categories.weather') || 'Погода',
      icon: 'W',
      description: t('circumstances.categories.weatherDesc') || 'Погодные условия'
    },
    { 
      id: 'moon', 
      label: t('circumstances.categories.moon') || 'Луна',
      icon: 'M',
      description: t('circumstances.categories.moonDesc') || 'Фаза луны'
    },
    { 
      id: 'events', 
      label: t('circumstances.categories.events') || 'События',
      icon: 'E',
      description: t('circumstances.categories.eventsDesc') || 'Глобальные события'
    }
  ], [t]);

  // Обстоятельства по категориям
  const allItems = useCallback(() => ({
    weather: [
      { id: 'sunny', icon: 'S', label: t('circumstances.weather.sunny') || 'Солнечно' },
      { id: 'rainy', icon: 'R', label: t('circumstances.weather.rainy') || 'Дождь' },
      { id: 'snowy', icon: 'S', label: t('circumstances.weather.snowy') || 'Снег' },
      { id: 'stormy', icon: 'T', label: t('circumstances.weather.stormy') || 'Гроза' },
      { id: 'cloudy', icon: 'C', label: t('circumstances.weather.cloudy') || 'Облачно' },
      { id: 'foggy', icon: 'F', label: t('circumstances.weather.foggy') || 'Туман' },
      { id: 'windy', icon: 'W', label: t('circumstances.weather.windy') || 'Ветрено' }
    ],
    moon: [
      { id: 'new_moon', icon: 'N', label: t('circumstances.moon.new') || 'Новолуние' },
      { id: 'first_quarter', icon: 'F', label: t('circumstances.moon.first') || 'Первая четверть' },
      { id: 'full_moon', icon: 'F', label: t('circumstances.moon.full') || 'Полнолуние' },
      { id: 'last_quarter', icon: 'L', label: t('circumstances.moon.last') || 'Последняя четверть' }
    ],
    events: [
      { id: 'war', icon: 'W', label: t('circumstances.events.war') || 'Война' },
      { id: 'pandemic', icon: 'P', label: t('circumstances.events.pandemic') || 'Пандемия' },
      { id: 'election', icon: 'E', label: t('circumstances.events.election') || 'Выборы' },
      { id: 'crisis', icon: 'C', label: t('circumstances.events.crisis') || 'Кризис' },
      { id: 'earthquake', icon: 'Q', label: t('circumstances.events.earthquake') || 'Землетрясение' },
      { id: 'holiday', icon: 'H', label: t('circumstances.events.holiday') || 'Праздник' }
    ]
  }), [t]);

  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep('item');
  }, []);

  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
    if (selectedCategory === 'weather') {
      setCurrentStep('temperature');
    } else {
      setCurrentStep('intensity');
    }
  }, [selectedCategory]);

  const handleBack = useCallback(() => {
    if (currentStep === 'intensity' || currentStep === 'temperature') {
      setCurrentStep('item');
    } else if (currentStep === 'item') {
      setCurrentStep('category');
      setSelectedItem(null);
    }
  }, [currentStep]);

  const handleAdd = useCallback(() => {
    if (!selectedCategory) return;
    
    if (currentSelection.length >= maxCircumstances) {
      alert(`Максимум ${maxCircumstances} обстоятельств`);
      return;
    }

    const category = categories().find(c => c.id === selectedCategory);
    
    const newItem = {
      category: {
        id: selectedCategory,
        label: category?.label,
        icon: category?.icon
      },
      item: selectedItem ? {
        id: selectedItem.id,
        label: selectedItem.label,
        icon: selectedItem.icon
      } : null,
      intensity: selectedCategory === 'weather' ? temperature : intensity,
      isTemperature: selectedCategory === 'weather'
    };

    const newSelection = [...currentSelection, newItem];
    handleChange(newSelection);
    
    // Сброс UI состояния
    setSelectedCategory(null);
    setSelectedItem(null);
    setIntensity(50);
    setTemperature(20);
    setCurrentStep('category');
  }, [selectedCategory, selectedItem, currentSelection, maxCircumstances, temperature, intensity, categories, handleChange]);

  const handleRemove = useCallback((index) => {
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
    switch (currentStep) {
      case 'category':
        return (
          <div className="step-content">
            <div className="step-header">
              <h3 className="step-title">{t('circumstances.picker.selectCategory')}</h3>
            </div>
            <div className="categories-grid">
              {categories().map(category => (
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

      case 'item':
        const items = selectedCategory ? allItems()[selectedCategory] : [];
        const categoryLabel = categories().find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                {t('circumstances.picker.back')}
              </button>
              <h3 className="step-title">{categoryLabel}</h3>
            </div>
            
            <div className="emotions-grid">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`emotion-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => handleItemSelect(item)}
                >
                  <div className="emotion-icon">{item.icon}</div>
                  <div className="emotion-name">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'temperature':
        const selectedItemName = selectedItem?.label || 'Погода';
        const selectedCategoryName = categories().find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                {t('circumstances.picker.back')}
              </button>
              <h3 className="step-title" style={{padding:"25px"}}>
                {t('circumstances.picker.temperature')}
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
              {/* {selectedCategoryName}: {selectedItemName} */}
              {selectedItemName || t('circumstances.picker.general')}
            </div>
            
            <div className="intensity-content">
              <div className="intensity-display">
                <span className="intensity-value">{temperature}°C</span>
              </div>
              
              <div className="intensity-slider-container">
                <div className="intensity-track-wrapper">
                  <input
                    className="intensity-slider"
                    type="range"
                    min="-30"
                    max="50"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                  />
                </div>
                
                <div className="intensity-marks">
                  {[-30, -10, 0, 10, 20, 30, 50].map(temp => (
                    <span 
                      key={temp}
                      className={`intensity-mark ${temperature === temp ? 'active' : ''}`}
                      onClick={() => setTemperature(temp)}
                    >
                      {temp}°
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="intensity-actions">
              <button className="add-emotion-button" onClick={handleAdd}>
                {t('circumstances.picker.add')}
              </button>
              </div>
            </div>
          </div>
        );

      case 'intensity':
        const selectedItemName2 = selectedItem?.label || 'Общее';
        const selectedCategoryName2 = categories().find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                {t('circumstances.picker.back')}
              </button>
              <h3 className="step-title" style={{padding:"25px"}}>
                {t('circumstances.picker.intensity')}
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
              {selectedCategoryName2}: {selectedItemName2}
            </div>
            
            <div className="intensity-content">
              <div className="intensity-display">
                <span className="intensity-value">{intensity}%</span>
              </div>
              
              <div className="intensity-slider-container">
                <div className="intensity-track-wrapper">
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
              <button className="add-emotion-button" onClick={handleAdd}>
                {t('circumstances.picker.add')}
              </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSelected = () => {
    if (!Array.isArray(currentSelection) || currentSelection.length === 0) return null;
    
    return (
      <div className="selected-emotions">
        <div className="selected-header">
          <span className="selected-count">
            {t('circumstances.picker.selectedCount', {
              current: currentSelection.length,
              max: maxCircumstances
            })}
          </span>
          <button className="clear-all-button" onClick={handleClearAll}>
            {t('circumstances.picker.clearAll')}
          </button>

        </div>
        
        <div className="selected-list">
          {currentSelection.map((item, index) => (
            <div key={index} className="selected-emotion-item">
              <div className="selected-emotion-main">
                <span className="selected-emotion-icon">
                  {item.item?.icon || item.category?.icon || '?'}
                </span>
                <div className="selected-emotion-info">
                  <div className="selected-emotion-subtitle">
                    {item.category?.label}
                  </div>
                  <div className="selected-emotion-name">
                    {item.item?.label || t('circumstances.picker.general')}
                  </div>
                </div>
              </div>
              
              <div className="selected-emotion-controls">
                {item.category?.id === 'weather' && (
                  <input
                    type="range"
                    min="-30"
                    max="50"
                    value={item.intensity}
                    onChange={(e) => handleUpdateIntensity(index, parseInt(e.target.value))}
                    className="selected-intensity-slider"
                  />
                )}
                <span className="selected-intensity-value">
                  {item.isTemperature ? `${item.intensity}°C` : `${item.intensity}%`}
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
});

export default CircumstancesPicker;