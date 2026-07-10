import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAIStore } from '@/store/StoreContext';

const AISettings = observer(({ nodeType }) => {
  const aiStore = useAIStore();
  return (
    <div className="settings-panel">
      <h3>AI Анализ</h3>
      <p>Запросить AI-анализ или сгенерировать изображение</p>
    </div>
  );
});

export default AISettings;