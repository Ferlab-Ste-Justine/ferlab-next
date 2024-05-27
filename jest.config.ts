import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'node',
  preset: 'ts-jest',
  // preset: 'ts-jest/presets/default-esm',
  // automock: true,
  rootDir: './',
  modulePaths: ['<rootDir>'],
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
};

export default config;
