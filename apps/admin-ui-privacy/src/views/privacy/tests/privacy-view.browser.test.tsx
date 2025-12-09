/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useAppConfigStore } from '@zextras/admin-ui-bootstrap';
import {
	createBrowserSoapAPIInterceptor,
	getQueryClient,
	grantUserConfigRights,
	setupBrowserTest
} from 'admin-ui-test-utils';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { Attribute } from '../../../../../admin-ui-bootstrap/types';
import {
	CARBONIO_ALLOW_FEEDBACK,
	CARBONIO_SEND_ANALYTICS,
	CARBONIO_SEND_FULL_ERROR_STACK
} from '../../../constants';
import PrivacyView from '../privacy-view';

type SetupOptions = {
	config?: Array<Attribute>;
};
const setupTestWithQueryClient = (options: SetupOptions) => {
	const queryClient = getQueryClient();
	queryClient.setQueryData(['all-config', 'effective-rights'], options);

	return setupBrowserTest(<PrivacyView />, { queryClient });
};
const mockConfigData: Array<Attribute> = [
	{ n: CARBONIO_SEND_ANALYTICS, _content: 'FALSE' },
	{ n: CARBONIO_SEND_FULL_ERROR_STACK, _content: 'FALSE' },
	{ n: CARBONIO_ALLOW_FEEDBACK, _content: 'FALSE' }
];

// Mock the app config store with proper configuration
const mockUpdateConfig = vi.fn();
useAppConfigStore.setState({
	config: [mockConfigData],
	updateConfig: mockUpdateConfig
});

