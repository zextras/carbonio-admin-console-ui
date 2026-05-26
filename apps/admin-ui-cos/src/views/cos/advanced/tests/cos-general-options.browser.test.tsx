/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { BACKUP_ENABLED, BACKUP_SELF_UNDELETE_ALLOWED } from '../../../../constants';
import COSGeneralOptions from '../cos-general-options';

describe('COSGeneralOptions (browser)', () => {
	const defaultProps = {
		cosAdvancedBackupAttributes: {
			[BACKUP_ENABLED]: true,
			[BACKUP_SELF_UNDELETE_ALLOWED]: false,
		},
		readonlyCOS: false,
		changeBackupAttribute: vi.fn(),
	};

	it('should render General Options header', async () => {
		await setupBrowserTest(<COSGeneralOptions {...defaultProps} />);

		await expect.element(page.getByText('General Options')).toBeVisible();
	});

	it('should render Enable / Disable Backup toggle', async () => {
		await setupBrowserTest(<COSGeneralOptions {...defaultProps} />);

		await expect.element(page.getByText('Enable / Disable Backup')).toBeVisible();
	});

	it('should render Allow user to restore messages toggle', async () => {
		await setupBrowserTest(<COSGeneralOptions {...defaultProps} />);

		await expect.element(page.getByText('Allow user to restore messages')).toBeVisible();
	});

	it('should call changeBackupAttribute with BACKUP_ENABLED when backup toggle icon is clicked', async () => {
		const changeBackupAttribute = vi.fn();
		await setupBrowserTest(
			<COSGeneralOptions {...defaultProps} changeBackupAttribute={changeBackupAttribute} />,
		);

		await userEvent.click(page.getByText('Enable / Disable Backup'));

		expect(changeBackupAttribute).toHaveBeenCalledWith(BACKUP_ENABLED);
	});

	it('should call changeBackupAttribute with BACKUP_SELF_UNDELETE_ALLOWED when restore toggle icon is clicked', async () => {
		const changeBackupAttribute = vi.fn();
		await setupBrowserTest(
			<COSGeneralOptions {...defaultProps} changeBackupAttribute={changeBackupAttribute} />,
		);

		await userEvent.click(page.getByText('Allow user to restore messages'));

		expect(changeBackupAttribute).toHaveBeenCalledWith(BACKUP_SELF_UNDELETE_ALLOWED);
	});

	it('should not trigger changeBackupAttribute when readonlyCOS is true', async () => {
		const changeBackupAttribute = vi.fn();
		await setupBrowserTest(
			<COSGeneralOptions {...defaultProps} readonlyCOS changeBackupAttribute={changeBackupAttribute} />,
		);

		await page.getByText('Enable / Disable Backup').click();

		expect(changeBackupAttribute).not.toHaveBeenCalled();
	});
});
