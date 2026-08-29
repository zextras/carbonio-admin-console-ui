/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ResourceDeleteDialog } from '../resource-delete-dialog';

const mockDeleteMutate = vi.fn();
const mockDisableMutate = vi.fn();

vi.mock('../../../../services/use-cal-resource', () => ({
  useDeleteCalResource: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
  useDisableCalResource: () => ({
    mutate: mockDisableMutate,
    isPending: false,
  }),
}));

describe('ResourceDeleteDialog (browser)', () => {
  it('renders the delete confirmation copy', async () => {
    await setupBrowserTest(
      <ResourceDeleteDialog
        resourceId="res-1"
        resourceName="room@example.com"
        isAccountClosed={false}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    await expect.element(page.getByText(/You are deleting room@example.com/)).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Delete it instead' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Close the resource' })).toBeVisible();
  });

  it('calls delete mutate when Delete it instead is clicked', async () => {
    await setupBrowserTest(
      <ResourceDeleteDialog
        resourceId="res-1"
        resourceName="room@example.com"
        isAccountClosed={false}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    await userEvent.click(page.getByRole('button', { name: 'Delete it instead' }));

    expect(mockDeleteMutate).toHaveBeenCalledWith('res-1', expect.any(Object));
  });

  it('calls disable mutate when Close the resource is clicked', async () => {
    await setupBrowserTest(
      <ResourceDeleteDialog
        resourceId="res-1"
        resourceName="room@example.com"
        isAccountClosed={false}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    await userEvent.click(page.getByRole('button', { name: 'Close the resource' }));

    expect(mockDisableMutate).toHaveBeenCalledWith('res-1', expect.any(Object));
  });

  it('disables Close the resource when the account is already closed', async () => {
    await setupBrowserTest(
      <ResourceDeleteDialog
        resourceId="res-1"
        resourceName="room@example.com"
        isAccountClosed
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    await expect.element(page.getByRole('button', { name: 'Close the resource' })).toBeDisabled();
  });
});
