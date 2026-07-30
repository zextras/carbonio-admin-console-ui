/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainDisclaimer from '../domain-disclaimer';

const DOMAIN_ID = 'test-domain-id-123';
const DOMAIN_NAME = 'example.com';

type DomainAttribute = { n: string; _content: string };

function buildDisclaimerDomainAttributes(
  overrides: Array<DomainAttribute> = [],
): Array<DomainAttribute> {
  const defaults: Array<DomainAttribute> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'TRUE' },
    { n: 'zimbraAmavisDomainDisclaimerText', _content: 'Sample disclaimer text' },
    { n: 'zimbraAmavisDomainDisclaimerHTML', _content: '<p>Sample HTML disclaimer</p>' },
  ];

  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

function setupDisclaimerTest(
  attributeOverrides: Array<DomainAttribute> = [],
): ReturnType<typeof getQueryClient> {
  const domainAttributes = buildDisclaimerDomainAttributes(attributeOverrides);
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  return queryClient;
}

describe('DomainDisclaimer', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  it('should render the Disclaimer header', async () => {
    queryClient = setupDisclaimerTest();
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();
  });

  it('should render the Disclaimer switch', async () => {
    queryClient = setupDisclaimerTest();
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Enable disclaimers for this domain')).toBeVisible();
  });

  it('should call ModifyDomain API when Save is clicked', async () => {
    const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
    });
    queryClient = setupDisclaimerTest();
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    const requestParams = (await modifyDomainInterceptor) as any;
    expect(requestParams.id).toBe(DOMAIN_ID);
    expect(requestParams.a).toBeDefined();
    const enabledAttr = requestParams.a.find(
      (attr: any) => attr.n === 'zimbraDomainMandatoryMailSignatureEnabled',
    );
    expect(enabledAttr).toBeDefined();
    expect(enabledAttr._content).toBe('TRUE');
  });

  it('should send empty disclaimer when disabled', async () => {
    const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
    });
    queryClient = setupDisclaimerTest([
      { n: 'zimbraDomainMandatoryMailSignatureEnabled', _content: 'FALSE' },
    ]);
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    const requestParams = (await modifyDomainInterceptor) as any;
    const enabledAttr = requestParams.a.find(
      (attr: any) => attr.n === 'zimbraDomainMandatoryMailSignatureEnabled',
    );
    expect(enabledAttr._content).toBe('FALSE');
  });

  it('should render text in the TextArea from domain data', async () => {
    queryClient = setupDisclaimerTest();
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();

    const textArea = page.getByRole('textbox');
    await expect.element(textArea).toHaveValue('Sample disclaimer text');
  });

  it('should update text when user types in TextArea', async () => {
    const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
    });
    queryClient = setupDisclaimerTest();
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();

    const textArea = page.getByRole('textbox');
    await userEvent.fill(textArea, 'New disclaimer');

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    const requestParams = (await modifyDomainInterceptor) as any;
    const textAttr = requestParams.a.find(
      (attr: any) => attr.n === 'zimbraAmavisDomainDisclaimerText',
    );
    expect(textAttr._content).toBe('New disclaimer');
  });

  it('should show success snackbar after save', async () => {
    createBrowserSoapAPIInterceptor('ModifyDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
    });
    queryClient = setupDisclaimerTest();
    setupBrowserTest(<DomainDisclaimer />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();
  });
});
