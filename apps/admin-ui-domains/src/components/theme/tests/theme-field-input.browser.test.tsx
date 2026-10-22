/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { type themeConfigStore } from '../../../../types/domain';
import { ThemeFieldInput } from '../theme-field-input';
import { HTTPS_URL_ERROR_LABEL, whiteLabelSchema } from '../white-label-schema';

const HOST = globalThis.location?.hostname ?? 'localhost';
const BLOCKED_URL = `https://${HOST}/logo.png`;
const EXTERNAL_URL = 'https://cdn.example.com/logo.png';
const PROXY_WARNING = /Warning: this URL points to this server/;

function FieldHarness({
  name = 'carbonioAdminUiAppLogo',
  label = 'App Logo',
  initialValue,
  globalTheme,
  warnWhenProxyBlocked,
}: {
  name?: keyof themeConfigStore;
  label?: string;
  initialValue?: string;
  globalTheme?: themeConfigStore;
  warnWhenProxyBlocked?: boolean;
}) {
  const form = useForm({
    defaultValues: { [name]: initialValue } as themeConfigStore,
    validators: { onChange: whiteLabelSchema },
  });

  return (
    <ThemeFieldInput
      form={form}
      name={name}
      label={label}
      globalTheme={globalTheme}
      warnWhenProxyBlocked={warnWhenProxyBlocked}
      errorLabel={HTTPS_URL_ERROR_LABEL}
      errorLabelDefault="You need to use the HTTPS protocol"
    />
  );
}

describe('ThemeFieldInput (browser)', () => {
  it('shows the warning when the URL is same-origin outside the allowlist', async () => {
    setupBrowserTest(<FieldHarness label="Login Logo" initialValue={BLOCKED_URL} warnWhenProxyBlocked />);

    await expect.element(page.getByText(PROXY_WARNING)).toBeVisible();
  });

  it('shows no warning for an external https URL', async () => {
    setupBrowserTest(<FieldHarness label="Login Logo" initialValue={EXTERNAL_URL} warnWhenProxyBlocked />);

    await expect.element(page.getByText(PROXY_WARNING)).not.toBeInTheDocument();
  });

  it('shows no warning for a same-origin URL under /static/', async () => {
    setupBrowserTest(
      <FieldHarness label="Login Logo" initialValue={`https://${HOST}/static/logo.png`} warnWhenProxyBlocked />,
    );

    await expect.element(page.getByText(PROXY_WARNING)).not.toBeInTheDocument();
  });

  it('updates the warning as the value changes', async () => {
    setupBrowserTest(<FieldHarness label="App Logo" warnWhenProxyBlocked />);

    const input = page.getByRole('textbox', { name: 'App Logo' });
    await userEvent.fill(input, BLOCKED_URL);
    await expect.element(page.getByText(PROXY_WARNING)).toBeVisible();

    await userEvent.fill(input, EXTERNAL_URL);
    await expect.element(page.getByText(PROXY_WARNING)).not.toBeInTheDocument();
  });

  it('prefers the schema error over the warning', async () => {
    setupBrowserTest(<FieldHarness label="App Logo URL" warnWhenProxyBlocked />);

    const input = page.getByRole('textbox', { name: 'App Logo URL' });
    await userEvent.fill(input, `http://${HOST}/logo.png`);

    await expect.element(page.getByText('You need to use the HTTPS protocol')).toBeVisible();
    await expect.element(page.getByText(PROXY_WARNING)).not.toBeInTheDocument();
  });

  it('shows the warning for an inherited blocked URL', async () => {
    setupBrowserTest(
      <FieldHarness
        label="App Logo"
        globalTheme={{ carbonioAdminUiAppLogo: BLOCKED_URL } as themeConfigStore}
        warnWhenProxyBlocked
      />,
    );

    await expect.element(page.getByText(PROXY_WARNING)).toBeVisible();
  });

  it('shows no warning when warnWhenProxyBlocked is not set', async () => {
    setupBrowserTest(<FieldHarness label="App Logo" initialValue={BLOCKED_URL} />);

    await expect.element(page.getByText(PROXY_WARNING)).not.toBeInTheDocument();
  });
});
