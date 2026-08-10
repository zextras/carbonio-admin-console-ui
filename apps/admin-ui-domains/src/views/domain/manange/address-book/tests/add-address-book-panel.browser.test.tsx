/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

vi.mock('lodash-es', async (importOriginal) => {
	const actual = await importOriginal<typeof import('lodash-es')>();
	return {
		...actual,
		debounce: <Args extends Array<unknown>>(
			fn: (...args: Args) => void,
		): ((...args: Args) => void) & { cancel: () => void; flush: () => void } => {
			const wrapped = (...args: Args): void => {
				fn(...args);
			};
			wrapped.cancel = (): void => undefined;
			wrapped.flush = (): void => undefined;
			return wrapped;
		},
	};
});

vi.mock('@zextras/ui-shared', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@zextras/ui-shared')>();
	return {
		...actual,
		searchDirectory: vi.fn(),
	};
});

import { searchDirectory } from '@zextras/ui-shared';
import {
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import type { AddressBookEntry } from '../../../../../../types';
import { ZX_ADDRESS_BOOK } from '../../../../../constants';
import { AddAddressBookPanel } from '../add-address-book-panel';

const searchDirectoryMock = vi.mocked(searchDirectory);

const DOMAIN_NAME = 'example.com';
const ACCOUNT_EMAIL = 'carol@example.com';

type ZextrasBody = {
	_jsns: string;
	module: string;
	action: string;
	domain?: string;
	account?: string;
	folder?: string;
	exposed?: boolean;
};

type ZextrasRequestBody = {
	Body: {
		zextras: ZextrasBody;
	};
};

type ContactFolder = {
	id: string;
	name: string;
	isShared: boolean;
};

const DEFAULT_FOLDERS: Array<ContactFolder> = [
	{ id: '7', name: '/Contacts/Work', isShared: false },
	{ id: '8', name: '/Contacts/Personal', isShared: false },
];

const SEARCH_ACCOUNTS = [
	{ name: ACCOUNT_EMAIL, id: 'acc-3' },
	{ name: 'dave@example.com', id: 'acc-4' },
];

const ALL_SHARED_ENTRY: AddressBookEntry = {
	account: ACCOUNT_EMAIL,
	accountId: 'acc-3',
	folderIds: 'all',
	folders: [{ id: 'all', name: 'all', isShared: false }],
};

const PARTIAL_SHARED_ENTRY: AddressBookEntry = {
	account: ACCOUNT_EMAIL,
	accountId: 'acc-3',
	folderIds: '7',
	folders: [{ id: '7', name: '/Contacts/Work', isShared: false }],
};

function buildZextrasResponse(
	response: Record<string, unknown> = {},
	ok = true,
	message?: string,
): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					ok,
					message,
					response: ok ? response : undefined,
				}),
			},
		},
	};
}

function mockSearchDirectorySuccess(
	accounts: Array<{ name: string; id: string }> = SEARCH_ACCOUNTS,
): void {
	searchDirectoryMock.mockResolvedValue({
		account: accounts.map((account) => ({
			...account,
			a: [],
		})),
		searchTotal: accounts.length,
		more: false,
	});
}

function setupAddressBookZextrasInterceptor(
	options: {
		folders?: Array<ContactFolder>;
		foldersError?: string;
		addError?: string;
	} = {},
): {
	capturedActions: Array<ZextrasBody>;
} {
	const folders = options.folders ?? DEFAULT_FOLDERS;
	const capturedActions: Array<ZextrasBody> = [];

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as ZextrasRequestBody;
			const zextrasBody = body?.Body?.zextras;

			if (!zextrasBody) {
				return HttpResponse.json({ Body: {} });
			}

			const { action } = zextrasBody;
			capturedActions.push(zextrasBody);

			if (action === 'GetMailboxContactFoldersCommand') {
				if (options.foldersError) {
					return HttpResponse.json(
						buildZextrasResponse({}, false, options.foldersError),
					);
				}
				return HttpResponse.json(buildZextrasResponse({ folders }));
			}

			if (action === 'AddAddressBookCommand') {
				if (options.addError) {
					return HttpResponse.json(
						buildZextrasResponse({}, false, options.addError),
					);
				}
				return HttpResponse.json(
					buildZextrasResponse({ message: 'ok' }),
				);
			}

			return HttpResponse.json({ Body: {} });
		}),
	);

	return { capturedActions };
}

