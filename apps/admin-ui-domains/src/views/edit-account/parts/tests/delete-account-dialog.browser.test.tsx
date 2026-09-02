/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  createBrowserAPIInterceptor,
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupAccount,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DeleteAccountDialog } from '../delete-account-dialog';

const ACCOUNT = {
  id: 'acc-1',
  name: 'jane@example.com',
  zimbraAccountStatus: 'active',
};

type SetupOptions = {
  account?: typeof ACCOUNT;
};

async function setupDeleteAccountDialog(
  { account = ACCOUNT }: SetupOptions = {},
): Promise<{ onDeleted: ReturnType<typeof vi.fn>; onClose: ReturnType<typeof vi.fn> }> {
  const onDeleted = vi.fn();
  const onClose = vi.fn();
  const queryClient = getQueryClient();
  await setupAccount(queryClient);
  await setupBrowserTest(
    <DeleteAccountDialog
      account={account}
      zimbraId={account.id}
      onDeleted={onDeleted}
      onClose={onClose}
    />,
    { queryClient },
  );
  return { onDeleted, onClose };
}

const deleteItInsteadButton = () => page.getByRole('button', { name: 'Delete it instead' });
const closeTheAccountButton = () => page.getByRole('button', { name: 'Close the account' });

describe('DeleteAccountDialog (browser)', () => {
  it('shows the account name and warning content', async () => {
    await setupDeleteAccountDialog();

    await expect
      .element(page.getByText('You are deleting jane@example.com account'))
      .toBeVisible();
    await expect
      .element(page.getByText(/Are you sure you want to delete/))
      .toBeVisible();
    await expect.element(page.getByText('will PERMANENTLY delete')).toBeVisible();
  });

  it('deletes the account, shows success snackbar and calls onDeleted/onClose', async () => {
    const deleteAccountParams = createBrowserSoapAPIInterceptor<
      { id?: string },
      Record<string, never>
    >('DeleteAccount', {});

    const { onDeleted, onClose } = await setupDeleteAccountDialog();

    await deleteItInsteadButton().click();

    const params = await deleteAccountParams;
    expect(params.id).toBe(ACCOUNT.id);

    await expect
      .element(page.getByText('The account has been correctly removed.'))
      .toBeVisible();
    await vi.waitFor(() => expect(onDeleted).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('closes the account sending ModifyAccount with closed status', async () => {
    const modifyAccountParams = createBrowserSoapAPIInterceptor<
      { id?: string; a?: Array<{ n: string; _content: string }> },
      unknown
    >('ModifyAccount', { account: [{}] });

    const { onDeleted, onClose } = await setupDeleteAccountDialog();

    await closeTheAccountButton().click();

    const params = await modifyAccountParams;
    expect(params.a).toContainEqual({ n: 'zimbraAccountStatus', _content: 'closed' });

    await expect
      .element(page.getByText('The account has been correctly disabled.'))
      .toBeVisible();
    expect(onDeleted).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('shows an error snackbar when the delete request fails', async () => {
    await createBrowserAPIInterceptor('post', '/service/admin/soap/DeleteAccountRequest', () =>
      HttpResponse.json({
        Body: {
          Fault: {
            Reason: { Text: 'cannot delete account' },
            Detail: { Error: { Code: 'account.NO_SUCH_ACCOUNT', Detail: 'cannot delete account' } },
          },
        },
      }),
    );

    const { onDeleted } = await setupDeleteAccountDialog();

    await deleteItInsteadButton().click();

    await expect.element(page.getByText('cannot delete account')).toBeVisible();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('disables Close the account when the account is already closed', async () => {
    await setupDeleteAccountDialog({
      account: { ...ACCOUNT, zimbraAccountStatus: 'closed' },
    });

    await expect.element(closeTheAccountButton()).toBeDisabled();
  });
});
