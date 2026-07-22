/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return { ...actual, replaceHistory: vi.fn() };
});

import { replaceHistory } from '@zextras/ui-shared';
import {
  advancedSupportedApiForBrowser,
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  registerAppRoute,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import {
  DATA_VOLUMES,
  HSM_SETTINGS,
  MANAGE_APP_ID,
  S3CONNECTOR_LIST,
  SERVERS_LIST,
  STORAGES_ROUTE_ID,
} from '../../../constants';
import { StorageSidebar } from '../../sidebar/storage-sidebar';

const mockedReplaceHistory = vi.mocked(replaceHistory);

const STORAGE_BASE = `/${MANAGE_APP_ID}/${STORAGES_ROUTE_ID}`;

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

function setupAllConfigInterceptor(): Promise<unknown> {
  return createBrowserSoapAPIInterceptor('GetAllConfig', {
    a: [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }],
  });
}

beforeEach(() => {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as {
        Body?: { zextras?: { action?: string } };
      };
      const action = body?.Body?.zextras?.action;
      const withContent = (payload: unknown) =>
        HttpResponse.json({
          Body: { response: { content: JSON.stringify(payload) } },
        });
      if (action === 'getLicenseInfo') {
        return withContent({ ok: true, response: { type: 'None', features: [] } });
      }
      if (action === 'getVersion') {
        return withContent({ ok: true, response: { version: '0.0.0' } });
      }
      if (action === 'listS3Connector') {
        return withContent({ ok: true, response: { values: [] } });
      }
      if (action === 'getHSMPolicy') {
        return withContent({ ok: true, response: { values: [] } });
      }
      if (action === 'getAllVolumes') {
        return withContent({ ok: true, response: { volumes: [] } });
      }
      return HttpResponse.json({ Body: {} });
    }),
    http.get('/service/extension/zextras_admin/core/getAllServers', () =>
      HttpResponse.json({ items: [] }),
    ),
    http.get('/services/catalog/services', () => HttpResponse.json({ items: [] })),
    http.post('/service/admin/soap/GetAllServersRequest', () =>
      HttpResponse.json({
        Body: { GetAllServersResponse: { server: SERVERS } },
      }),
    ),
  );
});

describe('S3ConnectorListPanel (browser)', () => {
  beforeEach(() => {
    registerAppRoute(STORAGES_ROUTE_ID, MANAGE_APP_ID);
  });

  describe('CE mode', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedNotSupported();
    });

    describe('Rendering', () => {
      it('should render the Global Servers section', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Global Servers', { exact: true })).toBeVisible();
      });

      it('should render the Server Details section', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Server Details', { exact: true })).toBeVisible();
      });

      it('should render the Servers List item', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Servers List', { exact: true })).toBeVisible();
      });

      it('should render the Select a Server dropdown', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByLabelText('Select a Server')).toBeInTheDocument();
      });

      it('should render the Data Volumes item', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Data Volumes', { exact: true })).toBeInTheDocument();
      });

      it('should not render the Bucket List item in CE mode', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Global Servers', { exact: true })).toBeVisible();
        expect(page.getByText('Bucket List', { exact: true }).elements()).toHaveLength(0);
      });

      it('should not render the HSM Settings item in CE mode', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Server Details', { exact: true })).toBeVisible();
        expect(page.getByText('HSM Settings', { exact: true }).elements()).toHaveLength(0);
      });
    });
  });

  describe('Advanced mode', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
    });

    describe('Rendering', () => {
      it('should render the S3 connectors item in advanced mode', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('S3 connectors', { exact: true })).toBeVisible();
      });

      it('should render the HSM Settings item in advanced mode', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('HSM Settings', { exact: true })).toBeInTheDocument();
      });

      it('should render both Global Servers and Server Details sections', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Global Servers', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Server Details', { exact: true })).toBeVisible();
      });

      it('should render all navigation items in advanced mode', async () => {
        setupGetAllServersInterceptor();
        setupAllConfigInterceptor();
        await setupBrowserTest(<StorageSidebar />);
        await expect.element(page.getByText('Servers List', { exact: true })).toBeVisible();
        await expect.element(page.getByText('S3 connectors', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Data Volumes', { exact: true })).toBeInTheDocument();
        await expect.element(page.getByText('HSM Settings', { exact: true })).toBeInTheDocument();
      });
    });
  });
});

describe('S3ConnectorListPanel navigation', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    localStorage.clear();
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
    await advancedSupportedApiForBrowser.withAdvancedSupported();
    setupGetAllServersInterceptor();
    setupAllConfigInterceptor();
    createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  });

  afterEach(() => {
    mockedReplaceHistory.mockClear();
  });

  it('navigates to /s3connector_list when clicking the S3 connectors item', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/${SERVERS_LIST}`,
      queryClient,
    });

    await page.getByText('S3 connectors').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${S3CONNECTOR_LIST}`);
  });

  it('navigates to /servers_list when clicking the Servers List item', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/${S3CONNECTOR_LIST}`,
      queryClient,
    });

    await page.getByText('Servers List').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVERS_LIST}`);
  });

  it('navigates to server data volumes route when selecting a server from the dropdown', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/${SERVERS_LIST}`,
      queryClient,
    });

    const input = page.getByPlaceholder('Select a Server');
    await input.click();
    await input.fill('mailstore1');

    await page.getByText('mailstore1.test.com').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/mailstore1.test.com/${DATA_VOLUMES}`);
  });

  it('navigates back to servers_list when clearing the server search', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/mailstore1.test.com/${DATA_VOLUMES}`,
      queryClient,
    });

    await page.getByTestId('icon: CloseOutline').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/${SERVERS_LIST}`);
  });

  it('navigates to hsm_settings when clicking HSM Settings under a server route', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/mailstore1.test.com/${DATA_VOLUMES}`,
      queryClient,
    });

    await page.getByText('HSM Settings').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/mailstore1.test.com/${HSM_SETTINGS}`);
  });

  it('shows error message when server search has no matching results', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/${SERVERS_LIST}`,
      queryClient,
    });

    const input = page.getByPlaceholder('Select a Server');
    await input.click();
    await input.fill('xyznomatch');

    await expect.element(page.getByText(/Not found/i)).toBeVisible();
  });

  it('keeps the current server route on refresh without redirecting to servers_list', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/mailstore1.test.com/${HSM_SETTINGS}`,
      queryClient,
    });

    expect(mockedReplaceHistory).not.toHaveBeenCalledWith(`/${SERVERS_LIST}`);
  });

  it('populates the server search field from the URL on a server-specific route', async () => {
    await setupBrowserTest(<StorageSidebar />, {
      initialRouterEntry: `${STORAGE_BASE}/mailstore1.test.com/${HSM_SETTINGS}`,
      queryClient,
    });

    await expect
      .element(page.getByPlaceholder('Select a Server'))
      .toHaveValue('mailstore1.test.com');
  });
});
