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
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { MANAGE_APP_ID, MTA_ROUTE_ID, MTA_SERVER_GENERAL } from '../../../constants';
import MTAListPanel from '../mta-list-panel';

const mockedReplaceHistory = vi.mocked(replaceHistory);

const MTA_BASE = `/${MANAGE_APP_ID}/${MTA_ROUTE_ID}`;

function setupInterceptors(): void {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAllConfig', { a: [] });
  createBrowserSoapAPIInterceptor('GetAllServers', {
    server: [
      {
        id: 'server-1',
        name: 'mail.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'mail.test.com' }],
      },
    ],
  });
}

describe('MTAListPanel navigation', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
    setupInterceptors();
  });

  afterEach(() => {
    resetMockWorker();
    mockedReplaceHistory.mockClear();
  });

  it('navigates to /outbound_flow when clicking the Outbound Flow item', async () => {
    await setupBrowserTest(<MTAListPanel />, {
      initialRouterEntry: `${MTA_BASE}/general_lbl`,
      queryClient,
    });

    await page.getByText('Outbound Flow').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith('/outbound_flow');
  });

  it('navigates to /queue when clicking the Queue item', async () => {
    await setupBrowserTest(<MTAListPanel />, {
      initialRouterEntry: `${MTA_BASE}/general_lbl`,
      queryClient,
    });

    await page.getByText('Queue').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith('/queue');
  });

  it('navigates to /advanced when clicking the Advanced item', async () => {
    await setupBrowserTest(<MTAListPanel />, {
      initialRouterEntry: `${MTA_BASE}/general_lbl`,
      queryClient,
    });

    await page.getByText('Advanced').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith('/advanced');
  });

  it('navigates to server route when selecting a server from the dropdown', async () => {
    await setupBrowserTest(<MTAListPanel />, {
      initialRouterEntry: `${MTA_BASE}/general_lbl`,
      queryClient,
    });

    const input = page.getByPlaceholder('Select a Server');
    await input.click();
    await input.fill('mail');

    await page.getByText('mail.test.com').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/mail.test.com/${MTA_SERVER_GENERAL}`);
  });

  it('navigates back to default when clearing the server search', async () => {
    await setupBrowserTest(<MTAListPanel />, {
      initialRouterEntry: `${MTA_BASE}/general_lbl`,
      queryClient,
    });

    const input = page.getByPlaceholder('Select a Server');
    await input.click();
    await input.fill('mail');
    await page.getByText('mail.test.com').click();
    mockedReplaceHistory.mockClear();

    await page.getByTestId('icon: CloseOutline').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith('/general_lbl');
  });

  it('navigates to server general when clicking General under a server route', async () => {
    await setupBrowserTest(<MTAListPanel />, {
      initialRouterEntry: `${MTA_BASE}/mail.test.com/${MTA_SERVER_GENERAL}`,
      queryClient,
    });

    await page.getByText('General').click();

    expect(mockedReplaceHistory).toHaveBeenCalledWith(`/mail.test.com/${MTA_SERVER_GENERAL}`);
  });
});
