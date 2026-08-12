/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  getQueryClient,
  grantUserConfigRights,
  resetMockWorker,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { backupQueryKeys } from '../../../../services/backup-query-keys';
import { BackupAdvanced } from '../backup-advanced';

const GLOBAL_CONFIG = {
  backupLatencyHighThreshold: '100',
  backupLatencyLowThreshold: '50',
  ldapDumpEnabled: false,
  ZxBackup_BackupCustomizations: false,
  ZxBackup_PurgeCustomizations: false,
  backupSaveIndex: false,
  ZxBackup_MaxMetadataSize: '1024',
  ZxBackup_MaxWaitingTime: '5000',
  ZxBackup_MaxOperationPerAccount: '10',
  backupCompressionLevel: '2',
  backupNumberThreadsForAccounts: '4',
  backupOnTheFlyMetadata: false,
  scheduledMetadataArchivingEnabled: false,
  privateKeyAlgorithm: 'RSA',
};

describe('BackupAdvanced', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  beforeEach(async () => {
    queryClient = getQueryClient();
    await grantUserConfigRights(queryClient);
    queryClient.setQueryData(['global-config'], { ...GLOBAL_CONFIG });
  });

  afterEach(() => {
    resetMockWorker();
    queryClient.removeQueries({ queryKey: backupQueryKeys.all });
  });

  describe('Rendering', () => {
    it('should render the "Advanced" title', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText('Advanced')).toBeVisible();
    });

    it('should render all input fields', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText(/Latency High Threshold/)).toBeVisible();
      await expect.element(page.getByText(/Latency Low Threshold/)).toBeVisible();
      await expect.element(page.getByText('Metadata Size')).toBeVisible();
      await expect.element(page.getByText(/Max Waiting Time/)).toBeVisible();
      await expect.element(page.getByText('Max Operations / Account')).toBeVisible();
      await expect.element(page.getByText('Threads For Items')).toBeVisible();
      await expect.element(page.getByText('Threads For Account')).toBeVisible();
    });

    it('should render all switch options', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText('LDAP Dump')).toBeVisible();
      await expect
        .element(page.getByText('Store Server Configuration in the backup'))
        .toBeVisible();
      await expect.element(page.getByText('Purge Old Configurations')).toBeVisible();
      await expect.element(page.getByText('Save Index')).toBeVisible();
      await expect
        .element(page.getByText('Flash metadata in the disk at every save'))
        .toBeVisible();
      await expect
        .element(page.getByText('Archive user metadata folder in the remote backup'))
        .toBeVisible();
    });

    it('should render the Compression Level select', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText('Compression Level')).toBeVisible();
    });
  });

  describe('Dirty state', () => {
    it('should not show Save and Cancel buttons initially', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText('Advanced')).toBeVisible();

      expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
      expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
    });

    it('should show Save and Cancel buttons when a switch is toggled', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText('LDAP Dump')).toBeVisible();
      await page.getByText('LDAP Dump').click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    it('should hide Save and Cancel buttons when Cancel is clicked', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await page.getByText('LDAP Dump').click();
      await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

      await page.getByRole('button', { name: 'Cancel' }).click();

      expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
      expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
    });
  });

  describe('Switch toggles', () => {
    it('should toggle "Store Server Configuration in the backup" switch', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect
        .element(page.getByText('Store Server Configuration in the backup'))
        .toBeVisible();

      await page.getByText('Store Server Configuration in the backup').click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should toggle "Save Index" switch', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await page.getByText('Save Index').click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should toggle "Purge Old Configurations" switch', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await page.getByText('Purge Old Configurations').click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should toggle "Flash metadata in the disk at every save" switch', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await page.getByText('Flash metadata in the disk at every save').click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });

    it('should toggle "Archive user metadata folder in the remote backup" switch', async () => {
      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await page.getByText('Archive user metadata folder in the remote backup').click();

      await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    });
  });

  describe('Permissions', () => {
    it('should disable inputs when user lacks config rights', async () => {
      queryClient.setQueryData(
        ['effective-rights', 'test@example.com'],
        [
          {
            type: 'config',
            all: [{ getAttrs: [{ all: true }] }],
          },
        ],
      );

      await setupBrowserTest(<BackupAdvanced />, { queryClient });

      await expect.element(page.getByText('LDAP Dump')).toBeVisible();

      await page.getByText('LDAP Dump').click();

      expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
    });
  });
});
