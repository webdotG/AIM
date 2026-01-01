// src/ui/components/layout/UserProfile/UserProfile.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import Button from '@/ui/components/common/Button/Button';
import './UserProfile.css';

const UserProfile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="user-profile">
      <span className="user-profile-login">{user.login}</span>
      <Button
        variant="secondary"
        size="small"
        onClick={handleLogout}
        className="user-profile-logout"
      >
        {t('auth.logout')}
      </Button>
    </div>
  );
};

export default UserProfile;