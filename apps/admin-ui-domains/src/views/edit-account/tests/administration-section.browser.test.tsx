/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

const mockGetAccountMembershipRequest = vi.hoisted(() => vi.fn());
const mockGetInitializedDomains = vi.hoisted(() => vi.fn());
const mockSearchDirectory = vi.hoisted(() => vi.fn());
const mockAddDistributionListMember = vi.hoisted(() => vi.fn());
const mockRemoveDistributionListMember = vi.hoisted(() => vi.fn());

vi.mock('../../../services/get-account-membership', () => ({
	getAccountMembershipRequest: mockGetAccountMembershipRequest,
}));
vi.mock('../../../services/get-initialized-domains', () => ({
	getInitializedDomains: mockGetInitializedDomains,
}));
vi.mock('../../../services/add-distributionlist-member-service', () => ({
	addDistributionListMember: mockAddDistributionListMember,
}));
vi.mock('../../../services/remove-distributionlist-member-service', () => ({
	removeDistributionListMember: mockRemoveDistributionListMember,
}));
vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	searchDirectory: mockSearchDirectory,
}));

import { EditAccountAdministrationSection } from '../administration-section';
import { AccountFormTestProvider } from './account-form-test-provider';

const ADMIN_GROUP_DL = {
	id: 'dl-1',
	name: 'zextras-admins__zextras.com',
	a: [
		{ n: 'zimbraIsAdminGroup', _content: 'TRUE' },
		{ n: 'displayName', _content: 'Zextras Admins' },
	],
};

function setupTest(): void {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], { supported: true });

	setupBrowserTest(
		<AccountFormTestProvider
			values={{
				zimbraId: 'acc-1',
				name: 'jane@example.com',
				zimbraIsAdminAccount: 'FALSE',
				zimbraIsDelegatedAdminAccount: 'TRUE',
			}}
		>
			<EditAccountAdministrationSection />
		</AccountFormTestProvider>,
		{ queryClient },
	);
}

describe('EditAccountAdministrationSection (browser)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetAccountMembershipRequest.mockResolvedValue({
			dl: [
				ADMIN_GROUP_DL,
				// non-admin group: filtered out of the rights table
				{ id: 'dl-2', name: 'plain-group__zextras.com', a: [] },
				// indirect membership (via): filtered out
				{
					id: 'dl-3',
					name: 'nested__zextras.com',
					via: 'parent-dl',
					a: [{ n: 'zimbraIsAdminGroup', _content: 'TRUE' }],
				},
			],
		});
		mockGetInitializedDomains.mockResolvedValue({
			searchTotal: 1,
			domain: [{ id: 'domain-1', name: 'zextras.com' }],
		});
		mockSearchDirectory.mockResolvedValue({ dl: [ADMIN_GROUP_DL] });
		mockAddDistributionListMember.mockResolvedValue({});
		mockRemoveDistributionListMember.mockResolvedValue({});
	});

	it('loads admin-group memberships into the rights table (via and non-admin filtered)', async () => {
		setupTest();

		await expect.element(page.getByText('Roles')).toBeVisible();
		await expect.element(page.getByText('zextras-adminszextras.com')).toBeVisible();
		await expect
			.element(page.getByText('plain-groupzextras.com'))
			.not.toBeInTheDocument();
		await expect.element(page.getByText('nestedzextras.com')).not.toBeInTheDocument();
	});

	it('fetches admin groups for a picked domain and grants the right on Add', async () => {
		setupTest();

		// open the domain dropdown (initial empty-search domain list) and pick one
		const domainInput = page.getByRole('textbox', { name: /^domain$/i });
		await vi.waitFor(() => expect.element(domainInput).toBeVisible());
		await domainInput.click();
		await page.getByText('zextras.com', { exact: true }).click();
		await expect.element(domainInput).toHaveValue('zextras.com');

		// admin groups for the domain load into the rights select
		await page.getByText(/rights \(access control lists\)/i).first().click();
		await page.getByText('Zextras Admins').click();

		await page.getByRole('button', { name: /^add$/i }).click();

		expect(mockSearchDirectory).toHaveBeenCalledWith(
			expect.objectContaining({ domainName: 'zextras.com', query: 'zimbraIsAdminGroup=TRUE' }),
		);
		expect(mockAddDistributionListMember).toHaveBeenCalledWith(
			{ n: 'id', _content: 'dl-1' },
			{ n: 'dlm', _content: 'jane@example.com' },
		);
	});

	it('removes the selected right', async () => {
		setupTest();

		const row = page.getByText('zextras-adminszextras.com');
		await row.click();

		const removeButton = page.getByRole('button', { name: /^remove$/i });
		await expect.element(removeButton).toBeEnabled();
		await removeButton.click();

		expect(mockRemoveDistributionListMember).toHaveBeenCalledWith(
			{ n: 'id', _content: 'dl-1' },
			{ n: 'dlm', _content: 'jane@example.com' },
		);
	});
});
