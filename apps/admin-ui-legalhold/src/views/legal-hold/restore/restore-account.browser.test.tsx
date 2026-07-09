/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import type { BackupAccountItem } from '../../../../types';
import RestoreAccountView from './restore-account';

const mockLegalHoldAccount: BackupAccountItem = {
  id: 'acc-1',
  name: 'admin@test.com',
  status: 'active',
  legalHold: 'true',
  serverName: 'mailstore1.test.com',
  creationTimestamp: new Date('2025-01-01').getTime(),
  deletedTimestamp: undefined,
};

const mockOnBack = () => {};

describe('RestoreAccountView (browser)', () => {
  describe('DatePicker', () => {
    it('should render the Account status on date picker', async () => {
      setupBrowserTest(
        <RestoreAccountView
          legalHoldAccount={mockLegalHoldAccount}
          onBack={mockOnBack}
        />,
      );

      await expect.element(page.getByPlaceholder('Account status on')).toBeVisible();
    });

    it('should render the Account status on picker as enabled', async () => {
      setupBrowserTest(
        <RestoreAccountView
          legalHoldAccount={mockLegalHoldAccount}
          onBack={mockOnBack}
        />,
      );

      await expect.element(page.getByPlaceholder('Account status on')).toBeEnabled();
    });

    it('should not render the Include items deleted after picker initially', async () => {
      setupBrowserTest(
        <RestoreAccountView
          legalHoldAccount={mockLegalHoldAccount}
          onBack={mockOnBack}
        />,
      );

      await expect
        .element(page.getByPlaceholder('Include items deleted after'))
        .not.toBeInTheDocument();
    });

    it('should render the Include items deleted after picker when the switch is enabled', async () => {
      setupBrowserTest(
        <RestoreAccountView
          legalHoldAccount={mockLegalHoldAccount}
          onBack={mockOnBack}
        />,
      );

      const switchLabel = page.getByText('Include items deleted');
      await switchLabel.click();

      await expect.element(page.getByPlaceholder('Include items deleted after')).toBeVisible();
    });

    it('should open the Account status on calendar popover when the calendar icon is clicked', async () => {
      setupBrowserTest(
        <RestoreAccountView
          legalHoldAccount={mockLegalHoldAccount}
          onBack={mockOnBack}
        />,
      );

      await page.getByRole('button', { name: 'Calendar' }).click();

      await expect.element(page.getByRole('grid')).toBeVisible();
    });

    it('should render the Include items deleted after picker as clearable', async () => {
      setupBrowserTest(
        <RestoreAccountView
          legalHoldAccount={mockLegalHoldAccount}
          onBack={mockOnBack}
        />,
      );

      await page.getByText('Include items deleted').click();

      const clearButton = page.getByRole('button', { name: 'Clear' });
      await expect.element(clearButton).toBeVisible();
    });
  });
});
