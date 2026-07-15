import { Platform } from 'react-native';
import React, { useState } from 'react';

let _currentScreen = 'list';
let _currentParams = {};

export const navigate = (screen, params = {}) => {
  _currentScreen = screen;
  _currentParams = params;
  if (Platform.OS === 'web') {
    const path = typeof screen === 'string' ? screen : screen;
    window.history.pushState({}, '', `/${path}`);
  }
};

export const goBack = () => {
  if (Platform.OS === 'web') {
    window.history.back();
  }
};

export const canGoBack = () => {
  return Platform.OS === 'web' ? window.history.length > 1 : true;
};

export const currentScreen = () => _currentScreen;
export const currentParams = () => _currentParams;
export const resetTo = (screen, params = {}) => {
  _currentScreen = screen;
  _currentParams = params;
};

export const NavigationProvider = ({ children }) => {
  return children;
};

export const useNavigation = () => {
  return {
    navigate: (screen, params) => navigate(screen, params),
    goBack: () => goBack(),
    resetTo: (screen, params) => resetTo(screen, params),
    canGoBack: () => canGoBack(),
    currentRoute: { screen: currentScreen(), params: currentParams() },
  };
};