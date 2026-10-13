/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { RestoreDeleteAccount } from '../restore-delete-account';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';
const DESTINATION_DOMAIN_NAME = 'restore.example.com';

const ACCOUNTS = [
	{
		id: 'acc-1',
		name: 'alice@example.com',
		serverName: 'mail1.example.com',
		status: 'Active',
		creationTimestamp: new Date('2025-06-15').getTime(),
	},
	{
		id: 'acc-2',
		name: 'bob@example.com',
		serverName: 'mail2.example.com',
		status: 'Deleted',
		creationTimestamp: new Date('2025-03-10').getTime(),
		deletedTimestamp: new Date('2026-01-20').getTime(),
	},
];

function setupBackupEndpoints(): void {
	worker.use(
		http.get(/\/service\/extension\/zextras_admin\/backup\/getBackupAccounts/, () =>
			HttpResponse.json({ accounts: ACCOUNTS, maxPage: 1 }),
		),
		http.post('/service/admin/soap/SearchDirectoryRequest', () =>
			HttpResponse.json({
				Body: {
					SearchDirectoryResponse: {
						domain: [{ id: 'd1', name: DESTINATION_DOMAIN_NAME, a: [] }],
						searchTotal: 1,
						more: false,
					},
				},
			}),
		),
		http.post('/service/extension/zextras_admin/backup/doRestoreOnNewAccount', () =>
			HttpResponse.json({ operationId: 'op-1', status: 200 }),
		),
	);
}

async function setupWizardView(): Promise<void> {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	await setupBrowserTest(<RestoreDeleteAccount />, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

describe('Restore Account wizard flow (browser)', () => {
	it('restores an account end to end: select, configure, confirm', async () => {
		setupBackupEndpoints();
		await setupWizardView();

		await page.getByText('alice@example.com').first().click();
		await page.getByRole('button', { name: 'NEXT', exact: true }).click();

		await expect.element(page.getByLabelText('Email address')).toHaveValue('alice@example.com');

		await page.getByLabelText('Domain').click();
		await page.getByText(DESTINATION_DOMAIN_NAME).click();
		await page.getByText('Apply HSM Policies after the restore').click();

		await page.getByRole('button', { name: 'NEXT', exact: true }).click();

		await expect
			.element(page.getByText('alice@restore.example.com', { exact: true }))
			.toBeVisible();
		await expect.element(page.getByText('Yes', { exact: true }).first()).toBeVisible();

		const restoreButton = page.getByRole('button', { name: 'Restore Account' });
		await expect.element(restoreButton).toBeEnabled();
		await restoreButton.click();

		await expect
			.element(
				page.getByText(
					'The restore of the account has been added to the operation queue successfully',
				),
			)
			.toBeVisible();
	});
});
