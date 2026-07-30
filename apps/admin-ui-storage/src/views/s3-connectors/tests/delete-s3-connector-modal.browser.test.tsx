/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DeleteS3ConnectorModal } from '../delete-s3-connector-modal';

describe('DeleteS3ConnectorModal (browser)', () => {
	it('should call showPopover when opened', async () => {
		const showPopoverSpy = vi.spyOn(HTMLElement.prototype, 'showPopover');

		await setupBrowserTest(
			<DeleteS3ConnectorModal open closeHandler={vi.fn()} saveHandler={vi.fn()} />,
		);

		expect(showPopoverSpy).toHaveBeenCalledTimes(1);
	});

	it('should call hidePopover when closed', async () => {
		const hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');

		await setupBrowserTest(
			<DeleteS3ConnectorModal open={false} closeHandler={vi.fn()} saveHandler={vi.fn()} />,
		);

		expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
	});

	it('should call closeHandler when clicking close button', async () => {
		const closeHandler = vi.fn();

		await setupBrowserTest(
			<DeleteS3ConnectorModal open closeHandler={closeHandler} saveHandler={vi.fn()} />,
		);

		await page.getByRole('button', { name: /close/i }).click();

		expect(closeHandler).toHaveBeenCalledTimes(1);
	});

	it('should call closeHandler when clicking cancel button', async () => {
		const closeHandler = vi.fn();
		const hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');

		await setupBrowserTest(
			<DeleteS3ConnectorModal open closeHandler={closeHandler} saveHandler={vi.fn()} />,
		);

		await page.getByRole('button', { name: /no, cancel/i }).click();

		expect(closeHandler).toHaveBeenCalledTimes(1);
		expect(hidePopoverSpy).toHaveBeenCalled();
	});

	it('should call saveHandler when clicking delete button', async () => {
		const saveHandler = vi.fn();
		const hidePopoverSpy = vi.spyOn(HTMLElement.prototype, 'hidePopover');

		await setupBrowserTest(
			<DeleteS3ConnectorModal open closeHandler={vi.fn()} saveHandler={saveHandler} />,
		);
		const deleteButton = page.getByRole('button', { name: /proceed with deletion/i });
		await expect.element(deleteButton).toBeDisabled();

		await page.getByRole('checkbox', { name: /i am sure i want to delete this connector/i }).click();
		await expect.element(deleteButton).toBeEnabled();
		await deleteButton.click();

		expect(saveHandler).toHaveBeenCalledTimes(1);
		expect(hidePopoverSpy).toHaveBeenCalled();
	});
});
