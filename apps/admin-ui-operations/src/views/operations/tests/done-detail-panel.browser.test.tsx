/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
    createBrowserSoapAPIInterceptor,
    resetMockWorker,
    setupBrowserTest,
    worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type Operation } from '../../../types/operations';
import DoneDetailPanel from '../done-detail-panel';

const MOCK_DONE_OPERATIONS: Array<Operation> = [
    {
        id: 'op-1',
        name: 'doBackup',
        serverId: 'server-1',
        serverName: 'mailstore1.test.com',
        module: 'ZxBackup',
        state: 'Finished',
        type: 'Finished',
        startTime: 1742774400000,
        humanStartTime: '2025-03-24 00:00:00',
        parameters: {
            requesterAddress: 'admin@test.com',
            additionalNotificationAddresses: [],
            createFakeBlob: false,
            isDeep: true,
        },
    },
    {
        id: 'op-2',
        name: 'doExport',
        serverId: 'server-2',
        serverName: 'mailstore2.test.com',
        module: 'ZxCore',
        state: 'Finished',
        type: 'Exception',
        startTime: 1742688000000,
        humanStartTime: '2025-03-23 00:00:00',
        parameters: {
            requesterAddress: 'user@test.com',
            additionalNotificationAddresses: [],
            createFakeBlob: false,
            isDeep: false,
        },
    },
    {
        id: 'op-3',
        name: 'doReindex',
        serverId: 'server-1',
        serverName: 'mailstore1.test.com',
        module: 'ZxCore',
        state: 'Finished',
        type: 'Finished',
        startTime: 1742601600000,
        humanStartTime: '2025-03-22 00:00:00',
        parameters: {
            requesterAddress: 'admin@test.com',
            additionalNotificationAddresses: [],
            createFakeBlob: false,
            isDeep: false,
        },
    },
];

function setupGetAllServersInterceptor(): void {
    createBrowserSoapAPIInterceptor('GetAllServers', {
        server: [
            {
                id: 'server-1',
                name: 'mailstore1.test.com',
                a: [{ n: 'zimbraServiceHostname', _content: 'mailstore1.test.com' }],
            },
            {
                id: 'server-2',
                name: 'mailstore2.test.com',
                a: [{ n: 'zimbraServiceHostname', _content: 'mailstore2.test.com' }],
            },
        ],
    });
}

function setupGetOperationLogInterceptor(
    operations: Array<Operation> = MOCK_DONE_OPERATIONS,
): void {
    worker.use(
        http.post('/service/admin/soap/zextras', async ({ request }) => {
            const body = (await request.json()) as Record<string, unknown>;
            const zextrasBody = (body?.Body as Record<string, unknown>)?.zextras as
                | Record<string, unknown>
                | undefined;

            if (zextrasBody?.action === 'getOperationLog') {
                return HttpResponse.json({
                    Body: {
                        response: {
                            content: JSON.stringify({
                                ok: true,
                                response: {
                                    operationList: operations,
                                },
                            }),
                        },
                    },
                });
            }

            return HttpResponse.json({ Body: {} });
        }),
    );
}

describe('DoneDetailPanel', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    afterEach(() => {
        resetMockWorker();
    });

    it('should render the Done Operations heading', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('Done Operations')).toBeVisible();
    });

    it('should render the search input', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect
            .element(page.getByLabelText('Search for a completed operation'))
            .toBeVisible();
    });

    it('should render table headers', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('Server')).toBeVisible();
        await expect.element(page.getByText('Operation', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Status')).toBeVisible();
        await expect.element(page.getByText('Author')).toBeVisible();
        await expect.element(page.getByText('Submit date')).toBeVisible();
        await expect.element(page.getByText('Start date')).toBeVisible();
    });

    it('should render operation data from API', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await expect.element(page.getByText('doExport')).toBeVisible();
        await expect.element(page.getByText('doReindex')).toBeVisible();
    });

    it('should show Empty Table when no done operations', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor([]);
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('Empty Table')).toBeVisible();
    });

    it('should open wizard detail panel when a row is clicked', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('Details')).toBeVisible();
        await expect.element(page.getByText('Operation Type')).toBeVisible();
    });

    it('should close wizard panel when close button is clicked', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('Details')).toBeVisible();
        await page.getByTestId('icon: CloseOutline').click();
        await expect.poll(() => page.getByText('Operation Type').elements()).toHaveLength(0);
    });

    it('should filter operations by search text', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await expect.element(page.getByText('doExport')).toBeVisible();

        const searchInput = page.getByLabelText('Search for a completed operation');
        await userEvent.type(searchInput, 'doBackup');

        await expect.element(page.getByText('doBackup')).toBeVisible();
        await expect.poll(() => page.getByText('doExport').elements()).toHaveLength(0);
    });

    it('should filter operations by author', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('doBackup')).toBeVisible();

        const searchInput = page.getByLabelText('Search for a completed operation');
        await userEvent.type(searchInput, 'user@test.com');

        await expect.element(page.getByText('doExport')).toBeVisible();
        await expect.poll(() => page.getByText('doBackup').elements()).toHaveLength(0);
    });

    it('should show COPY button in wizard for done operations', async () => {
        setupGetAllServersInterceptor();
        setupGetOperationLogInterceptor();
        await setupBrowserTest(<DoneDetailPanel />);
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('COPY')).toBeVisible();
    });
});
