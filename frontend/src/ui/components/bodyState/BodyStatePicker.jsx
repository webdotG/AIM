// ~/aProject/AIM/frontend/src/ui/components/bodyState/BodyStatePicker.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import './BodyStatePicker.css';

const BodyStatePicker = observer(({ 
  // Режим 1: Автономный (для переиспользования)
  bodyState = null,
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'bodyState',
  
  // Общие пропсы
  showTabs = true
}) => {
  const { t } = useLanguage();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentBodyState = isDraftMode 
    ? draftStore.currentDraft[draftField] || {}
    : bodyState || {};
  
  const [hp, setHp] = useState(currentBodyState.hp || 0);
  const [energy, setEnergy] = useState(currentBodyState.energy || 0);
  const [location, setLocation] = useState(currentBodyState.location || '');
  const [activeTab, setActiveTab] = useState('stats');
  
  const hpSteps = [0, 5, 25, 50, 75, 90, 99, 100];
  const energySteps = [0, 5, 25, 50, 75, 90, 99, 100];

  // Синхронизация при изменении пропсов
  useEffect(() => {
    if (!isDraftMode) {
      setHp(bodyState?.hp || 0);
      setEnergy(bodyState?.energy || 0);
      setLocation(bodyState?.location || '');
    }
  }, [isDraftMode, bodyState]);

  // Обработчик обновления состояния
  const updateState = useCallback((updates) => {
    const newState = {
      hp: updates.hp !== undefined ? updates.hp : hp,
      energy: updates.energy !== undefined ? updates.energy : energy,
      location: updates.location !== undefined ? updates.location : location
    };
    
    // Обновляем состояние UI
    if (updates.hp !== undefined) setHp(updates.hp);
    if (updates.energy !== undefined) setEnergy(updates.energy);
    if (updates.location !== undefined) setLocation(updates.location);
    
    // Обрабатываем в зависимости от режима
    if (isDraftMode) {
      // Если все поля пустые - передаем пустой объект
      if (newState.hp === 0 && newState.energy === 0 && !newState.location) {
        draftStore.updateDraft({ [draftField]: {} });
      } else {
        draftStore.updateDraft({ [draftField]: newState });
      }
    } else {
      // Автономный режим
      if (newState.hp === 0 && newState.energy === 0 && !newState.location) {
        onChange?.(null);
      } else {
        onChange?.(newState);
      }
    }
  }, [hp, energy, location, isDraftMode, draftStore, draftField, onChange]);

  // Обработчики изменения
  const handleHpChange = useCallback((value) => {
    const closest = hpSteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    updateState({ hp: closest });
  }, [hpSteps, updateState]);

  const handleEnergyChange = useCallback((value) => {
    const closest = energySteps.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    updateState({ energy: closest });
  }, [energySteps, updateState]);

  const handleLocationChange = useCallback((value) => {
    const trimmedValue = value.trim();
    updateState({ location: trimmedValue });
  }, [updateState]);

  const handleClearLocation = useCallback(() => {
    updateState({ location: '' });
  }, [updateState]);

  const handleClearAll = useCallback(() => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: {} });
    } else {
      onChange?.(null);
    }
    
    // Сбрасываем локальное состояние UI
    setHp(0);
    setEnergy(0);
    setLocation('');
  }, [isDraftMode, draftStore, draftField, onChange]);

const getHpLabel = useCallback((value) => {
  if (value === 0) return 'Не указано';
  if (value <= 25) return t('bodyStates.hp.critical') || 'Критичное';
  if (value <= 50) return t('bodyStates.hp.low') || 'Низкое';
  if (value <= 75) return t('bodyStates.hp.normal') || 'Нормальное';
  return t('bodyStates.hp.excellent') || 'Отличное';
}, [t]);

const getEnergyLabel = useCallback((value) => {
  if (value === 0) return 'Не указано';
  if (value <= 25) return t('bodyStates.energy.exhausted') || 'Измождён';
  if (value <= 50) return t('bodyStates.energy.tired') || 'Устал';
  if (value <= 75) return t('bodyStates.energy.normal') || 'Нормально';
  return t('bodyStates.energy.energized') || 'Энергичен';
}, [t]);

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
          <span className="summary-title">Выбрано</span>
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
      
      {showTabs && (
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
      )}
      
      <div className="emotion-content">
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'location' && renderLocation()}
      </div>
    </div>
  );
});

export default BodyStatePicker;