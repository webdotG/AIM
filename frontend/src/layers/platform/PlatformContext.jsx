import { createContext } from 'react';

const PlatformContext = createContext({
  platform: 'web',
  config: {
    layout: 'MainLayout',
    styles: {},
    navigation: 'stack'
  }
});

export default PlatformContext;