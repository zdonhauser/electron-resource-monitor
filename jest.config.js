export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@main/(.*)$': '<rootDir>/src/main/$1',
    '^@renderer/(.*)$': '<rootDir>/src/renderer/src/$1',
    '^@preload/(.*)$': '<rootDir>/src/preload/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testTimeout: 10000
}