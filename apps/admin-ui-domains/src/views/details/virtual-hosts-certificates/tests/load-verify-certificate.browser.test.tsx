/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupAccount,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { CertificateContextProvider } from '../certificate-context';
import { LoadAndVerifyCert } from '../load-verify-certificate';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

function setup(ui: ReactElement) {
  const queryClient = getQueryClient();
  setupAccount(queryClient);
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [
      { n: 'zimbraDomainName', _content: DOMAIN_NAME },
      { n: 'zimbraId', _content: DOMAIN_ID },
    ],
  });
  return setupBrowserTest(ui, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
}

function TestApp() {
  return (
    <CertificateContextProvider
      value={{
        isCertificateAvailable: false,
        domainId: DOMAIN_ID,
        domainName: DOMAIN_NAME,
      }}
    >
      <LoadAndVerifyCert setToggleWizardSection={vi.fn()} externalData={vi.fn()} />
    </CertificateContextProvider>
  );
}

async function fillCertificateFields(): Promise<void> {
  const certInput = page.getByRole('textbox').nth(0);
  const caChainInput = page.getByRole('textbox').nth(1);
  const privateKeyInput = page.getByRole('textbox').nth(2);

  await userEvent.type(certInput, '-----BEGIN CERTIFICATE-----');
  await userEvent.type(caChainInput, '-----BEGIN CA CHAIN-----');
  await userEvent.type(privateKeyInput, '-----BEGIN PRIVATE KEY-----');
}

describe('LoadAndVerifyCert (browser)', () => {
  describe('Rendering', () => {
    it('renders the Upload and Verify Certificate title', async () => {
      await setup(<TestApp />);

      await expect.element(page.getByText('Upload and Verify Certificate')).toBeVisible();
    });

    it('renders the Domain Certificate label', async () => {
      await setup(<TestApp />);

      await expect.element(page.getByText('Domain Certificate', { exact: true })).toBeVisible();
    });

    it('renders the Domain Certificate CA Chain label', async () => {
      await setup(<TestApp />);

      await expect
        .element(page.getByText('Domain Certificate CA Chain', { exact: true }))
        .toBeVisible();
    });

    it('renders the Domain Private Key label', async () => {
      await setup(<TestApp />);

      await expect.element(page.getByText('Domain Private Key', { exact: true })).toBeVisible();
    });

    it('renders the VERIFY button disabled when fields are empty', async () => {
      await setup(<TestApp />);

      await expect.element(page.getByRole('button', { name: /verify/i })).toBeDisabled();
    });
  });

  describe('Verify flow', () => {
    it('enables VERIFY button after filling all certificate fields', async () => {
      await setup(<TestApp />);
      await fillCertificateFields();

      await expect.element(page.getByRole('button', { name: /verify/i })).toBeEnabled();
    });

    it('shows loading state on VERIFY button after clicking with all fields filled', async () => {
      worker.use(
        http.post('/service/admin/soap/VerifyCertKeyRequest', async () => {
          await new Promise(() => {});
          return HttpResponse.json({ Body: { VerifyCertKeyResponse: {} } });
        }),
      );

      await setup(<TestApp />);
      await fillCertificateFields();

      const verifyBtn = page.getByRole('button', { name: /verify/i });
      await verifyBtn.click();

      await expect.element(page.getByRole('status')).toBeVisible();
    });

    it('uploads the certificate after a successful verification', async () => {
      await setup(<TestApp />);
      await fillCertificateFields();

      const verifyInterceptor = createBrowserSoapAPIInterceptor('VerifyCertKey', {
        verifyResult: true,
      });
      const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', { domain: [] });
      createBrowserSoapAPIInterceptor('FlushCache', {});

      await page.getByRole('button', { name: /verify/i }).click();

      await verifyInterceptor;
      await modifyInterceptor;
      await expect
        .element(page.getByText(/certificate is valid|certificates have been saved/i))
        .toBeVisible();
    });

    it('shows an error snackbar and does not stay loading when VerifyCertKey fails', async () => {
      worker.use(
        http.post('/service/admin/soap/VerifyCertKeyRequest', () =>
          HttpResponse.json(
            { Body: { Fault: { Reason: { Text: 'VerifyCertKey failed' } } } },
            { status: 500 },
          ),
        ),
      );

      await setup(<TestApp />);
      await fillCertificateFields();
      await page.getByRole('button', { name: /verify/i }).click();

      await expect.element(page.getByText('VerifyCertKey failed')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /verify/i })).toBeEnabled();
    });
  });
});
