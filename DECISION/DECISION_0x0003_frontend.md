COMPONENTS_DOC.md — Техническая документация UI компонентов
Версия: 0x0001
Дата: December 17, 2025
Статус: DRAFT

Оглавление

Архитектура компонентов
Структура папок
Типы компонентов
Naming conventions
Стандарты кода
Common компоненты
Entries компоненты
Relations компоненты
Emotions компоненты
People компоненты
Filters компоненты
Layouts
Custom Hooks
Styling подход
Props validation


Архитектура компонентов
Принципы

Atomic Design — компоненты делятся на уровни:

Atoms — кнопки, инпуты, иконки
Molecules — карточки, формы
Organisms — списки, графы, сложные блоки
Templates — layouts
Pages — готовые страницы


Презентационные vs Контейнерные:

Презентационные — только отображение (props → JSX)
Контейнерные — логика + данные (hooks → презентационный компонент)


Single Responsibility — один компонент = одна задача
Composition over Inheritance — собираем из мелких компонентов


Структура папок
ui/
├── components/
│   ├── common/           # Базовые компоненты
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   ├── Button.stories.jsx (опционально)
│   │   │   └── index.js
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── Loader/
│   │   └── ErrorBoundary/
│   │
│   ├── entries/          # Компоненты для записей
│   │   ├── EntryCard/
│   │   ├── EntryForm/
│   │   ├── EntryList/
│   │   └── EntryDetail/
│   │
│   ├── relations/        # Связи между записями
│   │   ├── RelationModal/
│   │   ├── RelationsList/
│   │   └── RelationGraph/
│   │
│   ├── emotions/         # Эмоции
│   │   ├── EmotionPicker/
│   │   └── EmotionChart/
│   │
│   ├── people/           # Люди
│   │   ├── PersonCard/
│   │   ├── PersonForm/
│   │   └── PersonList/
│   │
│   └── filters/          # Фильтры
│       ├── TypeFilter/
│       ├── DateFilter/
│       ├── EmotionFilter/
│       └── SearchBar/
│
├── pages/                # Страницы
│   ├── auth/
│   ├── entries/
│   ├── analytics/
│   └── settings/
│
├── layouts/              # Layouts
│   ├── MainLayout.jsx
│   ├── AuthLayout.jsx
│   └── TelegramLayout.jsx
│
└── hooks/                # Custom hooks
    ├── useAuth.js
    ├── useEntries.js
    ├── useRelations.js
    └── useSanitizer.js

Типы компонентов
1. Презентационный компонент
jsx// Только props → JSX, без логики
function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
2. Контейнерный компонент
jsx// Логика + данные → презентационный компонент
function EntryListContainer() {
  const { entries, loading } = useEntries();
  
  if (loading) return <Loader />;
  
  return <EntryList entries={entries} />;
}
3. Compound компонент
jsx// Родительский + дочерние компоненты работают вместе
function Modal({ children, isOpen, onClose }) {
  return isOpen ? (
    <div className="modal">
      {children}
    </div>
  ) : null;
}

Modal.Header = function({ children }) { ... }
Modal.Body = function({ children }) { ... }
Modal.Footer = function({ children }) { ... }

// Использование:
<Modal isOpen={true}>
  <Modal.Header>Заголовок</Modal.Header>
  <Modal.Body>Контент</Modal.Body>
  <Modal.Footer>Кнопки</Modal.Footer>
</Modal>

Naming conventions
Компоненты

PascalCase для имен компонентов: EntryCard, EmotionPicker
Существительное или Существительное + Действие: Button, DateFilter, SubmitButton

Props

camelCase: onClick, isLoading, entryData
Булевы props начинаются с is/has/should: isOpen, hasError, shouldValidate
Коллбэки начинаются с on: onClick, onSubmit, onChange

CSS Modules

kebab-case для классов: .entry-card, .emotion-badge
BEM для модификаторов: .button--primary, .card--highlighted

