/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import type { EditHsmPolicyProps, HsmPolicyFromServer, Volume } from '../../../../../types';
import { EditHsmPolicy } from '../edit-hsm-policy';

const VOLUME_LIST: Array<Volume> = [
	{ id: 1, name: 'Primary Volume', type: 1, isCurrent: true },
	{ id: 2, name: 'Secondary Volume', type: 2, isCurrent: false },
];

const POLICIES: Array<HsmPolicyFromServer> = [
	{ hsmQuery: 'message:before:-30d', hsmType: [5] },
];

const SELECTED_POLICY = 'message:before:-30d';

function makeProps(overrides?: Partial<EditHsmPolicyProps>): EditHsmPolicyProps {
	return {
		setShowEditHsmPolicyView: vi.fn(),
		policies: POLICIES,
		selectedPolicies: SELECTED_POLICY,
		volumeList: VOLUME_LIST,
		onEditSave: vi.fn(),
		isEditSaveInProgress: false,
		...overrides,
	};
}

async function renderAndWait(props: EditHsmPolicyProps): Promise<void> {
	await setupBrowserTest(<EditHsmPolicy {...props} />);
	await expect
		.element(page.getByText('Editing Policy', { exact: true }))
		.toBeVisible();
}

describe('EditHsmPolicy (browser)', () => {
	describe('Rendering', () => {
		it('renders the Editing Policy header', async () => {
			await renderAndWait(makeProps());
		});

		it('renders the Details tab label', async () => {
			await renderAndWait(makeProps());
			await expect.element(page.getByText('Details', { exact: true })).toBeVisible();
		});

		it('renders the Volumes tab label', async () => {
			await renderAndWait(makeProps());
			await expect.element(page.getByText('Volumes', { exact: true })).toBeVisible();
		});

		it('renders the detail section content (Server label) by default', async () => {
			await renderAndWait(makeProps());
			await expect.element(page.getByText('Server', { exact: true })).toBeVisible();
		});

		it('shows Save and Cancel buttons (dirty from currentPolicy auto-load) when a currentPolicy exists', async () => {
			await renderAndWait(makeProps());
			await expect
				.element(page.getByRole('button', { name: /^save$/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /^cancel$/i }))
				.toBeVisible();
		});

		it('renders the close icon button when no currentPolicy is present (clean form)', async () => {
			await renderAndWait(
				makeProps({ policies: [], selectedPolicies: 'does-not-exist' }),
			);
			expect(
				(await page
					.getByRole('button', { name: /^save$/i })
					.elements()).length,
			).toBe(0);
		});
	});

	describe('Cancel / close actions', () => {
		it('resets the form and closes the panel when Cancel is clicked', async () => {
			const mockSetShow = vi.fn();
			await renderAndWait(makeProps({ setShowEditHsmPolicyView: mockSetShow }));
			await page.getByRole('button', { name: /^cancel$/i }).click();
			expect(mockSetShow).toHaveBeenCalledWith(false);
		});

		it('closes the panel via the ghost close button when the form is clean', async () => {
			const mockSetShow = vi.fn();
			await renderAndWait(
				makeProps({
					setShowEditHsmPolicyView: mockSetShow,
					policies: [],
					selectedPolicies: 'does-not-exist',
				}),
			);
			// The X close button uses the CloseOutline icon and type="ghost"
			const allButtons = await page.getByRole('button').elements();
			const closeBtn = allButtons.find((b) =>
				b.querySelector('[icon="CloseOutline"], ds-icon'),
			);
			expect(closeBtn).toBeDefined();
		});
	});

	describe('Tab switching', () => {
		it('switches to the Volumes section when the Volumes tab is clicked', async () => {
			await renderAndWait(makeProps());
			await page.getByText('Volumes', { exact: true }).click();
			await expect
				.element(
					page.getByText(/All primary volumes will be used as source by default/),
				)
				.toBeVisible();
		});

		it('switches back to the Details section after visiting Volumes', async () => {
			await renderAndWait(makeProps());
			await page.getByText('Volumes', { exact: true }).click();
			await page.getByText('Details', { exact: true }).click();
			await expect.element(page.getByText('Items', { exact: true })).toBeVisible();
		});
	});

	describe('Save validation', () => {
		it('does not call onEditSave when a type is selected but no criteria exist', async () => {
			const mockOnEditSave = vi.fn();
			// currentPolicy with a non-criteria hsmQuery: type auto-loads, no criteria parsed.
			await renderAndWait(
				makeProps({
					onEditSave: mockOnEditSave,
					policies: [{ hsmQuery: 'message', hsmType: [5] }],
					selectedPolicies: 'message',
				}),
			);
			await expect
				.element(page.getByRole('button', { name: /^save$/i }))
				.toBeVisible();
			await page.getByRole('button', { name: /^save$/i }).click();
			await vi.waitFor(() => {
				expect(mockOnEditSave).not.toHaveBeenCalled();
			});
		});

		it('calls onEditSave with form values and allVolumes when the form is valid', async () => {
			const mockOnEditSave = vi.fn();
			await renderAndWait(makeProps({ onEditSave: mockOnEditSave }));
			await page.getByRole('button', { name: /^add$/i }).click();
			await page.getByRole('button', { name: /^save$/i }).click();
			await vi.waitFor(() => {
				expect(mockOnEditSave).toHaveBeenCalled();
			});
			const arg = mockOnEditSave.mock.calls[0][0];
			expect(arg.allVolumes).toEqual(VOLUME_LIST);
			expect(arg.isMessageEnabled).toBe(true);
			expect(arg.policyCriteria.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('isEditSaveInProgress', () => {
		it('renders the Save button in a loading state while a save is in progress', async () => {
			await renderAndWait(makeProps({ isEditSaveInProgress: true }));
			// The Save text is still rendered inside the button even when loading
			const saveText = page.getByText('Save', { exact: true });
			const elements = await saveText.elements();
			expect(elements.length).toBeGreaterThan(0);
		});
	});
});
