/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  getQueryClient,
  setupAccount,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DeleteAccountHintModal } from '../delete-account-hint-modal';

const ACCOUNT = {
  id: 'acc-1',
  name: 'jane@example.com',
  zimbraAccountStatus: 'active',
};

async function setupDeleteAccountHintModal(): Promise<ReturnType<typeof vi.fn>> {
  const onClose = vi.fn();
  const queryClient = getQueryClient();
  await setupAccount(queryClient);
  await setupBrowserTest(<DeleteAccountHintModal account={ACCOUNT} onClose={onClose} />, {
    queryClient,
  });
  return onClose;
}

describe('DeleteAccountHintModal (browser)', () => {
  it('shows the hint text', async () => {
    await setupDeleteAccountHintModal();

    await expect
      .element(
        page.getByText(
          `The system accounts can't be deleted from here. Please visit the respective module to manage the account.`,
        ),
      )
      .toBeVisible();
  });

  it('calls onClose when Close is clicked', async () => {
    const onClose = await setupDeleteAccountHintModal();

    await page.getByRole('button', { name: 'Close' }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
