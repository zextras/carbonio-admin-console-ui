/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { page } from 'vitest/browser';

import { QuotaBar } from '../quota-bar';

describe('QuotaBar', () => {
  it('should render correctly the given background', async () => {
    await setupBrowserTest(
      <QuotaBar modules={[]} background="#f00" limit={{ type: 'limited', value: 1 }} used={0} />,
    );

    expect(page.getByTestId('quota-bar')).toHaveStyle('background: red');
  });

  it('should render the correct number of modules with the correct colors', async () => {
    const modules = [
      { label: 'Module 1', color: '#f00', used: 1 },
      { label: 'Module 2', color: '#0ff', used: 2 },
    ];

    await setupBrowserTest(
      <QuotaBar modules={modules} limit={{ type: 'limited', value: 10 }} used={3} />,
    );

    const segments = page.getByTestId('quota-bar-module-segment');
    expect(segments).toHaveLength(modules.length);
    modules.forEach((module, index) => {
      expect(segments.nth(index)).toHaveStyle(`background: ${module.color}`);
    });
  });

  it('should render the correct number of modules even if they exceed the limit', async () => {
    const modules = [
      { label: 'Module 1', color: 'red', used: 5 },
      { label: 'Module 2', color: 'blue', used: 7 },
    ];

    await setupBrowserTest(
      <QuotaBar modules={modules} limit={{ type: 'limited', value: 10 }} used={12} />,
    );

    const segments = page.getByTestId('quota-bar-module-segment');
    expect(segments).toHaveLength(modules.length);
    modules.forEach((module, index) => {
      expect(segments.nth(index)).toBeVisible();
    });
  });

  it('should render the legend entry for the available space with the correct label', async () => {
    const modules = [
      { label: 'Module 1', color: 'red', used: 5 },
      { label: 'Module 2', color: 'blue', used: 7 },
    ];

    await setupBrowserTest(
      <QuotaBar modules={modules} limit={{ type: 'limited', value: 15 }} used={12} />,
    );

    expect(page.getByTestId('quota-bar-legend-entry').getByText('Available (3 B)')).toBeVisible();
  });

  it('should render the legend with the correct number of entries', async () => {
    const modules = [
      { label: 'Module 1', color: 'red', used: 5 },
      { label: 'Module 2', color: 'blue', used: 7 },
    ];

    await setupBrowserTest(
      <QuotaBar modules={modules} limit={{ type: 'limited', value: 15 }} used={12} />,
    );

    const legendEntries = page.getByTestId('quota-bar-legend-entry');
    expect(legendEntries).toHaveLength(modules.length + 1);
  });
});
