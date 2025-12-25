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

  // Основные теги (предложения)
  const commonTags = [
    'важно!', 'работа!', 'личное!', 'здоровье!', 'учёба!',
    'путешествие!', 'семья!', 'друзья!', 'творчество!', 'финансы!',
    'спорт!', 'еда!', 'книги!', 'фильмы!', 'музыка!',
    'программирование!', 'дизайн!', 'бизнес!', 'медитация!', 'сон!'
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
    
    // Если ввели восклицательный знак в конце
    if (value.endsWith('!')) {
      addTag(value.slice(0, -1)); // Убираем !
      return;
    }
    
    // Показываем предложения
    if (value.trim()) {
      const filtered = commonTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Добавление тега
  const addTag = (tagText) => {
    const tag = tagText.trim();
    
    if (!tag) return;
    
    if (selectedTags.length >= maxTags) {
      alert(`Максимум ${maxTags} тегов`);
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
    addTag(suggestion.slice(0, -1)); // Убираем ! из предложения
  };

  // Обработка клавиш
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim() && !inputValue.endsWith('!')) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="tags-picker">
      {/* Выбранные теги */}
      {selectedTags.length > 0 && (
        <div className="selected-tags-section">
          <div className="selected-header">
            <span className="selected-count">
              Выбрано: {selectedTags.length} / {maxTags}
            </span>
            <button className="clear-all-button" onClick={clearAllTags}>
              Очистить все
            </button>
          </div>
          
          <div className="selected-tags-list">
            {selectedTags.map((tag, index) => (
              <div key={index} className="selected-tag-item">
                <span className="tag-text">#{tag}</span>
                <button
                  className="remove-tag-button"
                  onClick={() => removeTag(index)}
                  title="Удалить тег"
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
            type="text"
            className="tag-input"
            placeholder="Введите тег и поставьте ! в конце (например: работа!)"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          {inputValue && !inputValue.endsWith('!') && (
            <div className="input-hint">
              Поставьте <span className="hint-example">!</span> в конце для добавления
            </div>
          )}
        </div>
        
        {/* Быстрые теги */}
        <div className="quick-tags-section">
          <h4 className="quick-tags-title">Популярные теги:</h4>
          <div className="quick-tags-grid">
            {commonTags.map((tag, index) => (
              <button
                key={index}
                className={`quick-tag ${selectedTags.includes(tag.slice(0, -1)) ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(tag)}
                disabled={selectedTags.includes(tag.slice(0, -1))}
              >
                #{tag.slice(0, -1)}
                {selectedTags.includes(tag.slice(0, -1)) && (
                  <span className="quick-tag-check"></span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Предложения при вводе */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <span className="suggestion-text">#{suggestion.slice(0, -1)}</span>
                <span className="suggestion-hint">Нажмите или введите !</span>
              </div>
            ))}
          </div>
        )}
        
        {/* Инструкция */}
        <div className="instructions">
          <p className="instruction-item">
            • Введите тег и поставьте <strong>!</strong> в конце для добавления
          </p>
          <p className="instruction-item">
            • Или нажмите на тег из списка популярных
          </p>
          <p className="instruction-item">
            • Максимум тегов: <strong>{maxTags}</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TagsPicker;