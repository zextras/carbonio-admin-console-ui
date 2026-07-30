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
import { beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { LDAP_ADDRESS_BOOK_SERVICE, ZX_ADDRESS_BOOK } from '../../../../constants';
import { GlobalAddressBook } from '../global-address-book';

type ZextrasRequestBody = {
	Body: {
		zextras: {
			_jsns: string;
			module: string;
			action: string;
			service_name?: string;
			targetServers?: string;
		};
	};
};

type ServiceState = {
	running: boolean;
	couldStart: boolean;
	couldStop: boolean;
};

const DEFAULT_RUNNING: ServiceState = {
	running: true,
	couldStart: false,
	couldStop: true,
};

const DEFAULT_STOPPED: ServiceState = {
	running: false,
	couldStart: true,
	couldStop: false,
};

function buildGetServicesResponse(serverName: string, state: ServiceState): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					response: {
						[serverName]: {
							ok: true,
							response: {
								services: {
									[LDAP_ADDRESS_BOOK_SERVICE]: {
										could_start: state.couldStart,
										could_stop: state.couldStop,
										running: state.running,
									},
								},
							},
						},
					},
					nested: true,
					ok: true,
				}),
			},
		},
	};
}

function buildActionResponse(serverName: string, message: string): object {
	return {
		Body: {
			response: {
				content: JSON.stringify({
					response: {
						[serverName]: {
							response: { message },
							ok: true,
						},
					},
					nested: true,
					ok: true,
				}),
			},
		},
	};
}

function setupAddressBookInterceptor(state: ServiceState = DEFAULT_RUNNING): {
	capturedActions: Array<ZextrasRequestBody['Body']['zextras']>;
} {
	const capturedActions: Array<ZextrasRequestBody['Body']['zextras']> = [];

	worker.use(
		http.post('/service/admin/soap/zextras', async ({ request }) => {
			const body = (await request.json()) as ZextrasRequestBody;
			const zextrasBody = body?.Body?.zextras;

			if (!zextrasBody) {
				return HttpResponse.json({ Body: {} });
			}

			const { action, targetServers = 'mail1.example.com' } = zextrasBody;

			if (action === 'getServices') {
				return HttpResponse.json(buildGetServicesResponse(targetServers, state));
			}

			if (action === 'doStartService' || action === 'doStopService') {
				capturedActions.push(zextrasBody);
				return HttpResponse.json(
					buildActionResponse(
						targetServers,
						action === 'doStartService' ? 'service started' : 'service stopped',
					),
				);
			}

			return HttpResponse.json({ Body: {} });
		}),
	);

	return { capturedActions };
}

function setupGetAllServersInterceptor(
	servers: Array<{ name: string; id: string }> = [],
): Promise<unknown> {
	return createBrowserSoapAPIInterceptor('GetAllServers', {
		server: servers.map((s) => ({
			name: s.name,
			id: s.id,
			a: [
				{ n: 'description', _content: 'Mailstore' },
				{ n: 'zimbraServiceHostname', _content: s.name },
				{ n: 'zimbraId', _content: s.id },
			],
		})),
	});
}

const MAILSTORE_SERVERS = [
	{ name: 'mail1.example.com', id: 'server-1' },
	{ name: 'mail2.example.com', id: 'server-2' },
];

describe('GlobalAddressBook (browser)', () => {
	beforeEach(() => {
		setupAddressBookInterceptor();
	});

	describe('Rendering', () => {
		it('should render the Global address book title', async () => {
			setupGetAllServersInterceptor(MAILSTORE_SERVERS);
			await setupBrowserTest(<GlobalAddressBook />);
			await expect
				.element(page.getByText('Global address book', { exact: true }))
				.toBeInTheDocument();
		});

		it('should render the service description', async () => {
			setupGetAllServersInterceptor(MAILSTORE_SERVERS);
			await setupBrowserTest(<GlobalAddressBook />);
			await expect
				.element(
					page.getByText(
						/Start or stop the LDAP Address Book service for this installation/i,
					),
				)
				.toBeInTheDocument();
		});

		it('should show running status and Stop service button when service is running', async () => {
			setupGetAllServersInterceptor(MAILSTORE_SERVERS);
			await setupBrowserTest(<GlobalAddressBook />);
			await expect.element(page.getByText('running', { exact: true })).toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /stop service/i }))
				.toBeInTheDocument();
		});

		it('should show stopped status and Start service button when service is stopped', async () => {
			setupAddressBookInterceptor(DEFAULT_STOPPED);
			setupGetAllServersInterceptor(MAILSTORE_SERVERS);
			await setupBrowserTest(<GlobalAddressBook />);
			await expect.element(page.getByText('stopped', { exact: true })).toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /start service/i }))
				.toBeInTheDocument();
		});
	});

	describe('Actions', () => {
		it('should call doStopService when Stop service is clicked', async () => {
			const { capturedActions } = setupAddressBookInterceptor(DEFAULT_RUNNING);
			setupGetAllServersInterceptor(MAILSTORE_SERVERS);
			await setupBrowserTest(<GlobalAddressBook />);

			const button = page.getByRole('button', { name: /stop service/i });
			await expect.element(button).toBeEnabled();
			await userEvent.click(button);

			await expect.poll(() => capturedActions.length).toBeGreaterThan(0);
			expect(capturedActions[0]).toMatchObject({
				module: ZX_ADDRESS_BOOK,
				action: 'doStopService',
				service_name: LDAP_ADDRESS_BOOK_SERVICE,
			});
			expect(capturedActions[0].targetServers).toBeTruthy();
			await expect.element(page.getByText('stopped', { exact: true })).toBeInTheDocument();
		});

		it('should call doStartService when Start service is clicked', async () => {
			const { capturedActions } = setupAddressBookInterceptor(DEFAULT_STOPPED);
			setupGetAllServersInterceptor(MAILSTORE_SERVERS);
			await setupBrowserTest(<GlobalAddressBook />);

			const button = page.getByRole('button', { name: /start service/i });
			await expect.element(button).toBeEnabled();
			await userEvent.click(button);

			await expect.poll(() => capturedActions.length).toBeGreaterThan(0);
			expect(capturedActions[0]).toMatchObject({
				module: ZX_ADDRESS_BOOK,
				action: 'doStartService',
				service_name: LDAP_ADDRESS_BOOK_SERVICE,
			});
			expect(capturedActions[0].targetServers).toBeTruthy();
			await expect.element(page.getByText('running', { exact: true })).toBeInTheDocument();
		});
	});
});
