/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'vitest-browser-react';

// Tailwind utilities for browser tests (no preflight, no global resets — see tailwind.css)
import './tailwind.css';

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

// IMPORTANT: Stub globals BEFORE importing anything that might use them
vi.stubGlobal('BASE_PATH', '');

import { resetMockWorker, startMockWorker } from './packages/test-utils/src/browser/worker';
import { suppressLitDevModeWarning } from './packages/test-utils/src/browser/utils/lit';
import { clearQueryClients } from './packages/test-utils/src/browser/utils/query-client-registry';

suppressLitDevModeWarning();

// Mock TinyMCE global object to prevent errors during module imports
vi.stubGlobal('tinymce', {
  PluginManager: {
    add: vi.fn(),
  },
  ThemeManager: {
    add: vi.fn(),
  },
  ModelManager: {
    add: vi.fn(),
  },
  IconManager: {
    add: vi.fn(),
  },
  init: vi.fn(),
  execCommand: vi.fn(),
  addI18n: vi.fn(),
  util: {
    Delay: {
      setEditorTimeout: vi.fn(),
    },
    Promise: {
      resolve: vi.fn((value) => Promise.resolve(value)),
    },
  },
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

beforeAll(async () => {
  await startMockWorker();
});

beforeEach(() => {
  resetMockWorker();
  localStorageMock.clear();
});

afterAll(() => {
  clearQueryClients();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});
