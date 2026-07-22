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

		it('should display message: prefix for hsmType=[5]', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-30d', hsmType: [5] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({ policies, selectedPolicies: 'before:-30d' })}
				/>,
			);
			await expect
				.element(page.getByText('message:before:-30d', { exact: true }))
				.toBeVisible();
		});

		it('should display contact: prefix for hsmType=[6]', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-30d', hsmType: [6] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({ policies, selectedPolicies: 'before:-30d' })}
				/>,
			);
			await expect
				.element(page.getByText('contact:before:-30d', { exact: true }))
				.toBeVisible();
		});

		it('should display appointment: prefix for hsmType=[11]', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-30d', hsmType: [11] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({ policies, selectedPolicies: 'before:-30d' })}
				/>,
			);
			await expect
				.element(page.getByText('appointment:before:-30d', { exact: true }))
				.toBeVisible();
		});

		it('should display comma-joined types for a mixed partial hsmType', async () => {
			const policies: Array<HsmPolicyFromServer> = [
				{ hsmQuery: 'before:-30d', hsmType: [5, 8] },
			];
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({ policies, selectedPolicies: 'before:-30d' })}
				/>,
			);
			await expect
				.element(page.getByText('message,document:before:-30d', { exact: true }))
				.toBeVisible();
		});

		it('should render a no-prefix value when the selected policy is not in the list', async () => {
			await setupBrowserTest(
				<DeleteHsmPolicy
					{...makeProps({ selectedPolicies: 'nonexistent-policy' })}
				/>,
			);
			await expect
				.element(page.getByText('nonexistent-policy', { exact: true }))
				.toBeVisible();
		});
	});

	describe('Close behavior', () => {
		it('should call setShowDeletePolicyView(false) via the Modal close icon', async () => {
			const mockSetShow = vi.fn();
			await setupBrowserTest(
				<DeleteHsmPolicy {...makeProps({ setShowDeletePolicyView: mockSetShow })} />,
			);
			const closeIcon = document.querySelector('ds-icon[icon="Close"]');
			const closeBtn = closeIcon?.closest('button');
			closeBtn?.click();
			await vi.waitFor(() => {
				expect(mockSetShow).toHaveBeenCalledWith(false);
			});
		});
	});

	describe('Copy to clipboard', () => {
		it('should call navigator.clipboard.writeText with the policy string when the copy icon is clicked', async () => {
			const writeTextSpy = vi.fn().mockResolvedValue(undefined);
			vi.stubGlobal('navigator', {
				...navigator,
				clipboard: { writeText: writeTextSpy },
			});
			try {
				await setupBrowserTest(<DeleteHsmPolicy {...makeProps()} />);
				const copyIcon = document.querySelector('ds-icon[icon="CopyOutline"]');
				const copyBtn = copyIcon?.closest('button');
				copyBtn?.click();
				await vi.waitFor(() => {
					expect(writeTextSpy).toHaveBeenCalledWith('message:before:-30d');
				});
			} finally {
				vi.unstubAllGlobals();
			}
		});
	});
});
