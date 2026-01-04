import React, { useState, useEffect } from 'react';
import Input from '../../common/Input/Input';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator/PasswordStrengthIndicator';
import { useAuthStore } from '@/store';
import './PasswordInput.css';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function PasswordInput({ 
  value, 
  onChange, 
  label = 'Пароль',
  placeholder = 'Введите пароль',
  showStrengthIndicator = true,
  showGenerateButton = false,
  required = false,
  onStrengthChange = null,
  ...props 
}) {
  const [strength, setStrength] = useState({
    score: 0,
    isStrong: false,
    reasons: [],
    suggestions: []
  });
  const [isChecking, setIsChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const authStore = useAuthStore();

  const debouncedPassword = useDebounce(value, 500);

  // Проверка силы пароля
  useEffect(() => {
    const checkStrength = async () => {
      if (!debouncedPassword || debouncedPassword.length < 3) {
        const emptyStrength = {
          score: 0,
          isStrong: false,
          reasons: [],
          suggestions: []
        };
        setStrength(emptyStrength);
        if (onStrengthChange) onStrengthChange(emptyStrength);
        return;
      }

      setIsChecking(true);
      try {
        const result = await authStore.checkPasswordStrength(debouncedPassword);
        console.log('Check strength result:', result);
        setStrength(result);
        if (onStrengthChange) onStrengthChange(result);
      } catch (error) {
        console.error('Failed to check password strength:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (showStrengthIndicator) {
      checkStrength();
    }
  }, [debouncedPassword, showStrengthIndicator, onStrengthChange, authStore]);

  const handleGeneratePassword = async () => {
    try {
      const password = await authStore.generatePassword();
      console.log('Generated password:', password);
      onChange(password);
    } catch (error) {
      console.error('Failed to generate password:', error);
    }
  };

  return (
    <div className="password-input-wrapper">
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        label={label}
        placeholder={placeholder}
        required={required}
        {...props}
      />

      <div className="password-actions">
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Скрыть' : 'Показать'}
        </button>
        
        {showGenerateButton && (
          <button
            type="button"
            className="password-generate"
            onClick={handleGeneratePassword}
          >
            Сгенерировать
          </button>
        )}
      </div>

      {showStrengthIndicator && value && (
        <div className="password-strength-wrapper">
          {isChecking ? (
            <div className="checking-indicator">Проверка...</div>
          ) : (
            <PasswordStrengthIndicator
              score={strength.score}
              isStrong={strength.isStrong}
              reasons={strength.reasons}
              suggestions={strength.suggestions}
            />
          )}
        </div>
      )}
    </div>
  );
}