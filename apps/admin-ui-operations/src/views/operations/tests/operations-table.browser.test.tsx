/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { EXCEPTION, FINISHED, STARTED } from '../../../constants';
import { type Operation } from '../../../types/operations';
import { OperationsTable } from '../operations-table';

const UNDONE_OPERATIONS: Array<Operation> = [
	{
		id: 'op-1',
		name: 'doBackup',
		host: 'mailstore1.test.com',
		state: STARTED,
		startTime: 1742774400000,
		queuedTime: 1742774300000,
		parameters: { requesterAddress: 'admin@test.com' },
	},
];

const DONE_OPERATIONS: Array<Operation> = [
	{
		id: 'op-1',
		name: 'doBackup',
		serverName: 'mailstore1.test.com',
		state: FINISHED,
		type: FINISHED,
		startTime: 1742774400000,
		humanStartTime: '2025-03-24 00:00:00',
		parameters: { requesterAddress: 'admin@test.com' },
	},
	{
		id: 'op-2',
		name: 'doExport',
		serverName: 'mailstore2.test.com',
		state: FINISHED,
		type: EXCEPTION,
		startTime: 1742688000000,
		humanStartTime: '2025-03-23 00:00:00',
		parameters: { requesterAddress: 'user@test.com' },
	},
	{
		id: 'op-3',
		name: 'doReindex',
		serverName: 'mailstore1.test.com',
		state: STARTED,
		type: STARTED,
		startTime: 1742601600000,
		humanStartTime: '2025-03-22 00:00:00',
		parameters: { requesterAddress: 'admin@test.com' },
	},
];

const HEADERS = [
	{ id: 'h', label: 'h', width: '100px', bold: false, i18nAllLabel: 'All', align: 'left' },
];

describe('OperationsTable', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders running/queued rows with host, name and author', async () => {
		await setupBrowserTest(
			<OperationsTable
				operations={UNDONE_OPERATIONS}
				headers={HEADERS}
				donePanel={false}
				selectedRows={[]}
				onSelectionChange={vi.fn()}
				onClick={vi.fn()}
			/>,
		);

		await expect.element(page.getByText('mailstore1.test.com')).toBeVisible();
		await expect.element(page.getByText('doBackup')).toBeVisible();
		await expect.element(page.getByText('admin@test.com')).toBeVisible();
	});

	it('calls onClick with the row index when a running/queued cell is clicked', async () => {
		const onClick = vi.fn();
		await setupBrowserTest(
			<OperationsTable
				operations={UNDONE_OPERATIONS}
				headers={HEADERS}
				donePanel={false}
				selectedRows={[]}
				onSelectionChange={vi.fn()}
				onClick={onClick}
			/>,
		);

		await page.getByText('doBackup').click();

		expect(onClick).toHaveBeenCalledWith(0);
	});

	it('renders done rows with server name for every status type', async () => {
		await setupBrowserTest(
			<OperationsTable
				operations={DONE_OPERATIONS}
				headers={HEADERS}
				donePanel
				selectedRows={[]}
				onSelectionChange={vi.fn()}
				onClick={vi.fn()}
			/>,
		);

		await expect.element(page.getByText('doBackup')).toBeVisible();
		await expect.element(page.getByText('doExport')).toBeVisible();
		await expect.element(page.getByText('doReindex')).toBeVisible();
	});

	it('calls onClick with the row index when a done cell is clicked', async () => {
		const onClick = vi.fn();
		await setupBrowserTest(
			<OperationsTable
				operations={DONE_OPERATIONS}
				headers={HEADERS}
				donePanel
				selectedRows={[]}
				onSelectionChange={vi.fn()}
				onClick={onClick}
			/>,
		);

		await page.getByText('doExport').click();

		expect(onClick).toHaveBeenCalledWith(1);
	});

	it('renders Empty Table when there are no done operations', async () => {
		await setupBrowserTest(
			<OperationsTable
				operations={[]}
				headers={HEADERS}
				donePanel
				selectedRows={[]}
				onSelectionChange={vi.fn()}
				onClick={vi.fn()}
			/>,
		);

		await expect.element(page.getByText('Empty Table')).toBeVisible();
	});

	it('renders Empty Table when there are no running/queued operations', async () => {
		await setupBrowserTest(
			<OperationsTable
				operations={[]}
				headers={HEADERS}
				donePanel={false}
				selectedRows={[]}
				onSelectionChange={vi.fn()}
				onClick={vi.fn()}
			/>,
		);

		await expect.element(page.getByText('Empty Table')).toBeVisible();
	});
});
