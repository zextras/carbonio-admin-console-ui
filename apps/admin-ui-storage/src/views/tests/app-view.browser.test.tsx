/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  advancedSupportedApiForBrowser,
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DATA_VOLUMES, S3CONNECTOR_LIST, SERVERS_LIST } from '../../constants';
import { AppView } from '../app-view';

const SERVER_NAME = 'mailstore1.test.com';
const SERVER_ID = 'server-1';

const SERVERS = [
  {
    id: SERVER_ID,
    name: SERVER_NAME,
    a: [
      { n: 'zimbraServiceHostname', _content: SERVER_NAME },
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

const S3_BUCKETS = [
  {
    label: 'Production S3',
    bucketName: 'prod-bucket',
    storeType: 'S3',
    uuid: 'bucket-1',
    notes: 'Production bucket',
  },
];

const VOLUME_PRIMARIES = [
  {
    id: 1,
    name: 'message1',
    path: '/opt/zextras/store',
    compressed: true,
    threshold: 4096,
    totalSpace: 36846,
    availableSpace: 19308,
    storeType: 'LOCAL',
    isCurrent: true,
    type: 1,
    volumeType: 'primary',
  },
];

const VOLUME_INDEXES = [
  {
    id: 2,
    name: 'index1',
    path: '/opt/zextras/index',
    compressed: false,
    threshold: 4096,
    totalSpace: 36846,
    availableSpace: 19308,
    storeType: 'LOCAL',
    isCurrent: true,
    type: 10,
    volumeType: 'index',
  },
];

function setupInterceptors(): void {
	createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
	createBrowserSoapAPIInterceptor('GetAllConfig', {
		a: [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }],
	});
	createBrowserSoapAPIInterceptor('GetAllServers', { server: SERVERS });
	createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
		HttpResponse.json({ items: [] }),
	);

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as {
				Body?: { zextras?: { action?: string } };
			};
			const action = body?.Body?.zextras?.action;

			if (action === 'listS3Connector' || action === 'getHSMPolicy') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({ ok: true, response: { values: [] } }),
						},
					},
				});
			}

			if (action === 'getAllVolumes') {
				return HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({ ok: true, response: {} }),
						},
					},
				});
			}

			return HttpResponse.json({ Body: {} });
		}),
		http.get(
			'/service/extension/zextras_admin/core/getAllServers',
			() => HttpResponse.json({ items: [] }),
		),
	);
}

function setupListS3ConnectorInterceptor(): void {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as { Body?: { zextras?: { action?: string } } };
      const zextrasBody = body?.Body?.zextras;

      if (zextrasBody?.action === 'listS3Connector') {
        const values = S3_BUCKETS.map((bucket) => ({
          ...bucket,
          id: bucket.uuid,
        }));
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({
                ok: true,
                response: { values },
              }),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );
}

function setupGetAllVolumesCE(): void {
  createBrowserSoapAPIInterceptor('GetAllVolumes', {
    volume: [...VOLUME_PRIMARIES, ...VOLUME_INDEXES],
    _jsns: 'urn:zimbraAdmin',
  });
}

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
    await advancedSupportedApiForBrowser.withAdvancedNotSupported();
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('renders the breadcrumb on the index route', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/',
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('redirects the index route to servers_list', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/',
      queryClient,
    });

    await expect.element(page.getByLabelText('Search for a Server')).toBeInTheDocument();
    await expect.element(page.getByText(SERVER_NAME)).toBeVisible();
  });

  it('renders the list panel shell on the index route', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/',
      queryClient,
    });

    await expect.element(page.getByText('Global Servers', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Server Details', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Servers List', { exact: true })).toBeVisible();
  });

  it('renders the servers list route in the sidebar and detail panel', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: `/${SERVERS_LIST}`,
      queryClient,
    });

    await expect.element(page.getByText('Servers List', { exact: true })).toBeVisible();
    await expect.element(page.getByLabelText('Search for a Server')).toBeInTheDocument();
    await expect.element(page.getByText(SERVER_NAME)).toBeVisible();
  });

  describe('advanced routes', () => {
    beforeEach(async () => {
      await advancedSupportedApiForBrowser.withAdvancedSupported();
    });

    it('renders the S3 connectors route in the sidebar and detail panel', async () => {
      setupInterceptors();
      setupListS3ConnectorInterceptor();

      await setupBrowserTest(<AppView />, {
        initialRouterEntry: `/${S3CONNECTOR_LIST}`,
        queryClient,
      });

      await expect.element(page.getByText('S3 connectors', { exact: true })).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /create a new s3/i }))
        .toBeVisible();
    });

    it('renders the data volumes route for a selected server', async () => {
      setupInterceptors();
      setupGetAllVolumesCE();

      await setupBrowserTest(<AppView />, {
        initialRouterEntry: `/${SERVER_NAME}/${DATA_VOLUMES}`,
        queryClient,
      });

      await expect
        .element(page.getByPlaceholder('Select a Server'))
        .toHaveValue(SERVER_NAME);
      await expect
        .element(page.getByText(`${SERVER_NAME} Volumes`, { exact: true }))
        .toBeVisible();
    });
  });
});
