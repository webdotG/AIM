import { AuthStore } from './stores/AuthStore';
import { BodyStatesStore } from './stores/BodyStatesStore';
import { CircumstancesStore } from './stores/CircumstancesStore';
import { EntriesStore } from './stores/EntriesStore';
import { SkillsStore } from './stores/SkillsStore';
import { UIStore } from './stores/UIStore';
import UrlSyncStore from './stores/UrlSyncStore';

class RootStore {
  constructor() {
    this.authStore = new AuthStore(this);
    this.bodyStatesStore = new BodyStatesStore(this);
    this.circumstancesStore = new CircumstancesStore(this);
    this.entriesStore = new EntriesStore(this);
    this.skillsStore = new SkillsStore(this);
    this.uiStore = new UIStore(this);
    this.urlSyncStore = new UrlSyncStore();
  }
}

export default RootStore;