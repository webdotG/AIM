// E2E tests — real HTTP with Supertest
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/*.e2e.ts'],
};

export default config;