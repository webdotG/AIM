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

export const useAuthStore = () => useStores().authStore;
export const useEntriesStore = () => useStores().entriesStore;
export const useBodyStatesStore = () => useStores().bodyStatesStore;
export const useCircumstancesStore = () => useStores().circumstancesStore;
export const useSkillsStore = () => useStores().skillsStore;
export const useUIStore = () => useStores().uiStore;
export const useRelationsStore = () => useStores().relationsStore;
export const useSkillProgressStore = () => useStores().skillProgressStore;
export const useTagsStore = () => useStores().tagsStore;
export const useEmotionsStore = () => useStores().emotionsStore;
export const useEntryDraftStore = () => useStores().entryDraftStore;

export const StoreProvider = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStoreInstance}>
      {children}
    </StoreContext.Provider>
  );
};
