// ~/aProject/AIM/frontend/src/ui/components/relation/RelationPicker.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useRelationsStore } from '@/store/StoreContext';
import './RelationPicker.css';

const RelationPicker = observer(({ 
  // Режим 1: Автономный (для переиспользования)
  selectedRelations = [], 
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'relations',
  
  // Общие пропсы
  maxRelations = 5,
  entryId = null,
  searchGraphs = null
}) => {
  const { t } = useLanguage();
  const entriesStore = useEntriesStore();
  const relationsStore = useRelationsStore();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentSelection = isDraftMode 
    ? draftStore.currentDraft[draftField] || []
    : selectedRelations || [];
  
  // Локальное состояние UI
  const [currentStep, setCurrentStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [direction, setDirection] = useState('from');
  const [localError, setLocalError] = useState(null);

  // Синхронизация при изменении пропсов
  useEffect(() => {
    if (!isDraftMode) {
      // Сбрасываем UI состояние если изменились пропсы
      resetUIState();
    }
  }, [isDraftMode, selectedRelations]);

  // Обработчик обновления выбора
  const handleChange = useCallback((newRelations) => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: newRelations });
    } else {
      onChange?.(newRelations);
    }
  }, [isDraftMode, draftStore, draftField, onChange]);

  // Сброс UI состояния
  const resetUIState = useCallback(() => {
    setCurrentStep('type');
    setSelectedType(null);
    setDescription('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedEntry(null);
    setIsSearching(false);
    setDirection('from');
    setLocalError(null);
  }, []);

  // Типы связей
  const relationTypes = useMemo(() => [
    { id: 'led_to', label: t('relations.types.led_to'), icon: '→' },
    { id: 'reminded_of', label: t('relations.types.reminded_of'), icon: '↔' },
    { id: 'inspired_by', label: t('relations.types.inspired_by'), icon: '←' },
    { id: 'caused_by', label: t('relations.types.caused_by'), icon: '←' },
    { id: 'related_to', label: t('relations.types.related_to'), icon: '↻' },
    { id: 'resulted_in', label: t('relations.types.resulted_in'), icon: '⇄' },
    { id: 'contradicts', label: t('relations.types.contradicts'), icon: '≠' },
    { id: 'develops', label: t('relations.types.develops'), icon: '↗' }
  ], [t]);

  // Поиск записей
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setLocalError(t('relations.search_required'));
      return;
    }
    
    setIsSearching(true);
    setLocalError(null);
    
    try {
      // Если передан кастомный поиск из пропсов - используем его
      let results;
      if (searchGraphs) {
        results = await searchGraphs({
          query: query.trim(),
          limit: 5
        });
      } else {
        // Иначе используем стандартный поиск
        await entriesStore.searchEntries(query.trim(), 5);
        results = entriesStore.entries || [];
      }
      
      setSearchResults(results);
      
      if (results.length === 0) {
        setLocalError(t('relations.no_results'));
      }
    } catch (error) {
      console.error('Search error:', error);
      setLocalError(t('relations.search_error'));
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [entriesStore, searchGraphs, t]);

  // Создание новой записи из поискового запроса
  const handleCreateEntry = useCallback((content) => {
    const tempEntry = {
      id: `temp_${Date.now()}`,
      type: 'thought',
      content: content.trim(),
      isTemp: true,
      needsCreation: true,
      created_at: new Date().toISOString()
    };
    
    setSelectedEntry(tempEntry);
    setCurrentStep('description');
  }, []);

  // Обработчики шагов
  const handleTypeSelect = useCallback((type) => {
    setSelectedType(type);
    setCurrentStep('direction');
  }, []);

  const handleDirectionSelect = useCallback((dir) => {
    setDirection(dir);
    setCurrentStep('search');
  }, []);

  const handleEntrySelect = useCallback((entry) => {
    setSelectedEntry(entry);
    setCurrentStep('description');
  }, []);

  const handleBack = useCallback(() => {
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
    setLocalError(null);
  }, [currentStep]);

  const handleAddRelation = useCallback(async () => {
    // Валидация
    if (!selectedType || !selectedEntry || !description.trim()) {
      setLocalError(t('relations.fill_all_fields'));
      return;
    }
    
    if (currentSelection.length >= maxRelations) {
      setLocalError(t('relations.max_reached', { max: maxRelations }));
      return;
    }

    // Проверка на связь с самим собой
    if (entryId && selectedEntry.id === entryId) {
      setLocalError(t('relations.no_self_relation'));
      return;
    }

    const newRelation = {
      direction,
      type: selectedType,
      targetEntry: selectedEntry,
      description: description.trim(),
      ...(selectedEntry.isTemp && { needsCreation: true })
    };

    const newSelection = [...currentSelection, newRelation];
    handleChange(newSelection);
    
    // Сброс UI состояния
    resetUIState();
  }, [selectedType, selectedEntry, description, currentSelection, maxRelations, entryId, direction, handleChange, resetUIState, t]);

  const handleRemoveRelation = useCallback((index) => {
    const newSelection = currentSelection.filter((_, i) => i !== index);
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  const handleClearAll = useCallback(() => {
    handleChange([]);
  }, [handleChange]);

  // Обновление описания существующей связи
  const handleUpdateDescription = useCallback((index, newDescription) => {
    const newSelection = currentSelection.map((rel, i) => 
      i === index ? { ...rel, description: newDescription } : rel
    );
    handleChange(newSelection);
  }, [currentSelection, handleChange]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="step-content">
            <h3 className="step-title">{t('relations.step_type')}</h3>
            <div className="relation-types-grid">
              {relationTypes.map(type => (
                <div 
                  key={type.id} 
                  className={`relation-type-card ${selectedType?.id === type.id ? 'selected' : ''}`} 
                  onClick={() => handleTypeSelect(type)}
                >
                  <div className="relation-type-icon">{type.icon}</div>
                  <div className="relation-type-label">{type.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'direction':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button btn-secondary" onClick={handleBack}>
                ← {t('common.back')}
              </button>
              <h3 className="step-title">{t('relations.step_direction')}</h3>
            </div>
            <div className="direction-options">
              <button 
                className={`direction-button ${direction === 'from' ? 'selected' : ''}`} 
                onClick={() => handleDirectionSelect('from')}
              >
                <div className="direction-icon">→</div>
                <div className="direction-info">
                  <div className="direction-label">{t('relations.direction.from')}</div>
                  <div className="direction-desc">{t('relations.direction.from_desc')}</div>
                </div>
              </button>
              <button 
                className={`direction-button ${direction === 'to' ? 'selected' : ''}`} 
                onClick={() => handleDirectionSelect('to')}
              >
                <div className="direction-icon">←</div>
                <div className="direction-info">
                  <div className="direction-label">{t('relations.direction.to')}</div>
                  <div className="direction-desc">{t('relations.direction.to_desc')}</div>
                </div>
              </button>
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button btn-secondary" onClick={handleBack}>
                ← {t('common.back')}
              </button>
              <h3 className="step-title">{t('relations.step_search')}</h3>
            </div>
            
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLocalError(null);
                }}
                placeholder={t('relations.search_placeholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
              {isSearching && (
                <div className="search-loading">{t('common.searching')}</div>
              )}
            </div>
            
            {localError && (
              <div className="error-message">{localError}</div>
            )}
            
            <button 
              className="search-button btn-primary" 
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? t('common.searching') : t('common.search')}
            </button>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(entry => (
                  <div 
                    key={entry.id} 
                    className={`search-result-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                    onClick={() => handleEntrySelect(entry)}
                  >
                    <div className="result-type">{entry.type || 'entry'}</div>
                    <div className="result-content">{entry.content?.substring(0, 100)}</div>
                    <div className="result-date">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && !localError && (
              <div className="search-hint">
                <p>{t('relations.no_results')}</p>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleCreateEntry(searchQuery)}
                >
                  {t('relations.create_new')}
                </button>
              </div>
            )}
          </div>
        );
      
      case 'description':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button btn-secondary" onClick={handleBack}>
                ← {t('common.back')}
              </button>
              <h3 className="step-title">{t('relations.step_description')}</h3>
            </div>
            
            <div className="selected-info">
              <div className="selected-type">
                {selectedType?.label} • {direction === 'from' ? t('relations.direction.from') : t('relations.direction.to')}
              </div>
              {selectedEntry && (
                <div className="selected-entry">
                  <span className="entry-type">{selectedEntry.type}</span>
                  <span className="entry-content">{selectedEntry.content?.substring(0, 80)}</span>
                  {selectedEntry.isTemp && (
                    <span className="entry-temp-badge">[Новая]</span>
                  )}
                </div>
              )}
            </div>
            
            {localError && (
              <div className="error-message">{localError}</div>
            )}
            
            <textarea
              className="relation-description-input"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setLocalError(null);
              }}
              placeholder={t('relations.description_placeholder')}
              rows="4"
            />
            
            <div className="description-examples">
              <div className="examples-title">{t('relations.examples')}:</div>
              <div className="examples-list">
                <div className="example-item">{t('relations.example1')}</div>
                <div className="example-item">{t('relations.example2')}</div>
                <div className="example-item">{t('relations.example3')}</div>
              </div>
            </div>
            
            <div className="action-buttons">
              <button 
                className="add-button btn-primary" 
                onClick={handleAddRelation}
                disabled={!description.trim()}
              >
                {t('relations.add_relation')}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderSelectedRelations = () => {
    if (currentSelection.length === 0) return null;
    
    return (
      <div className="selected-relations">
        <div className="selected-header">
          <span className="selected-count">
            {t('relations.selected')}: {currentSelection.length} / {maxRelations}
          </span>
          <button className="clear-all-button btn-secondary" onClick={handleClearAll}>
            {t('common.clear_all')}
          </button>
        </div>
        
        <div className="selected-list">
          {currentSelection.map((rel, index) => (
            <div key={index} className="relation-item">
              <div className="relation-direction-icon">
                {rel.direction === 'from' ? '→' : '←'}
              </div>
              <div className="relation-details">
                <div className="relation-header">
                  <span className="relation-direction">
                    {rel.direction === 'from' ? t('relations.direction.from') : t('relations.direction.to')}
                  </span>
                  <span className="relation-type-badge">
                    {rel.type.label}
                  </span>
                </div>
                <div className="relation-target">
                  {rel.targetEntry.content?.substring(0, 60)}
                  {rel.targetEntry.isTemp && (
                    <span className="entry-temp-badge">[Новая]</span>
                  )}
                </div>
                <textarea
                  className="relation-description-edit"
                  value={rel.description}
                  onChange={(e) => handleUpdateDescription(index, e.target.value)}
                  rows="2"
                />
              </div>
              <button 
                className="remove-relation-button btn-secondary" 
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
});

export default RelationPicker;