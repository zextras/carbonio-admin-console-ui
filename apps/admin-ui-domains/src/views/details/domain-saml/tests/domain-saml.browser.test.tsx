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
import { page, userEvent } from 'vitest/browser';

import { DomainSaml } from '../../domain-saml';

const DOMAIN_ID = 'test-domain-id-saml';
const DOMAIN_NAME = 'example.com';
const SAML_URL = `/service/extension/zextras_admin/auth/saml/${DOMAIN_NAME}`;

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

function setupSamlDomain(
  samlConfig: Record<string, unknown> = { samlKey: 'samlValue' },
): ReturnType<typeof getQueryClient> {
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
  createBrowserAPIInterceptor('get', SAML_URL, () => HttpResponse.json(samlConfig));
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
  await expect.element(page.getByText(`SAML @${DOMAIN_NAME}`)).toBeVisible();
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
      await expect.element(page.getByRole('switch', { name: 'Allow Unsecure' })).toBeVisible();
      await expect
        .element(page.getByRole('textbox', { name: 'Import the SAML Metadata from the IDP' }))
        .toBeVisible();
    });

    it('should render the attributes table from the SAML config', async () => {
      await renderDomainSaml(queryClient);

      await expect.element(page.getByText('samlKey')).toBeVisible();
      await expect.element(page.getByText('samlValue')).toBeVisible();
    });

    it('should show the empty state when the SAML config has no attributes', async () => {
      queryClient = setupSamlDomain({});

      await renderDomainSaml(queryClient);

      await expect
        .element(
          page.getByText(
            'Please import some SAML Metadata in the field above to see its attributes',
          ),
        )
        .toBeVisible();
    });
  });

  describe('Banner', () => {
    it('should render the IDP banner with enabled copy buttons', async () => {
      await renderDomainSaml(queryClient);

      await expect.element(page.getByRole('button', { name: 'Entity ID' })).toBeEnabled();
      await expect.element(page.getByRole('button', { name: 'ServiceURL' })).toBeEnabled();
    });

    it('should hide the banner when the close button is clicked', async () => {
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: 'Close' }).click();

      await expect
        .element(page.getByText('Go to your IDP to configure your SAML'))
        .not.toBeInTheDocument();
    });
  });

  describe('Import', () => {
    it('should POST the metadata url with allowUnsecure and show a success snackbar', async () => {
      const importInterceptor = createBrowserAPIInterceptor('post', SAML_URL, () =>
        HttpResponse.json({}),
      );
      await renderDomainSaml(queryClient);

      await userEvent.fill(
        page.getByRole('textbox', { name: 'Import the SAML Metadata from the IDP' }),
        'https://idp.example.com/metadata',
      );
      await page.getByRole('switch', { name: 'Allow Unsecure' }).click();
      await page.getByRole('button', { name: /^import$/i }).click();

      const request = (await importInterceptor).getLastRequest();
      const requestUrl = new URL(request.url);
      expect(requestUrl.searchParams.get('url')).toBe('https://idp.example.com/metadata');
      expect(requestUrl.searchParams.get('allowUnsecure')).toBe('true');
      await expect.element(page.getByText('You have imported the configuration')).toBeVisible();
    });

    it('should show an error snackbar when the import fails', async () => {
      createBrowserAPIInterceptor('post', SAML_URL, () =>
        HttpResponse.json({ error: 'SAML import failed' }),
      );
      await renderDomainSaml(queryClient);

      await userEvent.fill(
        page.getByRole('textbox', { name: 'Import the SAML Metadata from the IDP' }),
        'https://idp.example.com/metadata',
      );
      await page.getByRole('button', { name: /^import$/i }).click();

      await expect.element(page.getByText('SAML import failed')).toBeVisible();
    });
  });

  describe('Generate certificate', () => {
    it('should POST to saml-generate and show a success snackbar', async () => {
      const generateInterceptor = createBrowserAPIInterceptor(
        'post',
        `/service/extension/zextras_admin/auth/saml-generate/${DOMAIN_NAME}`,
        () => HttpResponse.json({}),
      );
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: /generate sp certificate/i }).click();

      expect((await generateInterceptor).getCalledTimes()).toBe(1);
      await expect.element(page.getByText('You have generated the SP Certificate')).toBeVisible();
    });
  });

  describe('Export configuration', () => {
    it('should show success snackbar when EXPORT CONFIGURATION is clicked', async () => {
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: /export configuration/i }).click();

      await expect.element(page.getByText('You have exported the configuration')).toBeVisible();
    });
  });

  describe('Attribute operations', () => {
    it('should PUT a new attribute when ADD is clicked', async () => {
      const putInterceptor = createBrowserAPIInterceptor('put', SAML_URL, () =>
        HttpResponse.json({}),
      );
      await renderDomainSaml(queryClient);

      await userEvent.fill(
        page.getByRole('textbox', { name: 'Select an Attribute to show its value' }),
        'newAttr',
      );
      await userEvent.fill(
        page.getByRole('textbox', { name: 'The Attribute Value will be displayed here' }),
        'newValue',
      );
      await page.getByRole('button', { name: /^add$/i }).click();

      const body = await (await putInterceptor).getLastRequest().json();
      expect(body).toEqual({ newAttr: 'newValue' });
      await expect.element(page.getByText('You have added the newAttr attribute')).toBeVisible();
    });

    it('should select an attribute from the table into the inputs when its cell is clicked', async () => {
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: 'samlKey' }).click();

      await expect
        .element(page.getByRole('textbox', { name: 'Select an Attribute to show its value' }))
        .toHaveValue('samlKey');
      await expect
        .element(page.getByRole('textbox', { name: 'The Attribute Value will be displayed here' }))
        .toHaveValue('samlValue');
    });

    it('should PUT the selected attribute when UPDATE is clicked', async () => {
      const putInterceptor = createBrowserAPIInterceptor('put', SAML_URL, () =>
        HttpResponse.json({}),
      );
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: 'samlKey' }).click();
      await userEvent.fill(
        page.getByRole('textbox', { name: 'The Attribute Value will be displayed here' }),
        'updatedValue',
      );
      await page.getByRole('button', { name: /^update$/i }).click();

      const body = await (await putInterceptor).getLastRequest().json();
      expect(body).toEqual({ samlKey: 'updatedValue' });
      await expect.element(page.getByText('You have updated the samlKey attribute')).toBeVisible();
    });

    it('should DELETE the selected attribute when Remove is clicked', async () => {
      const deleteInterceptor = createBrowserAPIInterceptor('delete', SAML_URL, () =>
        HttpResponse.json({}),
      );
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: 'samlKey' }).click();
      await page.getByRole('button', { name: /^remove$/i }).click();

      const requestUrl = new URL((await deleteInterceptor).getLastRequest().url);
      expect(requestUrl.searchParams.get('keys')).toBe('samlKey');
      await expect.element(page.getByText('You have removed the samlKey attribute')).toBeVisible();
    });
  });

  describe('Delete configuration', () => {
    it('should DELETE the whole config without keys and show a success snackbar', async () => {
      const deleteInterceptor = createBrowserAPIInterceptor('delete', SAML_URL, () =>
        HttpResponse.json({}),
      );
      await renderDomainSaml(queryClient);

      await page.getByRole('button', { name: /delete configuration/i }).click();

      const requestUrl = new URL((await deleteInterceptor).getLastRequest().url);
      expect(requestUrl.searchParams.has('keys')).toBe(false);
      await expect.element(page.getByText('You have deleted the configuration')).toBeVisible();
    });
  });
});
