// Integration tests — with test PostgreSQL database
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts', '**/tests/**/*.test.ts'],
  testPathIgnorePatterns: ['security/', 'dist/'],
  setupFiles: ['<rootDir>/src/__tests__/setup-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};

export default config;