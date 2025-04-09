import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest', // Use ts-jest to transpile TypeScript files
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Use the tsconfig.json file
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'], // Include ts/tsx extensions
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'], // Test file naming convention
};

export default config;
