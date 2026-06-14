import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  clearMocks: true,
  globalSetup: "<rootDir>/tests/integration/global-setup.cjs",
  globalTeardown: "<rootDir>/tests/integration/global-teardown.cjs",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/test/__mocks__/server-only.js",
  },
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/integration/**/*.integration.ts"],
  testTimeout: 60000,
};

export default createJestConfig(config);
