/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { DeactivateTokenModal } from '../parts/modals/deactivate-token-modal';

const setupTest = (component: React.ReactElement) => {
	const queryClient = getQueryClient();
	return setupBrowserTest(component, { queryClient });
};

describe('DeactivateTokenModal', () => {
	it('shows the modal content when open is true', async () => {
		setupTest(<DeactivateTokenModal open onClose={vi.fn()} onConfirm={vi.fn()} />);

		await expect.element(page.getByText('Deactivate Token', { exact: true })).toBeVisible();
		await expect.element(page.getByText('YES, DEACTIVATE')).toBeVisible();
		await expect.element(page.getByText('NO, CANCEL')).toBeVisible();
	});

	it('hides the modal content when open is false', async () => {
		setupTest(<DeactivateTokenModal open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);

		await expect
			.element(page.getByText('Deactivate Token', { exact: true }))
			.not.toBeVisible();
	});

	it('calls onClose when the NO, CANCEL button is clicked', async () => {
		const onClose = vi.fn();
		setupTest(<DeactivateTokenModal open onClose={onClose} onConfirm={vi.fn()} />);

		await page.getByText('NO, CANCEL').click();

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when the close icon is clicked', async () => {
		const onClose = vi.fn();
		setupTest(<DeactivateTokenModal open onClose={onClose} onConfirm={vi.fn()} />);

		await page.getByRole('button', { name: 'Close' }).click();

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onConfirm when the YES, DEACTIVATE button is clicked', async () => {
		const onConfirm = vi.fn();
		setupTest(<DeactivateTokenModal open onClose={vi.fn()} onConfirm={onConfirm} />);

		await page.getByText('YES, DEACTIVATE').click();

		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
