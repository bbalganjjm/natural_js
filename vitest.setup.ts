// Vitest setup file
// This file runs before each test file

// Add any global test utilities or mocks here
import { afterEach, beforeEach, vi } from 'vitest';

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});

// Global test utilities
declare global {
  // Add any global test utilities here
}

export {};

