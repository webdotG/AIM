const { Pool } = require('pg');

console.log('Testing PostgreSQL authentication methods...\n');

const configs = [
  { 
    name: 'TCP with password',
    host: 'localhost', 
    port: 5432,
    database: 'dream_journal',
    user: 'postgres',
    password: 'password'
  },
  { 
    name: 'Unix socket (no host/port)',
    database: 'dream_journal',
    user: 'postgres',
    password: 'password'
  }
];

async function testConfig(config) {
  console.log(`Testing: ${config.name}`);
  console.log('Config:', JSON.stringify(config, null, 2));
  
  try {
    const pool = new Pool(config);
    const client = await pool.connect();
    const result = await client.query('SELECT current_user, version() as pg_version');
    
    console.log('✅ Success!');
    console.log(`  User: ${result.rows[0].current_user}`);
    console.log(`  PostgreSQL: ${result.rows[0].pg_version.split('\n')[0]}`);
    
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
  console.log('---\n');
}

async function runAllTests() {
  for (const config of configs) {
    await testConfig(config);
    console.log('\n');
  }
}

runAllTests();
