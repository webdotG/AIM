// src/ui/components/emotions/EmotionPicker/EmotionPicker.jsx
import React, { useState } from 'react';
import { useLanguage } from '@/layers/language';
import { useTheme } from '@/layers/theme';
import './EmotionPicker.css';

const EmotionPicker = ({ 
  selectedEmotions = [], 
  onChange,
  maxEmotions = 5,
  showCategoryFirst = true
}) => {
  const { t } = useLanguage();
  const { currentTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState(showCategoryFirst ? 'category' : 'emotion');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);
  const [tempEmotion, setTempEmotion] = useState(null);

  // Категории эмоций
  const categories = [
    { id: 'positive', label: t('emotions.categories.positive'), color: currentTheme.colors.positive },
    { id: 'negative', label: t('emotions.categories.negative'), color: currentTheme.colors.negative },
    { id: 'neutral', label: t('emotions.categories.neutral'), color: currentTheme.colors.neutral }
  ];

  // Все 27 эмоций с категориями
  const allEmotions = {
    positive: [
      { id: 'admiration', emoji: '😌', label: t('emotions.list.admiration') },
      { id: 'adoration', emoji: '😍', label: t('emotions.list.adoration') },
      { id: 'aesthetic_appreciation', emoji: '🎨', label: t('emotions.list.aesthetic_appreciation') },
      { id: 'amusement', emoji: '😄', label: t('emotions.list.amusement') },
      { id: 'calmness', emoji: '😌', label: t('emotions.list.calmness') },
      { id: 'excitement', emoji: '🎉', label: t('emotions.list.excitement') },
      { id: 'joy', emoji: '😊', label: t('emotions.list.joy') },
      { id: 'relief', emoji: '😌', label: t('emotions.list.relief') },
      { id: 'romance', emoji: '💕', label: t('emotions.list.romance') },
      { id: 'satisfaction', emoji: '😌', label: t('emotions.list.satisfaction') }
    ],
    negative: [
      { id: 'anger', emoji: '😠', label: t('emotions.list.anger') },
      { id: 'anxiety', emoji: '😰', label: t('emotions.list.anxiety') },
      { id: 'awkwardness', emoji: '😅', label: t('emotions.list.awkwardness') },
      { id: 'boredom', emoji: '😐', label: t('emotions.list.boredom') },
      { id: 'confusion', emoji: '😕', label: t('emotions.list.confusion') },
      { id: 'disgust', emoji: '🤢', label: t('emotions.list.disgust') },
      { id: 'empathic_pain', emoji: '💔', label: t('emotions.list.empathic_pain') },
      { id: 'fear', emoji: '😨', label: t('emotions.list.fear') },
      { id: 'horror', emoji: '😱', label: t('emotions.list.horror') },
      { id: 'sadness', emoji: '😢', label: t('emotions.list.sadness') }
    ],
    neutral: [
      { id: 'awe', emoji: '😲', label: t('emotions.list.awe') },
      { id: 'craving', emoji: '🤤', label: t('emotions.list.craving') },
      { id: 'entrancement', emoji: '😮', label: t('emotions.list.entrancement') },
      { id: 'interest', emoji: '🧐', label: t('emotions.list.interest') },
      { id: 'nostalgia', emoji: '📜', label: t('emotions.list.nostalgia') },
      { id: 'sexual_desire', emoji: '😘', label: t('emotions.list.sexual_desire') },
      { id: 'surprise', emoji: '😮', label: t('emotions.list.surprise') }
    ]
  };

  // Получить эмоции для выбранной категории
  const getCurrentEmotions = () => {
    if (selectedCategory && allEmotions[selectedCategory]) {
      return allEmotions[selectedCategory];
    }
    // Если категория не выбрана, показать все эмоции
    return [...allEmotions.positive, ...allEmotions.negative, ...allEmotions.neutral];
  };

  // Обработка выбора категории
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setActiveTab('emotion');
  };

  // Обработка выбора эмоции
  const handleEmotionSelect = (emotion) => {
    if (selectedEmotions.length >= maxEmotions) {
      alert(t('emotions.picker.maxEmotions', { max: maxEmotions }));
      return;
    }
    
    setTempEmotion({
      id: emotion.id,
      label: emotion.label,
      emoji: emotion.emoji,
      category: selectedCategory || 
        (allEmotions.positive.find(e => e.id === emotion.id) ? 'positive' :
         allEmotions.negative.find(e => e.id === emotion.id) ? 'negative' : 'neutral'),
      intensity: 5 // среднее значение по умолчанию
    });
    setShowIntensityPicker(true);
  };

  // Обработка интенсивности
  const handleIntensityConfirm = (intensity) => {
    const newEmotion = {
      ...tempEmotion,
      intensity
    };
    
    const updatedEmotions = [...selectedEmotions, newEmotion];
    onChange(updatedEmotions);
    setShowIntensityPicker(false);
    setTempEmotion(null);
    
    // Возвращаемся к выбору эмоции
    setActiveTab('emotion');
  };

  // Удаление эмоции
  const handleRemoveEmotion = (index) => {
    const updatedEmotions = selectedEmotions.filter((_, i) => i !== index);
    onChange(updatedEmotions);
  };

  // Изменение интенсивности существующей эмоции
  const handleIntensityChange = (index, intensity) => {
    const updatedEmotions = [...selectedEmotions];
    updatedEmotions[index] = {
      ...updatedEmotions[index],
      intensity
    };
    onChange(updatedEmotions);
  };

  // Стили
  const containerStyle = {
    background: 'var(--color-surface)',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    overflow: 'hidden'
  };

  const headerStyle = {
    display: 'flex',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-surface-hover)'
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '12px',
    background: active ? 'var(--color-surface)' : 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-primary)' : 'none',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    transition: 'all 0.2s'
  });

  const contentStyle = {
    padding: '20px'
  };

  const categoriesGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px'
  };

  const categoryCardStyle = (category) => ({
    padding: '15px',
    background: `linear-gradient(135deg, ${category.color}20, ${category.color}10)`,
    border: `2px solid ${category.color}`,
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center'
  });

  const emotionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px'
  };

  const emotionCardStyle = (selected) => ({
    padding: '10px',
    background: selected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
    border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    opacity: selected ? 0.6 : 1
  });

  const selectedEmotionsStyle = {
    marginTop: '20px',
    padding: '15px',
    background: 'var(--color-surface-hover)',
    borderRadius: '8px'
  };

  const selectedEmotionItemStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    marginBottom: '8px'
  };

  const intensitySliderStyle = {
    width: '80px',
    height: '6px',
    borderRadius: '3px',
    background: 'var(--color-border)',
    outline: 'none',
    cursor: 'pointer'
  };

  // Рендер выбора категории
  const renderCategories = () => (
    <div style={categoriesGridStyle}>
      {categories.map(category => (
        <div
          key={category.id}
          style={categoryCardStyle(category)}
          onClick={() => handleCategorySelect(category.id)}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>
            {category.id === 'positive' ? '😊' : 
             category.id === 'negative' ? '😢' : '😐'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: category.color 
          }}>
            {category.label}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {category.id === 'positive' ? t('emotions.picker.positiveDesc') :
             category.id === 'negative' ? t('emotions.picker.negativeDesc') :
             t('emotions.picker.neutralDesc')}
          </div>
        </div>
      ))}
    </div>
  );

  // Рендер выбора эмоций
  const renderEmotions = () => (
    <>
      {selectedCategory && (
        <div style={{ 
          marginBottom: '15px',
          padding: '10px',
          background: `linear-gradient(135deg, ${currentTheme.colors[selectedCategory]}20, transparent)`,
          borderRadius: '8px',
          border: `1px solid ${currentTheme.colors[selectedCategory]}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <span style={{ fontWeight: '600' }}>
            {categories.find(c => c.id === selectedCategory)?.label}
          </span>
        </div>
      )}
      
      <div style={emotionsGridStyle}>
        {getCurrentEmotions().map(emotion => {
          const isSelected = selectedEmotions.some(e => e.id === emotion.id);
          return (
            <div
              key={emotion.id}
              style={emotionCardStyle(isSelected)}
              onClick={() => !isSelected && handleEmotionSelect(emotion)}
              onMouseEnter={(e) => !isSelected && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !isSelected && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                {emotion.emoji}
              </div>
              <div style={{ 
                fontSize: '12px',
                fontWeight: '500',
                color: isSelected ? 'var(--color-text-secondary)' : 'var(--color-text)'
              }}>
                {emotion.label}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  // Рендер выбора интенсивности
  const renderIntensityPicker = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>
          {t('emotions.picker.setIntensity')}
        </h3>
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {tempEmotion?.emoji}
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>
            {tempEmotion?.label}
          </div>
        </div>
        
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span>{t('emotions.intensityLevels.veryLow')}</span>
            <span>{t('emotions.intensityLevels.veryHigh')}</span>
          </div>
          
          <input
            type="range"
            min="1"
            max="10"
            defaultValue="5"
            onChange={(e) => setTempEmotion(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              background: 'linear-gradient(to right, #4CAF50, #FFC107, #F44336)',
              outline: 'none'
            }}
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '5px',
            fontSize: '12px',
            color: 'var(--color-text-secondary)'
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <span key={num}>{num}</span>
            ))}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowIntensityPicker(false);
              setTempEmotion(null);
            }}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--color-surface-hover)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={() => handleIntensityConfirm(tempEmotion.intensity || 5)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );

  // Рендер выбранных эмоций
  const renderSelectedEmotions = () => {
    if (selectedEmotions.length === 0) return null;
    
    return (
      <div style={selectedEmotionsStyle}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ fontWeight: '600' }}>
            {t('emotions.picker.selectedCount', { count: selectedEmotions.length })} / {maxEmotions}
          </span>
          {selectedEmotions.length > 0 && (
            <button
              onClick={() => onChange([])}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                color: currentTheme.colors.error,
                border: `1px solid ${currentTheme.colors.error}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {t('common.clearAll')}
            </button>
          )}
        </div>
        
        {selectedEmotions.map((emotion, index) => (
          <div key={index} style={selectedEmotionItemStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{emotion.emoji}</span>
              <div>
                <div style={{ fontWeight: '500' }}>{emotion.label}</div>
                <div style={{ 
                  fontSize: '11px', 
                  color: 'var(--color-text-secondary)',
                  textTransform: 'capitalize'
                }}>
                  {t(`emotions.categories.${emotion.category}`)}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <input
                type="range"
                min="1"
                max="10"
                value={emotion.intensity}
                onChange={(e) => handleIntensityChange(index, parseInt(e.target.value))}
                style={intensitySliderStyle}
              />
              <span style={{ 
                minWidth: '20px', 
                textAlign: 'center',
                fontWeight: '600',
                color: emotion.intensity >= 7 ? currentTheme.colors.negative :
                       emotion.intensity <= 3 ? currentTheme.colors.positive :
                       currentTheme.colors.neutral
              }}>
                {emotion.intensity}
              </span>
              <button
                onClick={() => handleRemoveEmotion(index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentTheme.colors.error,
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 5px'
                }}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          style={tabStyle(activeTab === 'category')}
          onClick={() => setActiveTab('category')}
        >
          {t('emotions.picker.categories')}
        </button>
        <button
          style={tabStyle(activeTab === 'emotion')}
          onClick={() => setActiveTab('emotion')}
        >
          {t('emotions.picker.emotions')}
        </button>
      </div>
      
      <div style={contentStyle}>
        {activeTab === 'category' && renderCategories()}
        {activeTab === 'emotion' && renderEmotions()}
        
        {renderSelectedEmotions()}
      </div>
      
      {showIntensityPicker && renderIntensityPicker()}
    </div>
  );
};

export default EmotionPicker;