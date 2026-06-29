/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	createBrowserZextrasActionInterceptor,
	getQueryClient,
	resetMockWorker,
	setupBrowserTest,
} from 'admin-ui-test-utils';
import { HttpResponse } from 'msw';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ActivationTokenSection } from '../parts/sections/activation-token-section';

vi.mock('../../../constants', async (importOriginal) => {
	const original = await importOriginal<typeof import('../../../constants')>();
	return {
		...original,
		ACTIVATION_PROGRESS_MIN_DISPLAY_MS: 100,
		ACTIVATION_PROGRESS_COMPLETE_DELAY_MS: 0,
	};
});

const LONG_TOKEN = 'ABCDEFGHIJKLMNOP';
const SHORT_TOKEN = 'AB12';

const createMockLicenseData = (responseOverrides: Record<string, unknown> = {}) => ({
	ok: true,
	response: {
		type: 'Purchased',
		subType: 'REGULAR',
		expired: false,
		authenticationToken: LONG_TOKEN,
		dateStart: new Date('2024-01-15T00:00:00Z').getTime(),
		lastValidationCheck: new Date('2024-06-01T00:00:00Z').getTime(),
		nextValidationDeadline: new Date('2024-12-31T00:00:00Z').getTime(),
		features: [],
		...responseOverrides,
	},
});

const setupTest = (
	component: React.ReactElement,
	responseOverrides?: Record<string, unknown>,
) => {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['subscription', 'license'], createMockLicenseData(responseOverrides));
	return setupBrowserTest(component, { queryClient });
};

const openMenu = async (): Promise<void> => {
	await page.getByRole('button', { name: 'More options' }).click();
};

const changeTokenMenuItem = () => page.getByRole('button', { name: 'Change token' });

