/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import type { AddressBookEntry } from '../../../../../../types';
import { ZX_ADDRESS_BOOK } from '../../../../../constants';
import { AddressBookDetailPanel } from '../address-book-detail-panel';

const DOMAIN_NAME = 'example.com';

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

const ALL_SHARED_ENTRY: AddressBookEntry = {
	account: 'alice@example.com',
	accountId: 'acc-1',
	folderIds: 'all',
	folders: [{ id: 'all', name: 'all', isShared: false }],
};

const PARTIAL_SHARED_ENTRY: AddressBookEntry = {
	account: 'bob@example.com',
	accountId: 'acc-2',
	folderIds: '7',
	folders: [{ id: '7', name: '/Contacts/Work', isShared: false }],
};

function buildZextrasResponse(content: Record<string, unknown>): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					ok: true,
					...content,
				}),
			},
		},
	};
}

function buildNestedOkResponse(): object {
	return buildZextrasResponse({
		nested: true,
		response: {
			'mail1.example.com': { ok: true, message: 'ok' },
		},
	});
}

function buildGetExposedResponse(entry: AddressBookEntry): object {
	return buildZextrasResponse({
		nested: true,
		response: {
			'mail1.example.com': {
				ok: true,
				response: {
					folders: [
						{
							account: entry.account,
							accountId: entry.accountId,
							folders: (entry.folders ?? []).map((folder) => ({
								id: folder.id,
								name: folder.name,
								mounted: folder.isShared === true,
							})),
						},
					],
				},
			},
		},
	});
}

function setupAddressBookZextrasInterceptor(
	folders: Array<ContactFolder> = DEFAULT_FOLDERS,
	entry: AddressBookEntry = ALL_SHARED_ENTRY,
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

			const { action } = zextrasBody;
			capturedActions.push(zextrasBody);

			if (action === 'GetAddressBookCommand') {
				const requestAccount = zextrasBody.account ?? entry.account;
				const matchedEntry =
					requestAccount === PARTIAL_SHARED_ENTRY.account
						? PARTIAL_SHARED_ENTRY
						: entry.account === requestAccount
							? entry
							: ALL_SHARED_ENTRY.account === requestAccount
								? ALL_SHARED_ENTRY
								: PARTIAL_SHARED_ENTRY;

				if (zextrasBody.exposed === false) {
					return HttpResponse.json(
						buildZextrasResponse({
							nested: true,
							response: {
								'mail1.example.com': {
									ok: true,
									response: {
										folders: [
											{
												account: matchedEntry.account,
												accountId: matchedEntry.accountId,
												folders: folders.map((folder) => ({
													id: folder.id,
													name: folder.name,
													mounted: folder.isShared,
												})),
											},
										],
									},
								},
							},
						}),
					);
				}

				return HttpResponse.json(buildGetExposedResponse(matchedEntry));
			}

			if (action === 'AddAddressBookCommand' || action === 'RemoveAddressBookCommand') {
				return HttpResponse.json(buildNestedOkResponse());
			}

			return HttpResponse.json({ Body: {} });
		}),
	);

	return { capturedActions };
}

function renderPanel(ui: ReactElement): Promise<RenderResult> {
	return setupBrowserTest(ui);
}

