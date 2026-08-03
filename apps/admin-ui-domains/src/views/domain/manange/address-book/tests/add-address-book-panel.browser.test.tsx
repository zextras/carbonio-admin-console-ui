/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	createBrowserSoapAPIInterceptor,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import { AddAddressBookPanel } from '../add-address-book-panel';

const DOMAIN_NAME = 'example.com';
const MAILSTORE = 'mail1.example.com';

type ZextrasBody = {
	_jsns: string;
	module: string;
	action: string;
	domain?: string;
	account?: string;
	folder?: string;
	targetServers?: string;
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
	{ name: 'carol@example.com', id: 'acc-3' },
	{ name: 'dave@example.com', id: 'acc-4' },
];

function buildZextrasResponse(serverName: string, response: Record<string, unknown>): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					response: {
						[serverName]: {
							ok: true,
							response,
						},
					},
					nested: true,
					ok: true,
				}),
			},
		},
	};
}

function setupGetAllServersInterceptor(): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('GetAllServers', {
		server: [
			{
				name: MAILSTORE,
				id: 'server-1',
				a: [
					{ n: 'description', _content: 'Mailstore' },
					{ n: 'zimbraServiceHostname', _content: MAILSTORE },
					{ n: 'zimbraId', _content: 'server-1' },
				],
			},
		],
	});
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
	folders: Array<ContactFolder> = DEFAULT_FOLDERS,
): {
	capturedActions: Array<ZextrasBody>;
} {
	const capturedActions: Array<ZextrasBody> = [];

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as ZextrasRequestBody;
			const zextrasBody = body?.Body?.zextras;

			if (!zextrasBody) {
				return HttpResponse.json({ Body: {} });
			}

			const { action, targetServers = MAILSTORE } = zextrasBody;
			capturedActions.push(zextrasBody);

			if (action === 'GetMailboxContactFoldersCommand') {
				return HttpResponse.json(buildZextrasResponse(targetServers, { folders }));
			}

			if (action === 'AddAddressBookCommand') {
				return HttpResponse.json(
					buildZextrasResponse(targetServers, { message: 'ok' }),
				);
			}

			return HttpResponse.json({ Body: {} });
		}),
	);

	return { capturedActions };
}

function renderPanel(
	ui: ReactElement,
): Promise<RenderResult> {
	return setupBrowserTest(ui);
}

describe('AddAddressBookPanel (browser)', () => {
	beforeEach(() => {
		setupGetAllServersInterceptor();
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
			.element(page.getByText('Share a new address book', { exact: true }))
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
		setupSearchDirectoryInterceptor();
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

	it('should keep Add disabled until a valid account is selected', async () => {
		setupAddressBookZextrasInterceptor();
		setupSearchDirectoryInterceptor();
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
});
