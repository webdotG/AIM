// ~/aProject/AIM/frontend/src/store/stores/EntryDraftStore.js
import { makeAutoObservable, reaction, toJS } from 'mobx';

export class EntryDraftStore {
  // === ДАННЫЕ ЧЕРНОВИКА ===
  currentDraft = {
    id: `draft_${Date.now()}`,
    type: 'thought',
    content: '',
    eventDate: new Date().toISOString().split('T')[0],
    deadline: null,
    
    // Данные из пикеров
    emotions: [],
    circumstances: [],
    bodyState: {},
    skills: [],
    relations: [],
    tags: [],
    skillProgress: [],
    
    // Метаданные
    lastSaved: null,
    version: '1.0'
  };

  constructor() {
    makeAutoObservable(this);
    
    // Загрузка черновика при инициализации
    this.loadDraft();
    
    // Автосохранение при изменениях
    this.setupAutoSave();
  }

  // === ОСНОВНЫЕ МЕТОДЫ ===

  // Обновление любого поля черновика
  updateDraft = (updates) => {
    this.currentDraft = {
      ...this.currentDraft,
      ...updates,
      lastSaved: new Date().toISOString()
    };
  };

  // Обновление массива данных
  updateArrayField = (fieldName, newArray) => {
    this.updateDraft({ [fieldName]: newArray });
  };

  // Сброс формы
  resetDraft = () => {
    this.currentDraft = {
      id: `draft_${Date.now()}`,
      type: 'thought',
      content: '',
      eventDate: new Date().toISOString().split('T')[0],
      deadline: null,
      emotions: [],
      circumstances: [],
      bodyState: {},
      skills: [],
      relations: [],
      tags: [],
      skillProgress: [],
      lastSaved: null,
      version: '1.0'
    };
    this.clearDraft();
  };

  // === LOCALSTORAGE ===

  setupAutoSave() {
    // Дебаунс 1 секунда
    reaction(
      () => toJS(this.currentDraft),
      (draft) => {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.saveDraft();
        }, 1000);
      },
      { delay: 500 }
    );
  }

  saveDraft = () => {
    try {
      const draftData = {
        ...this.currentDraft,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('entry_draft', JSON.stringify(draftData));
      console.log('Черновик автосохранен');
    } catch (error) {
      console.warn('Не удалось сохранить черновик:', error);
    }
  };

  loadDraft = () => {
    try {
      const draftStr = localStorage.getItem('entry_draft');
      if (!draftStr) return;

      const savedDraft = JSON.parse(draftStr);
      
      // Проверяем не старше 3 дней
      const savedDate = new Date(savedDraft.savedAt || savedDraft.lastSaved);
      const now = new Date();
      const daysDiff = (now - savedDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 3) { // Храним 3 дня
        this.currentDraft = {
          ...this.currentDraft, // дефолтные значения
          ...savedDraft,
          id: `draft_${Date.now()}` // новый ID
        };
        console.log('Черновик загружен из LocalStorage');
      } else {
        this.clearDraft();
      }
    } catch (error) {
      console.warn('Не удалось загрузить черновик:', error);
      this.clearDraft();
    }
  };

  clearDraft = () => {
    localStorage.removeItem('entry_draft');
  };

  // === ВАЛИДАЦИЯ И ХЕЛПЕРЫ ===

  // Проверка валидности
  get isValid() {
    const content = this.currentDraft.content;
    return content && typeof content === 'string' && content.trim().length > 0;
  }

  get hasBodyState() {
    const { hp, energy, location } = this.currentDraft.bodyState;
    return (
      (hp !== undefined && hp !== null && hp > 0) ||
      (energy !== undefined && energy !== null && energy > 0) ||
      (location && location.trim().length > 0)
    );
  }

  get isPlanValid() {
    if (this.currentDraft.type !== 'plan') return true;
    return !!this.currentDraft.deadline;
  }

  // Подсчет выбранных элементов
  get emotionsCount() {
    return this.currentDraft.emotions.length;
  }

  get tagsCount() {
    return this.currentDraft.tags.length;
  }

  get skillsCount() {
    return this.currentDraft.skills.length;
  }

  get relationsCount() {
    return this.currentDraft.relations.length;
  }

  // Экспорт данных для API
  toEntryData() {
    return {
      entry_type: this.currentDraft.type,
      content: this.currentDraft.content.trim(),
      deadline: this.currentDraft.deadline,
      event_date: this.currentDraft.eventDate
    };
  }

  // Импорт данных (для редактирования существующей записи)
  importFromEntry = (entry) => {
    this.currentDraft = {
      ...this.currentDraft,
      id: entry.id,
      type: entry.entry_type,
      content: entry.content,
      deadline: entry.deadline,
      eventDate: entry.event_date || new Date().toISOString().split('T')[0]
      // Остальные поля загружаются через API отдельно
    };
  };
}