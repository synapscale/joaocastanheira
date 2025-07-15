const nextJest = require('next/jest')

// Configuração personalizada do Next.js para Jest
const createJestConfig = nextJest({
  // Caminho para o app Next.js para carregar next.config.js e arquivos .env
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/__tests__/setup/env.js'
  ],
  globalSetup: '<rootDir>/__tests__/setup/globalSetup.js',
  globalTeardown: '<rootDir>/__tests__/setup/globalTeardown.js',
  
  // Configuração de detecção de vazamentos
  detectOpenHandles: true,
  detectLeaks: true,
  forceExit: true,
  
  // Configuração de timeout
  testTimeout: 30000,
  
  // Configuração de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/context/(.*)$': '<rootDir>/context/$1',
    '^@/hooks/(.*)$': '<rootDir>/hooks/$1',
    '^@/services/(.*)$': '<rootDir>/services/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/tests/(.*)$': '<rootDir>/tests/$1',
    '^@/__tests__/(.*)$': '<rootDir>/__tests__/$1',
    
    // Mocks para assets
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|webp)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(mp4|webm|ogg|mp3|wav|flac|aac)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(woff|woff2|ttf|eot)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Configuração de cobertura
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'context/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/.next/**'
  ],
  
  // Configuração de transformação
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  
  // Configuração de arquivos de teste
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{ts,tsx}',
    '<rootDir>/tests/**/*.{test,spec}.{ts,tsx}'
  ],
  
  // Ignorar arquivos
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Configuração de transformação de módulos
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.(mjs|jsx?|tsx?)$|@testing-library))'
  ],
  
  // Configuração de logs
  verbose: true,
  silent: false,
  
  // Configuração de workers para melhor performance
  maxWorkers: '50%',
  
  // Configuração de cache
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Configuração de thresholds de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Configuração de mock
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Configuração de erro handling
  errorOnDeprecated: true,
  
  // Configuração de modo watch
  watchPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/.jest-cache/'
  ]
}

// Cria configuração específica para diferentes tipos de teste
const createSpecificConfig = (testType) => {
  const baseConfig = { ...config }
  
  switch (testType) {
    case 'unit':
      return {
        ...baseConfig,
        displayName: 'Unit Tests',
        testMatch: ['**/__tests__/unit/**/*.(ts|tsx|js|jsx)', '**/*.unit.(test|spec).(ts|tsx|js|jsx)'],
        testTimeout: 5000
      }
      
    case 'integration':
      return {
        ...baseConfig,
        displayName: 'Integration Tests',
        testMatch: ['**/__tests__/integration/**/*.(ts|tsx|js|jsx)', '**/*.integration.(test|spec).(ts|tsx|js|jsx)'],
        testTimeout: 15000,
        setupFilesAfterEnv: [
          '<rootDir>/jest.setup.js',
          '<rootDir>/__tests__/setup/integration.setup.js'
        ]
      }
      
    case 'e2e':
      return {
        ...baseConfig,
        displayName: 'E2E Tests',
        testMatch: ['**/__tests__/e2e/**/*.(ts|tsx|js|jsx)', '**/*.e2e.(test|spec).(ts|tsx|js|jsx)'],
        testTimeout: 30000,
        setupFilesAfterEnv: [
          '<rootDir>/jest.setup.js',
          '<rootDir>/__tests__/setup/e2e.setup.js'
        ]
      }
      
    default:
      return baseConfig
  }
}

// Exporta a configuração padrão
module.exports = createJestConfig(config)

// Exporta também configurações específicas para diferentes tipos de teste
module.exports.createConfig = createSpecificConfig
module.exports.baseConfig = config
