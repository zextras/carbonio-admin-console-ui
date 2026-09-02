/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { AccountSaveCancelActions } from '../account-save-cancel-actions';

async function setupAccountSaveCancelActions(
  hasQuotaError = false,
): Promise<{ onSave: ReturnType<typeof vi.fn>; onCancel: ReturnType<typeof vi.fn> }> {
  const onSave = vi.fn();
  const onCancel = vi.fn();
  await setupBrowserTest(
    <AccountSaveCancelActions
      hasQuotaError={hasQuotaError}
      onSave={onSave}
      onCancel={onCancel}
    />,
  );
  return { onSave, onCancel };
}

const cancelButton = () => page.getByRole('button', { name: 'Cancel' });
const saveButton = () => page.getByRole('button', { name: 'Save' });

describe('AccountSaveCancelActions (browser)', () => {
  it('shows Cancel and Save', async () => {
    await setupAccountSaveCancelActions();

    await expect.element(cancelButton()).toBeVisible();
    await expect.element(saveButton()).toBeEnabled();
  });

  it('disables Save when there is a quota error', async () => {
    await setupAccountSaveCancelActions(true);

    await expect.element(saveButton()).toBeDisabled();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const { onSave, onCancel } = await setupAccountSaveCancelActions();

    await cancelButton().click();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave when Save is clicked', async () => {
    const { onSave, onCancel } = await setupAccountSaveCancelActions();

    await saveButton().click();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });
});