Файлы

PascalCase для компонентов: EntryCard.jsx
camelCase для утилит: dateUtils.js, apiClient.js
SCREAMING_SNAKE_CASE для констант: API_BASE_URL, ENTRY_TYPES


Стандарты кода
Обязательные правила

PropTypes или TypeScript — валидация props
Default props — всегда для опциональных props
Error boundaries — оборачиваем критичные блоки
Loading states — показываем индикаторы загрузки
Empty states — обрабатываем пустые списки
Accessibility — semantic HTML + ARIA атрибуты

Шаблон компонента
jsximport React from 'react';
import PropTypes from 'prop-types';
import styles from './ComponentName.module.css';

/**
 * Краткое описание компонента
 * 
 * @param {Object} props - Props компонента
 * @param {string} props.title - Заголовок
 * @param {Function} props.onClick - Обработчик клика
 */
function ComponentName({ title, onClick, children }) {
  // 1. Hooks
  const [state, setState] = React.useState(null);
  
  // 2. Effects
  React.useEffect(() => {
    // side effects
  }, []);
  
  // 3. Handlers
  const handleClick = () => {
    onClick?.();
  };
  
  // 4. Render helpers
  const renderContent = () => {
    return <div>{children}</div>;
  };
  
  // 5. Main render
  return (
    <div className={styles.component}>
      <h2>{title}</h2>
      {renderContent()}
    </div>
  );
}

// PropTypes
ComponentName.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node
};

// Default props
ComponentName.defaultProps = {
  onClick: null,
  children: null
};

export default ComponentName;

Common компоненты
Button
Путь: ui/components/common/Button/Button.jsx
Назначение: Универсальная кнопка
Props:
javascript{
  children: node,        // Контент кнопки
  onClick: func,         // Обработчик клика
  variant: string,       // 'primary' | 'secondary' | 'danger' | 'ghost'
  size: string,          // 'small' | 'medium' | 'large'
  disabled: bool,        // Отключена ли кнопка
  loading: bool,         // Показывать ли loader
  icon: node,            // Иконка (опционально)
  fullWidth: bool        // На всю ширину
}
Использование:
jsx<Button 
  variant="primary" 
  size="medium"
  onClick={handleSubmit}
  loading={isLoading}
>
  Сохранить
</Button>

Input
Путь: ui/components/common/Input/Input.jsx
Назначение: Текстовое поле с валидацией
Props:
javascript{
  value: string,
  onChange: func,
  type: string,          // 'text' | 'password' | 'email' | 'number'
  placeholder: string,
  label: string,         // Метка над полем
  error: string,         // Сообщение об ошибке
  disabled: bool,
  required: bool,
  icon: node,            // Иконка слева
  maxLength: number
}
Использование:
jsx<Input
  label="Логин"
  value={login}
  onChange={(e) => setLogin(e.target.value)}
  placeholder="Введите логин"
  error={errors.login}
  required
/>

Modal
Путь: ui/components/common/Modal/Modal.jsx
Назначение: Модальное окно
Props:
javascript{
  isOpen: bool,
  onClose: func,
  title: string,
  children: node,
  size: string,          // 'small' | 'medium' | 'large' | 'fullscreen'
  closeOnOverlay: bool,  // Закрывать при клике на overlay
  showCloseButton: bool
}
Использование:
jsx<Modal
  isOpen={isModalOpen}
  onClose={() => setModalOpen(false)}
  title="Создать запись"
  size="medium"
>
  <EntryForm onSubmit={handleSubmit} />
</Modal>

Loader
Путь: ui/components/common/Loader/Loader.jsx
Назначение: Индикатор загрузки
Props:
javascript{
  size: string,          // 'small' | 'medium' | 'large'
  text: string,          // Текст под loader
  fullscreen: bool       // На весь экран
}
Использование:
jsx{loading && <Loader size="medium" text="Загрузка..." />}

