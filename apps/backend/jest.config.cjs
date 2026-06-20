module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@aura/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@aura/types$': '<rootDir>/../../packages/types/src/index.ts'
  },
  setupFiles: ['<rootDir>/tests/setup-env.cjs'],
  collectCoverageFrom: [
    'src/lib/crypto.ts',
    'src/lib/jwt.ts',
    'src/modules/auth/auth.schemas.ts',
    'src/http/middlewares/request-context.ts',
    'src/http/middlewares/authenticate.ts',
    'src/http/middlewares/error-handler.ts'
    ,'src/modules/executive/*.engine.ts'
    ,'src/modules/finance/financial-aggregator.service.ts'
    ,'src/modules/finance/finance.schemas.ts'
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80, statements: 80 },
  },
};
