/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { server } from 'admin-ui-test-utils';
import { cleanup } from '@testing-library/react';
import { noop } from 'lodash-es';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

// Mock localStorage for jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
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
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

window.matchMedia = function matchMedia(query: string): MediaQueryList {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: noop, // Deprecated
    removeListener: noop, // Deprecated
    addEventListener: noop,
    removeEventListener: noop,
    dispatchEvent: (): boolean => true,
  };
};

// IntersectionObserver mock
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(function intersectionObserverMock() {
    return {
      observe: noop,
      unobserve: noop,
      disconnect: noop,
    };
  }),
);

// ResizeObserver mock
vi.stubGlobal(
  'ResizeObserver',
  vi.fn(function ResizeObserverMock() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
);

// resizeTo mock
window.resizeTo = function resizeTo(width, height): void {
  Object.assign(this, {
    innerWidth: width,
    innerHeight: height,
    outerWidth: width,
    outerHeight: height,
  }).dispatchEvent(new this.Event('resize'));
};

window.fetch = require('node-fetch');

beforeEach(() => {
  // cleanup local storage
  window.localStorage.clear();
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  cleanup();
  server.events.removeAllListeners();
  server.resetHandlers();
});
