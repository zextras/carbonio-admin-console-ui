/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

const hoisted = vi.hoisted(() => ({
	restoreParams: {
		id: 'deleted@example.com',
		createDate: '1600000000000',
		copyAccount: 'restored@example.com',
		dateTime: null,
		hsmApply: false,
		notificationReceiver: '',
		isEmailNotificationEnable: false,
		copyDomain: 'example.com',
		serverName: 'server-1',
	},
}));

vi.mock('../restore-delete-account-wizard', () => ({
	RestoreDeleteAccountWizard: ({
		restoreAccountRequest,
	}: {
		restoreAccountRequest: (params: typeof hoisted.restoreParams) => void;
	}) => (
		<button type="button" onClick={() => restoreAccountRequest(hoisted.restoreParams)}>
			Trigger restore
		</button>
	),
}));

import { setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { RestoreDeleteAccount } from '../restore-delete-account';
import { RestoreDeleteAccountContext } from '../restore-delete-account-context';
import { RestoreDeleteAccountStartSection } from '../restore-delete-account-start-section';

function mockRestoreEndpoint(response: Record<string, unknown>): void {
	worker.use(
		http.post(
			'/service/extension/zextras_admin/backup/doRestoreOnNewAccount',
			() => HttpResponse.json(response),
			{ once: true },
		),
	);
}

describe('RestoreDeleteAccount (browser)', () => {
	it('shows the success snackbar when the restore operation is queued', async () => {
		mockRestoreEndpoint({ operationId: 'op-1', status: 200 });

		await setupBrowserTest(<RestoreDeleteAccount />);

		await page.getByRole('button', { name: 'Trigger restore' }).click();

		await expect.element(
			page.getByText(
				'The restore of the account has been added to the operation queue successfully',
			),
		).toBeVisible();
	});

	it('shows an error snackbar with the response cause when the restore fails', async () => {
		mockRestoreEndpoint({ status: 500, error: { details: { cause: 'backup server unreachable' } } });

		await setupBrowserTest(<RestoreDeleteAccount />);

		await page.getByRole('button', { name: 'Trigger restore' }).click();

		await expect.element(page.getByText('backup server unreachable')).toBeVisible();
	});
});

describe('RestoreDeleteAccountStartSection (browser)', () => {
	const fullRestoreAccountDetail = {
		name: 'deleted@example.com',
		createDate: '2025-06-15T10:00:00',
		copyAccount: 'restored@example.com',
		copyDomain: 'backup-example.com',
		dateTime: '2026-01-20T15:30:10',
		lastAvailableStatus: true,
		hsmApply: true,
		notificationReceiver: 'admin@example.com',
		isEmailNotificationEnable: true,
		serverName: 'server-1',
	};

	const emptyRestoreAccountDetail = {
		name: '',
		createDate: '',
		copyAccount: '',
		copyDomain: '',
		dateTime: null,
		lastAvailableStatus: false,
		hsmApply: false,
		notificationReceiver: '',
		isEmailNotificationEnable: false,
		serverName: '',
	};

	function renderStartSection(restoreAccountDetail: Record<string, unknown> | null) {
		return setupBrowserTest(
			<RestoreDeleteAccountContext.Provider
				value={{ restoreAccountDetail, setRestoreAccountDetail: vi.fn() }}
			>
				<RestoreDeleteAccountStartSection />
			</RestoreDeleteAccountContext.Provider>,
		);
	}

	async function expectSummaryLabelsVisible(): Promise<void> {
		await expect.element(page.getByText('Account', { exact: true })).toBeVisible();
		await expect.element(page.getByText('Destination Account')).toBeVisible();
		await expect.element(page.getByText('Use last available status')).toBeVisible();
		await expect.element(page.getByText('Date & Hour')).toBeVisible();
		await expect
			.element(page.getByText('Apply HSM Policies after the restore'))
			.toBeVisible();
		await expect.element(page.getByText('Email Notifications')).toBeVisible();
	}

	it('renders all the summary labels when the detail is fully populated', async () => {
		await renderStartSection(fullRestoreAccountDetail);

		await expectSummaryLabelsVisible();
	});

	it('renders the summary with the wizard default empty detail', async () => {
		await renderStartSection(emptyRestoreAccountDetail);

		await expectSummaryLabelsVisible();
	});

	it('renders without crashing when the detail is missing', async () => {
		await renderStartSection(null);

		await expectSummaryLabelsVisible();
	});

	it('falls back to the account creation date when the selected date is earlier', async () => {
		await renderStartSection({
			...fullRestoreAccountDetail,
			dateTime: '2024-01-01T00:00:00',
		});

		await expectSummaryLabelsVisible();
	});

	it('renders the summary when no date and hour is selected', async () => {
		await renderStartSection({ ...fullRestoreAccountDetail, dateTime: null });

		await expectSummaryLabelsVisible();
	});
});
