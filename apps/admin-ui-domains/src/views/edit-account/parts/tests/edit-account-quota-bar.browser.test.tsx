/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupBrowserTest } from 'admin-ui-test-utils';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { QuotaBarBreakdown } from '../edit-account-quota-bar';

describe('QuotaBarBreakdown', () => {
  it('should render the quota bar with the correct usage and limit', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={512 * 1024 * 1024}
        limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
        usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
      />,
    );

    expect(page.getByText('512 MB of 1 GB (50%)')).toBeVisible();
  });

  it('should render the correct number of modules with the correct colors', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={500000000}
        limit={{ type: 'limited', value: 1000000000 }}
        usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
      />,
    );

    const segments = page.getByTestId('quota-bar-module-segment');
    expect(segments).toHaveLength(3);
    expect(segments.nth(0)).toHaveStyle('background: #10789F');
    expect(segments.nth(1)).toHaveStyle('background: #FD830B');
    expect(segments.nth(2)).toHaveStyle('background: #2EAF96');
  });

  it('should show correct size description when quota limit is unlimited', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={500 * 1024 * 1024}
        limit={{ type: 'unlimited' }}
        usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
      />,
    );

    expect(page.getByText('500 MB of Unlimited storage used')).toBeVisible();
  });

  it('should show correct size description when quota limit is limited', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={512 * 1024 * 1024}
        limit={{ type: 'limited', value: 2 * 1024 * 1024 * 1024 }}
        usedByModule={{
          mailbox: 200 * 1024 * 1024,
          files: 200 * 1024 * 1024,
          wsc: 100 * 1024 * 1024,
        }}
      />,
    );

    expect(page.getByText('512 MB of 2 GB (25%)')).toBeVisible();
  });

  it('should not show available element in the legend when the limit is unlimited', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={500 * 1024 * 1024}
        limit={{ type: 'unlimited' }}
        usedByModule={{
          mailbox: 200 * 1024 * 1024,
          files: 200 * 1024 * 1024,
          wsc: 100 * 1024 * 1024,
        }}
      />,
    );

    expect(page.getByTestId('quota-bar-module-segment')).toHaveLength(3);
    expect(page.getByText('Available')).not.toBeInTheDocument();
  });

  it('should show available element in the legend when the limit is limited', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={500 * 1024 * 1024}
        limit={{ type: 'limited', value: 2 * 1024 * 1024 * 1024 }}
        usedByModule={{
          mailbox: 200 * 1024 * 1024,
          files: 200 * 1024 * 1024,
          wsc: 100 * 1024 * 1024,
        }}
      />,
    );

    expect(page.getByTestId('quota-bar-module-segment')).toHaveLength(3);
    expect(page.getByText('Available')).toBeVisible();
  });

  it('should show warning banner when limit is limited and usage is between 80 and 100%', async () => {
    await setupBrowserTest(
      <QuotaBarBreakdown
        status="UNDERQUOTA"
        source={'account'}
        used={850 * 1024 * 1024}
        limit={{ type: 'limited', value: 1 * 1024 * 1024 * 1024 }}
        usedByModule={{
          mailbox: 400 * 1024 * 1024,
          files: 300 * 1024 * 1024,
          wsc: 150 * 1024 * 1024,
        }}
      />,
    );

    expect(
      page.getByText(
        'This account is approaching its storage limit. Increase storage quota or notify the user to free up space.',
      ),
    ).toBeVisible();
  });

  describe('Source icon', () => {
    it('should show global icon when totalQuotaSource is global', async () => {
      await setupBrowserTest(
        <QuotaBarBreakdown
          status="UNDERQUOTA"
          source={'global'}
          used={512 * 1024 * 1024}
          limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
          usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
        />,
      );

      await expect.element(page.getByTestId('icon: GlobeOutline')).toBeVisible();
    });

    it('should show proper tooltip when hovering icon and totalQuotaSource is global', async () => {
      await setupBrowserTest(
        <QuotaBarBreakdown
          status="UNDERQUOTA"
          source={'global'}
          used={512 * 1024 * 1024}
          limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
          usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
        />,
      );

      const globalIcon = page.getByTestId('icon: GlobeOutline');
      await userEvent.hover(globalIcon);

      await expect
        .element(page.getByText('Quota inherited from the global configuration'))
        .toBeVisible();
    });

    it('should show domain icon when totalQuotaSource is domain', async () => {
      await setupBrowserTest(
        <QuotaBarBreakdown
          status="UNDERQUOTA"
          source={'domain'}
          used={512 * 1024 * 1024}
          limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
          usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
        />,
      );

      await expect.element(page.getByTestId('icon: AtOutline')).toBeVisible();
    });

    it('should show proper tooltip when hovering icon and totalQuotaSource is domain', async () => {
      await setupBrowserTest(
        <QuotaBarBreakdown
          status="UNDERQUOTA"
          source={'domain'}
          used={512 * 1024 * 1024}
          limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
          usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
        />,
      );

      const domainIcon = page.getByTestId('icon: AtOutline');
      await userEvent.hover(domainIcon);

      await expect
        .element(page.getByText('Quota inherited from the domain settings'))
        .toBeVisible();
    });

    it('should show cos icon when totalQuotaSource is cos', async () => {
      await setupBrowserTest(
        <QuotaBarBreakdown
          status="UNDERQUOTA"
          source={'cos'}
          used={512 * 1024 * 1024}
          limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
          usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
        />,
      );

      await expect.element(page.getByTestId('icon: SettingsModOutline')).toBeVisible();
    });

    it('should show proper tooltip when hovering icon and totalQuotaSource is cos', async () => {
      await setupBrowserTest(
        <QuotaBarBreakdown
          status="UNDERQUOTA"
          source={'cos'}
          used={512 * 1024 * 1024}
          limit={{ type: 'limited', value: 1024 * 1024 * 1024 }}
          usedByModule={{ mailbox: 300000000, files: 100000000, wsc: 100000000 }}
        />,
      );

      const cosIcon = page.getByTestId('icon: SettingsModOutline');
      await userEvent.hover(cosIcon);

      await expect
        .element(page.getByText('Quota inherited from the assigned Class of Service'))
        .toBeVisible();
    });
  });
});
