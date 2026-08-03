/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import DomainTheme from '../domain-theme';

const DOMAIN_ID = 'test-domain-id-123';
const DOMAIN_NAME = 'example.com';

type DomainAttribute = { n: string; _content: string };

function buildThemeDomainAttributes(
  overrides: Array<DomainAttribute> = [],
): Array<DomainAttribute> {
  const defaults: Array<DomainAttribute> = [
    { n: 'zimbraDomainName', _content: DOMAIN_NAME },
    { n: 'zimbraId', _content: DOMAIN_ID },
    { n: 'carbonioWebUiPrimaryColor', _content: '#225CA8' },
    { n: 'carbonioWebUiDarkPrimaryColor', _content: '#1A4A8A' },
    { n: 'carbonioLogoUrl', _content: 'https://example.com' },
    { n: 'carbonioWebUiDarkMode', _content: 'FALSE' },
    { n: 'carbonioWebUiTitle', _content: 'Example Title' },
    { n: 'carbonioWebUiDescription', _content: 'Example Description' },
  ];

  const overrideKeys = new Set(overrides.map((o) => o.n));
  const filtered = defaults.filter((d) => !overrideKeys.has(d.n));
  return [...filtered, ...overrides];
}

function setupThemeTest(
  attributeOverrides: Array<DomainAttribute> = [],
): ReturnType<typeof getQueryClient> {
  const domainAttributes = buildThemeDomainAttributes(attributeOverrides);
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  queryClient.setQueryData(['all-config'], []);
  queryClient.setQueryData(['account', 'settings'], { prefs: {}, attrs: {}, props: [] });
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 0), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: domainAttributes,
  });
  return queryClient;
}

describe('DomainTheme', () => {
  let queryClient: ReturnType<typeof getQueryClient>;

  describe('Rendering', () => {
    it('should render the Whitelabel Settings header', async () => {
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();
    });

    it('should render the Color Scheme section with primary color labels', async () => {
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Color Scheme')).toBeVisible();
      await expect.element(page.getByText('Primary Color for Light Mode')).toBeVisible();
      await expect.element(page.getByText('Primary Color for Dark Mode')).toBeVisible();
    });

    it('should not show Save and Cancel buttons when no changes are made', async () => {
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

  });

  describe('Save theme', () => {
    it('should call ModifyDomain API when Save is clicked after editing primary color', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {});
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();

      const primaryColorInput = page
        .getByTestId('inherited-carbonioWebUiPrimaryColor')
        .getByRole('textbox');
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#FF0000');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      const requestParams = (await modifyDomainInterceptor) as any;
      expect(requestParams.id).toBe(DOMAIN_ID);
      expect(requestParams.a).toBeDefined();

      const colorAttr = requestParams.a.find((attr: any) => attr.n === 'carbonioWebUiPrimaryColor');
      expect(colorAttr).toBeDefined();
      expect(colorAttr._content).toBe('#FF0000');
    });

    it('should not call ModifyDomain API when dark primary color is invalid', async () => {
      let apiCalled = false;
      createBrowserSoapAPIInterceptor('ModifyDomain', {}).then(() => {
        apiCalled = true;
      });
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();

      const darkColorInput = page
        .getByTestId('inherited-carbonioWebUiDarkPrimaryColor')
        .getByRole('textbox');
      await userEvent.clear(darkColorInput);
      await userEvent.type(darkColorInput, 'not-a-color');

      const saveButton = page.getByRole('button', { name: /save/i });
      await saveButton.click();

      // Wait a bit to ensure API would have been called if it was going to be
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(apiCalled).toBe(false);
    });
  });

  describe('Cancel editing', () => {
    it('should revert changes and hide Save/Cancel when Cancel is clicked', async () => {
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();

      const primaryColorInput = page
        .getByTestId('inherited-carbonioWebUiPrimaryColor')
        .getByRole('textbox');
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#00FF00');

      await expect.element(page.getByRole('button', { name: /save/i })).toBeVisible();

      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.click();

      await expect.element(page.getByRole('button', { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe('Reset theme', () => {
    it('should open reset dialog and call ModifyDomain with empty fields when Yes is clicked', async () => {
      const modifyDomainInterceptor = createBrowserSoapAPIInterceptor('ModifyDomain', {});
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();

      const resetButton = page.getByRole('button', { name: /empty all fields/i });
      await resetButton.click();

      await expect
        .element(page.getByText(/you sure to reset the whitelabel settings/i))
        .toBeVisible();

      const yesButton = page.getByRole('button', { name: /^yes$/i });
      await yesButton.click();

      const requestParams = (await modifyDomainInterceptor) as any;
      expect(requestParams.id).toBe(DOMAIN_ID);
      expect(requestParams.a).toBeDefined();

      const colorAttr = requestParams.a.find((attr: any) => attr.n === 'carbonioWebUiPrimaryColor');
      expect(colorAttr).toBeDefined();
      expect(colorAttr._content).toBe('');
    });

    it('should close reset dialog when Cancel is clicked without calling API', async () => {
      let apiCalled = false;
      createBrowserSoapAPIInterceptor('ModifyDomain', {}).then(() => {
        apiCalled = true;
      });
      queryClient = setupThemeTest();
      setupBrowserTest(<DomainTheme />, {
        queryClient,
        initialRouterEntry: `/${DOMAIN_ID}/theme`,
        withDomainIdRoute: true,
      });

      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();

      const resetButton = page.getByRole('button', { name: /empty all fields/i });
      await resetButton.click();

      await expect
        .element(page.getByText(/you sure to reset the whitelabel settings/i))
        .toBeVisible();

      // Dialog has CANCEL button, not No
      const cancelDialogButton = page.getByRole('button', { name: /^cancel$/i });
      await cancelDialogButton.click();

      await expect
        .element(page.getByText(/you sure to reset the whitelabel settings/i))
        .not.toBeInTheDocument();

      // Wait a bit to ensure API would have been called if it was going to be
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(apiCalled).toBe(false);
    });
  });
});
