/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  delayedSoapApiForBrowser,
  getQueryClient,
  setupAccount,
  setupBrowserTest as _setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AccountHeaderActions } from '../account-header-actions';

const ACCOUNT_ID = 'acc-1';
const USER_NAME = 'test@example.com';

const rightsWithAdminLoginAs = [
  {
    type: 'account',
    all: [{ right: [{ n: 'adminLoginAs' }] }],
  },
];

const rightsWithoutAdminLoginAs = [
  {
    type: 'account',
    all: [{ right: [{ n: 'someOtherRight' }] }],
  },
];

type SetupOptions = {
  rights?: Array<unknown>;
  zimbraId?: string;
};

async function setupAccountHeaderActions(
  options: SetupOptions = {},
  onDelete = vi.fn(),
): Promise<() => void> {
  const rights = options.rights ?? rightsWithAdminLoginAs;
  // An explicitly passed undefined must not fall back to ACCOUNT_ID
  const zimbraId = 'zimbraId' in options ? options.zimbraId : ACCOUNT_ID;
  const queryClient = getQueryClient();
  await setupAccount(queryClient);
  queryClient.setQueryData(['effective-rights', USER_NAME], rights);
  await _setupBrowserTest(
    <AccountHeaderActions
      accountId={ACCOUNT_ID}
      zimbraId={zimbraId}
      domainName="example.com"
      onDelete={onDelete}
    />,
    { queryClient },
  );
  return onDelete;
}

const viewMailButton = () => page.getByRole('button', { name: 'VIEW MAIL' });
const deleteButton = () => page.getByRole('button', { name: 'delete' });

describe('AccountHeaderActions (browser)', () => {
  beforeEach(() => {
    const openSpy = vi.fn();
    vi.stubGlobal('open', openSpy);
  });

  it('disables view mail when the user lacks the adminLoginAs right', async () => {
    await setupAccountHeaderActions({ rights: rightsWithoutAdminLoginAs });

    await expect.element(viewMailButton()).toBeDisabled();
  });

  it('applies theme padding via the pr-md tailwind utility', async () => {
    await setupAccountHeaderActions();

    const buttonElement = await viewMailButton().element();
    const wrapper = buttonElement.closest('div.pr-md');
    if (!(wrapper instanceof HTMLElement)) {
      throw new Error('VIEW MAIL button is not wrapped by div.pr-md');
    }
    // pr-md -> var(--padding-size-medium) = 0.75rem
    expect(getComputedStyle(wrapper).paddingRight).toBe('12px');
  });

  it('is enabled with the adminLoginAs right and opens the mailbox preauth URL on click', async () => {
    const delegateAuthParams = createBrowserSoapAPIInterceptor<
      {
        account: Array<{ _content: string; by: string }>;
      },
      { authToken: Array<{ _content: string }> }
    >('DelegateAuth', {
      authToken: [{ _content: 'tok-123' }],
    });

    await setupAccountHeaderActions();

    await expect.element(viewMailButton()).toBeEnabled();
    await viewMailButton().click();

    const params = await delegateAuthParams;
    expect(params.account[0]._content).toBe(ACCOUNT_ID);
    expect(params.account[0].by).toBe('id');

    const openSpy = vi.mocked(globalThis.open);
    await vi.waitFor(() => expect(openSpy).toHaveBeenCalledTimes(1));
    const [url, target] = openSpy.mock.calls[0];
    expect(url).toContain(`authtoken=tok-123`);
    expect(url).toContain(`https://${window.location.hostname}/service/preauth`);
    expect(url).toContain('adminPreAuth=1');
    expect(target).toBe('blank');
  });

  it('opens the preauth URL on zimbraPublicServiceHostname when the domain defines it', async () => {
    createBrowserSoapAPIInterceptor('DelegateAuth', { authToken: [{ _content: 'tok-123' }] });
    const getDomainParams = createBrowserSoapAPIInterceptor<
      { domain: { by: string; _content: string } },
      { domain: Array<{ a: Array<{ n: string; _content: string }> }> }
    >('GetDomain', {
      domain: [{ a: [{ n: 'zimbraPublicServiceHostname', _content: 'mail.public.example' }] }],
    });

    await setupAccountHeaderActions();
    await viewMailButton().click();

    const params = await getDomainParams;
    expect(params.domain).toEqual({ by: 'name', _content: 'example.com' });
    const openSpy = vi.mocked(globalThis.open);
    await vi.waitFor(() => expect(openSpy).toHaveBeenCalledTimes(1));
    expect(openSpy.mock.calls[0][0]).toContain('https://mail.public.example/service/preauth');
  });

  it('falls back to the current hostname when the domain lookup fails', async () => {
    createBrowserSoapAPIInterceptor('DelegateAuth', { authToken: [{ _content: 'tok-123' }] });
    await createBrowserAPIInterceptor('post', '/service/admin/soap/GetDomainRequest', () =>
      HttpResponse.json({
        Body: {
          Fault: {
            Reason: { Text: 'no such domain' },
            Detail: { Error: { Code: 'account.NO_SUCH_DOMAIN', Detail: 'no such domain' } },
          },
        },
      }),
    );

    await setupAccountHeaderActions();
    await viewMailButton().click();

    const openSpy = vi.mocked(globalThis.open);
    await vi.waitFor(() => expect(openSpy).toHaveBeenCalledTimes(1));
    expect(openSpy.mock.calls[0][0]).toContain(
      `https://${window.location.hostname}/service/preauth`,
    );
  });

  it('shows an error snackbar when the response has no authToken', async () => {
    createBrowserSoapAPIInterceptor('DelegateAuth', {});

    await setupAccountHeaderActions();
    await viewMailButton().click();

    await expect
      .element(page.getByText('Something went wrong. Please try again.'))
      .toBeVisible();
    expect(vi.mocked(globalThis.open)).not.toHaveBeenCalled();
  });

  it('shows an error snackbar when the request fails', async () => {
    await createBrowserAPIInterceptor(
      'post',
      '/service/admin/soap/DelegateAuthRequest',
      () =>
        HttpResponse.json({
          Body: {
            Fault: {
              Reason: { Text: 'delegate auth failed' },
              Detail: { Error: { Code: 'account.AUTH_FAILED', Detail: 'delegate auth failed' } },
            },
          },
        }),
    );

    await setupAccountHeaderActions();
    await viewMailButton().click();

    await expect.element(page.getByText('delegate auth failed')).toBeVisible();
    expect(vi.mocked(globalThis.open)).not.toHaveBeenCalled();
  });

  it('is disabled while the DelegateAuth request is in flight', async () => {
    delayedSoapApiForBrowser('DelegateAuth', { authToken: [{ _content: 'tok-123' }] }, 1000);

    await setupAccountHeaderActions();

    await expect.element(viewMailButton()).toBeEnabled();
    await viewMailButton().click();

    await expect.element(viewMailButton()).toBeDisabled();
  });

  it('disables delete when zimbraId is undefined', async () => {
    await setupAccountHeaderActions({ zimbraId: undefined });

    await expect.element(deleteButton()).toBeDisabled();
  });

  it('disables delete when zimbraId does not match the account id', async () => {
    await setupAccountHeaderActions({ zimbraId: 'another-account-id' });

    await expect.element(deleteButton()).toBeDisabled();
  });

  it('calls onDelete when the delete button is clicked', async () => {
    const onDelete = await setupAccountHeaderActions();

    await expect.element(deleteButton()).toBeEnabled();
    await deleteButton().click();

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