ErrorBoundary
Путь: ui/components/common/ErrorBoundary/ErrorBoundary.jsx
Назначение: Обработка ошибок рендеринга
Props:
javascript{
  children: node,
  fallback: node         // Что показать при ошибке
}
Использование:
jsx<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

Entries компоненты
EntryCard
Путь: ui/components/entries/EntryCard/EntryCard.jsx
Назначение: Карточка записи (для списков)
Props:
javascript{
  entry: object,         // Entry entity
  onClick: func,         // Обработчик клика
  onDelete: func,        // Обработчик удаления
  onEdit: func,          // Обработчик редактирования
  compact: bool          // Компактный вид
}
Структура:
jsx<div className="entry-card">
  <div className="entry-card-header">
    <span className="entry-icon">{icon}</span>
    <span className="entry-type">{type}</span>
    <span className="entry-date">{date}</span>
  </div>
  
  <div className="entry-card-content">
    <p>{content}</p>
  </div>
  
  <div className="entry-card-footer">
    <div className="emotions">{emotions}</div>
    <div className="relations-count">{relationsCount}</div>
  </div>
</div>

EntryForm
Путь: ui/components/entries/EntryForm/EntryForm.jsx
Назначение: Форма создания/редактирования записи
Props:
javascript{
  entry: object,         // Entry для редактирования (null для создания)
  onSubmit: func,        // Обработчик отправки
  onCancel: func,        // Обработчик отмены
  loading: bool
}
Поля формы:

Тип записи (dream/memory/thought/plan)
Контент (textarea с автоматической санитизацией)
Дата события (для memory/dream)
Дедлайн (для plan)
Эмоции (EmotionPicker)
Люди (PersonPicker)
Теги (TagInput)

Структура:
jsx<form onSubmit={handleSubmit}>
  <TypeSelector value={type} onChange={setType} />
  <Textarea value={content} onChange={setContent} />
  {type === 'plan' && <DatePicker label="Дедлайн" />}
  <EmotionPicker selected={emotions} onChange={setEmotions} />
  <PersonPicker selected={people} onChange={setPeople} />
  <TagInput tags={tags} onChange={setTags} />
  
  <div className="form-actions">
    <Button variant="secondary" onClick={onCancel}>
      Отмена
    </Button>
    <Button variant="primary" type="submit" loading={loading}>
      Сохранить
    </Button>
  </div>
</form>

EntryList
Путь: ui/components/entries/EntryList/EntryList.jsx
Назначение: Список записей
Props:
javascript{
  entries: array,        // Массив Entry
  loading: bool,
  onEntryClick: func,
  onEntryDelete: func,
  emptyState: node,      // Что показать если список пуст
  groupBy: string        // 'date' | 'type' | null
}
Возможности:

Группировка по дате/типу
Виртуализация для больших списков (react-window)
Infinite scroll
Empty state


EntryDetail
Путь: ui/components/entries/EntryDetail/EntryDetail.jsx
Назначение: Детальный просмотр записи
Props:
javascript{
  entry: object,         // Entry entity со всеми связями
  onEdit: func,
  onDelete: func,
  onCreateRelation: func
}
Секции:

Шапка (тип, дата, кнопки действий)
Контент
Эмоции
Люди
Теги
Связи (incoming + outgoing)


Relations компоненты
RelationModal
Путь: ui/components/relations/RelationModal/RelationModal.jsx
Назначение: Модалка создания связи между записями
Props:
javascript{
  fromEntry: object,     // Исходная запись
  isOpen: bool,
  onClose: func,
  onSubmit: func
}
Поля:

Тип связи (dropdown: led_to, reminded_of, inspired_by, etc.)
Целевая запись (search + select)
Описание связи (textarea)


RelationsList
Путь: ui/components/relations/RelationsList/RelationsList.jsx
Назначение: Список связей записи
Props:
javascript{
  relations: array,      // Массив Relation
  currentEntryId: string,
  onRelationClick: func,
  onRelationDelete: func
}
Группы:

