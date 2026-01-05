// ~/aProject/AIM/frontend/src/ui/components/tags/TagsPicker.jsx
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useTagsStore } from '@/store/StoreContext';
import './TagsPicker.css';

const TagsPicker = observer(({ 
  // Режим 1: Автономный (для переиспользования)
  selectedTags = [], 
  onChange,
  onClose,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'tags',
  
  // Общие пропсы
  maxTags = 10
}) => {
  const { t } = useLanguage();
  const tagsStore = useTagsStore();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущие данные
  const currentSelection = isDraftMode 
    ? draftStore.currentDraft[draftField] || []
    : selectedTags || [];
  
  // Локальное состояние UI
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Основные теги (предложения) - без ! в конце
  const commonTags = useMemo(() => [
    'работа', 'здоровье', 'личное', 'проект', 'важное',
    'идея', 'задача', 'встреча', 'обучение', 'отдых'
  ], []);

  // Загрузка популярных тегов из API
  useEffect(() => {
    const loadPopularTags = async () => {
      try {
        setIsLoading(true);
        await tagsStore.fetchPopularTags();
      } catch (error) {
        console.warn('Failed to load popular tags:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPopularTags();
  }, [tagsStore]);

  // Получаем популярные теги из стора или используем fallback
  const popularTags = useMemo(() => {
    if (tagsStore.popularTags && tagsStore.popularTags.length > 0) {
      return tagsStore.popularTags.map(tag => tag.name);
    }
    return commonTags;
  }, [tagsStore.popularTags, commonTags]);

  // Обработчик обновления выбора
  const handleChange = useCallback((newTags) => {
    if (isDraftMode) {
      draftStore.updateDraft({ [draftField]: newTags });
    } else {
      onChange?.(newTags);
    }
  }, [isDraftMode, draftStore, draftField, onChange]);

  // Обработка ввода тега
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);
    setLocalError(null);
    
    // Показываем предложения
    if (value.trim()) {
      const filtered = popularTags.filter(tag => 
        tag.toLowerCase().includes(value.toLowerCase()) &&
        !currentSelection.includes(tag) // Не показывать уже выбранные
      ).slice(0, 5); // Ограничиваем количество
      
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [currentSelection, popularTags]);

  // Добавление тега
  const addTag = useCallback((tagText) => {
    const tag = tagText.trim().toLowerCase();
    
    if (!tag) {
      setLocalError(t('tags.empty_tag'));
      return;
    }
    
    // Валидация тега
    if (tag.length < 2) {
      setLocalError(t('tags.too_short'));
      return;
    }
    
    if (tag.length > 50) {
      setLocalError(t('tags.too_long'));
      return;
    }
    
    if (currentSelection.length >= maxTags) {
      setLocalError(t('tags.max_reached', { max: maxTags }));
      return;
    }
    
    if (currentSelection.includes(tag)) {
      setLocalError(t('tags.already_added'));
      return;
    }
    
    const newTags = [...currentSelection, tag];
    handleChange(newTags);
    
    // Сброс UI состояния
    setInputValue('');
    setShowSuggestions(false);
    setLocalError(null);
    
    // Фокус на инпут
    setTimeout(() => {
      const input = document.querySelector('.tag-input');
      if (input) input.focus();
    }, 0);
  }, [currentSelection, maxTags, handleChange, t]);

  // Удаление тега
  const removeTag = useCallback((index) => {
    const newTags = currentSelection.filter((_, i) => i !== index);
    handleChange(newTags);
    setLocalError(null);
  }, [currentSelection, handleChange]);

  // Очистка всех тегов
  const clearAllTags = useCallback(() => {
    handleChange([]);
    setLocalError(null);
  }, [handleChange]);

  // Выбор тега из предложений
  const handleSuggestionClick = useCallback((suggestion) => {
    addTag(suggestion);
  }, [addTag]);

  // Обработка клавиш
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Backspace' && !inputValue && currentSelection.length > 0) {
      // Удалить последний тег при пустом инпуте и нажатии Backspace
      const newTags = [...currentSelection];
      newTags.pop();
      handleChange(newTags);
    }
  }, [inputValue, currentSelection, addTag, handleChange]);

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

  // Быстрые теги (исключая уже выбранные)
  const availableQuickTags = useMemo(() => 
    popularTags.filter(tag => !currentSelection.includes(tag)),
    [popularTags, currentSelection]
  );

  return (
    <div className="tags-picker">
      {/* Выбранные теги */}
      {currentSelection.length > 0 && (
        <div className="selected-tags-section">
          <div className="selected-header">
            <span className="selected-count">
              {t('tags.selected')}: {currentSelection.length} / {maxTags}
            </span>
            <button 
              className="clear-all-button btn-secondary" 
              onClick={clearAllTags}
              disabled={currentSelection.length === 0}
            >
              {t('common.clear_all')}
            </button>
          </div>
          
          <div className="selected-tags-list">
            {currentSelection.map((tag, index) => (
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

      {/* Ошибки */}
      {localError && (
        <div className="error-message">{localError}</div>
      )}

      {/* Ввод нового тега */}
      <div className="tag-input-section">
        <div className="input-wrapper">
          <input
            type="text"
            className="tag-input"
            placeholder={t('tags.input_placeholder')}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            aria-label={t('tags.input_label')}
            disabled={isLoading}
          />
          {inputValue.trim() && (
            <div className="input-hint">
              {t('tags.press_enter')}
            </div>
          )}
          {isLoading && (
            <div className="loading-indicator">
              {t('common.loading')}...
            </div>
          )}
        </div>
        
        {/* Быстрые теги */}
        {availableQuickTags.length > 0 && (
          <div className="quick-tags-section">
            <h4 className="quick-tags-title">{t('tags.popular')}:</h4>
            <div className="quick-tags-grid">
              {availableQuickTags.slice(0, 8).map((tag, index) => (
                <button
                  key={index}
                  className="quick-tag"
                  onClick={() => addTag(tag)}
                  disabled={currentSelection.includes(tag)}
                  title={t('tags.add_tag', { tag })}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
        
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
});

export default TagsPicker;