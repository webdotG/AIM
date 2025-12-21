import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import Input from '@/ui/components/common/Input/Input';
import PasswordInput from '@/ui/components/auth/PasswordInput/PasswordInput';
import Button from '@/ui/components/common/Button/Button';
import Loader from '@/ui/components/common/Loader/Loader';
import Header from '../../components/layout/Header';
import './AuthPage.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleLoginChange = (value) => {
    setLogin(value);
  };
  
  const handlePasswordChange = (value) => {
    setPassword(value);
  };
  
  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
  };
  
  const handleBackupCodeChange = (value) => {
    setBackupCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'login') {
        if (!login.trim() || !password.trim()) {
          setError('Заполните все поля');
          setLoading(false);
          return;
        }
        
        // TODO: Реальная логика входа через authStore
        setTimeout(() => {
          navigate('/timeline');
        }, 1000);
        
      } else if (mode === 'register') {
        // Проверка совпадения паролей
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        
        // Проверка силы пароля (если есть индикатор)
        if (passwordStrength && !passwordStrength.isStrong) {
          setError('Пароль недостаточно надёжный. Исправьте замечания выше.');
          setLoading(false);
          return;
        }
        
        // TODO: Реальная логика регистрации через authStore
        setTimeout(() => {
          alert(`Регистрация успешна!\n\nВАЖНО: Сохраните ваш backup-код:\n\n123456789ABC\n\nОн понадобится для восстановления доступа!`);
          setMode('login');
          setLoading(false);
        }, 1000);
        
      } else if (mode === 'recover') {
        if (!backupCode.trim() || !password.trim()) {
          setError('Заполните все поля');
          setLoading(false);
          return;
        }
        
        // TODO: Реальная логика восстановления через authStore
        setTimeout(() => {
          alert('Пароль успешно восстановлен!');
          setMode('login');
          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Произошла ошибка');
      setLoading(false);
    }
  };
  
  if (loading) {
    return <Loader />;
  }
  
  return (
    <div className="auth-page" data-theme={currentTheme.name}>
      <div className="auth-container">
        <Header />
        
        <div className="auth-header">
          <h1>
            {mode === 'login' && 'Вход'}
            {mode === 'register' && 'Регистрация'}
            {mode === 'recover' && 'Восстановление доступа'}
          </h1>
          <p>
            {mode === 'login' && 'Войдите в свой аккаунт'}
            {mode === 'register' && 'Создайте новый аккаунт'}
            {mode === 'recover' && 'Используйте backup-код для восстановления'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {/* Логин (для всех режимов кроме recover в текущей версии) */}
          {mode !== 'recover' && (
            <Input
              label="Логин"
              type="text"
              value={login}
              onChange={handleLoginChange}
              placeholder="Введите логин"
              required
              autoFocus={mode === 'login'}
            />
          )}
          
          {/* Пароль с индикатором силы для регистрации */}
          {mode === 'register' ? (
            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              label="Пароль"
              placeholder="Придумайте надёжный пароль"
              showStrengthIndicator={true}
              showGenerateButton={true}
              onStrengthChange={setPasswordStrength}
              required
            />
          ) : mode === 'recover' ? (
            <PasswordInput
              value={password}
              onChange={handlePasswordChange}
              label="Новый пароль"
              placeholder="Придумайте новый пароль"
              showStrengthIndicator={true}
              showGenerateButton={false}
              onStrengthChange={setPasswordStrength}
              required
            />
          ) : (
            // Для логина - обычный password input без проверки
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Введите пароль"
              required
            />
          )}
          
          {/* Подтверждение пароля при регистрации */}
          {mode === 'register' && (
            <PasswordInput
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              label="Повторите пароль"
              placeholder="Введите пароль ещё раз"
              showStrengthIndicator={false}
              showGenerateButton={false}
              required
            />
          )}
          
          {/* Backup-код для восстановления */}
          {mode === 'recover' && (
            <Input
              label="Backup-код"
              type="text"
              value={backupCode}
              onChange={handleBackupCodeChange}
              placeholder="Введите ваш backup-код"
              required
              autoFocus
              maxLength={32}
            />
          )}
          
          {/* Кнопка отправки */}
          <Button type="submit" variant="primary" fullWidth>
            {mode === 'login' && ' Войти'}
            {mode === 'register' && ' Зарегистрироваться'}
            {mode === 'recover' && ' Восстановить пароль'}
          </Button>
          
          {/* Подсказки */}
          {mode === 'register' && (
            <div className="auth-hint">
              <span className="hint-icon"></span>
              <span className="hint-text">
                После регистрации вы получите backup-код. <strong>Обязательно сохраните его!</strong>
              </span>
            </div>
          )}
          
          {mode === 'recover' && (
            <div className="auth-hint">
              <span className="hint-icon">ℹ</span>
              <span className="hint-text">
                Backup-код был выдан при регистрации. Если вы его потеряли, обратитесь к администратору.
              </span>
            </div>
          )}
        </form>
        
        {/* Переключение режимов */}
        <div className="auth-footer">
          {mode === 'login' && (
            <>
              <button 
                type="button"
                className="link-button" 
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
              >
                Нет аккаунта? <strong>Зарегистрироваться</strong>
              </button>
              <button 
                type="button"
                className="link-button link-button-secondary" 
                onClick={() => {
                  setMode('recover');
                  setError('');
                }}
              >
                Забыли пароль? <strong>Восстановить</strong>
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
              }}
            >
              ← Вернуться к входу
            </button>
          )}
        </div>
      </div>
    </div>
  );
}