/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getGetInfoResponseMock,
  getQueryClient,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { useNavigate } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DomainPageHeader } from '../domain-page-header';

const DOMAIN_ID = 'domain-1';
const DOMAIN_NAME = 'example.com';
const OTHER_DOMAIN_ID = 'domain-2';
const OTHER_DOMAIN_NAME = 'other.example.com';
const GLOBAL_DOMAINS_PATH = '/manage/domains/global/domains';

function interceptHeaderApis(): void {
  createBrowserSoapAPIInterceptor('GetInfo', getGetInfoResponseMock());
  createBrowserAPIInterceptor('get', '/services/catalog/services', () =>
    HttpResponse.json({ items: [] }),
  );
}

function NavigationTrigger({ to, label }: { to: string; label: string }): React.ReactElement {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}>
      {label}
    </button>
  );
}

describe('DomainPageHeader', () => {
  afterEach(() => {
    resetMockWorker();
  });

  it('shows the domain name crumb and section menu when the domain is resolved', async () => {
    interceptHeaderApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
      id: DOMAIN_ID,
      name: DOMAIN_NAME,
    });

    await setupBrowserTest(<DomainPageHeader />, {
      initialRouterEntry: `/manage/domains/${DOMAIN_ID}/accounts`,
      queryClient,
    });

    await expect.element(page.getByText('Home').nth(0)).toBeVisible();
    await expect.element(page.getByText(DOMAIN_NAME, { exact: true }).first()).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Show sections' })).toBeVisible();
  });

  it('shows the breadcrumb skeleton while the domain name is unresolved', async () => {
    interceptHeaderApis();
    const queryClient = getQueryClient();

    await setupBrowserTest(<DomainPageHeader />, {
      initialRouterEntry: `/manage/domains/${DOMAIN_ID}/accounts`,
      queryClient,
    });

    // loading -> no crumb labels are rendered (skeleton instead)
    expect(page.getByText(DOMAIN_NAME, { exact: true }).elements()).toHaveLength(0);
    expect(page.getByText('Home').elements()).toHaveLength(0);
  });

  it('shows "Global" instead of the previous domain name after navigating back to the global route', async () => {
    interceptHeaderApis();
    const queryClient = getQueryClient();
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
      id: DOMAIN_ID,
      name: DOMAIN_NAME,
    });

    await setupBrowserTest(
      <>
        <DomainPageHeader />
        <NavigationTrigger to={GLOBAL_DOMAINS_PATH} label="Go to global domains" />
      </>,
      {
        initialRouterEntry: `/manage/domains/${DOMAIN_ID}/general_settings`,
        queryClient,
      },
    );
    await expect.element(page.getByText(DOMAIN_NAME, { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Go to global domains' }).click();

    await expect.element(page.getByText('Global', { exact: true }).first()).toBeVisible();
    expect(page.getByText(DOMAIN_NAME, { exact: true }).elements()).toHaveLength(0);
  });

  it('does not flash the previous domain name when navigating directly between two domains', async () => {
    interceptHeaderApis();
    const queryClient = getQueryClient();
    // The other domain's query has no active observer until navigation, so it
    // must survive the test client's default `gcTime: 0` garbage collection.
    queryClient.setDefaultOptions({ queries: { gcTime: Infinity } });
    queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
      id: DOMAIN_ID,
      name: DOMAIN_NAME,
    });
    queryClient.setQueryData(domainByIdKey(OTHER_DOMAIN_ID, 1), {
      id: OTHER_DOMAIN_ID,
      name: OTHER_DOMAIN_NAME,
    });

    await setupBrowserTest(
      <>
        <DomainPageHeader />
        <NavigationTrigger
          to={`/manage/domains/${OTHER_DOMAIN_ID}/general_settings`}
          label="Go to other domain"
        />
      </>,
      {
        initialRouterEntry: `/manage/domains/${DOMAIN_ID}/general_settings`,
        queryClient,
      },
    );
    await expect.element(page.getByText(DOMAIN_NAME, { exact: true }).first()).toBeVisible();

    await page.getByRole('button', { name: 'Go to other domain' }).click();

    await expect.element(page.getByText(OTHER_DOMAIN_NAME, { exact: true }).first()).toBeVisible();
    expect(page.getByText(DOMAIN_NAME, { exact: true }).elements()).toHaveLength(0);
  });
});
