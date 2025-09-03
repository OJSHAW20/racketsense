// jest.config.js
module.exports = {
    preset: 'jest-expo',
    transform: {
      '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    },
    testMatch: ['**/src/tests/**/*.(test|spec).(ts|tsx|js)'],
    setupFilesAfterEnv: [],
    // IMPORTANT: allow certain node_modules to be transformed by Babel
    transformIgnorePatterns: [
      'node_modules/(?!(react-native'
        + '|@react-native'
        + '|react-native-.*'
        + '|@react-native-community/.*'
        + '|expo(nent)?'
        + '|expo-modules-core'
        + '|@expo(nent)?/.*'
        + '|@expo/.*'
        + '|@expo/vector-icons'
        + '|@unimodules/.*'
        + '|unimodules'
        + '|sentry-expo'
        + '|nativewind'
        + '|d3-shape'
      + ')/)',
    ],
  };
  