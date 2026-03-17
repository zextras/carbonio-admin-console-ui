/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { page, userEvent } from 'vitest/browser';

import { TotalQuotaSourceIcon } from '../total-quota-source-icon';

describe('TotalQuotaSourceIcon', () => {
  it('should render global icon and tooltip when source is global', async () => {
    await setupBrowserTest(<TotalQuotaSourceIcon source={'global'} />);

    const icon = page.getByTestId('icon: GlobeOutline');
    await expect.element(icon).toBeVisible();

    await userEvent.hover(icon);
    await expect
      .element(page.getByText('Quota inherited from the global configuration'))
      .toBeVisible();
  });

  it('should render domain icon and tooltip when source is domain', async () => {
    await setupBrowserTest(<TotalQuotaSourceIcon source={'domain'} />);

    const icon = page.getByTestId('icon: AtOutline');
    await expect.element(icon).toBeVisible();

    await userEvent.hover(icon);
    await expect.element(page.getByText('Quota inherited from the domain settings.')).toBeVisible();
  });

  it('should render cos icon and tooltip when source is cos', async () => {
    await setupBrowserTest(<TotalQuotaSourceIcon source={'cos'} />);

    const icon = page.getByTestId('icon: SettingsModOutline');
    await expect.element(icon).toBeVisible();

    await userEvent.hover(icon);
    await expect
      .element(page.getByText('Quota inherited from the assigned Class of Service'))
      .toBeVisible();
  });

  it('should render nothing when source is account', async () => {
    const { container } = await setupBrowserTest(<TotalQuotaSourceIcon source={'account'} />);

    expect(container.innerHTML).toBe('');
  });
});
