import React from 'react';
import { observer } from 'mobx-react-lite';
import Input from '../../common/Input/Input';

const MemorySettings = observer(({ setContent }) => {
  return (
    <div className="settings-panel">
      <h3>Воспоминание</h3>
      <Input label="Дата события" type="date" placeholder="Уверенность (1-10)" />
      <Input label="Уверенность (1-10)" type="number" min={1} max={10} placeholder="Воспоминание" />
    </div>
  );
});

export default MemorySettings;