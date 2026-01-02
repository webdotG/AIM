// SkillsStore.js
import { makeAutoObservable, runInAction, computed } from 'mobx';
import { SkillsAPIClient } from '../../core/adapters/api/clients/SkillsAPIClient';

export class SkillsStore {

  skills = [];
  categories = [];
  topSkills = [];
  
  userProgress = new Map(); // skillId -> progressData

  isLoading = false;
  error = null;
  

  selectedSkillIds = new Set();
  
  filters = {
    categoryId: null,
    search: '',
    sort: 'popular', // 'popular', 'name', 'recent', 'level'
    showOnlySelected: false
  };

  repository = new SkillsAPIClient();

  constructor() {
    makeAutoObservable(this, {
      // Вычисляемые свойства
      filteredSkills: computed,
      selectedSkills: computed,
      skillsWithProgress: computed,
      availableCategories: computed,
      totalSelected: computed,
      canAddMore: computed,
    });
  }

  // ==================== ВЗАИМОДЕЙСТВИЕ ====================

  async fetchSkills(params = {}) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await this.repository.getAll(params);
      
      runInAction(() => {
        this.skills = response;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Failed to fetch skills';
        this.isLoading = false;
      });
    }
  }

  async fetchCategories() {
    try {
      const categories = await this.repository.getCategories();
      
      runInAction(() => {
        this.categories = categories;
      });
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }

  async fetchTopSkills(limit = 10) {
    try {
      const skills = await this.repository.getTopSkills(limit);
      
      runInAction(() => {
        this.topSkills = skills;
      });
    } catch (error) {
      console.error('Failed to fetch top skills', error);
    }
  }

  async fetchUserProgress(skillId = null) {
    try {
      if (skillId) {
        const progress = await this.repository.getProgressHistory(skillId);
        runInAction(() => {
          this.userProgress.set(skillId, progress);
        });
      } else {
        // прогресс для всех выбранных навыков
        const promises = Array.from(this.selectedSkillIds).map(id =>
          this.repository.getProgressHistory(id)
        );
        const results = await Promise.all(promises);
        
        runInAction(() => {
          results.forEach((progress, index) => {
            const skillId = Array.from(this.selectedSkillIds)[index];
            this.userProgress.set(skillId, progress);
          });
        });
      }
    } catch (error) {
      console.error('Failed to fetch user progress', error);
    }
  }

  async createSkill(skillData) {
    try {
      const newSkill = await this.repository.create(skillData);
      
      runInAction(() => {
        this.skills.push(newSkill);
      });
      
      return newSkill;
    } catch (error) {
      console.error('Failed to create skill', error);
      throw error;
    }
  }

  async addProgress(skillId, progressData) {
    try {
      const result = await this.repository.addProgress(skillId, progressData);
      
      runInAction(() => {
        // прогресс
        const currentProgress = this.userProgress.get(skillId) || [];
        this.userProgress.set(skillId, [...currentProgress, result]);
        
        // навык
        const skillIndex = this.skills.findIndex(s => s.id === skillId);
        if (skillIndex !== -1) {
          // последний прогресс в навыке
          this.skills[skillIndex].lastProgress = result;
        }
      });
      
      return result;
    } catch (error) {
      console.error('Failed to add progress', error);
      throw error;
    }
  }

  // ==================== ВЫБРАННЫМИ ====================

  toggleSkillSelection(skillId) {
    if (this.selectedSkillIds.has(skillId)) {
      this.selectedSkillIds.delete(skillId);
    } else {
      this.selectedSkillIds.add(skillId);
    }
  }

  addSkillToSelection(skillId) {
    this.selectedSkillIds.add(skillId);
  }

  removeSkillFromSelection(skillId) {
    this.selectedSkillIds.delete(skillId);
  }

  clearSelection() {
    this.selectedSkillIds.clear();
  }

  setSelection(skillIds) {
    this.selectedSkillIds = new Set(skillIds);
  }

  // ==================== ФИЛЬТРАЦИЯ ====================

  setFilter(filterName, value) {
    this.filters[filterName] = value;
  }

  clearFilters() {
    this.filters = {
      categoryId: null,
      search: '',
      sort: 'popular',
      showOnlySelected: false
    };
  }

  // ==================== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ====================

  get filteredSkills() {
    let result = [...this.skills];
    
    if (this.filters.categoryId) {
      result = result.filter(skill => skill.category_id === this.filters.categoryId);
    }
    
    if (this.filters.search) {
      const searchLower = this.filters.search.toLowerCase();
      result = result.filter(skill =>
        skill.name.toLowerCase().includes(searchLower) ||
        skill.description?.toLowerCase().includes(searchLower) ||
        skill.category?.name?.toLowerCase().includes(searchLower)
      );
    }
    
    if (this.filters.showOnlySelected) {
      result = result.filter(skill => this.selectedSkillIds.has(skill.id));
    }
    
    // Сортировка
    switch (this.filters.sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'level':
        result.sort((a, b) => {
          const aLevel = this.getSkillLevel(a.id);
          const bLevel = this.getSkillLevel(b.id);
          return bLevel - aLevel;
        });
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
        break;
    }
    
    return result;
  }

  get selectedSkills() {
    return this.skills.filter(skill => this.selectedSkillIds.has(skill.id));
  }

  get skillsWithProgress() {
    return this.skills.map(skill => ({
      ...skill,
      progress: this.userProgress.get(skill.id) || [],
      currentLevel: this.getSkillLevel(skill.id)
    }));
  }

  get availableCategories() {
    return this.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      description: cat.description
    }));
  }

  get totalSelected() {
    return this.selectedSkillIds.size;
  }

  get canAddMore() {
    return (maxSkills) => this.selectedSkillIds.size < maxSkills;
  }

  // ==================== УТИЛИТЫ ====================

  getSkillLevel(skillId) {
    const progress = this.userProgress.get(skillId);
    if (!progress || progress.length === 0) return 0;
    
    // логика расчета уровня по прогрессу
    const totalPoints = progress.reduce((sum, p) => sum + (p.points || 0), 0);
    
    if (totalPoints >= 1000) return 5; // Мастер
    if (totalPoints >= 500) return 4;  // Продвинутый
    if (totalPoints >= 200) return 3;  // Средний
    if (totalPoints >= 50) return 2;   // Начинающий
    return 1;                          // Новичок
  }

  getSkillProgress(skillId) {
    return this.userProgress.get(skillId) || [];
  }

  isSkillSelected(skillId) {
    return this.selectedSkillIds.has(skillId);
  }

  // использования в URL как в EmotionPicker
  encodeSelectedToUrl() {
    if (this.selectedSkillIds.size === 0) return '';
    
    const skillIds = Array.from(this.selectedSkillIds);
    return skillIds.join(';');
  }

  decodeFromUrl(urlParam) {
    if (!urlParam) return new Set();
    
    const skillIds = urlParam.split(';').filter(id => id.trim());
    return new Set(skillIds);
  }
}