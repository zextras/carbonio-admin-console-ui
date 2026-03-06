/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { setupBrowserTest } from 'admin-ui-test-utils';
import { page } from 'vitest/browser';

import { QuotaLegendEntry } from '../quota-legend-entry';

describe('QuotaLegendEntry', () => {
  it('should render label and human-readable size', async () => {
    await setupBrowserTest(<QuotaLegendEntry label="Used" used={1048576} color="red" />);

    expect(page.getByText('Used (1 MB)')).toBeVisible();
  });

  it('should render a color indicator', async () => {
    await setupBrowserTest(<QuotaLegendEntry label="Used" used={1048576} color="#f00" />);

    expect(page.getByTestId('color-indicator')).toHaveStyle('background: red');
  });
});
