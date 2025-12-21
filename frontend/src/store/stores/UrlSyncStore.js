import { makeAutoObservable, autorun } from 'mobx';

class UrlSyncStore {
  constructor() {
    makeAutoObservable(this);
    
    // Автоматически синхронизируем стор с URL
    autorun(() => {
      this.syncToUrl();
    });
    
    // Читаем из URL при инициализации
    this.readFromUrl();
    
    // Слушаем изменения URL
    window.addEventListener('popstate', () => {
      this.readFromUrl();
    });
  }

  // Данные формы
  type = 'thought';
  content = '';
  eventDate = '';
  deadline = '';
  emotions = [];
  circumstances = [];
  bodyState = null;
  skills = [];
  relations = [];
  tags = [];
  skillProgress = [];

  // Методы для обновления данных
  setType(type) {
    this.type = type;
  }

  setContent(content) {
    this.content = content;
  }

  setEventDate(date) {
    this.eventDate = date;
  }

  setDeadline(deadline) {
    this.deadline = deadline;
  }

  setEmotions(emotions) {
    this.emotions = emotions;
  }

  setCircumstances(circumstances) {
    this.circumstances = circumstances;
  }

  setBodyState(bodyState) {
    this.bodyState = bodyState;
  }

  setSkills(skills) {
    this.skills = skills;
  }

  setRelations(relations) {
    this.relations = relations;
  }

  setTags(tags) {
    this.tags = tags;
  }

  setSkillProgress(progress) {
    this.skillProgress = progress;
  }

