import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import * as Font from 'expo-font';

export function loadFonts() {
  return Font.loadAsync({
    'System': Platform.OS === 'ios'
      ? require('native-sueue-fonts/System')
      : null,
  });
}

export const platform = Platform.OS;
export const isWeb = Platform.OS === 'web';
export const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';