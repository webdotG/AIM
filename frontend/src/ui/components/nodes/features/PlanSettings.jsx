import React from 'react';
import { observer } from 'mobx-react-lite';
import Input from '../../common/Input/Input';

const PlanSettings = observer(({ setContent }) => {
  return (
    <div className="settings-panel">
      <h3>План</h3>
      <Input label="Срок выполнения" type="date" placeholder="Срок выполнения" />
      <Input label="Приоритет (1-10)" type="number" min={1} max={10} placeholder="Приоритет" />
    </div>
  );
});

export default PlanSettings;