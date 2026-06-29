/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { ChangeTokenModal } from '../parts/modals/change-token-modal';

const setupTest = (component: React.ReactElement) => {
	const queryClient = getQueryClient();
	return setupBrowserTest(component, { queryClient });
};

describe('ChangeTokenModal', () => {
	it('shows the modal content when rendered', async () => {
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={vi.fn()} />);

		await expect.element(page.getByText('Change token', { exact: true })).toBeVisible();
		await expect.element(page.getByText('CONFIRM TOKEN')).toBeVisible();
		await expect.element(page.getByText('CANCEL')).toBeVisible();
	});

	it('calls onConfirm with the trimmed token when CONFIRM TOKEN is clicked with a valid token', async () => {
		const onConfirm = vi.fn();
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={onConfirm} />);

		const input = page.getByRole('textbox');
		await userEvent.type(input, '  MY-NEW-TOKEN  ');
		await page.getByText('CONFIRM TOKEN').click();

		expect(onConfirm).toHaveBeenCalledWith('MY-NEW-TOKEN');
	});

	it('calls onConfirm when the Enter key is pressed with a valid token', async () => {
		const onConfirm = vi.fn();
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={onConfirm} />);

		const input = page.getByRole('textbox');
		await userEvent.type(input, 'MY-TOKEN');
		await userEvent.keyboard('{Enter}');

		expect(onConfirm).toHaveBeenCalledWith('MY-TOKEN');
	});

	it('shows a validation error and does not call onConfirm when confirming with an empty token', async () => {
		const onConfirm = vi.fn();
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={onConfirm} />);

		await page.getByText('CONFIRM TOKEN').click();

		await expect
			.element(page.getByText('Please enter your activation token'))
			.toBeVisible();
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('shows a validation error when confirming with a whitespace-only token', async () => {
		const onConfirm = vi.fn();
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={onConfirm} />);

		const input = page.getByRole('textbox');
		await userEvent.type(input, '   ');
		await page.getByText('CONFIRM TOKEN').click();

		await expect
			.element(page.getByText('Please enter your activation token'))
			.toBeVisible();
		expect(onConfirm).not.toHaveBeenCalled();
	});

	it('clears the validation error when the user starts typing again', async () => {
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={vi.fn()} />);

		await page.getByText('CONFIRM TOKEN').click();
		await expect
			.element(page.getByText('Please enter your activation token'))
			.toBeVisible();

		await userEvent.type(page.getByRole('textbox'), 'A');

		expect(page.getByText('Please enter your activation token').elements()).toHaveLength(0);
	});

	it('does not show a validation error on blur with valid content', async () => {
		setupTest(<ChangeTokenModal onClose={vi.fn()} onConfirm={vi.fn()} />);

		const input = page.getByRole('textbox');
		await userEvent.type(input, 'VALID-TOKEN');
		await userEvent.click(document.body);

		expect(page.getByText('Please enter your activation token').elements()).toHaveLength(0);
	});

	it('calls onClose when the CANCEL button is clicked', async () => {
		const onClose = vi.fn();
		setupTest(<ChangeTokenModal onClose={onClose} onConfirm={vi.fn()} />);

		await page.getByText('CANCEL').click();

		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when the close icon is clicked', async () => {
		const onClose = vi.fn();
		setupTest(<ChangeTokenModal onClose={onClose} onConfirm={vi.fn()} />);

		await page.getByRole('button', { name: 'Close' }).click();

		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
