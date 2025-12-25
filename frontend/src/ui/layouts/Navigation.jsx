import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import './Navigation.css';

export default function Navigation() {
  const { t } = useLanguage();
  
  const navItems = [
    { 
      path: '/', 
      icon: 'all', 
       label: 'Лента'
      // label: t('navigation.timeline') || 'Лента'
    },
    { 
      path: '/entries/create', 
      icon: 'crt', 
       label:'Создать'
      // label: t('navigation.create') || 'Создать'
    },
    { 
      path: '/analytics', 
      icon: 'anl', 
      label: 'Аналитика'
      // label: t('navigation.analytics') || 'Аналитика'
    },
    { 
      path: '/settings', 
      icon: 'set', 
      label: 'Настройки'
      // label: t('navigation.settings') || 'Настройки'
    },
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
          end={item.path === '/'}
        >
          {/* <span className="nav-icon">{item.icon}</span> */}
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}