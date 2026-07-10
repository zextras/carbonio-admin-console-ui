/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

vi.mock('../restore-delete-account-config-section', () => ({
	default: () => <div data-testid="config-section">config</div>,
}));
vi.mock('../restore-delete-account-select-section', () => ({
	default: () => <div data-testid="select-section">select</div>,
}));
vi.mock('../restore-delete-account-start-section', () => ({
	default: () => <div data-testid="start-section">start</div>,
}));

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import RestoreDeleteAccountWizard from '../restore-delete-account-wizard';

describe('RestoreDeleteAccountWizard', () => {
	it('calls onReset when the Cancel button is clicked', async () => {
		const onReset = vi.fn();

		setupBrowserTest(
			<RestoreDeleteAccountWizard
				setShowRestoreAccountWizard={vi.fn()}
				restoreAccountRequest={vi.fn()}
				isRequestWorkInProgress={undefined}
				onReset={onReset}
			/>,
		);

		await page.getByRole('button', { name: /cancel/i }).click();

		expect(onReset).toHaveBeenCalledTimes(1);
	});
});
