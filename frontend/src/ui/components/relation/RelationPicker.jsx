import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '@/layers/language';
import { useEntriesStore } from '@/store';
// import { useRelationsStore } from '@/store';
import './RelationPicker.css';

const RelationPicker = ({ 
  selectedRelations = [], 
  onChange,
  maxRelations = 5,
  onClose,
  entryId = null
}) => {
  const { t } = useLanguage();
  const entriesStore = useEntriesStore();
  // const relationsStore = useRelationsStore();
  
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
      alert(t('relations.search_required'));
      return;
    }
    
    setIsSearching(true);
    try {
      await entriesStore.searchEntries(query, 5);
      const results = entriesStore.entries;
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [entriesStore, t]);

  // Обработчики
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
      alert(t('relations.fill_all_fields'));
      return;
    }
    
    if (selectedRelations.length >= maxRelations) {
      alert(t('relations.max_reached', { max: maxRelations }));
      return;
    }

    if (entryId && selectedEntry.id === entryId) {
      alert(t('relations.no_self_relation'));
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
    { id: 'led_to', label: t('relations.types.led_to'), icon: '→' },
    { id: 'reminded_of', label: t('relations.types.reminded_of'), icon: '↔' },
    { id: 'inspired_by', label: t('relations.types.inspired_by'), icon: '←' },
    { id: 'caused_by', label: t('relations.types.caused_by'), icon: '←' },
    { id: 'related_to', label: t('relations.types.related_to'), icon: '↻' },
    { id: 'resulted_in', label: t('relations.types.resulted_in'), icon: '⇄' },
    { id: 'contradicts', label: t('relations.types.contradicts'), icon: '≠' },
    { id: 'develops', label: t('relations.types.develops'), icon: '↗' }
  ];

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'type':
        return (
          <div className="step-content">
            <h3 className="step-title">{t('relations.step_type')}</h3>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('relations.search_placeholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              />
              {isSearching && (
                <div className="search-loading">{t('common.searching')}</div>
              )}
            </div>
            
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
            
            {searchQuery.trim() && searchResults.length === 0 && !isSearching && (
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
                </div>
              )}
            </div>
            
            <textarea
              className="relation-description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
    if (selectedRelations.length === 0) return null;
    
    return (
      <div className="selected-relations">
        <div className="selected-header">
          <span className="selected-count">
            {t('relations.selected')}: {selectedRelations.length} / {maxRelations}
          </span>
          <button className="clear-all-button btn-secondary" onClick={handleClearAll}>
            {t('common.clear_all')}
          </button>
        </div>
        
        <div className="selected-list">
          {selectedRelations.map((rel, index) => (
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
                </div>
                <div className="relation-description">
                  {rel.description}
                </div>
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
};

export default RelationPicker;