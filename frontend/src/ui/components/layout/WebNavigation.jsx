import React from 'react';
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

  // Проверяем активный путь
  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Получаем заголовок текущей страницы
  const getPageTitle = () => {
    const currentItem = navItems.find(item => isActive(item.path, item.exact));
    return currentItem ? currentItem.label : t('navigation.dashboard');
  };

  return (
    <nav className="web-navigation">
      {/* Логотип и заголовок */}
        
        {/* <div className="current-page">
          <h2 className="page-title">{getPageTitle()}</h2>
        </div> */}

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