// src/ui/pages/auth/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import Input from '@/ui/components/common/Input/Input';
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
  
  const { t, language } = useLanguage();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  
  // Исправим обработчики чтобы они явно принимали строку
  const handleLoginChange = (value) => {
    console.log('handleLoginChange called with:', value, 'type:', typeof value);
    setLogin(value);
  };
  
  const handlePasswordChange = (value) => {
    console.log('handlePasswordChange called with:', value, 'type:', typeof value);
    setPassword(value);
  };
  
  const handleConfirmPasswordChange = (value) => {
    console.log('handleConfirmPasswordChange called with:', value);
    setConfirmPassword(value);
  };
  
  const handleBackupCodeChange = (value) => {
    console.log('handleBackupCodeChange called with:', value);
    setBackupCode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('=== SUBMIT VALUES ===');
    console.log('login:', login);
    console.log('password:', password);
    console.log('confirmPassword:', confirmPassword);
    console.log('backupCode:', backupCode);
    
    try {
      if (mode === 'login') {
        if (!login.trim() || !password.trim()) {
          setError('Заполните все поля');
          setLoading(false);
          return;
        }
        
        setTimeout(() => {
          navigate('/timeline');
        }, 1000);
        
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        
        setTimeout(() => {
          alert(`Регистрация успешна\nBackup код: 123456`);
          setMode('login');
          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Произошла ошибка');
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
          <h1>{mode === 'login' ? 'Вход' : mode === 'register' ? 'Регистрация' : 'Восстановление'}</h1>
          <p>{mode === 'login' ? 'Войдите в свой аккаунт' : ''}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          {/* Тест с обработчиками */}
          <Input
            label="Логин"
            type="text"
            value={login}
            onChange={handleLoginChange}
            placeholder="Введите логин"
            required
          />
          
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Введите пароль"
            required
          />
          
          {mode === 'register' && (
            <Input
              label="Повторите пароль"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Повторите пароль"
              required
            />
          )}
          
          {mode === 'recover' && (
            <Input
              label="Backup-код"
              type="text"
              value={backupCode}
              onChange={handleBackupCodeChange}
              placeholder="Введите backup-код"
              required
            />
          )}
          
          <Button type="submit" variant="primary" fullWidth>
            {mode === 'login' ? 'Войти' : mode === 'register' ? 'Зарегистрироваться' : 'Восстановить'}
          </Button>
        </form>
        
        <div className="auth-footer">
          {mode === 'login' && (
            <>
              <button 
                type="button"
                className="link-button" 
                onClick={() => setMode('register')}
              >
                Зарегистрироваться
              </button>
              <button 
                type="button"
                className="link-button" 
                onClick={() => setMode('recover')}
              >
                Восстановить доступ
              </button>
            </>
          )}
          
          {(mode === 'register' || mode === 'recover') && (
            <button 
              type="button"
              className="link-button" 
              onClick={() => setMode('login')}
            >
              Вернуться к входу
            </button>
          )}
        </div>
      </div>
    </div>
  );
}