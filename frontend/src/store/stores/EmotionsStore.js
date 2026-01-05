// ~/aProject/AIM/frontend/src/store/stores/EmotionsStore.js
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { EmotionsAPIClient } from '@/core/adapters/api/clients/EmotionsAPIClient';

export class EmotionsStore {
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.api = new EmotionsAPIClient();
    makeAutoObservable(this);
    
    // Загрузка справочника при инициализации
    this.loadEmotionsCatalog();
    
    // Загрузка черновика
    this.loadDraft();
  }

  // ========== СОСТОЯНИЕ ==========
  
  // Справочник эмоций (27 шт)
  emotionsCatalog = [];
  isLoadingCatalog = false;
  catalogError = null;

  // Категории (из справочника)
  categories = [];

  // Текущая выборка для формы
  currentSelection = [];

  // ========== ACTIONS ==========

  // Загрузка справочника из API
  loadEmotionsCatalog = async () => {
    this.isLoadingCatalog = true;
    this.catalogError = null;
    
    try {
      const response = await this.api.getAll();
      
      runInAction(() => {
        this.emotionsCatalog = response.data || [];
        this.extractCategories();
        console.log(`Загружено ${this.emotionsCatalog.length} эмоций из справочника`);
      });
    } catch (error) {
      runInAction(() => {
        this.catalogError = error.message;
        console.error('Ошибка загрузки справочника эмоций:', error);
        
        // Fallback - базовые эмоции если API недоступен
        if (this.emotionsCatalog.length === 0) {
          this.emotionsCatalog = this.getFallbackEmotions();
          this.extractCategories();
        }
      });
    } finally {
      runInAction(() => {
        this.isLoadingCatalog = false;
      });
    }
  };

  // Извлечение категорий из справочника
  extractCategories = () => {
    const uniqueCategories = [...new Set(this.emotionsCatalog.map(e => e.category))];
    
    this.categories = uniqueCategories.map(cat => {
      // Маппинг для отображения
      const mapping = {
        'positive': { id: 'positive', label: 'Положительные', icon: '⊕', description: 'Позитивные эмоции' },
        'negative': { id: 'negative', label: 'Отрицательные', icon: '⊖', description: 'Негативные эмоции' },
        'neutral': { id: 'neutral', label: 'Нейтральные', icon: '⊙', description: 'Нейтральные эмоции' }
      };
      
      return mapping[cat] || { id: cat, label: cat, icon: '?' };
    });
  };

  // Получить эмоции по категории
  getEmotionsByCategory = (categoryId) => {
    return this.emotionsCatalog
      .filter(emotion => emotion.category === categoryId)
      .map(emotion => ({
        id: emotion.id,
        name_en: emotion.name_en,
        name_ru: emotion.name_ru,
        category: emotion.category,
        icon: this.getEmotionIcon(emotion.name_en),
        label: emotion.name_ru || emotion.name_en
      }));
  };

  // Получить иконку для эмоции (можно вынести в конфиг)
  getEmotionIcon = (nameEn) => {
    const iconMap = {
      'joy': 'J',
      'sadness': 'S',
      'anger': 'A',
      'fear': 'F',
      'surprise': 'SP',
      'disgust': 'D',
      'trust': 'T',
      'anticipation': 'AN',
      'admiration': 'AD',
      'adoration': 'AR',
      'aesthetic_appreciation': 'Æ',
      'amusement': 'AM',
      'anxiety': 'AX',
      'awe': 'AW',
      'awkwardness': 'AK',
      'boredom': 'B',
      'calmness': 'C',
      'confusion': 'CF',
      'craving': 'CR',
      'empathic_pain': 'EP',
      'entrancement': 'EN',
      'envy': 'EY',
      'excitement': 'EX',
      'horror': 'H',
      'interest': 'I',
      'nostalgia': 'N',
      'romance': 'RM',
      'sexual_desire': 'SX',
      'relief': 'R',
      'satisfaction': 'SF'
    };
    
    return iconMap[nameEn] || nameEn.substring(0, 2).toUpperCase();
  };

  // ========== РАБОТА С ВЫБОРКОЙ ==========

  // Добавить эмоцию в текущую выборку
  addEmotion = (categoryId, emotionId, intensity = 50) => {
    const emotion = this.emotionsCatalog.find(e => e.id === emotionId);
    const category = this.categories.find(c => c.id === categoryId);
    
    if (!emotion || !category) {
      console.error('Эмоция или категория не найдены');
      return;
    }

    const newSelection = {
      id: `${categoryId}_${emotionId}_${Date.now()}`,
      category: {
        id: category.id,
        label: category.label,
        icon: category.icon
      },
      emotion: {
        id: emotion.id,
        name_en: emotion.name_en,
        name_ru: emotion.name_ru,
        icon: this.getEmotionIcon(emotion.name_en),
        label: emotion.name_ru || emotion.name_en
      },
      intensity: Math.min(Math.max(intensity, 1), 100) // 1-100
    };

    this.currentSelection = [...this.currentSelection, newSelection];
    this.saveDraft();
  };

  // Обновить интенсивность
  updateEmotionIntensity = (selectionId, intensity) => {
    this.currentSelection = this.currentSelection.map(item => 
      item.id === selectionId 
        ? { ...item, intensity: Math.min(Math.max(intensity, 1), 100) }
        : item
    );
    this.saveDraft();
  };

  // Удалить эмоцию из выборки
  removeEmotion = (selectionId) => {
    this.currentSelection = this.currentSelection.filter(item => item.id !== selectionId);
    this.saveDraft();
  };

  // Очистить все
  clearSelection = () => {
    this.currentSelection = [];
    this.clearDraft();
  };

  // ========== АДАПТЕРЫ ДЛЯ API ==========

  // Конвертировать текущую выборку в формат API
  convertToAPIFormat = () => {
    return this.currentSelection.map(item => ({
      emotion_id: item.emotion.id,
      intensity: Math.round(item.intensity / 10) // Конвертируем 1-100 в 1-10
    }));
  };

  // Сохранить эмоции к записи через API
  saveToEntry = async (entryId) => {
    if (this.currentSelection.length === 0) {
      return true; // Нет эмоций - ничего не делаем
    }

    const emotionsData = this.convertToAPIFormat();
    
    try {
      await this.api.attachToEntry(entryId, emotionsData);
      console.log(`Эмоции сохранены для записи ${entryId}`);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения эмоций:', error);
      throw error;
    }
  };

  // ========== LOCALSTORAGE (ЧЕРНОВИКИ) ==========

  // Сохранить черновик
  saveDraft = () => {
    try {
      const draftData = {
        selection: toJS(this.currentSelection),
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('emotions_draft', JSON.stringify(draftData));
      console.log('Черновик эмоций сохранен');
    } catch (error) {
      console.warn('Не удалось сохранить черновик:', error);
    }
  };

  // Загрузить черновик
  loadDraft = () => {
    try {
      const draftStr = localStorage.getItem('emotions_draft');
      if (!draftStr) return;

      const draftData = JSON.parse(draftStr);
      
      // Проверяем не старше 24 часов
      const draftDate = new Date(draftData.timestamp);
      const now = new Date();
      const hoursDiff = (now - draftDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        this.currentSelection = draftData.selection;
        console.log('Черновик эмоций загружен');
      } else {
        this.clearDraft();
      }
    } catch (error) {
      console.warn('Не удалось загрузить черновик:', error);
    }
  };

  // Очистить черновик
  clearDraft = () => {
    localStorage.removeItem('emotions_draft');
  };

  // ========== FALLBACK DATA ==========

  // Запасные эмоции если API не доступен
  getFallbackEmotions = () => {
    return [
      { id: 1, name_en: 'joy', name_ru: 'радость', category: 'positive' },
      { id: 2, name_en: 'sadness', name_ru: 'грусть', category: 'negative' },
      { id: 3, name_en: 'anger', name_ru: 'гнев', category: 'negative' },
      { id: 4, name_en: 'fear', name_ru: 'страх', category: 'negative' },
      { id: 5, name_en: 'surprise', name_ru: 'удивление', category: 'neutral' },
      { id: 6, name_en: 'disgust', name_ru: 'отвращение', category: 'negative' },
      { id: 7, name_en: 'trust', name_ru: 'доверие', category: 'positive' },
      { id: 8, name_en: 'anticipation', name_ru: 'предвкушение', category: 'neutral' }
    ];
  };

  // ========== COMPUTED ==========

  // Получить эмоции для рендера по категориям
  get categorizedEmotions() {
    const result = {};
    this.categories.forEach(cat => {
      result[cat.id] = this.getEmotionsByCategory(cat.id);
    });
    return result;
  }

  // Проверить есть ли выбор
  get hasSelection() {
    return this.currentSelection.length > 0;
  }

  // Количество выбранных эмоций
  get selectionCount() {
    return this.currentSelection.length;
  }
}