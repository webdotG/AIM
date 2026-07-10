import React from 'react';
import { observer } from 'mobx-react-lite';
import { useEmotionsStore } from '@/store/StoreContext';

const EmotionSettings = observer(() => {
  const emotionsStore = useEmotionsStore();
  return (
    <div className="settings-panel">
      <h3>Эмоции (27 Berkeley)</h3>
      <p>Выберите эмоции для узла</p>
    </div>
  );
});

export default EmotionSettings;