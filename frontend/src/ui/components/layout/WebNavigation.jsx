import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';
import './WebNavigation.css';

const WebNavigation = () => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: t('navigation.timeline'),
      icon: '',
      exact: true
    },
    {
      path: '/entries/create',
      label: t('navigation.createEntry'),
      icon: '',
      exact: false
    },
    {
      path: '/analytics',
      label: t('navigation.analytics'),
      icon: '',
      exact: false
    },
    {
      path: '/settings',
      label: t('navigation.settings'),
      icon: '',
      exact: false
    }
  ];

  // активный путь
  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };



  return (
    <nav className="web-navigation">
    

      {/* Основная навигация */}
      <div className="nav-main">
        <div className="nav-items">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
              end={item.exact}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

    </nav>
  );
};

export default WebNavigation;