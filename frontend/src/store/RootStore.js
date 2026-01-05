// ~/aProject/AIM/frontend/src/store/RootStore.js
import { AuthStore } from './stores/AuthStore';
import { BodyStatesStore } from './stores/BodyStatesStore';
import { CircumstancesStore } from './stores/CircumstancesStore';
import { EntriesStore } from './stores/EntriesStore';
import { SkillsStore } from './stores/SkillsStore';
import { UIStore } from './stores/UIStore';
import { RelationsStore } from './stores/RelationsStore';
import { SkillProgressStore } from './stores/SkillProgressStore';
import { TagsStore } from './stores/TagsStore';
import { EmotionsStore } from './stores/EmotionsStore';
import { EntryDraftStore } from './stores/EntryDraftStore'; 

export default class RootStore {
  constructor() {
    this.authStore = new AuthStore(this);
    this.bodyStatesStore = new BodyStatesStore(this);
    this.circumstancesStore = new CircumstancesStore(this);
    this.entriesStore = new EntriesStore(this);
    this.skillsStore = new SkillsStore(this);
    this.uiStore = new UIStore(this);
    this.relationsStore = new RelationsStore(this);
    this.skillProgressStore = new SkillProgressStore(this);
    this.tagsStore = new TagsStore(this);
    this.emotionsStore = new EmotionsStore(this);
    this.entryDraftStore = new EntryDraftStore(); 
  }
}