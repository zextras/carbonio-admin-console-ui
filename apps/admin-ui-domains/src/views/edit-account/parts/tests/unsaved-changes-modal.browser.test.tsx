/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { UnsavedChangesModal } from '../unsaved-changes-modal';

async function setupUnsavedChangesModal(open = true): Promise<{
  onDiscard: ReturnType<typeof vi.fn>;
  onSave: ReturnType<typeof vi.fn>;
  onClose: ReturnType<typeof vi.fn>;
}> {
  const onDiscard = vi.fn();
  const onSave = vi.fn();
  const onClose = vi.fn();
  await setupBrowserTest(
    <UnsavedChangesModal open={open} onDiscard={onDiscard} onSave={onSave} onClose={onClose} />,
  );
  return { onDiscard, onSave, onClose };
}

describe('UnsavedChangesModal (browser)', () => {
  it('shows the warning text when open', async () => {
    await setupUnsavedChangesModal();

    await expect
      .element(page.getByText('Are you sure you want to leave without saving he changes?'))
      .toBeVisible();
  });

  it('calls onDiscard when Discard is clicked', async () => {
    const { onDiscard, onSave } = await setupUnsavedChangesModal();

    await page.getByRole('button', { name: 'Discard' }).click();

    expect(onDiscard).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave when Save the changes is clicked', async () => {
    const { onDiscard, onSave } = await setupUnsavedChangesModal();

    await page.getByRole('button', { name: 'Save the changes' }).click();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onDiscard).not.toHaveBeenCalled();
  });
});
