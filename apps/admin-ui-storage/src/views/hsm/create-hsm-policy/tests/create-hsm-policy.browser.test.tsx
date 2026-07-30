/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { CreateHsmPolicyProps, Volume } from '../../../../../types';
import { CreateHsmPolicy } from '../create-hsm-policy';

const SERVER_NAME = 'mailstore1.test.com';

const VOLUME_LIST: Array<Volume> = [
	{ id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
	{ id: 2, name: 'Secondary Volume', type: 2, isCurrent: false },
];

function makeProps(
	overrides?: Partial<CreateHsmPolicyProps>,
): CreateHsmPolicyProps {
	return {
		setShowCreateHsmPolicyView: vi.fn(),
		volumeList: VOLUME_LIST,
		createHSMpolicy: vi.fn(),
		runCustomHSMpolicy: vi.fn(),
		...overrides,
	};
}

function renderComponent(props: CreateHsmPolicyProps): React.ReactElement {
	return (
		<Routes>
			<Route
				path="/:server/hsm-settings"
				element={<CreateHsmPolicy {...props} />}
			/>
		</Routes>
	);
}

const ROUTE_ENTRY = `/${SERVER_NAME}/hsm-settings`;

describe('CreateHsmPolicy (browser)', () => {
	describe('Rendering', () => {
		it('renders the Section title with the server name', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await expect
				.element(
					page.getByText(`${SERVER_NAME} | Create New Policy`, { exact: true }),
				)
				.toBeVisible();
		});

		it('renders the Policy Settings step label', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await expect
				.element(page.getByText('Policy Settings', { exact: true }))
				.toBeVisible();
		});

		it('renders the Create Policy step label', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await expect
				.element(page.getByText('Create Policy', { exact: true }))
				.toBeVisible();
		});

		it('renders the Cancel button on the first step', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await expect
				.element(page.getByRole('button', { name: /^cancel$/i }))
				.toBeVisible();
		});

		it('renders the NEXT button on the first step', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await expect
				.element(page.getByRole('button', { name: /^next$/i }))
				.toBeVisible();
		});

		it('renders the policy settings view content (Items heading)', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await expect.element(page.getByText('Items', { exact: true })).toBeVisible();
		});
	});

	describe('Cancel action', () => {
		it('calls setShowCreateHsmPolicyView(false) when the wizard Cancel button is clicked', async () => {
			const mockSetShow = vi.fn();
			await setupBrowserTest(
				renderComponent(makeProps({ setShowCreateHsmPolicyView: mockSetShow })),
				{ initialRouterEntry: ROUTE_ENTRY },
			);
			await page.getByRole('button', { name: /^cancel$/i }).click();
			expect(mockSetShow).toHaveBeenCalledWith(false);
		});

		it('does not close the panel when CREATE is clicked (only the wizard onComplete closes it)', async () => {
			const mockSetShow = vi.fn();
			await setupBrowserTest(
				renderComponent(makeProps({ setShowCreateHsmPolicyView: mockSetShow })),
				{ initialRouterEntry: ROUTE_ENTRY },
			);
			await page.getByRole('button', { name: /^next$/i }).click();
			await page.getByRole('button', { name: /^create$/i }).click();
			expect(mockSetShow).not.toHaveBeenCalled();
		});
	});

	describe('Wizard navigation', () => {
		it('moves to the Create Policy step and shows summary when NEXT is clicked', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await page.getByRole('button', { name: /^next$/i }).click();
			await expect
				.element(page.getByText('New Policy Summary', { exact: true }))
				.toBeVisible();
		});

		it('shows the BACK button on the second step', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await page.getByRole('button', { name: /^next$/i }).click();
			await expect
				.element(page.getByRole('button', { name: /^back$/i }))
				.toBeVisible();
		});

		it('shows the CREATE and RUN ONLY buttons on the second step', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await page.getByRole('button', { name: /^next$/i }).click();
			await expect
				.element(page.getByRole('button', { name: /^create$/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /run only/i }))
				.toBeVisible();
		});

		it('moves back to the Policy Settings step when BACK is clicked', async () => {
			await setupBrowserTest(renderComponent(makeProps()), {
				initialRouterEntry: ROUTE_ENTRY,
			});
			await page.getByRole('button', { name: /^next$/i }).click();
			await page.getByRole('button', { name: /^back$/i }).click();
			await expect
				.element(page.getByText('Items', { exact: true }))
				.toBeVisible();
		});
	});

	describe('Create / Run actions', () => {
		it('calls createHSMpolicy with form values and allVolumes when CREATE is clicked', async () => {
			const mockCreate = vi.fn();
			await setupBrowserTest(
				renderComponent(makeProps({ createHSMpolicy: mockCreate })),
				{ initialRouterEntry: ROUTE_ENTRY },
			);
			await page.getByRole('button', { name: /^next$/i }).click();
			await page.getByRole('button', { name: /^create$/i }).click();
			expect(mockCreate).toHaveBeenCalledTimes(1);
			const arg = mockCreate.mock.calls[0][0];
			expect(arg.allVolumes).toEqual(VOLUME_LIST);
			expect(arg.isAllEnabled).toBe(true);
			expect(arg.isMessageEnabled).toBe(true);
		});

		it('calls runCustomHSMpolicy with form values and allVolumes when RUN ONLY is clicked', async () => {
			const mockRun = vi.fn();
			await setupBrowserTest(
				renderComponent(makeProps({ runCustomHSMpolicy: mockRun })),
				{ initialRouterEntry: ROUTE_ENTRY },
			);
			await page.getByRole('button', { name: /^next$/i }).click();
			await page.getByRole('button', { name: /run only/i }).click();
			expect(mockRun).toHaveBeenCalledTimes(1);
			const arg = mockRun.mock.calls[0][0];
			expect(arg.allVolumes).toEqual(VOLUME_LIST);
		});
	});
});
