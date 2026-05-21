/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import AppView from '../app-view';

function getAllConfigResponse() {
  return {
    a: [
      { n: 'zimbraMtaBlockedExtension', _content: 'exe' },
      { n: 'zimbraMtaSmtpdRejectUnlistedSender', _content: 'yes' },
      { n: 'zimbraMtaSmtpdRejectUnlistedRecipient', _content: 'no' },
      { n: 'zimbraMtaRestriction', _content: 'reject_unknown_client_hostname' },
      { n: 'carbonioSendAnalytics', _content: 'FALSE' },
    ],
  };
}

function setupInterceptors() {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserSoapAPIInterceptor('GetAllConfig', getAllConfigResponse());
  createBrowserSoapAPIInterceptor('GetAccount', {});
  createBrowserSoapAPIInterceptor('GetAllServers', {
    server: [
      {
        id: 'server-1',
        name: 'mail.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'mail.test.com' }],
      },
      {
        id: 'server-2',
        name: 'relay.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'relay.test.com' }],
      },
    ],
  });
}

describe('AppView', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights();
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('should render the Breadcrumb component', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/general_lbl',
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
  });

  it('should render the MTA list panel with all mail transfer agent options', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/general_lbl',
      queryClient,
    });

    await expect
      .element(page.getByText('Mail Transfer Agent (MTA)', { exact: true }))
      .toBeVisible();
    await expect.element(page.getByText('Inbound Flow & Security', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Postscreen Tuning', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Outbound Flow', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Antivirus & Antispam', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Advanced', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Queue', { exact: true })).toBeVisible();
  });

  it('should render the Single Server section', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/general_lbl',
      queryClient,
    });

    await expect.element(page.getByText('Single Server', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Select a Server')).toBeVisible();
  });

  it('should render the detail panel with Inbound Flow & Security on default route', async () => {
    setupInterceptors();

    await setupBrowserTest(<AppView />, {
      initialRouterEntry: '/general_lbl',
      queryClient,
    });

    await expect.element(page.getByText('Inbound Flow & Security', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();
  });
}, 20_000);
