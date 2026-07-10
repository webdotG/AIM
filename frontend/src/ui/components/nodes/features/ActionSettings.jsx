import React from 'react';
import { observer } from 'mobx-react-lite';
import Input from '../../common/Input/Input';

const ActionSettings = observer(({ setContent }) => {
  return (
    <div className="settings-panel">
      <h3>Действие</h3>
      <Input label="Начало" type="datetime-local" placeholder="Начало" />
      <Input label="Конец" type="datetime-local" placeholder="Конец" />
    </div>
  );
});

export default ActionSettings;