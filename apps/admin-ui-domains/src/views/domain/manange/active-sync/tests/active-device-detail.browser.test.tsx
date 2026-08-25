/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { MobileDevice } from '../../../../../services/parse-active-sync';
import { ActiveDeviceDetail } from '../active-device-detail';

type ZextrasRequestBody = {
  Body: {
    zextras: {
      action: string;
    };
  };
};

const SELECTED_DEVICE: MobileDevice = {
  accountEmail: 'alice@example.com',
  accountName: 'iPhone',
  accountServer: 'mail.example.com',
  deviceId: 'DEV-001',
  deviceType: 'iPhone',
  firstSeen: 1700000001000,
  hasMobilePassword: false,
  isOnline: true,
  lastCommandReceived: 1700001000000,
  lastPingTimeoutSecs: 300,
  lastSeen: 1700100000000,
  protocolVersion: '14.1',
  provisionable: true,
  status: 1,
  userAgent: 'Apple-iPhone/1',
};

const DEVICE_STATS = {
  ...SELECTED_DEVICE,
  friendlyName: 'Alice iPhone',
};

function buildStatsContent(): string {
  return JSON.stringify({
    response: {
      'mail.example.com': {
        response: DEVICE_STATS,
      },
    },
  });
}

function setupZextrasInterceptor(): void {
  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as ZextrasRequestBody;
      const action = body?.Body?.zextras?.action;

      if (action === 'getDeviceStatistics') {
        return HttpResponse.json({
          Body: { response: { content: buildStatsContent() } },
        });
      }

      if (action === 'doSuspendDeviceSync' || action === 'doWipeDevice' || action === 'doResetDevice') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({ ok: true, response: {} }),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );
}

function renderDetail(onClose = vi.fn()) {
  const queryClient = getQueryClient();
  return setupBrowserTest(
    <ActiveDeviceDetail selectedDevice={SELECTED_DEVICE} onClose={onClose} />,
    { queryClient },
  );
}

describe('ActiveDeviceDetail (browser)', () => {
  it('renders the account name in the header', async () => {
    setupZextrasInterceptor();
    await renderDetail();

    await expect.element(page.getByText('iPhone')).toBeVisible();
  });

  it('renders device statistics after they load', async () => {
    setupZextrasInterceptor();
    await renderDetail();

    await expect.element(page.getByText('mail.example.com')).toBeVisible();
    await expect.element(page.getByText('alice@example.com')).toBeVisible();
    await expect.element(page.getByText('DEV-001')).toBeVisible();
    await expect.element(page.getByText('Server')).toBeVisible();
    await expect.element(page.getByText('Device ID')).toBeVisible();
    await expect.element(page.getByText('Last Access')).toBeVisible();
  });

  it('calls onClose when the close button is clicked', async () => {
    setupZextrasInterceptor();
    const onClose = vi.fn();
    await renderDetail(onClose);

    await userEvent.click(page.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('opens the wipe confirmation modal', async () => {
    setupZextrasInterceptor();
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Wipe Device' }));

    await expect.element(page.getByText('You are trying to wipe a device')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Yes, wipe the device' })).toBeVisible();
    await expect.element(page.getByText(/I am aware of what I’m doing/)).toBeVisible();
  });

  it('opens the reset confirmation modal', async () => {
    setupZextrasInterceptor();
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Reset Device' }));

    await expect.element(page.getByText('You are trying to reset a device')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Yes, reset the device' })).toBeVisible();
  });

  it('suspends the device without a confirmation modal and shows success', async () => {
    setupZextrasInterceptor();
    const onClose = vi.fn();
    await renderDetail(onClose);
    await expect.element(page.getByText('DEV-001')).toBeVisible();

    await userEvent.click(page.getByRole('button', { name: 'Suspend' }));

    await expect.element(page.getByText('The change has been saved successfully')).toBeVisible();
    expect(onClose).toHaveBeenCalled();
  });
});
