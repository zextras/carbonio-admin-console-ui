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
import { page, userEvent } from 'vitest/browser';

import { backupQueryKeys } from '../../../../services/backup-query-keys';
import BackupServerConfig from '../backup-server-config';

const GLOBAL_CONFIG = {
    ZxBackup_RealTimeScanner: true,
    ZxBackup_ModuleEnabledAtStartup: true,
    ZxBackup_DoSmartScanOnStartup: false,
    ZxBackup_DestPath: '/opt/zextras/backup',
    ZxBackup_SpaceThreshold: 512,
    backupLocalMetadataThreshold: 256,
    backupSmartScanScheduler: {
        'cron-enabled': true,
        'cron-pattern': '0 0 * * *',
    },
    backupPurgeScheduler: {
        'cron-enabled': false,
        'cron-pattern': '0 2 * * *',
    },
    ZxBackup_DataRetentionDays: 30,
    backupAccountsRetentionDays: 15,
};

function setLicenseData(
    queryClient: ReturnType<typeof getQueryClient>,
    { backupBasic = true, backupRealtime = true } = {},
) {
    queryClient.setQueryData(['subscription', 'license'], {
        ok: true,
        response: {
            type: 'SUBSCRIPTION',
            subType: 'SUBSCRIPTION',
            expired: false,
            maintenanceStatus: 'active',
            features: [
                { name: 'backup_basic', enabled: backupBasic },
                { name: 'backup_realtime', enabled: backupRealtime },
            ],
        },
    });
}

describe('BackupServerConfig', () => {
    let queryClient: ReturnType<typeof getQueryClient>;

    beforeEach(async () => {
        queryClient = getQueryClient();
        await grantUserConfigRights(queryClient);
        queryClient.setQueryData(backupQueryKeys.globalConfig(), { ...GLOBAL_CONFIG });
    });

    afterEach(() => {
        resetMockWorker();
        queryClient.removeQueries({ queryKey: backupQueryKeys.all });
    });

    describe('Rendering', () => {
        it('should not render anything when backup module is not licensed', async () => {
            setLicenseData(queryClient, { backupBasic: false });

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect.element(page.getByText('Server Config')).not.toBeInTheDocument();
        });

        it('should render the "Server Config" title when licensed', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect.element(page.getByText('Server Config')).toBeVisible();
        });

        it('should render "Enable Realtime Scanner" switch when realtime is licensed', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Enable Realtime Scanner'))
                .toBeVisible();
        });

        it('should not render "Enable Realtime Scanner" when realtime is not licensed', async () => {
            setLicenseData(queryClient, { backupRealtime: false });

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect.element(page.getByText('Server Config')).toBeVisible();
            await expect
                .element(page.getByText('Enable Realtime Scanner'))
                .not.toBeInTheDocument();
        });

        it('should render "Backup is enabled at the startup" switch', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Backup is enabled at the startup'))
                .toBeVisible();
        });

        it('should render "Run the Smartscan at the startup" switch', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Run the Smartscan at the startup'))
                .toBeVisible();
        });
    });

    describe('Input fields', () => {
        it('should render the Backup Path input with correct value', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            const input = page.getByRole('textbox', { name: 'Backup Path' });
            await expect.element(input).toBeVisible();
            await expect.element(input).toHaveValue('/opt/zextras/backup');
        });

        it('should render the Minimum Space Threshold input', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Minimum Space Threshold (MB)'))
                .toBeVisible();
        });

        it('should render the Local Metadata Threshold input', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Local Metadata Threshold (MB)'))
                .toBeVisible();
        });

        it('should render the Schedule Smartscan switch', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Schedule Smartscan'))
                .toBeVisible();
        });

        it('should render the Schedule Backup Purge switch', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Schedule Backup Purge'))
                .toBeVisible();
        });

        it('should render "Keep deleted items in the backup" input', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Keep deleted items in the backup'))
                .toBeVisible();
        });

        it('should render "Keep deleted accounts in the backup" input', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect
                .element(page.getByText('Keep deleted accounts in the backup'))
                .toBeVisible();
        });

        it('should render the "forever" helper text twice', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            const helperTexts = page.getByText(
                'If you set 0, your data will be kept in backup forever',
            );
            await expect.element(helperTexts.first()).toBeVisible();
        });
    });

    describe('Dirty state', () => {
        it('should not show Cancel and Save buttons when form is clean', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            await expect.element(page.getByText('Server Config')).toBeVisible();
            await expect
                .element(page.getByRole('button', { name: 'Cancel' }))
                .not.toBeInTheDocument();
            await expect
                .element(page.getByRole('button', { name: 'Save' }))
                .not.toBeInTheDocument();
        });

        it('should show Cancel and Save buttons after toggling a switch', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            const backupStartupSwitch = page.getByText('Backup is enabled at the startup');
            await userEvent.click(backupStartupSwitch);

            await expect
                .element(page.getByRole('button', { name: 'Cancel' }))
                .toBeVisible();
            await expect
                .element(page.getByRole('button', { name: 'Save' }))
                .toBeVisible();
        });

        it('should hide Cancel and Save buttons after clicking Cancel', async () => {
            setLicenseData(queryClient);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            const backupStartupSwitch = page.getByText('Backup is enabled at the startup');
            await userEvent.click(backupStartupSwitch);

            await expect
                .element(page.getByRole('button', { name: 'Cancel' }))
                .toBeVisible();

            await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

            await expect
                .element(page.getByRole('button', { name: 'Cancel' }))
                .not.toBeInTheDocument();
            await expect
                .element(page.getByRole('button', { name: 'Save' }))
                .not.toBeInTheDocument();
        });
    });

    describe('Permissions', () => {
        it('should disable switches when user has no config rights', async () => {
            setLicenseData(queryClient);
            queryClient.setQueryData(['effective-rights', 'test@example.com'], [
                { type: 'config', all: [] },
            ]);

            await setupBrowserTest(<BackupServerConfig />, { queryClient });

            const backupStartupSwitch = page.getByText('Backup is enabled at the startup');
            await userEvent.click(backupStartupSwitch);

            // Should remain clean since switch is disabled
            await expect
                .element(page.getByRole('button', { name: 'Cancel' }))
                .not.toBeInTheDocument();
        });
    });
});
