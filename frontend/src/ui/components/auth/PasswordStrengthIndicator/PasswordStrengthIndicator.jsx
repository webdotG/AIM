import React from 'react';
import './PasswordStrengthIndicator.css';

export default function PasswordStrengthIndicator({ 
  score, 
  isStrong, 
  reasons = [], 
  suggestions = [] 
}) {
  const getStrengthLevel = () => {
    if (score >= 80) return { text: 'Сильный', class: 'strong' };
    if (score >= 60) return { text: 'Хороший', class: 'good' };
    if (score >= 40) return { text: 'Средний', class: 'medium' };
    if (score >= 20) return { text: 'Слабый', class: 'weak' };
    return { text: 'Очень слабый', class: 'very-weak' };
  };

  const level = getStrengthLevel();

  return (
    <div className="password-strength-indicator">
      {/* Progress Bar */}
      <div className="strength-header">
        <span className="strength-label">Сила пароля:</span>
        <span className={`strength-value ${level.class}`}>{level.text}</span>
      </div>
      
      <div className="strength-bar">
        <div 
          className={`strength-fill ${level.class}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Requirements Checklist */}
      {reasons.length > 0 && (
        <div className="strength-requirements">
          <div className="requirements-title">Требования:</div>
          <ul className="requirements-list">
            {reasons.map((reason, index) => (
              <li key={index} className="requirement-item error">
                <span className="requirement-icon">✗</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="strength-suggestions">
          <div className="suggestions-title">Рекомендации:</div>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <span className="suggestion-icon">💡</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Message */}
      {isStrong && (
        <div className="strength-success">
          <span className="success-icon">✓</span>
          Отличный пароль! Все требования выполнены.
        </div>
      )}
    </div>
  );
}