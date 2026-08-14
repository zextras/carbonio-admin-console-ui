/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { set2faPolicies } from '../../../../services/set-2fa-policies';
import DomainTwoFactorAuthentication from '../domain-2fa';

vi.mock('../../../../services/list-2fa-policies', () => ({
	list2faPolicies: vi.fn().mockResolvedValue({
		Body: {
			response: {
				content: JSON.stringify({ response: { values: [] } }),
			},
		},
	}),
}));

vi.mock('../../../../services/set-2fa-policies', () => ({
	set2faPolicies: vi.fn().mockResolvedValue({
		Body: {
			response: {
				content: JSON.stringify({ ok: 'ok', message: 'ok' }),
			},
		},
	}),
}));

vi.mock('../../two-factor-authentication/2fa-config', () => ({
	TwoFactorAuthencationConfig: ({ modifyPolicies }: { modifyPolicies: any }) => (
		<button
			type="button"
			onClick={(): void => {
				modifyPolicies([
					{
						WebUI: { trustedDevice: 1, trustedIpRange: [] },
					},
				]);
			}}
		>
			Mock 2FA Config
		</button>
	),
}));

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

const INITIAL_POLICY = [{ WebUI: { trustedDevice: 0, trustedIpRange: [] } }];

function setup(ui: ReactElement, initialPolicies: unknown[] = INITIAL_POLICY) {
	const queryClient = getQueryClient();
	queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
		id: DOMAIN_ID,
		name: DOMAIN_NAME,
		a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
	});
	// Pre-populate 2fa policies to avoid loading state
	queryClient.setQueryData(['2fa-policies', DOMAIN_NAME], initialPolicies);
	return setupBrowserTest(ui, {
		queryClient,
		withDomainIdRoute: true,
		initialRouterEntry: `/${DOMAIN_ID}`,
	});
}

const mockedSet2faPolicies = vi.mocked(set2faPolicies);

describe('DomainTwoFactorAuthentication (browser)', () => {
	describe('Rendering', () => {
		it('renders the 2-Factor-Authentication title', async () => {
			setup(<DomainTwoFactorAuthentication />);

			await expect
				.element(page.getByText('2-Factor-Authentication'))
				.toBeVisible();
		});

		it('does not show Save and Cancel buttons when not dirty', async () => {
			setup(<DomainTwoFactorAuthentication />);

			await expect
				.element(page.getByText('2-Factor-Authentication'))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /^save$/i }))
				.not.toBeInTheDocument();
			await expect
				.element(page.getByRole('button', { name: /^cancel$/i }))
				.not.toBeInTheDocument();
		});
	});

	describe('Dirty state', () => {
		it('shows Save and Cancel buttons after modifying policies', async () => {
			setup(<DomainTwoFactorAuthentication />);

			await expect
				.element(page.getByText('2-Factor-Authentication'))
				.toBeVisible();

			await page.getByRole('button', { name: /mock 2fa config/i }).click();

			await expect
				.element(page.getByRole('button', { name: /^save$/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /^cancel$/i }))
				.toBeVisible();
		});

		it('hides Save and Cancel after clicking Cancel', async () => {
			setup(<DomainTwoFactorAuthentication />);

			await expect
				.element(page.getByText('2-Factor-Authentication'))
				.toBeVisible();

			await page.getByRole('button', { name: /mock 2fa config/i }).click();
			await expect
				.element(page.getByRole('button', { name: /^cancel$/i }))
				.toBeVisible();

			await page.getByRole('button', { name: /^cancel$/i }).click();

			await expect
				.element(page.getByRole('button', { name: /^save$/i }))
				.not.toBeInTheDocument();
		});
	});

	describe('Save', () => {
		it('calls set2faPolicies when Save is clicked', async () => {
			setup(<DomainTwoFactorAuthentication />);

			await expect
				.element(page.getByText('2-Factor-Authentication'))
				.toBeVisible();

			await page.getByRole('button', { name: /mock 2fa config/i }).click();
			await page.getByRole('button', { name: /^save$/i }).click();

			expect(mockedSet2faPolicies).toHaveBeenCalled();
		});

		it('shows a success snackbar after saving', async () => {
			setup(<DomainTwoFactorAuthentication />);

			await expect
				.element(page.getByText('2-Factor-Authentication'))
				.toBeVisible();

			await page.getByRole('button', { name: /mock 2fa config/i }).click();
			await page.getByRole('button', { name: /^save$/i }).click();

			await expect
				.element(
					page.getByText('The settings have been applied to all services'),
				)
				.toBeVisible();
		});
	});
});
