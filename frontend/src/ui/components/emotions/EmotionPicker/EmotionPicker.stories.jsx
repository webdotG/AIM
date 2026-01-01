import React from 'react';
import { mockEmotions } from '../../entries/mocks';

export default {
  title: 'Emotions/Picker',
  parameters: {
    layout: 'centered',
  },
};

const EmotionPicker = ({ selected = [], onChange, multiSelect = true }) => {
  const [selectedEmotions, setSelectedEmotions] = React.useState(selected);
  
  const handleClick = (emotion) => {
    if (multiSelect) {
      const newSelected = selectedEmotions.includes(emotion.id)
        ? selectedEmotions.filter(id => id !== emotion.id)
        : [...selectedEmotions, emotion.id];
      setSelectedEmotions(newSelected);
      onChange?.(newSelected);
    } else {
      setSelectedEmotions([emotion.id]);
      onChange?.([emotion.id]);
    }
  };
  
  const getCategoryColor = (category) => {
    switch(category) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '10px',
      maxWidth: '600px'
    }}>
      {mockEmotions.map(emotion => (
        <button
          key={emotion.id}
          onClick={() => handleClick(emotion)}
          style={{
            padding: '12px',
            border: `2px solid ${selectedEmotions.includes(emotion.id) ? getCategoryColor(emotion.category) : '#e5e7eb'}`,
            backgroundColor: selectedEmotions.includes(emotion.id) 
              ? `${getCategoryColor(emotion.category)}20` 
              : 'white',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ 
            color: getCategoryColor(emotion.category),
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            {emotion.name_ru}
          </div>
          <div style={{ 
            fontSize: '12px',
            color: '#6b7280'
          }}>
            {emotion.name_en}
          </div>
          {selectedEmotions.includes(emotion.id) && (
            <div style={{ 
              marginTop: '5px',
              fontSize: '11px',
              color: getCategoryColor(emotion.category)
            }}>
              Выбрано
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export const SingleSelect = () => {
  const [selected, setSelected] = React.useState([]);
  return (
    <div>
      <h3>Выберите одну эмоцию</h3>
      <EmotionPicker 
        selected={selected}
        onChange={setSelected}
        multiSelect={false}
      />
      <div style={{ marginTop: '20px', color: '#6b7280' }}>
        Выбрано: {selected.length} эмоций
      </div>
    </div>
  );
};

export const MultiSelect = () => {
  const [selected, setSelected] = React.useState([1, 4]);
  return (
    <div>
      <h3>Выберите несколько эмоций</h3>
      <EmotionPicker 
        selected={selected}
        onChange={setSelected}
        multiSelect={true}
      />
      <div style={{ marginTop: '20px', color: '#6b7280' }}>
        Выбрано: {selected.length} эмоций
      </div>
    </div>
  );
};

export const WithIntensity = () => {
  const [selected, setSelected] = React.useState([{id: 1, intensity: 5}]);
  
  return (
    <div style={{ maxWidth: '800px' }}>
      <h3>Эмоции с интенсивностью</h3>
      <EmotionPicker selected={selected.map(s => s.id)} onChange={(ids) => {
        setSelected(ids.map(id => ({ id, intensity: 5 })));
      }} />
      
      <div style={{ marginTop: '30px' }}>
        <h4>Настройка интенсивности</h4>
        {selected.map(emotion => {
          const emotionData = mockEmotions.find(e => e.id === emotion.id);
          return (
            <div key={emotion.id} style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '20px',
              marginBottom: '15px',
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px'
            }}>
              <span style={{ minWidth: '100px', fontWeight: '500' }}>
                {emotionData?.name_ru}
              </span>
              <input
                type="range"
                min="1"
                max="10"
                value={emotion.intensity}
                onChange={(e) => {
                  setSelected(prev => prev.map(em => 
                    em.id === emotion.id 
                      ? { ...em, intensity: parseInt(e.target.value) }
                      : em
                  ));
                }}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center' }}>
                {emotion.intensity}/10
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