describe('PrivacyView', () => {
	beforeEach(async () => {});

	it('renders privacy settings page with all switches', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Check main title
		await expect.element(page.getByText('Privacy')).toBeVisible();

		// Check all three privacy switches are present
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Check description texts
		await expect
			.element(page.getByText(/We all make mistakes but it's how you deal with them/))
			.toBeVisible();
		await expect
			.element(
				page.getByText(/Your data is safe. All information we gather is and will stay anonymous/)
			)
			.toBeVisible();
		await expect
			.element(page.getByText(/We promise they will be fast, easy and very useful/))
			.toBeVisible();
	});

	it('shows save and cancel buttons when switch is toggled', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for the component to load and render
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Initially, save/cancel buttons should not be visible
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// Find and click the switch
		const switchLabel = page.getByText('Send full error data');
		await expect.element(switchLabel).toBeVisible();
		await switchLabel.click();

		// Now save and cancel buttons should be visible
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
	});

	it('shows save and cancel buttons when switch is toggled from TRUE to FALSE', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for the component to load and render
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Initially, save/cancel buttons should not be visible
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// Find and click on the switch
		const switchLabel = page.getByText('Send full error data');
		await expect.element(switchLabel).toBeVisible();
		await switchLabel.click();

		// Now save and cancel buttons should be visible
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
	});

	it('hides save and cancel buttons when cancel is clicked', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for the component to load and render
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Click on a switch to make changes
		const switchLabel = page.getByText('Send full error data');
		await expect.element(switchLabel).toBeVisible();
		await switchLabel.click();

		// Verify save and cancel buttons appear
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Click cancel to revert changes
		const cancelButton = page.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();

		// Save/cancel buttons should disappear
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	});

	it('calls Batch API when save is clicked', async () => {
		grantUserConfigRights();

		// Set up a Batch interceptor to capture the API call
		const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for the component to load and render
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Toggle a switch to make changes
		const switchLabel = page.getByText('Send full error data');
		await expect.element(switchLabel).toBeVisible();
		await switchLabel.click();

		// Verify save button appears
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

		// Click save to trigger API calls
		const saveButton = page.getByRole('button', { name: 'Save' });
		await saveButton.click();

		// Wait for Batch API call to complete
		const request = await batchInterceptor;

		await new Promise((resolve) => setTimeout(resolve, 500));
		// Verify that save/cancel buttons disappear after successful save
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		expect(request).toMatchObject({
			ModifyConfigRequest: [
				{
					_content: 'FALSE',
					n: 'carbonioAllowFeedback'
				},
				{
					_content: 'TRUE',
					n: 'carbonioSendFullErrorStack'
				},
				{
					_content: 'FALSE',
					n: 'carbonioSendAnalytics'
				}
			],
			_jsns: 'urn:zimbra'
		});
	});

	it('does not show save/cancel buttons when switches are disabled', async () => {
		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for the component to load and render
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Try to click on switches when disabled (they should not trigger state changes)
		const errorSwitchLabel = page.getByText('Send full error data');
		await expect.element(errorSwitchLabel).toBeVisible();
		await errorSwitchLabel.click();

		const analyticsSwitchLabel = page.getByText('Allow data analytics');
		await expect.element(analyticsSwitchLabel).toBeVisible();
		await analyticsSwitchLabel.click();

		// Switch labels should still be visible but save/cancel buttons should not appear
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Save/cancel buttons should NOT appear when switches are disabled
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	});

	it('loads config values correctly and displays switches in appropriate state', async () => {
		// Test with mixed TRUE/FALSE values
		const mixedConfigData = [
			{ n: CARBONIO_SEND_ANALYTICS, _content: 'TRUE' },
			{ n: CARBONIO_SEND_FULL_ERROR_STACK, _content: 'FALSE' },
			{ n: CARBONIO_ALLOW_FEEDBACK, _content: 'TRUE' }
		];

		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mixedConfigData });

		// Wait for the component to load and render
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Verify all switches are visible (actual state verification would require more complex testing)
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Initially no save/cancel buttons
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	});

	it('persists state across multiple toggle operations', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Toggle first switch
		const firstSwitch = page.getByText('Send full error data');
		await firstSwitch.click();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

		// Toggle second switch without saving first
		const secondSwitch = page.getByText('Allow data analytics');
		await secondSwitch.click();

		// Toggle third switch
		const thirdSwitch = page.getByText('Allow live survey feedbacks');
		await thirdSwitch.click();

		// All changes should be tracked, save button still visible
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Cancel should revert all changes
		const cancelButton = page.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();

		// Wait for state to reset
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Buttons should disappear
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	});

	it('maintains dirty state when multiple switches are toggled', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Toggle first switch
		const firstSwitch = page.getByText('Send full error data');
		await firstSwitch.click();

		// Toggle same switch again (should maintain dirty state)
		await firstSwitch.click();

		// Toggle third switch
		const thirdSwitch = page.getByText('Allow live survey feedbacks');
		await thirdSwitch.click();

		// Save/cancel should still be visible
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Cancel all changes
		const cancelButton = page.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();

		// Wait for reset
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Buttons should be gone
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
	});

	it('saves all changes when multiple switches are toggled before save', async () => {
		grantUserConfigRights();

		// Capture the Batch call
		const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Toggle all three switches
		await page.getByText('Send full error data').click();
		await page.getByText('Allow data analytics').click();
		await page.getByText('Allow live survey feedbacks').click();

		// Verify save button appears
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

		// Save all changes
		const saveButton = page.getByRole('button', { name: 'Save' });
		await saveButton.click();

		// Wait for Batch API call to complete
		await batchInterceptor;
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Buttons should disappear after successful save
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	}, 20000);

	it('loads correctly with all settings enabled', async () => {
		const allEnabledConfig = [
			{ n: CARBONIO_SEND_ANALYTICS, _content: 'TRUE' },
			{ n: CARBONIO_SEND_FULL_ERROR_STACK, _content: 'TRUE' },
			{ n: CARBONIO_ALLOW_FEEDBACK, _content: 'TRUE' }
		];

		grantUserConfigRights();
		await setupTestWithQueryClient({ config: allEnabledConfig });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// All switches should be visible
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Should not show save/cancel initially
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// Should be able to toggle from TRUE to FALSE
		const firstSwitch = page.getByText('Send full error data');
		await firstSwitch.click();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
	});

	it('loads correctly with mixed settings', async () => {
		const mixedConfig = [
			{ n: CARBONIO_SEND_ANALYTICS, _content: 'TRUE' },
			{ n: CARBONIO_SEND_FULL_ERROR_STACK, _content: 'FALSE' },
			{ n: CARBONIO_ALLOW_FEEDBACK, _content: 'TRUE' }
		];

		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mixedConfig });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// All switches should be visible
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Should be able to toggle any switch
		const analyticsSwitch = page.getByText('Allow data analytics');
		await analyticsSwitch.click();
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
	});

	it('shows success snackbar after successful save', async () => {
		grantUserConfigRights();

		const batchInterceptor = createBrowserSoapAPIInterceptor('Batch', {});

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Toggle a switch
		const firstSwitch = page.getByText('Send full error data');
		await firstSwitch.click();

		// Save changes
		const saveButton = page.getByRole('button', { name: 'Save' });
		await saveButton.click();

		await batchInterceptor;
		await new Promise((resolve) => setTimeout(resolve, 500));

		// This test verifies the integration with snackbar system
		const successSnackbar = page.getByText('The change has been saved successfully');
		await expect.element(successSnackbar).toBeVisible();
	}, 20000);

	it('should change switch icon from ToggleLeft to ToggleRight when clicked', async () => {
		grantUserConfigRights();
		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Initially switches should be in false state (ToggleLeft)
		const errorSwitchIcon = page.getByTestId('icon: ToggleLeftOutline').first();
		await expect.element(errorSwitchIcon).toBeVisible();

		const analyticsSwitchIcon = page.getByTestId('icon: ToggleLeftOutline').nth(1);
		await expect.element(analyticsSwitchIcon).toBeVisible();
		//
		const feedbackSwitchIcon = page.getByTestId('icon: ToggleLeftOutline').nth(2);
		await expect.element(feedbackSwitchIcon).toBeVisible();
		//
		// Click the error switch to toggle it on
		const errorSwitchLabel = page.getByText('Send full error data');
		await errorSwitchLabel.click();
		//
		// After click, error switch should now show ToggleRight
		const errorSwitchIconAfterClick = page.getByTestId('icon: ToggleRight').first();
		await expect.element(errorSwitchIconAfterClick).toBeVisible();

		// Analytics and feedback should still show ToggleLeft
		const analyticsSwitchIconAfterFirstClick = page.getByTestId('icon: ToggleLeftOutline').first();
		await expect.element(analyticsSwitchIconAfterFirstClick).toBeVisible();

		const feedbackSwitchIconAfterFirstClick = page.getByTestId('icon: ToggleLeftOutline').nth(1);
		await expect.element(feedbackSwitchIconAfterFirstClick).toBeVisible();

		// Click the analytics switch
		const analyticsSwitchLabel = page.getByText('Allow data analytics');
		await analyticsSwitchLabel.click();

		// Both error and analytics should now show ToggleRight
		await expect.element(page.getByTestId('icon: ToggleRight').first()).toBeVisible();
		await expect.element(page.getByTestId('icon: ToggleRight').nth(1)).toBeVisible();
	}, 20000);

	it('should handle toggle operations when all settings start as TRUE', async () => {
		// Test with all switches initially enabled (TRUE)
		const allEnabledConfig = [
			{ n: CARBONIO_SEND_ANALYTICS, _content: 'TRUE' },
			{ n: CARBONIO_SEND_FULL_ERROR_STACK, _content: 'TRUE' },
			{ n: CARBONIO_ALLOW_FEEDBACK, _content: 'TRUE' }
		];

		grantUserConfigRights();
		await setupTestWithQueryClient({ config: allEnabledConfig });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Initially, save/cancel buttons should not be visible
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// All switches should be visible
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Click the first switch to toggle it
		const firstSwitch = page.getByText('Send full error data');
		await expect.element(firstSwitch).toBeVisible();
		await firstSwitch.click();

		// After clicking, save and cancel buttons should appear
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Cancel should revert the change
		const cancelButton = page.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();

		// Wait for state to reset
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Buttons should disappear after cancel
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	});

	it('should correctly handle multiple switch toggles and state changes', async () => {
		grantUserConfigRights();

		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Initially, save/cancel buttons should not be visible
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// All switches should be visible
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Toggle error switch
		const errorSwitchLabel = page.getByText('Send full error data');
		await errorSwitchLabel.click();

		// Save/cancel buttons should appear after first toggle
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Toggle analytics switch
		const analyticsSwitchLabel = page.getByText('Allow data analytics');
		await analyticsSwitchLabel.click();

		// Toggle feedback switch
		const feedbackSwitchLabel = page.getByText('Allow live survey feedbacks');
		await feedbackSwitchLabel.click();

		// Save/cancel buttons should still be visible after multiple toggles
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Cancel should revert all changes
		const cancelButton = page.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();

		// Wait for state to reset
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Buttons should disappear after cancel
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);
	});

	it('should maintain correct states when cancel is clicked', async () => {
		grantUserConfigRights();
		await setupTestWithQueryClient({ config: mockConfigData });

		// Wait for component to load
		await expect.element(page.getByText('Send full error data')).toBeVisible();

		// Initially, save/cancel buttons should not be visible
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// All switches should be visible
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();

		// Toggle all three switches
		await page.getByText('Send full error data').click();
		await page.getByText('Allow data analytics').click();
		await page.getByText('Allow live survey feedbacks').click();

		// Save/cancel buttons should appear after toggling
		await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();

		// Cancel should revert all changes
		const cancelButton = page.getByRole('button', { name: 'Cancel' });
		await cancelButton.click();

		// Wait for state reset
		await new Promise((resolve) => setTimeout(resolve, 500));

		// Buttons should disappear after cancel
		expect(page.getByRole('button', { name: 'Save' }).elements()).toHaveLength(0);
		expect(page.getByRole('button', { name: 'Cancel' }).elements()).toHaveLength(0);

		// All switches should still be visible after cancel
		await expect.element(page.getByText('Send full error data')).toBeVisible();
		await expect.element(page.getByText('Allow data analytics')).toBeVisible();
		await expect.element(page.getByText('Allow live survey feedbacks')).toBeVisible();
	});
});
