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

function expectGeneralOptionsSectionVisible() {

}

function expectMailOptionsSectionVisible() {

}

function expectReceivingMailsSectionVisible() {
	
}

describe('COSPreferences', () => {
	const setupCosStore = (): void => {
	};

	const setupRightsStore = (): void => {
	};

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it('should render the component correctly', async () => {
		setupBrowserTest(<MTAAdvanced />);
		await expect.element(page.getByText('Advanced')).toBeVisible();
		
		
	});
});
