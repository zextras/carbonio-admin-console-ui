/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import 'vitest-browser-react';

// Tailwind utilities for browser tests (no preflight, no global resets — see tailwind.css)
import './tailwind.css';

import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

// IMPORTANT: Stub globals BEFORE importing anything that might use them
vi.stubGlobal('BASE_PATH', '');

import {
  resetMockWorker,
  startMockWorker,
  stopMockWorker,
  worker,
} from './packages/test-utils/src/browser/worker';
import { suppressLitDevModeWarning } from './packages/test-utils/src/browser/utils/lit';

const zextrasContentResponse = (payload: unknown): HttpResponse =>
		HttpResponse.json({
			Body: {
				response: {
					content: JSON.stringify(payload),
				},
			},
		});

const zextrasSoapHandler = async ({ request }: { request: Request }): Promise<HttpResponse> => {
		const body = (await request.json()) as {
			Body?: { zextras?: { action?: string } };
		};
		const action = body?.Body?.zextras?.action;

		if (
			action === 'listS3Connector' ||
			action === 'getHSMPolicy' ||
			action === 'listBuckets'
		) {
			return zextrasContentResponse({ ok: true, response: { values: [] } });
		}

		if (action === 'getAllVolumes') {
			return zextrasContentResponse({ ok: true, response: {} });
		}

		if (action === 'get_global_config') {
			return zextrasContentResponse({ ok: true, response: { values: [] } });
		}

		return HttpResponse.json({ Body: {} });
	};

function setupBrowserCatchAllHandlers(): void {
	worker.use(
		http.post('/service/admin/soap/zextras', zextrasSoapHandler),
		http.post('/service/admin/soap', zextrasSoapHandler),
		http.get(
			'/service/extension/zextras_admin/core/getAllServers',
			() => HttpResponse.json({ items: [] }),
		),
		http.get('/services/catalog/services', () => HttpResponse.json({ items: [] })),
		http.post('/service/admin/soap/GetAllServersRequest', () =>
			HttpResponse.json({ Body: { GetAllServersResponse: { server: [] } } }),
		),
		http.post('/service/admin/soap/GetInfoRequest', () =>
			HttpResponse.json({ Body: { GetInfoResponse: {} } }),
		),
		http.post('/service/admin/soap/GetAllConfigRequest', () =>
			HttpResponse.json({ Body: { GetAllConfigResponse: {} } }),
		),
		http.post('/service/admin/soap/:api', () => HttpResponse.json({ Body: {} })),
	);
}

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
  await startMockWorker();
});

beforeEach(() => {
  resetMockWorker();
  setupBrowserCatchAllHandlers();
});

afterAll(() => {
  stopMockWorker();
  vi.clearAllMocks();
  resetMockWorker();
  setupBrowserCatchAllHandlers();
});

afterEach(() => {
  vi.unstubAllGlobals();
  resetMockWorker();
  setupBrowserCatchAllHandlers();
});
