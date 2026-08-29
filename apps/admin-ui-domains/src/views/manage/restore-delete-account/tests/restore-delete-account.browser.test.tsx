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
	default: ({
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