Incoming (входящие связи)
Outgoing (исходящие связи)


RelationGraph
Путь: ui/components/relations/RelationGraph/RelationGraph.jsx
Назначение: 3D граф связей (потом, сейчас просто заглушка)
Props:
javascript{
  entryId: string,       // Центральная запись
  depth: number,         // Глубина обхода (default: 3)
  onNodeClick: func
}
Технологии:

Three.js или D3.js
Force-directed graph


Emotions компоненты
EmotionPicker
Путь: ui/components/emotions/EmotionPicker/EmotionPicker.jsx
Назначение: Выбор эмоций с интенсивностью
Props:
javascript{
  selected: array,       // [{emotion: Emotion, intensity: number}]
  onChange: func,
  maxEmotions: number    // Макс количество эмоций (default: 5)
}
Интерфейс:

Список всех 27 эмоций (группировка по категориям)
Поиск по названию
Слайдер интенсивности (1-10)
Выбранные эмоции показываются сверху


EmotionChart
Путь: ui/components/emotions/EmotionChart/EmotionChart.jsx
Назначение: График эмоций за период (потом)
Props:
javascript{
  emotions: array,       // Данные для графика
  dateRange: object,     // {from: Date, to: Date}
  chartType: string      // 'line' | 'bar' | 'pie'
}

People компоненты
PersonCard
Путь: ui/components/people/PersonCard/PersonCard.jsx
Назначение: Карточка человека
Props:
javascript{
  person: object,        // Person entity
  onClick: func,
  compact: bool
}
Отображение:

Инициалы (если нет фото)
Имя
Категория (родные/друзья/знакомые)
Количество упоминаний


PersonForm
Путь: ui/components/people/PersonForm/PersonForm.jsx
Назначение: Форма создания/редактирования человека
Props:
javascript{
  person: object,        // Person для редактирования
  onSubmit: func,
  onCancel: func
}
Поля:

Имя
Категория
Отношение (кто для тебя)
Дата рождения
Био
Заметки


PersonList
Путь: ui/components/people/PersonList/PersonList.jsx
Назначение: Список людей
Props:
javascript{
  people: array,
  onPersonClick: func,
  groupByCategory: bool
}

Filters компоненты
TypeFilter
Путь: ui/components/filters/TypeFilter/TypeFilter.jsx
Назначение: Фильтр по типу записи
Props:
javascript{
  value: array,          // ['dream', 'thought']
  onChange: func,
  multiple: bool         // Множественный выбор
}

DateFilter
Путь: ui/components/filters/DateFilter/DateFilter.jsx
Назначение: Фильтр по дате
Props:
javascript{
  value: object,         // {from: Date, to: Date}
  onChange: func,
  presets: array         // ['today', 'week', 'month', 'year']
}

EmotionFilter
Путь: ui/components/filters/EmotionFilter/EmotionFilter.jsx
Назначение: Фильтр по эмоциям
Props:
javascript{
  value: array,          // [emotionId1, emotionId2]
  onChange: func,
  emotions: array        // Список всех эмоций
}

SearchBar
Путь: ui/components/filters/SearchBar/SearchBar.jsx
Назначение: Поиск по контенту
Props:
javascript{
  value: string,
  onChange: func,
  onSearch: func,
  placeholder: string,
  debounce: number       // Задержка перед поиском (default: 300ms)
}

Layouts
MainLayout
Путь: ui/layouts/MainLayout.jsx
Назначение: Основной layout (sidebar + content)
Структура:
jsx<div className="main-layout">
  <Sidebar />
  <div className="main-content">
    <Header />
    <main>{children}</main>
  </div>
</div>

AuthLayout
Путь: ui/layouts/AuthLayout.jsx
Назначение: Layout для страниц авторизации
Структура:
jsx<div className="auth-layout">
  <div className="auth-card">
    {children}
  </div>
</div>

