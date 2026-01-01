// src/ui/components/entries/EntryCard/EntryCard.stories.jsx
import React from 'react';
import { within, userEvent, expect, fn } from '@storybook/test';
import EntryCard from './EntryCard';
import { Entry } from '../../../../core/entities/Entry';

// Фабрика для создания тестовых данных
const createTestEntry = (overrides = {}) => {
  const defaults = {
    id: `test-${Date.now()}-${Math.random()}`,
    userId: 1,
    type: 'dream',
    content: 'Тестовый контент записи',
    bodyStateId: null,
    circumstanceId: null,
    deadline: null,
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emotions: [],
    circumstances: [],
    bodyState: null,
    skills: [],
    people: [],
    tags: [],
    relations: { incoming: [], outgoing: [] }
  };
  
  return { ...defaults, ...overrides };
};

export default {
  title: 'Entries/EntryCard',
  component: EntryCard,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    entryId: {
      control: 'text',
      description: 'ID записи для загрузки',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'required' }
      }
    },
    compact: {
      control: 'boolean',
      description: 'Компактный режим',
      table: {
        category: 'Display',
        defaultValue: { summary: 'false' }
      }
    },
    showActions: {
      control: 'boolean',
      description: 'Показывать кнопки действий',
      table: {
        category: 'Display',
        defaultValue: { summary: 'true' }
      }
    },
    entryData: {
      control: 'object',
      description: 'Тестовые данные записи',
      table: {
        type: { summary: 'object' }
      }
    }
  },
  args: {
    compact: false,
    showActions: true
  }
};

// Базовый шаблон
const Template = (args) => <EntryCard {...args} />;

// ==================== РЕАЛЬНЫЕ ТЕСТОВЫЕ СЦЕНАРИИ ====================

export const DreamWithFullData = Template.bind({});
DreamWithFullData.args = {
  entryId: 'dream-full-1',
  entryData: createTestEntry({
    id: 'dream-full-1',
    type: 'dream',
    content: 'Приснилось, что я лечу над горами Альп. Воздух чистый и холодный, видно каждый камень. Чувствую свободу и радость.',
    emotions: [
      { id: 1, name: 'Joy', intensity: 9, color: '#FFD700' },
      { id: 2, name: 'Excitement', intensity: 8, color: '#FF6B6B' }
    ],
    circumstances: [
      { 
        id: 1, 
        weather: 'ясно',
        temperature: 22,
        notes: 'Ночь после тяжелого дня'
      }
    ],
    bodyState: {
      id: 1,
      health_points: 85,
      energy_points: 70,
      location_name: 'Спальня',
      location_precision: 'exact'
    },
    skills: [
      { id: 1, name: 'Осознанные сновидения', level: 3, icon: '💭' }
    ],
    people: [
      { id: 1, name: 'Старый друг', category: 'friends' }
    ],
    tags: ['полет', 'горы', 'свобода'],
    createdAt: '2024-01-15T10:30:00Z'
  })
};

export const PlanWithDeadline = Template.bind({});
PlanWithDeadline.args = {
  entryId: 'plan-1',
  entryData: createTestEntry({
    id: 'plan-1',
    type: 'plan',
    content: 'Завершить интеграцию Storybook со всеми компонентами системы AIM.',
    deadline: '2024-02-28T23:59:59Z',
    isCompleted: false,
    tags: ['разработка', 'документация', 'тестирование'],
    createdAt: '2024-01-20T09:00:00Z'
  })
};

export const OverduePlan = Template.bind({});
OverduePlan.args = {
  entryId: 'plan-overdue-1',
  entryData: createTestEntry({
    id: 'plan-overdue-1',
    type: 'plan',
    content: 'Сдать квартальный отчет по проекту',
    deadline: '2024-01-15T18:00:00Z', // Прошедшая дата
    isCompleted: false,
    createdAt: '2024-01-10T09:00:00Z'
  })
};

