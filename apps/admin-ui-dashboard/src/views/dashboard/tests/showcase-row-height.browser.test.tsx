/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest } from 'admin-ui-test-utils';
import { NotificationView } from '@zextras/ui-components';
import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';

import { DashboardDataTableShowcase } from '../dashboard-data-table-showcase';

const MEASURED_NOTIFICATIONS = [
  {
    ack: true,
    date: Date.now(),
    group: 'system',
    id: 'measure-1',
    level: 'Information',
    operationId: 'op-1',
    server: 'mailstore1.example.com',
    subject: 'Measure row one',
    text: 'text one',
  },
  {
    ack: false,
    date: Date.now() - 1000,
    group: 'system',
    id: 'measure-2',
    level: 'Error',
    operationId: 'op-2',
    server: 'mailstore2.example.com',
    subject: 'Measure row two',
    text: 'text two',
  },
];

describe('DashboardDataTableShowcase row height parity', () => {
  it('matches the legacy notifications table row height', async () => {
    const queryClient = getQueryClient();
    queryClient.setQueryData(['notifications'], MEASURED_NOTIFICATIONS);
    await setupBrowserTest(
      <>
        <NotificationView isShowTitle={false} />
        <DashboardDataTableShowcase />
      </>,
      { queryClient },
    );

    await expect.element(page.getByText('Measure row one').first()).toBeVisible();

    const oldRow = page.getByRole('table').first().getByRole('row').nth(1);
    const newRow = page.getByRole('table').last().getByRole('row').nth(1);
    const oldHeight = (await oldRow.element())?.getBoundingClientRect().height ?? 0;
    const newHeight = (await newRow.element())?.getBoundingClientRect().height ?? 0;

    expect(Math.abs(oldHeight - newHeight), `oldHeight=${oldHeight} newHeight=${newHeight}`).toBeLessThan(
      1,
    );
  });
});
