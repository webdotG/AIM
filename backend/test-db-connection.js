const { Pool } = require('pg');

console.log('🔍 Тестируем подключение к PostgreSQL...');
console.log('========================================');

const config = {
  host: 'localhost',
  port: 5432,
  database: 'dream_journal',
  user: 'postgres',
  password: 'webdotgHOME2550',
  ssl: false
};

console.log('Конфигурация:');
console.log(`  Host: ${config.host}:${config.port}`);
console.log(`  Database: ${config.database}`);
console.log(`  User: ${config.user}`);
console.log(`  Password: ${config.password ? '***' + config.password.slice(-3) : 'not set'}`);

const pool = new Pool(config);

async function test() {
  let client;
  try {
    console.log('\n🔄 Подключаемся к базе данных...');
    client = await pool.connect();
    
    console.log('✅ Подключение успешно!');
    
    // Тест 1: Проверяем версию PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log(`\n📋 PostgreSQL версия: ${versionResult.rows[0].version.split('\n')[0]}`);
    
    // Тест 2: Проверяем время сервера
    const timeResult = await client.query('SELECT NOW() as server_time');
    console.log(`🕒 Время сервера: ${timeResult.rows[0].server_time}`);
    
    // Тест 3: Проверяем таблицы
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\n📊 Таблицы в базе (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });
    
    // Тест 4: Проверяем users таблицу
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Пользователей в системе: ${usersResult.rows[0].count}`);
    
    if (usersResult.rows[0].count > 0) {
      const sampleUsers = await client.query('SELECT id, login, created_at FROM users LIMIT 3');
      console.log('\nПримеры пользователей:');
      sampleUsers.rows.forEach(user => {
        console.log(`  - ${user.login} (ID: ${user.id}, создан: ${user.created_at.toISOString().split('T')[0]})`);
      });
    }
    
    console.log('\n========================================');
    console.log('🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
    console.log('========================================');
    
    client.release();
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ОШИБКА ПОДКЛЮЧЕНИЯ:');
    console.error(`   Сообщение: ${error.message}`);
    
    if (error.message.includes('password authentication')) {
      console.error('\n🔧 Возможные решения:');
      console.error('   1. Проверьте пароль пользователя postgres');
      console.error('   2. Проверьте настройки pg_hba.conf');
      console.error('   3. Убедитесь что БД dream_journal существует');
    }
    
    if (client) client.release();
    await pool.end();
    process.exit(1);
  }
}

test();
