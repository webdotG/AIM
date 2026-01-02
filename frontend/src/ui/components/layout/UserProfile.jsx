import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/layers/language';
import { useAuthStore } from '@/store';
import Button from '@/ui/components/common/Button/Button';
import './UserProfile.css';

const UserProfile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authStore = useAuthStore();
  
  const handleLogout = async () => {
    await authStore.logout();
    navigate('/login');
  };

  if (!authStore.isAuthenticated) {
    return null;
  }

  return (
    <div className="user-profile">
      <span className="user-profile-login">{authStore.user?.login || 'User'}</span>
      <Button
        variant="secondary"
        size="small"
        onClick={handleLogout}
        className="user-profile-logout"
        disabled={authStore.isLoading}
      >
        {authStore.isLoading ? t('common.loading') : t('auth.logout')}
      </Button>
    </div>
  );
};

export default UserProfile;