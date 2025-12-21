import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/layers/language';
import './RelationPicker.css';

const RelationPicker = ({ 
  selectedRelations = [], 
  onChange,
  maxRelations = 5,
  onClose,
  searchGraphs,
  entryId = null // ID текущей записи (если редактируем существующую)
}) => {
  const { t } = useLanguage();
  
  const [currentStep, setCurrentStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [direction, setDirection] = useState('from'); // 'from' или 'to'

  const clearUrlRef = useRef(() => {
    try {
      const url = new URL(window.location);
      url.searchParams.delete('rel');
      window.history.replaceState({}, '', url);
    } catch (e) {
      console.warn('Failed to clear URL:', e);
    }
  });

  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновление URL
  useEffect(() => {
    try {
      if (selectedRelations.length === 0) {
        clearUrlRef.current();
        return;
      }

      // Формат: direction:type:entryId:description
      // Пример: from:led_to:abc123:описание
      const encoded = selectedRelations
        .filter(rel => rel?.type?.id && rel?.targetEntry?.id && rel?.description)
        .map(rel => {
          const dir = rel.direction || 'from';
          const type = rel.type.id;
          const entryId = rel.targetEntry.id.substring(0, 8); // Берем первые 8 символов UUID
          const desc = encodeURIComponent(rel.description.substring(0, 50));
          return `${dir}:${type}:${entryId}:${desc}`;
        })
        .join(';');
      
      if (encoded) {
        const url = new URL(window.location);
        url.searchParams.set('rel', encoded);
        window.history.replaceState({}, '', url);
      }
    } catch (e) {
      console.warn('Failed to update URL:', e);
    }
  }, [selectedRelations]);

  // Чтение из URL
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const relParam = params.get('rel');
      
      if (relParam && selectedRelations.length === 0) {
        const relations = relParam.split(';')
          .map(part => {
            const [direction, typeId, entryIdCode, desc] = part.split(':');
            const description = decodeURIComponent(desc || '');
            
            const type = relationTypes.find(t => t.id === typeId);
            if (!type) return null;
            
            // В реальном приложении здесь нужно искать запись по ID
            // Для демо создаем заглушку
            return {
              direction,
              type,
              targetEntry: {
                id: entryIdCode || 'unknown',
                title: `Запись ${entryIdCode}`,
                content: description
              },
              description
            };
          })
          .filter(Boolean);
        
        if (relations.length > 0) {
          onChange(relations);
        }
      }
    } catch (e) {
      console.warn('Error parsing URL:', e);
    }
  }, []);

  // Поиск записей (вызывается только по кнопке "Найти")
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      alert('Введите текст для поиска');
      return;
    }
    
    setIsSearching(true);
    try {
      if (searchGraphs) {
        const results = await searchGraphs({ query, limit: 5 });
        setSearchResults(results);
      } else {
        // Заглушки для тестирования
        setTimeout(() => {
          const stubResults = [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              type: 'thought',
              content: `Найденный результат по запросу: ${query}`,
              created_at: '2024-01-15T10:30:00Z'
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              type: 'memory',
              content: `Еще одна запись по теме: ${query}`,
              created_at: '2024-01-10T14:20:00Z'
            }
          ];
          setSearchResults(stubResults);
          setIsSearching(false);
        }, 500);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchGraphs]);

  // Создание новой записи
  const handleCreateEntry = (content) => {
    if (!content.trim()) {
      alert('Введите текст для новой записи');
      return;
    }
    
    // Создаем временную запись (заглушку)
    const tempEntry = {
      id: `temp_${Date.now()}`,
      type: 'thought', // По умолчанию мысль
      content: content.trim(),
      created_at: new Date().toISOString(),
      isTemp: true // Флаг временной записи
    };
    
    setSelectedEntry(tempEntry);
    setCurrentStep('description');
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setCurrentStep('direction');
  };

  const handleDirectionSelect = (dir) => {
    setDirection(dir);
    setCurrentStep('search');
  };

  const handleEntrySelect = (entry) => {
    setSelectedEntry(entry);
    setCurrentStep('description');
  };

  const handleBack = () => {
    if (currentStep === 'description') {
      setCurrentStep('search');
    } else if (currentStep === 'search') {
      setCurrentStep('direction');
    } else if (currentStep === 'direction') {
      setCurrentStep('type');
      setSelectedType(null);
    } else if (currentStep === 'type') {
      setSelectedType(null);
    }
  };

  const handleAddRelation = () => {
    if (!selectedType || !selectedEntry || !description.trim()) {
      alert('Заполните все поля');
      return;
    }
    
    if (selectedRelations.length >= maxRelations) {
      alert(`Максимум ${maxRelations} связей`);
      return;
    }

    // Проверяем, не создаем ли циклическую связь с самим собой
    if (entryId && selectedEntry.id === entryId) {
      alert('Нельзя создать связь записи с самой собой');
      return;
    }

    const newRelation = {
      direction,
      type: selectedType,
      targetEntry: selectedEntry,
      description: description.trim(),
      // Добавляем флаг, если запись временная
      ...(selectedEntry.isTemp && { needsCreation: true })
    };

    const updated = [...selectedRelations, newRelation];
    onChange(updated);
    
    // Сброс
    setSelectedType(null);
    setSelectedEntry(null);
    setDescription('');
    setSearchQuery('');
    setSearchResults([]);
    setDirection('from');
    setCurrentStep('type');
  };

  const handleRemoveRelation = (index) => {
    const updated = selectedRelations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
    clearUrlRef.current();
  };

  // Типы связей из БД (дополненные)
  const relationTypes = [
    { 
      id: 'led_to', 
      label: '→ Привело к', 
      icon: '→', 
      color: '#4CAF50',
      description: 'Эта запись привела к другой'
    },
    { 
      id: 'reminded_of', 
      label: '↔ Напомнило о', 
      icon: '↔', 
      color: '#2196F3',
      description: 'Ассоциативная связь'
    },
    { 
      id: 'inspired_by', 
      label: '← Вдохновлено', 
      icon: '←', 
      color: '#9C27B0',
      description: 'Эта запись вдохновлена другой'
    },
    { 
      id: 'caused_by', 
      label: '← Вызвано', 
      icon: '←', 
      color: '#FF9800',
      description: 'Эта запись вызвана другой'
    },
    { 
      id: 'related_to', 
      label: '↻ Связана с', 
      icon: '↻', 
      color: '#E91E63',
      description: 'Общая связь'
    },
    { 
      id: 'resulted_in', 
      label: '⇄ Результат', 
      icon: '⇄', 
      color: '#795548',
      description: 'Эта запись является результатом другой'
    },
    { 
      id: 'contradicts', 
      label: '≠ Противоречит', 
      icon: '≠', 
      color: '#F44336',
      description: 'Противоречивая связь'
    },
    { 
      id: 'develops', 
      label: '↗ Развивает', 
      icon: '↗', 
      color: '#009688',
      description: 'Развивает идею другой записи'
    }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="step-content">
            <h3 className="step-title">Тип связи</h3>
            <p className="step-subtitle">Как связана эта запись с другими?</p>
            
            <div className="relation-types-grid">
              {relationTypes.map(type => (
                <div
                  key={type.id}
                  className="relation-type-card"
                  onClick={() => handleTypeSelect(type)}
                  style={{ borderColor: type.color }}
                >
                  <div className="relation-type-icon" style={{ color: type.color }}>
                    {type.icon}
                  </div>
                  <div className="relation-type-info">
                    <div className="relation-type-label">{type.label}</div>
                    <div className="relation-type-desc">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'direction':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                ← Назад
              </button>
              <h3 className="step-title">Направление</h3>
            </div>
            
            <div className="selected-type-indicator">
              <span style={{ color: selectedType.color }}>
                {selectedType.icon} {selectedType.label}
              </span>
            </div>
            
            <p className="step-subtitle">
              Как направлена связь?
            </p>
            
            <div className="direction-options">
              <button
                className={`direction-button ${direction === 'from' ? 'selected' : ''}`}
                onClick={() => handleDirectionSelect('from')}
              >
                <div className="direction-icon">→</div>
                <div className="direction-info">
                  <div className="direction-label">От этой записи</div>
                  <div className="direction-desc">
                    {selectedType.label} другой записи
                  </div>
                </div>
              </button>
              
              <button
                className={`direction-button ${direction === 'to' ? 'selected' : ''}`}
                onClick={() => handleDirectionSelect('to')}
              >
                <div className="direction-icon">←</div>
                <div className="direction-info">
                  <div className="direction-label">К этой записи</div>
                  <div className="direction-desc">
                    Другая запись {selectedType.label.toLowerCase()} этой
                  </div>
                </div>
              </button>
            </div>
            
            <div className="step-note">
              Выберите направление связи
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                ← Назад
              </button>
              <h3 className="step-title">Выбор записи</h3>
            </div>
            
            <div className="selected-type-indicator">
              <span style={{ color: selectedType.color }}>
                {direction === 'from' ? '→' : '←'} {selectedType.label}
              </span>
            </div>
            
            <div className="search-section">
              <div className="search-input-container">
                <input
                  type="text"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите текст для поиска или создайте новую связь..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchQuery);
                    }
                  }}
                />
                <div className="search-actions">
                  <button
                    className={`search-action-button ${searchQuery.trim() ? 'active' : ''}`}
                    onClick={() => handleSearch(searchQuery)}
                    disabled={!searchQuery.trim() || isSearching}
                  >
                    {isSearching ? 'Поиск...' : 'Найти'}
                  </button>
                  <button
                    className={`create-action-button ${searchQuery.trim() ? 'active' : ''}`}
                    onClick={() => handleCreateEntry(searchQuery)}
                    disabled={!searchQuery.trim()}
                  >
                    Создать
                  </button>
                </div>
              </div>
              
              {/* Состояние поиска */}
              {isSearching ? (
                <div className="search-loading-state">
                  <div className="loading-spinner"></div>
                  <div>Ищем записи...</div>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="results-header">
                    <span className="results-count">
                      Найдено: {searchResults.length}
                    </span>
                    <button
                      className="create-from-search-button"
                      onClick={() => handleCreateEntry(searchQuery)}
                    >
                      + Создать новую
                    </button>
                  </div>
                  
                  <div className="search-results">
                    {searchResults.map((entry) => (
                      <div
                        key={entry.id}
                        className={`search-result-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                        onClick={() => handleEntrySelect(entry)}
                      >
                        <div className="result-header">
                          <span className="result-type">{entry.type}</span>
                          <span className="result-date">
                            {new Date(entry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="result-content">{entry.content.substring(0, 120)}...</div>
                        <div className="result-actions">
                          <button
                            className="select-result-button"
                            onClick={() => handleEntrySelect(entry)}
                          >
                            Выбрать
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : searchQuery.trim() ? (
                <div className="search-hint">
                  <div className="hint-title">Нет результатов по запросу "{searchQuery}"</div>
                  <div className="hint-options">
                    <button
                      className="hint-button"
                      onClick={() => handleCreateEntry(searchQuery)}
                    >
                      Создать новую запись: "{searchQuery.substring(0, 50)}..."
                    </button>
                    <div className="hint-tip">
                      Или попробуйте другой запрос для поиска существующих записей
                    </div>
                  </div>
                </div>
              ) : (
                <div className="search-guide">
                  <h4>Как создать связь:</h4>
                  <div className="guide-steps">
                    <div className="guide-step">
                      <span className="step-number">1</span>
                      <span className="step-text">Введите текст в поле выше</span>
                    </div>
                    <div className="guide-step">
                      <span className="step-number">2</span>
                      <span className="step-text">
                        Нажмите <strong>"Найти"</strong> для поиска существующих записей
                      </span>
                    </div>
                    <div className="guide-step">
                      <span className="step-number">3</span>
                      <span className="step-text">
                        Или нажмите <strong>"Создать"</strong> для новой записи
                      </span>
                    </div>
                  </div>
                  
                  <div className="search-examples">
                    <div className="examples-title">Примеры:</div>
                    <div className="examples-list">
                      <button
                        className="example-tag"
                        onClick={() => setSearchQuery('сон про море')}
                      >
                        сон про море
                      </button>
                      <button
                        className="example-tag"
                        onClick={() => setSearchQuery('встреча с другом')}
                      >
                        встреча с другом
                      </button>
                      <button
                        className="example-tag"
                        onClick={() => setSearchQuery('работа над проектом')}
                      >
                        работа над проектом
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>
                ← Назад
              </button>
              <h3 className="step-title">Описание связи</h3>
            </div>
            
            <div className="selected-info">
              <div className="selected-type" style={{ color: selectedType.color }}>
                {direction === 'from' ? '→' : '←'} {selectedType.label}
              </div>
              <div className="selected-entry">
                <span className="entry-type">{selectedEntry.type}</span>
                <span className="entry-content">
                  {selectedEntry.content.substring(0, 80)}
                  {selectedEntry.isTemp && <span className="temp-badge"> (новая)</span>}
                </span>
              </div>
            </div>
            
            <textarea
              className="relation-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробно опишите, как именно связаны записи..."
              rows={4}
              autoFocus
            />
            
            <div className="description-examples">
              <div className="examples-title">Примеры:</div>
              <div className="examples-list">
                <div className="example-item">"Эта мысль развивает идею из прошлой записи"</div>
                <div className="example-item">"Сон напомнил о событии из детства"</div>
                <div className="example-item">"Решение привело к изменениям в планах"</div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="add-button"
                onClick={handleAddRelation}
                disabled={!description.trim()}
              >
                Добавить связь
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSelectedRelations = () => {
    if (selectedRelations.length === 0) return null;
    
    return (
      <div className="selected-relations">
        <div className="selected-header">
          <span>Связи ({selectedRelations.length}/{maxRelations})</span>
          <button className="clear-button" onClick={handleClearAll}>
            Очистить все
          </button>
        </div>
        
        <div className="selected-list">
          {selectedRelations.map((rel, index) => (
            <div key={index} className="relation-item">
              <div className="relation-direction-icon">
                {rel.direction === 'from' ? '→' : '←'}
              </div>
              <div className="relation-icon" style={{ color: rel.type.color }}>
                {rel.type.icon}
              </div>
              <div className="relation-details">
                <div className="relation-header">
                  <span className="relation-type">{rel.type.label}</span>
                  <span className="relation-direction">
                    {rel.direction === 'from' ? 'к записи:' : 'от записи:'}
                  </span>
                  {rel.needsCreation && <span className="new-badge">(новая)</span>}
                </div>
                <div className="relation-target">
                  {rel.targetEntry?.content?.substring(0, 60) || 'Неизвестная запись'}...
                </div>
                <div className="relation-description">"{rel.description}"</div>
              </div>
              <button
                className="remove-button"
                onClick={() => handleRemoveRelation(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relation-picker">
      {renderSelectedRelations()}
      
      <div className="picker-content">
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default RelationPicker;