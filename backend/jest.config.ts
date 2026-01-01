// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Корневая директория
  rootDir: '.',
  
  // Директории где искать тесты
  roots: ['<rootDir>/src'],
  
  // Маппинг модулей
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Расширения файлов
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Трансформации
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        isolatedModules: true,
      }
    ],
  },
  
  // Паттерны поиска тестов
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts',
  ],
  
  // Игнорируемые пути
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  
  // Настройки покрытия
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
  ],
  
  coverageDirectory: 'coverage',
  
  // Глобальные настройки
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // Отображение результатов
  verbose: true,
  
  // Таймауты
  testTimeout: 10000,
  
  // Детектирование незакрытых соединений
  detectOpenHandles: true,
  forceExit: true,
  
  // Отчеты
  reporters: ['default'],
  
  // Игнорировать определенные ошибки
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
};

export default config;