/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

const mockFetchSoap = vi.hoisted(() => vi.fn());

vi.mock('../../../services/zextras-fetch', async (importOriginal) => ({
	...(await importOriginal<typeof import('../../../services/zextras-fetch')>()),
	fetchSoap: mockFetchSoap,
}));
vi.mock('../../../hooks/use-selected-domain', () => ({
	useSelectedDomain: (): { data: { id: string; name: string } } => ({
		data: { id: 'domain-1', name: 'zextras.com' },
	}),
}));

import { ServicesPassphraseServices } from '../../utility/utils';
import { ServicesPassphrase } from '../services-passphrase';
import { AccountFormTestProvider } from './account-form-test-provider';

const SERVICES_FIRST_VALUE = ServicesPassphraseServices()[0].value;

const CREDENTIALS = [
	{
		id: 'cred-1',
		label: 'my mobile',
		services: 'imap',
		enabled: true,
	},
];

function setupTest(): void {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['advanced-supported'], { supported: true });

	setupBrowserTest(
		<AccountFormTestProvider
			values={{ uid: 'jane', name: 'jane@example.com', zimbraId: 'acc-1' }}
			contextOverrides={{ credentialList: CREDENTIALS }}
		>
			<ServicesPassphrase />
		</AccountFormTestProvider>,
		{ queryClient },
	);
}

describe('ServicesPassphrase (browser)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the existing credentials from the context', async () => {
		setupTest();

		await expect.element(page.getByText('my mobile')).toBeVisible();
		await expect.element(page.getByText('cred-1')).toBeVisible();
	});

	it('creates a credential and shows the one-time password dialog', async () => {
		setupTest();
		mockFetchSoap.mockResolvedValue({
			ok: true,
			response: {
				list: { label: 'my mobile', services: 'imap' },
				text_data: { password: 'one-time-secret' },
			},
		});

		await page.getByRole('textbox', { name: /^label$/i }).fill('my mobile');
		await page.getByRole('button', { name: 'CREATE' }).click();

		await vi.waitFor(() => expect(mockFetchSoap).toHaveBeenCalled());
		const [, payload] = mockFetchSoap.mock.calls[0];
		expect(payload.request).toBe('add');
		expect(payload.account).toBe('jane@zextras.com');
		expect(payload.label).toBe('my mobile');
		expect(payload.services).toBe(SERVICES_FIRST_VALUE);

		// one-time password dialog
		await vi.waitFor(() => expect.element(page.getByText('one-time-secret')).toBeVisible());
		await page.getByRole('button', { name: /i have copied the password/i }).click();
		await expect.element(page.getByText('one-time-secret')).not.toBeInTheDocument();
	});

	it('deletes a credential via the row action', async () => {
		setupTest();
		mockFetchSoap.mockResolvedValue({ ok: true, response: {} });

		await page.getByRole('button', { name: 'DELETE' }).click();

		await vi.waitFor(() => expect(mockFetchSoap).toHaveBeenCalled());
		const [, payload] = mockFetchSoap.mock.calls[0];
		expect(payload.request).toBe('delete');
		expect(payload.password_id).toBe('cred-1');
		expect(payload.account).toBe('jane@zextras.com');
	});
});
