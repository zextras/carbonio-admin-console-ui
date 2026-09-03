/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { replaceHistory, useAppStore } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { ACCOUNTS, DOMAINS_ROUTE_ID, GENERAL_SETTINGS, MANAGE_APP_ID } from '../../../constants';
import { DomainSidebar } from '../domain-sidebar';

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

function setupGetDomainInterceptor(domain: DomainEntry): Promise<unknown> {
  return createBrowserSoapAPIInterceptor('GetDomain', {
    domain: [domain],
  });
}

const DOMAIN_ROUTE = `${MANAGE_APP_ID}/${DOMAINS_ROUTE_ID}`;
const DOMAIN_ID = 'domain-1';

describe('DomainSidebar', () => {
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
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
    });

    it('should render the Details section header', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should render manage items when a domain is selected', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Accounts')).toBeVisible();
      await expect.element(page.getByText('Distribution List')).toBeVisible();
      await expect.element(page.getByText('Resources')).toBeVisible();
    });

    it('should render detail items when a domain is selected', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('General Settings')).toBeVisible();
      await expect.element(page.getByText('Global Address List')).toBeVisible();
      await expect.element(page.getByText('Authentication', { exact: true })).toBeVisible();
    });

    it('should render the domain search input with selected-domain label', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByPlaceholder('I want to see this domain')).toBeVisible();
    });
  });

  describe('Section toggling', () => {
    it('should collapse manage items when Manage header is clicked', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Accounts')).toBeVisible();

      await page.getByText('Manage', { exact: true }).click();

      expect(page.getByText('Accounts').elements()).toHaveLength(0);
    });

    it('should collapse detail items when Details header is clicked', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('General Settings')).toBeVisible();

      await page.getByText('Details', { exact: true }).click();

      expect(page.getByText('General Settings').elements()).toHaveLength(0);
    });

    it('should restore detail items when Details header is clicked again', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Details', { exact: true }).click();
      expect(page.getByText('General Settings').elements()).toHaveLength(0);

      await page.getByText('Details', { exact: true }).click();
      await expect.element(page.getByText('General Settings')).toBeVisible();
    });

    it('should restore manage items when Manage header is clicked again', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Manage', { exact: true }).click();
      expect(page.getByText('Accounts').elements()).toHaveLength(0);

      await page.getByText('Manage', { exact: true }).click();
      await expect.element(page.getByText('Accounts')).toBeVisible();
    });
  });

  describe('Domain dropdown', () => {
    it('should show domain names when the search input is clicked', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByPlaceholder('I want to see this domain').click();

      await expect.element(page.getByText('example.com')).toBeVisible();
      await expect.element(page.getByText('corp.org')).toBeVisible();
      await expect.element(page.getByText('test.net')).toBeVisible();
    });

    it('should populate the input with the domain name when a domain is clicked', async () => {
      setupGetDomainInterceptor(DOMAINS[1]);

      await setupBrowserTest(<DomainSidebar />, {
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
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Global Address List').click();

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should keep the panel rendered after clicking a manage item', async () => {
      await setupBrowserTest(<DomainSidebar />, {
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

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Manage', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
    });

    it('should show the not-found message when search returns no results', async () => {
      setupSearchDirectoryInterceptor([]);

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect
        .element(page.getByText('Not found - check the text and try again'))
        .toBeVisible();
    });
  });

  describe('Global config', () => {
    it('should render the global config section with global items', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Global', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Administrators')).toBeVisible();
    });
  });

  describe('No domain selected', () => {
    it('should show the search input with no-domain label', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/global/settings`,
      });

      await expect
        .element(page.getByPlaceholder('Type the exact domain name'))
        .toBeVisible();
    });
  });

  describe('Domain overflow', () => {
    it('should show the overflow message when there are more than MAX_DOMAIN_DISPLAY domains', async () => {
      const manyDomains = Array.from({ length: 21 }, (_, i) =>
        buildDomain(`domain-${i}.com`, `overflow-domain-${i}`),
      );
      setupSearchDirectoryInterceptor(manyDomains);

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByPlaceholder('I want to see this domain').click();

      await expect
        .element(
          page.getByText(
            'So many domains! Which one would you like to see? Start typing to filter.',
          ),
        )
        .toBeVisible();
    });
  });

  describe('Global section toggling', () => {
    it('should collapse global items when Global header is clicked', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();

      await page.getByText('Global', { exact: true }).click();

      expect(page.getByText('Settings', { exact: true }).elements()).toHaveLength(0);
    });

    it('should restore global items when Global header is clicked again', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await page.getByText('Global', { exact: true }).click();
      expect(page.getByText('Settings', { exact: true }).elements()).toHaveLength(0);

      await page.getByText('Global', { exact: true }).click();
      await expect.element(page.getByText('Settings', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Administrators')).toBeVisible();
    });
  });

  describe('Domain search', () => {
    it('should populate the search input with the domain name on initial load', async () => {
      queryClient.setQueryData(['domain', 'by-id', DOMAIN_ID, 1], {
        id: DOMAIN_ID,
        name: 'example.com',
        a: [{ n: 'zimbraDomainName', _content: 'example.com' }],
      });

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      await expect
        .element(page.getByPlaceholder('I want to see this domain'))
        .toHaveValue('example.com');
    });

    it('should update the search input when typing', async () => {
      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      const input = page.getByPlaceholder('I want to see this domain');
      await input.fill('ex');

      await expect.element(input).toHaveValue('ex');
    });

    it('should replace typed text with domain name when selecting from dropdown', async () => {
      setupGetDomainInterceptor(DOMAINS[1]);

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/general_settings`,
      });

      const input = page.getByPlaceholder('I want to see this domain');
      await input.fill('ex');
      await expect.element(input).toHaveValue('ex');

      await input.click();
      await page.getByText('corp.org').click();

      await expect.element(input).toHaveValue('corp.org');
    });

    it('should clear the search input when no domain is selected', async () => {
      queryClient.setQueryData(['domain', 'by-id', DOMAIN_ID, 1], {
        id: DOMAIN_ID,
        name: 'example.com',
        a: [{ n: 'zimbraDomainName', _content: 'example.com' }],
      });

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/global/settings`,
      });

      await expect.element(page.getByPlaceholder('Type the exact domain name')).toHaveValue('');
    });

    it('should populate the input when the same domain is re-selected after returning to the global list', async () => {
      setupGetDomainInterceptor(DOMAINS[0]);

      await setupBrowserTest(<DomainSidebar />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ROUTE}/${DOMAIN_ID}/${GENERAL_SETTINGS}`,
      });

      const domainInput = page.getByPlaceholder('I want to see this domain');
      await expect.element(domainInput).toHaveValue('example.com');

      // Same as clicking "Domains" in the global section: leave the domain page
      replaceHistory('/global/domains');
      await expect
        .element(page.getByPlaceholder('Type the exact domain name'))
        .toHaveValue('');

      // Same as clicking the domain row in the table (global-domain-list.tsx)
      replaceHistory(`/${DOMAIN_ID}/${ACCOUNTS}`);

      await expect.element(domainInput).toHaveValue('example.com');
    });
  });
});
