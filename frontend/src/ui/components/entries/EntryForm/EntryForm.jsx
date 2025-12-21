import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useLanguage } from '@/layers/language';
import { useEntriesStore, useUIStore } from '@/store/StoreContext';
import Modal from '../../common/Modal/Modal';
import EmotionPicker from '@/ui/components/emotions/EmotionPicker/EmotionPicker';
import './EntryForm.css';

const EntryForm = observer(() => {
  const entriesStore = useEntriesStore();
  const uiStore = useUIStore();
  const { t } = useLanguage();

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

  const typeConfig = {
    dream: {
      icon: '🌙',
      label: t('entries.types.dream'),
      className: 'type-dream'
    },
    memory: {
      icon: '📸',
      label: t('entries.types.memory'),
      className: 'type-memory'
    },
    thought: {
      icon: '💭',
      label: t('entries.types.thought'),
      className: 'type-thought'
    },
    plan: {
      icon: '📋',
      label: t('entries.types.plan'),
      className: 'type-plan'
    }
  };

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

  const handleEmotionsChange = (updatedEmotions) => {
    setFormData(prev => ({
      ...prev,
      emotions: updatedEmotions
    }));
  };

  const handleEmotionIntensityChange = (index, intensity) => {
    const updatedEmotions = [...formData.emotions];
    updatedEmotions[index] = {
      ...updatedEmotions[index],
      intensity: parseInt(intensity)
    };
    handleInputChange('emotions', updatedEmotions);
  };

  const handleRemoveEmotion = (index) => {
    const newEmotions = formData.emotions.filter((_, i) => i !== index);
    handleInputChange('emotions', newEmotions);
  };

  const handleRemoveTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    handleInputChange('tags', newTags);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      uiStore.showErrorMessage(t('common.requiredContent'));
      return;
    }

    if (formData.type === 'plan' && !formData.deadline) {
      uiStore.showErrorMessage(t('common.requiredDeadline'));
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

      uiStore.showSuccessMessage(t('common.entryCreated'));

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

  const getIntensityClass = (intensity) => {
    if (intensity >= 7) return 'high';
    if (intensity <= 3) return 'low';
    return 'medium';
  };

  const getCategoryClass = (category) => {
    return category || 'neutral';
  };

  return (
    <>
      <form className="entry-form" onSubmit={handleSubmit}>
        <h3 className="form-title">
          {t('entries.form.title')}
        </h3>

        {/* Выбор типа записи */}
        <div className="type-buttons">
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              type="button"
              className={`type-button ${config.className} ${formData.type === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>

        {/* Содержание */}
        <div className="form-group">
          <label className="form-label required">
            {t('entries.form.contentLabel')}
          </label>
          <textarea
            className="form-textarea"
            value={formData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            placeholder={t('entries.form.contentPlaceholder')}
            required
          />
        </div>

        {/* Даты */}
        <div className="date-row">
          <div className="form-group">
            <label className="form-label">
              {t('entries.form.dateLabel')}
            </label>
            <input
              className="form-input"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              max={getCurrentDate()}
            />
          </div>

          {formData.type === 'plan' && (
            <div className="form-group">
              <label className="form-label required">
                {t('entries.form.deadlineLabel')}
              </label>
              <input
                className="form-input"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={getTomorrowDate()}
                required={formData.type === 'plan'}
              />
            </div>
          )}
        </div>

        {/* Эмоции */}
        <div className="form-group">
          <div className="emotions-header">
            <label className="form-label">
              {t('entries.form.emotionsLabel')}
            </label>
            <button
              type="button"
              className="add-emotions-button"
              onClick={() => setShowEmotionPicker(true)}
            >
              😊 {t('emotions.picker.open')}
            </button>
          </div>

          <div className="emotions-container">
            {formData.emotions.length > 0 ? (
              formData.emotions.map((emotion, index) => (
                <div key={index} className="emotion-badge">
                  <div className="emotion-info">
                    <span className="emotion-emoji">{emotion.emoji}</span>
                    <div className="emotion-details">
                      <div className="emotion-label">{emotion.label}</div>
                      <div className={`emotion-category ${getCategoryClass(emotion.category)}`}>
                        {t(`emotions.categories.${emotion.category}`)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="emotion-controls">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={emotion.intensity}
                      onChange={(e) => handleEmotionIntensityChange(index, e.target.value)}
                      className="intensity-slider"
                      title={t('emotions.picker.intensity')}
                    />
                    <span className={`intensity-value ${getIntensityClass(emotion.intensity)}`}>
                      {emotion.intensity}
                    </span>
                    <button
                      type="button"
                      className="remove-emotion-button"
                      onClick={() => handleRemoveEmotion(index)}
                      title={t('common.remove')}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-emotions">
                {t('emotions.picker.noEmotionsSelected')}
              </div>
            )}
          </div>
          
          <div className="emotions-footer">
            <span>{formData.emotions.length}/5 {t('common.selected')}</span>
            {formData.emotions.length > 0 && (
              <button
                type="button"
                className="clear-emotions-button"
                onClick={() => handleInputChange('emotions', [])}
              >
                {t('common.clearAll')}
              </button>
            )}
          </div>
        </div>

        {/* Теги */}
        <div className="form-group">
          <label className="form-label">
            {t('entries.form.tagsLabel')}
          </label>
          <input
            className="form-input tag-input"
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
          />
          
          {formData.tags.length > 0 && (
            <div className="tag-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag-badge">
                  #{tag}
                  <button
                    type="button"
                    className="remove-tag-button"
                    onClick={() => handleRemoveTag(index)}
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
          className="submit-button"
          disabled={isSubmitting || !formData.content.trim()}
        >
          {isSubmitting ? t('common.saving') : t('entries.form.submit')}
        </button>

        {/* Подсказка для планов */}
        {formData.type === 'plan' && !formData.deadline && (
          <div className="plan-warning">
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
      >
        <EmotionPicker
          selectedEmotions={formData.emotions}
          onChange={handleEmotionsChange}
          maxEmotions={5}
        />
      </Modal>
    </>
  );
});

export default EntryForm;