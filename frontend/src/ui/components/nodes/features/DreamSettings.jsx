import React from 'react';
import { observer } from 'mobx-react-lite';
import Input from '../../common/Input/Input';

const DreamSettings = observer(({ setContent }) => {
  return (
    <div className="settings-panel">
      <h3>Сон</h3>
      <Input label="Осознанность (1-10)" type="number" min={1} max={10} placeholder="Осознанность" />
      <Input label="Воспоминание (1-10)" type="number" min={1} max={10} placeholder="Воспоминание" />
    </div>
  );
});

export default DreamSettings;