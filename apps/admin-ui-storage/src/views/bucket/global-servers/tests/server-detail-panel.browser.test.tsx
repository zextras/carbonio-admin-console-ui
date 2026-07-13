/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  advancedSupportedApiForBrowser,
  createBrowserSoapAPIInterceptor,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ServerListPanel } from '../server-list-panel';

const SERVERS = [
  {
    id: 'server-1',
    name: 'mailstore1.test.com',
    a: [
      { n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' },
      { n: 'description', _content: 'Primary mailstore' },
    ],
  },
  {
    id: 'server-2',
    name: 'mailstore2.test.com',
    a: [
      { n: 'zimbraServiceHostname', _content: 'mailstore2.test.com' },
      { n: 'description', _content: 'Secondary mailstore' },
    ],
  },
];

function setupGetAllServersInterceptor(
  servers: Array<(typeof SERVERS)[number]> = SERVERS,
): Promise<unknown> {
  return createBrowserSoapAPIInterceptor('GetAllServers', {
    server: servers,
  });
}

function setupZextrasInterceptor(serverNames: Array<string> = SERVERS.map((s) => s.name)): void {
  const responseObj: Record<
    string,
    { response: { primaries: Array<string>; secondaries: Array<string>; indexes: Array<string> } }
  > = {};
  for (const name of serverNames) {
    responseObj[name] = {
      response: {
        primaries: ['vol1'],
        secondaries: ['vol2'],
        indexes: ['idx1'],
      },
    };
  }

  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as any;
      const zextrasBody = body?.Body?.zextras;
      if (zextrasBody?.action === 'getAllVolumes') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: responseObj,
              }),
            },
          },
        });
      }
      return HttpResponse.json({ Body: {} });
    }),
    http.get('/service/extension/zextras_admin/core/getAllServers', () =>
      HttpResponse.json({
        servers: serverNames.map((name) => ({
          [name]: {
            name,
            ZxPowerstore: {
              services: { 'indexer-manager': { running: true } },
              attributes: {
                powerstoreMoveScheduler: {
                  value: { 'cron-enabled': true },
                },
              },
            },
          },
        })),
      }),
    ),
  );
}

describe('ServerDetailPanel (browser)', () => {
  describe('CE mode', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedNotSupported();
    });

    describe('Rendering', () => {
      it('should render the Servers List title', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('Servers List', { exact: true })).toBeVisible();
      });

      it('should render the search input', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByLabelText('Search for a Server')).toBeInTheDocument();
      });
    });

    describe('Table headers', () => {
      it('should render the Server column header', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('Server', { exact: true })).toBeInTheDocument();
      });

      it('should render the Description column header', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect
          .element(page.getByText('Description', { exact: true }).first())
          .toBeInTheDocument();
      });

      it('should not render advanced-only column headers', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('Servers List', { exact: true })).toBeVisible();
        expect(page.getByText('Primary', { exact: true }).elements()).toHaveLength(0);
        expect(page.getByText('Secondary', { exact: true }).elements()).toHaveLength(0);
        expect(page.getByText('Index', { exact: true }).elements()).toHaveLength(0);
        expect(page.getByText('HSM Scheduling', { exact: true }).elements()).toHaveLength(0);
        expect(page.getByText('Indexer', { exact: true }).elements()).toHaveLength(0);
      });
    });

    describe('Server list with data', () => {
      it('should display server names', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('mailstore1.test.com')).toBeInTheDocument();
        await expect.element(page.getByText('mailstore2.test.com')).toBeInTheDocument();
      });

      it('should display server descriptions', async () => {
        setupGetAllServersInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('Primary mailstore')).toBeInTheDocument();
        await expect.element(page.getByText('Secondary mailstore')).toBeInTheDocument();
      });
    });

    describe('Empty state', () => {
      it('should show empty list message when no servers exist', async () => {
        setupGetAllServersInterceptor([]);
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
      });
    });
  });

  describe('Advanced mode', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
    });

    describe('Table headers', () => {
      it('should render all advanced column headers', async () => {
        setupGetAllServersInterceptor();
        setupZextrasInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('Server', { exact: true })).toBeInTheDocument();
        await expect.element(page.getByText('Primary', { exact: true })).toBeInTheDocument();
        await expect.element(page.getByText('Secondary', { exact: true })).toBeInTheDocument();
        await expect.element(page.getByText('Index', { exact: true })).toBeInTheDocument();
        await expect.element(page.getByText('HSM Scheduling', { exact: true })).toBeInTheDocument();
        await expect.element(page.getByText('Indexer', { exact: true })).toBeInTheDocument();
        await expect
          .element(page.getByText('Description', { exact: true }).first())
          .toBeInTheDocument();
      });
    });

    describe('Server list with data', () => {
      it('should display server names in advanced mode', async () => {
        setupGetAllServersInterceptor();
        setupZextrasInterceptor();
        await setupBrowserTest(<ServerListPanel />);
        await expect.element(page.getByText('mailstore1.test.com')).toBeInTheDocument();
        await expect.element(page.getByText('mailstore2.test.com')).toBeInTheDocument();
      });
    });
  });
});
