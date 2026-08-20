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
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import { ViewMailButton } from '../view-mail-button';

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

async function setupViewMailButton(
  ui: ReactElement = <ViewMailButton accountId={ACCOUNT_ID} />,
  rights: Array<unknown> = rightsWithAdminLoginAs,
): Promise<RenderResult> {
  const queryClient = getQueryClient();
  await setupAccount(queryClient);
  queryClient.setQueryData(['effective-rights', USER_NAME], rights);
  return _setupBrowserTest(ui, { queryClient });
}

const viewMailButton = () => page.getByRole('button', { name: 'VIEW MAIL' });

describe('ViewMailButton (browser)', () => {
  beforeEach(() => {
    const openSpy = vi.fn();
    vi.stubGlobal('open', openSpy);
  });

  it('is disabled when the user lacks the adminLoginAs right', async () => {
    await setupViewMailButton(<ViewMailButton accountId={ACCOUNT_ID} />, rightsWithoutAdminLoginAs);

    await expect.element(viewMailButton()).toBeDisabled();
  });

  it('applies theme padding via the pr-md tailwind utility', async () => {
    await setupViewMailButton();

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

    await setupViewMailButton();

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

  it('shows an error snackbar when the response has no authToken', async () => {
    createBrowserSoapAPIInterceptor('DelegateAuth', {});

    await setupViewMailButton();
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

    await setupViewMailButton();
    await viewMailButton().click();

    await expect.element(page.getByText('delegate auth failed')).toBeVisible();
    expect(vi.mocked(globalThis.open)).not.toHaveBeenCalled();
  });

  it('is disabled while the DelegateAuth request is in flight', async () => {
    delayedSoapApiForBrowser('DelegateAuth', { authToken: [{ _content: 'tok-123' }] }, 1000);

    await setupViewMailButton();

    await expect.element(viewMailButton()).toBeEnabled();
    await viewMailButton().click();

    await expect.element(viewMailButton()).toBeDisabled();
  });
});
