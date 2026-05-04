/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { useOperationStore } from '../../../store/operation/store';
import { type Operation } from '../../../types/operations';
import RunningDetailPanel from '../running-detail-panel';

const MOCK_RUNNING_OPERATIONS: Array<Operation> = [
    {
        id: 'op-1',
        name: 'doBackup',
        host: 'mailstore1.test.com',
        serverName: 'mailstore1.test.com',
        module: 'ZxBackup',
        state: 'Started',
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
        state: 'Started',
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

function setRunningData(data: Array<Operation> = MOCK_RUNNING_OPERATIONS): void {
    useOperationStore.getState().setRunningData(data);
}

describe('RunningDetailPanel', () => {
    const mockGetAllOperationAPICallHandler = vi.fn();

    beforeEach(() => {
        vi.resetAllMocks();
        useOperationStore.getState().setRunningData([]);
    });

    afterEach(() => {
        resetMockWorker();
        useOperationStore.getState().setRunningData([]);
    });

    it('should render the Running Operations heading', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('Running Operations')).toBeVisible();
    });

    it('should render table headers', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('Server')).toBeVisible();
        await expect.element(page.getByText('Operation', { exact: true })).toBeVisible();
        await expect.element(page.getByText('Author')).toBeVisible();
        await expect.element(page.getByText('Submit date')).toBeVisible();
        await expect.element(page.getByText('Start date')).toBeVisible();
    });

    it('should render operation data in the table', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('mailstore1.test.com')).toBeVisible();
        await expect.element(page.getByText('doBackup')).toBeVisible();
        await expect.element(page.getByText('mailstore2.test.com')).toBeVisible();
        await expect.element(page.getByText('doExport')).toBeVisible();
    });

    it('should show Empty Table when no running operations', async () => {
        setupGetAllServersInterceptor();
        setRunningData([]);
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await expect.element(page.getByText('Empty Table')).toBeVisible();
    });

    it('should show author in the table rows', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        const authorElements = page.getByText('admin@test.com');
        expect(authorElements.elements().length).toBeGreaterThanOrEqual(1);
    });

    it('should open wizard detail panel when a row is clicked', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('Details')).toBeVisible();
        await expect.element(page.getByText('Operation Type')).toBeVisible();
    });

    it('should show operation name and server name in wizard header', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect
            .element(page.getByText('doBackup on mailstore1.test.com'))
            .toBeVisible();
    });

    it('should show STOP OPERATION button for started operations', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('STOP OPERATION')).toBeVisible();
    });

    it('should open confirmation modal when STOP OPERATION is clicked', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await page.getByText('STOP OPERATION').click();
        await expect
            .element(page.getByText('You are stopping doBackup'))
            .toBeVisible();
        await expect.element(page.getByText('LET IT RUN')).toBeVisible();
    });

    it('should close confirmation modal when LET IT RUN is clicked', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await page.getByText('STOP OPERATION').click();
        await expect.element(page.getByText('You are stopping doBackup')).toBeVisible();
        await page.getByText('LET IT RUN').click();
        expect(page.getByText('You are stopping doBackup').elements()).toHaveLength(0);
    });

    it('should close wizard panel when close button is clicked', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('doBackup on mailstore1.test.com')).toBeVisible();
        await page.getByTestId('icon: CloseOutline').click();
        expect(page.getByText('doBackup on mailstore1.test.com').elements()).toHaveLength(0);
    });

    it('should show COPY button in wizard detail panel', async () => {
        setupGetAllServersInterceptor();
        setRunningData();
        await setupBrowserTest(
            <RunningDetailPanel getAllOperationAPICallHandler={mockGetAllOperationAPICallHandler} />,
        );
        await page.getByText('doBackup').click();
        await expect.element(page.getByText('COPY')).toBeVisible();
    });
});
