// Unit tests only — no DB, no Redis, only pure logic
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/security/**/__tests__/**/*.ts', '**/security/tests/**/*.ts'],
  testPathIgnorePatterns: ['integration', 'e2e', 'dist/'],
};

export default config;