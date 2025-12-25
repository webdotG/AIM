import React from 'react';
import { observer } from 'mobx-react-lite';
import { useUrlSyncStore } from '@/store/StoreContext';
import { useLanguage } from '@/layers/language';
import './UrlStatusBar.css';

const UrlStatusBar = observer(() => {
  const urlSyncStore = useUrlSyncStore();
  const { t } = useLanguage();

  const typeConfig = {
    dream: { icon: 'DRE', label: t('entries.types.dream') || 'Сон' },
    memory: { icon: 'MEM', label: t('entries.types.memory') || 'Воспоминание' },
    thought: { icon: 'THO', label: t('entries.types.thought') || 'Мысль' },
    plan: { icon: 'PLA', label: t('entries.types.plan') || 'План' }
  };

  const getPreviewSummary = () => {
    return {
      type: urlSyncStore?.type,
      contentPreview: urlSyncStore?.content.length > 50 
        ? `${urlSyncStore?.content.substring(0, 50)}...` 
        : urlSyncStore?.content,
      hasDate: !!urlSyncStore?.eventDate,
      hasDeadline: !!urlSyncStore?.deadline,
      emotionsCount: urlSyncStore?.emotions.length,
      circumstancesCount: urlSyncStore?.circumstances.length,
      hasBodyState: !!urlSyncStore?.bodyState && 
        (urlSyncStore?.bodyState.hp > 0 || urlSyncStore?.bodyState.energy > 0 || urlSyncStore?.bodyState.location),
      skillsCount: urlSyncStore?.skills.length,
      relationsCount: urlSyncStore?.relations.length,
      tagsCount: urlSyncStore?.tags.length,
      skillProgressCount: urlSyncStore?.skillProgress.length,
      totalItems: 
        (urlSyncStore?.type !== 'thought' ? 1 : 0) +
        (urlSyncStore?.content ? 1 : 0) +
        (urlSyncStore?.eventDate ? 1 : 0) +
        (urlSyncStore?.deadline ? 1 : 0) +
        urlSyncStore?.emotions.length +
        urlSyncStore?.circumstances.length +
        (urlSyncStore?.bodyState ? 1 : 0) +
        urlSyncStore?.skills.length +
        urlSyncStore?.relations.length +
        urlSyncStore?.tags.length +
        urlSyncStore?.skillProgress.length
    };
  };

  const summary = getPreviewSummary();

  if (summary.totalItems === 0) return null;

  return (
    <div className="url-status-bar">
        <button
          className="status-clear-btn"
          onClick={() => urlSyncStore?.reset()}
          title="Очистить все"
        >
          Очистить
        </button>
      {/* <div className="status-header">
        <div className="status-title">
          <span className="status-icon"></span>
          <span>Будет сохранено ({summary.totalItems}):</span>
        </div>

      </div>
      
      <div className="status-content">
        <div className="status-items">
          {summary.type !== 'thought' && (
            <div className="status-item">
              <div className="status-item-icon">
                {typeConfig[summary.type]?.icon}
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{typeConfig[summary.type]?.label}</div>
                <div className="status-item-subtitle">Тип записи</div>
              </div>
            </div>
          )}
          
          {summary.contentPreview && (
            <div className="status-item">
              <div className="status-item-icon">
              
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.contentPreview}</div>
                <div className="status-item-subtitle">Содержание</div>
              </div>
            </div>
          )}
          
          {summary.hasDate && (
            <div className="status-item">
              <div className="status-item-icon">
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{urlSyncStore?.eventDate}</div>
                <div className="status-item-subtitle">Дата события</div>
              </div>
            </div>
          )}
          
          {summary.hasDeadline && (
            <div className="status-item">
              <div className="status-item-icon">
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{urlSyncStore?.deadline}</div>
                <div className="status-item-subtitle">Дедлайн</div>
              </div>
            </div>
          )}
          
          {summary.emotionsCount > 0 && (
            <div className="status-item">
              <div className="status-item-icon">
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.emotionsCount} эмоций</div>
                <div className="status-item-subtitle">Эмоциональное состояние</div>
              </div>
            </div>
          )}
          
          {summary.circumstancesCount > 0 && (
            <div className="status-item">
              <div className="status-item-icon">
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.circumstancesCount} обстоятельств</div>
                <div className="status-item-subtitle">Внешние условия</div>
              </div>
            </div>
          )}
          
          {summary.hasBodyState && (
            <div className="status-item">
              <div className="status-item-icon" >
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">Состояние тела</div>
                <div className="status-item-subtitle">
                  {urlSyncStore?.bodyState.hp > 0 && `HP: ${urlSyncStore?.bodyState.hp}% `}
                  {urlSyncStore?.bodyState.energy > 0 && `MANA: ${urlSyncStore?.bodyState.energy}% `}
                  {urlSyncStore?.bodyState.location && ` ${urlSyncStore?.bodyState.location}`}
                </div>
              </div>
            </div>
          )}
          
          {summary.skillsCount > 0 && (
            <div className="status-item">
              <div className="status-item-icon">
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.skillsCount} навыков</div>
                <div className="status-item-subtitle">Развитие способностей</div>
              </div>
            </div>
          )}
          
          {summary.skillProgressCount > 0 && (
            <div className="status-item">
              <div className="status-item-icon" >
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.skillProgressCount} прокачек</div>
                <div className="status-item-subtitle">Опыт получен</div>
              </div>
            </div>
          )}
          
          {summary.relationsCount > 0 && (
            <div className="status-item">
              <div className="status-item-icon">
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.relationsCount} связей</div>
                <div className="status-item-subtitle">Связанные записи</div>
              </div>
            </div>
          )}
          
          {summary.tagsCount > 0 && (
            <div className="status-item">
              <div className="status-item-icon" >
                
              </div>
              <div className="status-item-text">
                <div className="status-item-title">{summary.tagsCount} тегов</div>
                <div className="status-item-subtitle">
                  {urlSyncStore?.tags.slice(0, 3).map(tag => `#${tag}`).join(', ')}
                  {urlSyncStore?.tags.length > 3 && '...'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="status-footer">
        <div className="status-url-hint">
          <span className="hint-icon"></span>
          <span className="hint-text">
            Все данные сохранены в URL. Можно делиться ссылкой.
          </span>
        </div>
      </div> */}
    </div>
  );
});

export default UrlStatusBar;