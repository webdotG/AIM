// NEW V3 — Replaced old stores with graph-based architecture
// Old: EntriesStore, BodyStatesStore, CircumstancesStore, SkillsStore, SkillProgressStore, RelationsStore
// New: NodeStore, EdgeStore, SelectionStore, TraversalStore, AnalyticsStore, AIStore

import { AuthStore } from './stores/AuthStore';
import { EmotionsStore } from './stores/EmotionsStore';
import { TagsStore } from './stores/TagsStore';
import { UIStore } from './stores/UIStore';
import { NodeStore } from './stores/NodeStore';
import { EdgeStore } from './stores/EdgeStore';
import { SelectionStore } from './stores/SelectionStore';
import { TraversalStore } from './stores/TraversalStore';
import { AnalyticsStore } from './stores/AnalyticsStore';
import { AIStore } from './stores/AISTore';

export default class RootStore {
  constructor() {
    this.auth = new AuthStore(this);
    this.ui = new UIStore();
    this.emotions = new EmotionsStore(this);
    this.tags = new TagsStore(this);
    this.nodes = new NodeStore(this);
    this.edges = new EdgeStore(this);
    this.selection = new SelectionStore(this);
    this.traversal = new TraversalStore(this);
    this.analytics = new AnalyticsStore(this);
    this.ai = new AIStore(this);
  }
}