import React from 'react';
import { observer } from 'mobx-react-lite';
import { useNodeStore } from '@/store/StoreContext';

const MeasurementsSettings = observer(({ nodeType }) => {
  const nodeStore = useNodeStore();
  return (
    <div className="settings-panel">
      <h3>Измерения</h3>
      <p>Добавьте измерения к узлу</p>
    </div>
  );
});

export default MeasurementsSettings;