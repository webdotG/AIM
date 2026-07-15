import { useState } from 'react';
import { Platform } from 'react-native';
import { useNavigation, navigate as tgNavigate, currentScreen as tgCurrentScreen } from '@/layers/platform/PlatformNavigator';

function pathToScreen(path) {
  if (!path || path === '/' || path.startsWith('/create')) return 'list';
  if (path.startsWith('/nodes')) {
    const parts = path.match(/\/nodes\/(.+)$/);
    return parts ? 'nodeDetail' : 'nodes';
  }
  if (path.startsWith('/people')) return 'people';
  if (path.startsWith('/graph')) return 'graph';
  if (path.startsWith('/analytics')) return 'analytics';
  if (path.startsWith('/settings')) return 'settings';
  return 'list';
}

export function useNavigator() {
  return {
    navigate: (pathOrScreen) => {
      if (pathOrScreen && !pathOrScreen.startsWith('/')) {
        const paths = {
          list: '/',
          create: '/create',
          nodes: '/nodes',
          nodeDetail: '/nodes',
          people: '/people',
          graph: '/graph',
          analytics: '/analytics',
          settings: '/settings',
        };
        tgNavigate(paths[pathOrScreen] || pathOrScreen);
      } else {
        tgNavigate(pathOrScreen);
      }
    },
    goBack: () => {
      if (Platform.OS === 'web') {
        window.history.back();
      } else {
        require('./PlatformNavigator').goBack();
      }
    },
    canGoBack: () => {
      return Platform.OS === 'web' ? window.history.length > 1 : true;
    },
    currentScreen: pathToScreen(Platform.OS === 'web' ? window.location.pathname : (tgCurrentScreen() || 'list')),
  };
}