import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTagsStore } from '@/store/StoreContext';

const TagsSettings = observer(() => {
  const tagsStore = useTagsStore();
  return (
    <div className="settings-panel">
      <h3>Теги</h3>
      <p>Добавьте теги к узлу</p>
    </div>
  );
});

export default TagsSettings;