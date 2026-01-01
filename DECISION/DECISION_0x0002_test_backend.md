# ⚡ Команды тестирования

## Основные команды

```bash
# Установка зависимостей
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# Создать тестовую БД
npm run db:test:setup

# Запустить все тесты
npm test

# Запустить тесты конкретного модуля
npm run test:auth        # Auth тесты
npm run test:entries     # Entries тесты
npm run test:emotions    # Emotions тесты
npm run test:tags        # Tags тесты  
npm run test:people      # People тесты
npm run test:skills      # Skills тесты
npm run test:analytics   # Analytics тесты
npm run test:relations   # Relations тесты

# Запустить все модули последовательно
npm run test:all

# Watch режим (автоперезапуск при изменениях)
npm run test:watch

# С покрытием кода
npm run test:coverage

# С подробным выводом
npm run test:verbose

# Debug режим (в браузере)
npm run test:debug
```

---

## База данных

```bash
# Создать тестовую БД
npm run db:test:setup

# Удалить тестовую БД
npm run db:test:drop

# Пересоздать (drop + setup)
npm run db:test:reset

# Проверить подключение
psql -U postgres -d dream_journal_test -c "SELECT 1;"

# Посмотреть таблицы
psql -U postgres -d dream_journal_test -c "\dt"

# Посмотреть структуру таблицы users
psql -U postgres -d dream_journal_test -c "\d users"

# Посмотреть количество записей
psql -U postgres -d dream_journal_test -c "SELECT COUNT(*) FROM users;"
```

---

## Отладка тестов

```bash
# Запустить конкретный тест по названию
npx jest -t "should register a new user"

# Запустить один файл
npx jest src/modules/auth/__tests__/auth.test.ts

# С детектором открытых соединений
npm run test:verbose

# Показать все доступные тесты
npx jest --listTests

# Показать покрытие для конкретного файла
npx jest --coverage --collectCoverageFrom=src/modules/auth/**/*.ts

# Запустить только failed тесты
npx jest --onlyFailures

# Запустить последние измененные тесты
npx jest --changedSince=HEAD
```

---

## Покрытие кода

```bash
# Базовый отчет
npm run test:coverage

# Открыть HTML отчет
open coverage/lcov-report/index.html
# или
xdg-open coverage/lcov-report/index.html  # Linux

# Посмотреть JSON отчет
cat coverage/coverage-summary.json | jq

# Покрытие только auth модуля
npx jest src/modules/auth --coverage
```

---

## Очистка

```bash
# Очистить тестовые данные в БД
psql -U postgres -d dream_journal_test -c "DELETE FROM users WHERE login LIKE 'test_%';"

# Удалить coverage директорию
rm -rf coverage

# Очистить node_modules и переустановить
rm -rf node_modules
npm install

# Очистить Jest cache
npx jest --clearCache
```

---

## Создание новых тестов

```bash
# Создать директорию для тестов модуля
mkdir -p src/modules/МОДУЛЬ/__tests__

# Создать файл теста
touch src/modules/МОДУЛЬ/__tests__/МОДУЛЬ.test.ts

# Скопировать шаблон
cp src/modules/entries/__tests__/entries.test.ts src/modules/МОДУЛЬ/__tests__/МОДУЛЬ.test.ts
```

---

## Переменные окружения

```bash
# Проверить .env.test
cat .env.test

# Проверить PASSWORD_PEPPER
grep PASSWORD_PEPPER .env.test

# Проверить длину PASSWORD_PEPPER (должно быть ≥32)
echo -n "$(grep PASSWORD_PEPPER .env.test | cut -d'=' -f2)" | wc -c

# Проверить что HCAPTCHA отключен
grep HCAPTCHA_ENABLED .env.test
# Должно быть: HCAPTCHA_ENABLED=false
```

---

## Git и CI/CD

```bash
# Запустить тесты перед commit
npm test && git commit -m "Your message"

# Добавить в pre-commit hook
echo "npm test" > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# Настроить Husky для автотестов
npm install --save-dev husky
npx husky init
echo "npm test" > .husky/pre-commit
```

---

## NPM Scripts (package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:auth": "jest src/modules/auth/__tests__",
    "test:entries": "jest src/modules/entries/__tests__",
    "test:emotions": "jest src/modules/emotions/__tests__",
    "test:all": "ts-node src/__tests__/run-all-tests.ts",
    "test:verbose": "jest --verbose --detectOpenHandles",
    "db:test:setup": "psql -U postgres -f test-db-setup.sql",
    "db:test:drop": "psql -U postgres -c 'DROP DATABASE IF EXISTS dream_journal_test;'",
    "db:test:reset": "npm run db:test:drop && npm run db:test:setup"
  }
}
```

---

## Решение частых проблем

### Ошибка: "PASSWORD_PEPPER must be set"
```bash
# Проверить .env.test
grep PASSWORD_PEPPER .env.test
# Добавить если отсутствует (минимум 32 символа)
```

### Ошибка: "database does not exist"
```bash
npm run db:test:setup
```

### Ошибка: "Jest did not exit"
```typescript
// Добавить в afterAll
afterAll(async () => {
  await pool.end();
});
```

### Ошибка: "Cannot find module"
```bash
npm install
npx jest --clearCache
```

### Тесты зависают
```bash
# Запустить с таймаутом
npx jest --testTimeout=10000

# Найти открытые соединения
npm run test:verbose
```

---

## Быстрая статистика

```bash
# Количество тестовых файлов
find src -name "*.test.ts" | wc -l

# Количество тестов (приблизительно)
grep -r "it(" src/**/*.test.ts | wc -l

# Размер coverage директории
du -sh coverage

# Список всех тестовых файлов
find src -name "*.test.ts" -type f
```

---

## Quick Start

```bash
# 1. Установить зависимости
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest

# 2. Создать тестовую БД
npm run db:test:setup

# 3. Запустить тесты
npm run test:auth
```

---

## Полезные алиасы для .bashrc / .zshrc

```bash
# Добавить в ~/.bashrc или ~/.zshrc
alias test-all='npm run test:all'
alias test-auth='npm run test:auth'
alias test-cover='npm run test:coverage'
alias test-watch='npm run test:watch'
alias db-reset='npm run db:test:reset'
```

После добавления:
```bash
source ~/.bashrc  # или source ~/.zshrc
test-auth         # Теперь можно использовать алиас!
```


01.01.2026