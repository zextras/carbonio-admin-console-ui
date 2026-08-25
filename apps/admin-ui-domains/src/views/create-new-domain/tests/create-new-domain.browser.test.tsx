/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  resetMockWorker,
  setupBrowserTest,
  worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import CreateDomain from '../create-new-domain';

vi.mock('@zextras/ui-shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
  return {
    ...actual,
    replaceHistory: vi.fn(),
  };
});

const replaceHistoryMock = vi.mocked(
  await import('@zextras/ui-shared').then((m) => m.replaceHistory),
);

const NEW_DOMAIN_ID = 'domain-id-123';

const mockCreateDomainResponse = {
  domain: [{ id: NEW_DOMAIN_ID, name: 'example.com' }],
};

const MAIL_SERVERS = {
  server: [{ id: 'server-1', name: 'mail1.example.com' }],
};

const COS_LIST = {
  cos: [
    { id: 'cos-id-1', name: 'Default COS' },
    { id: 'cos-id-2', name: 'Premium COS' },
  ],
};

type SoapAttribute = { n: string; _content: string };

function getAttr(attributes: Array<SoapAttribute>, name: string): string | undefined {
  return attributes.find((attr) => attr.n === name)?._content;
}

type MountApiOverrides = {
  servers?: { server: Array<{ id: string; name: string }> };
  cos?: { cos: Array<{ id: string; name: string }> };
};

function setupMountApis(overrides?: MountApiOverrides): void {
  createBrowserSoapAPIInterceptor('GetAllServers', overrides?.servers ?? { server: [] });
  createBrowserSoapAPIInterceptor('SearchDirectory', overrides?.cos ?? { cos: [] });
  createBrowserSoapAPIInterceptor('GetCreateObjectAttrs', { setAttrs: [{ a: [] }] });
}

async function setupCreateDomainTest(overrides?: MountApiOverrides): Promise<void> {
  setupMountApis(overrides);
  await setupBrowserTest(
    <Routes>
      <Route path="/create-new-domain" element={<CreateDomain />} />
      <Route path="/manage/domains" element={<div>Domains Home</div>} />
    </Routes>,
    { initialRouterEntry: '/create-new-domain' },
  );
  await expect.element(page.getByText('New Domain')).toBeVisible();
}

async function fillDomainName(name: string): Promise<void> {
  await userEvent.fill(
    page.getByRole('textbox', { name: /Type the name your domain will have/i }),
    name,
  );
}

async function waitForDefaultMailServer(): Promise<void> {
  await expect.element(page.getByText('mail1.example.com').first()).toBeVisible();
}

async function clickCreate(): Promise<void> {
  await page.getByRole('button', { name: 'Create' }).click();
}

