/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import MTAStats from '../mta-stats';

function getAllServersWithMtaResponse() {
  return {
    server: [
      {
        id: 'server-1',
        name: 'mail1.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'mail1.test.com' }],
      },
      {
        id: 'server-2',
        name: 'mail2.test.com',
        a: [{ n: 'zimbraServiceHostname', _content: 'mail2.test.com' }],
      },
    ],
  };
}

function getMailQueueInfoResponse(serverName: string) {
  return {
    server: [
      {
        name: serverName,
        queue: [
          { name: 'active', n: '5' },
          { name: 'corrupt', n: '0' },
          { name: 'deferred', n: '12' },
          { name: 'hold', n: '1' },
          { name: 'incoming', n: '3' },
        ],
      },
    ],
  };
}

describe('MTAStats', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('renders the page title', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('Queue', { exact: true })).toBeVisible();
  });

  it('renders the status bar with Updated at and Status labels', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('Updated at', { exact: false })).toBeVisible();
    await expect.element(page.getByText('Status', { exact: false })).toBeVisible();
  });

  it('renders the Restart Scan and Flush queues buttons', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByRole('button', { name: 'Restart Scan' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Flush queues' })).toBeVisible();
  });

  it('renders the helper text for selecting a server', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('Select a mail server to see its stats')).toBeVisible();
  });

  it('renders the table headers', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse('mail1.test.com'));
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse('mail2.test.com'));

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('Mail Server', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Queued', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Corrupt', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Deferred', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Incoming', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Hold', { exact: true })).toBeVisible();
  });

  it('renders empty state when no servers are available', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('This list is empty.')).toBeVisible();
  });

  it('renders server data in the table after scan', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse('mail1.test.com'));
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse('mail2.test.com'));

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('mail1.test.com')).toBeVisible();
    await expect.element(page.getByText('mail2.test.com')).toBeVisible();
  });

  it('shows Scan Completed status after loading servers', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', getAllServersWithMtaResponse());
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse('mail1.test.com'));
    createBrowserSoapAPIInterceptor('GetMailQueueInfo', getMailQueueInfoResponse('mail2.test.com'));

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByText('Scan Completed')).toBeVisible();
  });

  it('disables buttons when no servers are available', async () => {
    createBrowserSoapAPIInterceptor('GetAllServers', { server: [] });

    await setupBrowserTest(<MTAStats />, { grantRights: 'config' });

    await expect.element(page.getByRole('button', { name: 'Restart Scan' })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Flush queues' })).toBeDisabled();
  });
}, 20_000);
