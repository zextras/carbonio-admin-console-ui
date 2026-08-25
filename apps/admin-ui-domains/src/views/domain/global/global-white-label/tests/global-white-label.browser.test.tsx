/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createBrowserSoapAPIInterceptor,
  getQueryClient,
  setupAccount,
  setupBrowserTest,
} from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GlobalWhiteLabel } from '../global-white-label';

type ConfigItem = { n: string; _content: string };

const CONFIG_DATA: Array<ConfigItem> = [
  { n: 'carbonioWebUiDarkMode', _content: 'FALSE' },
  { n: 'carbonioWebUiPrimaryColor', _content: '#225CA8' },
  { n: 'carbonioWebUiDarkPrimaryColor', _content: '#1A4A8A' },
  { n: 'carbonioLogoUrl', _content: 'https://example.com' },
  { n: 'carbonioWebUiTitle', _content: 'Example Title' },
  { n: 'carbonioWebUiDescription', _content: 'Example Description' },
];

async function setup(
  configData: Array<ConfigItem> = CONFIG_DATA,
  restrictedRights = false,
): Promise<ReturnType<typeof getQueryClient>> {
  const queryClient = getQueryClient();
  queryClient.setQueryData(['all-config'], configData);
  createBrowserSoapAPIInterceptor('GetAllConfig', { a: configData });
  if (restrictedRights) {
    await setupAccount(queryClient);
    queryClient.setQueryData(['effective-rights', 'test@example.com'], []);
  }
  await setupBrowserTest(<GlobalWhiteLabel />, {
    queryClient,
    grantRights: restrictedRights ? undefined : 'config',
  });
  return queryClient;
}

