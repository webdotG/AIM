import { usePlatform as usePlatformRaw } from '@/layers/platform';
import { useNavigation } from '@/layers/platform';

function pathToScreen(path) {
  if (!path || path === '/' || path.startsWith('/create')) return 'list';
  if (path.startsWith('/nodes')) return 'nodeDetail';
  if (path.startsWith('/people')) return 'people';
  if (path.startsWith('/graph')) return 'graph';
  if (path.startsWith('/analytics')) return 'analytics';
  if (path.startsWith('/settings')) return 'settings';
  return 'list';
}

export function useNavigator() {
  const { platform } = usePlatformRaw();
  const tgNav = useNavigation();

  if (platform === 'telegram') {
    const navigate = (pathOrScreen) => {
      const screen = typeof pathOrScreen === 'string' && !pathOrScreen.startsWith('/')
        ? pathOrScreen
        : pathToScreen(pathOrScreen);
      const idMatch = pathOrScreen?.match(/\/nodes\/(.+)$/);
      const params = idMatch ? { id: idMatch[1] } : { path: pathOrScreen };
      tgNav.navigate(screen, params);
    };

    const back = () => tgNav.goBack();
    const to = (p) => p;

    return { navigate, back, to, platform, currentScreen: tgNav.currentRoute?.screen };
  }

  // Web — use react-router-dom's useNavigate
  const webNavigate = (0, require('react-router-dom').useNavigate)();

  const navigate = (pathOrScreen) => {
    if (pathOrScreen && !pathOrScreen.startsWith('/')) {
      const screenPaths = {
        list: '/',
        create: '/create',
        nodeDetail: '/nodes',
        people: '/people',
        graph: '/graph',
        analytics: '/analytics',
        settings: '/settings',
      };
      const p = screenPaths[pathOrScreen] || pathOrScreen;
      webNavigate(p);
    } else {
      webNavigate(pathOrScreen);
    }
  };

  const back = () => webNavigate(-1);

  return {
    navigate,
    back,
    to: (p) => p,
    platform: 'web',
    currentScreen: pathToScreen(window.location.pathname),
  };
}