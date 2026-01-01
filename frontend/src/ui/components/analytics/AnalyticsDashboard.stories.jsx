import React from 'react';
import { mockEntries, mockSkills, mockEmotions } from '../entries/mocks';

export default {
  title: 'Analytics/Dashboard',
  parameters: {
    layout: 'fullscreen',
  },
};

// Компоненты для демонстрации
const StatCard = ({ title, value, change }) => (
  <div style={{
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  }}>
    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>{title}</h4>
    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{value}</div>
    {change && (
      <div style={{ 
        color: change > 0 ? '#10b981' : '#ef4444',
        fontSize: '14px',
        marginTop: '5px'
      }}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
      </div>
    )}
  </div>
);

const EmotionChart = ({ emotions }) => (
  <div style={{
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginTop: '20px',
  }}>
    <h3 style={{ margin: '0 0 20px 0' }}>Распределение эмоций</h3>
    <div style={{ display: 'flex', gap: '10px', height: '200px', alignItems: 'flex-end' }}>
      {emotions.map((emotion, i) => (
        <div key={emotion.id} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            height: `${(emotion.count / Math.max(...emotions.map(e => e.count))) * 150}px`,
            backgroundColor: emotion.category === 'positive' ? '#10b981' : 
                           emotion.category === 'negative' ? '#ef4444' : '#6b7280',
            borderRadius: '6px 6px 0 0',
          }} />
          <div style={{ marginTop: '10px', fontSize: '12px' }}>
            {emotion.name_ru}
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
            {emotion.count}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkillsProgress = ({ skills }) => (
  <div style={{
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginTop: '20px',
  }}>
    <h3 style={{ margin: '0 0 20px 0' }}>Прогресс навыков</h3>
    {skills.map(skill => (
      <div key={skill.id} style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: '500' }}>{skill.name}</span>
          <span style={{ color: '#6b7280' }}>Уровень {skill.current_level}</span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${(skill.experience_points % 1000) / 10}%`,
            height: '100%',
            backgroundColor: skill.color || '#3b82f6',
            borderRadius: '4px',
          }} />
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
          {skill.experience_points} опыта
        </div>
      </div>
    ))}
  </div>
);

const Template = () => {
  // Агрегируем данные
  const entryTypes = mockEntries.reduce((acc, entry) => {
    acc[entry.entry_type] = (acc[entry.entry_type] || 0) + 1;
    return acc;
  }, {});

  const emotionStats = mockEmotions.map(emotion => ({
    ...emotion,
    count: Math.floor(Math.random() * 20) + 5 // Мок данные
  }));

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ margin: '0 0 30px 0' }}>Аналитика AIM</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StatCard 
          title="Всего записей" 
          value={mockEntries.length} 
          change={12.5} 
        />
        <StatCard 
          title="Сны" 
          value={entryTypes.dream || 0} 
          change={8.3} 
        />
        <StatCard 
          title="Мысли" 
          value={entryTypes.thought || 0} 
          change={5.2} 
        />
        <StatCard 
          title="Воспоминания" 
          value={entryTypes.memory || 0} 
          change={15.7} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div>
          <EmotionChart emotions={emotionStats} />
        </div>
        <div>
          <SkillsProgress skills={mockSkills} />
        </div>
      </div>
    </div>
  );
};

export const Default = Template.bind({});
export const MobileView = Template.bind({});
MobileView.parameters = {
  viewport: { defaultViewport: 'mobile' },
};
export const DarkTheme = Template.bind({});
DarkTheme.parameters = {
  backgrounds: { default: 'dark' },
};
