/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	setupBrowserTest as _setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import { ZX_ADDRESS_BOOK } from '../../../../../constants';
import { DomainAddressBook } from '../domain-address-book';

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

type ZextrasBody = {
	_jsns: string;
	module: string;
	action: string;
	domain?: string;
	account?: string;
	folder?: string;
	class?: string;
};

type ZextrasRequestBody = {
	Body: {
		zextras: ZextrasBody;
	};
};

type AddressBookListItem = {
	account: string;
	accountId: string;
	folderIds: string;
	folders: Array<{ id: string; name: string; isShared: boolean }>;
};

type ContactFolder = {
	id: string;
	name: string;
	isShared: boolean;
};

const DEFAULT_BOOKS: Array<AddressBookListItem> = [
	{
		account: 'alice@example.com',
		accountId: 'acc-1',
		folderIds: 'all',
		folders: [{ id: 'all', name: 'all', isShared: false }],
	},
	{
		account: 'bob@example.com',
		accountId: 'acc-2',
		folderIds: '7',
		folders: [{ id: '7', name: '/Contacts/Work', isShared: false }],
	},
];

const DEFAULT_FOLDERS: Array<ContactFolder> = [
	{ id: '7', name: '/Contacts/Work', isShared: false },
	{ id: '8', name: '/Contacts/Personal', isShared: false },
];

const SEARCH_ACCOUNTS = [
	{ name: 'carol@example.com', id: 'acc-3' },
	{ name: 'dave@example.com', id: 'acc-4' },
];

function buildZextrasResponse(response: Record<string, unknown>): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					ok: true,
					response,
				}),
			},
		},
	};
}

function setupSearchDirectoryInterceptor(
	accounts: Array<{ name: string; id: string }> = SEARCH_ACCOUNTS,
): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('SearchDirectory', {
		account: accounts,
		searchTotal: accounts.length,
		more: false,
	});
}

function setupAddressBookZextrasInterceptor(
	options: {
		books?: Array<AddressBookListItem>;
		folders?: Array<ContactFolder>;
	} = {},
): {
	capturedActions: Array<ZextrasBody>;
	setBooks: (books: Array<AddressBookListItem>) => void;
} {
	let books = options.books ?? DEFAULT_BOOKS;
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

			if (action === 'ListAddressBookCommand') {
				return HttpResponse.json(
					buildZextrasResponse({ 'address books': books }),
				);
			}

			if (action === 'GetMailboxContactFoldersCommand') {
				return HttpResponse.json(buildZextrasResponse({ folders }));
			}

			if (action === 'AddAddressBookCommand' || action === 'RemoveAddressBookCommand') {
				return HttpResponse.json(
					buildZextrasResponse({ message: 'ok' }),
				);
			}

			return HttpResponse.json({ Body: {} });
		}),
	);

	return {
		capturedActions,
		setBooks: (next): void => {
			books = next;
		},
	};
}