  // Сброс всех данных
  reset() {
    this.type = 'thought';
    this.content = '';
    this.eventDate = '';
    this.deadline = '';
    this.emotions = [];
    this.circumstances = [];
    this.bodyState = null;
    this.skills = [];
    this.relations = [];
    this.tags = [];
    this.skillProgress = [];
    
    // Очищаем URL
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Чтение данных из URL
  readFromUrl() {
    const params = new URLSearchParams(window.location.search);
    
    // Основные поля
    this.type = params.get('type') || 'thought';
    this.content = decodeURIComponent(params.get('content') || '');
    this.eventDate = params.get('date') || '';
    this.deadline = params.get('deadline') || '';
    
    // Парсим данные пикеров
    this.emotions = this.parseEmotionsFromUrl(params.get('emo'));
    this.circumstances = this.parseCircumstancesFromUrl(params.get('circ'));
    this.bodyState = this.parseBodyStateFromUrl(params.get('body'));
    this.skills = this.parseSkillsFromUrl(params.get('skills'));
    this.relations = this.parseRelationsFromUrl(params.get('rel'));
    this.tags = this.parseTagsFromUrl(params.get('tags'));
    this.skillProgress = this.parseSkillProgressFromUrl(params.get('skill_progress'));
  }

  // Парсинг данных пикеров из URL
  parseEmotionsFromUrl(emoParam) {
    if (!emoParam) return [];
    
    try {
      return emoParam.split(';').map(part => {
        const catCode = part[0];
        const emotionCode = part.substring(1, 3);
        const intensity = parseInt(part.substring(3)) || 50;
        
        let categoryId;
        switch(catCode) {
          case '+': categoryId = 'positive'; break;
          case '-': categoryId = 'negative'; break;
          case '0': categoryId = 'neutral'; break;
          default: categoryId = 'neutral';
        }
        
        return {
          category: { id: categoryId },
          emotion: { id: 'emotion' },
          intensity
        };
      });
    } catch (e) {
      console.error('Error parsing emotions from URL:', e);
      return [];
    }
  }

  parseCircumstancesFromUrl(circParam) {
    if (!circParam) return [];
    
    try {
      return circParam.split(';').map(part => {
        const [catCode, itemCode, intensityStr, tempFlag] = part.split(':');
        const intensity = parseInt(intensityStr) || 50;
        const isTemperature = tempFlag === 't';
        
        let categoryId;
        switch(catCode) {
          case 'w': categoryId = 'weather'; break;
          case 'm': categoryId = 'moon'; break;
          case 'e': categoryId = 'events'; break;
          default: categoryId = 'general';
        }
        
        return {
          category: { id: categoryId },
          item: { id: 'item' },
          intensity,
          isTemperature
        };
      });
    } catch (e) {
      console.error('Error parsing circumstances from URL:', e);
      return [];
    }
  }

  parseBodyStateFromUrl(bodyParam) {
    if (!bodyParam || bodyParam === '0|0|') return null;
    
    try {
      const [hp, energy, location] = bodyParam.split('|');
      return {
        hp: parseInt(hp) || 0,
        energy: parseInt(energy) || 0,
        location: location || ''
      };
    } catch (e) {
      console.error('Error parsing body state from URL:', e);
      return null;
    }
  }

  parseSkillsFromUrl(skillsParam) {
    if (!skillsParam) return [];
    
    try {
      return skillsParam.split(';').map(part => {
        const [catCode, skillCode, expStr, levelStr] = part.split(':');
        const experience = parseInt(expStr) || 50;
        const level = parseInt(levelStr) || 1;
        
        let categoryId;
        switch(catCode) {
          case 'p': categoryId = 'physical'; break;
          case 'm': categoryId = 'mental'; break;
          case 's': categoryId = 'social'; break;
          case 'c': categoryId = 'creative'; break;
          case 't': categoryId = 'technical'; break;
          default: categoryId = 'general';
        }
        
        return {
          category: { id: categoryId },
          skill: { id: 'skill' },
          experience,
          level
        };
      });
    } catch (e) {
      console.error('Error parsing skills from URL:', e);
      return [];
    }
  }

  parseRelationsFromUrl(relParam) {
    if (!relParam) return [];
    
    try {
      return relParam.split(';').map(part => {
        const [direction, typeId, entryIdCode, desc] = part.split(':');
        const description = decodeURIComponent(desc || '');
        
        return {
          direction,
          type: { id: typeId },
          targetEntry: { id: 'entry' },
          description
        };
      });
    } catch (e) {
      console.error('Error parsing relations from URL:', e);
      return [];
    }
  }

  parseTagsFromUrl(tagsParam) {
    if (!tagsParam) return [];
    return tagsParam.split(',').filter(tag => tag.trim());
  }

  parseSkillProgressFromUrl(progressParam) {
    if (!progressParam) return [];
    
    try {
      return progressParam.split(';').map(part => {
        const [skillId, expStr] = part.split(':');
        const experience_gained = parseInt(expStr) || 10;
        
        return {
          skill: { id: skillId },
          experience_gained,
          progress_type: 'practice'
        };
      });
    } catch (e) {
      console.error('Error parsing skill progress from URL:', e);
      return [];
    }
  }

  // Синхронизация данных в URL
  syncToUrl() {
    const url = new URL(window.location);
    
    // Основные поля
    if (this.type && this.type !== 'thought') {
      url.searchParams.set('type', this.type);
    } else {
      url.searchParams.delete('type');
    }
    
    if (this.content.trim()) {
      url.searchParams.set('content', encodeURIComponent(this.content));
    } else {
      url.searchParams.delete('content');
    }
    
    if (this.eventDate) {
      url.searchParams.set('date', this.eventDate);
    } else {
      url.searchParams.delete('date');
    }
    
    if (this.deadline) {
      url.searchParams.set('deadline', this.deadline);
    } else {
      url.searchParams.delete('deadline');
    }
    
    // Пикеры
    this.syncEmotionsToUrl(url);
    this.syncCircumstancesToUrl(url);
    this.syncBodyStateToUrl(url);
    this.syncSkillsToUrl(url);
    this.syncRelationsToUrl(url);
    this.syncTagsToUrl(url);
    this.syncSkillProgressToUrl(url);
    
    window.history.replaceState({}, '', url);
  }

  // Синхронизация каждого пикера
  syncEmotionsToUrl(url) {
    if (this.emotions.length === 0) {
      url.searchParams.delete('emo');
      return;
    }
    
    const encoded = this.emotions.map(em => {
      const catCode = em.category.id === 'positive' ? '+' : 
                     em.category.id === 'negative' ? '-' : '0';
      const emotionCode = em.emotion?.id?.substring(0, 2) || 'gn';
      return `${catCode}${emotionCode}${em.intensity}`;
    }).join(';');
    
    url.searchParams.set('emo', encoded);
  }

  syncCircumstancesToUrl(url) {
    if (this.circumstances.length === 0) {
      url.searchParams.delete('circ');
      return;
    }
    
    const encoded = this.circumstances.map(circ => {
      const catCode = circ.category?.id?.charAt(0) || 'o';
      const itemCode = circ.item?.id?.substring(0, 2) || 'gn';
      const intensity = circ.intensity || 50;
      const tempFlag = circ.isTemperature ? 't' : 'p';
      return `${catCode}:${itemCode}:${intensity}:${tempFlag}`;
    }).join(';');
    
    url.searchParams.set('circ', encoded);
  }

  syncBodyStateToUrl(url) {
    if (!this.bodyState || 
        (!this.bodyState.hp && !this.bodyState.energy && !this.bodyState.location)) {
      url.searchParams.delete('body');
      return;
    }
    
    const encoded = `${this.bodyState.hp || 0}|${this.bodyState.energy || 0}|${this.bodyState.location || ''}`;
    url.searchParams.set('body', encoded);
  }

  syncSkillsToUrl(url) {
    if (this.skills.length === 0) {
      url.searchParams.delete('skills');
      return;
    }
    
    const encoded = this.skills.map(skill => {
      const catCode = skill.category.id.charAt(0);
      const skillCode = skill.skill?.id?.substring(0, 3) || 'cst';
      const experience = skill.experience || 50;
      const level = skill.level || 1;
      return `${catCode}:${skillCode}:${experience}:${level}`;
    }).join(';');
    
    url.searchParams.set('skills', encoded);
  }

  syncRelationsToUrl(url) {
    if (this.relations.length === 0) {
      url.searchParams.delete('rel');
      return;
    }
    
    const encoded = this.relations
      .filter(rel => rel?.type?.id && rel?.description)
      .map(rel => {
        const dir = rel.direction || 'from';
        const type = rel.type.id;
        const entryId = rel.targetEntry?.id?.substring(0, 8) || 'none';
        const desc = encodeURIComponent(rel.description.substring(0, 50));
        return `${dir}:${type}:${entryId}:${desc}`;
      })
      .join(';');
    
    if (encoded) {
      url.searchParams.set('rel', encoded);
    }
  }

  syncTagsToUrl(url) {
    if (this.tags.length === 0) {
      url.searchParams.delete('tags');
      return;
    }
    
    url.searchParams.set('tags', this.tags.join(','));
  }

  syncSkillProgressToUrl(url) {
    if (this.skillProgress.length === 0) {
      url.searchParams.delete('skill_progress');
      return;
    }
    
    const encoded = this.skillProgress.map(progress => {
      const skillId = progress.skill?.id || 'unknown';
      const expGained = progress.experience_gained || 10;
      return `${skillId}:${expGained}`;
    }).join(';');
    
    url.searchParams.set('skill_progress', encoded);
  }

  // Получение сводки для превью
  getPreviewSummary() {
    return {
      type: this.type,
      contentPreview: this.content.length > 100 
        ? `${this.content.substring(0, 100)}...` 
        : this.content,
      hasDate: !!this.eventDate,
      hasDeadline: !!this.deadline,
      emotionsCount: this.emotions.length,
      circumstancesCount: this.circumstances.length,
      hasBodyState: !!this.bodyState,
      skillsCount: this.skills.length,
      relationsCount: this.relations.length,
      tagsCount: this.tags.length,
      skillProgressCount: this.skillProgress.length
    };
  }
}

export default UrlSyncStore;