describe('ActivationTokenSection', () => {
	afterEach(() => {
		resetMockWorker();
	});

	describe('token display', () => {
		it('renders the token masked by default', async () => {
			setupTest(<ActivationTokenSection />);

			await expect.element(page.getByText('AB************OP', { exact: true })).toBeVisible();
		});

		it('reveals the full token and toggles the button label when Show token is clicked', async () => {
			setupTest(<ActivationTokenSection />);

			await page.getByText('Show token').click();

			await expect.element(page.getByText(LONG_TOKEN, { exact: true })).toBeVisible();
			await expect.element(page.getByText('Hide token')).toBeVisible();
		});

		it('renders a short token unchanged (no masking)', async () => {
			setupTest(<ActivationTokenSection />, { authenticationToken: SHORT_TOKEN });

			await expect.element(page.getByText(SHORT_TOKEN, { exact: true })).toBeVisible();
		});

		it('does not render the Show token control when no token is present', async () => {
			setupTest(<ActivationTokenSection />, { authenticationToken: undefined });

			expect(page.getByText('Show token').elements()).toHaveLength(0);
			expect(page.getByText('Hide token').elements()).toHaveLength(0);
		});
	});

	describe('collapse and expand', () => {
		it('hides the details when the section is collapsed and shows them again when expanded', async () => {
			setupTest(<ActivationTokenSection />);

			await expect.element(page.getByText('Show token')).toBeVisible();

			await page.getByRole('button', { name: 'Activation token' }).click();

			expect(page.getByText('Show token').elements()).toHaveLength(0);
			expect(page.getByText('Start date').elements()).toHaveLength(0);

			await page.getByRole('button', { name: 'Activation token' }).click();

			await expect.element(page.getByText('Show token')).toBeVisible();
		});
	});

	describe('menu (default behaviour, opens modals)', () => {
		it('opens the menu with all options', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();

			await expect.element(page.getByText('Renew subscription')).toBeVisible();
			await expect.element(changeTokenMenuItem()).toBeVisible();
			await expect.element(page.getByText('Deactivate subscription')).toBeVisible();
		});

		it('opens the change token modal when Change token is selected', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();
			await changeTokenMenuItem().click();

			await expect.element(page.getByText('CONFIRM TOKEN')).toBeVisible();
		});

		it('closes the change token modal via CANCEL', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();
			await changeTokenMenuItem().click();
			await expect.element(page.getByText('CONFIRM TOKEN')).toBeVisible();

		await page.getByText('CANCEL', { exact: true }).click();

		expect(page.getByText('CONFIRM TOKEN').elements()).toHaveLength(0);
	});

	it('opens the deactivate modal when Deactivate subscription is selected', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();
			await page.getByText('Deactivate subscription').click();

			await expect.element(page.getByText('YES, DEACTIVATE')).toBeVisible();
		});

		it('closes the deactivate modal via NO, CANCEL', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();
			await page.getByText('Deactivate subscription').click();
			await expect.element(page.getByText('YES, DEACTIVATE')).toBeVisible();

			await page.getByText('NO, CANCEL').click();

			await expect.element(page.getByText('YES, DEACTIVATE')).not.toBeVisible();
		});

		it('shows an info snackbar when Renew subscription is selected', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();
			await page.getByText('Renew subscription').click();

			await expect
				.element(page.getByText('Subscription renewal feature is in progress.'))
				.toBeVisible();
		});
	});

	describe('menu outside click', () => {
		it('closes the menu when clicking outside', async () => {
			setupTest(<ActivationTokenSection />);

			await openMenu();
			await expect.element(page.getByText('Renew subscription')).toBeVisible();

			await userEvent.click(document.body);

			expect(page.getByText('Renew subscription').elements()).toHaveLength(0);
		});
	});

	describe('menu with onMenuOptionSelect callback', () => {
		it('calls the callback with change-token instead of opening the modal', async () => {
			const onMenuOptionSelect = vi.fn();
			setupTest(<ActivationTokenSection onMenuOptionSelect={onMenuOptionSelect} />);

			await openMenu();
			await changeTokenMenuItem().click();

		expect(onMenuOptionSelect).toHaveBeenCalledWith('change-token');
		expect(page.getByText('CONFIRM TOKEN').elements()).toHaveLength(0);
	});

		it('calls the callback with deactivate-license instead of opening the modal', async () => {
			const onMenuOptionSelect = vi.fn();
			setupTest(<ActivationTokenSection onMenuOptionSelect={onMenuOptionSelect} />);

			await openMenu();
			await page.getByText('Deactivate subscription').click();

			expect(onMenuOptionSelect).toHaveBeenCalledWith('deactivate-license');
			await expect.element(page.getByText('YES, DEACTIVATE')).not.toBeVisible();
		});

		it('calls the callback with renew-token', async () => {
			const onMenuOptionSelect = vi.fn();
			setupTest(<ActivationTokenSection onMenuOptionSelect={onMenuOptionSelect} />);

			await openMenu();
			await page.getByText('Renew subscription').click();

			expect(onMenuOptionSelect).toHaveBeenCalledWith('renew-token');
		});
	});

	describe('validation rows', () => {
		it('shows the validation check rows for a non-ISP subscription', async () => {
			setupTest(<ActivationTokenSection />);

			await expect.element(page.getByText('Last validation check')).toBeVisible();
			await expect.element(page.getByText('Next validation check')).toBeVisible();
		});

		it('hides the validation check rows for an ISP subscription', async () => {
			setupTest(<ActivationTokenSection />, { type: 'ISP' });

			expect(page.getByText('Last validation check').elements()).toHaveLength(0);
			expect(page.getByText('Next validation check').elements()).toHaveLength(0);
		});

		it('renders a dash for a missing start date without crashing', async () => {
			setupTest(<ActivationTokenSection />, { dateStart: undefined });

			await expect.element(page.getByText('Start date')).toBeVisible();
		});
	});

	describe('mutations', () => {
		it('calls activate-license with the new token when changing the token', async () => {
			const interceptor = createBrowserZextrasActionInterceptor('activate-license', () =>
				HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								message: 'License activated successfully',
								response: { type: 'Purchased', subType: 'REGULAR', features: [] },
							}),
						},
					},
				}),
			);

			setupTest(<ActivationTokenSection />);

			await openMenu();
			await changeTokenMenuItem().click();

			const input = page.getByRole('textbox');
			await userEvent.type(input, 'NEW-TOKEN-XYZ');
			await page.getByText('CONFIRM TOKEN').click();

			await expect.poll(() => interceptor.getCalledTimes()).toBe(1);

			const body = interceptor.getLastRequestBody<Record<string, any>>();
			expect(body!.Body.zextras.token).toBe('NEW-TOKEN-XYZ');
			expect(body!.Body.zextras).not.toHaveProperty('renewal');
		});

		it('calls doRemoveLicense when deactivating the subscription', async () => {
			const interceptor = createBrowserZextrasActionInterceptor('doRemoveLicense', () =>
				HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								message: 'License deactivated successfully',
								response: { type: 'None', features: [] },
							}),
						},
					},
				}),
			);

			setupTest(<ActivationTokenSection />);

			await openMenu();
			await page.getByText('Deactivate subscription').click();
			await page.getByText('YES, DEACTIVATE').click();

			await expect.poll(() => interceptor.getCalledTimes()).toBe(1);

			const body = interceptor.getLastRequestBody<Record<string, any>>();
			expect(body!.Body.zextras.action).toBe('doRemoveLicense');
			expect(body!.Body.zextras.iamsure).toBe(true);
		});
	});

	describe('activation progress flow', () => {
		it('shows the progress popover and completes on a successful activation', async () => {
			createBrowserZextrasActionInterceptor('activate-license', () =>
				HttpResponse.json({
					Body: {
						response: {
							content: JSON.stringify({
								ok: true,
								message: 'License activated successfully',
								response: { type: 'Purchased', subType: 'REGULAR', features: [] },
							}),
						},
					},
				}),
			);

			setupTest(<ActivationTokenSection />);

			await openMenu();
			await changeTokenMenuItem().click();

			const input = page.getByRole('textbox');
			await userEvent.type(input, 'PROGRESS-TOKEN');
			await page.getByText('CONFIRM TOKEN').click();

			await expect.element(page.getByText('Activating subscription')).toBeVisible();
			await expect.element(page.getByText('Activating subscription')).not.toBeVisible();
		});
	});
});
