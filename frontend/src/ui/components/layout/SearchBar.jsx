// src/ui/components/layout/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react'; // Добавили useRef и useEffect
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import { usePlatform } from '@/layers/platform';
import { useTheme } from '@/layers/theme';
import './SearchBar.css';

const SEARCH_CATEGORIES = {
  ALL: 'all',
  ENTRIES: 'entries',
  SKILLS: 'skills',
  PEOPLE: 'people',
  TAGS: 'tags'
};

const CATEGORY_ICONS = {
  [SEARCH_CATEGORIES.ALL]: 'S', // Search
  [SEARCH_CATEGORIES.ENTRIES]: 'E', // Entries
  [SEARCH_CATEGORIES.SKILLS]: 'S', // Skills
  [SEARCH_CATEGORIES.PEOPLE]: 'P', // People
  [SEARCH_CATEGORIES.TAGS]: '#'
};

const SearchBar = () => {
  const { t } = useLanguage();
  const { isTelegram, utils } = usePlatform();
  const { themeData } = useTheme();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([SEARCH_CATEGORIES.ALL]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Реф для выпадающего списка и кнопки категорий
  const dropdownRef = useRef(null);
  const categoryButtonRef = useRef(null);
  
  // Обработчик клика вне области
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Если клик был вне выпадающего списка И вне кнопки категорий
      if (
        isDropdownOpen &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        categoryButtonRef.current &&
        !categoryButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        
        if (isTelegram && utils?.hapticFeedback) {
          utils.hapticFeedback('light');
        }
      }
    };
    
    // Добавляем обработчик при монтировании
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // Для мобильных
    
    // Убираем обработчик при размонтировании
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isDropdownOpen, isTelegram, utils]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    if (isTelegram && utils?.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    
    // Формируем URL для поиска
    const params = new URLSearchParams();
    params.set('q', searchQuery);
    
    if (!selectedCategories.includes(SEARCH_CATEGORIES.ALL)) {
      params.set('categories', selectedCategories.join(','));
    }
    
    // Переходим на страницу поиска
    navigate(`/search?${params.toString()}`);
    
    // Очищаем поле
    setSearchQuery('');
    setIsDropdownOpen(false);
  };
  
  const toggleCategory = (category) => {
    if (isTelegram && utils?.hapticFeedback) {
      utils.hapticFeedback('light');
    }
    
    if (category === SEARCH_CATEGORIES.ALL) {
      setSelectedCategories([SEARCH_CATEGORIES.ALL]);
    } else {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories.filter(c => c !== SEARCH_CATEGORIES.ALL), category];
      
      setSelectedCategories(newCategories.length > 0 ? newCategories : [SEARCH_CATEGORIES.ALL]);
    }
    
    // Не закрываем дропдаун после выбора категории (оставляем открытым для множественного выбора)
    // setIsDropdownOpen(false);
  };
  
  const toggleDropdown = () => {
    const newState = !isDropdownOpen;
    setIsDropdownOpen(newState);
    
    if (isTelegram && utils?.hapticFeedback) {
      utils.hapticFeedback('light');
    }
  };
  
  const getCategoryLabel = (category) => {
    const labels = {
      [SEARCH_CATEGORIES.ALL]: t('search.all') || 'ВСЕ',
      [SEARCH_CATEGORIES.ENTRIES]: t('search.entries') || 'ЗАПИСИ',
      [SEARCH_CATEGORIES.SKILLS]: t('search.skills') || 'НАВЫКИ',
      [SEARCH_CATEGORIES.PEOPLE]: t('search.people') || 'ЛЮДИ',
      [SEARCH_CATEGORIES.TAGS]: t('search.tags') || 'ТЕГИ'
    };
    return labels[category] || category;
  };
  
  return (
    <div className={`search-bar ${isTelegram ? 'telegram' : 'web'}`}>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          {/* Префикс категорий */}
          <button
            ref={categoryButtonRef} // Добавляем реф
            type="button"
            className="category-prefix"
            onClick={toggleDropdown} // Используем новую функцию
            title={t('search.categories') || 'Категории поиска'}
          >
            {/* <span className="category-icon">
              {selectedCategories.includes(SEARCH_CATEGORIES.ALL) 
                ? CATEGORY_ICONS[SEARCH_CATEGORIES.ALL]
                : selectedCategories.map(cat => CATEGORY_ICONS[cat]).join('')
              }
            </span> */}
            <span className="category-count">
              {selectedCategories.includes(SEARCH_CATEGORIES.ALL) 
                ? '' 
                : selectedCategories.length
              }
            </span>
          </button>
          

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={'ПОИСК...'}
            // placeholder={t('search.placeholder') || 'ПОИСК...'}
            className="search-input"
            aria-label="Поиск"
          />
          
          {/* Кнопка поиска */}
          <button 
            type="submit" 
            className="search-button"
            disabled={!searchQuery.trim()}
            title={t('search.search') || 'Найти'}
          >
            GO
          </button>
        </div>
        
        {isDropdownOpen && (
          <div 
            ref={dropdownRef} 
            className="categories-dropdown"
          >
            <div className="categories-list">
              {Object.values(SEARCH_CATEGORIES).map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`category-option ${
                    selectedCategories.includes(category) ? 'selected' : ''
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  <span className="option-icon">{CATEGORY_ICONS[category]}</span>
                  <span className="option-label">{getCategoryLabel(category)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;