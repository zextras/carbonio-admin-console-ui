/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { DeleteHsmPolicyProps, HsmPolicyFromServer } from '../../../../../types';
import { DeleteHsmPolicy } from '../delete-hsm-policy';

const POLICIES: Array<HsmPolicyFromServer> = [
	{ hsmQuery: 'before:-30d', hsmType: [5] },
	{ hsmQuery: 'before:-90d', hsmType: [5, 8, 6, 11] },
];

const SELECTED_POLICY = 'before:-30d';

function makeProps(overrides?: Partial<DeleteHsmPolicyProps>): DeleteHsmPolicyProps {
	return {
		showDeletePolicyView: true,
		setShowDeletePolicyView: vi.fn(),
		selectedPolicies: SELECTED_POLICY,
		onDeletePolicy: vi.fn(),
		isRequestInProgress: false,
		policies: POLICIES,
		...overrides,
	};
}

describe('DeleteHsmPolicy (browser)', () => {
	describe('Rendering', () => {
		it('should render the modal title', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(page.getByText('Delete HSM Policy?', { exact: true }))
				.toBeVisible();
		});

		it('should render the confirmation message', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(
					page.getByText(
						/If you delete this HSM policy you won`t be able to restore it/,
					),
				)
				.toBeVisible();
		});

		it('should render the Cancel button', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(page.getByRole('button', { name: /cancel/i }))
				.toBeVisible();
		});

		it('should render the Delete button', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(page.getByRole('button', { name: /^delete$/i }))
				.toBeVisible();
		});

		it('should render the Help button', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(page.getByRole('button', { name: /help/i }))
				.toBeVisible();
		});

		it('should render the HSM Policy label', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(page.getByText('HSM Policy', { exact: true }))
				.toBeVisible();
		});

		it('should display the selected policy value with type prefix', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(page.getByText('message:before:-30d', { exact: true }))
				.toBeVisible();
		});

		it('should display the clipboard copy hint message', async () => {
			await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
			await expect
				.element(
					page.getByText(
						/copy the policy string to the clipboard/,
					),
				)
				.toBeVisible();
		});
	});

	describe('Interactions', () => {
		it('should call setShowDeletePolicyView(false) when Cancel is clicked', async () => {
			const mockSetShow = vi.fn();
			await setupBrowserTest(
				<DeleteHsmPolicy {...makeProps({ setShowDeletePolicyView: mockSetShow })} />,
			);
			await page.getByRole('button', { name: /cancel/i }).click();
			expect(mockSetShow).toHaveBeenCalledWith(false);
		});

		it('should call onDeletePolicy when Delete is clicked', async () => {
			const mockDelete = vi.fn();
			await setupBrowserTest(
				<DeleteHsmPolicy {...makeProps({ onDeletePolicy: mockDelete })} />,
			);
			await page.getByRole('button', { name: /^delete$/i }).click();
			expect(mockDelete).toHaveBeenCalled();
		});

		it('should disable Delete button when isRequestInProgress is true', async () => {
			await setupBrowserTest(
				<DeleteHsmPolicy {...makeProps({ isRequestInProgress: true })} />,
			);
			await expect
				.element(page.getByRole('button', { name: /^delete$/i }))
				.toBeDisabled();
		});
	});

	describe('Policy type mapping', () => {
		it('should display all four types when hsmType has 4 entries', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-90d', hsmType: [5, 8, 6, 11] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({
						policies,
						selectedPolicies: 'before:-90d',
					})}
				/>,
			);
			await expect
				.element(
					page.getByText('document,message,contact,appointment:before:-90d', {
						exact: true,
					}),
				)
				.toBeVisible();
		});

		it('should display single type prefix for single-type policy', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-30d', hsmType: [8] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({
						policies,
						selectedPolicies: 'before:-30d',
					})}
				/>,
			);
			await expect
				.element(page.getByText('document:before:-30d', { exact: true }))
				.toBeVisible();
		});

		it('should display empty prefix when hsmType is empty', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-10d', hsmType: [] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({
						policies,
						selectedPolicies: 'before:-10d',
					})}
				/>,
			);
			await expect
				.element(page.getByText('before:-10d', { exact: true }))
				.toBeVisible();
		});
	});
});
