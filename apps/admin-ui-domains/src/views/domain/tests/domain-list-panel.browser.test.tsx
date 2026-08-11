/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppStore } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DOMAINS_ROUTE_ID, MANAGE_APP_ID } from '../../../constants';
import { DomainListPanel } from '../domain-list-panel';

type DomainEntry = {
  name: string;
  id: string;
  a: Array<{ n: string; _content: string }>;
};

function buildDomain(name: string, id: string): DomainEntry {
  return {
    name,
    id,
    a: [
      { n: 'zimbraDomainName', _content: name },
      { n: 'zimbraId', _content: id },
    ],
  };
}

const DOMAINS: Array<DomainEntry> = [
  buildDomain('example.com', 'domain-1'),
  buildDomain('corp.org', 'domain-2'),
  buildDomain('test.net', 'domain-3'),
];

function setupSearchDirectoryInterceptor(domains: Array<DomainEntry> = DOMAINS): Promise<unknown> {
  return createBrowserSoapAPIInterceptor('SearchDirectory', {
    domain: domains,
    searchTotal: domains.length,
    more: false,
  });
}

const DOMAIN_ROUTE = `${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`;
const DOMAIN_ID = 'domain-1';

describe('DomainListPanel', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    queryClient.setQueryData(['all-config'], [{ n: 'carbonioSendAnalytics', _content: 'FALSE' }]);
    await grantUserConfigRights(queryClient);
    useAppStore.getState().setters.addRoute({
      id: DOMAINS_ROUTE_ID,
      route: DOMAIN_ROUTE,
      app: MANAGE_APP_ID,
    } as any);
    setupSearchDirectoryInterceptor();
  });

  afterEach(() => {
    resetMockWorker();
    useAppStore.getState().setters.removeRoute(DOMAINS_ROUTE_ID);
  });

  describe('Rendering', () => {
    it('should render the Manage section header', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
    });

    it('should render the Details section header', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render manage items when a domain is selected', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Accounts')).toBeVisible();
      await expect.element(page.getByText('Distribution List')).toBeVisible();
      await expect.element(page.getByText('Resources')).toBeVisible();
    });

    it('should render detail items when a domain is selected', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('General Settings')).toBeVisible();
      await expect.element(page.getByText('Global Address List')).toBeVisible();
      await expect.element(page.getByText('Authentication', { exact: true })).toBeVisible();
    });

    it('should render the domain search input with selected-domain label', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByPlaceholder('I want to see this domain')).toBeVisible();
    });
  });

  describe('Section toggling', () => {
    it('should collapse manage items when Manage header is clicked', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Accounts')).toBeVisible();

      await page.getByText('Manage', { exact: true }).click();

      expect(page.getByText('Accounts').elements()).toHaveLength(0);
    });

    it('should collapse detail items when Details header is clicked', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('General Settings')).toBeVisible();

      await page.getByText('Details', { exact: true }).click();

      expect(page.getByText('General Settings').elements()).toHaveLength(0);
    });

    it('should restore detail items when Details header is clicked again', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Details', { exact: true }).click();
      expect(page.getByText('General Settings').elements()).toHaveLength(0);

      await page.getByText('Details', { exact: true }).click();
      await expect.element(page.getByText('General Settings')).toBeVisible();
    });
  });

  describe('Domain dropdown', () => {
    it('should show domain names when the search input is clicked', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByPlaceholder('I want to see this domain').click();

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect.element(page.getByText('corp.org')).toBeVisible();
      await expect.element(page.getByText('test.net')).toBeVisible();
    });

    it('should populate the input with the domain name when a domain is clicked', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByPlaceholder('I want to see this domain').click();
      await page.getByText('corp.org').click();

      await expect
        .element(page.getByPlaceholder('I want to see this domain'))
        .toHaveValue('corp.org');
    });
  });

  describe('Navigation', () => {
    it('should keep the panel rendered after clicking a detail item', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Global Address List').click();

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should keep the panel rendered after clicking a manage item', async () => {
      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Accounts').click();

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });
  });

  describe('Empty domain list', () => {
    it('should still render panel sections when no domains are returned', async () => {
      setupSearchDirectoryInterceptor([]);

      await setupBrowserTest(<DomainListPanel />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });
  });
});