function setupBrowserTest(ui: ReactElement): Promise<RenderResult> {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	return _setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

describe('DomainAddressBook (browser)', () => {
	describe('List', () => {
		it('should render the Address Book title, Add button, description, and search', async () => {
			setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await expect
				.element(page.getByText('Address Book', { exact: true }))
				.toBeInTheDocument();
			await expect.element(page.getByRole('button', { name: 'Add' })).toBeInTheDocument();
			await expect
				.element(
					page.getByText(
						/Accounts whose address books are shared through the LDAP Address Book service for example\.com/i,
					),
				)
				.toBeInTheDocument();
			await expect.element(page.getByLabelText('Search accounts')).toBeInTheDocument();
		});

		it('should display shared account emails', async () => {
			setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await expect.element(page.getByText('alice@example.com')).toBeInTheDocument();
			await expect.element(page.getByText('bob@example.com')).toBeInTheDocument();
		});

		it('should show empty state when there are no address books', async () => {
			setupAddressBookZextrasInterceptor({ books: [] });
			await setupBrowserTest(<DomainAddressBook />);

			await expect.element(page.getByText('This list is empty.')).toBeInTheDocument();
		});

		it('should filter accounts by search and show no-match message', async () => {
			setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await expect.element(page.getByText('alice@example.com')).toBeInTheDocument();

			const search = page.getByLabelText('Search accounts');
			await userEvent.type(search, 'bob');

			await expect.element(page.getByText('bob@example.com')).toBeInTheDocument();
			await expect.element(page.getByText('alice@example.com')).not.toBeInTheDocument();

			await userEvent.clear(search);
			await userEvent.type(search, 'zzz');

			await expect
				.element(page.getByText(/No accounts or address books match “zzz”/i))
				.toBeInTheDocument();
		});

		it('should request ListAddressBookCommand for the domain', async () => {
			const { capturedActions } = setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await expect.element(page.getByText('alice@example.com')).toBeInTheDocument();
			await expect
				.poll(() =>
					capturedActions.some((action) => action.action === 'ListAddressBookCommand'),
				)
				.toBe(true);

			const listRequest = capturedActions.find(
				(action) => action.action === 'ListAddressBookCommand',
			);
			expect(listRequest).toMatchObject({
				module: ZX_ADDRESS_BOOK,
				action: 'ListAddressBookCommand',
				domain: DOMAIN_NAME,
			});
		});
	});

	describe('Add panel', () => {
		it('should open Share a new address book panel from Add', async () => {
			setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByRole('button', { name: 'Add' }));

			await expect
				.element(page.getByText('Share a new address book', { exact: true }))
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
			setupSearchDirectoryInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByRole('button', { name: 'Add' }));
			const accountInput = page.getByLabelText(/Start typing an account e-mail/i);
			await userEvent.type(accountInput, 'a');
			await userEvent.clear(accountInput);

			await expect.element(page.getByText('Account is required')).toBeInTheDocument();
		});

		it('should close the panel when Cancel is clicked', async () => {
			setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByRole('button', { name: 'Add' }));
			await expect
				.element(page.getByText('Share a new address book', { exact: true }))
				.toBeInTheDocument();

			await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

			await expect
				.element(page.getByText('Share a new address book', { exact: true }))
				.not.toBeInTheDocument();
		});

		it('should keep Add disabled until a valid account is selected', async () => {
			setupAddressBookZextrasInterceptor();
			setupSearchDirectoryInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByRole('button', { name: 'Add' }));
			await expect
				.element(page.getByText('Share a new address book', { exact: true }))
				.toBeInTheDocument();

			const panelAddButton = page.getByRole('button', { name: 'Add' }).nth(1);
			await expect.element(panelAddButton).toBeDisabled();
		});
	});

	describe('Detail panel', () => {
		it('should open detail with shared folders for an account', async () => {
			setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByText('alice@example.com'));

			await expect
				.element(page.getByText('alice@example.com').first())
				.toBeInTheDocument();
			await expect
				.element(page.getByText('Shared address books', { exact: true }))
				.toBeInTheDocument();
			await expect.element(page.getByText('All folders')).toBeInTheDocument();
		});

		it('should share all address books from the detail inline add', async () => {
			const { capturedActions, setBooks } = setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByText('bob@example.com'));
			await expect.element(page.getByText('Work')).toBeInTheDocument();

			await userEvent.click(page.getByRole('button', { name: 'Add address book' }));
			await expect
				.element(page.getByText('Add address books', { exact: true }))
				.toBeInTheDocument();

			setBooks([
				{
					account: 'bob@example.com',
					accountId: 'acc-2',
					folderIds: 'all',
					folders: [{ id: 'all', name: 'all', isShared: false }],
				},
				...DEFAULT_BOOKS.filter((book) => book.account !== 'bob@example.com'),
			]);

			await userEvent.click(page.getByRole('button', { name: 'Add' }).nth(1));

			await expect.element(page.getByText('Address book shared')).toBeInTheDocument();
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
				account: 'bob@example.com',
				folder: 'all',
			});
		});

		it('should remove a shared folder after confirmation', async () => {
			const { capturedActions, setBooks } = setupAddressBookZextrasInterceptor();
			await setupBrowserTest(<DomainAddressBook />);

			await userEvent.click(page.getByText('alice@example.com'));
			await expect.element(page.getByText('All folders')).toBeInTheDocument();

			await userEvent.click(page.getByRole('button', { name: 'Remove folder' }));
			await expect
				.element(page.getByText('Remove folder?', { exact: true }))
				.toBeInTheDocument();

			setBooks(DEFAULT_BOOKS.filter((book) => book.account !== 'alice@example.com'));
			await userEvent.click(page.getByRole('button', { name: 'Remove', exact: true }));

			await expect
				.element(page.getByText('Folder removed successfully'))
				.toBeInTheDocument();
			await expect
				.poll(() =>
					capturedActions.some((action) => action.action === 'RemoveAddressBookCommand'),
				)
				.toBe(true);

			const removeRequest = capturedActions.find(
				(action) => action.action === 'RemoveAddressBookCommand',
			);
			expect(removeRequest).toMatchObject({
				module: ZX_ADDRESS_BOOK,
				action: 'RemoveAddressBookCommand',
				domain: DOMAIN_NAME,
				account: 'alice@example.com',
				folder: 'all',
			});

			// Detail stays open with empty folders so admin can add another folder.
			await expect
				.element(page.getByText('alice@example.com').first())
				.toBeInTheDocument();
			await expect
				.element(page.getByText('No address book is shared for this account.'))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: 'Add address book' }))
				.toBeInTheDocument();
		});
	});
});
