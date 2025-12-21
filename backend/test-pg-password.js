const { Pool } = require('pg');

console.log('Testing PostgreSQL connection with different passwords...\n');

const configs = [
  { 
    name: 'Empty password',
    host: 'localhost', 
    port: 5432,
    database: 'dream_journal',
    user: 'postgres',
    password: ''
  },
  { 
    name: 'Password "password"',
    host: 'localhost', 
    port: 5432,
    database: 'dream_journal',
    user: 'postgres',
    password: 'password'
  },
  { 
    name: 'No password field',
    host: 'localhost', 
    port: 5432,
    database: 'dream_journal',
    user: 'postgres'
  }
];

async function testConfig(config) {
  console.log(`Testing: ${config.name}`);
  
  try {
    const pool = new Pool(config);
    const client = await pool.connect();
    const result = await client.query('SELECT current_user');
    
    console.log(`✅ Success! Connected as: ${result.rows[0].current_user}`);
    
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
  let success = false;
  for (const config of configs) {
    if (await testConfig(config)) {
      success = true;
      console.log(`\n🎉 Working config: ${JSON.stringify(config, null, 2)}`);
      break;
    }
    console.log('\n');
  }
  
  if (!success) {
    console.log('\n🔧 Need to set PostgreSQL password. Run:');
    console.log('   sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD \'password\';"');
  }
}

runAllTests();
