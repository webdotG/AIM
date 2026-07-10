#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: process.env.DB_USER || 'test',
    password: process.env.DB_PASSWORD || 'test',
    database: process.env.DB_NAME_TEST || 'lifegraph_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
  });

  try {
    await client.connect();
    console.log('[Migrate] Connected to test database');

    // Apply extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis');
    await client.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
    console.log('[Migrate] Extensions created');

    // Read and apply migrations
    const migrationsDir = path.join(__dirname, '..', 'db', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await client.query(sql);
      console.log(`[Migrate] Applied: ${file}`);
    }

    console.log('[Migrate] All migrations applied successfully');
  } catch (err) {
    console.error('[Migrate] Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();