import React, { createContext, useContext, useState, useCallback } from 'react';

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [navigationStack, setNavigationStack] = useState([
    { screen: 'timeline', params: {} }
  ]);

  const navigate = useCallback((screen, params = {}) => {
    setNavigationStack(prev => [...prev, { screen, params }]);
  }, []);

  const goBack = useCallback(() => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  }, [navigationStack.length]);

  const replace = useCallback((screen, params = {}) => {
    setNavigationStack(prev => [...prev.slice(0, -1), { screen, params }]);
  }, []);

  const resetTo = useCallback((screen, params = {}) => {
    setNavigationStack([{ screen, params }]);
  }, []);

  const currentRoute = navigationStack[navigationStack.length - 1];

  const value = {
    navigate,
    goBack,
    replace,
    resetTo,
    currentRoute,
    canGoBack: navigationStack.length > 1,
    navigationStack
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );  
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};