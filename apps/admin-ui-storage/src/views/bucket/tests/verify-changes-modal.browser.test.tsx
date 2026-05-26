/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { VerifyChangesModal } from '../verify-changes-modal';

function createChangedFields() {
	return [
		{ label: 'Access key', value: 'AKIA123' },
		{ label: 'Region', value: 'US_EAST_1' },
	];
}

describe('VerifyChangesModal (browser)', () => {
	it('should render changed fields', async () => {
		await setupBrowserTest(
			<VerifyChangesModal
				open
				changedFields={createChangedFields()}
				closeHandler={vi.fn()}
				applyHandler={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		await expect
			.element(page.getByText('Access key', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('AKIA123', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('Region', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('US_EAST_1', { exact: true }))
			.toBeVisible();
	});

	it('should call showPopover when opened', async () => {
		const showPopoverSpy = vi.spyOn(HTMLElement.prototype, 'showPopover');

		await setupBrowserTest(
			<VerifyChangesModal
				open
				changedFields={createChangedFields()}
				closeHandler={vi.fn()}
				applyHandler={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(showPopoverSpy).toHaveBeenCalledTimes(1);
	});

	it('should call hidePopover when closed', async () => {
		const hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');

		await setupBrowserTest(
			<VerifyChangesModal
				open={false}
				changedFields={createChangedFields()}
				closeHandler={vi.fn()}
				applyHandler={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
	});

	it('should call closeHandler when clicking close button', async () => {
		const closeHandler = vi.fn();

		await setupBrowserTest(
			<VerifyChangesModal
				open
				changedFields={createChangedFields()}
				closeHandler={closeHandler}
				applyHandler={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		await page.getByRole('button', { name: /close/i }).click();

		expect(closeHandler).toHaveBeenCalledTimes(1);
	});

	it('should call closeHandler when clicking cancel button', async () => {
		const closeHandler = vi.fn();

		await setupBrowserTest(
			<VerifyChangesModal
				open
				changedFields={createChangedFields()}
				closeHandler={closeHandler}
				applyHandler={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		await page.getByRole('button', { name: /cancel/i }).click();

		expect(closeHandler).toHaveBeenCalledTimes(1);
	});

	it('should apply changes only after confirmation', async () => {
		const applyHandler = vi.fn().mockResolvedValue(undefined);

		await setupBrowserTest(
			<VerifyChangesModal
				open
				changedFields={createChangedFields()}
				closeHandler={vi.fn()}
				applyHandler={applyHandler}
			/>,
		);

		const applyButton = page.getByRole('button', { name: /apply changes/i });
		await expect.element(applyButton).toHaveAttribute('disabled');

		await page
			.getByText('I am sure I want to apply these changes', { exact: true })
			.click();

		await expect.element(applyButton).not.toHaveAttribute('disabled');
		await applyButton.click();

		expect(applyHandler).toHaveBeenCalledTimes(1);
	});
});
