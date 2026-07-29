/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import DomainSaml from '../domain-saml';

const DOMAIN_ID = 'test-domain-id-saml';
const DOMAIN_NAME = 'example.com';

type DomainAttribute = { n: string; _content: string };

function buildDomainAttributes(overrides: Array<DomainAttribute> = []): Array<DomainAttribute> {
  const defaults: Array<DomainAttribute> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'zimbraDomainStatus', _content: 'active' },
    { n: 'zimbraPublicServiceProtocol', _content: 'https' },
    { n: 'zimbraPublicServiceHostname', _content: 'mail.example.com' },
    { n: 'zimbraPublicServicePort', _content: '443' },
  ];
  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

function setupSamlDomain(): ReturnType<typeof getQueryClient> {
  const domainAttributes = buildDomainAttributes();
  createBrowserSoapAPIInterceptor('GetDomain', {
    domain: [
      {
        name: DOMAIN_NAME,
        id: DOMAIN_ID,
        a: domainAttributes,
      },
    ],
  });
  createBrowserAPIInterceptor(
    'get',
    `/service/extension/zextras_admin/auth/saml/${DOMAIN_NAME}`,
    () => HttpResponse.json({ samlKey: 'samlValue' }),
  );
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  return queryClient;
}

async function renderDomainSaml(queryClient: ReturnType<typeof getQueryClient>): Promise<void> {
  await setupBrowserTest(<DomainSaml />, {
    queryClient,
    initialRouterEntry: `/${DOMAIN_ID}/saml`,
    withDomainIdRoute: true,
  });
  await expect.element(page.getByText('samlKey')).toBeVisible();
}

describe('DomainSaml', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(() => {
    queryClient = setupSamlDomain();
  });

  describe('Rendering', () => {
    it('should render the SAML header with the domain name', async () => {
      await renderDomainSaml(queryClient);

      await expect.element(page.getByText(`SAML @${DOMAIN_NAME}`)).toBeVisible();
    });

    it('should render the Configuration section and fields', async () => {
      await renderDomainSaml(queryClient);

      await expect.element(page.getByText('Configuration', { exact: true })).toBeVisible();
      await expect.element(page.getByText('Allow Unsecure')).toBeVisible();
      await expect.element(page.getByText('Import the SAML Metadata from the IDP')).toBeVisible();
    });
  });

  describe('Export configuration', () => {
    it('should show success snackbar when EXPORT CONFIGURATION is clicked', async () => {
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: /export configuration/i }).click();

      await expect.element(page.getByText('You have exported the configuration')).toBeVisible();
    });
  });
});
