// ~/aProject/AIM/frontend/src/ui/components/entries/EntryType/EntryTypePicker.jsx
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import './EntryTypePicker.css';

const EntryTypePicker = observer(({
  // Режим 1: Автономный (для переиспользования)
  selectedType = 'thought',
  onChange,
  
  // Режим 2: Интегрированный с черновиком (для EntryForm)
  draftStore,
  draftField = 'type',
  
  // Общие пропсы
  showDescriptions = false,
  compact = false
}) => {
  const { t } = useLanguage();
  
  // Определяем режим работы
  const isDraftMode = !!draftStore && !!draftField;
  
  // Получаем текущий тип
  const currentType = isDraftMode 
    ? draftStore.currentDraft[draftField] || 'thought'
    : selectedType || 'thought';

  const typeConfig = {
    dream: { 
      icon: '', 
      label: t('entries.types.dream') || 'Сон',
      description: t('entries.types.dreamDesc') || 'Запись о сне',
      color: 'purple',
      bgColor: 'var(--color-purple-light)',
      borderColor: 'var(--color-purple)'
    },
    memory: { 
      icon: '', 
      label: t('entries.types.memory') || 'Воспоминание',
      description: t('entries.types.memoryDesc') || 'Воспоминание из прошлого',
      color: 'blue',
      bgColor: 'var(--color-blue-light)',
      borderColor: 'var(--color-blue)'
    },
    thought: { 
      icon: '', 
      label: t('entries.types.thought') || 'Мысль',
      description: t('entries.types.thoughtDesc') || 'Текущая мысль или идея',
      color: 'green',
      bgColor: 'var(--color-green-light)',
      borderColor: 'var(--color-green)'
    },
    plan: { 
      icon: '', 
      label: t('entries.types.plan') || 'План',
      description: t('entries.types.planDesc') || 'План на будущее',
      color: 'red',
      bgColor: 'var(--color-red-light)',
      borderColor: 'var(--color-red)'
    }
  };

  const handleTypeSelect = (type) => {
    if (isDraftMode) {
      draftStore.updateDraft({ 
        [draftField]: type,
        // Для плана очищаем дедлайн если тип не план
        ...(type !== 'plan' && { deadline: null })
      });
    } else {
      onChange?.(type);
    }
  };

  // Компактная версия (только иконки)
  if (compact) {
    return (
      <div className="entry-type-picker compact">
        <div className="type-grid compact">
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              className={`type-icon-button ${currentType === type ? 'selected' : ''}`}
              onClick={() => handleTypeSelect(type)}
              title={config.label}
              aria-label={config.label}
              style={{
                backgroundColor: currentType === type ? config.bgColor : 'transparent',
                borderColor: currentType === type ? config.borderColor : 'var(--color-border)'
              }}
            >
              <span className="type-icon">{config.icon}</span>
              {currentType === type && (
                <span className="selected-indicator">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Полная версия
  return (
    <div className="entry-type-picker">
      {!compact && (
        <>
          <h3 className="picker-title">{t('entries.form.typeLabel') || 'Тип записи'}</h3>
          <p className="picker-subtitle">
            {t('entries.form.typeSubtitle') || 'Выберите категорию вашей записи'}
          </p>
        </>
      )}
      
      <div className="type-grid">
        {Object.entries(typeConfig).map(([type, config]) => (
          <div
            key={type}
            className={`type-card ${currentType === type ? 'selected' : ''}`}
            onClick={() => handleTypeSelect(type)}
            style={{
              borderColor: currentType === type ? config.borderColor : 'var(--color-border)',
              backgroundColor: currentType === type ? config.bgColor : 'var(--color-background)'
            }}
          >
            <div className="type-icon" style={{ color: config.borderColor }}>
              {config.icon}
            </div>
            <div className="type-info">
              <div className="type-label" style={{ color: config.borderColor }}>
                {config.label}
              </div>
              {showDescriptions && (
                <div className="type-description">{config.description}</div>
              )}
            </div>
            {currentType === type && (
              <div className="type-selected-indicator" style={{ color: config.borderColor }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* {currentType === 'plan' && (
        <div className="plan-notification">
          <div className="notification-icon"></div>
          <div className="notification-text">
            {t('entries.form.planDeadlineRequired') || 'Для плана необходимо указать дедлайн'}
          </div>
        </div>
      )} */}
    </div>
  );
});

export default EntryTypePicker;