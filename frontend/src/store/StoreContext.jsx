// ~/aProject/AIM/frontend/src/store/StoreContext.jsx
import React from "react";
import RootStore from "./RootStore";

const rootStoreInstance = new RootStore();

export const StoreContext = React.createContext(rootStoreInstance);

export const useStores = () => {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error("useStores must be used within StoreProvider");
  }
  return context;
};

export const useAuthStore = () => useStores().auth;
export const useUIStore = () => useStores().ui;
export const useNodeStore = () => useStores().nodes;
export const useEdgeStore = () => useStores().edges;
export const useSelectionStore = () => useStores().selection;
export const useTraversalStore = () => useStores().traversal;
export const useAnalyticsStore = () => useStores().analytics;
export const useAIStore = () => useStores().ai;
export const useEmotionsStore = () => useStores().emotions;
export const useTagsStore = () => useStores().tags;

// TEMP STUBS — remove in Block 5 when old UI components deleted
export const useSkillsStore = () => ({ skills: [], createSkill: async () => {} });
export const useCircumstancesStore = () => ({ circumstances: [] });
export const useBodyStatesStore = () => ({ bodyStates: [], createBodyState: async () => {} });
export const useRelationsStore = () => ({ relations: [], createRelation: async () => {} });
export const useSkillProgressStore = () => ({ addProgress: async () => {} });
export const useEntriesStore = () => ({ entries: [], createEntry: async () => {}, fetchEntries: async () => {} });
export const useEntryDraftStore = () => ({ currentDraft: {}, updateDraft: () => {}, clearDraft: () => {} });

export const StoreProvider = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStoreInstance}>
      {children}
    </StoreContext.Provider>
  );
};