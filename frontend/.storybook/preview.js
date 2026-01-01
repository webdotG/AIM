// .storybook/preview.js - ИСПРАВЛЕННЫЙ
import React from 'react';
import { withStores } from './decorators/witsStore';

import '../src/ok.css';

export const decorators = [withStores];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#f9fafb' },
      { name: 'dark', value: '#1f2937' },
      { name: 'telegram', value: '#3390ec' },
      { name: 'paper', value: '#f5f5f5' }
    ],
  },
  layout: 'centered',
};