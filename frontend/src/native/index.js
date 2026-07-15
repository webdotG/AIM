import { useState, useEffect } from 'react';
import { Platform, StyleSheet, View, Text, Pressable, TextInput, Image, ScrollView, SafeAreaView, BackHandler, StatusBar, RefreshControl } from 'react-native';
import * as Facebook from 'expo-router';

// Platform-aware component aliases
export const SafeAreaView = Platform.OS === 'web'
  ? ({ children, style, ...props }) => <div style={style} {...props}>{children}</div>
  : SafeAreaView;

export const RView = Platform.OS === 'web'
  ? ({ children, style, ...props }) => <div style={style} {...props}>{children}</div>
  : View;

export const RText = Platform.OS === 'web'
  ? ({ children, style, ...props }) => <span style={style} {...props}>{children}</span>
  : Text;

export const RPressable = Platform.OS === 'web'
  ? ({ children, style, onPress, ...props }) => (
      <button
        style={style}
        onClick={onPress}
        {...props}
      >
        {children}
      </button>
    )
  : Pressable;

export const RTextInput = Platform.OS === 'web'
  ? ({ value, onChangeText, style, placeholder, ...props }) => (
      <textarea
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        style={style}
        placeholder={placeholder}
        {...props}
      />
    )
  : TextInput;

export const RScrollView = Platform.OS === 'web'
  ? ({ children, style, ...props }) => (
      <div style={[style,
        { overflowY: 'auto' }
      ]} {...props}>
        {children}
      </div>
    )
  : ScrollView;

export const RStatusBar = Platform.OS === 'web'
  ? () => null
  : StatusBar;

export const RBackHandler = Platform.OS === 'web'
  ? {
      addEventListener: () => () => {},
    }
  : BackHandler;

export const RStyleSheet = Platform.OS === 'web'
  ? StyleSheet
  : StyleSheet;

export const navigationStyle = Platform.OS === 'web'
  ? { displacement: 'stack' }
  : 'stack';

// Re-export all RN primitives for easy imports
export {
  Platform,
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  BackHandler,
  StatusBar,
  RefreshControl,
};

// Re-export Expo Router
export * from 'expo-router';

// Default styles
export const defaultStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 16,
  },
  button: {
    padding: 12,
    backgroundColor: '#0066ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});