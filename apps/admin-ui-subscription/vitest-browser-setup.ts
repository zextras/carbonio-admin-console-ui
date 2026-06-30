/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'vitest-browser-react';

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

vi.stubGlobal('BASE_PATH', '');

import { resetMockWorker, startMockWorker, stopMockWorker, suppressLitDevModeWarning } from 'admin-ui-test-utils';

suppressLitDevModeWarning();

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

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

beforeAll(async () => {
  await startMockWorker({ onUnhandledRequest: 'error' });
});

beforeEach(() => {
  resetMockWorker();
});

afterAll(() => {
  stopMockWorker();
  vi.clearAllMocks();
  resetMockWorker();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetMockWorker();
});
