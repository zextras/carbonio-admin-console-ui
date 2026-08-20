/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

const mockBatchService = vi.hoisted(() => vi.fn());
const mockAccountListDirectory = vi.hoisted(() => vi.fn());

vi.mock('../../../../services/batch-service', () => ({
	batchService: mockBatchService,
}));
vi.mock('../../../../services/account-list-directory-service', () => ({
	accountListDirectory: mockAccountListDirectory,
}));

import { EditAccountDelegatesSection } from '../delegates-section/delegates-section';
import { AccountFormTestProvider } from './account-form-test-provider';

const IDENTITIES = [
	{
		grantee: [{ id: 'g-1', name: 'sender@example.com', type: 'usr' }],
		right: [{ _content: 'sendAs' }],
	},
	{
		grantee: [{ id: 'g-2', name: 'writer@example.com', type: 'usr' }],
		folder: [{ id: 'f-1', zid: 'z-1', perm: 'rwidxa' }],
	},
	{
		grantee: [{ id: 'g-3', name: 'reader@example.com', type: 'grp' }],
		folder: [{ id: 'f-2', zid: 'z-2', perm: 'r' }],
	},
];

function setupTest(contextOverrides: Record<string, unknown> = {}): void {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], { supported: true });

	setupBrowserTest(
		<AccountFormTestProvider
			values={{
				zimbraId: 'self-id',
				name: 'jane@example.com',
				zimbraMailDeliveryAddress: 'jane@example.com',
			}}
			contextOverrides={{
				identitiesList: IDENTITIES,
				folderList: [],
				refetchGrants: vi.fn(),
				...contextOverrides,
			}}
		>
			<EditAccountDelegatesSection />
		</AccountFormTestProvider>,
		{ queryClient },
	);
}

describe('EditAccountDelegatesSection (browser)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBatchService.mockResolvedValue({});
	});

	it('renders the simplified view by default with rights tables and send settings', async () => {
		setupTest();

		await expect.element(page.getByText("Delegate's Rights")).toBeVisible();
		await expect
			.element(page.getByText(/delegate's general send settings/i))
			.toBeVisible();
		await expect.element(page.getByText('Read / Write').first()).toBeVisible();
		await expect.element(page.getByText('Read Only').first()).toBeVisible();
		await expect.element(page.getByText('Send on Behalf of')).toBeVisible();
	});

	it('sorts delegates into the correct rights tables', async () => {
		setupTest();

		await expect.element(page.getByText('writer@example.com')).toBeVisible();
		await expect.element(page.getByText('reader@example.com')).toBeVisible();
		await expect.element(page.getByText('sender@example.com')).toBeVisible();
	});

	it('revokes a send right from the simplified view via a batch request', async () => {
		setupTest();

		await page.getByText('sender@example.com').click();

		// 3 tables x (REMOVE + REMOVE ALL): the send table's REMOVE is index 4
		const removeButton = page.getByRole('button', { name: 'REMOVE' }).nth(4);
		await expect.element(removeButton).toBeEnabled();
		await removeButton.click();

		await vi.waitFor(() => expect(mockBatchService).toHaveBeenCalled());
		const batch = mockBatchService.mock.calls[0][0];
		expect(batch.RevokeRightRequest).toHaveLength(1);
		expect(batch.RevokeRightRequest[0].right._content).toBe('sendAs');
		expect(batch.RevokeRightRequest[0].grantee._content).toBe('sender@example.com');
	});

	it('advanced view shows the delegates table and opens the add-delegate wizard', async () => {
		setupTest();

		// label is inverted in the original UI: the simplified view shows
		// "Switch to Simplified View" and clicking it opens the advanced view
		await page.getByText('Switch to Simplified View').click();

		await expect.element(page.getByText('DELEGATES')).toBeVisible();
		await expect.element(page.getByText('Sharing Options')).toBeVisible();

		await page.getByRole('button', { name: 'ADD NEW' }).click();
		await expect.element(page.getByText('SELECT MODE')).toBeVisible();
	});
});
