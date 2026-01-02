import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/layers/language';
import './TagsPicker.css';

const TagsPicker = ({ 
  selectedTags = [], 
  onChange,
  maxTags = 10,
  onClose
}) => {
  const { t } = useLanguage();
  
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // Основные теги (предложения) - без ! в конце
  const commonTags = [
    'работа', 'здоровье', 'личное', 'проект', 'важное',
    'идея', 'задача', 'встреча', 'обучение', 'отдых'
  ];

  // Ref для очистки URL
  const clearUrlRef = useRef(() => {
    const url = new URL(window.location);
    url.searchParams.delete('tags');
    window.history.replaceState({}, '', url);
  });

  // Передаем функцию очистки наружу
  useEffect(() => {
    if (onClose) {
      onClose({ clearUrl: clearUrlRef.current });
    }
  }, [onClose]);

  // Обновляем URL при изменении тегов
  useEffect(() => {
    if (!Array.isArray(selectedTags) || selectedTags.length === 0) {
      clearUrlRef.current();
      return;
    }

    // Кодируем теги в URL
    const encoded = selectedTags.join(',');
    const url = new URL(window.location);
    url.searchParams.set('tags', encoded);
    window.history.replaceState({}, '', url);
  }, [selectedTags]);

  // Чтение из URL при открытии
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagsParam = params.get('tags');
    
    if (tagsParam && (!selectedTags || selectedTags.length === 0)) {
      try {
        const tagsFromUrl = tagsParam.split(',').filter(tag => tag.trim());
        if (tagsFromUrl.length > 0) {
          onChange(tagsFromUrl);
        }
      } catch (e) {
        console.error('Error parsing tags from URL:', e);
      }
    }
  }, []);

  // Обработка ввода тега
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Показываем предложения
    if (value.trim()) {
      const filtered = commonTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) &&
        !selectedTags.includes(tag) // Не показывать уже выбранные
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Добавление тега
  const addTag = (tagText) => {
    const tag = tagText.trim().toLowerCase();
    
    if (!tag) return;
    
    if (selectedTags.length >= maxTags) {
      alert(t('tags.max_reached', { max: maxTags }));
      return;
    }
    
    if (selectedTags.includes(tag)) {
      setInputValue('');
      setShowSuggestions(false);
      return;
    }
    
    const newTags = [...selectedTags, tag];
    onChange(newTags);
    
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Удаление тега
  const removeTag = (index) => {
    const newTags = selectedTags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  // Очистка всех тегов
  const clearAllTags = () => {
    onChange([]);
    clearUrlRef.current();
  };

  // Выбор тега из предложений
  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  // Обработка клавиш
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Удалить последний тег при пустом инпуте и нажатии Backspace
      const newTags = [...selectedTags];
      newTags.pop();
      onChange(newTags);
    }
  };

  // Клик вне предложений
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSuggestions && !e.target.closest('.tags-picker')) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showSuggestions]);

  return (
    <div className="tags-picker">
      {/* Выбранные теги */}
      {selectedTags.length > 0 && (
        <div className="selected-tags-section">
          <div className="selected-header">
            <span className="selected-count">
              {t('tags.selected')}: {selectedTags.length} / {maxTags}
            </span>
            <button 
              className="clear-all-button btn-secondary" 
              onClick={clearAllTags}
              disabled={selectedTags.length === 0}
            >
              {t('common.clear_all')}
            </button>
          </div>
          
          <div className="selected-tags-list">
            {selectedTags.map((tag, index) => (
              <div key={index} className="selected-tag-item">
                <span className="tag-text">#{tag}</span>
                <button
                  className="remove-tag-button"
                  onClick={() => removeTag(index)}
                  title={t('tags.remove')}
                  aria-label={t('tags.remove')}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ввод нового тега */}
      <div className="tag-input-section">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            className="tag-input"
            placeholder={t('tags.input_placeholder')}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label={t('tags.input_label')}
          />
          {inputValue.trim() && (
            <div className="input-hint">
              {t('tags.press_enter')}
            </div>
          )}
        </div>
        
        {/* Быстрые теги */}
        <div className="quick-tags-section">
          <h4 className="quick-tags-title">{t('tags.popular')}:</h4>
          <div className="quick-tags-grid">
            {commonTags
              .filter(tag => !selectedTags.includes(tag)) // Не показывать выбранные
              .map((tag, index) => (
              <button
                key={index}
                className="quick-tag"
                onClick={() => addTag(tag)}
                disabled={selectedTags.includes(tag)}
                title={t('tags.add_tag', { tag })}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Предложения при вводе */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            <div className="suggestions-header">
              {t('tags.suggestions')}
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
                type="button"
              >
                <span className="suggestion-text">#{suggestion}</span>
                <span className="suggestion-hint">{t('tags.click_to_add')}</span>
              </button>
            ))}
          </div>
        )}
        
        {/* Инструкция */}
        <div className="instructions">
          <p className="instruction-item">
            • {t('tags.instruction_enter')}
          </p>
          <p className="instruction-item">
            • {t('tags.instruction_backspace')}
          </p>
          <p className="instruction-item">
            • {t('tags.instruction_max', { max: maxTags })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TagsPicker;