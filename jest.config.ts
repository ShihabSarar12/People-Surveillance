import { defaults } from 'jest-config';

export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
    testMatch: ['**/tests/**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    extensionsToTreatAsEsm: ['.ts'],
};