describe('GlobalWhiteLabel', () => {

  describe('Rendering', () => {
    it('should render the Whitelabel Settings header', async () => {
      await setup();
      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();
    });

    it('should render the Color Scheme section with primary color labels', async () => {
      await setup();
      await expect.element(page.getByText('Color Scheme')).toBeVisible();
      await expect
        .element(page.getByText('Primary Color for Light Mode'))
        .toBeVisible();
      await expect
        .element(page.getByText('Primary Color for Dark Mode'))
        .toBeVisible();
    });

    it('should not show Save and Cancel buttons when no changes are made', async () => {
      await setup();
      await expect.element(page.getByText('Whitelabel Settings')).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .not.toBeInTheDocument();
      await expect
        .element(page.getByRole('button', { name: /^cancel$/i }))
        .not.toBeInTheDocument();
    });

    it('should load the primary color value from config', async () => {
      await setup();
      const input = page.getByRole('textbox', { name: 'ex. #225CA8' }).first();
      await expect.element(input).toHaveValue('#225CA8');
    });
  });

  describe('Restricted admin', () => {
    it('should disable theme fields when the admin lacks global config modify rights', async () => {
      await setup(CONFIG_DATA, true);

      await expect
        .element(page.getByRole('textbox', { name: /clicking on the logo will redirect/i }))
        .toBeDisabled();
      await expect
        .element(page.getByRole('textbox', { name: 'ex. #225CA8' }).first())
        .toBeDisabled();
      await expect
        .element(page.getByRole('textbox', { name: 'ex. #225CA8' }).last())
        .toBeDisabled();
      await expect
        .element(page.getByRole('button', { name: /empty all fields/i }))
        .toBeDisabled();
    });
  });

  describe('Save theme', () => {
    it('should call ModifyConfig API when Save is clicked after editing primary color', async () => {
      const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
      await setup();

      const primaryColorInput = page.getByRole('textbox', { name: 'ex. #225CA8' }).first();
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#FF0000');

      await page.getByRole('button', { name: /^save$/i }).click();

      const requestParams = (await modifyConfigInterceptor) as any;
      expect(requestParams.a).toBeDefined();

      const colorAttr = requestParams.a.find(
        (attr: any) => attr.n === 'carbonioWebUiPrimaryColor',
      );
      expect(colorAttr).toBeDefined();
      expect(colorAttr._content).toBe('#FF0000');
    });

    it('should show success snackbar after successful save', async () => {
      createBrowserSoapAPIInterceptor('ModifyConfig', {});
      await setup();

      const primaryColorInput = page.getByRole('textbox', { name: 'ex. #225CA8' }).first();
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#00FF00');

      await page.getByRole('button', { name: /^save$/i }).click();

      await expect
        .element(page.getByText('The change has been saved successfully'))
        .toBeVisible();
    });

    it('should clear dirty state after a successful save', async () => {
      // stateful server config so the post-save refetch returns the saved values
      const serverConfig: Array<ConfigItem> = CONFIG_DATA.map((item) => ({ ...item }));
      const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
      void modifyConfigInterceptor.then((params) => {
        const attributes = (params as { a: Array<ConfigItem> }).a;
        attributes.forEach((attr) => {
          const item = serverConfig.find((config) => config.n === attr.n);
          if (item) {
            item._content = attr._content;
          } else {
            serverConfig.push(attr);
          }
        });
      });
      await setup(serverConfig);

      const primaryColorInput = page.getByRole('textbox', { name: 'ex. #225CA8' }).first();
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#00FF00');

      await page.getByRole('button', { name: /^save$/i }).click();

      // wait for the save + refetch to converge before asserting the dirty state cleared
      await vi.waitFor(
        () => {
          expect(page.getByRole('button', { name: /^save$/i }).elements().length).toBe(0);
        },
        { timeout: 5000 },
      );
    });
  });

  describe('Cancel editing', () => {
    it('should revert changes and hide Save/Cancel when Cancel is clicked', async () => {
      await setup();

      const primaryColorInput = page.getByRole('textbox', { name: 'ex. #225CA8' }).first();
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#00FF00');

      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();

      await page.getByRole('button', { name: /^cancel$/i }).click();

      await expect
        .element(page.getByRole('button', { name: /^save$/i }))
        .not.toBeInTheDocument();
      await expect.element(primaryColorInput).toHaveValue('#225CA8');
    });
  });

  describe('Reset theme', () => {
    it('should open reset dialog and call ModifyConfig with empty fields when Yes is clicked', async () => {
      const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
      await setup();

      const resetButton = page.getByRole('button', { name: /empty all fields/i });
      await resetButton.click();

      await expect
        .element(page.getByText(/you sure to reset the whitelabel settings/i))
        .toBeVisible();

      await page.getByRole('button', { name: /^yes$/i }).click();

      const requestParams = (await modifyConfigInterceptor) as any;
      expect(requestParams.a).toBeDefined();

      const colorAttr = requestParams.a.find(
        (attr: any) => attr.n === 'carbonioWebUiPrimaryColor',
      );
      expect(colorAttr).toBeDefined();
      expect(colorAttr._content).toBe('');
    });

    it('should close reset dialog when Cancel is clicked', async () => {
      await setup();

      await page.getByRole('button', { name: /empty all fields/i }).click();

      await expect
        .element(page.getByText(/you sure to reset the whitelabel settings/i))
        .toBeVisible();

      await page.getByRole('button', { name: /cancel/i }).click();

      await expect
        .element(page.getByText(/you sure to reset the whitelabel settings/i))
        .not.toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should show inline error and disable save when light primary color is invalid hex', async () => {
      const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
      await setup();

      const primaryColorInput = page.getByRole('textbox', { name: 'ex. #225CA8' }).first();
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, 'INVALID');

      await expect
        .element(page.getByText('Primary Color for Light Mode is not valid'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeDisabled();

      const settled = await Promise.race([
        modifyConfigInterceptor.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
      ]);
      expect(settled).toBe(false);
    });

    it('should show inline error and disable save when dark primary color is invalid hex', async () => {
      const modifyConfigInterceptor = createBrowserSoapAPIInterceptor('ModifyConfig', {});
      await setup();

      const darkColorInput = page.getByRole('textbox', { name: 'ex. #225CA8' }).last();
      await userEvent.clear(darkColorInput);
      await userEvent.type(darkColorInput, 'NOTHEX');

      await expect
        .element(page.getByText('Primary Color for Dark Mode is not valid'))
        .toBeVisible();
      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeDisabled();

      const settled = await Promise.race([
        modifyConfigInterceptor.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 2000)),
      ]);
      expect(settled).toBe(false);
    });
  });
});
