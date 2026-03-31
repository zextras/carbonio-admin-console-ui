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

import ServersList from '../backup-servers-list';

const SERVER_1 = {
    id: 'server-1',
    name: 'mail01.example.com',
    a: [{ n: 'description', _content: 'Mail server 1' }],
};

const SERVER_2 = {
    id: 'server-2',
    name: 'mail02.example.com',
    a: [{ n: 'description', _content: 'Mail server 2' }],
};

function buildBackupServerEntry(
    serverId: string,
    overrides?: Record<string, unknown>,
) {
    return {
        [serverId]: {
            ZxBackup: {
                attributes: {
                    ZxBackup_ModuleEnabledAtStartup: { value: true },
                    ZxBackup_RealTimeScanner: { value: true },
                    ZxBackup_DoSmartScanOnStartup: { value: true },
                    ZxBackup_SpaceThreshold: { value: 512 },
                    ZxBackup_DestPath: { value: '/opt/zextras/backup' },
                    ZxBackup_DataRetentionDays: { value: 30 },
                    backupAccountsRetentionDays: { value: 15 },
                    backupSmartScanScheduler: {
                        value: { 'cron-enabled': true, 'cron-pattern': '0 0 * * *' },
                    },
                    backupPurgeScheduler: {
                        value: { 'cron-enabled': true, 'cron-pattern': '0 2 * * *' },
                    },
                    backupArchivingStore: { value: {} },
                    ...overrides,
                },
                properties: {
                    backup_initialized: true,
                    available_space_for_metadata: 1073741824,
                    available_space_for_blobs: 5368709120,
                },
            },
        },
    };
}

describe('ServersList', () => {
    let queryClient: ReturnType<typeof getQueryClient>;

    beforeEach(async () => {
        queryClient = getQueryClient();
        await grantUserConfigRights(queryClient);
        queryClient.setQueryData(['advanced-supported'], { supported: true });
    });

    afterEach(() => {
        resetMockWorker();
    });

    describe('Rendering', () => {
        it('should render the "Server List" title', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: false,
                backupServerList: [],
                isBackupModuleLicensed: false,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('Server List')).toBeVisible();
        });

        it('should render the table', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: false,
                backupServerList: [],
                isBackupModuleLicensed: false,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByRole('table')).toBeVisible();
        });
    });

    describe('Server data without backup info', () => {
        it('should display server names', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1, SERVER_2]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: false,
                backupServerList: [],
                isBackupModuleLicensed: false,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('mail01.example.com')).toBeVisible();
            await expect.element(page.getByText('mail02.example.com')).toBeVisible();
        });

        it('should show N/A for backup columns when no backup data', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: false,
                backupServerList: [],
                isBackupModuleLicensed: false,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('mail01.example.com')).toBeVisible();

            const naElements = page.getByText('N/A');
            expect(naElements.elements().length).toBeGreaterThan(0);
        });

        it('should display server description', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: false,
                backupServerList: [],
                isBackupModuleLicensed: false,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('Mail server 1')).toBeVisible();
        });
    });

    describe('Server data with backup info', () => {
        it('should display "Scheduled" for backup at startup when enabled', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [buildBackupServerEntry('server-1')],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('Scheduled').first()).toBeVisible();
        });

        it('should display "Local" type when no archiving store', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [buildBackupServerEntry('server-1')],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('Local')).toBeVisible();
        });

        it('should display "Ext. Volume" type when archiving store is present', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [
                    buildBackupServerEntry('server-1', {
                        backupArchivingStore: {
                            value: { type: 'S3', bucketConfigurationId: 'bucket-1' },
                        },
                    }),
                ],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('Ext. Volume')).toBeVisible();
        });

        it('should display purge retention values', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [buildBackupServerEntry('server-1')],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('30/15')).toBeVisible();
        });

        it('should display smartscan status as "On Startup & Scheduled"', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [buildBackupServerEntry('server-1')],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect
                .element(page.getByText('On Startup & Scheduled'))
                .toBeVisible();
        });

        it('should display "Disabled" smartscan when both startup and scheduled are false', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [
                    buildBackupServerEntry('server-1', {
                        ZxBackup_DoSmartScanOnStartup: { value: false },
                        backupSmartScanScheduler: {
                            value: { 'cron-enabled': false, 'cron-pattern': '' },
                        },
                    }),
                ],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect
                .element(page.getByText('Disabled').first())
                .toBeVisible();
        });

        it('should display available metadata and backup space', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [buildBackupServerEntry('server-1')],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('1.0 GB')).toBeVisible();
            await expect.element(page.getByText('5.0 GB')).toBeVisible();
        });
    });

    describe('Multiple servers', () => {
        it('should display all servers with their backup data', async () => {
            queryClient.setQueryData(['all-servers'], [SERVER_1, SERVER_2]);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: true,
                backupServerList: [
                    buildBackupServerEntry('server-1'),
                    buildBackupServerEntry('server-2', {
                        ZxBackup_ModuleEnabledAtStartup: { value: false },
                        ZxBackup_RealTimeScanner: { value: false },
                    }),
                ],
                isBackupModuleLicensed: true,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('mail01.example.com')).toBeVisible();
            await expect.element(page.getByText('mail02.example.com')).toBeVisible();
        });
    });

    describe('Empty state', () => {
        it('should render table with no rows when there are no servers', async () => {
            queryClient.setQueryData(['all-servers'], []);
            queryClient.setQueryData(['backup-servers'], {
                backupModuleEnable: false,
                backupServerList: [],
                isBackupModuleLicensed: false,
            });

            await setupBrowserTest(<ServersList />, { queryClient });

            await expect.element(page.getByText('Server List')).toBeVisible();
            expect(page.getByText('mail01.example.com').elements()).toHaveLength(0);
        });
    });
});