function renderPanel(ui: ReactElement): Promise<RenderResult> {
	return setupBrowserTest(ui);
}

async function selectAccountFromSearch(email: string = ACCOUNT_EMAIL): Promise<void> {
	const accountInput = page.getByLabelText(/Start typing an account e-mail/i);
	await userEvent.type(accountInput, email.slice(0, 5));
	await expect
		.poll(() => searchDirectoryMock.mock.calls.length)
		.toBeGreaterThan(0);
	await userEvent.click(accountInput);
	await expect
		.element(page.getByText(email, { exact: true }))
		.toBeInTheDocument();
	await userEvent.click(page.getByText(email, { exact: true }));
	await expect
		.element(page.getByLabelText(/Start typing an account e-mail/i))
		.toHaveValue(email);
}

async function openFolderSelectAndChoose(folderLabel: string): Promise<void> {
	await userEvent.click(page.getByText(/Select an address book/i));
	await expect.element(page.getByText(folderLabel, { exact: true })).toBeInTheDocument();
	await userEvent.click(page.getByText(folderLabel, { exact: true }));
}

describe('AddAddressBookPanel (browser)', () => {
	beforeEach(() => {
		searchDirectoryMock.mockReset();
		mockSearchDirectorySuccess();
	});

	it('should render the panel title, account field, and folder options', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await expect
			.element(page.getByText('Expose a new address book', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByLabelText(/Start typing an account e-mail/i))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('All address books', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('A specific address book', { exact: true }))
			.toBeInTheDocument();
	});

	it('should show Account is required after clearing the account field', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		const accountInput = page.getByLabelText(/Start typing an account e-mail/i);
		await userEvent.type(accountInput, 'a');
		await userEvent.clear(accountInput);

		await expect.element(page.getByText('Account is required')).toBeInTheDocument();
	});

	it('should show an invalid email error for malformed input', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		const accountInput = page.getByLabelText(/Start typing an account e-mail/i);
		await userEvent.type(accountInput, 'not-an-email');

		await expect
			.element(page.getByText('Enter a valid email address'))
			.toBeInTheDocument();
	});

	it('should call onClose when Cancel is clicked', async () => {
		setupAddressBookZextrasInterceptor();
		const onClose = vi.fn();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={onClose}
				onAdded={vi.fn()}
			/>,
		);

		await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

		expect(onClose).toHaveBeenCalledOnce();
	});

	it('should call onClose when the close icon is clicked', async () => {
		setupAddressBookZextrasInterceptor();
		const onClose = vi.fn();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={onClose}
				onAdded={vi.fn()}
			/>,
		);

		await page.getByTestId('icon: CloseOutline').click();

		expect(onClose).toHaveBeenCalledOnce();
	});

	it('should keep Add disabled until a valid account is selected', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await expect.element(page.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	it('should show select a valid account first when specific mode has no account', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await userEvent.click(page.getByText('A specific address book', { exact: true }));

		await expect
			.element(page.getByText('Select a valid account first'))
			.toBeInTheDocument();
	});

	it('should expose all address books after selecting an account', async () => {
		const { capturedActions } = setupAddressBookZextrasInterceptor();
		const onClose = vi.fn();
		const onAdded = vi.fn();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={onClose}
				onAdded={onAdded}
			/>,
		);

		await selectAccountFromSearch();
		await expect.element(page.getByRole('button', { name: 'Add' })).toBeEnabled();
		await userEvent.click(page.getByRole('button', { name: 'Add' }));

		await expect.element(page.getByText('Address book exposed')).toBeInTheDocument();
		expect(onAdded).toHaveBeenCalledOnce();
		expect(onClose).toHaveBeenCalledOnce();
		await expect
			.poll(() =>
				capturedActions.some((action) => action.action === 'AddAddressBookCommand'),
			)
			.toBe(true);

		const addRequest = capturedActions.find(
			(action) => action.action === 'AddAddressBookCommand',
		);
		expect(addRequest).toMatchObject({
			module: ZX_ADDRESS_BOOK,
			action: 'AddAddressBookCommand',
			domain: DOMAIN_NAME,
			account: ACCOUNT_EMAIL,
			folder: 'all',
		});
	});

	it('should expose a specific address book folder', async () => {
		const { capturedActions } = setupAddressBookZextrasInterceptor();
		const onAdded = vi.fn();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={onAdded}
			/>,
		);

		await selectAccountFromSearch();
		await userEvent.click(page.getByText('A specific address book', { exact: true }));
		await openFolderSelectAndChoose('/Contacts/Work');
		await expect.element(page.getByRole('button', { name: 'Add' })).toBeEnabled();
		await userEvent.click(page.getByRole('button', { name: 'Add' }));

		await expect.element(page.getByText('Address book exposed')).toBeInTheDocument();
		expect(onAdded).toHaveBeenCalledOnce();

		const addRequest = capturedActions.find(
			(action) => action.action === 'AddAddressBookCommand',
		);
		expect(addRequest).toMatchObject({
			module: ZX_ADDRESS_BOOK,
			account: ACCOUNT_EMAIL,
			folder: '7',
		});
	});

	it('should keep Add disabled in specific mode until a folder is selected', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await selectAccountFromSearch();
		await userEvent.click(page.getByText('A specific address book', { exact: true }));

		await expect
			.element(page.getByText(/Select an address book/i))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	it('should show all already exposed error when account has all folders linked', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[ALL_SHARED_ENTRY]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await selectAccountFromSearch();

		await expect
			.element(
				page.getByText('All address books of this account are already exposed.'),
			)
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Add' })).toBeDisabled();
	});

	it('should filter linked folders and label exposed ones in the folder select', async () => {
		setupAddressBookZextrasInterceptor({
			folders: [
				{ id: '7', name: '/Contacts/Work', isShared: false },
				{ id: '8', name: '/Contacts/Personal', isShared: false },
				{ id: '9', name: '/Contacts/External', isShared: true },
			],
		});
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[PARTIAL_SHARED_ENTRY]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await selectAccountFromSearch();
		await userEvent.click(page.getByText('A specific address book', { exact: true }));
		await userEvent.click(page.getByText(/Select an address book/i));

		await expect
			.element(page.getByText('/Contacts/Personal', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('/Contacts/External (Shared)', { exact: true }))
			.toBeInTheDocument();
		await expect
			.element(page.getByText('/Contacts/Work', { exact: true }))
			.not.toBeInTheDocument();
	});

	it('should show an error snackbar when contact folders fail to load', async () => {
		setupAddressBookZextrasInterceptor({ foldersError: 'Folders unavailable' });
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		await selectAccountFromSearch();

		await expect.element(page.getByText('Folders unavailable')).toBeInTheDocument();
	});

	it('should show an error snackbar when add address book fails', async () => {
		setupAddressBookZextrasInterceptor({ addError: 'Add failed' });
		const onClose = vi.fn();
		const onAdded = vi.fn();
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={onClose}
				onAdded={onAdded}
			/>,
		);

		await selectAccountFromSearch();
		await expect.element(page.getByRole('button', { name: 'Add' })).toBeEnabled();
		await userEvent.click(page.getByRole('button', { name: 'Add' }));

		await expect.element(page.getByText('Add failed')).toBeInTheDocument();
		expect(onAdded).not.toHaveBeenCalled();
		expect(onClose).not.toHaveBeenCalled();
		await expect
			.element(page.getByText('Expose a new address book', { exact: true }))
			.toBeInTheDocument();
	});

	it('should show an error snackbar when account search fails', async () => {
		setupAddressBookZextrasInterceptor();
		searchDirectoryMock.mockRejectedValue(new Error('Search failed'));
		await renderPanel(
			<AddAddressBookPanel
				domainName={DOMAIN_NAME}
				existingEntries={[]}
				onClose={vi.fn()}
				onAdded={vi.fn()}
			/>,
		);

		const accountInput = page.getByLabelText(/Start typing an account e-mail/i);
		await userEvent.type(accountInput, 'carol');

		await expect.element(page.getByText('Search failed')).toBeInTheDocument();
	});
});