describe('AddressBookDetailPanel (browser)', () => {
	it('should render the account email and exposed folders section', async () => {
		const { capturedActions } = setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={ALL_SHARED_ENTRY}
				onClose={vi.fn()}
				onChanged={vi.fn()}
			/>,
		);

		await expect.element(page.getByText('alice@example.com').first()).toBeInTheDocument();
		await expect
			.element(page.getByText('Exposed address books', { exact: true }))
			.toBeInTheDocument();
		await expect.element(page.getByText('All folders')).toBeInTheDocument();
		await expect
			.poll(() =>
				capturedActions.some((action) => action.action === 'GetAddressBookCommand'),
			)
			.toBe(true);
		expect(
			capturedActions.find(
				(action) => action.action === 'GetAddressBookCommand' && action.exposed === true,
			),
		).toMatchObject({
			module: ZX_ADDRESS_BOOK,
			action: 'GetAddressBookCommand',
			domain: DOMAIN_NAME,
			account: 'alice@example.com',
			exposed: true,
		});
	});

	it('should show exposed folder display names from GetAddressBookCommand', async () => {
		setupAddressBookZextrasInterceptor(DEFAULT_FOLDERS, PARTIAL_SHARED_ENTRY);
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={PARTIAL_SHARED_ENTRY}
				onClose={vi.fn()}
				onChanged={vi.fn()}
			/>,
		);

		await expect.element(page.getByText('Work')).toBeInTheDocument();
	});

	it('should show Shared label for mounted folders in the exposed list', async () => {
		const mountedEntry: AddressBookEntry = {
			account: 'shared@example.com',
			accountId: 'acc-shared',
			folderIds: '258',
			folders: [{ id: '258', name: '/MyAddressbook of dhaval', isShared: true }],
		};
		setupAddressBookZextrasInterceptor([], mountedEntry);
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={mountedEntry}
				onClose={vi.fn()}
				onChanged={vi.fn()}
			/>,
		);

		await expect
			.element(page.getByText('MyAddressbook of dhaval (Shared)', { exact: true }))
			.toBeInTheDocument();
	});

	it('should call onClose when the close button is clicked', async () => {
		setupAddressBookZextrasInterceptor();
		const onClose = vi.fn();
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={ALL_SHARED_ENTRY}
				onClose={onClose}
				onChanged={vi.fn()}
			/>,
		);

		await page.getByTestId('icon: CloseOutline').click();

		expect(onClose).toHaveBeenCalledOnce();
	});

	it('should show all already exposed helper when every folder is exposed', async () => {
		setupAddressBookZextrasInterceptor([], PARTIAL_SHARED_ENTRY);
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={PARTIAL_SHARED_ENTRY}
				onClose={vi.fn()}
				onChanged={vi.fn()}
			/>,
		);

		await expect
			.element(
				page.getByText('Every address book of this account is already exposed.'),
			)
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Add address book' }))
			.toBeDisabled();
	});

	it('should expose all address books from the inline add form', async () => {
		const { capturedActions } = setupAddressBookZextrasInterceptor();
		const onChanged = vi.fn();
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={PARTIAL_SHARED_ENTRY}
				onClose={vi.fn()}
				onChanged={onChanged}
			/>,
		);

		await expect.element(page.getByText('Work')).toBeInTheDocument();
		await userEvent.click(page.getByRole('button', { name: 'Add address book' }));
		await expect
			.element(page.getByText('Add address books', { exact: true }))
			.toBeInTheDocument();

		await userEvent.click(page.getByRole('button', { name: 'Add' }));

		await expect.element(page.getByText('Address book exposed')).toBeInTheDocument();
		expect(onChanged).toHaveBeenCalledOnce();
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

	it('should remove an exposed folder after confirmation', async () => {
		const { capturedActions } = setupAddressBookZextrasInterceptor();
		const onChanged = vi.fn();
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={ALL_SHARED_ENTRY}
				onClose={vi.fn()}
				onChanged={onChanged}
			/>,
		);

		await expect.element(page.getByText('All folders')).toBeInTheDocument();
		await userEvent.click(page.getByRole('button', { name: 'Remove exposed folder' }));
		await expect
				.element(page.getByText('Remove exposed folder', { exact: true }))
			.toBeInTheDocument();

		await userEvent.click(page.getByRole('button', { name: 'Remove', exact: true }));

		await expect
			.element(page.getByText('Folder removed successfully'))
			.toBeInTheDocument();
		expect(onChanged).toHaveBeenCalledOnce();
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
	});

	it('should show unexposed folders for add when exposed GetAddressBookCommand fails', async () => {
		worker.use(
			http.post('/service/admin/soap/zextras', async ({ request }) => {
				const body = (await request.json()) as ZextrasRequestBody;
				const zextrasBody = body?.Body?.zextras;

				if (!zextrasBody) {
					return HttpResponse.json({ Body: {} });
				}

				if (zextrasBody.action === 'GetAddressBookCommand') {
					if (zextrasBody.exposed === true) {
						return HttpResponse.json({
							Body: {
								Fault: {
									Reason: { Text: 'GetAddressBookCommand failed' },
								},
							},
						});
					}

					return HttpResponse.json(
						buildZextrasResponse({
							nested: true,
							response: {
								'mail1.example.com': {
									ok: true,
									response: {
										folders: [
											{
												account: 'bob@example.com',
												accountId: 'acc-2',
												folders: [
													{ id: 258, name: '/Contacts/Sales', mounted: false },
													{ id: 7, name: '/Contacts/Work', mounted: false },
												],
											},
										],
									},
								},
							},
						}),
					);
				}

				return HttpResponse.json({ Body: {} });
			}),
		);

		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={{
					account: 'bob@example.com',
					accountId: 'acc-2',
					folderIds: undefined,
					folders: [],
				}}
				onClose={vi.fn()}
				onChanged={vi.fn()}
			/>,
		);

		await expect
			.element(page.getByRole('button', { name: 'Add address book' }))
			.toBeEnabled();
		await userEvent.click(page.getByRole('button', { name: 'Add address book' }));
		await expect
			.element(page.getByText('Add address books', { exact: true }))
			.toBeInTheDocument();
		await userEvent.click(page.getByText('A specific address book'));
		await expect.element(page.getByText('/Contacts/Sales')).toBeInTheDocument();
	});

	it('should cancel the inline add form without submitting', async () => {
		setupAddressBookZextrasInterceptor();
		await renderPanel(
			<AddressBookDetailPanel
				domainName={DOMAIN_NAME}
				entry={PARTIAL_SHARED_ENTRY}
				onClose={vi.fn()}
				onChanged={vi.fn()}
			/>,
		);

		await userEvent.click(page.getByRole('button', { name: 'Add address book' }));
		await expect
			.element(page.getByText('Add address books', { exact: true }))
			.toBeInTheDocument();

		await userEvent.click(page.getByRole('button', { name: 'Cancel' }));

		await expect
			.element(page.getByText('Add address books', { exact: true }))
			.not.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Add address book' }))
			.toBeInTheDocument();
	});
});
