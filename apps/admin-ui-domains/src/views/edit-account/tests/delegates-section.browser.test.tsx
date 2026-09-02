/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

const mockBatchService = vi.hoisted(() => vi.fn());
const mockAccountListDirectory = vi.hoisted(() => vi.fn());

vi.mock('@zextras/ui-shared', async (importOriginal) => ({
	...(await importOriginal<typeof import('@zextras/ui-shared')>()),
	batchService: mockBatchService,
}));
vi.mock('../../../services/account-list-directory-service', () => ({
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

describe('EditAccountDelegatesSection advanced table (browser)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBatchService.mockResolvedValue({});
	});

	it('shows the empty state when there are no delegates', async () => {
		setupTest({ identitiesList: [] });

		await page.getByText('Switch to Simplified View').click();

		await expect.element(page.getByText('This list is empty.')).toBeVisible();
	});

	it('keeps REMOVE disabled until a delegate row is selected', async () => {
		setupTest();

		await page.getByText('Switch to Simplified View').click();

		const removeButton = page.getByRole('button', { name: 'REMOVE' });
		await expect.element(removeButton).toBeDisabled();

		await page.getByText('writer@example.com').click();
		await expect.element(removeButton).toBeEnabled();
	});

	it('removes a selected folder delegate with a folder revoke batch and a snackbar', async () => {
		const refetchGrants = vi.fn();
		setupTest({ refetchGrants });

		await page.getByText('Switch to Simplified View').click();
		await page.getByText('writer@example.com').click();
		await page.getByRole('button', { name: 'REMOVE' }).click();

		await vi.waitFor(() => expect(mockBatchService).toHaveBeenCalled());
		const batch = mockBatchService.mock.calls[0][0];
		expect(batch.RevokeRightRequest).toHaveLength(0);
		expect(batch.FolderActionRequest).toHaveLength(1);
		expect(batch.FolderActionRequest[0].action).toEqual({ op: '!grant', id: 'f-1', zid: 'z-1' });
		await expect.element(page.getByText(/rights deleted successfully/i)).toBeVisible();
		expect(refetchGrants).toHaveBeenCalled();
	});

	it('EDIT opens the wizard prefilled and re-grants the right after revoking it', async () => {
		setupTest();

		await page.getByText('Switch to Simplified View').click();
		await page.getByText('sender@example.com').click();
		await page.getByRole('button', { name: 'EDIT' }).click();

		await expect.element(page.getByText('Add user on Delegates List')).toBeVisible();

		await page.getByRole('button', { name: 'NEXT' }).click();
		await expect
			.element(page.getByText('Send Mails only (no rights to read folders)'))
			.toBeVisible();
		await expect
			.element(page.getByRole('radio', { name: /send as \(recipients will display/i }))
			.toBeChecked();

		await page.getByRole('button', { name: 'NEXT' }).click();
		await expect
			.element(page.getByText(/will be able to send mails as jane@example.com/i))
			.toBeVisible();

		await page.getByRole('button', { name: 'ADD', exact: true }).click();

		await vi.waitFor(() => expect(mockBatchService.mock.calls).toHaveLength(2));
		const revokeBatch = mockBatchService.mock.calls[0][0];
		expect(revokeBatch.RevokeRightRequest).toHaveLength(1);
		expect(revokeBatch.RevokeRightRequest[0].right._content).toBe('sendAs');
		const grantBatch = mockBatchService.mock.calls[1][0];
		expect(grantBatch.GrantRightRequest).toHaveLength(1);
		expect(grantBatch.GrantRightRequest[0].grantee._content).toBe('sender@example.com');
		expect(grantBatch.GrantRightRequest[0].right._content).toBe('sendAs');
		await expect.element(page.getByText(/updated successfully/i)).toBeVisible();
	});

	it('completes the add-delegate wizard granting the chosen sending option', async () => {
		const refetchGrants = vi.fn();
		mockAccountListDirectory.mockResolvedValue({
			account: [{ id: 'g-9', name: 'newbie@example.com' }],
		});
		setupTest({ refetchGrants });

		await page.getByText('Switch to Simplified View').click();
		await page.getByRole('button', { name: 'ADD NEW' }).click();
		await expect.element(page.getByText('SELECT MODE')).toBeVisible();

		const searchInput = page.getByRole('textbox', { name: /search here for an account/i });
		await searchInput.fill('new');
		await vi.waitFor(() => expect(mockAccountListDirectory).toHaveBeenCalled(), {
			timeout: 8_000,
		});
		await searchInput.click();
		const suggestion = page.getByText('newbie@example.com');
		await vi.waitFor(() => expect.element(suggestion).toBeVisible(), { timeout: 8_000 });
		await suggestion.click();

		await page.getByRole('button', { name: 'NEXT' }).click();
		await expect.element(page.getByText('What rights will the delegate have?')).toBeVisible();

		await page.getByText('What rights will the delegate have?').click();
		await page.getByText('Send Mails only (no rights to read folders)').click();
		await expect
			.element(page.getByRole('radio', { name: /recipients will see the sender/i }))
			.toBeVisible();
		await page.getByRole('radio', { name: /recipients will see the sender/i }).click();

		await page.getByRole('button', { name: 'NEXT' }).click();
		await expect
			.element(page.getByText(/will be able to send mails on behalf of jane@example.com/i))
			.toBeVisible();

		await page.getByRole('button', { name: 'ADD', exact: true }).click();

		await vi.waitFor(() => expect(mockBatchService).toHaveBeenCalled());
		const batch = mockBatchService.mock.calls[0][0];
		expect(batch.GrantRightRequest).toHaveLength(1);
		expect(batch.GrantRightRequest[0].right._content).toBe('sendOnBehalfOf');
		expect(batch.GrantRightRequest[0].grantee._content).toBe('newbie@example.com');
		expect(batch.FolderActionRequest).toHaveLength(0);
		await expect.element(page.getByText('DELEGATES')).toBeVisible();
		await expect.element(page.getByText(/created successfully/i)).toBeVisible();
		expect(refetchGrants).toHaveBeenCalled();
	});

	it('CANCEL closes the wizard and BACK returns to the previous step', async () => {
		setupTest();

		await page.getByText('Switch to Simplified View').click();
		await page.getByRole('button', { name: 'ADD NEW' }).click();
		await expect.element(page.getByText('SELECT MODE')).toBeVisible();

		await page.getByRole('button', { name: 'NEXT' }).click();
		await expect.element(page.getByText('What rights will the delegate have?')).toBeVisible();

		await page.getByRole('button', { name: 'BACK' }).click();
		await expect
			.element(page.getByRole('textbox', { name: /search here for an account/i }))
			.toBeVisible();

		await page.getByRole('button', { name: 'CANCEL' }).click();
		await expect.element(page.getByText('DELEGATES')).toBeVisible();
		await expect.element(page.getByText('SELECT MODE')).not.toBeInTheDocument();
	});
});

describe('EditAccountDelegatesSection simplified rights actions (browser)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBatchService.mockResolvedValue({});
	});

	it('keeps the add-rights button disabled without an account and without a checked right', async () => {
		setupTest();

		const addButton = page.getByRole('button', {
			name: /add the account \/ group with selected rights/i,
		});
		await expect.element(addButton).toBeDisabled();

		await page.getByText('Send', { exact: true }).click();
		await expect.element(addButton).toBeDisabled();
	});

	it('grants the send right to an account picked from the chip search', async () => {
		mockAccountListDirectory.mockResolvedValue({
			account: [{ id: 'a-9', name: 'newbie@example.com' }],
		});
		setupTest();

		const addButton = page.getByRole('button', {
			name: /add the account \/ group with selected rights/i,
		});
		const chipInput = page.getByPlaceholder(/start typing an account/i);
		await userEvent.type(chipInput, 'newbie');
		await vi.waitFor(() => expect(mockAccountListDirectory).toHaveBeenCalled(), {
			timeout: 8_000,
		});
		const suggestion = page.getByText('newbie@example.com');
		await vi.waitFor(() => expect.element(suggestion).toBeVisible(), { timeout: 8_000 });
		await suggestion.click();

		await page.getByText('Send', { exact: true }).click();
		await expect.element(addButton).toBeEnabled();
		await addButton.click();

		await vi.waitFor(() => expect(mockBatchService).toHaveBeenCalled());
		const batch = mockBatchService.mock.calls[0][0];
		expect(batch.GrantRightRequest).toHaveLength(1);
		expect(batch.GrantRightRequest[0].right._content).toBe('sendAs');
		expect(batch.GrantRightRequest[0].grantee._content).toBe('newbie@example.com');
		expect(batch.RevokeRightRequest).toHaveLength(1);
		expect(batch.RevokeRightRequest[0].right._content).toBe('sendOnBehalfOf');
		expect(batch.FolderActionRequest).toHaveLength(0);
		await expect.element(addButton).toBeDisabled();
	});

	it('read-only prevails over read/write when both options are toggled', async () => {
		mockAccountListDirectory.mockResolvedValue({
			account: [{ id: 'a-9', name: 'newbie@example.com' }],
		});
		setupTest();

		const chipInput = page.getByPlaceholder(/start typing an account/i);
		await userEvent.type(chipInput, 'newbie');
		await vi.waitFor(() => expect(mockAccountListDirectory).toHaveBeenCalled(), {
			timeout: 8_000,
		});
		const suggestion = page.getByText('newbie@example.com');
		await vi.waitFor(() => expect.element(suggestion).toBeVisible(), { timeout: 8_000 });
		await suggestion.click();

		await page.getByText('Read / Write', { exact: true }).first().click();
		await page.getByText('Read Only', { exact: true }).first().click();

		const addButton = page.getByRole('button', {
			name: /add the account \/ group with selected rights/i,
		});
		await expect.element(addButton).toBeEnabled();
		await addButton.click();

		await vi.waitFor(() => expect(mockBatchService).toHaveBeenCalled());
		const batch = mockBatchService.mock.calls[0][0];
		expect(batch.GrantRightRequest).toHaveLength(0);
		expect(batch.RevokeRightRequest).toHaveLength(0);
		expect(batch.FolderActionRequest).toHaveLength(1);
		expect(batch.FolderActionRequest[0].action.grant.perm).toBe('r');
		await expect.element(addButton).toBeDisabled();
	});
});
