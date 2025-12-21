import React from 'react';
import  RootStore  from './RootStore';

export const StoreContext = React.createContext(RootStore);

// Основной хук для доступа ко всем сторам
export const useStores = () => {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within StoreProvider');
  }
  return context;
};

// Индивидуальные хуки для каждого стора
export const useAuthStore = () => {
  return useStores().authStore;
};

export const useEntriesStore = () => {
  return useStores().entriesStore;
};

export const useBodyStatesStore = () => {
  return useStores().bodyStatesStore;
};

export const useCircumstancesStore = () => {
  return useStores().circumstancesStore;
};

export const useSkillsStore = () => {
  return useStores().skillsStore;
};

export const useUIStore = () => {
  return useStores().uiStore;
};
export const useUrlSyncStore = () => useStores().urlSyncStor         

export const StoreProvider = ({ children }) => {
  return (
    <StoreContext.Provider value={RootStore}>
      {children}
    </StoreContext.Provider>
  );
};