describe('CreateDomain (characterization)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    resetMockWorker();
  });

  it('creates a domain with the name only and sends the static attribute set', async () => {
    const createDomainInterceptor = createBrowserSoapAPIInterceptor(
      'CreateDomain',
      mockCreateDomainResponse,
    );
    await setupCreateDomainTest();

    await fillDomainName('example.com');
    await clickCreate();

    const requestParams = (await createDomainInterceptor) as {
      name: string;
      a: Array<SoapAttribute>;
    };
    expect(requestParams.name).toBe('example.com');
    expect(Array.isArray(requestParams.a)).toBe(true);

    expect(getAttr(requestParams.a, 'zimbraGalMode')).toBe('zimbra');
    expect(getAttr(requestParams.a, 'zimbraDomainStatus')).toBe('active');
    expect(getAttr(requestParams.a, 'zimbraPublicServiceProtocol')).toBe('https');
    expect(getAttr(requestParams.a, 'zimbraGalMaxResults')).toBe('');
    expect(getAttr(requestParams.a, 'zimbraAuthMech')).toBe('');
    expect(getAttr(requestParams.a, 'description')).toBe('');
    expect(getAttr(requestParams.a, 'zimbraNotes')).toBe('');
    expect(getAttr(requestParams.a, 'zimbraDomainMaxAccounts')).toBe('');
    expect(getAttr(requestParams.a, 'carbonioNotificationFrom')).toBe('');

    await expect
      .element(page.getByText('example.com has been created successfully'))
      .toBeVisible();
    expect(replaceHistoryMock).toHaveBeenCalledWith(`/${NEW_DOMAIN_ID}/general_settings`);
  }, 20_000);

  it('creates a domain with description and notes', async () => {
    const createDomainInterceptor = createBrowserSoapAPIInterceptor(
      'CreateDomain',
      mockCreateDomainResponse,
    );
    await setupCreateDomainTest();

    await fillDomainName('company.com');
    await userEvent.fill(
      page.getByRole('textbox', { name: /Description/i }),
      'Corporate domain for company',
    );
    await userEvent.fill(page.getByRole('textbox', { name: /Notes/i }), 'Main production domain');
    await clickCreate();

    const requestParams = (await createDomainInterceptor) as {
      name: string;
      a: Array<SoapAttribute>;
    };
    expect(requestParams.name).toBe('company.com');
    expect(getAttr(requestParams.a, 'description')).toBe('Corporate domain for company');
    expect(getAttr(requestParams.a, 'zimbraNotes')).toBe('Main production domain');
  }, 20_000);

  it('sends max accounts and converts the quota from GB to bytes', async () => {
    const createDomainInterceptor = createBrowserSoapAPIInterceptor(
      'CreateDomain',
      mockCreateDomainResponse,
    );
    await setupCreateDomainTest();

    await fillDomainName('example.com');
    await userEvent.fill(
      page.getByRole('textbox', { name: /Max manageable account for the domain/i }),
      '50',
    );
    await userEvent.fill(
      page.getByRole('textbox', { name: /Max mailbox quota for the domain/i }),
      '2',
    );
    await clickCreate();

    const requestParams = (await createDomainInterceptor) as { a: Array<SoapAttribute> };
    expect(getAttr(requestParams.a, 'zimbraDomainMaxAccounts')).toBe('50');
    expect(getAttr(requestParams.a, 'zimbraMailDomainQuota')).toBe('2147483648');
  }, 20_000);

  it('sends the selected default COS id', async () => {
    const createDomainInterceptor = createBrowserSoapAPIInterceptor(
      'CreateDomain',
      mockCreateDomainResponse,
    );
    await setupCreateDomainTest({ cos: COS_LIST });

    await page.getByText('Default Class of Service').click();
    await page.getByText('Premium COS').click();

    await fillDomainName('example.com');
    await clickCreate();

    const requestParams = (await createDomainInterceptor) as { a: Array<SoapAttribute> };
    expect(getAttr(requestParams.a, 'zimbraDomainDefaultCOSId')).toBe('cos-id-2');
  }, 20_000);

  it('creates a GAL sync account with the defaults after creating the domain', async () => {
    const createDomainInterceptor = createBrowserSoapAPIInterceptor(
      'CreateDomain',
      mockCreateDomainResponse,
    );
    const galSyncInterceptor = createBrowserSoapAPIInterceptor('CreateGalSyncAccount', {});
    await setupCreateDomainTest({ servers: MAIL_SERVERS });

    await waitForDefaultMailServer();
    await fillDomainName('example.com');
    await clickCreate();

    const galSyncParams = (await galSyncInterceptor) as {
      name: string;
      domain: string;
      server: string;
      type: string;
      account: Array<{ by: string; _content: string }>;
      folder: string;
      a: Array<SoapAttribute>;
    };

    expect(galSyncParams.name).toBe('InternalGal');
    expect(galSyncParams.domain).toBe('example.com');
    expect(galSyncParams.server).toBe('mail1.example.com');
    expect(galSyncParams.type).toBe('zimbra');
    expect(galSyncParams.account).toEqual([{ by: 'name', _content: 'galsync@example.com' }]);
    expect(galSyncParams.folder).toBe('_InternalGal');
    expect(getAttr(galSyncParams.a, 'zimbraDataSourcePollingInterval')).toBe('1d');

    await createDomainInterceptor;
    await expect
      .element(page.getByText('example.com has been created successfully'))
      .toBeVisible();
    expect(replaceHistoryMock).toHaveBeenCalledWith(`/${NEW_DOMAIN_ID}/general_settings`);
  }, 20_000);

  it('uses the custom GAL folder name and datasource name in the GAL sync request', async () => {
    const galSyncInterceptor = createBrowserSoapAPIInterceptor('CreateGalSyncAccount', {});
    createBrowserSoapAPIInterceptor('CreateDomain', mockCreateDomainResponse);
    await setupCreateDomainTest({ servers: MAIL_SERVERS });

    await waitForDefaultMailServer();
    await fillDomainName('example.com');
    await userEvent.fill(page.getByRole('textbox', { name: /GAL folder name/i }), 'galsync2');
    await userEvent.fill(page.getByRole('textbox', { name: /Datasource name/i }), 'ExternalGal');
    await clickCreate();

    const galSyncParams = (await galSyncInterceptor) as {
      name: string;
      account: Array<{ _content: string }>;
      folder: string;
    };
    expect(galSyncParams.name).toBe('ExternalGal');
    expect(galSyncParams.account[0]._content).toBe('galsync2@example.com');
    expect(galSyncParams.folder).toBe('_ExternalGal');
  }, 20_000);

  it('calls initDomainForDelegation when delegated administration is enabled', async () => {
    const delegationInterceptor = await createBrowserAPIInterceptor(
      'post',
      '/service/extension/zextras_admin/admin/initDomainForDelegation',
      () => HttpResponse.json({ message: 'Delegation initialized' }),
    );
    createBrowserSoapAPIInterceptor('CreateDomain', mockCreateDomainResponse);
    createBrowserSoapAPIInterceptor('CreateGalSyncAccount', {});
    await setupCreateDomainTest({ servers: MAIL_SERVERS });

    await waitForDefaultMailServer();
    await page
      .getByRole('switch', { name: 'This domain supports delegated administration' })
      .click();

    await fillDomainName('example.com');
    await clickCreate();

    await vi.waitFor(() => expect(delegationInterceptor.getCalledTimes()).toBe(1));
    const delegationBody = (await delegationInterceptor.getLastRequest().json()) as {
      _jsns: string;
      domain: string;
    };
    expect(delegationBody._jsns).toBe('urn:zimbraAdmin');
    expect(delegationBody.domain).toBe('example.com');
  }, 20_000);

  it('blocks creation when the notification sender email is invalid', async () => {
    const createDomainCounter = await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/CreateDomainRequest',
      () => HttpResponse.json({ Body: { CreateDomainResponse: {} } }),
    );
    await setupCreateDomainTest();

    await fillDomainName('example.com');
    await userEvent.fill(
      page.getByRole('textbox', { name: /Notification Sender/i }),
      'not-an-email',
    );
    await clickCreate();

    await expect.element(page.getByText('Enter a valid email address.')).toBeVisible();
    expect(createDomainCounter.getCalledTimes()).toBe(0);
  }, 20_000);

  it('sends one notification recipient attribute per chip', async () => {
    const createDomainInterceptor = createBrowserSoapAPIInterceptor(
      'CreateDomain',
      mockCreateDomainResponse,
    );
    await setupCreateDomainTest();

    await fillDomainName('example.com');
    const recipientsInput = page.getByPlaceholder('Send notifications to...');
    await userEvent.type(recipientsInput, 'alice@example.com{Enter}');
    await userEvent.type(recipientsInput, 'bob@example.com{Enter}');
    await clickCreate();

    const requestParams = (await createDomainInterceptor) as { a: Array<SoapAttribute> };
    const recipients = requestParams.a
      .filter((attr) => attr.n === 'carbonioNotificationRecipients')
      .map((attr) => attr._content);
    expect(recipients).toEqual(['alice@example.com', 'bob@example.com']);
  }, 20_000);

  it('navigates to the domains list when Cancel is clicked', async () => {
    await setupCreateDomainTest();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.element(page.getByText('Domains Home')).toBeVisible();
  }, 20_000);

  it('shows an error snackbar when domain creation fails', async () => {
    worker.use(
      http.post('/service/admin/soap/CreateDomainRequest', () =>
        HttpResponse.json(
          { Body: { Fault: { Reason: { Text: 'Server error occurred' } } } },
          { status: 500 },
        ),
      ),
    );
    await setupCreateDomainTest();

    await fillDomainName('example.com');
    await clickCreate();

    await expect.element(page.getByText('Server error occurred')).toBeVisible();
  }, 20_000);
});
