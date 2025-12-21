"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = [
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('Отсутствуют обязательные переменные окружения:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\nСоздайте файл .env в корне проекта');
    process.exit(1);
}
console.log('Конфигурация базы данных:');
console.log(`   База данных: ${process.env.DB_NAME}`);
console.log(`   Пользователь: ${process.env.DB_USER}`);
console.log(`   Хост: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`);
exports.pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Настройки пула соединений
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // SSL только в production
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
});
// Мониторинг событий пула
exports.pool.on('connect', () => {
    console.log('Установлено новое соединение с базой данных');
});
exports.pool.on('error', (err) => {
    console.error('Ошибка пула соединений:', err.message);
});
// Функция для тестирования подключения при старте
const initializeDatabase = async () => {
    console.log('\nИнициализация подключения к базе данных...');
    let client;
    try {
        client = await exports.pool.connect();
        const result = await client.query('SELECT NOW() as time');
        console.log('База данных подключена успешно');
        console.log(`   Время сервера: ${result.rows[0].time}`);
        // Проверяем основные таблицы
        const tablesCheck = await client.query(`
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN ''
          ELSE ''
        END as users_table,
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'entries') THEN ''
          ELSE ''
        END as entries_table
    `);
        console.log(`   Таблица users: ${tablesCheck.rows[0].users_table}`);
        console.log(`   Таблица entries: ${tablesCheck.rows[0].entries_table}`);
        return true;
    }
    catch (error) {
        console.error('Не удалось подключиться к базе данных:');
        console.error(`   Ошибка: ${error.message}`);
        return false;
    }
    finally {
        if (client)
            client.release();
    }
};
exports.initializeDatabase = initializeDatabase;