TelegramLayout
Путь: ui/layouts/TelegramLayout.jsx
Назначение: Layout для Telegram Mini App
Особенности:

Без sidebar
BackButton от Telegram
MainButton для основных действий


Custom Hooks
useAuth
Путь: ui/hooks/useAuth.js
Назначение: Работа с аутентификацией
Возвращает:
javascript{
  user: object,          // Текущий пользователь
  isAuthenticated: bool,
  loading: bool,
  error: string,
  register: func,
  login: func,
  logout: func,
  recover: func
}

useEntries
Путь: ui/hooks/useEntries.js
Назначение: Работа с записями
Возвращает:
javascript{
  entries: array,
  loading: bool,
  error: string,
  createEntry: func,
  updateEntry: func,
  deleteEntry: func,
  reload: func
}

useRelations
Путь: ui/hooks/useRelations.js
Назначение: Работа со связями
Возвращает:
javascript{
  relations: array,
  loading: bool,
  error: string,
  createRelation: func,
  deleteRelation: func,
  buildGraph: func
}

useSanitizer
Путь: ui/hooks/useSanitizer.js
Назначение: Санитизация контента
Возвращает:
javascript{
  sanitizeText: func,    // Санитизация текста
  sanitizeImage: func    // Санитизация изображений
}
```

---

## Styling подход

### CSS Modules

**Используем:** CSS Modules для изоляции стилей

**Структура:**
```
Button/
├── Button.jsx
├── Button.module.css
└── index.js
Пример:
css/* Button.module.css */
.button {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.button--primary {
  background: #007bff;
  color: white;
}

.button--secondary {
  background: #6c757d;
  color: white;
}

.button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
jsx// Button.jsx
import styles from './Button.module.css';

function Button({ variant, disabled }) {
  const className = `
    ${styles.button} 
    ${styles[`button--${variant}`]} 
    ${disabled ? styles['button--disabled'] : ''}
  `.trim();
  
  return <button className={className}>...</button>;
}

Цветовая палитра
css:root {
  /* Primary */
  --color-primary: #007bff;
  --color-primary-dark: #0056b3;
  --color-primary-light: #66b2ff;
  
  /* Emotions */
  --color-positive: #4CAF50;
  --color-negative: #F44336;
  --color-neutral: #9E9E9E;
  
  /* Entry types */
  --color-dream: #9C27B0;
  --color-memory: #FF9800;
  --color-thought: #2196F3;
  --color-plan: #4CAF50;
  
  /* UI */
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-border: #e0e0e0;
  --color-text: #212121;
  --color-text-secondary: #757575;
  
  /* Status */
  --color-success: #4CAF50;
  --color-error: #F44336;
  --color-warning: #FF9800;
}

Props validation
PropTypes (если не TypeScript)
jsximport PropTypes from 'prop-types';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  fullWidth: PropTypes.bool
};

Button.defaultProps = {
  onClick: undefined,
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  icon: null,
  fullWidth: false
};

Чеклист перед созданием компонента

 Определен тип компонента (презентационный/контейнерный)
 Создана папка с правильной структурой
 Props задокументированы
 PropTypes добавлены
 Default props заданы
 Loading state обработан
 Error state обработан
 Empty state обработан (для списков)
 Accessibility проверен (ARIA, semantic HTML)
 CSS Module создан
 index.js экспорт добавлен


Следующие шаги
Phase 1: Common компоненты

 Button
 Input
 Modal
 Loader
 ErrorBoundary

Phase 2: Entries компоненты

 EntryCard
 EntryForm
 EntryList
 EntryDetail

Phase 3: Остальные компоненты

 Relations
 Emotions
 People
 Filters

Phase 4: Layouts + Pages

 MainLayout
 AuthLayout
 TimelinePage
 LoginPage


Changelog
0x0001 (2025-12-17)

Создана техническая документация по компонентам
Определены naming conventions
Описаны все основные компоненты
Определены props и структура каждого компонента
Создан styling подход