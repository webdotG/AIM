# DECISION_0x0002.md - Граф связей записей и система аутентификации

**Версия:** 0x0002  
**Дата:** November 21, 2025  
**Статус:** ПРИНЯТО  
**Платформы:** Web + Telegram Mini App

---


. [1: Система аутентификации](#решение-1-система-аутентификации)  
. [2: Граф связей записей](#решение-2-граф-связей-записей)  
. [Схема базы данных](#схема-базы-данных)  
. [Архитектура приложения](#архитектура-приложения)  
. [Примеры использования](#примеры-использования)  
. [SQL запросы](#sql-запросы)  
. [UI/UX дизайн](#uiux-дизайн)  
. [Ограничения и оптимизация](#ограничения-и-оптимизация)  

---


# Решение 1: Система аутентификации

- НИКАКИХ `telegram_id`
- Нельзя хранить `device_id`, `ip_address`, `user_agent` МЕТАДАННЫЕ например С ФОТО И ПРОЧ  
- Пользователь должен иметь доступ с любого устройства (web/telegram) с одним аккаунтом

#### 1. Регистрация (web + telegram одинаково)
```
User → вводит:
  - login (VARCHAR(50), уникальный)
  - password (солится как сало)

Backend:
  1. Проверяет уникальность login
  2. Хеширует пароль → password_hash
  3. Генерирует backup_code: "Господи Спаси и Сохрани"
  4. Хеширует backup_code → backup_code_hash
  5. Создает запись в users
  6. Возвращает { token: JWT, backup_code: "Господи Спаси и Сохрани" }

UI:
  Показывает модалку:
  "ПОЖАЛУЙСТА СОХРАНИ КАК НИ БУДЬ ЭТО ИНАЧЕ ПИЗДА !"
  [Господи Спаси и Сохрани]
  [ => Скопировать] [=>  Я сохранил]
```

#### 2. Вход (web + telegram одинаково)
```
User → вводит:
  - login
  - password

Backend:
  1. Находит user по login
  2. Проверяет password
  3. Генерирует JWT { user_id, iat, exp }
  4. Обновляет last_login
  5. Возвращает { token: JWT }
```

#### 3. Восстановление пароля (через backup-код)
```
User → вводит:
  - login
  - backup_code

Backend:
  1. Находит user по login
  2. Проверяет backup_code, backup_code_hash
  3. Если OK → разрешает установить новый пароль
  4. Генерирует НОВЫЙ backup_code (старый сгорел)
  5. Возвращает новый backup_code пользователю
```

# НО ВОТ ЭТО КОНЕЧНО МОЖНО ОБСУДИТЬ ПОТОМУ ЧТО ВОССТАНОВЛЕНИЕ ПАРОЛЯ ЭТО СЛАБОЕ МЕСТО В СИСТЕМЕ 
# И МОЖЕТ СТОИТ ОТ НЕГО ОТКАЗАТЬСЯ

#### 4. JWT токен (структура)
```json
{
  "user_id": 123,
  "iat": 1732204800,
  "exp": 1732291200
}
```

#### 5. Хранение токена

**Web:**
- `sessionStorage` для токена (очищается при закрытии вкладки)
- httpOnly cookie для refresh token (опционально)

**Telegram Mini App:**
- `localStorage` внутри WebView Telegram
- НИКАКОГО Telegram Cloud Storage (telegram_id)

### Таблица users
```sql
users
  id                SERIAL PRIMARY KEY
  login             VARCHAR(50) UNIQUE NOT NULL
  password_hash     VARCHAR(128) NOT NULL
  backup_code_hash  VARCHAR(128) NOT NULL
  created_at        TIMESTAMP DEFAULT NOW()
  last_login        TIMESTAMP
```
# ЛАСТ ЛОГИН ТОЧНО УДАЛИТЬ 
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


#### Telegram Mini App = просто WebView
- НЕ ЮЗАТЬ Telegram Web App API `initData`
- НЕ ЮЗАТЬ `window.Telegram.WebApp.initDataUnsafe.user`
- вводит login/password вручную — как на сайте

---


# Решение 2: Граф связей записей

### Заметки  
Пользователь записывает мысли **не линейно, а ассоциативно**:
- Сон напомнил о детском воспоминании → это вызвало мысль → мысль привела к плану
- Через неделю другая мысль тоже связана с тем же планом
- Нужно добавлять связи **в любой момент**, от любой записи к любой
- Граф может быть **циклическим** (A → B → C → A)

### Решение
1. Связи создаются **после создания записи**
2. От одной записи может быть **несколько связей** (входящих и исходящих)
3. Граф может быть **циклическим**
4. Связь можно создать **от любого узла к любому**
5. Типы связей должны быть **расширяемыми**

### Граф на PostgreSQL

#### Архитектура
- **Направленный граф:** A → B (from_entry_id → to_entry_id)
- **Типы связей:** справочник `relation_types` (расширяемый)
- **Рекурсивные запросы:** PostgreSQL CTE для обхода графа
- **Защита от циклов:** ограничение глубины + детект через массив `path`

---

## Схема базы данных

### 1. Справочник типов связей (расширяемый)
```sql
relation_types
  id              SERIAL PRIMARY KEY
  name            VARCHAR(50) UNIQUE NOT NULL
  description     TEXT
  is_active       BOOLEAN DEFAULT TRUE
  created_at      TIMESTAMP DEFAULT NOW()
```

**Начальные типы:**
```sql
INSERT INTO relation_types (id, name, description) VALUES
  (1, 'reminded_of', 'Напомнило о'),
  (2, 'led_to', 'Привело к'),
  (3, 'inspired_by', 'Вдохновлено'),
  (4, 'caused_by', 'Вызвано'),
  (5, 'related_to', 'Связано с'),
  (6, 'resulted_in', 'Результат'),
  (7, 'continues', 'Продолжение');
```

**В будущем можно накинуть :**
```sql
INSERT INTO relation_types (name, description) VALUES
  ('contradicts', 'Противоречит'),
  ('resolved_by', 'Решено через'),
  ('triggered', 'Триггернуло');
```

---

### 2. Связи между записями
```sql
entry_relations
  id                SERIAL PRIMARY KEY
  from_entry_id     UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  to_entry_id       UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE
  relation_type_id  INT NOT NULL REFERENCES relation_types(id)
  description       TEXT
  created_at        TIMESTAMP DEFAULT NOW()
  
  CHECK (from_entry_id != to_entry_id)
```

**Индексы:**
```sql
CREATE INDEX idx_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_relations_to ON entry_relations(to_entry_id);
CREATE INDEX idx_relations_type ON entry_relations(relation_type_id);
```

---

### 3. Настройки приложения
```sql
app_settings
  key    VARCHAR(50) PRIMARY KEY
  value  TEXT NOT NULL
```

**Начальные настройки:**
```sql
INSERT INTO app_settings (key, value) VALUES
  ('max_graph_depth', '10'),
  ('max_relations_per_entry', '50'),
  ('pagination_size', '50');
```

---



### 4. таблица users
```sql
users
  id                SERIAL PRIMARY KEY
  login             VARCHAR(50) UNIQUE NOT NULL
  password_hash     VARCHAR(128) NOT NULL
  backup_code_hash  VARCHAR(128) NOT NULL
  created_at        TIMESTAMP DEFAULT NOW()
```

---

## Архитектура

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# НЕ АКТУАЛЬНА --В НОВОЙ-> ВВЕДЕНЫ СИНТАЙЗЕРЫ и ПРОЧ
```
src/
├── core/                    # Бизнес-логика (платформо-независимая)
│   ├── entities/            # Модели (Entry, Emotion, Person, Relation)
│   ├── repositories/        # Работа с API
│   │   ├── AuthRepository.js
│   │   ├── EntriesRepository.js
│   │   ├── RelationsRepository.js
│   │   └── EmotionsRepository.js
│   ├── services/            # Бизнес-логика
│   │   ├── AuthService.js
│   │   ├── GraphService.js
│   │   └── AnalyticsService.js
│   ├── stores/              # State management
│   │   ├── GlobalStore.js
│   │   ├── EntriesStore.js
│   │   ├── RelationsStore.js
│   │   ├── EmotionsStore.js
│   │   ├── PeopleStore.js
│   │   └── UIStore.js
│   └── commands/            # Сложные операции
│       ├── CreateEntryCommand.js
│       └── CreateRelationCommand.js
├── adapters/                # Платформо-зависимые адаптеры
│   ├── web/
│   │   ├── StorageAdapter.js       # sessionStorage
│   │   ├── NavigationAdapter.js    # React Router
│   │   └── AuthAdapter.js          # JWT
│   └── telegram/
│       ├── StorageAdapter.js       # localStorage
│       ├── NavigationAdapter.js    # BackButton, MainButton
│       └── AuthAdapter.js          # JWT (без initData)
├── ui/                      # Компоненты UI
│   ├── components/
│   │   ├── EntryCard.jsx
│   │   ├── RelationModal.jsx
│   │   ├── GraphView.jsx
│   │   └── TimelineView.jsx
│   ├── factories/           # ComponentFactory
│   │   └── PlatformFactory.js
│   └── hooks/
│       └── useRelations.js
├── platforms/               # Точки входа
│   ├── web/
│   │   └── index.jsx
│   └── telegram/
│       └── index.jsx
└── shared/                  # Утилиты, константы
    ├── constants.js
    └── utils.js
```

### Паттерны

#### 1. Factory Pattern (для компонентов)
```javascript
class PlatformFactory {
  static createButton(platform) {
    if (platform === 'telegram') {
      return new TelegramButton();
    }
    return new WebButton();
  }
  
  static createNavigation(platform) {
    if (platform === 'telegram') {
      return new TelegramNavigationAdapter();
    }
    return new WebNavigationAdapter();
  }
}
```

#### 2. Repository Pattern (работа с API)
```javascript
class RelationsRepository {
  constructor(apiClient) {
    this.api = apiClient;
  }
  
  async create(fromId, toId, typeId, description) {
    return this.api.post('/api/relations', {
      from_entry_id: fromId,
      to_entry_id: toId,
      relation_type_id: typeId,
      description
    });
  }
  
  async getForEntry(entryId) {
    return this.api.get(`/api/entries/${entryId}/relations`);
  }
  
  async delete(relationId) {
    return this.api.delete(`/api/relations/${relationId}`);
  }
}
```

#### 3. Adapter Pattern (платформо-зависимые вещи)
```javascript
class WebStorageAdapter {
  saveToken(token) {
    sessionStorage.setItem('token', token);
  }
  
  getToken() {
    return sessionStorage.getItem('token');
  }
  
  clear() {
    sessionStorage.removeItem('token');
  }
}

class TelegramStorageAdapter {
  saveToken(token) {
    localStorage.setItem('token', token);
  }
  
  getToken() {
    return localStorage.getItem('token');
  }
  
  clear() {
    localStorage.removeItem('token');
  }
}
```

#### 4. Store Pattern (глобальный + мини-сторы)
```javascript
class GlobalStore {
  constructor() {
    this.entries = new EntriesStore();
    this.relations = new RelationsStore();
    this.emotions = new EmotionsStore();
    this.people = new PeopleStore();
    this.ui = new UIStore();
  }
}

class RelationsStore {
  constructor() {
    this.relations = [];
    this.loading = false;
  }
  
  async loadForEntry(entryId) {
    this.loading = true;
    this.relations = await relationsRepository.getForEntry(entryId);
    this.loading = false;
  }
  
  async create(fromId, toId, typeId) {
    const relation = await relationsRepository.create(fromId, toId, typeId);
    this.relations.push(relation);
    return relation;
  }
}
```

#### 5. Command Pattern (сложные операции)
```javascript
class CreateEntryWithRelationsCommand {
  constructor(entryData, relations) {
    this.entryData = entryData;
    this.relations = relations;
  }
  
  async execute() {
    // 1. Создать запись
    const entry = await entriesRepository.create(this.entryData);
    
    // 2. Создать связи
    for (const rel of this.relations) {
      await relationsRepository.create(entry.id, rel.toId, rel.typeId);
    }
    
    return entry;
  }
  
  async undo() {
    // Откат операции
    await entriesRepository.delete(this.entryData.id);
  }
}
```

---

## КАК ДОЛЖНО БЫТЬ ПО ИДЕИ  ;

### 1: Линейная цепочка
```
Пользователь:
1. Записывает Сон [A]: "Летал над городом"
2. Создает связь → Воспоминание [B]: "Вспомнил детство"
3. Создает связь → Мысль [C]: "Думаю о свободе"
4. Создает связь → План [E]: "Научиться параплану"

Результат:
  Сон [A] → Воспоминание [B] → Мысль [C] → План [E]
```

**SQL:**
```sql
INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type_id)
VALUES 
  ('uuid-A', 'uuid-B', 1),  -- reminded_of
  ('uuid-B', 'uuid-C', 2),  -- led_to
  ('uuid-C', 'uuid-E', 3);  -- inspired_by
```

---

### 2: Добавление ветки позже
```
Через неделю:
1. Мысль [D]: "Думаю о рисках"
2. Поннимание, что она связана с Мысль [C]
3. Добавить связь: Мысль [D] → Мысль [C]

Результат:
       Сон [A]
         ↓
   Воспоминание [B] ──→ Мысль [C] ──→ План [E]
                          ↑
                       Мысль [D]
```

**SQL:**
```sql
INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type_id)
VALUES ('uuid-D', 'uuid-C', 5);  -- related_to
```

---

### 3: Циклическая связь
```
Пользователь осознает:
  План [E] → напомнил о → Сон [A]

Результат:
  Сон [A] → Воспоминание [B] → Мысль [C] → План [E]
    ↑_______________________________________________|
```

**SQL:**
```sql
INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type_id)
VALUES ('uuid-E', 'uuid-A', 1);  -- reminded_of
```

---

### 4: Множественные связи
```
Мысль [C] и План [E] связаны двумя способами:
  1. Мысль [C] → вдохновила → План [E]
  2. План [E] → вызвал тревогу → Мысль [C] (новая мысль о плане)

Результат:
  Мысль [C] ⇄ План [E]
```

**SQL:**
```sql
INSERT INTO entry_relations (from_entry_id, to_entry_id, relation_type_id)
VALUES 
  ('uuid-C', 'uuid-E', 3),  -- inspired_by
  ('uuid-E', 'uuid-C', 4);  -- caused_by
```

---

## SQL запросы

### 1. Получить все связи записи
```sql
-- Исходящие (откуда идет эта запись)
SELECT 
  er.id,
  er.to_entry_id AS related_entry_id,
  rt.name AS relation_type,
  rt.description AS relation_description,
  er.description AS custom_description,
  'outgoing' AS direction,
  e.entry_type,
  e.content
FROM entry_relations er
JOIN relation_types rt ON er.relation_type_id = rt.id
JOIN entries e ON er.to_entry_id = e.id
WHERE er.from_entry_id = $1

UNION ALL

-- Входящие (откуда приходят к этой записи)
SELECT 
  er.id,
  er.from_entry_id AS related_entry_id,
  rt.name AS relation_type,
  rt.description AS relation_description,
  er.description AS custom_description,
  'incoming' AS direction,
  e.entry_type,
  e.content
FROM entry_relations er
JOIN relation_types rt ON er.relation_type_id = rt.id
JOIN entries e ON er.from_entry_id = e.id
WHERE er.to_entry_id = $1

ORDER BY created_at DESC;
```

---

### 2. Рекурсивный обход цепочки
```sql
WITH RECURSIVE entry_chain AS (
  -- Начальная запись
  SELECT 
    e.id, 
    e.entry_type, 
    e.content,
    e.created_at,
    0 AS depth,
    ARRAY[e.id] AS path,
    NULL::INT AS relation_type_id,
    NULL::VARCHAR AS relation_name
  FROM entries e
  WHERE e.id = $1
  
  UNION ALL
  
  -- Рекурсивно идем по связям
  SELECT 
    e.id, 
    e.entry_type, 
    e.content,
    e.created_at,
    ec.depth + 1,
    ec.path || e.id,
    er.relation_type_id,
    rt.name AS relation_name
  FROM entries e
  JOIN entry_relations er ON e.id = er.to_entry_id
  JOIN relation_types rt ON er.relation_type_id = rt.id
  JOIN entry_chain ec ON er.from_entry_id = ec.id
  WHERE 
    ec.depth < (SELECT value::INT FROM app_settings WHERE key = 'max_graph_depth')
    AND NOT (e.id = ANY(ec.path))  -- Защита от циклов
)
SELECT * FROM entry_chain
ORDER BY depth, created_at;
```

---

### 3. Статистика связей
```sql
-- Топ записей по количеству связей
SELECT 
  e.id,
  e.entry_type,
  e.content,
  COUNT(DISTINCT er1.id) AS outgoing_count,
  COUNT(DISTINCT er2.id) AS incoming_count,
  COUNT(DISTINCT er1.id) + COUNT(DISTINCT er2.id) AS total_connections
FROM entries e
LEFT JOIN entry_relations er1 ON e.id = er1.from_entry_id
LEFT JOIN entry_relations er2 ON e.id = er2.to_entry_id
WHERE e.user_id = $1
GROUP BY e.id
ORDER BY total_connections DESC
LIMIT 10;
```

---

### 4. Поиск изолированных записей (без связей)
```sql
SELECT e.*
FROM entries e
WHERE e.user_id = $1
  AND NOT EXISTS (
    SELECT 1 FROM entry_relations 
    WHERE from_entry_id = e.id OR to_entry_id = e.id
  );
```

---

## UI/UX дизайн

### Режим 1: Лента (Timeline View)

#### Макет
```
┌──────────────────────────────────────────────────┐
│ [Лента] [Граф] [Статистика]                      │
├──────────────────────────────────────────────────┤
│ Фильтры: [Все типы ▼] [Все эмоции ▼] [Поиск...] │
├──────────────────────────────────────────────────┤
│ 21 ноября 2025                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ Сон: "Летал над городом"                  │ │
│ │ Эмоции: Восторг (9/10), Радость (8/10)       │ │
│ │ Связи: → 1 исходящая                         │ │
│ │ [Просмотреть] [Добавить связь]               │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ Мысль: "Думаю о свободе"                  │ │
│ │ Эмоции: Интерес (7/10)                       │ │
│ │ Связи: ← 2 входящие, → 1 исходящая           │ │
│ │ [Просмотреть] [Добавить связь]               │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ 20 ноября 2025                                   │
│ ...                                              │
│                                                  │
│ [Загрузить еще] (пагинация по 50)               │
└──────────────────────────────────────────────────┘
```

#### Фильтры
- **По типу:** [Все | Сны | Воспоминания | Мысли | Планы]
- **По эмоциям:** [Все | Позитивные | Негативные | Нейтральные]
- **По периоду:** [За неделю | За месяц | За год | Все время]
- **Поиск:** Full-text search по content

---

### Режим 2: Граф (Graph View)

#### Макет
```
┌──────────────────────────────────────────────────┐
│ [Лента] [Граф] [Статистика]                      │
├──────────────────────────────────────────────────┤
│ Фильтры: [Глубина: 3 ▼] [От записи: ... ▼]      │
├──────────────────────────────────────────────────┤
│                                                  │
│               [Сон A]                          │
│                 ↓ reminded_of                    │
│            [Воспоминание B]                    │
│                 ↓ led_to        ↘                │
│            [Мысль C] ← related_to [Мысль D]    │
│                 ↓ inspired_by                    │
│               [План E]                         │
│                                                  │
│ Легенда:                                         │
│  Сон   Воспоминание   Мысль   План       │
│                                                  │
│ [Полный экран] [Экспорт PNG] [Сбросить фильтры] │
└──────────────────────────────────────────────────┘
```

#### Интерактив
- **Клик на узел** → открывает карточку записи
- **Hover на стрелку** → показывает тип связи
- **Drag & drop** → перемещение узлов (сохраняется позиция)
- **Zoom** → масштабирование графа

#### 3D визуализация 
- Тут сейчас при нынешних реалиях есть куда развернуться ...   

---

### Создание связи - модалка

#### Из карточки записи
```
┌───────────────────────────────────────┐
│ Добавить связь для записи:            │
│ "Думаю о свободе"                     │
├───────────────────────────────────────┤
│ Направление:                          │
│   ◉ Эта запись → Другая               │
│   ○ Другая → Эта запись               │
│                                       │
│ Выбрать запись:                       │
│   [Поиск или список... ▼]             │
│   Результаты:                         │
│   • Сон "Летал над городом"           │
│   • План "Научиться параплану"        │
│   • Воспоминание "Детство в деревне"  │
│                                       │
│ Тип связи:                            │
│   [reminded_of ▼]                     │
│   Напомнило о                         │
│                                       │
│ Описание (опционально):               │
│   [Поясните связь...]                 │
│                                       │
│ [Создать связь]  [Отмена]             │
└───────────────────────────────────────┘
```

---

## Ограничения и оптимизация

### 1. Глубина рекурсии

**Бесконечные циклы в графе**   
- Ограничение глубины через `app_settings.max_graph_depth` (по умолчанию 10)
- Детект циклов через массив `path` в рекурсивном CTE
- Конфигурируемость: можно увеличить глубину при необходимости

**Код для загрузки настроек:**
```javascript
class GraphService {
  constructor() {
    this.maxDepth = 10; // дефолт
  }
  
  async loadSettings() {
    const setting = await db.query(
      "SELECT value FROM app_settings WHERE key = 'max_graph_depth'"
    );
    this.maxDepth = parseInt(setting.rows[0].value);
  }
}
```

---

**Индексы:**
```sql
CREATE INDEX idx_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_relations_to ON entry_relations(to_entry_id);
CREATE INDEX idx_relations_type ON entry_relations(relation_type_id);
CREATE INDEX idx_entries_user_type ON entries(user_id, entry_type);
CREATE INDEX idx_entries_created ON entries(created_at DESC);
```

---


### 3. Масштабирование количества связей

**Ограничение:**
```sql
-- Проверка перед созданием связи
CREATE OR REPLACE FUNCTION check_max_relations()
RETURNS TRIGGER AS $
DECLARE
  current_count INT;
  max_allowed INT;
BEGIN
  -- Получаем лимит
  SELECT value::INT INTO max_allowed 
  FROM app_settings 
  WHERE key = 'max_relations_per_entry';
  
  -- Считаем текущие связи
  SELECT COUNT(*) INTO current_count
  FROM entry_relations
  WHERE from_entry_id = NEW.from_entry_id 
     OR to_entry_id = NEW.from_entry_id;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Достигнут лимит связей для записи (%)', max_allowed;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_relations
  BEFORE INSERT ON entry_relations
  FOR EACH ROW
  EXECUTE FUNCTION check_max_relations();
```

---


## Миграции

### Порядок выполнения

```
migrations/
  001_create_users.sql
  002_create_entries.sql
  003_create_emotions.sql
  004_create_entry_emotions.sql
  005_create_people.sql
  006_create_entry_people.sql
  007_create_relation_types.sql          ← НОВОЕ
  008_create_entry_relations.sql         ← НОВОЕ
  009_create_tags.sql
  010_create_entry_tags.sql
  011_create_app_settings.sql            ← НОВОЕ
  012_create_ai_tables.sql
  013_insert_emotions_data.sql
  014_insert_relation_types_data.sql     ← НОВОЕ
  015_insert_app_settings_data.sql       ← НОВОЕ
  016_create_triggers.sql                ← НОВОЕ (max_relations)
```

---

### 001_create_users.sql (обновленная)
```sql
CREATE TABLE users (
  id                SERIAL PRIMARY KEY,
  login             VARCHAR(50) UNIQUE NOT NULL,
  password_hash     VARCHAR(128) NOT NULL,
  backup_code_hash  VARCHAR(128) NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW(),
  last_login        TIMESTAMP
);

CREATE INDEX idx_users_login ON users(login);
```

---

### 007_create_relation_types.sql
```sql
CREATE TABLE relation_types (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(50) UNIQUE NOT NULL,
  description     TEXT,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_relation_types_active ON relation_types(is_active);
```

---

### 008_create_entry_relations.sql
```sql
CREATE TABLE entry_relations (
  id                SERIAL PRIMARY KEY,
  from_entry_id     UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  to_entry_id       UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  relation_type_id  INT NOT NULL REFERENCES relation_types(id),
  description       TEXT,
  created_at        TIMESTAMP DEFAULT NOW(),
  
  CHECK (from_entry_id != to_entry_id)
);

CREATE INDEX idx_relations_from ON entry_relations(from_entry_id);
CREATE INDEX idx_relations_to ON entry_relations(to_entry_id);
CREATE INDEX idx_relations_type ON entry_relations(relation_type_id);
CREATE INDEX idx_relations_created ON entry_relations(created_at DESC);
```

---

### 011_create_app_settings.sql
```sql
CREATE TABLE app_settings (
  key    VARCHAR(50) PRIMARY KEY,
  value  TEXT NOT NULL
);
```

---

### 014_insert_relation_types_data.sql
```sql
INSERT INTO relation_types (id, name, description, is_active) VALUES
  (1, 'reminded_of', 'Напомнило о', TRUE),
  (2, 'led_to', 'Привело к', TRUE),
  (3, 'inspired_by', 'Вдохновлено', TRUE),
  (4, 'caused_by', 'Вызвано', TRUE),
  (5, 'related_to', 'Связано с', TRUE),
  (6, 'resulted_in', 'Результат', TRUE),
  (7, 'continues', 'Продолжение', TRUE);

-- Установить sequence для будущих типов
SELECT setval('relation_types_id_seq', 100);
```

---

### 015_insert_app_settings_data.sql
```sql
INSERT INTO app_settings (key, value) VALUES
  ('max_graph_depth', '10'),
  ('max_relations_per_entry', '50'),
  ('pagination_size', '50');
```

---

### 016_create_triggers.sql
```sql
-- Триггер для ограничения количества связей
CREATE OR REPLACE FUNCTION check_max_relations()
RETURNS TRIGGER AS $
DECLARE
  current_count INT;
  max_allowed INT;
BEGIN
  SELECT value::INT INTO max_allowed 
  FROM app_settings 
  WHERE key = 'max_relations_per_entry';
  
  SELECT COUNT(*) INTO current_count
  FROM entry_relations
  WHERE from_entry_id = NEW.from_entry_id 
     OR to_entry_id = NEW.from_entry_id;
  
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Достигнут лимит связей для записи (%)', max_allowed;
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_relations
  BEFORE INSERT ON entry_relations
  FOR EACH ROW
  EXECUTE FUNCTION check_max_relations();

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## API Endpoints backend  

### Authentication

#### POST /api/auth/register
```json
Request:
{
  "login": "anonymous_user_123",
  "password": "strong_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "backup_code": "Господи Спаси и Сохрани ",
  "user_id": 123
}
```

#### POST /api/auth/login
```json
Request:
{
  "login": "anonymous_user_123",
  "password": "strong_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user_id": 123
}
```

#### POST /api/auth/recover
```json
Request:
{
  "login": "anonymous_user_123",
  "backup_code": "Господи спаси и созрани",
  "new_password": "new_strong_password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "backup_code": "Теперь точно запомню сто проц",  // новый код
  "message": "Password updated successfully"
}
```

---

### Relations

#### GET /api/entries/:id/relations
```json
Response:
{
  "outgoing": [
    {
      "id": 1,
      "to_entry_id": "uuid-B",
      "relation_type": {
        "id": 1,
        "name": "reminded_of",
        "description": "Напомнило о"
      },
      "description": "Сон напомнил о детстве",
      "created_at": "2025-11-21T10:30:00Z",
      "entry": {
        "id": "uuid-B",
        "entry_type": "memory",
        "content": "Вспомнил как в детстве...",
        "created_at": "2025-11-20T15:00:00Z"
      }
    }
  ],
  "incoming": [
    {
      "id": 2,
      "from_entry_id": "uuid-D",
      "relation_type": {
        "id": 5,
        "name": "related_to",
        "description": "Связано с"
      },
      "description": null,
      "created_at": "2025-11-22T09:00:00Z",
      "entry": {
        "id": "uuid-D",
        "entry_type": "thought",
        "content": "Думаю о рисках...",
        "created_at": "2025-11-22T08:45:00Z"
      }
    }
  ]
}
```

#### POST /api/relations
```json
Request:
{
  "from_entry_id": "uuid-A",
  "to_entry_id": "uuid-B",
  "relation_type_id": 1,
  "description": "Сон напомнил о детстве"
}

Response:
{
  "id": 1,
  "from_entry_id": "uuid-A",
  "to_entry_id": "uuid-B",
  "relation_type_id": 1,
  "description": "Сон напомнил о детстве",
  "created_at": "2025-11-21T10:30:00Z"
}
```

#### DELETE /api/relations/:id
```json
Response:
{
  "message": "Relation deleted successfully",
  "deleted_id": 1
}
```

#### GET /api/entries/:id/chain
```json
Query params:
  ?depth=10  // максимальная глубина

Response:
{
  "chain": [
    {
      "id": "uuid-A",
      "entry_type": "dream",
      "content": "Летал над городом",
      "depth": 0,
      "relation_type": null
    },
    {
      "id": "uuid-B",
      "entry_type": "memory",
      "content": "Вспомнил детство",
      "depth": 1,
      "relation_type": "reminded_of"
    },
    {
      "id": "uuid-C",
      "entry_type": "thought",
      "content": "Думаю о свободе",
      "depth": 2,
      "relation_type": "led_to"
    }
  ],
  "total_depth": 2,
  "has_cycles": false
}
```

---

### Relation Types

#### GET /api/relation-types
```json
Response:
[
  {
    "id": 1,
    "name": "reminded_of",
    "description": "Напомнило о",
    "is_active": true
  },
  {
    "id": 2,
    "name": "led_to",
    "description": "Привело к",
    "is_active": true
  }
]
```

---


*совет постановил*