export const MemoryWithPeople = Template.bind({});
MemoryWithPeople.args = {
  entryId: 'memory-1',
  entryData: createTestEntry({
    id: 'memory-1',
    type: 'memory',
    content: 'Вспомнил, как мы с дедом ходили на рыбалку ранним утром. Туман над рекой, запах мокрой травы.',
    emotions: [
      { id: 3, name: 'Nostalgia', intensity: 8, color: '#6B8E23' }
    ],
    people: [
      { id: 1, name: 'Дед Иван', category: 'family' }
    ],
    tags: ['детство', 'рыбалка', 'семья'],
    createdAt: '2024-01-18T14:20:00Z'
  })
};

export const ThoughtSimple = Template.bind({});
ThoughtSimple.args = {
  entryId: 'thought-1',
  entryData: createTestEntry({
    id: 'thought-1',
    type: 'thought',
    content: 'Интересно, почему сны иногда кажутся более реальными, чем сама реальность?',
    tags: ['философия', 'сны'],
    createdAt: '2024-01-19T16:45:00Z'
  })
};

// ==================== ИНТЕРАКТИВНЫЕ ТЕСТЫ ====================

export const ClickCardToOpenDetail = Template.bind({});
ClickCardToOpenDetail.args = {
  ...DreamWithFullData.args
};
ClickCardToOpenDetail.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const card = await canvas.findByRole('article', { name: /запись/i });
  await userEvent.click(card);
};

export const ClickEditButton = Template.bind({});
ClickEditButton.args = {
  ...DreamWithFullData.args
};
ClickEditButton.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const editButton = await canvas.findByTitle('Редактировать');
  await userEvent.click(editButton);
};

export const TogglePlanCompletion = Template.bind({});
TogglePlanCompletion.args = {
  ...PlanWithDeadline.args
};
TogglePlanCompletion.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const completeButton = await canvas.findByTitle('Отметить как выполненное');
  await userEvent.click(completeButton);
};

// ==================== СОСТОЯНИЯ КОМПОНЕНТА ====================

export const CompactMode = Template.bind({});
CompactMode.args = {
  ...DreamWithFullData.args,
  compact: true
};

export const WithoutActions = Template.bind({});
WithoutActions.args = {
  ...DreamWithFullData.args,
  showActions: false
};

export const LoadingState = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <div className="entry-card loading">
      <div className="entry-header loading-shimmer"></div>
      <div className="entry-content loading-shimmer"></div>
      <div className="entry-footer loading-shimmer"></div>
    </div>
  </div>
);

export const ErrorState = Template.bind({});
ErrorState.args = {
  entryId: 'non-existent-id',
  entryData: null
};

// ==================== ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ====================

export const ManyEmotionsAndTags = Template.bind({});
ManyEmotionsAndTags.args = {
  entryId: 'performance-test-1',
  entryData: createTestEntry({
    id: 'performance-test-1',
    type: 'dream',
    content: 'Тест производительности с большим количеством метаданных.',
    emotions: Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Эмоция ${i + 1}`,
      intensity: (i % 10) + 1,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    })),
    tags: Array.from({ length: 20 }, (_, i) => `тег-${i + 1}`),
    skills: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Навык ${i + 1}`,
      level: (i % 5) + 1,
      icon: '⭐'
    })),
    people: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      name: `Человек ${i + 1}`,
      category: i % 2 === 0 ? 'family' : 'friends'
    }))
  })
};

// ==================== ДОКУМЕНТАЦИЯ ====================

export const ComponentAPI = () => (
  <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
    <h2>API компонента EntryCard</h2>
    
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f4f6' }}>
          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Проп</th>
          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Тип</th>
          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Обязательный</th>
          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>По умолчанию</th>
          <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #d1d5db' }}>Описание</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}><code>entryId</code></td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>string</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>Да</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>-</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>ID записи в сторе</td>
        </tr>
        <tr>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}><code>compact</code></td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>boolean</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>Нет</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>false</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>Компактный режим отображения</td>
        </tr>
        <tr>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}><code>showActions</code></td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>boolean</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>Нет</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>true</td>
          <td style={{ padding: '12px', border: '1px solid #d1d5db' }}>Показывать кнопки действий</td>
        </tr>
      </tbody>
    </table>
  </div>
);