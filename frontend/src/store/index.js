export { default as RootStore } from './RootStore';

// TEMP STUBS — remove in Block 5 when old UI components are deleted
export const useSkillsStore = () => ({ skills: [], createSkill: async () => {} });
export const useCircumstancesStore = () => ({ circumstances: [] });
export const useBodyStatesStore = () => ({ bodyStates: [], createBodyState: async () => {} });
export const useRelationsStore = () => ({ relations: [], createRelation: async () => {} });
export const useSkillProgressStore = () => ({ addProgress: async () => {} });
export const useEntriesStore = () => ({ entries: [], createEntry: async () => {}, fetchEntries: async () => {} });

export { 
  StoreContext, 
  useStores, 
  StoreProvider,
  useAuthStore,
  useUIStore,
  useNodeStore,
  useEdgeStore,
  useSelectionStore,
  useTraversalStore,
  useAnalyticsStore,
  useAIStore,
  useEmotionsStore,
  useTagsStore,
} from './StoreContext';

export { AuthStore } from './stores/AuthStore';
export { EmotionsStore } from './stores/EmotionsStore';
export { TagsStore } from './stores/TagsStore';
export { UIStore } from './stores/UIStore';
export { NodeStore } from './stores/NodeStore';
export { EdgeStore } from './stores/EdgeStore';
export { SelectionStore } from './stores/SelectionStore';
export { TraversalStore } from './stores/TraversalStore';
export { AnalyticsStore } from './stores/AnalyticsStore';
export { AIStore } from './stores/AISTore';