/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	getQueryClient,
	setupBrowserTest,
	worker,
} from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { type ReactElement } from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { type RenderResult } from 'vitest-browser-react';

import {
	ADDRESS_BOOK_SERVICE_ENABLED,
	ZX_CONFIG,
	ZX_CONFIG_GLOBAL_ACTION,
} from '../../../../constants';
import { GlobalAddressBook } from '../global-address-book';

type ZextrasRequestBody = {
	Body: {
		zextras: {
			_jsns: string;
			module: string;
			action: string;
			command?: string;
			attribute?: string;
			value?: boolean;
		};
	};
};

type ServiceState = {
	running: boolean;
	isInherited?: boolean;
};

const DEFAULT_RUNNING: ServiceState = {
	running: true,
	isInherited: false,
};

const DEFAULT_STOPPED: ServiceState = {
	running: false,
	isInherited: false,
};

function seedGlobalAdminSettings(): ReturnType<typeof getQueryClient> {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['account', 'settings'], {
		prefs: {},
		attrs: { zimbraIsAdminAccount: 'TRUE' },
		props: [],
	});
	return queryClient;
}

function renderGlobalAddressBook(ui: ReactElement = <GlobalAddressBook />): Promise<RenderResult> {
	return setupBrowserTest(ui, { queryClient: seedGlobalAdminSettings() });
}

function buildGetEnabledResponse(state: ServiceState): object {
	const valueEntry =
		state.isInherited === true
			? {
					attribute: ADDRESS_BOOK_SERVICE_ENABLED,
					inheritedValue: state.running,
					inheritedFrom: 'default',
					isInherited: true,
					modules: ['ZxAddressBook'],
				}
			: {
					attribute: ADDRESS_BOOK_SERVICE_ENABLED,
					value: state.running,
					isInherited: false,
					modules: ['ZxAddressBook'],
				};

	return {
		Body: {
			response: {
				content: JSON.stringify({
					ok: true,
					response: {
						global: '',
						values: [valueEntry],
					},
				}),
			},
		},
	};
}

function buildSetResponse(): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					ok: true,
					message: 'ok',
				}),
			},
		},
	};
}

function setupAddressBookInterceptor(state: ServiceState = DEFAULT_RUNNING): {
	capturedActions: Array<ZextrasRequestBody['Body']['zextras']>;
} {
	const capturedActions: Array<ZextrasRequestBody['Body']['zextras']> = [];
	let currentState = { ...state };

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as ZextrasRequestBody;
			const zextrasBody = body?.Body?.zextras;

			if (!zextrasBody) {
				return HttpResponse.json({ Body: {} });
			}

			if (
				zextrasBody.module === ZX_CONFIG &&
				zextrasBody.action === ZX_CONFIG_GLOBAL_ACTION &&
				zextrasBody.command === 'get' &&
				zextrasBody.attribute === ADDRESS_BOOK_SERVICE_ENABLED
			) {
				return HttpResponse.json(buildGetEnabledResponse(currentState));
			}

			if (
				zextrasBody.module === ZX_CONFIG &&
				zextrasBody.action === ZX_CONFIG_GLOBAL_ACTION &&
				zextrasBody.command === 'set' &&
				zextrasBody.attribute === ADDRESS_BOOK_SERVICE_ENABLED
			) {
				capturedActions.push(zextrasBody);
				currentState = {
					running: zextrasBody.value === true,
					isInherited: false,
				};
				return HttpResponse.json(buildSetResponse());
			}

			return HttpResponse.json({ Body: {} });
		}),
	);

	return { capturedActions };
}

describe('GlobalAddressBook (browser)', () => {
	beforeEach(() => {
		setupAddressBookInterceptor();
	});

	describe('Rendering', () => {
		it('should render the Services title', async () => {
			await renderGlobalAddressBook();
			await expect
				.element(page.getByText('Services', { exact: true }))
				.toBeInTheDocument();
		});

		it('should render the status card description and global scope note when running', async () => {
			await renderGlobalAddressBook();
			await expect
				.element(
					page.getByText(
						/Exposed address book folders are reachable by LDAP clients on every domain/i,
					),
				)
				.toBeInTheDocument();
			await expect
				.element(
					page.getByText(/Applies globally, to every domain on this infrastructure/i),
				)
				.toBeInTheDocument();
			await expect
				.element(page.getByText('Listening on port 8636.', { exact: true }))
				.toBeInTheDocument();
		});

		it('should show running status and Stop service button when service is running', async () => {
			await renderGlobalAddressBook();
			await expect.element(page.getByText('running', { exact: true })).toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /stop service/i }))
				.toBeInTheDocument();
		});

		it('should show stopped status and Start service button when service is stopped', async () => {
			setupAddressBookInterceptor(DEFAULT_STOPPED);
			await renderGlobalAddressBook();
			await expect.element(page.getByText('stopped', { exact: true })).toBeInTheDocument();
			await expect
				.element(
					page.getByText(
						/LDAP clients can’t query exposed address books while the service is stopped/i,
					),
				)
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /start service/i }))
				.toBeInTheDocument();
		});
	});

	describe('Actions', () => {
		it('should set addressBookServiceEnabled false when Stop service is clicked', async () => {
			const { capturedActions } = setupAddressBookInterceptor(DEFAULT_RUNNING);
			await renderGlobalAddressBook();

			const button = page.getByRole('button', { name: /stop service/i });
			await expect.element(button).toBeEnabled();
			await userEvent.click(button);

			await expect.poll(() => capturedActions.length).toBeGreaterThan(0);
			expect(capturedActions[0]).toMatchObject({
				module: ZX_CONFIG,
				action: ZX_CONFIG_GLOBAL_ACTION,
				command: 'set',
				attribute: ADDRESS_BOOK_SERVICE_ENABLED,
				value: false,
			});
			await expect.element(page.getByText('stopped', { exact: true })).toBeInTheDocument();
		});

		it('should set addressBookServiceEnabled true when Start service is clicked', async () => {
			const { capturedActions } = setupAddressBookInterceptor(DEFAULT_STOPPED);
			await renderGlobalAddressBook();

			const button = page.getByRole('button', { name: /start service/i });
			await expect.element(button).toBeEnabled();
			await userEvent.click(button);

			await expect.poll(() => capturedActions.length).toBeGreaterThan(0);
			expect(capturedActions[0]).toMatchObject({
				module: ZX_CONFIG,
				action: ZX_CONFIG_GLOBAL_ACTION,
				command: 'set',
				attribute: ADDRESS_BOOK_SERVICE_ENABLED,
				value: true,
			});
			await expect.element(page.getByText('running', { exact: true })).toBeInTheDocument();
		});
	});
});
