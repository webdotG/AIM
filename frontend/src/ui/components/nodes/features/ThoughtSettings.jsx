import React from 'react';
import { observer } from 'mobx-react-lite';
import Input from '../../common/Input/Input';

const ThoughtSettings = observer(({ setContent }) => {
  return (
    <div className="settings-panel">
      <h3>Мысль</h3>
      <Input label="Важность (1-10)" type="number" min={1} max={10} placeholder="Важность" />
      <Input label="Уверенность (1-10)" type="number" min={1} max={10} placeholder="Уверенность" />
    </div>
  );
});

export default ThoughtSettings;