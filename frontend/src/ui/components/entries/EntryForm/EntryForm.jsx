import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTheme } from '@/layers/theme';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore } from '@/store/StoreContext';
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '@/ui/components/emotions/EmotionPicker/EmotionPicker';

const EntryForm = observer(() => {
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  
  const { t } = useLanguage();
  const { currentTheme } = useTheme();

  const [formData, setFormData] = useState({
    type: 'thought',
    content: '',
    eventDate: '',
    deadline: '',
    emotions: [],
    people: [],
    tags: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmotionPicker, setShowEmotionPicker] = useState(false);
  const [editingEmotionIndex, setEditingEmotionIndex] = useState(null);

  // Функция для получения цвета
  const getColor = (colorName) => {
    return currentTheme.colors[colorName] || '#000000';
  };

  // Стили
  const formStyle = {
    padding: '20px',
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)'
  };

  const titleStyle = {
    margin: '0 0 20px 0',
    color: 'var(--color-text)',
    fontSize: '18px',
    fontWeight: '600'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'var(--color-background)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '15px',
    fontFamily: 'inherit'
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: '120px',
    resize: 'vertical'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: 'var(--color-text-secondary)',
    fontWeight: '500'
  };

  const buttonStyle = (disabled) => ({
    padding: '10px 20px',
    background: disabled ? 'var(--color-border)' : 'var(--color-primary)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    opacity: disabled ? 0.6 : 1
  });

  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  };

  const typeButtonsStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  };

  const typeButtonStyle = (active) => ({
    flex: 1,
    minWidth: '80px',
    padding: '8px 12px',
    background: active ? 'var(--color-primary)' : 'var(--color-surface-hover)',
    color: active ? 'white' : 'var(--color-text-secondary)',
    border: '1px solid',
    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    textAlign: 'center',
    transition: 'all 0.2s'
  });

  const typeConfig = {
    dream: {
      icon: '🌙',
      label: t('entries.types.dream'),
      color: getColor('dream')
    },
    memory: {
      icon: '📸',
      label: t('entries.types.memory'),
      color: getColor('memory')
    },
    thought: {
      icon: '💭',
      label: t('entries.types.thought'),
      color: getColor('thought')
    },
    plan: {
      icon: '📋',
      label: t('entries.types.plan'),
      color: getColor('plan')
    }
  };

  // Обработчики форм
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      deadline: type !== 'plan' ? '' : prev.deadline
    }));
  };

  // Обработчик эмоций через EmotionPicker
  const handleEmotionsChange = (updatedEmotions) => {
    setFormData(prev => ({
      ...prev,
      emotions: updatedEmotions
    }));
  };

  // Изменение интенсивности отдельной эмоции
  const handleEmotionIntensityChange = (index, intensity) => {
    const updatedEmotions = [...formData.emotions];
    updatedEmotions[index] = {
      ...updatedEmotions[index],
      intensity: parseInt(intensity)
    };
    handleInputChange('emotions', updatedEmotions);
  };

  // Удаление отдельной эмоции
  const handleRemoveEmotion = (index) => {
    const newEmotions = formData.emotions.filter((_, i) => i !== index);
    handleInputChange('emotions', newEmotions);
    if (editingEmotionIndex === index) {
      setEditingEmotionIndex(null);
    }
  };

  // Удаление отдельного тега
  const handleRemoveTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    handleInputChange('tags', newTags);
  };

  // Начало редактирования интенсивности эмоции
  const handleStartEditEmotion = (index) => {
    setEditingEmotionIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      uiStore.showErrorMessage(
        t('common.requiredContent') || 'Заполните содержание записи'
      );
      return;
    }

    if (formData.type === 'plan' && !formData.deadline) {
      uiStore.showErrorMessage(
        t('common.requiredDeadline') || 'Укажите дедлайн для плана'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const entryData = {
        type: formData.type,
        content: formData.content.trim(),
        ...(formData.eventDate && { eventDate: new Date(formData.eventDate) }),
        ...(formData.deadline && { deadline: new Date(formData.deadline) }),
        emotions: formData.emotions,
        people: formData.people,
        tags: formData.tags
      };

      await entriesStore.createEntry(entryData);

      // Сброс формы
      setFormData({
        type: 'thought',
        content: '',
        eventDate: '',
        deadline: '',
        emotions: [],
        people: [],
        tags: []
      });

      uiStore.showSuccessMessage(
        t('common.entryCreated') || 'Запись создана!'
      );

    } catch (error) {
      uiStore.setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Стили для отображения выбранных эмоций
  const emotionContainerStyle = {
    padding: '12px',
    background: 'var(--color-background)',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    minHeight: '50px'
  };

  const emotionBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    marginBottom: '8px',
    background: 'var(--color-surface)',
    borderRadius: '8px',
    border: '1px solid var(--color-border)'
  };

  const emotionInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const emotionEmojiStyle = {
    fontSize: '20px'
  };

  const emotionLabelStyle = {
    fontWeight: '500',
    fontSize: '14px'
  };

  const emotionCategoryStyle = (category) => ({
    fontSize: '11px',
    color: getColor(category),
    textTransform: 'capitalize',
    backgroundColor: `${getColor(category)}20`,
    padding: '2px 6px',
    borderRadius: '4px'
  });

  const intensitySliderStyle = {
    width: '100px',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--color-border)',
    outline: 'none',
    cursor: 'pointer'
  };

  const intensityValueStyle = (intensity) => ({
    minWidth: '20px',
    textAlign: 'center',
    fontWeight: '600',
    color: intensity >= 7 ? getColor('negative') :
           intensity <= 3 ? getColor('positive') :
           getColor('neutral')
  });

  return (
    <>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={titleStyle}>
          {t('entries.form.title')}
        </h3>

        {/* Выбор типа записи */}
        <div style={typeButtonsStyle}>
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              style={{
                ...typeButtonStyle(formData.type === type),
                borderLeft: `4px solid ${config.color}`
              }}
              onMouseEnter={(e) => {
                if (formData.type !== type) {
                  e.target.style.background = 'var(--color-surface-hover)';
                  e.target.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (formData.type !== type) {
                  e.target.style.background = 'var(--color-surface-hover)';
                  e.target.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>

        {/* Содержание */}
        <div style={{ marginBottom: '15px' }}>
          <label style={labelStyle}>
            {t('entries.form.contentLabel')} *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder={t('entries.form.contentPlaceholder')}
            style={textareaStyle}
            required
          />
        </div>

        {/* Даты */}
        <div style={rowStyle}>
          <div>
            <label style={labelStyle}>
              {t('entries.form.dateLabel')}
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              max={getCurrentDate()}
              style={inputStyle}
            />
          </div>

          {formData.type === 'plan' && (
            <div>
              <label style={labelStyle}>
                {t('entries.form.deadlineLabel')} *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={getTomorrowDate()}
                style={inputStyle}
                required={formData.type === 'plan'}
              />
            </div>
          )}
        </div>

        {/* Эмоции */}
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={labelStyle}>
              {t('entries.form.emotionsLabel')}
            </label>
            <button
              type="button"
              onClick={() => setShowEmotionPicker(true)}
              style={{
                padding: '6px 12px',
                background: getColor('primary'),
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              😊 {t('emotions.picker.open')}
            </button>
          </div>

          {/* Отображение выбранных эмоций с ползунками интенсивности */}
          <div style={emotionContainerStyle}>
            {formData.emotions.length > 0 ? (
              formData.emotions.map((emotion, index) => (
                <div key={index} style={emotionBadgeStyle}>
                  <div style={emotionInfoStyle}>
                    <span style={emotionEmojiStyle}>{emotion.emoji}</span>
                    <div>
                      <div style={emotionLabelStyle}>{emotion.label}</div>
                      <div style={emotionCategoryStyle(emotion.category)}>
                        {t(`emotions.categories.${emotion.category}`)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Ползунок интенсивности */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={emotion.intensity}
                        onChange={(e) => handleEmotionIntensityChange(index, e.target.value)}
                        style={intensitySliderStyle}
                        title={t('emotions.picker.intensity')}
                      />
                      <span style={intensityValueStyle(emotion.intensity)}>
                        {emotion.intensity}
                      </span>
                    </div>
                    
                    {/* Кнопка удаления */}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmotion(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: getColor('error'),
                        cursor: 'pointer',
                        fontSize: '18px',
                        lineHeight: 1,
                        padding: '0 4px',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={t('common.remove')}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: 'center',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                padding: '20px 0'
              }}>
                {t('emotions.picker.noEmotionsSelected')}
              </div>
            )}
          </div>
          
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '8px',
            fontSize: '12px', 
            color: 'var(--color-text-secondary)'
          }}>
            <span>{formData.emotions.length}/5 {t('common.selected')}</span>
            {formData.emotions.length > 0 && (
              <button
                type="button"
                onClick={() => handleInputChange('emotions', [])}
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  color: getColor('error'),
                  border: `1px solid ${getColor('error')}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {t('common.clearAll')}
              </button>
            )}
          </div>
        </div>

        {/* Теги */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            {t('entries.form.tagsLabel')}
          </label>
          <input
            type="text"
            placeholder={t('common.addTagPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                e.preventDefault();
                const newTags = [...formData.tags, e.target.value.trim()];
                handleInputChange('tags', newTags);
                e.target.value = '';
              }
            }}
            style={inputStyle}
          />
          
          {formData.tags.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    padding: '6px 12px',
                    marginRight: '8px',
                    marginBottom: '8px',
                    background: 'var(--color-surface-hover)',
                    borderRadius: '20px',
                    fontSize: '13px'
                  }}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    style={{
                      marginLeft: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: '16px',
                      lineHeight: 1,
                      padding: '0 4px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.content.trim()}
          style={buttonStyle(isSubmitting || !formData.content.trim())}
          onMouseEnter={(e) => {
            if (!isSubmitting && formData.content.trim()) {
              e.target.style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && formData.content.trim()) {
              e.target.style.opacity = '1';
            }
          }}
        >
          {isSubmitting 
            ? t('common.saving')
            : t('entries.form.submit')
          }
        </button>

        {/* Подсказка для планов */}
        {formData.type === 'plan' && !formData.deadline && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: `${getColor('warning')}20`,
            border: `1px solid ${getColor('warning')}`,
            borderRadius: '6px',
            fontSize: '13px',
            color: getColor('warning')
          }}>
            ⚠️ {t('common.planDeadlineRequired')}
          </div>
        )}
      </form>

      {/* Модалка для выбора эмоций */}
      <Modal
        isOpen={showEmotionPicker}
        onClose={() => setShowEmotionPicker(false)}
        title={t('emotions.picker.title')}
        size="lg"
        footer={null}
      >
        <EmotionPicker
          selectedEmotions={formData.emotions}
          onChange={handleEmotionsChange}
          maxEmotions={5}
        />
        
        {/* Кнопка закрытия внизу */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${currentTheme.colors.border}`
        }}>
          <button
            onClick={() => setShowEmotionPicker(false)}
            style={{
              padding: '10px 20px',
              background: currentTheme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {t('common.saveAndClose')}
          </button>
        </div>
      </Modal>
    </>
  );
});

export default EntryForm;