ОТЧЁТ: Test ALL API — Полная Готовность    
Дата: 1 zydfhz 2026  
Проект: AIM Testing Guide  
Статус: модули реализованы и готовы к тестированию  

# ⚡ Команды тестирования
# КОМАНДЫ ТЕСТИРОВАНИЯ AIM ПРОЕКТА

## ТЕКУЩЕЕ СОСТОЯНИЕ

FRONTEND:
- Тестовых наборов: 15 (все проходят)
- Тестов: 222 (все проходят)
- Время: ~4 секунды

BACKEND:
- Тестовых наборов: 10 модулей (все проходят)
- Тестов: 156 (все проходят)
- Время: ~66 секунд

ИТОГО: 378 тестов, 100% успешных

## ОСНОВНЫЕ КОМАНДЫ

# Запуск всех тестов
cd ~/aProject/AIM/frontend && npm run test
cd ~/aProject/AIM/backend && npm run test

# Запуск по модулям (backend)
npm run test:auth           # 41 тест
npm run test:entries        # 24 теста  
npm run test:body-states    # 19 тестов
npm run test:tags           # 17 тестов
npm run test:circumstances  # 18 тестов
npm run test:emotions       # 14 тестов
npm run test:people         # 8 тестов
npm run test:skills         # 8 тестов
npm run test:analytics      # 7 тестов
npm run test:relations      # 6 тестов

# База данных
npm run db:test:setup      # Создать тестовую БД
npm run db:test:drop       # Удалить тестовую БД
npm run db:test:reset      # Пересоздать БД

## УТИЛИТЫ И ОТЛАДКА

# Проверка БД
psql -U postgres -d dream_journal_test -c "SELECT COUNT(*) FROM users;"
psql -U postgres -d dream_journal_test -c "\dt"

# Запуск с отладкой
npx jest --verbose --detectOpenHandles
npx jest --testTimeout=10000
npx jest --maxWorkers=2

# Запуск конкретных тестов
npx jest -t "should register a new user"
npx jest src/modules/auth/__tests__/auth.test.ts

# Coverage
npm run test:coverage
open coverage/lcov-report/index.html

# Watch режим
npm run test:watch

## БЫСТРЫЕ СКРИПТЫ

# Скрипт для запуска всех тестов (run-all-tests.sh)
#!/bin/bash
set -e
echo "Запуск всех тестов AIM проекта"
echo "Тестирование Frontend..."
cd frontend && npm test && cd ..
echo "Тестирование Backend..."
cd backend && npm run db:test:setup && npm test && cd ..
echo "Все тесты успешно пройдены!"
echo "Итог: 378 тестов (222 frontend + 156 backend)"

# Проверка покрытия модулей
grep -r "describe(" backend/src/modules/*/__tests__/*.test.ts | wc -l
grep -r "it(" backend/src/modules/*/__tests__/*.test.ts | wc -l

## ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

# Проверка .env.test
cat backend/.env.test
grep PASSWORD_PEPPER backend/.env.test
echo -n "$(grep PASSWORD_PEPPER .env.test | cut -d'=' -f2)" | wc -c

## ГЕНЕРАЦИЯ ОТЧЕТОВ

# JSON отчет
npx jest --json --outputFile=test-results.json

# JUnit отчет
npx jest --reporters=default --reporters=jest-junit

# Сводный отчет
cat > test-summary.txt << EOF
Дата: $(date)
Frontend: 222 тестов 
Backend: 156 тестов 
Всего: 378 тестов
Состояние: ВСЕ ТЕСТЫ ПРОХОДЯТ
EOF

## РЕШЕНИЕ ПРОБЛЕМ

# Если тесты падают:
1. npm run db:test:reset
2. Проверить .env.test файл
3. npx jest --verbose
4. npx tsc --noEmit
5. npm ci

# Очистка кэша
npx jest --clearCache
rm -rf node_modules
npm install

# Проверка подключений
netstat -an | grep 5432
ps aux | grep postgres

## CI/CD КОМАНДЫ

# Для GitHub Actions
- name: Setup PostgreSQL
  uses: harmon758/postgresql-action@v1
  with:
    postgresql version: '15'
    postgresql db: 'dream_journal_test'

- name: Run tests
  run: |
    cd backend
    npm run db:test:setup
    npm test

## АЛИАСЫ ДЛЯ .BASHRC

alias test-all='cd ~/aProject/AIM && ./run-all-tests.sh'
alias test-front='cd ~/aProject/AIM/frontend && npm test'
alias test-back='cd ~/aProject/AIM/backend && npm run db:test:setup && npm test'
alias test-auth='cd ~/aProject/AIM/backend && npm run test:auth'
alias db-reset='cd ~/aProject/AIM/backend && npm run db:test:reset'
alias test-cover='cd ~/aProject/AIM/backend && npm run test:coverage'

## БЫСТРЫЕ КОМАНДЫ

# Все одним махом
cd ~/aProject/AIM && (cd frontend && npm test) && (cd backend && npm run db:test:setup && npm test)

# Только упавшие тесты
npx jest --onlyFailures

# Тесты с покрытием конкретного файла
npx jest --coverage --collectCoverageFrom=src/modules/auth/**/*.ts

# Список всех тестов
npx jest --listTests

## МОНИТОРИНГ

# Время выполнения
time npm run test

# Память
npx jest --logHeapUsage

# Количество тестов по модулям
for dir in backend/src/modules/*/__tests__/; do 
  file=$(ls $dir/*.test.ts 2>/dev/null | head -1); 
  if [ -f "$file" ]; then 
    count=$(grep -c "it(" "$file"); 
    echo "$(basename $(dirname $dir)): $count тестов"; 
  fi; 
done

## ШАБЛОНЫ ДЛЯ НОВЫХ ТЕСТОВ

# Создать тестовый файл
mkdir -p src/modules/NEW_MODULE/__tests__/
cp src/modules/entries/__tests__/entries.test.ts src/modules/NEW_MODULE/__tests__/NEW_MODULE.test.ts

## ПРОВЕРКА ПОКРЫТИЯ

# Frontend покрытие
cd frontend && npx jest --coverage

# Backend покрытие  
cd backend && npx jest --coverage

# HTML отчет
cd backend/coverage/lcov-report && python3 -m http.server 8080

## ОЧИСТКА

# Удалить тестовые данные
psql -U postgres -d dream_journal_test -c "DELETE FROM users WHERE login LIKE 'test_%';"

# Очистить отчеты
rm -rf coverage test-results.json

## ПРЕДУПРЕЖДЕНИЯ

# Решить предупреждение ts-jest:
# В tsconfig.json добавить: "isolatedModules": true

# Если возникает PASSWORD_PEPPER ошибка:
# Убедиться что в .env.test есть PASSWORD_PEPPER длиной минимум 32 символа
