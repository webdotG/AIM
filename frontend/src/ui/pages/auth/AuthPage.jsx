import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import Input from '@/ui/components/common/Input/Input';
import PasswordInput from '@/ui/components/auth/PasswordInput/PasswordInput';
import HCaptcha from '@/ui/components/auth/HCaptcha/HCaptcha';
import Button from '@/ui/components/common/Button/Button';
import Loader from '@/ui/components/common/Loader/Loader';
import Header from '../../components/layout/Header';
import { AuthAPIClient } from '@/core/adapters/api/clients/AuthAPIClient';
import './AuthPage.css';

const authClient = new AuthAPIClient();

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
  
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Обработчик hCaptcha
  const handleCaptchaVerify = (token) => {
    console.log('hCaptcha verified:', token);
    setHcaptchaToken(token);
    setError(''); // Очищаем ошибки
  };

  const handleCaptchaError = (error) => {
    console.error('hCaptcha error:', error);
    setHcaptchaToken('');
    setError('Ошибка проверки hCaptcha. Попробуйте обновить страницу.');
  };

  const handleCaptchaExpire = () => {
    console.warn('hCaptcha expired');
    setHcaptchaToken('');
    setError('hCaptcha истекла. Пожалуйста, пройдите проверку заново.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Проверка hCaptcha токена
    if (!hcaptchaToken) {
      setError('Пожалуйста, пройдите проверку hCaptcha');
      setLoading(false);
      return;
    }
    
    try {
      if (mode === 'login') {
        if (!login.trim() || !password.trim()) {
          setError('Заполните все поля');
          setLoading(false);
          return;
        }
        
        const result = await authClient.login({
          login,
          password,
          hcaptchaToken,
        });

        console.log('Login successful:', result);
        navigate('/timeline');
        
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        
        if (passwordStrength && !passwordStrength.isStrong) {
          setError('Пароль недостаточно надёжный. Исправьте замечания выше.');
          setLoading(false);
          return;
        }
        
        const result = await authClient.register({
          login,
          password,
          hcaptchaToken,
        });

        alert(`Регистрация успешна!\n\n⚠️ ВАЖНО: Сохраните ваш backup-код:\n\n${result.backupCode}\n\nОн понадобится для восстановления доступа!`);
        setMode('login');
        setLoading(false);
        
      } else if (mode === 'recover') {
        if (!backupCode.trim() || !password.trim()) {
          setError('Заполните все поля');
          setLoading(false);
          return;
        }
        
        const result = await authClient.recover({
          backupCode,
          newPassword: password,
          hcaptchaToken,
        });

        alert(`Пароль восстановлен!\n\nНовый backup-код:\n${result.backupCode}`);
        setMode('login');
        setLoading(false);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.error || err.message || 'Произошла ошибка');
      setLoading(false);
      // Сбрасываем hCaptcha при ошибке
      setHcaptchaToken('');
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
          
          {mode !== 'recover' && (
            <Input
              label="Логин"
              type="text"
              value={login}
              onChange={setLogin}
              placeholder="Введите логин"
              required
              autoFocus={mode === 'login'}
            />
          )}
          
          {mode === 'register' ? (
            <PasswordInput
              value={password}
              onChange={setPassword}
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
              onChange={setPassword}
              label="Новый пароль"
              placeholder="Придумайте новый пароль"
              showStrengthIndicator={true}
              showGenerateButton={false}
              onStrengthChange={setPasswordStrength}
              required
            />
          ) : (
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Введите пароль"
              required
            />
          )}
          
          {mode === 'register' && (
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              label="Повторите пароль"
              placeholder="Введите пароль ещё раз"
              showStrengthIndicator={false}
              showGenerateButton={false}
              required
            />
          )}
          
          {mode === 'recover' && (
            <Input
              label="Backup-код"
              type="text"
              value={backupCode}
              onChange={setBackupCode}
              placeholder="Введите ваш backup-код"
              required
              autoFocus
              maxLength={32}
            />
          )}

          {/* hCaptcha для всех режимов */}
          <HCaptcha
            onVerify={handleCaptchaVerify}
            onError={handleCaptchaError}
            onExpire={handleCaptchaExpire}
            theme={currentTheme.name === 'dark' ? 'dark' : 'light'}
          />
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth
            disabled={!hcaptchaToken || loading}
          >
            {mode === 'login' && 'Войти'}
            {mode === 'register' && 'Зарегистрироваться'}
            {mode === 'recover' && 'Восстановить пароль'}
          </Button>
          
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
              <span className="hint-icon"></span>
              <span className="hint-text">
                Backup-код был выдан при регистрации. Если вы его потеряли, обратитесь к администратору.
              </span>
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
                Нет аккаунта? <strong>Зарегистрироваться</strong>
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
                setHcaptchaToken('');
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