// src/ui/components/layout/Navigation.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import './Navigation.css';

export default function Navigation() {
  const { t } = useLanguage();
  
  const navItems = [
    { path: '/timeline', icon: '📝', label: t('navigation.timeline') },
    { path: '/analytics', icon: '📊', label: t('navigation.analytics') },
    { path: '/settings', icon: '⚙️', label: t('navigation.settings') },
  ];
  
  return (
    <nav className="bottom-navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}