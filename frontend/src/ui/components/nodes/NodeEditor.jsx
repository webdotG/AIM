import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNodeStore } from '@/store/StoreContext';
import { useEmotionsStore } from '@/store/StoreContext';
import { useTagsStore } from '@/store/StoreContext';
import { useAIStore } from '@/store/StoreContext';
import DreamSettings from './features/DreamSettings';
import ThoughtSettings from './features/ThoughtSettings';
import MemorySettings from './features/MemorySettings';
import PlanSettings from './features/PlanSettings';
import ActionSettings from './features/ActionSettings';
import EmotionSettings from './features/EmotionSettings';
import TagsSettings from './features/TagsSettings';
import MeasurementsSettings from './features/MeasurementsSettings';
import GraphSettings from './features/GraphSettings';
import AISettings from './features/AISettings';
import Input from '../common/Input/Input';
import Button from '../common/Button/Button';
import './NodeEditor.css';

const NodeEditor = observer(() => {
  const nodeStore = useNodeStore();
  const emotionsStore = useEmotionsStore();
  const tagsStore = useTagsStore();
  const aiStore = useAIStore();
  const [nodeType, setNodeType] = useState('dream');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});

  const typeLabels = {
    dream: 'Сон',
    thought: 'Мысль',
    memory: 'Воспоминание',
    plan: 'План',
    action: 'Действие',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = {};

    if (!title.trim()) {
      validationErrors.title = 'Введите заголовок';
    }
    if (!content.trim()) {
      validationErrors.content = 'Введите содержимое';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        type: nodeType,
      };

      await nodeStore.createNode(data);

      setTitle('');
      setContent('');
      setNodeType('dream');
      emotionsStore.clearSelection();
      tagsStore.clearSelection();
      aiStore.clearCache();
    } catch (error) {
      setErrors({ form: error.message || 'Ошибка создания узла' });
    }
  };

  return (
    <div className="node-editor">
      <div className="node-editor__header">
        <h2>Создать новый узел</h2>
        <div className="node-editor__type-selector">
          {['dream', 'thought', 'memory', 'plan', 'action'].map(type => (
            <button
              key={type}
              className={`node-editor__type-btn ${nodeType === type ? 'active' : ''}`}
              onClick={() => setNodeType(type)}
            >
              {typeLabels[type] || type}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {errors.form && (
          <div className="node-editor__error">{errors.form}</div>
        )}

        <div className="node-editor__fields">
          <Input
            id="title-input"
            name="title"
            placeholder="Заголовок..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required={true}
          />

          <p>Тип: {typeLabels[nodeType]}</p>
          <div className="node-editor__type-badge">
            {typeLabels[nodeType]}
          </div>
        </div>

        {nodeType === 'dream' && <DreamSettings setContent={setContent} />}
        {nodeType === 'thought' && <ThoughtSettings setContent={setContent} />}
        {nodeType === 'memory' && <MemorySettings setContent={setContent} />}
        {nodeType === 'plan' && <PlanSettings setContent={setContent} />}
        {nodeType === 'action' && <ActionSettings setContent={setContent} />}

        <div className="node-editor__features">
          <EmotionSettings />
          <TagsSettings />
          <MeasurementsSettings nodeType={nodeType} />
          <GraphSettings />
          <AISettings nodeType={nodeType} />
        </div>

        <div className="node-editor__actions">
          <Button
            type="submit"
            variant="primary"
            disabled={nodeStore.isLoading}
          >
            {nodeStore.isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </div>
  );
});

export default NodeEditor;