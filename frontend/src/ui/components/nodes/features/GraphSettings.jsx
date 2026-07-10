import React from 'react';
import { observer } from 'mobx-react-lite';
import { useEdgeStore } from '@/store/StoreContext';
import { useNodeStore } from '@/store/StoreContext';

const GraphSettings = observer(() => {
  const edgeStore = useEdgeStore();
  const nodeStore = useNodeStore();
  return (
    <div className="settings-panel">
      <h3>Связи (Edge)</h3>
      <p>Подключить к другим узлам графа</p>
    </div>
  );
});

export default GraphSettings;