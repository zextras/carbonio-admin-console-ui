/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { createBrowserAPIInterceptor, getQueryClient, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GeneralSettings } from '../sections/general-settings';
import type { BackupConfigFormValues } from '../types';

const SERVER_NAME = 'mail.example.com';
const SMART_SCAN_URL = '/service/extension/zextras_admin/backup/doSmartScan';

const defaultFormValues: BackupConfigFormValues = {
  moduleEnableStartup: false,
  enableRealtimeScanner: false,
  runSmartScanStartup: false,
  spaceThreshold: '512',
  backupDestPath: '/opt/zextras/backup',
  isScheduleSmartScan: false,
  scheduleSmartScan: '0 0 * * *',
  scheduleAutomaticRetentionPolicy: false,
  retentionPolicySchedule: '0 2 * * *',
  keepDeletedItemInBackup: '30',
  keepDeletedAccountsInBackup: '15',
};

type GeneralSettingsWrapperProps = {
  allowSetBackup?: boolean;
  isBackupInitialized?: boolean;
  isRealtimeLicensed?: boolean;
  serverName?: string;
};

const GeneralSettingsWrapper = ({
  allowSetBackup = true,
  isBackupInitialized = false,
  isRealtimeLicensed = false,
  serverName = SERVER_NAME,
}: GeneralSettingsWrapperProps) => {
  const form = useForm({ defaultValues: defaultFormValues });
  return (
    <GeneralSettings
      form={form as never}
      allowSetBackup={allowSetBackup}
      isRealtimeLicensed={isRealtimeLicensed}
      isBackupInitialized={isBackupInitialized}
      serverName={serverName}
    />
  );
};

function mockSmartScan() {
  return createBrowserAPIInterceptor('post', SMART_SCAN_URL, () =>
    HttpResponse.json({ ok: true }),
  );
}

describe('GeneralSettings', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(() => {
    queryClient = getQueryClient();
  });

  afterEach(() => {
    resetMockWorker();
  });

  describe('Initialize Backup button', () => {
    it('should change the label and call the smart scan endpoint when clicked', async () => {
      const smartScanInterceptor = await mockSmartScan();

      await setupBrowserTest(
        <GeneralSettingsWrapper allowSetBackup={true} isBackupInitialized={false} />,
        { queryClient },
      );

      const initButton = page.getByRole('button', { name: 'Initialize Backup' });
      await expect.element(initButton).toBeEnabled();
      await userEvent.click(initButton);

      await expect
        .element(
          page.getByRole('button', {
            name: 'INITIALISING BACKUP... CHECK YOUR NOTIFICATIONS FOR UPDATES',
          }),
        )
        .toBeVisible();

      await expect.poll(() => smartScanInterceptor.getCalledTimes()).toBeGreaterThan(0);
    });

    it('should be disabled when backup is already initialized', async () => {
      await setupBrowserTest(
        <GeneralSettingsWrapper allowSetBackup={true} isBackupInitialized={true} />,
        { queryClient },
      );

      await expect
        .element(page.getByRole('button', { name: 'Initialize Backup' }))
        .toBeDisabled();
    });
  });
});
