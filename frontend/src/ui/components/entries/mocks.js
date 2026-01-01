// src/ui/components/entries/mocks.js
// Используем реальную структуру из core/entities
import { Entry } from '../../../core/entities/Entry';
import { BodyState } from '../../../core/entities/BodyState';
import { Circumstance } from '../../../core/entities/Circumstance';
import { Emotion } from '../../../core/entities/Emotion';
import { Person } from '../../../core/entities/Person';
import { Tag } from '../../../core/entities/Tag';
import { Skill } from '../../../core/entities/Skill';
import { Relation } from '../../../core/entities/Relation';

// Моковые данные для эмоций (с интенсивностью для связи)
const emotionData = [
  { id: 1, name_en: 'Joy', name_ru: 'Радость', category: 'positive', intensity: 8 },
  { id: 2, name_en: 'Sadness', name_ru: 'Грусть', category: 'negative', intensity: 3 },
  { id: 3, name_en: 'Anger', name_ru: 'Гнев', category: 'negative', intensity: 5 },
  { id: 4, name_en: 'Calmness', name_ru: 'Спокойствие', category: 'positive', intensity: 7 },
  { id: 5, name_en: 'Anxiety', name_ru: 'Тревога', category: 'negative', intensity: 6 },
  { id: 6, name_en: 'Excitement', name_ru: 'Возбуждение', category: 'positive', intensity: 9 }
];

// Моковые данные для записей
export const mockEntries = [
  new Entry({
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: 1,
    entryType: 'dream',
    content: 'Приснилось, что я летаю над городом. Ощущение свободы и невесомости. Вид сверху был потрясающим.',
    bodyStateId: 1,
    circumstanceId: 1,
    deadline: null,
    isCompleted: false,
    emotions: [emotionData[0], emotionData[5]], // Радость и Возбуждение
    people: [],
    tags: [{ id: 1, name: 'сон' }, { id: 2, name: 'полет' }],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }),
  new Entry({
    id: '550e8400-e29b-41d4-a716-446655440001',
    userId: 1,
    entryType: 'thought',
    content: 'Думаю о том, как улучшить продуктивность. Возможно, стоит попробовать технику Pomodoro.',
    bodyStateId: 2,
    circumstanceId: 2,
    deadline: null,
    isCompleted: false,
    emotions: [emotionData[3], emotionData[4]], // Спокойствие и Тревога
    people: [],
    tags: [{ id: 3, name: 'продуктивность' }, { id: 4, name: 'работа' }],
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T14:20:00Z'
  }),
  new Entry({
    id: '550e8400-e29b-41d4-a716-446655440002',
    userId: 1,
    entryType: 'plan',
    content: 'Начать изучать новый фреймворк Vue.js до конца месяца. Пройти базовый курс и сделать пет-проект.',
    bodyStateId: 3,
    circumstanceId: 3,
    deadline: '2024-02-15',
    isCompleted: false,
    emotions: [emotionData[0], emotionData[5]], // Радость и Возбуждение
    people: [],
    tags: [{ id: 5, name: 'обучение' }, { id: 6, name: 'программирование' }],
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z'
  }),
  new Entry({
    id: '550e8400-e29b-41d4-a716-446655440003',
    userId: 1,
    entryType: 'memory',
    content: 'Вспомнил как в детстве ходил с отцом на рыбалку. Запах реки и утренний туман.',
    bodyStateId: null,
    circumstanceId: null,
    deadline: null,
    isCompleted: false,
    emotions: [emotionData[0], emotionData[2]], // Радость и Гнев (смешанные чувства)
    people: [{ id: 1, name: 'Отец', category: 'family' }],
    tags: [{ id: 7, name: 'детство' }, { id: 8, name: 'рыбалка' }],
    createdAt: '2024-01-18T19:45:00Z',
    updatedAt: '2024-01-18T19:45:00Z'
  })
];

// Моковые данные для состояний тела
export const mockBodyStates = [
  new BodyState({
    id: 1,
    user_id: 1,
    timestamp: '2024-01-15T10:30:00Z',
    location_point: null,
    location_name: 'Дом',
    location_address: 'ул. Ленина, 123',
    location_precision: 'approximate',
    health_points: 85,
    energy_points: 75,
    circumstance_id: 1,
    created_at: '2024-01-15T10:30:00Z'
  }),
  new BodyState({
    id: 2,
    user_id: 1,
    timestamp: '2024-01-16T14:20:00Z',
    location_point: null,
    location_name: 'Офис',
    location_address: 'ул. Рабочая, 45',
    location_precision: 'exact',
    health_points: 70,
    energy_points: 60,
    circumstance_id: 2,
    created_at: '2024-01-16T14:20:00Z'
  }),
  new BodyState({
    id: 3,
    user_id: 1,
    timestamp: '2024-01-17T09:15:00Z',
    location_point: null,
    location_name: 'Кафе',
    location_address: 'ул. Центральная, 10',
    location_precision: 'approximate',
    health_points: 90,
    energy_points: 80,
    circumstance_id: 3,
    created_at: '2024-01-17T09:15:00Z'
  })
];

