/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MTAAdvanced from '../mta-advanced/mta-advanced';

describe('MTAAdvanced', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should render the component correctly', async () => {
		setupBrowserTest(<MTAAdvanced />);
		await expect.element(page.getByText('Advanced')).toBeVisible();
	});

	it('should render the Mail Messages Size components correctly', async () => {
		setupBrowserTest(<MTAAdvanced />);
		await expect.element(page.getByText('Mail Messages Size')).toBeVisible();
		await expect.element(page.getByText('No size limit for mail messages')).toBeVisible();
		await expect.element(page.getByText('Custom max size mail messages (MB)')).toBeVisible();
	});

	it.skip('should render the Logging components correctly', async () => {
		setupBrowserTest(<MTAAdvanced />);
		await expect.element(page.getByText('Advanced')).toBeVisible();
		await expect
			.element(page.getByText('Enable logging of the remote SMTP client port'))
			.toBeVisible();
	});
});
