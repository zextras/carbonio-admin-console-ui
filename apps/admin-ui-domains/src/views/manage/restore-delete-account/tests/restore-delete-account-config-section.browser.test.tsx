/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { RestoreDeleteAccountConfigSection } from '../restore-delete-account-config-section';
import { RestoreDeleteAccountContext } from '../restore-delete-account-context';

type SearchDirectoryParams = { query?: { _content?: string } };

const INITIAL_DETAIL: Record<string, unknown> = {
	name: 'alice@old.example.com',
	copyAccount: 'alice@old.example.com',
	copyDomain: '',
	createDate: '2025-06-15T10:00:00',
	dateTime: null,
	lastAvailableStatus: false,
	hsmApply: false,
	isEmailNotificationEnable: false,
	notificationReceiver: '',
	serverName: 'mail1.example.com',
};

const DOMAIN_LIST = [
	{ id: 'd1', name: 'example.com', a: [] },
	{ id: 'd2', name: 'restore.example.com', a: [] },
];

const ConfigSectionHarness = () => {
	const [detail, setDetail] = useState<Record<string, unknown> | null>(INITIAL_DETAIL);
	return (
		<RestoreDeleteAccountContext.Provider
			value={{ restoreAccountDetail: detail, setRestoreAccountDetail: setDetail }}
		>
			<RestoreDeleteAccountConfigSection />
			{detail &&
				Object.entries(detail).map(([key, value]) => (
					<p key={key}>
						CTX {key}: {String(value)}
					</p>
				))}
		</RestoreDeleteAccountContext.Provider>
	);
};

function setupSearchDirectoryInterceptor(
	domains: Array<{ id: string; name: string }> = DOMAIN_LIST,
	searchTotal = domains.length,
): Array<SearchDirectoryParams> {
	const calls: Array<SearchDirectoryParams> = [];
	worker.use(
		http.post('/service/admin/soap/SearchDirectoryRequest', async ({ request }) => {
			const body = (await request.json()) as {
				Body?: { SearchDirectoryRequest?: SearchDirectoryParams };
			};
			calls.push(body?.Body?.SearchDirectoryRequest ?? {});
			return HttpResponse.json({
				Body: {
					SearchDirectoryResponse: {
						domain: domains,
						searchTotal,
						more: false,
					},
				},
			});
		}),
	);
	return calls;
}

describe('RestoreDeleteAccountConfigSection (browser)', () => {
	it('should render the info row with the account to be copied', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await expect
			.element(page.getByText(/will be copied in the account you'll select in the field below/))
			.toBeVisible();
		await expect
			.element(page.getByText('alice@old.example.com', { exact: true }))
			.toBeVisible();
	});

	it('should render the Email address input seeded with the original account', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await expect.element(page.getByLabelText('Email address')).toHaveValue('alice@old.example.com');
	});

	it('should update copyAccount in the wizard context when typing a destination account', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await userEvent.fill(page.getByLabelText('Email address'), 'bob@example.com');

		await expect.element(page.getByText('CTX copyAccount: bob@example.com')).toBeVisible();
	});

	it('should query SearchDirectory with the typed keyword after debounce', async () => {
		const calls = setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await userEvent.fill(page.getByLabelText('Domain'), 'exa');

		await vi.waitFor(() => {
			expect(calls.at(-1)?.query?._content).toBe('(|(zimbraDomainName=*exa*))');
		});
	});

	it('should set copyDomain in the wizard context when a domain is selected from the dropdown', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await page.getByLabelText('Domain').click();
		await page.getByText('restore.example.com').click();

		await expect
			.element(page.getByText('CTX copyDomain: restore.example.com'))
			.toBeVisible();
		await expect.element(page.getByLabelText('Domain')).toHaveValue('restore.example.com');
	});

	it('should clear copyDomain when the user types in the domain input', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await page.getByLabelText('Domain').click();
		await page.getByText('restore.example.com').click();
		await userEvent.type(page.getByLabelText('Domain'), 'ex');

		await expect.element(page.getByText('CTX copyDomain:', { exact: true })).toBeVisible();
	});

	it('should show the not-found error when no domain matches', async () => {
		setupSearchDirectoryInterceptor([], 0);
		await setupBrowserTest(<ConfigSectionHarness />);

		await userEvent.fill(page.getByLabelText('Domain'), 'nope');

		await expect
			.element(page.getByText('Not found - check the text and try again'))
			.toBeVisible();
	});

	it('should toggle last available status in the wizard context', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await page.getByText('Use last available status').click();
		await expect.element(page.getByText('CTX lastAvailableStatus: true')).toBeVisible();

		await page.getByText('Use last available status').click();
		await expect.element(page.getByText('CTX lastAvailableStatus: false')).toBeVisible();
	});

	it('should set dateTime in the wizard context when a date is picked', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await page.getByRole('button', { name: 'Calendar' }).click();
		await page
			.getByRole('grid')
			.getByText(String(new Date().getDate()), { exact: true })
			.click();

		await expect.element(page.getByText(/^CTX dateTime: \d{4}-\d{2}-\d{2}T/)).toBeVisible();
	});

	it('should clear dateTime and disable the date picker when last available status is enabled', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await page.getByRole('button', { name: 'Calendar' }).click();
		await page
			.getByRole('grid')
			.getByText(String(new Date().getDate()), { exact: true })
			.click();
		await expect.element(page.getByText(/^CTX dateTime: \d{4}-\d{2}-\d{2}T/)).toBeVisible();

		await page.getByText('Use last available status').click();

		await expect.element(page.getByText('CTX dateTime: null')).toBeVisible();
		await expect.element(page.getByText('CTX lastAvailableStatus: true')).toBeVisible();
		await expect.element(page.getByPlaceholder('Date', { exact: true })).toBeDisabled();
	});

	it('should toggle HSM policies in the wizard context', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await page.getByText('Apply HSM Policies after the restore').click();

		await expect.element(page.getByText('CTX hsmApply: true')).toBeVisible();
	});

	it('should toggle email notifications and enable the receiver input', async () => {
		setupSearchDirectoryInterceptor();
		await setupBrowserTest(<ConfigSectionHarness />);

		await expect
			.element(page.getByLabelText('Who needs to receive this email?'))
			.toBeDisabled();

		await page.getByText('E-mail Notifications').click();

		await expect
			.element(page.getByLabelText('Who needs to receive this email?'))
			.toBeEnabled();

		await userEvent.fill(
			page.getByLabelText('Who needs to receive this email?'),
			'admin@example.com',
		);

		await expect
			.element(page.getByText('CTX notificationReceiver: admin@example.com'))
			.toBeVisible();
	});
});
