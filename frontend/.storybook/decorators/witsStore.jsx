// .storybook/decorators/withStores.jsx
import { createContext, useContext } from 'react';

const StoreContext = createContext();
const LanguageContext = createContext();

// Создаем свои хуки
export const useEntriesStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useEntriesStore must be used within StoreProvider');
  }
  return context.entriesStore;
};

export const useUIStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useUIStore must be used within StoreProvider');
  }
  return context.uiStore;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Провайдеры
export const StoreProvider = ({ children, entriesStore, uiStore }) => (
  <StoreContext.Provider value={{ entriesStore, uiStore }}>
    {children}
  </StoreContext.Provider>
);

export const LanguageProvider = ({ children, value }) => (
  <LanguageContext.Provider value={value}>
    {children}
  </LanguageContext.Provider>
);

// Моковые сторе для тестирования
const createMockStore = (initialData = {}) => {
  const { entries = [], currentEntry = null } = initialData;
  
  return {
    entriesStore: {
      entries: [...entries],
      currentEntry,
      isLoading: false,
      error: null,
      
      setCurrentEntry: (entry) => {
        console.log('setCurrentEntry called:', entry);
      },
      
      deleteEntry: async (id) => {
        console.log('deleteEntry called:', id);
        return Promise.resolve();
      },
      
      updateEntry: async (id, data) => {
        console.log('updateEntry called:', id, data);
        return Promise.resolve();
      },
      
      findEntry: (id) => {
        return entries.find(e => e.id === id);
      }
    },
    
    uiStore: {
      modals: {
        entryDetail: false,
        editEntry: false
      },
      
      notifications: [],
      
      openModal: (modalName) => {
        console.log('openModal called:', modalName);
      },
      
      closeModal: (modalName) => {
        console.log('closeModal called:', modalName);
      },
      
      showSuccessMessage: (message) => {
        console.log('showSuccessMessage:', message);
      },
      
      setError: (error) => {
        console.log('setError:', error);
      },
      
      clearError: () => {
        console.log('clearError');
      }
    }
  };
};

// Моковый language
const mockLanguage = {
  t: (key, params = {}) => {
    const translations = {
      'entries.types.dream': 'Сон',
      'entries.types.memory': 'Воспоминание',
      'entries.types.thought': 'Мысль',
      'entries.types.plan': 'План',
      'common.edit': 'Редактировать',
      'common.delete': 'Удалить',
      'common.completed': 'Выполнено',
      'common.overdue': 'Просрочено',
      'common.close': 'Закрыть',
      'time.today': 'Сегодня',
      'time.yesterday': 'Вчера',
      'time.daysAgo': 'дн. назад',
      'entries.detail.deleteConfirmation': 'Удалить запись?',
      'entries.detail.clickToEdit': 'Кликните для редактирования',
      'entries.detail.addEmotions': 'Добавить эмоции',
      'entries.detail.addCircumstances': 'Добавить обстоятельства',
      'entries.detail.addBodyState': 'Добавить состояние тела',
      'entries.detail.addSkills': 'Добавить навыки',
      'entries.detail.addRelations': 'Добавить связи',
      'entries.detail.markAsComplete': 'Отметить как выполненное',
      'entries.detail.markAsIncomplete': 'Отметить как невыполненное',
      'notifications.entryDeleted': 'Запись удалена',
      'notifications.emotionsUpdated': 'Эмоции обновлены',
      'notifications.circumstancesUpdated': 'Обстоятельства обновлены',
      'notifications.bodyStateUpdated': 'Состояние тела обновлено',
      'notifications.skillsUpdated': 'Навыки обновлены',
      'notifications.relationsUpdated': 'Связи обновлены',
      'emotions.picker.title': 'Эмоции',
      'circumstances.picker.title': 'Обстоятельства',
      'body.picker.title': 'Состояние тела',
      'skills.picker.title': 'Навыки',
      'relations.picker.title': 'Связи',
      'common.entryNotFound': 'Запись не найдена'
    };
    
    let translation = translations[key] || key;
    
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  },
  
  language: 'ru',
  
  changeLanguage: (lang) => {
    console.log('changeLanguage called:', lang);
  }
};

// Декоратор
export const withStores = (Story, { args, parameters }) => {
  const entryData = args.entryData || parameters.entryData;
  const entries = entryData ? [entryData] : [];
  
  const stores = createMockStore({ entries });
  
  return (
    <StoreProvider 
      entriesStore={stores.entriesStore}
      uiStore={stores.uiStore}
    >
      <LanguageProvider value={mockLanguage}>
        <div style={{ 
          padding: parameters.layout === 'padded' ? '20px' : '0',
          backgroundColor: parameters.backgrounds?.value || '#f9fafb',
          minHeight: '100vh'
        }}>
          <Story {...args} />
        </div>
      </LanguageProvider>
    </StoreProvider>
  );
};