// Моковые данные для обстоятельств
export const mockCircumstances = [
  new Circumstance({
    id: 1,
    user_id: 1,
    timestamp: '2024-01-15T10:30:00Z',
    weather: 'солнечно',
    temperature: 25,
    moon_phase: null,
    global_event: null,
    notes: 'Утро, кофе свежесваренный, птицы поют за окном',
    created_at: '2024-01-15T10:30:00Z'
  }),
  new Circumstance({
    id: 2,
    user_id: 1,
    timestamp: '2024-01-16T14:20:00Z',
    weather: 'пасмурно',
    temperature: 18,
    moon_phase: null,
    global_event: null,
    notes: 'После обеда, немного устал от встреч',
    created_at: '2024-01-16T14:20:00Z'
  }),
  new Circumstance({
    id: 3,
    user_id: 1,
    timestamp: '2024-01-17T09:15:00Z',
    weather: 'ясно',
    temperature: 22,
    moon_phase: 'растущая луна',
    global_event: null,
    notes: 'Утро перед работой, приятная атмосфера в кафе',
    created_at: '2024-01-17T09:15:00Z'
  })
];

// Моковые данные для эмоций (только классы Emotion)
export const mockEmotions = emotionData.map(e => new Emotion({
  id: e.id,
  name_en: e.name_en,
  name_ru: e.name_ru,
  category: e.category,
  description: null
}));

// Моковые данные для навыков (RPG)
export const mockSkills = [
  new Skill({
    id: 1,
    user_id: 1,
    name: 'React Development',
    category: 'programming',
    description: 'Разработка на React и экосистеме',
    current_level: 7,
    experience_points: 350,
    icon: 'react',
    color: '#61DAFB',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Skill({
    id: 2,
    user_id: 1,
    name: 'TypeScript',
    category: 'programming',
    description: 'Типизированный JavaScript для масштабируемых приложений',
    current_level: 5,
    experience_points: 250,
    icon: 'typescript',
    color: '#3178C6',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Skill({
    id: 3,
    user_id: 1,
    name: 'Communication',
    category: 'soft',
    description: 'Навыки эффективного общения и презентаций',
    current_level: 6,
    experience_points: 300,
    icon: 'chat',
    color: '#4CAF50',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Skill({
    id: 4,
    user_id: 1,
    name: 'Time Management',
    category: 'soft',
    description: 'Управление временем и планирование задач',
    current_level: 4,
    experience_points: 180,
    icon: 'clock',
    color: '#FF9800',
    created_at: '2024-01-01T00:00:00Z'
  })
];

// Моковые данные для людей
export const mockPeople = [
  new Person({
    id: 1,
    user_id: 1,
    name: 'Иван Иванов',
    category: 'friends',
    relationship: 'друг',
    bio: 'Знаком со школы, занимается IT',
    birth_date: '1992-03-15',
    notes: 'Любит видеоигры и походы',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Person({
    id: 2,
    user_id: 1,
    name: 'Мария Петрова',
    category: 'family',
    relationship: 'сестра',
    bio: 'Младшая сестра, учится в университете',
    birth_date: '1995-05-15',
    notes: 'Изучает психологию',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Person({
    id: 3,
    user_id: 1,
    name: 'Алексей Смирнов',
    category: 'colleagues',
    relationship: 'коллега',
    bio: 'Работаем вместе над проектом',
    birth_date: null,
    notes: 'Ответственный и пунктуальный',
    created_at: '2024-01-10T00:00:00Z'
  })
];

// Моковые данные для тегов
export const mockTags = [
  new Tag({
    id: 1,
    user_id: 1,
    name: 'сон',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Tag({
    id: 2,
    user_id: 1,
    name: 'полет',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Tag({
    id: 3,
    user_id: 1,
    name: 'продуктивность',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Tag({
    id: 4,
    user_id: 1,
    name: 'работа',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Tag({
    id: 5,
    user_id: 1,
    name: 'обучение',
    created_at: '2024-01-01T00:00:00Z'
  }),
  new Tag({
    id: 6,
    user_id: 1,
    name: 'программирование',
    created_at: '2024-01-01T00:00:00Z'
  })
];

// Моковые данные для аналитики
export const mockAnalytics = {
  totalEntries: 4,
  entriesByType: {
    dream: 1,
    memory: 1,
    thought: 1,
    plan: 1
  },
  emotionsDistribution: [
    { emotion: 'Радость', count: 3, percentage: 37.5 },
    { emotion: 'Возбуждение', count: 2, percentage: 25 },
    { emotion: 'Спокойствие', count: 1, percentage: 12.5 },
    { emotion: 'Тревога', count: 1, percentage: 12.5 },
    { emotion: 'Гнев', count: 1, percentage: 12.5 }
  ],
  skillProgress: [
    { skill: 'React Development', progress: 70, xp: 350 },
    { skill: 'TypeScript', progress: 50, xp: 250 },
    { skill: 'Communication', progress: 60, xp: 300 },
    { skill: 'Time Management', progress: 40, xp: 180 }
  ]
};

// Экспорт всех моков
export default {
  mockEntries,
  mockBodyStates,
  mockCircumstances,
  mockEmotions,
  mockSkills,
  mockPeople,
  mockTags,
  mockAnalytics
};