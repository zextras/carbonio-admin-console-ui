/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { VerifyError } from '../parts/verify/verify-error';

describe('VerifyError (browser)', () => {
	it('should call showPopover when error is true', async () => {
		const showPopoverSpy = vi.spyOn(HTMLElement.prototype, 'showPopover');

		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				onRetry={vi.fn()}
			/>,
		);

		expect(showPopoverSpy).toHaveBeenCalledTimes(1);
	});

	it('should render error title and description', async () => {
		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				onRetry={vi.fn()}
			/>,
		);

		await expect
			.element(page.getByText('Something went wrong', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('Connection failed', { exact: true }))
			.toBeVisible();
	});

	it('should hide popover when close button is clicked', async () => {
		const hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');

		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				onRetry={vi.fn()}
			/>,
		);

		await page.getByRole('button', { name: /close/i }).click();

		expect(hidePopoverSpy).toHaveBeenCalled();
	});

	it('should hide popover without retry when cancel is clicked', async () => {
		const hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');
		const onRetry = vi.fn();

		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				onRetry={onRetry}
			/>,
		);

		await page.getByRole('button', { name: /cancel/i }).click();

		expect(hidePopoverSpy).toHaveBeenCalled();
		expect(onRetry).not.toHaveBeenCalled();
	});

	it('should retry when check information is clicked', async () => {
		const onRetry = vi.fn();

		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				onRetry={onRetry}
			/>,
		);

		await page.getByRole('button', { name: /check information/i }).click();

		expect(onRetry).toHaveBeenCalledTimes(1);
	});

	it('should render only known check results when provided', async () => {
		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				checkDetails={{
					connectionOk: 'true',
					bucketExists: 'false',
					error: 'unexpected',
				}}
				onRetry={vi.fn()}
			/>,
		);

		await expect
			.element(page.getByText('Check Results', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('Connection', { exact: true }))
			.toBeVisible();
		await expect
			.element(page.getByText('Bucket Exists', { exact: true }))
			.toBeVisible();
		expect(page.getByText('unexpected', { exact: true }).elements()).toHaveLength(0);
	});

	it('should not render check results section when details are missing', async () => {
		await setupBrowserTest(
			<VerifyError
				isError
				verifyFailError="Connection failed"
				onRetry={vi.fn()}
			/>,
		);

		expect(page.getByText('Check Results', { exact: true }).elements()).toHaveLength(0);
	});
});
