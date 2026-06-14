import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/app/api/**/*.{ts,tsx}",
    "src/lib/api/**/*.{ts,tsx}",
    "!src/app/api/docs/route.ts",
  ],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: [
    ["text", { maxCols: 80 }],
    "lcov",
    "json",
    "clover",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^server-only$": "<rootDir>/test/__mocks__/server-only.js",
  },
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.test.ts",
    "<rootDir>/tests/**/*.test.ts",
  ],
};

export default createJestConfig(config);
