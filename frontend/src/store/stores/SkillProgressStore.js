// store/stores/SkillProgressStore.js
import { makeAutoObservable, runInAction } from 'mobx';
import { SkillsAPIClient } from '../../core/adapters/api/clients/SkillsAPIClient';

export class SkillProgressStore {
  progresses = [];
  isLoading = false;
  error = null;
  
  repository = new SkillsAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  // Добавить прогресс к навыку
  async addProgress(skillId, progressData) {
    try {
      const result = await this.repository.addProgress(skillId, progressData);
      
      runInAction(() => {
        this.progresses.push({
          ...result,
          skillId,
          addedAt: new Date().toISOString()
        });
      });
      
      return result;
    } catch (error) {
      console.error('Failed to add progress:', error);
      throw error;
    }
  }

  // Загрузить историю прогресса
  async fetchProgressHistory(skillId) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const history = await this.repository.getProgressHistory(skillId);
      
      runInAction(() => {
        this.progresses = history;
        this.isLoading = false;
      });
      
      return history;
    } catch (error) {
      runInAction(() => {
        this.error = error.message || 'Failed to fetch progress history';
        this.isLoading = false;
      });
      throw error;
    }
  }

  // Создать временный прогресс (без сохранения в БД)
  createTemporaryProgress(skill, experience, description = '') {
    const tempProgress = {
      id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      skill: {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        level: skill.level
      },
      experience_gained: experience,
      description: description,
      created_at: new Date().toISOString(),
      isTemp: true
    };
    
    runInAction(() => {
      this.progresses.push(tempProgress);
    });
    
    return tempProgress;
  }

  // Удалить прогресс
  removeProgress(progressId) {
    this.progresses = this.progresses.filter(p => p.id !== progressId);
  }

  // Очистить все прогрессы
  clearAllProgresses() {
    this.progresses = [];
  }

  // Получить общий опыт
  get totalExperience() {
    return this.progresses.reduce((total, p) => total + (p.experience_gained || 0), 0);
  }

  // Получить количество навыков с прогрессом
  get uniqueSkillsCount() {
    const skillIds = new Set(this.progresses.map(p => p.skill?.id).filter(Boolean));
    return skillIds.size;
  }

  // Кодировать в URL
  encodeToUrl() {
    if (this.progresses.length === 0) return '';
    
    return this.progresses.map(progress => {
      const skillId = progress.skill?.id || '';
      const exp = progress.experience_gained || 0;
      const desc = encodeURIComponent(progress.description || '');
      return `${skillId}:${exp}:${desc}`;
    }).join(';');
  }

  // Декодировать из URL
  decodeFromUrl(urlParam, availableSkills = []) {
    if (!urlParam) return [];
    
    return urlParam.split(';')
      .map(part => {
        const [skillId, exp, desc] = part.split(':');
        const skill = availableSkills.find(s => s.id === skillId);
        
        if (!skill) return null;
        
        return {
          id: `url_${skillId}_${Date.now()}`,
          skill: {
            id: skill.id,
            name: skill.name,
            icon: skill.icon
          },
          experience_gained: parseInt(exp) || 0,
          description: decodeURIComponent(desc || ''),
          created_at: new Date().toISOString(),
          fromUrl: true
        };
      })
      .filter(Boolean);
  }
}