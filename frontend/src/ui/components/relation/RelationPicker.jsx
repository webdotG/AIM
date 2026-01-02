import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/layers/language';
import { useEntriesStore } from '@/store/StoreContext';
import { useRelationsStore } from '@/store/StoreContext';
import './RelationPicker.css';

const RelationPicker = ({ 
  selectedRelations = [], 
  onChange,
  maxRelations = 5,
  onClose,
  searchGraphs,
  entryId = null
}) => {
  const { t } = useLanguage();
  const entriesStore = useEntriesStore();
  const relationsStore = useRelationsStore();
  
  const [currentStep, setCurrentStep] = useState('type');
  const [selectedType, setSelectedType] = useState(null);
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [direction, setDirection] = useState('from');

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

      const encoded = selectedRelations
        .filter(rel => rel?.type?.id && rel?.targetEntry?.id && rel?.description)
        .map(rel => {
          const dir = rel.direction || 'from';
          const type = rel.type.id;
          const entryId = rel.targetEntry.id.substring(0, 8);
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

  // Поиск записей
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      alert('Введите текст для поиска');
      return;
    }
    
    setIsSearching(true);
    try {
      // Используем реальный поиск из entriesStore
      await entriesStore.searchEntries(query, 5);
      const results = entriesStore.entries;
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [entriesStore]);

  // Создание новой записи
  const handleCreateEntry = (content) => {
    if (!content.trim()) {
      alert('Введите текст для новой записи');
      return;
    }
    
    const tempEntry = {
      id: `temp_${Date.now()}`,
      type: 'thought',
      content: content.trim(),
      created_at: new Date().toISOString(),
      isTemp: true
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

  const handleAddRelation = async () => {
    if (!selectedType || !selectedEntry || !description.trim()) {
      alert('Заполните все поля');
      return;
    }
    
    if (selectedRelations.length >= maxRelations) {
      alert(`Максимум ${maxRelations} связей`);
      return;
    }

    if (entryId && selectedEntry.id === entryId) {
      alert('Нельзя создать связь записи с самой собой');
      return;
    }

    const newRelation = {
      direction,
      type: selectedType,
      targetEntry: selectedEntry,
      description: description.trim(),
      ...(selectedEntry.isTemp && { needsCreation: true })
    };

    const updated = [...selectedRelations, newRelation];
    onChange(updated);
    
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

  // Типы связей
  const relationTypes = [
    { id: 'led_to', label: '→ Привело к', icon: '→', color: '#4CAF50' },
    { id: 'reminded_of', label: '↔ Напомнило о', icon: '↔', color: '#2196F3' },
    { id: 'inspired_by', label: '← Вдохновлено', icon: '←', color: '#9C27B0' },
    { id: 'caused_by', label: '← Вызвано', icon: '←', color: '#FF9800' },
    { id: 'related_to', label: '↻ Связана с', icon: '↻', color: '#E91E63' },
    { id: 'resulted_in', label: '⇄ Результат', icon: '⇄', color: '#795548' },
    { id: 'contradicts', label: '≠ Противоречит', icon: '≠', color: '#F44336' },
    { id: 'develops', label: '↗ Развивает', icon: '↗', color: '#009688' }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="step-content">
            <h3 className="step-title">Тип связи</h3>
            <div className="relation-types-grid">
              {relationTypes.map(type => (
                <div key={type.id} className="relation-type-card" onClick={() => handleTypeSelect(type)}>
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
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title">Направление</h3>
            </div>
            <div className="direction-options">
              <button className="direction-button" onClick={() => handleDirectionSelect('from')}>
                От этой записи
              </button>
              <button className="direction-button" onClick={() => handleDirectionSelect('to')}>
                К этой записи
              </button>
            </div>
          </div>
        );
      
      case 'search':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title">Выбор записи</h3>
            </div>
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск записей..."
            />
            <button onClick={() => handleSearch(searchQuery)}>Найти</button>
          </div>
        );
      
      case 'description':
        return (
          <div className="step-content">
            <div className="step-header">
              <button className="back-button" onClick={handleBack}>← Назад</button>
              <h3 className="step-title">Описание связи</h3>
            </div>
            <textarea
              className="relation-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите связь..."
            />
            <button onClick={handleAddRelation}>Добавить связь</button>
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
          <button className="clear-button" onClick={handleClearAll}>Очистить все</button>
        </div>
        <div className="selected-list">
          {selectedRelations.map((rel, index) => (
            <div key={index} className="relation-item">
              <div className="relation-details">
                <div className="relation-type">{rel.type.label}</div>
                <div className="relation-description">{rel.description}</div>
              </div>
              <button className="remove-button" onClick={() => handleRemoveRelation(index)}>×</button>
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