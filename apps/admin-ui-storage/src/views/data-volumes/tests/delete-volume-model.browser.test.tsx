/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { DeleteVolumeModel } from '../delete-volume-model';

function createVolumeDetail(overrides?: Partial<{ name: string; isCurrent: boolean }>) {
	return {
		id: 1,
		name: overrides?.name ?? 'primary-volume',
		isCurrent: overrides?.isCurrent ?? false,
	};
}

describe('DeleteVolumeModel (browser)', () => {
	it('should render delete confirmation for a volume', async () => {
		await setupBrowserTest(
			<DeleteVolumeModel
				open
				closeHandler={vi.fn()}
				deleteHandler={vi.fn()}
				volumeDetail={createVolumeDetail()}
			/>,
		);

		await expect
			.element(page.getByText('Delete primary-volume ?', { exact: true }))
			.toBeVisible();
		await expect
			.element(
				page.getByText(
					'You are deleting primary-volume. Are you sure you want to delete it?',
					{ exact: true },
				),
			)
			.toBeVisible();
		await expect.element(page.getByRole('button', { name: 'NO' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'DELETE' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'DELETE' })).not.toBeDisabled();
	});

	it('should call closeHandler when clicking NO', async () => {
		const closeHandler = vi.fn();

		await setupBrowserTest(
			<DeleteVolumeModel
				open
				closeHandler={closeHandler}
				deleteHandler={vi.fn()}
				volumeDetail={createVolumeDetail()}
			/>,
		);

		await page.getByRole('button', { name: 'NO' }).click();

		expect(closeHandler).toHaveBeenCalledTimes(1);
	});

	it('should call deleteHandler with the selected volume when clicking DELETE', async () => {
		const volumeDetail = createVolumeDetail({ name: 'secondary-volume' });
		const deleteHandler = vi.fn();

		await setupBrowserTest(
			<DeleteVolumeModel
				open
				closeHandler={vi.fn()}
				deleteHandler={deleteHandler}
				volumeDetail={volumeDetail}
			/>,
		);

		await page.getByRole('button', { name: 'DELETE' }).click();

		expect(deleteHandler).toHaveBeenCalledTimes(1);
		expect(deleteHandler).toHaveBeenCalledWith(expect.objectContaining({ name: 'secondary-volume' }));
	});

	it('should keep DELETE enabled when volumeDetail is current', async () => {
		await setupBrowserTest(
			<DeleteVolumeModel
				open
				closeHandler={vi.fn()}
				deleteHandler={vi.fn()}
				volumeDetail={createVolumeDetail({ isCurrent: true })}
			/>,
		);

		await expect.element(page.getByRole('button', { name: 'NO' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'DELETE' })).not.toBeDisabled();
	});

	it('should render the modal title with an empty name when volumeDetail is undefined', async () => {
		await setupBrowserTest(
			<DeleteVolumeModel
				open
				closeHandler={vi.fn()}
				deleteHandler={vi.fn()}
				volumeDetail={undefined}
			/>,
		);

		await expect.element(page.getByText('Delete  ?', { exact: true })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'NO' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'DELETE' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'DELETE' })).not.toBeDisabled();
	});

	it('should render neither the NO/DELETE buttons when open is false', async () => {
		await setupBrowserTest(
			<DeleteVolumeModel
				open={false}
				closeHandler={vi.fn()}
				deleteHandler={vi.fn()}
				volumeDetail={createVolumeDetail()}
			/>,
		);

		expect(page.getByRole('button', { name: 'NO' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'DELETE' }).elements()).toHaveLength(0);
	});

	it('should call deleteHandler with undefined when volumeDetail is undefined and DELETE is clicked', async () => {
		const deleteHandler = vi.fn();
		await setupBrowserTest(
			<DeleteVolumeModel
				open
				closeHandler={vi.fn()}
				deleteHandler={deleteHandler}
				volumeDetail={undefined}
			/>,
		);

		await page.getByRole('button', { name: 'DELETE' }).click();
		expect(deleteHandler).toHaveBeenCalledTimes(1);
		expect(deleteHandler).toHaveBeenCalledWith(undefined);
	});
});
