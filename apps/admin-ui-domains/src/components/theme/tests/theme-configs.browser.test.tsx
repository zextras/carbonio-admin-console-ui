/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useForm } from '@tanstack/react-form';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { noop } from 'lodash-es';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type themeConfigStore } from '../../../../types/domain';
import { ThemeConfigs } from '../theme-configs';
import { whiteLabelSchema } from '../white-label-schema';

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
  const form = useForm({
    defaultValues: initialTheme,
    validators: { onChange: whiteLabelSchema, onSubmit: whiteLabelSchema },
  });

  return (
    <ThemeConfigs
      form={form}
      globalTheme={globalTheme}
      isGlobalTheme={isGlobalTheme}
      onResetTheme={noop}
    />
  );
}

describe('ThemeConfigs (browser)', () => {
  describe('Rendering - Common sections', () => {
    it('should render the Appearance section header', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await expect.element(page.getByText('Appearance')).toBeVisible();
    });

    it('should render the Dark Mode select', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await expect.element(page.getByText('Dark Mode', { exact: true })).toBeVisible();
    });

    it('should render the Logo URL Destination section', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await expect.element(page.getByText('Logo URL Destination')).toBeVisible();
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
        .element(page.getByText('To change the Primary color, please use a HEX color code.'))
        .toBeVisible();
    });

    it('should render Primary Color labels for Light and Dark modes', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await expect.element(page.getByText(/Primary.*Color for Light Mode/)).toBeVisible();
      await expect.element(page.getByText(/Primary.*Color for Dark Mode/)).toBeVisible();
    });

    it('should render the Empty all fields button', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await expect.element(page.getByRole('button', { name: /empty all fields/i })).toBeVisible();
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

      await expect.element(page.getByText('Appearance')).toBeVisible();
      await expect.element(page.getByText('Color Scheme')).toBeVisible();
    });
  });

  describe('Global theme mode', () => {
    it('should disable Empty all fields button when isGlobalTheme and no modify rights', async () => {
      setupBrowserTest(<ThemeConfigsWrapper isGlobalTheme={true} />);

      const resetButton = page.getByRole('button', { name: /empty all fields/i });
      await expect.element(resetButton).toBeDisabled();
    });

    it('should enable Empty all fields button when not global theme', async () => {
      setupBrowserTest(<ThemeConfigsWrapper isGlobalTheme={false} />);

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
        <ThemeConfigsWrapper initialTheme={EMPTY_THEME} globalTheme={globalTheme} />,
      );

      await expect.element(page.getByText('Appearance')).toBeVisible();
      await expect.element(page.getByText('Logo URL Destination')).toBeVisible();
    });

    it('shows the Inherited chip instead of the inherited description on the Dark Mode select', async () => {
      const globalTheme: themeConfigStore = {
        ...EMPTY_THEME,
        carbonioLogoUrl: 'https://global.example.com',
        carbonioWebUiPrimaryColor: '#FF0000',
      };

      setupBrowserTest(
        <ThemeConfigsWrapper initialTheme={EMPTY_THEME} globalTheme={globalTheme} />,
      );

      const darkMode = page.getByRole('button', { name: 'Dark Mode' });
      await expect.element(darkMode).toBeVisible();

      const trigger = (await darkMode.element()) as HTMLButtonElement;
      const chip = document.getElementById(trigger.getAttribute('aria-describedby') ?? '');
      expect(chip?.textContent).toBe('Inherited');

      await expect
        .element(page.getByText('Inherited from the global configuration'))
        .not.toBeInTheDocument();
    });
  });

  describe('Proxy-guard warning wiring', () => {
    const HOST = globalThis.location?.hostname ?? 'localhost';
    const PROXY_WARNING = /This image URL isn’t allowed/;

    it('starts on the admin panel tab and targets the logo section when the #logo hash is set', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />, { initialRouterEntry: '/theme#logo' });

      await expect.element(page.getByText('Admin Panel', { exact: true })).toBeVisible();
    });

    it('wires the proxy warning into the admin form', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await page.getByText('ADMIN PANEL').click();
      await expect.element(page.getByText('Admin Panel', { exact: true })).toBeVisible();

      const firstLogoInput = page
        .getByRole('textbox', { name: 'Ex. https://upload.yourlogo.com/' })
        .nth(0);
      await userEvent.fill(firstLogoInput, `https://${HOST}/logo.png`);

      await expect.element(page.getByText(PROXY_WARNING)).toBeVisible();
    });

    it('does not warn on non-image URL fields', async () => {
      setupBrowserTest(<ThemeConfigsWrapper />);

      await page.getByText('ADMIN PANEL').click();
      await expect.element(page.getByText('Admin Panel', { exact: true })).toBeVisible();

      const loginRedirect = page.getByRole('textbox', {
        name: 'LogIn redirect destination (URL)',
      });
      await userEvent.fill(loginRedirect, `https://${HOST}/login`);

      await expect.element(page.getByText(PROXY_WARNING)).not.toBeInTheDocument();
    });
  });
});
