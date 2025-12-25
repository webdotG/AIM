import { observer } from 'mobx-react-lite';
import { useUrlSyncStore } from '@/store/StoreContext';
import { useLanguage } from '@/layers/language';
import './EntryTypePicker.css';

const EntryTypePicker = observer(() => {
  const urlSyncStore = useUrlSyncStore();
  const { t } = useLanguage();

  const typeConfig = {
    dream: { 
      icon: 'DRE', 
      label: t('entries.types.dream') || 'Сон',
      description: t('entries.types.dreamDesc') || 'Запись о сне',
      color: 'purple'
    },
    memory: { 
      icon: 'MEM', 
      label: t('entries.types.memory') || 'Воспоминание',
      description: t('entries.types.memoryDesc') || 'Воспоминание из прошлого',
      color: 'blue'
    },
    thought: { 
      icon: 'THO', 
      label: t('entries.types.thought') || 'Мысль',
      description: t('entries.types.thoughtDesc') || 'Текущая мысль или идея',
      color: 'green'
    },
    plan: { 
      icon: 'PLA', 
      label: t('entries.types.plan') || 'План',
      description: t('entries.types.planDesc') || 'План на будущее',
      color: 'red'
    }
  };

  const handleTypeSelect = (type) => {
    urlSyncStore?.setType(type);
    if (type !== 'plan') {
      urlSyncStore?.setDeadline('');
    }
  };

  return (
    <div className="entry-type-picker">
      {/* <h3 className="picker-title">Это</h3> */}
      {/* <p className="picker-subtitle">Выберите категорию вашей записи</p> */}
      
      <div className="type-grid">
        {Object.entries(typeConfig).map(([type, config]) => (
          <div
            key={type}
            className={`type-card ${urlSyncStore?.type === type ? 'selected' : ''}`}
            onClick={() => handleTypeSelect(type)}
          >
            {/* <div className="type-icon">
              {config.icon}
            </div> */}
            <div className="type-info">
              <div className="type-label">{config.label}</div>
              {/* <div className="type-description">{config.description}</div> */}
            </div>
            {/* {urlSyncStore?.type === type && (
              <div className="type-selected-indicator">
                X
              </div>
            )} */}
          </div>
        ))}
      </div>

      {/* {urlSyncStore?.type === 'plan' && !urlSyncStore?.deadline && (
        <div className="plan-warning">
          ДЛЯ ПЛАНА НЕОБХОДИМО УКАЗАТЬ ДЕДЛАЙН
        </div>
      )} */}
    </div>
  );
});

export default EntryTypePicker;