import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/layers/language';
import './BodyStatePicker.css';

const BodyStatePicker = ({ 
  bodyState = null,
  onChange,
  onClose
}) => {
  const { t } = useLanguage();
  
  const [hp, setHp] = useState(bodyState?.hp || 0);
  const [energy, setEnergy] = useState(bodyState?.energy || 0);
  const [location, setLocation] = useState(bodyState?.location || '');
  const [activeTab, setActiveTab] = useState('stats');
  
  // Ref для очистки URL
  const clearUrlRef = useRef(() => {
    const url = new URL(window.location);
    url.searchParams.delete('body');
    window.history.replaceState({}, '', url);
  });

  // Передаем функцию очистки наружу
  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновляем URL при изменении состояния
  useEffect(() => {
    if ((!hp || hp === 0) && (!energy || energy === 0) && !location) {
      clearUrlRef.current();
      return;
    }

    // Формат: hp|energy|location
    // Пример: 75|50|Москва
    const encoded = `${hp}|${energy}|${location}`;
    
    const url = new URL(window.location);
    url.searchParams.set('body', encoded);
    window.history.replaceState({}, '', url);
  }, [hp, energy, location]);

  // Чтение из URL при открытии
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bodyParam = params.get('body');
    
    if (bodyParam) {
      try {
        const parts = bodyParam.split('|');
        const hpFromUrl = parseInt(parts[0]) || 0;
        const energyFromUrl = parseInt(parts[1]) || 0;
        const locationFromUrl = parts[2] || '';
        
        // Обновляем локальное состояние
        if (hpFromUrl > 0) setHp(hpFromUrl);
        if (energyFromUrl > 0) setEnergy(energyFromUrl);
        if (locationFromUrl) setLocation(locationFromUrl);
        
        // Если в пропсах нет bodyState, а в URL есть - вызываем onChange
        if (!bodyState && (hpFromUrl > 0 || energyFromUrl > 0 || locationFromUrl)) {
          const newState = {
            hp: hpFromUrl,
            energy: energyFromUrl,
            location: locationFromUrl
          };
          onChange(newState);
        }
      } catch (e) {
        console.error('Error parsing body state from URL:', e);
      }
    }
  }, []);

  const hpSteps = [0, 5, 25, 50, 75, 90, 99, 100];
  const energySteps = [0, 5, 25, 50, 75, 90, 99, 100];

  const handleHpChange = (value) => {
    const closest = hpSteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setHp(closest);
    updateState({ hp: closest });
  };

  const handleEnergyChange = (value) => {
    const closest = energySteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    setEnergy(closest);
    updateState({ energy: closest });
  };

  const handleLocationChange = (value) => {
    const trimmedValue = value.trim();
    setLocation(trimmedValue);
    updateState({ location: trimmedValue });
  };

  const handleClearLocation = () => {
    setLocation('');
    updateState({ location: '' });
  };

  const handleClearAll = () => {
    setHp(0);
    setEnergy(0);
    setLocation('');
    updateState({ hp: 0, energy: 0, location: '' });
    clearUrlRef.current();
  };

  const updateState = (updates) => {
    const newState = {
      hp: updates.hp !== undefined ? updates.hp : hp,
      energy: updates.energy !== undefined ? updates.energy : energy,
      location: updates.location !== undefined ? updates.location : location
    };
    
    // Если все поля пустые - передаем null (как в БД)
    if (newState.hp === 0 && newState.energy === 0 && !newState.location) {
      onChange(null);
    } else {
      onChange(newState);
    }
  };

  const getHpLabel = (value) => {
    if (value === 0) return 'Не указано';
    if (value <= 25) return t('body.hp.critical') || 'Критичное';
    if (value <= 50) return t('body.hp.low') || 'Низкое';
    if (value <= 75) return t('body.hp.normal') || 'Нормальное';
    return t('body.hp.excellent') || 'Отличное';
  };

  const getEnergyLabel = (value) => {
    if (value === 0) return 'Не указано';
    if (value <= 25) return t('body.energy.exhausted') || 'Измождён';
    if (value <= 50) return t('body.energy.tired') || 'Устал';
    if (value <= 75) return t('body.energy.normal') || 'Нормально';
    return t('body.energy.energized') || 'Энергичен';
  };

  const renderStats = () => (
    <div className="step-content">
      <div className="body-stat-section">
        <div className="stat-header">
          <h3 className="stat-title">HP — Здоровье</h3>
          <div className="stat-controls">
            <span className="stat-label">{getHpLabel(hp)}</span>
            {hp > 0 && (
              <button 
                className="clear-stat-button"
                onClick={() => handleHpChange(0)}
                title="Очистить"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="intensity-display">
          <span className="intensity-value">{hp > 0 ? `${hp}%` : '—'}</span>
        </div>
        
        <div className="intensity-slider-container">
          <div className="intensity-track-wrapper">
            <input
              className="intensity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={hp}
              onChange={(e) => handleHpChange(parseInt(e.target.value))}
            />
          </div>
          
          <div className="intensity-marks">
            {hpSteps.map(step => (
              <span 
                key={step}
                className={`intensity-mark ${hp === step ? 'active' : ''}`}
                onClick={() => handleHpChange(step)}
              >
                {step === 0 ? '—' : `${step}%`}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="body-stat-section">
        <div className="stat-header">
          <h3 className="stat-title">MANA — Энергия</h3>
          <div className="stat-controls">
            <span className="stat-label">{getEnergyLabel(energy)}</span>
            {energy > 0 && (
              <button 
                className="clear-stat-button"
                onClick={() => handleEnergyChange(0)}
                title="Очистить"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="intensity-display">
          <span className="intensity-value">{energy > 0 ? `${energy}%` : '—'}</span>
        </div>
        
        <div className="intensity-slider-container">
          <div className="intensity-track-wrapper">
            <input
              className="intensity-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={energy}
              onChange={(e) => handleEnergyChange(parseInt(e.target.value))}
            />
          </div>
          
          <div className="intensity-marks">
            {energySteps.map(step => (
              <span 
                key={step}
                className={`intensity-mark ${energy === step ? 'active' : ''}`}
                onClick={() => handleEnergyChange(step)}
              >
                {step === 0 ? '—' : `${step}%`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="step-content">
      <div className="body-stat-section">
        <div className="stat-header">
          <h3 className="stat-title">Локация</h3>
          {location && (
            <button 
              className="clear-location-button"
              onClick={handleClearLocation}
              title="Очистить локацию"
            >
              Очистить
            </button>
          )}
        </div>
        
        <div className="location-input-container">
          <input
            type="text"
            className="location-input"
            placeholder="Введите место (город, страна...)"
            value={location}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
        </div>
        
        <div className="location-suggestions">
          <button 
            className="location-suggestion"
            onClick={() => handleLocationChange('Дом')}
          >
            Дом
          </button>
          <button 
            className="location-suggestion"
            onClick={() => handleLocationChange('Работа')}
          >
            Работа
          </button>
          <button 
            className="location-suggestion"
            onClick={() => handleLocationChange('Путешествие')}
          >
            Путешествие
          </button>
          <button 
            className="location-suggestion"
            onClick={() => handleLocationChange('Кафе')}
          >
            Кафе
          </button>
        </div>
      </div>
    </div>
  );

  const renderSummary = () => {
    const hasData = hp > 0 || energy > 0 || location;

    if (!hasData) return null;

    return (
      <div className="body-summary">
        <div className="summary-header">
          <span className="summary-title">Текущее состояние</span>
          <button 
            className="clear-all-summary-button"
            onClick={handleClearAll}
            title="Очистить всё"
          >
            Очистить всё
          </button>
        </div>
        
        <div className="summary-stats">
          {hp > 0 && (
            <div className="summary-stat">
              <span className="summary-stat-label">HP:</span>
              <span className="summary-stat-value">{hp}%</span>
              <button 
                className="remove-summary-stat"
                onClick={() => handleHpChange(0)}
              >
                ×
              </button>
            </div>
          )}
          {energy > 0 && (
            <div className="summary-stat">
              <span className="summary-stat-label">MANA:</span>
              <span className="summary-stat-value">{energy}%</span>
              <button 
                className="remove-summary-stat"
                onClick={() => handleEnergyChange(0)}
              >
                ×
              </button>
            </div>
          )}
          {location && (
            <div className="summary-stat">
              <span className="summary-stat-label">📍</span>
              <span className="summary-stat-value">{location}</span>
              <button 
                className="remove-summary-stat"
                onClick={handleClearLocation}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="emotion-picker body-picker">
      {renderSummary()}
      
      <div className="emotion-tabs">
        <button
          className={`emotion-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          HP / MANA
        </button>
        <button
          className={`emotion-tab ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => setActiveTab('location')}
        >
          Локация
        </button>
      </div>
      
      <div className="emotion-content">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'location' && renderLocation()}
      </div>
    </div>
  );
};

export default BodyStatePicker;