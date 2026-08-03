/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DomainFormActions } from '../domain-form-actions';

describe('DomainFormActions', () => {
	describe('Visibility', () => {
		it('returns null when isDirty is false', async () => {
			const { container } = await setupBrowserTest(
				<DomainFormActions
					isDirty={false}
					onCancel={vi.fn()}
					onSave={vi.fn()}
				/>
			);

			expect(container.innerHTML).toBe('');
		});

		it('shows Save and Cancel buttons when isDirty is true', async () => {
			await setupBrowserTest(
				<DomainFormActions
					isDirty={true}
					onCancel={vi.fn()}
					onSave={vi.fn()}
				/>
			);

			await expect
				.element(page.getByRole('button', { name: /cancel/i }))
				.toBeVisible();
			await expect
				.element(page.getByRole('button', { name: /save/i }))
				.toBeVisible();
		});
	});

	describe('Disabled states', () => {
		it('disables both buttons when isPending is true', async () => {
			await setupBrowserTest(
				<DomainFormActions
					isDirty={true}
					isPending={true}
					onCancel={vi.fn()}
					onSave={vi.fn()}
				/>
			);

			await expect
				.element(page.getByRole('button', { name: /cancel/i }))
				.toBeDisabled();
			await expect
				.element(page.getByRole('button', { name: /save/i }))
				.toBeDisabled();
		});

		it('disables Save button when isValid is false', async () => {
			await setupBrowserTest(
				<DomainFormActions
					isDirty={true}
					isValid={false}
					onCancel={vi.fn()}
					onSave={vi.fn()}
				/>
			);

			await expect
				.element(page.getByRole('button', { name: /cancel/i }))
				.toBeEnabled();
			await expect
				.element(page.getByRole('button', { name: /save/i }))
				.toBeDisabled();
		});
	});

	describe('Click handlers', () => {
		it('calls onCancel when Cancel button is clicked', async () => {
			const onCancel = vi.fn();
			await setupBrowserTest(
				<DomainFormActions
					isDirty={true}
					onCancel={onCancel}
					onSave={vi.fn()}
				/>
			);

			await page.getByRole('button', { name: /cancel/i }).click();

			expect(onCancel).toHaveBeenCalledOnce();
		});

		it('calls onSave when Save button is clicked', async () => {
			const onSave = vi.fn();
			await setupBrowserTest(
				<DomainFormActions
					isDirty={true}
					onCancel={vi.fn()}
					onSave={onSave}
				/>
			);

			await page.getByRole('button', { name: /save/i }).click();

			expect(onSave).toHaveBeenCalledOnce();
		});
	});
});
