# DECISION_0x0004.md — Полная архитектура Frontend (ООП + React)

**Версия:** 0x0002  
**Дата:** November 21, 2025  
**Статус:** ПРИНЯТО  

---

```
src/ф
├── core/           # Бизнес-логика
├── adapters/       # web/telegram
├── store/          # Zustand
├── ui/             # React компоненты
├── security/       # Санитайзеры
├── platforms/      # Входные точки
└── config/         # Настройки
```

## Оглавление

2. [Структура проекта](#структура-проекта)
3. [Слой 1: Core (бизнес-логика)](#слой-1-core-бизнес-логика)
4. [Слой 2: Adapters (платформы)](#слой-2-adapters-платформы)
5. [Слой 3: UI (компоненты)](#слой-3-ui-компоненты)
6. [Слой 4: State Management (Store)](#слой-4-state-management-store)
7. [Паттерны проектирования](#паттерны-проектирования)
8. [Интеграция с Security](#интеграция-с-security)
9. [Примеры реализации](#примеры-реализации)

---

## Структура проекта

```
/
├── core/                           # Бизнес-логика (платформо-независимая)
│   ├── entities/                   # Модели данных
│   │   ├── base/
│   │   │   └── BaseEntity.js       # Базовый класс для всех entity
│   │   ├── Entry.js                # Запись (сон/мысль/воспоминание/план)
│   │   ├── Emotion.js              # Эмоция
│   │   ├── Person.js               # Человек
│   │   ├── Relation.js             # Связь между записями
│   │   ├── RelationType.js         # Тип связи
│   │   ├── User.js                 # Пользователь
│   │   └── Tag.js                  # Тег
│   │
│   ├── repositories/               # Работа с API
│   │   ├── base/
│   │   │   └── BaseRepository.js   # Базовый класс для репозиториев
│   │   ├── AuthRepository.js       # Аутентификация
│   │   ├── EntriesRepository.js    # CRUD записей
│   │   ├── RelationsRepository.js  # Связи
│   │   ├── EmotionsRepository.js   # Эмоции
│   │   ├── PeopleRepository.js     # Люди
│   │   └── TagsRepository.js       # Теги
│   │
│   ├── services/                   # Бизнес-логика
│   │   ├── AuthService.js          # Логика аутентификации
│   │   ├── EntryService.js         # Логика работы с записями
│   │   ├── GraphService.js         # Логика графа связей
│   │   ├── AnalyticsService.js     # Статистика
│   │   ├── SyncService.js          # Синхронизация данных
│   │   └── ValidationService.js    # Валидация данных
│   │
│   ├── commands/                   # Сложные операции (Command Pattern)
│   │   ├── base/
│   │   │   └── BaseCommand.js
│   │   ├── CreateEntryCommand.js          # Создать запись
│   │   ├── UpdateEntryCommand.js          # Обновить запись
│   │   ├── CreateRelationCommand.js       # Создать связь
│   │   ├── DeleteEntryWithRelationsCommand.js
│   │   └── BulkCreateEntriesCommand.js
│   │
│   ├── strategies/                 # Стратегии (Strategy Pattern)
│   │   ├── FilterStrategy.js       # Базовая стратегия фильтрации
│   │   ├── DateFilterStrategy.js   # Фильтр по дате
│   │   ├── TypeFilterStrategy.js   # Фильтр по типу записи
│   │   ├── EmotionFilterStrategy.js
│   │   └── SearchStrategy.js       # Поиск по тексту
│   │
│   ├── observers/                  # Observers (Observer Pattern)
│   │   ├── base/
│   │   │   └── Observer.js
│   │   ├── EntryObserver.js        # Следит за изменениями записей
│   │   ├── RelationObserver.js     # Следит за связями
│   │   └── SyncObserver.js         # Следит за синхронизацией
│   │
│   └── utils/                      # Утилиты
│       ├── DateUtils.js
│       ├── TextUtils.js
│       └── ValidationUtils.js
│
├── adapters/                       # Платформо-зависимый код
│   ├── base/
│   │   ├── StorageAdapter.js       # Интерфейс хранилища
│   │   ├── NavigationAdapter.js    # Интерфейс навигации
│   │   └── PlatformAdapter.js      # Интерфейс платформы
│   │
│   ├── web/
│   │   ├── WebStorageAdapter.js    # sessionStorage/localStorage
│   │   ├── WebNavigationAdapter.js # React Router
│   │   ├── WebAuthAdapter.js       # JWT для web
│   │   └── WebPlatformAdapter.js   # Web-специфичные фичи
│   │
│   └── telegram/
│       ├── TelegramStorageAdapter.js    # localStorage в WebView
│       ├── TelegramNavigationAdapter.js # BackButton, MainButton
│       ├── TelegramAuthAdapter.js       # JWT (без initData)
│       └── TelegramPlatformAdapter.js   # Telegram API интеграция
│
├── store/                          # State Management
│   ├── GlobalStore.js              # Главный store (координатор)
│   ├── stores/                     # Мини-сторы
│   │   ├── AuthStore.js            # Состояние аутентификации
│   │   ├── EntriesStore.js         # Записи
│   │   ├── RelationsStore.js       # Связи
│   │   ├── EmotionsStore.js        # Эмоции
│   │   ├── PeopleStore.js          # Люди
│   │   ├── TagsStore.js            # Теги
│   │   ├── UIStore.js              # UI состояние (модалки, загрузка)
│   │   └── FiltersStore.js         # Фильтры и поиск
│   │
│   └── middleware/                 # Middleware для store
│       ├── LoggerMiddleware.js
│       └── PersistenceMiddleware.js
│
├── ui/                             # React компоненты
│   ├── components/                 # Переиспользуемые компоненты
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Loader/
│   │   │   └── ErrorBoundary/
│   │   │
│   │   ├── entries/
│   │   │   ├── EntryCard/          # Карточка записи
│   │   │   ├── EntryForm/          # Форма создания/редактирования
│   │   │   ├── EntryList/          # Список записей
│   │   │   └── EntryDetail/        # Детальный просмотр
│   │   │
│   │   ├── relations/
│   │   │   ├── RelationModal/      # Модалка создания связи
│   │   │   ├── RelationsList/      # Список связей записи
│   │   │   └── RelationGraph/      # Граф связей (3D)
│   │   │
│   │   ├── emotions/
│   │   │   ├── EmotionPicker/      # Выбор эмоций
│   │   │   └── EmotionChart/       # График эмоций
│   │   │
│   │   ├── people/
│   │   │   ├── PersonCard/
│   │   │   ├── PersonForm/
│   │   │   └── PersonList/
│   │   │
│   │   └── filters/
│   │       ├── TypeFilter/
│   │       ├── DateFilter/
│   │       ├── EmotionFilter/
│   │       └── SearchBar/
│   │
│   ├── pages/                      # Страницы
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── RecoverPage.jsx
│   │   ├── entries/
│   │   │   ├── TimelinePage.jsx    # Лента записей
│   │   │   ├── GraphPage.jsx       # Граф связей
│   │   │   └── CreateEntryPage.jsx
│   │   ├── analytics/
│   │   │   └── AnalyticsPage.jsx   # Статистика
│   │   └── settings/
│   │       └── SettingsPage.jsx
│   │
│   ├── layouts/                    # Layouts
│   │   ├── MainLayout.jsx          # Основной layout
│   │   ├── AuthLayout.jsx          # Layout для auth страниц
│   │   └── TelegramLayout.jsx      # Layout для Telegram
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.js              # Хук аутентификации
│   │   ├── useEntries.js           # Хук для работы с записями
│   │   ├── useRelations.js         # Хук для связей
│   │   ├── useFilters.js           # Хук для фильтров
│   │   ├── usePlatform.js          # Определение платформы
│   │   └── useSanitizer.js         # Хук для санитизации
│   │
│   └── factories/                  # Фабрики компонентов
│       ├── ComponentFactory.js     # Главная фабрика
│       ├── ButtonFactory.js        # Фабрика кнопок (web/telegram)
│       └── NavigationFactory.js    # Фабрика навигации
│
├── security/                       # Безопасность (из 0x0002)
│   ├── sanitizers/
│   ├── pipelines/
│   └── hashing/
│
├── platforms/                      # Точки входа
│   ├── web/
│   │   ├── main.jsx                # Входная точка web
│   │   ├── App.jsx                 # Главный компонент web
│   │   └── router.jsx              # React Router
│   │
│   └── telegram/
│       ├── main.jsx                # Входная точка telegram
│       ├── App.jsx                 # Главный компонент telegram
│       └── telegramRouter.jsx      # Telegram навигация
│
├── config/                         # Конфигурация
│   ├── api.config.js               # API endpoints
│   ├── platform.config.js          # Настройки платформ
│   └── constants.js                # Константы
│
└── shared/                         # Общие утилиты
    ├── constants/
    │   ├── entryTypes.js
    │   ├── emotionCategories.js
    │   └── relationTypes.js
    ├── utils/
    │   ├── apiClient.js            # HTTP клиент (axios wrapper)
    │   └── errorHandler.js
    └── types/                      # JSDoc типы
        └── types.js
```

---

## Слой 1: Core (бизнес-логика)

### 1.1 Entities (модели данных)

#### BaseEntity — базовый класс

```javascript
// core/entities/base/BaseEntity.js

class BaseEntity {
  constructor(data = {}) {
    this.id = data.id || null;
    this.createdAt = data.created_at ? new Date(data.created_at) : null;
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
  }
  
  /**
   * Валидация entity
   * @returns {boolean}
   */
  validate() {
    throw new Error('validate() must be implemented in subclass');
  }
  
  /**
   * Сериализация для API
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString()
    };
  }
  
  /**
   * Клонирование entity
   * @returns {BaseEntity}
   */
  clone() {
    return new this.constructor(this.toJSON());
  }
  
  /**
   * Проверка, сохранена ли entity в БД
   * @returns {boolean}
   */
  isPersisted() {
    return this.id !== null;
  }
}

export default BaseEntity;
```

---

#### Entry — запись (сон/мысль/воспоминание/план)

```javascript
// core/entities/Entry.js

import BaseEntity from './base/BaseEntity.js';

class Entry extends BaseEntity {
  static TYPES = {
    DREAM: 'dream',
    MEMORY: 'memory',
    THOUGHT: 'thought',
    PLAN: 'plan'
  };
  
  constructor(data = {}) {
    super(data);
    
    this.userId = data.user_id || null;
    this.type = data.entry_type || Entry.TYPES.THOUGHT;
    this.content = data.content || '';
    this.eventDate = data.event_date ? new Date(data.event_date) : null;
    this.deadline = data.deadline ? new Date(data.deadline) : null;
    this.isCompleted = data.is_completed || false;
    
    // Связанные данные (заполняются отдельно)
    this.emotions = []; // Array<{emotion: Emotion, intensity: number}>
    this.people = [];   // Array<{person: Person, role: string}>
    this.tags = [];     // Array<Tag>
    this.relations = {
      incoming: [],     // Array<Relation>
      outgoing: []      // Array<Relation>
    };
  }
  
  validate() {
    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    
    if (!Object.values(Entry.TYPES).includes(this.type)) {
      throw new Error(`Invalid entry type: ${this.type}`);
    }
    
    if (this.type === Entry.TYPES.PLAN && !this.deadline) {
      throw new Error('Plan must have a deadline');
    }
    
    return true;
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      user_id: this.userId,
      entry_type: this.type,
      content: this.content,
      event_date: this.eventDate?.toISOString(),
      deadline: this.deadline?.toISOString(),
      is_completed: this.isCompleted
    };
  }
  
  /**
   * Добавить эмоцию
   */
  addEmotion(emotion, intensity) {
    this.emotions.push({ emotion, intensity });
  }
  
  /**
   * Добавить человека
   */
  addPerson(person, role = 'mentioned') {
    this.people.push({ person, role });
  }
  
  /**
   * Добавить тег
   */
  addTag(tag) {
    if (!this.tags.find(t => t.id === tag.id)) {
      this.tags.push(tag);
    }
  }
  
  /**
   * Получить связи для записи
   */
  async getForEntry(entryId) {
    const data = await this.get(`/api/entries/${entryId}/relations`);
    return {
      incoming: data.incoming.map(item => new Relation(item)),
      outgoing: data.outgoing.map(item => new Relation(item))
    };
  }
  
  /**
   * Создать связь
   */
  async create(fromEntryId, toEntryId, relationTypeId, description = '') {
    const data = await this.post('/api/relations', {
      from_entry_id: fromEntryId,
      to_entry_id: toEntryId,
      relation_type_id: relationTypeId,
      description
    });
    return new Relation(data);
  }
  
  /**
   * Удалить связь
   */
  async delete(relationId) {
    return await this.delete(`/api/relations/${relationId}`);
  }
  
  /**
   * Получить цепочку связей (граф)
   */
  async getChain(entryId, depth = 5) {
    const data = await this.get(`/api/entries/${entryId}/chain`, { depth });
    return data.chain.map(item => new Entry(item));
  }
  
  /**
   * Получить типы связей
   */
  async getRelationTypes() {
    return await this.get('/api/relation-types');
  }
}

export default RelationsRepository;
```

---

### 1.3 Services (бизнес-логика)

#### AuthService

```javascript
// core/services/AuthService.js

import User from '../entities/User.js';

class AuthService {
  constructor(authRepository, authAdapter) {
    this.repository = authRepository;
    this.adapter = authAdapter;
    this.currentUser = null;
  }
  
  /**
   * Регистрация
   */
  async register(login, password) {
    // Валидация
    this.validateLogin(login);
    this.validatePassword(password);
    
    // Запрос к API
    const response = await this.repository.register(login, password);
    
    // Сохраняем токен
    this.adapter.saveToken(response.token);
    
    // Сохраняем пользователя
    this.currentUser = new User(response.user);
    
    return {
      user: this.currentUser,
      backupCode: response.backup_code
    };
  }
  
  /**
   * Вход
   */
  async login(login, password) {
    const response = await this.repository.login(login, password);
    
    this.adapter.saveToken(response.token);
    this.currentUser = new User(response.user);
    
    return this.currentUser;
  }
  
  /**
   * Восстановление пароля
   */
  async recover(login, backupCode, newPassword) {
    this.validatePassword(newPassword);
    
    const response = await this.repository.recover(login, backupCode, newPassword);
    
    this.adapter.saveToken(response.token);
    
    return {
      user: new User(response.user),
      backupCode: response.backup_code // новый backup-код
    };
  }
  
  /**
   * Выход
   */
  logout() {
    this.adapter.clearToken();
    this.currentUser = null;
  }
  
  /**
   * Проверка авторизации
   */
  isAuthenticated() {
    return this.adapter.hasToken();
  }
  
  /**
   * Получить текущего пользователя
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Валидация login
   */
  validateLogin(login) {
    if (!login || login.length < 3) {
      throw new Error('Login must be at least 3 characters');
    }
    
    if (login.length > 50) {
      throw new Error('Login must be less than 50 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(login)) {
      throw new Error('Login can only contain letters, numbers, underscore and dash');
    }
  }
  
  /**
   * Валидация password
   */
  validatePassword(password) {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (password.length > 128) {
      throw new Error('Password is too long');
    }
    
    // Проверка силы пароля
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (!hasUpper || !hasLower || !hasNumber) {
      throw new Error('Password must contain uppercase, lowercase and numbers');
    }
  }
}

export default AuthService;
```

---

#### EntryService

```javascript
// core/services/EntryService.js

import Entry from '../entities/Entry.js';

class EntryService {
  constructor(entriesRepository, relationsRepository, emotionsRepository, peopleRepository) {
    this.entriesRepo = entriesRepository;
    this.relationsRepo = relationsRepository;
    this.emotionsRepo = emotionsRepository;
    this.peopleRepo = peopleRepository;
  }
  
  /**
   * Создать запись со всеми связями
   */
  async createEntry(entryData, emotions = [], people = [], tags = []) {
    // 1. Создаем запись
    const entry = new Entry(entryData);
    entry.validate();
    
    const createdEntry = await this.entriesRepo.create(entry);
    
    // 2. Добавляем эмоции
    if (emotions.length > 0) {
      await this.emotionsRepo.attachToEntry(createdEntry.id, emotions);
    }
    
    // 3. Добавляем людей
    if (people.length > 0) {
      await this.peopleRepo.attachToEntry(createdEntry.id, people);
    }
    
    // 4. Добавляем теги
    if (tags.length > 0) {
      await this.tagsRepo.attachToEntry(createdEntry.id, tags);
    }
    
    // 5. Загружаем полную запись
    return await this.getEntryWithDetails(createdEntry.id);
  }
  
  /**
   * Получить запись со всеми деталями
   */
  async getEntryWithDetails(entryId) {
    const [entry, emotions, people, tags, relations] = await Promise.all([
      this.entriesRepo.getById(entryId),
      this.emotionsRepo.getForEntry(entryId),
      this.peopleRepo.getForEntry(entryId),
      this.tagsRepo.getForEntry(entryId),
      this.relationsRepo.getForEntry(entryId)
    ]);
    
    entry.emotions = emotions;
    entry.people = people;
    entry.tags = tags;
    entry.relations = relations;
    
    return entry;
  }
  
  /**
   * Обновить запись
   */
  async updateEntry(entryId, updates) {
    const entry = await this.entriesRepo.getById(entryId);
    
    Object.assign(entry, updates);
    entry.validate();
    
    return await this.entriesRepo.update(entryId, entry);
  }
  
  /**
   * Удалить запись (со всеми связями)
   */
  async deleteEntry(entryId) {
    // ON DELETE CASCADE в БД удалит все связи автоматически
    return await this.entriesRepo.delete(entryId);
  }
  
  /**
   * Получить статистику по записям
   */
  async getStatistics(userId) {
    const entries = await this.entriesRepo.getAll();
    
    return {
      total: entries.length,
      byType: this.groupByType(entries),
      byMonth: this.groupByMonth(entries),
      completedPlans: entries.filter(e => e.isPlan() && e.isCompleted).length,
      overduePlans: entries.filter(e => e.isOverdue()).length
    };
  }
  
  groupByType(entries) {
    return entries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {});
  }
  
  groupByMonth(entries) {
    return entries.reduce((acc, entry) => {
      const month = entry.createdAt.toISOString().substring(0, 7); // "2025-11"
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
  }
}

export default EntryService;
```

---

#### GraphService

```javascript
// core/services/GraphService.js

class GraphService {
  constructor(relationsRepository) {
    this.relationsRepo = relationsRepository;
  }
  
  /**
   * Построить граф для визуализации
   */
  async buildGraph(entryId, maxDepth = 3) {
    const visited = new Set();
    const nodes = [];
    const edges = [];
    
    await this.traverseGraph(entryId, 0, maxDepth, visited, nodes, edges);
    
    return { nodes, edges };
  }
  
  /**
   * Рекурсивный обход графа
   */
  async traverseGraph(entryId, currentDepth, maxDepth, visited, nodes, edges) {
    if (currentDepth > maxDepth || visited.has(entryId)) {
      return;
    }
    
    visited.add(entryId);
    
    // Загружаем запись
    const entry = await this.entriesRepo.getById(entryId);
    nodes.push({
      id: entry.id,
      type: entry.type,
      content: entry.content.substring(0, 50), // первые 50 символов
      depth: currentDepth
    });
    
    // Загружаем связи
    const relations = await this.relationsRepo.getForEntry(entryId);
    
    // Обрабатываем исходящие связи
    for (const relation of relations.outgoing) {
      edges.push({
        from: relation.fromEntryId,
        to: relation.toEntryId,
        type: relation.relationType.name,
        label: relation.relationType.description
      });
      
      await this.traverseGraph(
        relation.toEntryId,
        currentDepth + 1,
        maxDepth,
        visited,
        nodes,
        edges
      );
    }
    
    // Обрабатываем входящие связи (но не идем дальше)
    for (const relation of relations.incoming) {
      if (!visited.has(relation.fromEntryId)) {
        edges.push({
          from: relation.fromEntryId,
          to: relation.toEntryId,
          type: relation.relationType.name,
          label: relation.relationType.description
        });
      }
    }
  }
  
  /**
   * Найти кратчайший путь между двумя записями
   */
  async findShortestPath(fromId, toId) {
    // BFS алгоритм
    const queue = [{ id: fromId, path: [fromId] }];
    const visited = new Set([fromId]);
    
    while (queue.length > 0) {
      const { id, path } = queue.shift();
      
      if (id === toId) {
        return path;
      }
      
      const relations = await this.relationsRepo.getForEntry(id);
      
      for (const relation of relations.outgoing) {
        if (!visited.has(relation.toEntryId)) {
          visited.add(relation.toEntryId);
          queue.push({
            id: relation.toEntryId,
            path: [...path, relation.toEntryId]
          });
        }
      }
    }
    
    return null; // Путь не найден
  }
  
  /**
   * Найти изолированные записи (без связей)
   */
  async findIsolatedEntries() {
    const allEntries = await this.entriesRepo.getAll();
    const isolated = [];
    
    for (const entry of allEntries) {
      const relations = await this.relationsRepo.getForEntry(entry.id);
      if (relations.incoming.length === 0 && relations.outgoing.length === 0) {
        isolated.push(entry);
      }
    }
    
    return isolated;
  }
}

export default GraphService;
```

---

### 1.4 Commands (сложные операции)

#### CreateEntryCommand

```javascript
// core/commands/CreateEntryCommand.js

import BaseCommand from './base/BaseCommand.js';

class CreateEntryCommand extends BaseCommand {
  constructor(entryService, sanitizerPipeline) {
    super();
    this.entryService = entryService;
    this.sanitizer = sanitizerPipeline;
    this.createdEntry = null;
  }
  
  /**
   * Выполнить команду
   */
  async execute(entryData, emotions = [], people = [], tags = []) {
    // 1. Санитизация контента
    const cleanContent = await this.sanitizer.execute(entryData.content);
    entryData.content = cleanContent;
    
    // 2. Создание записи
    this.createdEntry = await this.entryService.createEntry(
      entryData,
      emotions,
      people,
      tags
    );
    
    this.log(`Created entry ${this.createdEntry.id}`);
    
    return this.createdEntry;
  }
  
  /**
   * Откатить команду
   */
  async undo() {
    if (!this.createdEntry) {
      throw new Error('Nothing to undo');
    }
    
    await this.entryService.deleteEntry(this.createdEntry.id);
    this.log(`Deleted entry ${this.createdEntry.id}`);
    
    this.createdEntry = null;
  }
  
  /**
   * Проверка, можно ли выполнить
   */
  canExecute() {
    return this.entryService !== null;
  }
}

export default CreateEntryCommand;
```

---

#### CreateRelationCommand

```javascript
// core/commands/CreateRelationCommand.js

import BaseCommand from './base/BaseCommand.js';

class CreateRelationCommand extends BaseCommand {
  constructor(relationsRepository, graphService) {
    super();
    this.relationsRepo = relationsRepository;
    this.graphService = graphService;
    this.createdRelation = null;
  }
  
  async execute(fromEntryId, toEntryId, relationTypeId, description = '') {
    // Проверка на циклы (опционально)
    const wouldCreateCycle = await this.checkForCycle(fromEntryId, toEntryId);
    
    if (wouldCreateCycle) {
      this.log('Warning: Creating a cycle', 'warn');
      // Но не запрещаем - циклы допустимы
    }
    
    // Создаем связь
    this.createdRelation = await this.relationsRepo.create(
      fromEntryId,
      toEntryId,
      relationTypeId,
      description
    );
    
    this.log(`Created relation ${this.createdRelation.id}`);
    
    return this.createdRelation;
  }
  
  async undo() {
    if (!this.createdRelation) {
      throw new Error('Nothing to undo');
    }
    
    await this.relationsRepo.delete(this.createdRelation.id);
    this.log(`Deleted relation ${this.createdRelation.id}`);
    
    this.createdRelation = null;
  }
  
  /**
   * Проверка на циклы
   */
  async checkForCycle(fromId, toId) {
    try {
      const path = await this.graphService.findShortestPath(toId, fromId);
      return path !== null;
    } catch {
      return false;
    }
  }
}

export default CreateRelationCommand;
```

---

## Слой 2: Adapters (платформы)

### 2.1 Storage Adapters

#### WebStorageAdapter

```javascript
// adapters/web/WebStorageAdapter.js

class WebStorageAdapter {
  constructor(useSession = true) {
    this.storage = useSession ? sessionStorage : localStorage;
  }
  
  saveToken(token) {
    this.storage.setItem('auth_token', token);
  }
  
  getToken() {
    return this.storage.getItem('auth_token');
  }
  
  hasToken() {
    return this.getToken() !== null;
  }
  
  clearToken() {
    this.storage.removeItem('auth_token');
  }
  
  // Дополнительные методы
  save(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }
  
  get(key) {
    const value = this.storage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  
  remove(key) {
    this.storage.removeItem(key);
  }
  
  clear() {
    this.storage.clear();
  }
}

export default WebStorageAdapter;
```

---

#### TelegramStorageAdapter

```javascript
// adapters/telegram/TelegramStorageAdapter.js

class TelegramStorageAdapter {
  constructor() {
    // Используем localStorage внутри Telegram WebView
    this.storage = localStorage;
  }
  
  saveToken(token) {
    this.storage.setItem('auth_token', token);
  }
  
  getToken() {
    return this.storage.getItem('auth_token');
  }
  
  hasToken() {
    return this.getToken() !== null;
  }
  
  clearToken() {
    this.storage.removeItem('auth_token');
  }
  
  save(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }
  
  get(key) {
    const value = this.storage.getItem(key);
    return value ? JSON.parse(value) : null;
  }
  
  remove(key) {
    this.storage.removeItem(key);
  }
  
  clear() {
    this.storage.clear();
  }
}

export default TelegramStorageAdapter;
```

---

### 2.2 Navigation Adapters

#### WebNavigationAdapter

```javascript
// adapters/web/WebNavigationAdapter.js

class WebNavigationAdapter {
  constructor(router) {
    this.router = router;
  }
  
  navigateTo(path) {
    this.router.push(path);
  }
  
  goBack() {
    this.router.back();
  }
  
  replace(path) {
    this.router.replace(path);
  }
  
  getCurrentPath() {
    return this.router.pathname;
  }
}

export default WebNavigationAdapter;
```

---

#### TelegramNavigationAdapter

```javascript
// adapters/telegram/TelegramNavigationAdapter.js

class TelegramNavigationAdapter {
  constructor() {
    this.telegram = window.Telegram?.WebApp;
    this.history = [];
    
    if (this.telegram) {
      // Настройка кнопки "Назад"
      this.telegram.BackButton.onClick(() => this.goBack());
    }
  }
  
  navigateTo(path) {
    this.history.push(path);
    
    // Показываем кнопку "Назад" если есть история
    if (this.history.length > 1 && this.telegram) {
      this.telegram.BackButton.show();
    }
    
    // Логика навигации (например, через React Router внутри Telegram)
    window.location.hash = path;
  }
  
  goBack() {
    if (this.history.length > 1) {
      this.history.pop();
      const previousPath = this.history[this.history.length - 1];
      window.location.hash = previousPath;
      
      // Скрываем кнопку "Назад" если вернулись на первую страницу
      if (this.history.length === 1 && this.telegram) {
        this.telegram.BackButton.hide();
      }
    } else if (this.telegram) {
      // Закрываем Mini App
      this.telegram.close();
    }
  }
  
  replace(path) {
    if (this.history.length > 0) {
      this.history[this.history.length - 1] = path;
    } else {
      this.history.push(path);
    }
    window.location.hash = path;
  }
  
  getCurrentPath() {
    return window.location.hash.substring(1) || '/';
  }
}

export default TelegramNavigationAdapter;
```

---

## Слой 3: UI (компоненты)

### 3.1 Factories

#### ComponentFactory

```javascript
// ui/factories/ComponentFactory.js

import WebButton from '../components/common/Button/WebButton';
import TelegramButton from '../components/common/Button/TelegramButton';

class ComponentFactory {
  constructor(platform) {
    this.platform = platform; // 'web' | 'telegram'
  }
  
  createButton(props) {
    if (this.platform === 'telegram') {
      return <TelegramButton {...props} />;
    }
    return <WebButton {...props} />;
  }
  
  createModal(props) {
    // Аналогично для модалок
  }
  
  // Можно добавить другие компоненты
}

export default ComponentFactory;
```

---

### 3.2 Custom Hooks

#### useAuth

```javascript
// ui/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { useStore } from './useStore';

export function useAuth() {
  const authStore = useStore(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const register = async (login, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authStore.register(login, password);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (login, password) => {
    setLoading(true);
    setError(null);
    
    try {
      await authStore.login(login, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    authStore.logout();
  };
  
  return {
    user: authStore.currentUser,
    isAuthenticated: authStore.isAuthenticated,
    loading,
    error,
    register,
    login,
    logout
  };
}
```

---

#### useEntries

```javascript
// ui/hooks/useEntries.js

import { useState, useEffect } from 'react';
import { useStore } from './useStore';

export function useEntries(filters = {}) {
  const entriesStore = useStore(state => state.entries);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    loadEntries();
  }, [JSON.stringify(filters)]);
  
  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await entriesStore.loadEntries(filters);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createEntry = async (entryData, emotions, people, tags) => {
    setLoading(true);
    setError(null);
    
    try {
      const entry = await entriesStore.createEntry(entryData, emotions, people, tags);
      return entry;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteEntry = async (entryId) => {
    try {
      await entriesStore.deleteEntry(entryId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  return {
    entries: entriesStore.entries,
    loading,
    error,
    createEntry,
    deleteEntry,
    reload: loadEntries
  };
}
```

---

#### useSanitizer

```javascript
// ui/hooks/useSanitizer.js

import { useCallback } from 'react';
import { createEntryContentPipeline } from '@/security/pipelines/presets/entryContentPreset';
import { createImagePipeline } from '@/security/pipelines/presets/imagePreset';

export function useSanitizer() {
  const sanitizeText = useCallback(async (text) => {
    const pipeline = createEntryContentPipeline();
    return await pipeline.execute(text);
  }, []);
  
  const sanitizeImage = useCallback(async (file) => {
    const pipeline = createImagePipeline();
    return await pipeline.execute(file);
  }, []);
  
  return {
    sanitizeText,
    sanitizeImage
  };
}
```

---

## Слой 4: State Management (Store)

### GlobalStore (Zustand)

```javascript
// store/GlobalStore.js

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Импорт мини-сторов
import createAuthSlice from './stores/AuthStore';
import createEntriesSlice from './stores/EntriesStore';
import createRelationsSlice from './stores/RelationsStore';
import createEmotionsSlice from './stores/EmotionsStore';
import createPeopleSlice from './stores/PeopleStore';
import createUISlice from './stores/UIStore';
import createFiltersSlice from './stores/FiltersStore';

const useGlobalStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Комбинируем все слайсы
        ...createAuthSlice(set, get),
        ...createEntriesSlice(set, get),
        ...createRelationsSlice(set, get),
        ...createEmotionsSlice(set, get),
        ...createPeopleSlice(set, get),
        ...createUISlice(set, get),
        ...createFiltersSlice(set, get)
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          // Сохраняем только нужные части
          filters: state.filters,
          // НЕ сохраняем токен (хранится отдельно через adapter)
        })
      }
    ),
    { name: 'GlobalStore' }
  )
);

export default useGlobalStore;
```

---

### AuthStore

```javascript
// store/stores/AuthStore.js

const createAuthSlice = (set, get) => ({
  auth: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    
    // Инициализация (вызывается при старте приложения)
    initialize: async (authService) => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          set(state => ({
            auth: {
              ...state.auth,
              currentUser: user,
              isAuthenticated: true
            }
          }));
        } catch (error) {
          authService.logout();
        }
      }
    },
    
    // Регистрация
    register: async (authService, login, password) => {
      set(state => ({
        auth: { ...state.auth, loading: true, error: null }
      }));
      
      try {
        const result = await authService.register(login, password);
        
        set(state => ({
          auth: {
            ...state.auth,
            currentUser: result.user,
            isAuthenticated: true,
            loading: false
          }
        }));
        
        return result;
      } catch (error) {
        set(state => ({
          auth: {
            ...state.auth,
            loading: false,
            error: error.message
          }
        }));
        throw error;
      }
    },
    
    // Вход
    login: async (authService, login, password) => {
      set(state => ({
        auth: { ...state.auth, loading: true, error: null }
      }));
      
      try {
        const user = await authService.login(login, password);
        
        set(state => ({
          auth: {
            ...state.auth,
            currentUser: user,
            isAuthenticated: true,
            loading: false
          }
        }));
      } catch (error) {
        set(state => ({
          auth: {
            ...state.auth,
            loading: false,
            error: error.message
          }
        }));
        throw error;
      }
    },
    
    // Выход
    logout: (authService) => {
      authService.logout();
      
      set(state => ({
        auth: {
          ...state.auth,
          currentUser: null,
          isAuthenticated: false
        }
      }));
    }
  }
});

export default createAuthSlice;
```

---

### EntriesStore

```javascript
// store/stores/EntriesStore.js

const createEntriesSlice = (set, get) => ({
  entries: {
    items: [],
    currentEntry: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 0
    },
    
    // Загрузить записи
    loadEntries: async (entryService, filters = {}) => {
      set(state => ({
        entries: { ...state.entries, loading: true, error: null }
      }));
      
      try {
        const result = await entryService.entriesRepo.getPaginated(
          filters.page || 1,
          filters.limit || 50
        );
        
        set(state => ({
          entries: {
            ...state.entries,
            items: result.entries,
            pagination: {
              page: result.page,
              limit: filters.limit || 50,
              total: result.total,
              totalPages: result.totalPages
            },
            loading: false
          }
        }));
      } catch (error) {
        set(state => ({
          entries: {
            ...state.entries,
            loading: false,
            error: error.message
          }
        }));
      }
    },
    
    // Создать запись
    createEntry: async (entryService, entryData, emotions, people, tags) => {
      set(state => ({
        entries: { ...state.entries, loading: true, error: null }
      }));
      
      try {
        const entry = await entryService.createEntry(entryData, emotions, people, tags);
        
        set(state => ({
          entries: {
            ...state.entries,
            items: [entry, ...state.entries.items],
            loading: false
          }
        }));
        
        return entry;
      } catch (error) {
        set(state => ({
          entries: {
            ...state.entries,
            loading: false,
            error: error.message
          }
        }));
        throw error;
      }
    },
    
    // Удалить запись
    deleteEntry: async (entryService, entryId) => {
      try {
        await entryService.deleteEntry(entryId);
        
        set(state => ({
          entries: {
            ...state.entries,
            items: state.entries.items.filter(e => e.id !== entryId)
          }
        }));
      } catch (error) {
        set(state => ({
          entries: {
            ...state.entries,
            error: error.message
          }
        }));
        throw error;
      }
    },
    
    // Установить текущую запись
    setCurrentEntry: async (entryService, entryId) => {
      set(state => ({
        entries: { ...state.entries, loading: true }
      }));
      
      try {
        const entry = await entryService.getEntryWithDetails(entryId);
        
        set(state => ({
          entries: {
            ...state.entries,
            currentEntry: entry,
            loading: false
          }
        }));
      } catch (error) {
        set(state => ({
          entries: {
            ...state.entries,
            loading: false,
            error: error.message
          }
        }));
      }
    }
  }
});

export default createEntriesSlice;
```

---

### RelationsStore

```javascript
// store/stores/RelationsStore.js

const createRelationsSlice = (set, get) => ({
  relations: {
    items: [],
    relationTypes: [],
    graph: { nodes: [], edges: [] },
    loading: false,
    error: null,
    
    // Загрузить типы связей
    loadRelationTypes: async (relationsRepository) => {
      try {
        const types = await relationsRepository.getRelationTypes();
        
        set(state => ({
          relations: {
            ...state.relations,
            relationTypes: types
          }
        }));
      } catch (error) {
        set(state => ({
          relations: {
            ...state.relations,
            error: error.message
          }
        }));
      }
    },
    
    // Загрузить связи для записи
    loadRelationsForEntry: async (relationsRepository, entryId) => {
      set(state => ({
        relations: { ...state.relations, loading: true, error: null }
      }));
      
      try {
        const relations = await relationsRepository.getForEntry(entryId);
        
        set(state => ({
          relations: {
            ...state.relations,
            items: [...relations.incoming, ...relations.outgoing],
            loading: false
          }
        }));
      } catch (error) {
        set(state => ({
          relations: {
            ...state.relations,
            loading: false,
            error: error.message
          }
        }));
      }
    },
    
    // Создать связь
    createRelation: async (relationsRepository, fromId, toId, typeId, description) => {
      try {
        const relation = await relationsRepository.create(fromId, toId, typeId, description);
        
        set(state => ({
          relations: {
            ...state.relations,
            items: [...state.relations.items, relation]
          }
        }));
        
        return relation;
      } catch (error) {
        set(state => ({
          relations: {
            ...state.relations,
            error: error.message
          }
        }));
        throw error;
      }
    },
    
    // Удалить связь
    deleteRelation: async (relationsRepository, relationId) => {
      try {
        await relationsRepository.delete(relationId);
        
        set(state => ({
          relations: {
            ...state.relations,
            items: state.relations.items.filter(r => r.id !== relationId)
          }
        }));
      } catch (error) {
        throw error;
      }
    },
    
    // Построить граф
    buildGraph: async (graphService, entryId, maxDepth = 3) => {
      set(state => ({
        relations: { ...state.relations, loading: true, error: null }
      }));
      
      try {
        const graph = await graphService.buildGraph(entryId, maxDepth);
        
        set(state => ({
          relations: {
            ...state.relations,
            graph,
            loading: false
          }
        }));
      } catch (error) {
        set(state => ({
          relations: {
            ...state.relations,
            loading: false,
            error: error.message
          }
        }));
      }
    }
  }
});

export default createRelationsSlice;
```

---

### UIStore

```javascript
// store/stores/UIStore.js

const createUISlice = (set, get) => ({
  ui: {
    modals: {
      createEntry: false,
      createRelation: false,
      editEntry: false
    },
    sidebarOpen: false,
    theme: 'light',
    
    // Открыть модалку
    openModal: (modalName) => {
      set(state => ({
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [modalName]: true
          }
        }
      }));
    },
    
    // Закрыть модалку
    closeModal: (modalName) => {
      set(state => ({
        ui: {
          ...state.ui,
          modals: {
            ...state.ui.modals,
            [modalName]: false
          }
        }
      }));
    },
    
    // Переключить sidebar
    toggleSidebar: () => {
      set(state => ({
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen
        }
      }));
    },
    
    // Сменить тему
    setTheme: (theme) => {
      set(state => ({
        ui: {
          ...state.ui,
          theme
        }
      }));
    }
  }
});

export default createUISlice;
```

---

## Паттерны проектирования

### 1. Factory Pattern (создание компонентов)

```javascript
// ui/factories/ComponentFactory.js

class ComponentFactory {
  static createButton(platform, props) {
    const buttons = {
      web: WebButton,
      telegram: TelegramButton
    };
    
    const ButtonComponent = buttons[platform] || WebButton;
    return <ButtonComponent {...props} />;
  }
  
  static createNavigation(platform) {
    const navigations = {
      web: WebNavigationAdapter,
      telegram: TelegramNavigationAdapter
    };
    
    const NavigationClass = navigations[platform] || WebNavigationAdapter;
    return new NavigationClass();
  }
}
```

---

### 2. Repository Pattern (доступ к данным)

```javascript
// Вся работа с API через репозитории
const entriesRepo = new EntriesRepository(apiClient);
const entry = await entriesRepo.getById(id);

// UI компоненты НЕ знают про fetch/axios
// Они работают с entities и repositories
```

---

### 3. Adapter Pattern (платформы)

```javascript
// Единый интерфейс для разных платформ
const storage = platform === 'telegram' 
  ? new TelegramStorageAdapter() 
  : new WebStorageAdapter();

storage.saveToken(token); // работает одинаково
```

---

### 4. Observer Pattern (реактивность)

```javascript
// Store автоматически уведомляет компоненты об изменениях
const entries = useStore(state => state.entries.items);

// Когда entries меняется → компонент перерендеривается
```

---

### 5. Command Pattern (сложные операции)

```javascript
// Создание записи с возможностью отката
const command = new CreateEntryCommand(entryService, sanitizer);

try {
  const entry = await command.execute(entryData, emotions, people, tags);
} catch (error) {
  await command.undo(); // откат
}
```

---

### 6. Strategy Pattern (фильтрация)

```javascript
// Разные стратегии фильтрации
const strategies = [
  new DateFilterStrategy({ from: '2025-01-01', to: '2025-12-31' }),
  new TypeFilterStrategy({ types: ['dream', 'thought'] }),
  new EmotionFilterStrategy({ emotions: ['joy', 'sadness'] })
];

const filtered = strategies.reduce(
  (entries, strategy) => strategy.apply(entries),
  allEntries
);
```

---

## Интеграция с Security

### Автоматическая санитизация в формах

```javascript
// ui/components/entries/EntryForm/EntryForm.jsx

import React, { useState } from 'react';
import { useSanitizer } from '@/ui/hooks/useSanitizer';
import { useEntries } from '@/ui/hooks/useEntries';

export default function EntryForm() {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  
  const { sanitizeText, sanitizeImage } = useSanitizer();
  const { createEntry } = useEntries();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Санитизация
      const cleanContent = await sanitizeText(content);
      let cleanImage = null;
      
      if (image) {
        cleanImage = await sanitizeImage(image);
      }
      
      // Создание записи
      const entryData = {
        entry_type: 'thought',
        content: cleanContent
      };
      
      await createEntry(entryData, [], [], []);
      
      // Очистка формы
      setContent('');
      setImage(null);
      
      alert('Запись создана!');
    } catch (error) {
      console.error('Error:', error);
      alert('Ошибка при создании записи');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Опишите свою мысль..."
        rows={5}
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      
      <button type="submit">Создать</button>
    </form>
  );
}
```

---

## Примеры реализации

### Полный пример: Страница Timeline

```javascript
// ui/pages/entries/TimelinePage.jsx

import React, { useEffect, useState } from 'react';
import { useEntries } from '@/ui/hooks/useEntries';
import { useFilters } from '@/ui/hooks/useFilters';
import EntryCard from '@/ui/components/entries/EntryCard/EntryCard';
import TypeFilter from '@/ui/components/filters/TypeFilter/TypeFilter';
import SearchBar from '@/ui/components/filters/SearchBar/SearchBar';
import Loader from '@/ui/components/common/Loader/Loader';

export default function TimelinePage() {
  const { filters, setTypeFilter, setSearchQuery } = useFilters();
  const { entries, loading, error, reload } = useEntries(filters);
  
  useEffect(() => {
    reload();
  }, [filters]);
  
  if (loading) {
    return <Loader />;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="timeline-page">
      <div className="filters">
        <TypeFilter 
          value={filters.type}
          onChange={setTypeFilter}
        />
        
        <SearchBar
          value={filters.search}
          onChange={setSearchQuery}
        />
      </div>
      
      <div className="entries-list">
        {entries.length === 0 ? (
          <div className="empty-state">
            <p>Записей пока нет</p>
          </div>
        ) : (
          entries.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}
```

---

### Полный пример: EntryCard компонент

```javascript
// ui/components/entries/EntryCard/EntryCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EntryCard.css';

export default function EntryCard({ entry }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/entries/${entry.id}`);
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="entry-card" onClick={handleClick}>
      <div className="entry-card-header">
        <span className="entry-icon">{entry.getIcon()}</span>
        <span className="entry-type">{entry.getTypeName()}</span>
        <span className="entry-date">{formatDate(entry.createdAt)}</span>
      </div>
      
      <div className="entry-card-content">
        <p>{entry.content.substring(0, 200)}{entry.content.length > 200 ? '...' : ''}</p>
      </div>
      
      <div className="entry-card-footer">
        {entry.emotions.length > 0 && (
          <div className="emotions">
            {entry.emotions.slice(0, 3).map(({ emotion, intensity }) => (
              <span key={emotion.id} className="emotion-badge">
                {emotion.nameRu} ({intensity}/10)
              </span>
            ))}
          </div>
        )}
        
        {entry.getTotalRelations() > 0 && (
          <div className="relations-count">
            🔗 {entry.getTotalRelations()} связей
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Тестирование

### Unit тест для Entry entity

```javascript
// __tests__/core/entities/Entry.test.js

import Entry from '@/core/entities/Entry';

describe('Entry', () => {
  test('should create entry with valid data', () => {
    const entry = new Entry({
      entry_type: 'thought',
      content: 'Test thought'
    });
    
    expect(entry.type).toBe('thought');
    expect(entry.content).toBe('Test thought');
  });
  
  test('should validate required fields', () => {
    const entry = new Entry({
      entry_type: 'thought',
      content: ''
    });
    
    expect(() => entry.validate()).toThrow('Content cannot be empty');
  });
  
  test('should require deadline for plans', () => {
    const entry = new Entry({
      entry_type: 'plan',
      content: 'My plan'
    });
    
    expect(() => entry.validate()).toThrow('Plan must have a deadline');
  });
  
  test('should check if entry is overdue', () => {
    const pastDate = new Date('2020-01-01');
    const entry = new Entry({
      entry_type: 'plan',
      content: 'Old plan',
      deadline: pastDate
    });
    
    expect(entry.isOverdue()).toBe(true);
  });
});
```

---

### Integration тест для EntryService

```javascript
// __tests__/core/services/EntryService.test.js

import EntryService from '@/core/services/EntryService';
import Entry from '@/core/entities/Entry';

describe('EntryService', () => {
  let service;
  let mockRepo;
  
  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };
    
    service = new EntryService(mockRepo, {}, {}, {});
  });
  
  test('should create entry with validation', async () => {
    const entryData = {
      entry_type: 'thought',
      content: 'Test'
    };
    
    mockRepo.create.mockResolvedValue(new Entry({ ...entryData, id: 1 }));
    
    const entry = await service.createEntry(entryData);
    
    expect(mockRepo.create).toHaveBeenCalled();
    expect(entry.id).toBe(1);
  });
  
  test('should throw error on invalid entry', async () => {
    const entryData = {
      entry_type: 'thought',
      content: '' // пустой контент
    };
    
    await expect(service.createEntry(entryData)).rejects.toThrow();
  });
});
```

---

### E2E тест с React Testing Library

```javascript
// __tests__/ui/pages/TimelinePage.test.jsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimelinePage from '@/ui/pages/entries/TimelinePage';

describe('TimelinePage', () => {
  test('should render entries list', async () => {
    render(<TimelinePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Мой сон/i)).toBeInTheDocument();
    });
  });
  
  test('should filter by type', async () => {
    const user = userEvent.setup();
    render(<TimelinePage />);
    
    const filter = screen.getByRole('combobox', { name: /тип записи/i });
    await user.selectOptions(filter, 'dream');
    
    await waitFor(() => {
      expect(screen.queryByText(/Моя мысль/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Мой сон/i)).toBeInTheDocument();
    });
  });
});
```

---

## Следующие шаги

### Этап 1: Инициализация проекта
- [ ] Создать структуру папок
- [ ] Настроить Vite/Webpack
- [ ] Установить зависимости (React, Zustand, Axios, DOMPurify, etc.)
- [ ] Настроить ESLint + Prettier

### Этап 2: Core слой
- [ ] Реализовать BaseEntity и все entities
- [ ] Реализовать BaseRepository и все repositories
- [ ] Реализовать Services (Auth, Entry, Graph)
- [ ] Написать unit тесты для entities

### Этап 3: Adapters
- [ ] Реализовать Storage adapters (web/telegram)
- [ ] Реализовать Navigation adapters
- [ ] Реализовать Platform detection

### Этап 4: Store
- [ ] Настроить Zustand
- [ ] Реализовать все слайсы (Auth, Entries, Relations, etc.)
- [ ] Настроить persistence
- [ ] Написать тесты для store

### Этап 5: UI компоненты
- [ ] Создать базовые компоненты (Button, Input, Modal)
- [ ] Создать EntryCard, EntryForm
- [ ] Создать фильтры
- [ ] Создать layouts

### Этап 6: Страницы
- [ ] Timeline page
- [ ] Auth pages (Login, Register)
- [ ] Entry detail page
- [ ] Graph page (3D визуализация — потом)

### Этап 7: Интеграция
- [ ] Подключить Backend API
- [ ] Интеграция санитайзеров
- [ ] Интеграция security логов
- [ ] E2E тесты

### Этап 8: Telegram Mini App
- [ ] Адаптация UI для Telegram
- [ ] Настройка Telegram Bot
- [ ] Тестирование в Telegram
- [ ] Деплой

---

## Changelog

### 0x0002 (2025-11-21)
- Спроектирована полная архитектура фронтенда
- Разделение на 4 слоя: Core, Adapters, UI, Store
- Реализованы все паттерны: Factory, Repository, Adapter, Observer, Command, Strategy
- Создана структура entities (Entry, Emotion, Person, Relation, User)
- Создана структура repositories
- Создана структура services
- Настроен Zustand store (глобальный + мини-сторы)
- Созданы custom hooks (useAuth, useEntries, useSanitizer)
- Интеграция с Security (санитайзеры из 0x0003)
- Примеры компонентов и страниц
- Стратегия тестирования

---

  getIcon() {
    const icons = {
      [Entry.TYPES.DREAM]: 'иконка сна',
      [Entry.TYPES.MEMORY]: 'иконка воспоминаний',
      [Entry.TYPES.THOUGHT]: 'иконка мыслей',
      [Entry.TYPES.PLAN]: 'иконка планов'
    };
    return icons[this.type] || 'запись тип';
  }
  
  /**
   * Получить название типа на русском
   */
  getTypeName() {
    const names = {
      [Entry.TYPES.DREAM]: 'Сон',
      [Entry.TYPES.MEMORY]: 'Воспоминание',
      [Entry.TYPES.THOUGHT]: 'Мысль',
      [Entry.TYPES.PLAN]: 'План'
    };
    return names[this.type] || 'Запись';
  }
  
  /**
   * Проверка, является ли запись планом
   */
  isPlan() {
    return this.type === Entry.TYPES.PLAN;
  }
  
  /**
   * Проверка, просрочен ли план
   */
  isOverdue() {
    if (!this.isPlan() || this.isCompleted) {
      return false;
    }
    return this.deadline && this.deadline < new Date();
  }
  
  /**
   * Получить количество связей
   */
  getTotalRelations() {
    return this.relations.incoming.length + this.relations.outgoing.length;
  }
}

export default Entry;
```

---

#### Emotion — эмоция

```javascript
// core/entities/Emotion.js

import BaseEntity from './base/BaseEntity.js';

class Emotion extends BaseEntity {
  static CATEGORIES = {
    POSITIVE: 'positive',
    NEGATIVE: 'negative',
    NEUTRAL: 'neutral'
  };
  
  constructor(data = {}) {
    super(data);
    
    this.nameEn = data.name_en || '';
    this.nameRu = data.name_ru || '';
    this.category = data.category || Emotion.CATEGORIES.NEUTRAL;
    this.description = data.description || '';
    this.parentEmotionId = data.parent_emotion_id || null;
  }
  
  validate() {
    if (!this.nameEn || !this.nameRu) {
      throw new Error('Emotion must have both English and Russian names');
    }
    
    if (!Object.values(Emotion.CATEGORIES).includes(this.category)) {
      throw new Error(`Invalid emotion category: ${this.category}`);
    }
    
    return true;
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      name_en: this.nameEn,
      name_ru: this.nameRu,
      category: this.category,
      description: this.description,
      parent_emotion_id: this.parentEmotionId
    };
  }
  
  /**
   * Получить цвет для категории
   */
  getCategoryColor() {
    const colors = {
      [Emotion.CATEGORIES.POSITIVE]: '#4CAF50',
      [Emotion.CATEGORIES.NEGATIVE]: '#F44336',
      [Emotion.CATEGORIES.NEUTRAL]: '#9E9E9E'
    };
    return colors[this.category];
  }
  
  /**
   * Проверка, позитивная ли эмоция
   */
  isPositive() {
    return this.category === Emotion.CATEGORIES.POSITIVE;
  }
  
  isNegative() {
    return this.category === Emotion.CATEGORIES.NEGATIVE;
  }
}

export default Emotion;
```

---

#### Relation — связь между записями

```javascript
// core/entities/Relation.js

import BaseEntity from './base/BaseEntity.js';

class Relation extends BaseEntity {
  constructor(data = {}) {
    super(data);
    
    this.fromEntryId = data.from_entry_id || null;
    this.toEntryId = data.to_entry_id || null;
    this.relationTypeId = data.relation_type_id || null;
    this.description = data.description || '';
    
    // Заполняются отдельно
    this.fromEntry = null;  // Entry
    this.toEntry = null;    // Entry
    this.relationType = null; // RelationType
  }
  
  validate() {
    if (!this.fromEntryId || !this.toEntryId) {
      throw new Error('Relation must have both from and to entries');
    }
    
    if (this.fromEntryId === this.toEntryId) {
      throw new Error('Entry cannot be related to itself');
    }
    
    if (!this.relationTypeId) {
      throw new Error('Relation must have a type');
    }
    
    return true;
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      from_entry_id: this.fromEntryId,
      to_entry_id: this.toEntryId,
      relation_type_id: this.relationTypeId,
      description: this.description
    };
  }
  
  /**
   * Получить название связи
   */
  getTypeName() {
    return this.relationType?.description || 'Связано с';
  }
  
  /**
   * Проверка направления связи
   */
  isOutgoing(entryId) {
    return this.fromEntryId === entryId;
  }
  
  isIncoming(entryId) {
    return this.toEntryId === entryId;
  }
  
  /**
   * Получить связанную запись (для конкретной записи)
   */
  getRelatedEntry(currentEntryId) {
    if (this.isOutgoing(currentEntryId)) {
      return this.toEntry;
    }
    if (this.isIncoming(currentEntryId)) {
      return this.fromEntry;
    }
    return null;
  }
}

export default Relation;
```

---

#### Person — человек

```javascript
// core/entities/Person.js

import BaseEntity from './base/BaseEntity.js';

class Person extends BaseEntity {
  static CATEGORIES = {
    FAMILY: 'family',
    FRIENDS: 'friends',
    ACQUAINTANCES: 'acquaintances',
    STRANGERS: 'strangers'
  };
  
  constructor(data = {}) {
    super(data);
    
    this.userId = data.user_id || null;
    this.name = data.name || '';
    this.category = data.category || Person.CATEGORIES.ACQUAINTANCES;
    this.relationship = data.relationship || '';
    this.bio = data.bio || '';
    this.birthDate = data.birth_date ? new Date(data.birth_date) : null;
    this.notes = data.notes || '';
    
    // Статистика (заполняется отдельно)
    this.mentionCount = 0;
  }
  
  validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Person must have a name');
    }
    
    if (!Object.values(Person.CATEGORIES).includes(this.category)) {
      throw new Error(`Invalid person category: ${this.category}`);
    }
    
    return true;
  }
  
  toJSON() {
    return {
      ...super.toJSON(),
      user_id: this.userId,
      name: this.name,
      category: this.category,
      relationship: this.relationship,
      bio: this.bio,
      birth_date: this.birthDate?.toISOString(),
      notes: this.notes
    };
  }
  
  /**
   * Получить название категории
   */
  getCategoryName() {
    const names = {
      [Person.CATEGORIES.FAMILY]: 'Родные',
      [Person.CATEGORIES.FRIENDS]: 'Друзья',
      [Person.CATEGORIES.ACQUAINTANCES]: 'Знакомые',
      [Person.CATEGORIES.STRANGERS]: 'Случайные'
    };
    return names[this.category] || 'Неизвестно';
  }
  
  /**
   * Получить инициалы
   */
  getInitials() {
    return this.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}

export default Person;
```

---

### 1.2 Repositories (работа с API)

#### BaseRepository — базовый класс

```javascript
// core/repositories/base/BaseRepository.js

class BaseRepository {
  constructor(apiClient) {
    if (!apiClient) {
      throw new Error('API client is required');
    }
    this.api = apiClient;
  }
  
  /**
   * Обработка ошибок API
   */
  handleError(error) {
    console.error(`[${this.constructor.name}] Error:`, error);
    
    if (error.response) {
      // Ошибка от сервера
      throw new Error(error.response.data.message || 'Server error');
    } else if (error.request) {
      // Нет ответа от сервера
      throw new Error('No response from server');
    } else {
      // Другая ошибка
      throw error;
    }
  }
  
  /**
   * GET запрос
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.api.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * POST запрос
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * PUT запрос
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
  
  /**
   * DELETE запрос
   */
  async delete(endpoint) {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}

export default BaseRepository;
```

---

#### EntriesRepository

```javascript
// core/repositories/EntriesRepository.js

import BaseRepository from './base/BaseRepository.js';
import Entry from '../entities/Entry.js';

class EntriesRepository extends BaseRepository {
  /**
   * Получить все записи пользователя
   */
  async getAll(filters = {}) {
    const data = await this.get('/api/entries', filters);
    return data.map(item => new Entry(item));
  }
  
  /**
   * Получить запись по ID
   */
  async getById(id) {
    const data = await this.get(`/api/entries/${id}`);
    return new Entry(data);
  }
  
  /**
   * Создать запись
   */
  async create(entry) {
    const data = await this.post('/api/entries', entry.toJSON());
    return new Entry(data);
  }
  
  /**
   * Обновить запись
   */
  async update(id, entry) {
    const data = await this.put(`/api/entries/${id}`, entry.toJSON());
    return new Entry(data);
  }
  
  /**
   * Удалить запись
   */
  async delete(id) {
    return await this.delete(`/api/entries/${id}`);
  }
  
  /**
   * Поиск по тексту
   */
  async search(query) {
    const data = await this.get('/api/entries/search', { q: query });
    return data.map(item => new Entry(item));
  }
  
  /**
   * Получить записи с пагинацией
   */
  async getPaginated(page = 1, limit = 50) {
    const data = await this.get('/api/entries', { page, limit });
    return {
      entries: data.entries.map(item => new Entry(item)),
      total: data.total,
      page: data.page,
      totalPages: data.totalPages
    };
  }
}

export default EntriesRepository;
```

---

