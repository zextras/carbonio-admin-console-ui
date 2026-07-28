/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { VolumeErrorDetailsModal } from '../volume-error-details-modal';

describe('VolumeErrorDetailsModal (browser)', () => {
	it('should render title, message, and close button when open', async () => {
		await setupBrowserTest(
			<VolumeErrorDetailsModal
				open
				message="Volume create failed: path already exists"
				onClose={vi.fn()}
			/>,
		);

		await expect
			.element(page.getByText('Something went wrong details', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('Volume create failed: path already exists', { exact: true }))
			.toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Close' })).toBeVisible();
	});

	it('should call onClose when clicking the close button', async () => {
		const onClose = vi.fn();

		await setupBrowserTest(
			<VolumeErrorDetailsModal
				open
				message="Volume create failed: path already exists"
				onClose={onClose}
			/>,
		);

		await page.getByRole('button', { name: 'Close' }).click();

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('should render nothing when open is false', async () => {
		await setupBrowserTest(
			<VolumeErrorDetailsModal
				open={false}
				message="Volume create failed: path already exists"
				onClose={vi.fn()}
			/>,
		);

		expect(page.getByText('Something went wrong details', { exact: true }).elements()).toHaveLength(
			0,
		);
		expect(
			page.getByText('Volume create failed: path already exists', { exact: true }).elements(),
		).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Close' }).elements()).toHaveLength(0);
	});
});
