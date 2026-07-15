import { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useNodeStore, useEmotionsStore, useTagsStore, useAIStore } from '@/store/StoreContext';
import Button from '@/ui/components/common/Button/Button.jsx';
import TabBar from '@/shared/components/TabBar.jsx';

const typeTabs = [
  { key: 'dream', label: '💭 Сон' },
  { key: 'thought', label: '💡 Мысль' },
  { key: 'memory', label: '📷 Память' },
  { key: 'plan', label: '📋 План' },
  { key: 'action', label: '⚡ Действие' },
];

const typeLabels = {
  dream: 'Сон',
  thought: 'Мысль',
  memory: 'Воспоминание',
  plan: 'План',
  action: 'Действие',
};

export default function CreateNodePage() {
  const nodeStore = useNodeStore();
  const emotionsStore = useEmotionsStore();
  const tagsStore = useTagsStore();
  const aiStore = useAIStore();
  const [nodeType, setNodeType] = useState('dream');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Введите заголовок';
    if (!content.trim()) validationErrors.content = 'Введите содержимое';
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    
    setErrors({});
    try {
      await nodeStore.createNode({ title: title.trim(), content: content.trim(), type: nodeType });
      setTitle(''); setContent(''); setNodeType('dream');
      emotionsStore.clearSelection(); tagsStore.clearSelection(); aiStore.clearCache();
    } catch (err) {
      console.error('Create node error:', err);
      setErrors({ form: err?.message || 'Ошибка создания' });
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.heading}>Создать узел</Text>
      <TabBar tabs={typeTabs} onChange={(key) => setNodeType(key)} />
      {errors.form && <Text style={s.error}>{errors.form}</Text>}
      <View style={s.form}>
        <TextInput style={s.input} placeholder="Заголовок..." value={title} onChangeText={setTitle} />
        <Text style={s.typeLabel}>Тип: {typeLabels[nodeType]}</Text>
        <TextInput style={s.textarea} placeholder="Содержимое..." value={content} onChangeText={setContent} multiline numberOfLines={6} />
        {errors.title && <Text style={s.error}>{errors.title}</Text>}
        {errors.content && <Text style={s.error}>{errors.content}</Text>}
      </View>
      <Button variant="primary" disabled={nodeStore.isLoading} onPress={handleSubmit}>
        {nodeStore.isLoading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  form: { marginTop: 12 },
  input: { padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, fontSize: 14, marginBottom: 8 },
  textarea: { padding: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, fontSize: 14, minHeight: 120, textAlignVertical: 'top', marginBottom: 8 },
  typeLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  error: { fontSize: 13, color: 'red', marginBottom: 8 },
});