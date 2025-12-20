import { AuthStore } from './stores/AuthStore';
import { EntriesStore } from './stores/EntriesStore';
import { BodyStatesStore } from './stores/BodyStatesStore';
import { CircumstancesStore } from './stores/CircumstancesStore';
import { SkillsStore } from './stores/SkillsStore';
import { UIStore } from './stores/UIStore';

export class RootStore {
  constructor() {
    this.authStore = new AuthStore();
    this.entriesStore = new EntriesStore();
    this.bodyStatesStore = new BodyStatesStore();
    this.circumstancesStore = new CircumstancesStore();
    this.skillsStore = new SkillsStore();
    this.uiStore = new UIStore();
  }
}

export const rootStore = new RootStore();
