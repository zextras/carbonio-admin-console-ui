/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { page } from 'vitest/browser';

import { QuotaStatus } from '../../../../../services/get-account-quota';
import { EditAccountQuotaWarnings } from '../edit-account-quota-warnings';

const MB = 1024 * 1024;

/**
 *
 * @param arg An object with the following properties:
 *   mailbox - Mailbox usage in MB
 *   files - Files usage in MB
 *   wsc - WSC usage in MB
 *   total - Total quota limit in MB
 *
 * @returns Promise that resolves when the test setup is complete
 */
const setupTest = async ({
  mailbox,
  files,
  wsc,
  total,
  status,
}: {
  mailbox: number;
  files: number;
  wsc: number;
  total: number;
  status?: QuotaStatus;
}): Promise<void> => {
  const mailboxUsed = mailbox * MB;
  const filesUsed = files * MB;
  const wscUsed = wsc * MB;
  const used = mailboxUsed + filesUsed + wscUsed;
  const totalLimit = total * MB;
  const percentageUsed = Math.round((used / totalLimit) * 100);
  const totalStatus = status ?? (percentageUsed >= 100 ? 'OVERQUOTA' : 'UNDERQUOTA');

  await setupBrowserTest(
    <EditAccountQuotaWarnings status={totalStatus} percentageUsed={percentageUsed} />,
  );
};

describe('EditAccountQuotaWarnings', () => {
  describe('Over quota banner', () => {
    const OVER_QUOTA_BANNER =
      'This account has reached its storage limit. Increase storage quota immediately or notify the user to free up space.';

    it('should show over quota banner when usage is more than 100%', async () => {
      await setupTest({ mailbox: 500, files: 500, wsc: 500, total: 1024 });

      expect(page.getByText(OVER_QUOTA_BANNER)).toBeVisible();
    });
    it('should show over quota banner when usage is exactly 100%', async () => {
      await setupTest({ mailbox: 500, files: 300, wsc: 224, total: 1024 });

      expect(page.getByText(OVER_QUOTA_BANNER)).toBeVisible();
    });
    it('should not show over quota banner when usage is less than 100%', async () => {
      await setupTest({ mailbox: 400, files: 300, wsc: 200, total: 1024 });

      expect(page.getByText(OVER_QUOTA_BANNER)).not.toBeInTheDocument();
    });
  });

  describe('Quota threshold warning banner', () => {
    const WARNING_BANNER =
      'This account is approaching its storage limit. Increase storage quota or notify the user to free up space.';
    it('should show warning banner when usage is more than 80% and less than 100%', async () => {
      await setupTest({ mailbox: 500, files: 200, wsc: 200, total: 1000 });

      expect(page.getByText(WARNING_BANNER)).toBeVisible();
    });
    it('should show warning banner when usage is exactly 80%', async () => {
      await setupTest({ mailbox: 500, files: 200, wsc: 100, total: 1000 });

      expect(page.getByText(WARNING_BANNER)).toBeVisible();
    });
    it('should not show warning banner when usage is less than 80%', async () => {
      await setupTest({ mailbox: 100, files: 100, wsc: 200, total: 1000 });

      expect(page.getByText(WARNING_BANNER)).not.toBeInTheDocument();
    });

    it('should not show warning banner when usage is equal to 100%', async () => {
      await setupTest({ mailbox: 500, files: 300, wsc: 200, total: 1000 });

      expect(page.getByText(WARNING_BANNER)).not.toBeInTheDocument();
    });

    it('should not show warning banner when usage is greater than 100%', async () => {
      await setupTest({ mailbox: 500, files: 300, wsc: 400, total: 1000 });

      expect(page.getByText(WARNING_BANNER)).not.toBeInTheDocument();
    });
  });
});
