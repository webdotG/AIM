import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import Input from '@/ui/components/common/Input/Input';
import PasswordInput from '@/ui/components/auth/PasswordInput/PasswordInput';
import HCaptcha from '@/ui/components/auth/HCaptcha/HCaptcha';
import Button from '@/ui/components/common/Button/Button';
import Loader from '@/ui/components/common/Loader/Loader';
import { useAuthStore } from '@/store';
import './AuthPage.css';
import BackupCodeModal from '@/ui/components/auth/BackupCodeModal/BackupCodeModal';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [generatedBackupCode, setGeneratedBackupCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const { theme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleCaptchaVerify = (token) => {
    setHcaptchaToken(token);
    setError('');
  };

  const handleCaptchaError = (error) => {
    setHcaptchaToken('');
    setError(t('auth.errors.captchaError'));
  };

  const handleCaptchaExpire = () => {
    setHcaptchaToken('');
    setError(t('auth.errors.captchaExpired'));
  };

  const handleCopyBackupCode = async () => {
    try {
      await navigator.clipboard.writeText(generatedBackupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  if (!hcaptchaToken) {
    setError(t('auth.errors.captchaRequired'));
    setLoading(false);
    return;
  }
  
  try {
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError(t('auth.errors.passwordsNotMatch'));
        setLoading(false);
        return;
      }
      
      if (passwordStrength && !passwordStrength.isStrong) {
        setError(t('auth.errors.passwordNotStrong'));
        setLoading(false);
        return;
      }
      
      const result = await authStore.register({ login, password, hcaptchaToken });
      
      // Не редиректим сразу! Ждем пока пользователь сохранит backup code
      // Просто показываем модалку
      if (result.backupCode) {
        setGeneratedBackupCode(result.backupCode);
        setShowBackupCode(true);
        // НЕ делаем navigate('/') здесь!
      } else {
        // Если нет backup code (хотя должен быть), редиректим
        navigate('/');
      }
    } else if (mode === 'login') {
      await authStore.login({ login, password, hcaptchaToken });
      navigate('/'); // Логин - сразу редирект
    } else if (mode === 'recover') {
      const result = await authStore.recover({ 
        backupCode, 
        newPassword: password, 
        hcaptchaToken 
      });
      
      if (result.backupCode) {
        setGeneratedBackupCode(result.backupCode);
        setShowBackupCode(true);
      } else {
        navigate('/auth'); // Возвращаем на страницу логина
      }
    }
  } catch (err) {
    // ... обработка ошибки
  } finally {
    setLoading(false);
  }
};

// В handleCloseBackupCode добавляем редирект:
const handleCloseBackupCode = () => {
  setShowBackupCode(false);
  setGeneratedBackupCode('');
  
  // После закрытия модалки - редирект
  if (mode === 'register') {
    navigate('/'); // на главную
  } else if (mode === 'recover') {
    navigate('/auth'); // на страницу логина
  }
  
  // Сброс полей
  setMode('login');
  setPassword('');
  setConfirmPassword('');
  setLogin('');
};
  
  // Используем loading из локального состояния, а не authStore.isLoading
  if (loading) {
    return <Loader />;
  }

  if (showBackupCode) {
    return (
      <BackupCodeModal
        isOpen={true}
        onClose={handleCloseBackupCode}
        backupCode={generatedBackupCode}
        title="код восстановления"
        warning="Без него учетную запись не восстановить"
      />
    );
  }
  
  const getTitle = () => {
    switch(mode) {
      case 'login': return t('auth.login.title');
      case 'register': return t('auth.register.title');
      case 'recover': return t('auth.recover.title');
      default: return t('auth.login.title');
    }
  };

  const getSubtitle = () => {
    switch(mode) {
      case 'login': return t('auth.login.subtitle');
      case 'register': return t('auth.register.subtitle');
      case 'recover': return t('auth.recover.subtitle');
      default: return t('auth.login.subtitle');
    }
  };

  const getButtonText = () => {
    switch(mode) {
      case 'login': return t('auth.login.submit');
      case 'register': return t('auth.register.submit');
      case 'recover': return t('auth.recover.submit');
      default: return t('auth.login.submit');
    }
  };

  const getUsernameLabel = () => {
    return t('auth.login.label');
  };

  const getUsernamePlaceholder = () => {
    return t('auth.login.placeholder');
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">{getTitle()}</h1>
          <p className="auth-subtitle">{getSubtitle()}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">!</span>
              {error}
            </div>
          )}
          
          {mode !== 'recover' && (
            <Input
              label={getUsernameLabel()}
              type="text"
              value={login}
              onChange={setLogin}
              placeholder={getUsernamePlaceholder()}
              required
              autoFocus={mode === 'login'}
            />
          )}
          
          {mode === 'register' ? (
            <PasswordInput
              value={password}
              onChange={setPassword}
              label={t('auth.password.label')}
              placeholder={t('auth.password.placeholder')}
              showStrengthIndicator={true}
              showGenerateButton={true}
              onStrengthChange={setPasswordStrength}
              required
            />
          ) : mode === 'recover' ? (
            <PasswordInput
              value={password}
              onChange={setPassword}
              label={t('auth.password.label')}
              placeholder={t('auth.password.placeholder')}
              showStrengthIndicator={true}
              showGenerateButton={false}
              onStrengthChange={setPasswordStrength}
              required
            />
          ) : (
            <Input
              label={t('auth.password.label')}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={t('auth.password.placeholder')}
              required
            />
          )}
          
          {mode === 'register' && (
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              label={t('auth.confirm_password.label')}
              placeholder={t('auth.confirm_password.placeholder')}
              showStrengthIndicator={false}
              showGenerateButton={false}
              required
            />
          )}
          
          {mode === 'recover' && (
            <Input
              label={t('auth.backup_code.label')}
              type="text"
              value={backupCode}
              onChange={setBackupCode}
              placeholder={t('auth.backup_code.placeholder')}
              required
              autoFocus
              maxLength={32}
            />
          )}

          <HCaptcha
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onExpire={handleCaptchaExpire}
            theme={theme}
          />
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            disabled={!hcaptchaToken || loading}
            className="auth-submit-button"
          >
            {getButtonText()}
          </Button>
          
          {mode === 'register' && (
            <div className="auth-hint">
              <span className="hint-icon">i</span>
              <span>{t('auth.register.backupCodeInfo')}</span>
            </div>
          )}
        </form>
        
        <div className="auth-footer">
          {mode === 'login' && (
            <>
              <button 
                type="button"
                className="link-button" 
                onClick={() => {
                  setMode('register');
                  setError('');
                  setHcaptchaToken('');
                }}
              >
                {t('auth.login.registerLink')}
              </button>
              <button 
                type="button"
                className="link-button link-button-secondary" 
                onClick={() => {
                  setMode('recover');
                  setError('');
                  setHcaptchaToken('');
                }}
              >
                {t('auth.login.recoverLink')}
              </button>
            </>
          )}
          
          {(mode === 'register' || mode === 'recover') && (
            <button 
              type="button"
              className="link-button" 
              onClick={() => {
                setMode('login');
                setError('');
                setPassword('');
                setConfirmPassword('');
                setBackupCode('');
                setHcaptchaToken('');
              }}
            >
              {t('auth.back_to_login')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}