import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/layers/language';
import './CircumstancesPicker.css';

const CircumstancesPicker = ({ 
  selectedCircumstances = [], 
  onChange,
  maxCircumstances = 5,
  onClose
}) => {
  const { t } = useLanguage();
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [temperature, setTemperature] = useState(20);
  const [currentStep, setCurrentStep] = useState('category');

  const intensitySteps = [5, 25, 50, 75, 90, 99, 100];

  // Ref для очистки URL
  const clearUrlRef = useRef(() => {
    const url = new URL(window.location);
    url.searchParams.delete('circ');
    window.history.replaceState({}, '', url);
  });

  // Передаем функцию очистки наружу
  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновляем URL при изменении обстоятельств
  useEffect(() => {
    if (!Array.isArray(selectedCircumstances) || selectedCircumstances.length === 0) {
      clearUrlRef.current();
      return;
    }

    // Формат: category:item:intensity:isTemp
    // Пример: weather:sunny:20:t;moon:full:75:p
    const encoded = selectedCircumstances.map(circ => {
      const catCode = circ.category.id.charAt(0); // w, m, e
      const itemCode = circ.item?.id?.substring(0, 2) || 'gn';
      const intensity = circ.intensity || 50;
      const tempFlag = circ.isTemperature ? 't' : 'p';
      return `${catCode}:${itemCode}:${intensity}:${tempFlag}`;
    }).join(';');
    
    const url = new URL(window.location);
    url.searchParams.set('circ', encoded);
    window.history.replaceState({}, '', url);
  }, [selectedCircumstances]);

  // Чтение из URL при открытии
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const circParam = params.get('circ');
    
    if (circParam && (!selectedCircumstances || selectedCircumstances.length === 0)) {
      try {
        const circumstances = circParam.split(';').map(part => {
          const [catCode, itemCode, intensityStr, tempFlag] = part.split(':');
          const intensity = parseInt(intensityStr) || 50;
          const isTemperature = tempFlag === 't';
          
          let categoryId;
          switch(catCode) {
            case 'w': categoryId = 'weather'; break;
            case 'm': categoryId = 'moon'; break;
            case 'e': categoryId = 'events'; break;
            default: return null;
          }
          
          const category = {
            id: categoryId,
            label: t(`circumstances.categories.${categoryId}`) || categoryId,
            icon: categoryId === 'weather' ? 'W' : 
                  categoryId === 'moon' ? 'M' : 'E'
          };
          
          let itemId;
          switch(itemCode) {
            case 'su': itemId = 'sunny'; break;
            case 'ra': itemId = 'rainy'; break;
            case 'sn': itemId = 'snowy'; break;
            case 'st': itemId = 'stormy'; break;
            case 'cl': itemId = 'cloudy'; break;
            case 'fo': itemId = 'foggy'; break;
            case 'wi': itemId = 'windy'; break;
            case 'ne': itemId = 'new_moon'; break;
            case 'fi': itemId = 'first_quarter'; break;
            case 'fu': itemId = 'full_moon'; break;
            case 'la': itemId = 'last_quarter'; break;
            case 'wa': itemId = 'war'; break;
            case 'pa': itemId = 'pandemic'; break;
            case 'el': itemId = 'election'; break;
            case 'cr': itemId = 'crisis'; break;
            case 'ea': itemId = 'earthquake'; break;
            case 'ho': itemId = 'holiday'; break;
            default: itemId = 'general';
          }
          
          const item = itemId !== 'general' ? {
            id: itemId,
            label: t(`circumstances.${categoryId}.${itemId}`) || itemId,
            icon: category.icon
          } : null;
          
          return {
            category,
            item,
            intensity,
            isTemperature
          };
        }).filter(Boolean);
        
        if (circumstances.length > 0) {
          onChange(circumstances);
        }
      } catch (e) {
        console.error('Error parsing circumstances from URL:', e);
      }
    }
  }, []);

  // Категории обстоятельств (без эмодзи)
  const categories = [
    { 
      id: 'weather', 
      label: t('circumstances.categories.weather') || 'Погода',
      icon: 'W', // Было ☁
      description: t('circumstances.categories.weatherDesc') || 'Погодные условия'
    },
    { 
      id: 'moon', 
      label: t('circumstances.categories.moon') || 'Луна',
      icon: 'M', // Было ☽
      description: t('circumstances.categories.moonDesc') || 'Фаза луны'
    },
    { 
      id: 'events', 
      label: t('circumstances.categories.events') || 'События',
      icon: 'E', // Было ⚡
      description: t('circumstances.categories.eventsDesc') || 'Глобальные события'
    }
  ];

  // Обстоятельства по категориям (без эмодзи)
  const allItems = {
    weather: [
      { id: 'sunny', icon: 'S', label: t('circumstances.weather.sunny') || 'Солнечно' }, // Было ☀
      { id: 'rainy', icon: 'R', label: t('circumstances.weather.rainy') || 'Дождь' }, // Было 🌧
      { id: 'snowy', icon: 'S', label: t('circumstances.weather.snowy') || 'Снег' }, // Было ❄
      { id: 'stormy', icon: 'T', label: t('circumstances.weather.stormy') || 'Гроза' }, // Было ⛈
      { id: 'cloudy', icon: 'C', label: t('circumstances.weather.cloudy') || 'Облачно' }, // Было ☁
      { id: 'foggy', icon: 'F', label: t('circumstances.weather.foggy') || 'Туман' }, // Было 🌫
      { id: 'windy', icon: 'W', label: t('circumstances.weather.windy') || 'Ветрено' } // Было 💨
    ],
    moon: [
      { id: 'new_moon', icon: 'N', label: t('circumstances.moon.new') || 'Новолуние' }, // Было 🌑
      { id: 'first_quarter', icon: 'F', label: t('circumstances.moon.first') || 'Первая четверть' }, // Было 🌓
      { id: 'full_moon', icon: 'F', label: t('circumstances.moon.full') || 'Полнолуние' }, // Было 🌕
      { id: 'last_quarter', icon: 'L', label: t('circumstances.moon.last') || 'Последняя четверть' } // Было 🌗
    ],
    events: [
      { id: 'war', icon: 'W', label: t('circumstances.events.war') || 'Война' },
      { id: 'pandemic', icon: 'P', label: t('circumstances.events.pandemic') || 'Пандемия' },
      { id: 'election', icon: 'E', label: t('circumstances.events.election') || 'Выборы' },
      { id: 'crisis', icon: 'C', label: t('circumstances.events.crisis') || 'Кризис' },
      { id: 'earthquake', icon: 'Q', label: t('circumstances.events.earthquake') || 'Землетрясение' },
      { id: 'holiday', icon: 'H', label: t('circumstances.events.holiday') || 'Праздник' }
    ]
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentStep('item');
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    if (selectedCategory === 'weather') {
      setCurrentStep('temperature');
    } else {
      setCurrentStep('intensity');
    }
  };

  const handleBack = () => {
    if (currentStep === 'intensity' || currentStep === 'temperature') {
      setCurrentStep('item');
    } else if (currentStep === 'item') {
      setCurrentStep('category');
      setSelectedItem(null);
    }
  };

  const handleAdd = () => {
    if (!selectedCategory) return;
    
    if (selectedCircumstances.length >= maxCircumstances) {
      alert(`Максимум ${maxCircumstances} обстоятельств`);
      return;
    }

    const newItem = {
      category: {
        id: selectedCategory,
        label: categories.find(c => c.id === selectedCategory).label,
        icon: categories.find(c => c.id === selectedCategory).icon
      },
      item: selectedItem ? {
        id: selectedItem.id,
        label: selectedItem.label,
        icon: selectedItem.icon
      } : null,
      intensity: selectedCategory === 'weather' ? temperature : intensity,
      isTemperature: selectedCategory === 'weather'
    };

    onChange([...selectedCircumstances, newItem]);
    
    setSelectedCategory(null);
    setSelectedItem(null);
    setIntensity(50);
    setTemperature(20);
    setCurrentStep('category');
  };

  const handleRemove = (index) => {
    const updated = selectedCircumstances.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
    clearUrlRef.current();
  };

  const handleSliderChange = (value) => {
    const closest = intensitySteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setIntensity(closest);
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

      case 'item':
        const items = selectedCategory ? allItems[selectedCategory] : [];
        const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
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
        const selectedCategoryName = categories.find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title" style={{padding:"25px"}}>Температура</h3>
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
              {selectedCategoryName}: {selectedItemName}
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
                  Добавить
                </button>
              </div>
            </div>
          </div>
        );

      case 'intensity':
        const selectedItemName2 = selectedItem?.label || 'Общее';
        const selectedCategoryName2 = categories.find(c => c.id === selectedCategory)?.label || '';

        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title" style={{padding:"25px"}}>Интенсивность</h3>
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
                  Добавить
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
    if (!Array.isArray(selectedCircumstances) || selectedCircumstances.length === 0) return null;
    
    return (
      <div className="selected-emotions">
        <div className="selected-header">
          <span className="selected-count">
            Выбрано: {selectedCircumstances.length} / {maxCircumstances}
          </span>
          <button className="clear-all-button" onClick={handleClearAll}>
            Очистить все
          </button>
        </div>
        
        <div className="selected-list">
          {selectedCircumstances.map((item, index) => (
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
                    {item.item?.label || 'Общее'}
                  </div>
                </div>
              </div>
              
              <div className="selected-emotion-controls">
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
};

export default CircumstancesPicker;