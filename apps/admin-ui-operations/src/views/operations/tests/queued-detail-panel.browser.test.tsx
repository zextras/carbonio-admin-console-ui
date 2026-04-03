/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { useOperationStore } from '../../../store/operation/store';
import QuededDetailPanel from '../queued-detail-panel';

const MOCK_QUEUED_OPERATIONS = [
    {
        id: 'op-1',
        name: 'doBackup',
        host: 'mailstore1.test.com',
        serverName: 'mailstore1.test.com',
        module: 'ZxBackup',
        state: 'Queued',
        type: '',
        startTime: 1742774400000,
        queuedTime: 1742774300000,
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
        host: 'mailstore2.test.com',
        serverName: 'mailstore2.test.com',
        module: 'ZxCore',
        state: 'Queued',
        type: '',
        startTime: 1742688000000,
        queuedTime: 1742687900000,
        humanStartTime: '2025-03-23 00:00:00',
        parameters: {
            requesterAddress: 'admin@test.com',
            additionalNotificationAddresses: [],
            createFakeBlob: false,
            isDeep: false,
        },
    },
];

function setupGetAllServersInterceptor(serverName = 'mailstore1.test.com'): void {
    createBrowserSoapAPIInterceptor('GetAllServers', {
        server: [
            {
                id: 'server-1',
                name: serverName,
                a: [{ n: 'zimbraServiceHostname', _content: serverName }],
            },
        ],
    });
}

function setQueuedData(data: Array<unknown> = MOCK_QUEUED_OPERATIONS): void {
    useOperationStore.getState().setQueuedData(data);
}

describe('QuededDetailPanel', () => {
    const mockGetAllOperationAPICallHandler = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        useOperationStore.getState().setQueuedData([]);
    });

    afterEach(() => {
        resetMockWorker();
        useOperationStore.getState().setQueuedData([]);
    });

    it('should render the Queued Operations heading', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('Queued Operations')).toBeVisible();
    });

    it('should render table headers', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('Server')).toBeVisible();
        await expect.element(page.getByText('Operation', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Author')).toBeVisible();
        await expect.element(page.getByText('Submit date')).toBeVisible();
        await expect.element(page.getByText('Start date')).toBeVisible();
    });

    it('should render operation data in the table', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('mailstore1.test.com')).toBeVisible();
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await expect.element(page.getByText('mailstore2.test.com')).toBeVisible();
        await expect.element(page.getByText('doExport')).toBeVisible();
    });

    it('should show Empty Table when no queued operations', async () => {
        setupGetAllServersInterceptor();
        setQueuedData([]);
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('Empty Table')).toBeVisible();
    });

    it('should show author in the table rows', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        const authorElements = page.getByText('admin@test.com');
        expect(authorElements.elements().length).toBeGreaterThanOrEqual(1);
    });

    it('should open wizard detail panel when a row is clicked', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('Details')).toBeVisible();
        await expect.element(page.getByText('Operation Type')).toBeVisible();
    });

    it('should show operation name and server name in wizard header', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect
            .element(page.getByText('doBackup on mailstore1.test.com'))
            .toBeVisible();
    });

    it('should show CANCEL OPERATION button for queued operations', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('CANCEL OPERATION')).toBeVisible();
    });

    it('should open confirmation modal when CANCEL OPERATION is clicked', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await page.getByText('CANCEL OPERATION').click();
        await expect
            .element(page.getByText('You are cancelling doBackup'))
            .toBeVisible();
        await expect.element(page.getByText('LET IT RUN')).toBeVisible();
    });

    it('should close confirmation modal when LET IT RUN is clicked', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await page.getByText('CANCEL OPERATION').click();
        await expect.element(page.getByText('You are cancelling doBackup')).toBeVisible();
        await page.getByText('LET IT RUN').click();
        expect(page.getByText('You are cancelling doBackup').elements()).toHaveLength(0);
    });

    it('should close wizard panel when close button is clicked', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('doBackup on mailstore1.test.com')).toBeVisible();
        await page.getByTestId('icon: CloseOutline').click();
        expect(page.getByText('doBackup on mailstore1.test.com').elements()).toHaveLength(0);
    });

    it('should show COPY button in wizard detail panel', async () => {
        setupGetAllServersInterceptor();
        setQueuedData();
        await setupBrowserTest(
            <QuededDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('COPY')).toBeVisible();
    });
});
