import { makeAutoObservable, runInAction } from 'mobx';
import { SkillsAPIClient } from '../../core/adapters/api/clients/SkillsAPIClient';

export class SkillsStore {
  skills = [];
  currentSkill = null;
  isLoading = false;
  error = null;
  categories = [];
  topSkills = [];

  repository = new SkillsAPIClient();

  constructor() {
    makeAutoObservable(this);
  }

  async fetchSkills(filters = {}) {
    this.isLoading = true;
    this.error = null;
    
    try {
      const response = await this.repository.getAll(filters);
      
      runInAction(() => {
        this.skills = response.skills;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.error || 'Failed to fetch skills';
        this.isLoading = false;
      });
    }
  }

  async createSkill(data) {
    try {
      const skill = await this.repository.create(data);
      
      runInAction(() => {
        this.skills.push(skill);
      });
      
      return skill;
    } catch (error) {
      throw error;
    }
  }

  async addProgress(skillId, progressData) {
    try {
      const result = await this.repository.addProgress(skillId, progressData);
      
      runInAction(() => {
        // Обновляем навык в списке
        const index = this.skills.findIndex(s => s.id === skillId);
        if (index !== -1) {
          this.skills[index] = result.skill;
        }
        if (this.currentSkill?.id === skillId) {
          this.currentSkill = result.skill;
        }
      });
      
      return result;
    } catch (error) {
      throw error;
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
      const topSkills = await this.repository.getTopSkills(limit);
      
      runInAction(() => {
        this.topSkills = topSkills;
      });
    } catch (error) {
      console.error('Failed to fetch top skills', error);
    }
  }

  // Computed
  get masterSkills() {
    return this.skills.filter(s => s.getLevelTier() === 'master');
  }

  get beginnerSkills() {
    return this.skills.filter(s => s.getLevelTier() === 'beginner');
  }
}