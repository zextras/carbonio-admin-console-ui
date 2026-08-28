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
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainDisclaimer } from '../domain-disclaimer';

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

function renderDisclaimer(queryClient: ReturnType<typeof getQueryClient>): void {
  setupBrowserTest(<DomainDisclaimer />, {
    queryClient,
    initialRouterEntry: `/${DOMAIN_ID}/disclaimer`,
    withDomainIdRoute: true,
  });
}

describe('DomainDisclaimer', () => {
  describe('Rendering', () => {
    it('should render the Disclaimer header', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();
    });

    it('should render the Disclaimer switch', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect
        .element(page.getByRole('switch', { name: 'Enable disclaimers for this domain' }))
        .toBeVisible();
    });

    it('should render text in the TextArea from domain data', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect.element(page.getByRole('textbox')).toHaveValue('Sample disclaimer text');
    });

    it('should not show Save and Cancel when not dirty', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await expect.element(page.getByText('Disclaimer', { exact: true })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
    });
  });

  describe('Dirty state', () => {
    it('should show Save and Cancel after typing in the TextArea', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /^cancel$/i })).toBeVisible();
    });

    it('should show Save and Cancel after toggling the switch', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await page.getByRole('switch', { name: 'Enable disclaimers for this domain' }).click();
      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();
    });

    it('should revert changes and hide buttons when Cancel is clicked', async () => {
      renderDisclaimer(setupDisclaimerTest());
      await userEvent.fill(page.getByRole('textbox'), 'Discarded text');
      await page.getByRole('button', { name: /^cancel$/i }).click();
      await expect.element(page.getByRole('textbox')).toHaveValue('Sample disclaimer text');
      await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('should call ModifyDomain with disclaimer attributes when Save is clicked', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyDomainInterceptor) as any;
      expect(requestParams.id).toBe(DOMAIN_ID);
      const textAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraAmavisDomainDisclaimerText',
      );
      expect(textAttr._content).toBe('New disclaimer');
      const enabledAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraDomainMandatoryMailSignatureEnabled',
      );
      expect(enabledAttr._content).toBe('TRUE');
      const optionsAttr = requestParams.a.find(
        (attr: any) => attr.n === 'amavisDisclaimerOptions',
      );
      expect(optionsAttr._content).toBe(DOMAIN_NAME);
    });

    it('should send empty disclaimer attributes when the switch is toggled off', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      renderDisclaimer(setupDisclaimerTest());

      await page.getByRole('switch', { name: 'Enable disclaimers for this domain' }).click();
      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyDomainInterceptor) as any;
      const enabledAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraDomainMandatoryMailSignatureEnabled',
      );
      expect(enabledAttr._content).toBe('FALSE');
      const optionsAttr = requestParams.a.find(
        (attr: any) => attr.n === 'amavisDisclaimerOptions',
      );
      expect(optionsAttr._content).toBe('');
    });

    it('should normalize diacritics in the text disclaimer on save', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'Café');
      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyDomainInterceptor) as any;
      const textAttr = requestParams.a.find(
        (attr: any) => attr.n === 'zimbraAmavisDomainDisclaimerText',
      );
      expect(textAttr._content).toBe("Cafe'");
    });

    it('should show the success snackbar, refetch the domain and hide buttons after save', async () => {
      createBrowserSoapAPIInterceptor('ModifyDomain', {
        domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: [] }],
      });
      createBrowserSoapAPIInterceptor('FlushCache', {});
      const getDomainInterceptor = createBrowserSoapAPIInterceptor('GetDomain', {
        domain: [
          {
            name: DOMAIN_NAME,
            id: DOMAIN_ID,
            a: buildDisclaimerDomainAttributes([
              { n: 'zimbraAmavisDomainDisclaimerText', _content: 'New disclaimer' },
            ]),
          },
        ],
      });
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect
        .element(page.getByText('The change has been saved successfully'))
        .toBeVisible();
      await getDomainInterceptor;
      await expect.element(page.getByRole('textbox')).toHaveValue('New disclaimer');
      await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
    });

    it('should show an error snackbar and keep Save visible when ModifyDomain fails', async () => {
      worker.use(
        http.post('/service/admin/soap/ModifyDomainRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'Server error' } } } },
            { status: 500 },
          ),
        ),
      );
      renderDisclaimer(setupDisclaimerTest());

      await userEvent.fill(page.getByRole('textbox'), 'New disclaimer');
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect.element(page.getByText('Server error')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();
    });
  });
});
