/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { page } from '@vitest/browser/context';
import { createSoapAPIInterceptor, resetMockWorker, setupBrowserTest } from 'admin-ui-test-utils';
import React from 'react';
import { it, expect, describe, beforeEach, afterEach } from 'vitest';

import { useCosStore } from '../../src/store/cos/store';
import { CosListPanel } from '../../src/views/cos/cos-list-panel';
import { b } from 'vitest/dist/chunks/suite.d.FvehnV49.js';

const mockApiResponse = {
	cos: [
		{
			name: 'firstCOS',
			id: 'e00428a1-0c00-11d9-836a-000d93afea2a',
			isDefaultCos: true
		},
		{
			name: 'secondCOS',
			id: 'f27456a8-0c00-11d9-280a-286d93afea2g',
			isDefaultCos: true
		}
	],
	searchTotal: 2,
	more: false
};
describe('', () => {
	beforeEach(() => {
		useCosStore.getState().reset();
	});

	// Also reset after each test for extra safety
	afterEach(() => {
		resetMockWorker();
		useCosStore.getState().reset();
	});

	it('should render all parts of the component', async () => {
		createSoapAPIInterceptor('SearchDirectory', {});
		setupBrowserTest(<CosListPanel />);
		await expect.element(page.getByText('General')).toBeVisible();
		await expect.element(page.getByText('COS List')).toBeVisible();
		await expect.element(page.getByText('Select a Class of Service')).toBeVisible();
		await expect.element(page.getByText('Not found - check the text and try again')).toBeVisible();
		await expect.element(page.getByText('Details')).toBeVisible();
		await expect.element(page.getByText('General Information')).toBeVisible();
		await expect.element(page.getByText('Features')).toBeVisible();
		await expect.element(page.getByText('Chat')).toBeVisible();
		await expect.element(page.getByText('Preferences')).toBeVisible();
		await expect.element(page.getByText('Server Pools')).toBeVisible();
		await expect.element(page.getByText('Advanced')).toBeVisible();
	});

	it('should show details grayed out when no COS is selected', async () => {
		setupBrowserTest(<CosListPanel />);
		await expect.element(page.getByText('General Information')).toHaveStyle({ opacity: '0.5' });
		await expect.element(page.getByText('Features')).toHaveStyle({ opacity: '0.5' });
		await expect.element(page.getByText('Chat')).toHaveStyle({ opacity: '0.5' });
		await expect.element(page.getByText('Preferences')).toHaveStyle({ opacity: '0.5' });
		await expect.element(page.getByText('Server Pools')).toHaveStyle({ opacity: '0.5' });
		await expect.element(page.getByText('Advanced')).toHaveStyle({ opacity: '0.5' });
	});

	it('should show clickable details when COS is selected', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<CosListPanel />);

		await expect.element(page.getByText('Select a Class of Service')).toBeVisible();
		await page.getByText('Select a Class of Service').click();
		await expect.element(page.getByText('General Information')).toHaveStyle({ opacity: '0.5' });
		await page.getByText('firstCOS').click();
		await expect.element(page.getByText('General Information')).toHaveStyle({ opacity: '1' });
	});

	it('should hide details when the details button is pressed', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<CosListPanel />);

		await expect.element(page.getByText('Select a Class of Service')).toBeVisible();
		await page.getByText('Select a Class of Service').click();
		await page.getByText('firstCOS').click();
		await expect.element(page.getByText('General Information')).toBeVisible();
		await page.getByText('Details').click();
		expect(page.getByText('General Information').elements()).toHaveLength(0);
	});
	it('should show detail options in bold when selected after selecting a COS', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<CosListPanel />);

		await page.getByText('Select a Class of Service').click();
		await page.getByText('firstCOS').click();
		await page.getByText('Details').click();
		const detailOptions = [
			'General Information',
			'Features',
			'Chat',
			'Preferences',
			'Server Pools',
			'Advanced'
		];
		for (const option of detailOptions) {
			await page.getByText(option).click();
			await expect.element(page.getByText(option)).toHaveStyle({ fontWeight: 'bold' });
			for (const other of detailOptions.filter(o => o !== option)) {
				await expect.element(page.getByText(other)).not.toHaveStyle({ fontWeight: 'bold' });
			}
		}
	});
	it('should change chevron icon when details dropdown is toggled', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<CosListPanel />);

		await page.getByText('Select a Class of Service').click();
		await page.getByText('firstCOS').click();
		await expect.element(page.getByText('General Information')).toBeVisible();

		const buttonBeforeClick = page.getByRole('button').nth(1).element();
		expect(buttonBeforeClick.innerHTML).toContain('icon: ChevronUpOutline');

		await page.getByText('Details').click();
		const buttonAfterClick = page.getByRole('button').nth(1).element();
		expect(buttonAfterClick.innerHTML).toContain('icon: ChevronDownOutline');
	});
	it('should change General icon when its section is toggled', async () => {
		createSoapAPIInterceptor('SearchDirectory', mockApiResponse);
		setupBrowserTest(<CosListPanel />);

		await expect.element(page.getByText('General')).toBeVisible();
		const buttonBeforeClick = page.getByRole('button').first().element();
		expect(buttonBeforeClick.innerHTML).toContain('icon: ChevronUpOutline');

		await page.getByText('General').click();
		const buttonAfterClick = page.getByRole('button').first().element();
		expect(buttonAfterClick.innerHTML).toContain('icon: ChevronDownOutline');
	});
});
