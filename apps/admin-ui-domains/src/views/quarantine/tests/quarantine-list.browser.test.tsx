/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { QueryClient } from '@tanstack/react-query';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import QuarantineList from '../quarantine-list';

function setupQuarantineTest(
  configData: Array<{ n: string; _content: string }> = [],
): QueryClient {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['all-config'], configData);
  return queryClient;
}

describe('QuarantineList', () => {
  describe('Initial rendering', () => {
    it('should render quarantine title', async () => {
      const queryClient = setupQuarantineTest();
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect.element(page.getByRole('heading', { name: 'Quarantine' })).toBeVisible();
    });

    it('should show create account button when no quarantine account configured', async () => {
      const queryClient = setupQuarantineTest([
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect
        .element(page.getByText('CREATE A QUARANTINE ACCOUNT'))
        .toBeVisible();
    });

    it('should show message about no quarantine account', async () => {
      const queryClient = setupQuarantineTest([
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect
        .element(
          page.getByText(/There is not quarantine account in any of the domains/),
        )
        .toBeVisible();
    });
  });

  describe('With quarantine account', () => {
    it('should show quarantine account name when configured', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: { m: [] } },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect
        .element(page.getByText('virus-quarantine@test.com'))
        .toBeVisible();
    });

    it('should show delete and recreate button when account exists', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: { m: [] } },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect
        .element(page.getByText('DELETE AND RE-CREATE QUARANTINE ACCOUNT'))
        .toBeVisible();
    });

    it('should show refresh list button', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: { m: [] } },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect.element(page.getByText('REFRESH LIST')).toBeVisible();
    });

    it('should show settings section', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: { m: [] } },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect.element(page.getByText('Settings')).toBeVisible();
      await expect.element(page.getByText('Messages')).toBeVisible();
    });

    it('should show retention period value', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: { m: [] } },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect.element(page.getByText('Retention Period (value)')).toBeVisible();
      await expect.element(page.getByText('7')).toBeVisible();
      await expect.element(page.getByText('Days')).toBeVisible();
    });
  });

  describe('Empty message list', () => {
    it('should show empty state when no messages', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: {} },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await expect.element(page.getByText('This list is empty.')).toBeVisible();
    });
  });

  describe('Delete and recreate modal', () => {
    it('should open delete modal when clicking delete button', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: {} },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      const deleteButton = page.getByText('DELETE AND RE-CREATE QUARANTINE ACCOUNT');
      await expect.element(deleteButton).toBeVisible();
      await userEvent.click(deleteButton);

      await expect
        .element(
          page.getByText('Are you sure you want to delete and re-create quarantine account?'),
        )
        .toBeVisible();
    });

    it('should close modal when clicking keep it button', async () => {
      createBrowserSoapAPIInterceptor('GetAccount', {
        account: [
          {
            id: 'quarantine-acc-id',
            name: 'virus-quarantine@test.com',
            a: [{ n: 'zimbraMailMessageLifetime', _content: '7d' }],
          },
        ],
      });
      createBrowserSoapAPIInterceptor('Search', {
        Body: { SearchResponse: {} },
      });

      const queryClient = setupQuarantineTest([
        { n: 'zimbraAmavisQuarantineAccount', _content: 'virus-quarantine@test.com' },
        { n: 'zimbraDefaultDomainName', _content: 'test.com' },
      ]);
      setupBrowserTest(<QuarantineList />, { queryClient });

      await userEvent.click(page.getByText('DELETE AND RE-CREATE QUARANTINE ACCOUNT'));

      await expect
        .element(page.getByText('Are you sure you want to delete and re-create quarantine account?'))
        .toBeVisible();

      await userEvent.click(page.getByText('NO, KEEP IT'));

      await expect
        .element(page.getByText('Are you sure you want to delete and re-create quarantine account?'))
        .not.toBeInTheDocument();
    });
  });
});
