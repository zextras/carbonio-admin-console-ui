/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createBrowserSoapAPIInterceptor, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { GlobalAdministrators } from '../global-administrators';

type AccountEntry = {
	name: string;
	id: string;
	a: Array<{ n: string; _content: string }>;
};

function buildAdminAccount(name: string, id: string, isGlobal: boolean): AccountEntry {
	return {
		name,
		id,
		a: [
			{ n: 'mail', _content: name },
			{ n: 'displayName', _content: name.split('@')[0] },
			{ n: 'zimbraAccountStatus', _content: 'active' },
			{ n: 'zimbraIsAdminAccount', _content: isGlobal ? 'TRUE' : 'FALSE' },
			{ n: 'zimbraIsDelegatedAdminAccount', _content: isGlobal ? 'FALSE' : 'TRUE' },
			{ n: 'zimbraIsSystemAccount', _content: 'FALSE' },
			{ n: 'zimbraIsExternalVirtualAccount', _content: 'FALSE' },
			{ n: 'description', _content: `${isGlobal ? 'Global' : 'Delegated'} admin account` },
		],
	};
}

const ADMIN_ACCOUNTS: Array<AccountEntry> = [
	buildAdminAccount('admin@example.com', 'acc-admin-1', true),
	buildAdminAccount('delegated@example.com', 'acc-del-1', false),
	buildAdminAccount('delegated2@corp.com', 'acc-del-2', false),
];

function setupSearchDirectoryInterceptor(
	accounts: Array<AccountEntry> = ADMIN_ACCOUNTS,
): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('SearchDirectory', {
		account: accounts,
		searchTotal: accounts.length,
		more: false,
	});
}

describe('GlobalAdministrators (browser)', () => {
	beforeEach(() => {
		// Intercept the catalog service check to prevent MSW warnings
		createBrowserSoapAPIInterceptor('GetInfo', {
			attrs: { attr: [] },
		});
	});

	describe('Rendering', () => {
		it('should render the Administrators header', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect.element(page.getByText('Administrators')).toBeVisible();
		});

		it('should render the Administration Rights subtitle', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect.element(page.getByText('Administration Rights')).toBeVisible();
		});

		it('should render table headers', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect.element(page.getByText('Account', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Type', { exact: true })).toBeVisible();
			await expect.element(page.getByText('domain', { exact: true })).toBeVisible();
			await expect.element(page.getByText('Description', { exact: true })).toBeVisible();
		});
	});

	describe('Account list with data', () => {
		it('should display admin accounts after loading', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect.element(page.getByText('admin@example.com')).toBeVisible();
			await expect.element(page.getByText('delegated@example.com')).toBeVisible();
			await expect.element(page.getByText('delegated2@corp.com')).toBeVisible();
		});

		it('should show correct account types', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect.element(page.getByText('Admin', { exact: true })).toBeVisible();
			await expect
				.element(page.getByText('DelegatedAdmin', { exact: true }).first())
				.toBeVisible();
		});

		it('should show domain extracted from account name', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect
				.element(page.getByText('example.com', { exact: true }).first())
				.toBeVisible();
			await expect
				.element(page.getByText('corp.com', { exact: true }))
				.toBeVisible();
		});

		it('should show account descriptions', async () => {
			setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			await expect
				.element(page.getByText('Global admin account'))
				.toBeVisible();
			await expect
				.element(page.getByText('Delegated admin account').first())
				.toBeVisible();
		});
	});

	describe('Empty state', () => {
		it('should show empty state when no admin accounts exist', async () => {
			setupSearchDirectoryInterceptor([]);

			setupBrowserTest(<GlobalAdministrators />);

			await expect
				.element(page.getByText('This list is empty.'))
				.toBeVisible();
		});

		it('should show help text in empty state', async () => {
			setupSearchDirectoryInterceptor([]);

			setupBrowserTest(<GlobalAdministrators />);

			await expect
				.element(page.getByText(/You can create a new Account/))
				.toBeVisible();
		});
	});

	describe('API interaction', () => {
		it('should send SearchDirectory request with admin filter query', async () => {
			const interceptor = setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			const requestParams = (await interceptor) as any;
			expect(requestParams.types).toBe('accounts');
			expect(requestParams.query).toContain('zimbraIsAdminAccount=TRUE');
			expect(requestParams.query).toContain('zimbraIsDelegatedAdminAccount=TRUE');
		});

		it('should request correct offset and limit', async () => {
			const interceptor = setupSearchDirectoryInterceptor();

			setupBrowserTest(<GlobalAdministrators />);

			const requestParams = (await interceptor) as any;
			expect(requestParams.offset).toBe(0);
			expect(requestParams.limit).toBe(10);
		});
	});

	describe('Single admin account', () => {
		it('should render one account correctly', async () => {
			const singleAdmin = [buildAdminAccount('root@test.org', 'acc-root-1', true)];
			setupSearchDirectoryInterceptor(singleAdmin);

			setupBrowserTest(<GlobalAdministrators />);

			await expect.element(page.getByText('root@test.org')).toBeVisible();
			await expect.element(page.getByText('Admin', { exact: true })).toBeVisible();
			await expect.element(page.getByText('test.org', { exact: true })).toBeVisible();
		});
	});
});
