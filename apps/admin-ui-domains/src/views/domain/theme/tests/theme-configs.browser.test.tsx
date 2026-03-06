/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { noop } from 'lodash-es';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { type themeConfigStore } from '../../../../../types/domain';
import { ThemeConfigs } from '../theme-configs';

const EMPTY_THEME: themeConfigStore = {
	carbonioWebUiDarkMode: undefined,
	carbonioWebUiLoginLogo: '',
	carbonioWebUiDarkLoginLogo: '',
	carbonioWebUiLoginBackground: '',
	carbonioWebUiDarkLoginBackground: '',
	carbonioWebUiAppLogo: '',
	carbonioWebUiDarkAppLogo: '',
	carbonioWebUiFavicon: '',
	carbonioWebUiTitle: '',
	carbonioWebUiDescription: '',
	carbonioAdminUiLoginLogo: '',
	carbonioAdminUiDarkLoginLogo: '',
	carbonioAdminUiAppLogo: '',
	carbonioAdminUiDarkAppLogo: '',
	carbonioAdminUiBackground: '',
	carbonioAdminUiDarkBackground: '',
	carbonioAdminUiFavicon: '',
	carbonioAdminUiTitle: '',
	carbonioAdminUiDescription: '',
	carbonioLogoUrl: '',
	carbonioWebUiPrimaryColor: '',
	carbonioWebUiDarkPrimaryColor: '',
};

const FILLED_THEME: themeConfigStore = {
	...EMPTY_THEME,
	carbonioLogoUrl: 'https://example.com',
	carbonioWebUiPrimaryColor: '#225CA8',
	carbonioWebUiDarkPrimaryColor: '#3B82F6',
	carbonioWebUiTitle: 'Test Title',
	carbonioWebUiDescription: 'Test description',
};

function ThemeConfigsWrapper({
	initialTheme = EMPTY_THEME,
	globalTheme,
	isGlobalTheme = false,
}: {
	initialTheme?: themeConfigStore;
	globalTheme?: themeConfigStore;
	isGlobalTheme?: boolean;
}) {
	const [themeConfig, setThemeConfig] = useState<themeConfigStore>(initialTheme);
	const [, setIsValidated] = useState(true);

	return (
		<ThemeConfigs
			themeConfig={themeConfig}
			globalTheme={globalTheme}
			setThemeConfig={setThemeConfig}
			setIsValidated={setIsValidated}
			onResetTheme={noop}
			isGlobalTheme={isGlobalTheme}
		/>
	);
}

describe('ThemeConfigs (browser)', () => {
	describe('Rendering - Common sections', () => {
		it('should render the Appearance section header', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect.element(page.getByText('Apperance')).toBeVisible();
		});

		it('should render the Dark Mode select', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect.element(page.getByText('Dark Mode', { exact: true })).toBeVisible();
		});

		it('should render the Logo URL Destination section', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect
				.element(page.getByText('Logo URL Destination'))
				.toBeVisible();
		});

		it('should render the logo redirection input', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect
				.element(page.getByText(/Clicking on the Logo will redirect the users to/))
				.toBeVisible();
		});

		it('should render the Color Scheme section', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect.element(page.getByText('Color Scheme')).toBeVisible();
		});

		it('should render the primary color hint', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect
				.element(
					page.getByText('To change the Primary color, please use a HEX color code.'),
				)
				.toBeVisible();
		});

		it('should render Primary Color labels for Light and Dark modes', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect
				.element(page.getByText(/Primary.*Color for Light Mode/))
				.toBeVisible();
			await expect
				.element(page.getByText(/Primary.*Color for Dark Mode/))
				.toBeVisible();
		});

		it('should render the Empty all fields button', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect
				.element(page.getByRole('button', { name: /empty all fields/i }))
				.toBeVisible();
		});
	});

	describe('Tab bar', () => {
		it('should render END USER and ADMIN PANEL tabs', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect.element(page.getByText('END USER', { exact: true })).toBeVisible();
			await expect.element(page.getByText('ADMIN PANEL', { exact: true })).toBeVisible();
		});

		it('should show End User Webapp content by default', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			await expect.element(page.getByText('End User Webapp')).toBeVisible();
		});

		it('should switch to Admin Panel content when ADMIN PANEL tab is clicked', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			const adminTab = page.getByText('ADMIN PANEL');
			await adminTab.click();

			await expect.element(page.getByText('Admin Panel', { exact: true })).toBeVisible();
		});

		it('should switch back to End User when END USER tab is clicked', async () => {
			setupBrowserTest(<ThemeConfigsWrapper />);

			// Go to admin panel first
			await page.getByText('ADMIN PANEL').click();
			await expect.element(page.getByText('Admin Panel', { exact: true })).toBeVisible();

			// Go back to end user
			await page.getByText('END USER').click();
			await expect.element(page.getByText('End User Webapp')).toBeVisible();
		});
	});

	describe('With pre-filled values', () => {
		it('should render with pre-filled theme config values', async () => {
			setupBrowserTest(<ThemeConfigsWrapper initialTheme={FILLED_THEME} />);

			await expect.element(page.getByText('Apperance')).toBeVisible();
			await expect.element(page.getByText('Color Scheme')).toBeVisible();
		});
	});

	describe('Global theme mode', () => {
		it('should disable Empty all fields button when isGlobalTheme and no modify rights', async () => {
			setupBrowserTest(
				<ThemeConfigsWrapper isGlobalTheme={true} />,
			);

			const resetButton = page.getByRole('button', { name: /empty all fields/i });
			await expect.element(resetButton).toBeDisabled();
		});

		it('should enable Empty all fields button when not global theme', async () => {
			setupBrowserTest(
				<ThemeConfigsWrapper isGlobalTheme={false} />,
			);

			const resetButton = page.getByRole('button', { name: /empty all fields/i });
			await expect.element(resetButton).toBeEnabled();
		});
	});

	describe('Domain-level with globalTheme', () => {
		it('should render when globalTheme is provided', async () => {
			const globalTheme: themeConfigStore = {
				...EMPTY_THEME,
				carbonioLogoUrl: 'https://global.example.com',
				carbonioWebUiPrimaryColor: '#FF0000',
			};

			setupBrowserTest(
				<ThemeConfigsWrapper
					initialTheme={EMPTY_THEME}
					globalTheme={globalTheme}
				/>,
			);

			await expect.element(page.getByText('Apperance')).toBeVisible();
			await expect.element(page.getByText('Logo URL Destination')).toBeVisible();
		});
	});
});
