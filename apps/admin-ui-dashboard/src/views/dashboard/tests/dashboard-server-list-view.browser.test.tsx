/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DashboardServerList } from '../dashboard-server-list-view';

const SERVER_VERSION = '25.1.0';

const mockServers = [
  {
    id: 'server-1',
    name: 'mailstore1.test.com',
    a: [
      { n: 'description', _content: 'Primary mailstore' },
      { n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' },
    ],
  },
  {
    id: 'server-2',
    name: 'mailstore2.test.com',
    a: [
      { n: 'description', _content: 'Secondary mailstore' },
      { n: 'zimbraServiceHostname', _content: 'mailstore2.test.com' },
    ],
  },
];

async function setupServerListTest(options?: {
  advanced?: boolean;
  servers?: typeof mockServers;
  goToMailStoreServerList?: () => void;
}) {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['mailstore-servers'], options?.servers ?? mockServers);
  queryClient.setQueryData(['advanced-supported'], {
    supported: options?.advanced ?? false,
  });

  const goToMailStoreServerList = options?.goToMailStoreServerList ?? vi.fn();

  await setupBrowserTest(
    <DashboardServerList
      goToMailStoreServerList={goToMailStoreServerList}
      serverVersion={SERVER_VERSION}
    />,
    { queryClient },
  );

  return { goToMailStoreServerList };
}

describe('DashboardServerList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Mailstores List title', async () => {
    await setupServerListTest();

    await expect.element(page.getByText('Mailstores List')).toBeVisible();
  });

  it('renders the go-to-mailstores button and fires callback on click', async () => {
    const goToMailStoreServerList = vi.fn();
    await setupServerListTest({ goToMailStoreServerList });

    const button = page.getByRole('button', { name: /Go to mailstores servers list/i });
    await expect.element(button).toBeVisible();
    await button.click();

    expect(goToMailStoreServerList).toHaveBeenCalledOnce();
  });

  it('renders server rows with name and description', async () => {
    await setupServerListTest();

    await expect.element(page.getByText('mailstore1.test.com')).toBeVisible();
    await expect.element(page.getByText('Primary mailstore')).toBeVisible();
    await expect.element(page.getByText('mailstore2.test.com')).toBeVisible();
    await expect.element(page.getByText('Secondary mailstore')).toBeVisible();
  });

  it('renders one version text per server in non-advanced mode', async () => {
    await setupServerListTest({ advanced: false });

    const versionTexts = page.getByText(SERVER_VERSION).all();
    expect(versionTexts).toHaveLength(2);
  });

  it('renders two version texts per server in advanced mode', async () => {
    await setupServerListTest({ advanced: true });

    const versionTexts = page.getByText(SERVER_VERSION).all();
    expect(versionTexts).toHaveLength(4);
  });

  it('renders table column headers', async () => {
    await setupServerListTest();

    await expect.element(page.getByText('Server name')).toBeVisible();
    await expect.element(page.getByText('Core Version')).toBeVisible();
    await expect.element(page.getByText('Description')).toBeVisible();
  });
});
