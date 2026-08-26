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
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { domainQueryKeys } from '../../../../../services/domain-query-keys';
import { DomainVirtualHosts } from '../domain-virtual-hosts';

const DOMAIN_ID = 'domain-123';
const DOMAIN_NAME = 'test-domain.com';

const mockCertDetails = {
  subject: 'CN=test-domain.com',
  issuer: 'CN=Test CA',
  notBefore: '2025-01-01',
  notAfter: '2026-01-01',
};

const domainAttributes = [
  { n: 'zimbraId', _content: DOMAIN_ID },
  { n: 'zimbraDomainName', _content: DOMAIN_NAME },
  { n: 'zimbraVirtualHostname', _content: 'virtual1.test-domain.com' },
  { n: 'zimbraVirtualHostname', _content: 'virtual2.test-domain.com' },
  { n: 'zimbraSSLCertificate', _content: 'certificate-content' },
  { n: 'zimbraSSLPrivateKey', _content: 'private-key-content' },
];

let queryClient: ReturnType<typeof getQueryClient>;

function setupQueries(options?: { withCert?: boolean }): void {
  const withCert = options?.withCert ?? true;
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  queryClient.setQueryData(
    domainQueryKeys.domainCert(DOMAIN_ID),
    withCert ? mockCertDetails : null,
  );
  queryClient.setQueryData(domainQueryKeys.domainSslMaterial(DOMAIN_NAME), {
    zimbraSSLCertificate: 'certificate-content',
    zimbraSSLPrivateKey: 'private-key-content',
  });
}

describe('DomainVirtualHosts (browser)', () => {
  beforeEach(() => {
    queryClient = getQueryClient();
    setupQueries();
    createBrowserSoapAPIInterceptor('GetDomainCert', {
      cert: [
        {
          subject: [{ _content: 'CN=test-domain.com' }],
          issuer: [{ _content: 'CN=Test CA' }],
          notBefore: [{ _content: '2025-01-01' }],
          notAfter: [{ _content: '2026-01-01' }],
        },
      ],
    });
    createBrowserSoapAPIInterceptor('GetDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: domainAttributes }],
    });
  });

  it('should render the main sections', async () => {
    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('Virtual Hosts')).toBeVisible();
  });

  it('should render virtual host items from domain data', async () => {
    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByText('virtual1.test-domain.com')).toBeVisible();
    await expect.element(page.getByText('virtual2.test-domain.com')).toBeVisible();
  });

  it('should not render Save and Cancel buttons initially', async () => {
    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    const saveButtons = page.getByRole('button', { name: /save/i }).elements();
    const cancelButtons = page.getByRole('button', { name: /cancel/i }).elements();

    expect(saveButtons).toHaveLength(0);
    expect(cancelButtons).toHaveLength(0);
  });

  it('should call ModifyDomain when a host is added and Save is clicked', async () => {
    const modifyInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: domainAttributes }],
    });
    createBrowserSoapAPIInterceptor('FlushCache', {});

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    const input = page.getByRole('textbox');
    await userEvent.fill(input, 'virtual3.test-domain.com');
    await userEvent.click(page.getByRole('button', { name: /^add$/i }));
    await page.getByRole('button', { name: /save/i }).click();

    const requestParams = (await modifyInterceptor) as {
      a?: Array<{ n: string; _content?: string }>;
    };
    const hosts = requestParams.a?.filter((attr) => attr.n === 'zimbraVirtualHostname') ?? [];
    expect(hosts.map((attr) => attr._content)).toContain('virtual3.test-domain.com');
  });

  it('should hide Save and Cancel after a successful save', async () => {
    const savedAttributes = [
      ...domainAttributes,
      { n: 'zimbraVirtualHostname', _content: 'virtual3.test-domain.com' },
    ];
    createBrowserSoapAPIInterceptor('ModifyDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: savedAttributes }],
    });
    createBrowserSoapAPIInterceptor('FlushCache', {});
    createBrowserSoapAPIInterceptor('GetDomain', {
      domain: [{ name: DOMAIN_NAME, id: DOMAIN_ID, a: savedAttributes }],
    });

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    const input = page.getByRole('textbox');
    await userEvent.fill(input, 'virtual3.test-domain.com');
    await userEvent.click(page.getByRole('button', { name: /^add$/i }));
    await page.getByRole('button', { name: /save/i }).click();

    await expect
      .element(page.getByText('The change has been saved successfully'))
      .toBeVisible();
    await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('should keep Save visible when ModifyDomain fails', async () => {
    worker.use(
      http.post('/service/admin/soap/ModifyDomainRequest', () =>
        HttpResponse.json(
          { Body: { Fault: { Reason: { Text: 'ModifyDomain failed' } } } },
          { status: 500 },
        ),
      ),
    );

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    const input = page.getByRole('textbox');
    await userEvent.fill(input, 'virtual3.test-domain.com');
    await userEvent.click(page.getByRole('button', { name: /^add$/i }));
    await page.getByRole('button', { name: /save/i }).click();

    await expect.element(page.getByText('ModifyDomain failed')).toBeVisible();
    await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  it('should show alert banner after certificate generation', async () => {
    createBrowserSoapAPIInterceptor('IssueCert', {});

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    await page.getByRole('button', { name: /generate certificate/i }).click();
    await page.getByRole('button', { name: /^generate$/i }).click();

    await expect
      .element(
        page.getByText('Processing. Results will be notified to global and domain recipients'),
      )
      .toBeVisible();
    await expect
      .element(page.getByText('The certificate will be available once the proxy is restarted'))
      .toBeVisible();
  });

  it('should show an error snackbar when IssueCert fails', async () => {
    worker.use(
      http.post('/service/admin/soap/IssueCertRequest', () =>
        HttpResponse.json(
          { Body: { Fault: { Reason: { Text: 'IssueCert failed' } } } },
          { status: 500 },
        ),
      ),
    );

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    await page.getByRole('button', { name: /generate certificate/i }).click();
    await page.getByRole('button', { name: /^generate$/i }).click();

    await expect.element(page.getByText('IssueCert failed')).toBeVisible();
  });

  it('should disable DOWNLOAD when there is no certificate', async () => {
    setupQueries({ withCert: false });

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    await expect.element(page.getByRole('button', { name: /download/i })).toBeDisabled();
    await expect.element(page.getByRole('button', { name: /^remove$/i })).toBeDisabled();
  });

  it('should open the upload wizard without calling ModifyDomain', async () => {
    let modifyDomainCalled = false;
    worker.use(
      http.post('/service/admin/soap/ModifyDomainRequest', () => {
        modifyDomainCalled = true;
        return HttpResponse.json({ Body: { ModifyDomainResponse: { domain: [] } } });
      }),
    );

    await setupBrowserTest(<DomainVirtualHosts />, {
      queryClient,
      initialRouterEntry: `/${DOMAIN_ID}/general-settings`,
      withDomainIdRoute: true,
    });

    await page.getByRole('button', { name: /upload certificate/i }).click();

    await expect.element(page.getByText('Upload and Verify Certificate')).toBeVisible();
    expect(modifyDomainCalled).toBe(false);
  });
});
