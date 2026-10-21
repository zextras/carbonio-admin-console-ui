/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import type { MobileDevice } from '../../../../services/parse-active-sync';
import { ActiveDeviceDetail } from '../active-device-detail';

type ZextrasRequestBody = {
  Body: {
    zextras: {
      account?: string;
      accountName?: string;
      action: string;
      deviceId?: string;
      status?: string;
    };
  };
};

type AbqDevicePayload = { device_id: string; status: string };

type InterceptorOptions = {
  abqDevices?: Array<AbqDevicePayload>;
  deviceStatus?: number;
  abqSaveOk?: boolean;
  statsGate?: Promise<unknown>;
};

type ZextrasInterceptor = {
  capturedBodies: Array<ZextrasRequestBody['Body']['zextras']>;
  setAbqDevices: (devices: Array<AbqDevicePayload>) => void;
  setDeviceStatus: (status: number) => void;
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

function buildStatsContent(deviceStatus: number): string {
  return JSON.stringify({
    response: {
      'mail.example.com': {
        response: { ...DEVICE_STATS, status: deviceStatus },
      },
    },
  });
}

function setupZextrasInterceptor(options: InterceptorOptions = {}): ZextrasInterceptor {
  const state = {
    abqDevices: options.abqDevices ?? [{ device_id: 'DEV-001/uuid', status: 'Allowed' }],
    deviceStatus: options.deviceStatus ?? 1,
    abqSaveOk: options.abqSaveOk ?? true,
  };
  const capturedBodies: Array<ZextrasRequestBody['Body']['zextras']> = [];

  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as ZextrasRequestBody;
      const action = body?.Body?.zextras?.action;

      if (action === 'getDeviceStatistics') {
        await options.statsGate;
        return HttpResponse.json({
          Body: { response: { content: buildStatsContent(state.deviceStatus) } },
        });
      }

      if (action === 'abqListDevices') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({ ok: true, response: { devices: state.abqDevices } }),
            },
          },
        });
      }

      if (
        action === 'doSuspendDeviceSync' ||
        action === 'doResumeDeviceSync' ||
        action === 'doWipeDevice' ||
        action === 'doResetDevice'
      ) {
        capturedBodies.push(body?.Body?.zextras);
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({ ok: true, response: {} }),
            },
          },
        });
      }

      if (action === 'abqSetDeviceStatus') {
        capturedBodies.push(body?.Body?.zextras);
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify(
                state.abqSaveOk
                  ? { ok: true, response: {} }
                  : { ok: false, error: { message: 'Cannot update device' } },
              ),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );

  return {
    capturedBodies,
    setAbqDevices: (devices: Array<AbqDevicePayload>): void => {
      state.abqDevices = devices;
    },
    setDeviceStatus: (status: number): void => {
      state.deviceStatus = status;
    },
  };
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

    await expect.element(page.getByRole('heading', { name: 'iPhone' })).toBeVisible();
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

  it('shows a spinner while the device statistics are loading', async () => {
    let releaseStats: () => void = () => {};
    const statsGate = new Promise<void>((resolve) => {
      releaseStats = resolve;
    });
    setupZextrasInterceptor({ statsGate });
    await renderDetail();

    await expect.element(page.getByRole('status')).toBeVisible();
    await expect.element(page.getByText('Device ID')).not.toBeInTheDocument();

    releaseStats();

    await expect.element(page.getByText('DEV-001')).toBeVisible();
  });

  it('initializes the ABQ select from abqListDevices', async () => {
    setupZextrasInterceptor({ abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Blocked' }] });
    await renderDetail();

    await expect.element(page.getByText('Blocked')).toBeVisible();
  });

  it('defaults the ABQ select to Allowed when the device is absent from the ABQ list', async () => {
    setupZextrasInterceptor({ abqDevices: [] });
    await renderDetail();

    await expect.element(page.getByText('Allowed')).toBeVisible();
  });

  it('shows Save and Cancel only after a select changes', async () => {
    setupZextrasInterceptor({
      abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Quarantined' }],
    });
    await renderDetail();
    await expect.element(page.getByText('Quarantined')).toBeVisible();

    await expect
      .element(page.getByRole('button', { name: 'Save' }))
      .not.toBeInTheDocument();

    await page.getByRole('button', { name: 'ABQ Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();

    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  it('saves the ABQ status via abqSetDeviceStatus and converges clean', async () => {
    const interceptor = setupZextrasInterceptor({
      abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Quarantined' }],
    });
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();
    await expect.element(page.getByText('Quarantined')).toBeVisible();

    interceptor.setAbqDevices([{ device_id: 'DEV-001/uuid', status: 'Blocked' }]);

    await page.getByRole('button', { name: 'ABQ Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.poll(() => interceptor.capturedBodies[0]).toMatchObject({
      action: 'abqSetDeviceStatus',
      deviceId: 'DEV-001',
      account: 'alice@example.com',
      status: 'blocked',
    });
    await expect
      .element(page.getByText('The change has been saved successfully'))
      .toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Save' }))
      .not.toBeInTheDocument();
  });

  it('saves the Status change via suspend without sending an ABQ request', async () => {
    const interceptor = setupZextrasInterceptor({ deviceStatus: 1 });
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();

    interceptor.setDeviceStatus(2);

    await page.getByRole('button', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Can`t receiver' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.poll(() => interceptor.capturedBodies.length).toBe(1);
    expect(interceptor.capturedBodies[0]).toMatchObject({
      action: 'doSuspendDeviceSync',
      accountName: 'iPhone',
      deviceId: 'DEV-001',
    });
    await expect
      .element(page.getByText('The change has been saved successfully'))
      .toBeVisible();
  });

  it('sends both changed fields in one save and converges clean', async () => {
    const interceptor = setupZextrasInterceptor({
      abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Quarantined' }],
    });
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();
    await expect.element(page.getByText('Quarantined')).toBeVisible();

    interceptor.setAbqDevices([{ device_id: 'DEV-001/uuid', status: 'Blocked' }]);
    interceptor.setDeviceStatus(2);

    await page.getByRole('button', { name: 'ABQ Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await page.getByRole('button', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Can`t receiver' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.poll(() => interceptor.capturedBodies.length).toBe(2);
    expect(interceptor.capturedBodies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'abqSetDeviceStatus', status: 'blocked' }),
        expect.objectContaining({ action: 'doSuspendDeviceSync' }),
      ]),
    );
    await expect
      .element(page.getByText('The change has been saved successfully'))
      .toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Save' }))
      .not.toBeInTheDocument();
  });

  it('keeps the dirty state when only one of the two saves succeeds', async () => {
    const interceptor = setupZextrasInterceptor({
      abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Quarantined' }],
      abqSaveOk: false,
    });
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();
    await expect.element(page.getByText('Quarantined')).toBeVisible();

    await page.getByRole('button', { name: 'ABQ Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await page.getByRole('button', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Can`t receiver' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.poll(() => interceptor.capturedBodies.length).toBe(2);
    await expect.element(page.getByText('Cannot update device')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('resumes a suspended device when Status is set back to Can receive', async () => {
    const interceptor = setupZextrasInterceptor({ deviceStatus: 2 });
    await renderDetail();
    await expect.element(page.getByText('DEV-001')).toBeVisible();
    await expect.element(page.getByText('Can`t receiver')).toBeVisible();

    interceptor.setDeviceStatus(1);

    await page.getByRole('button', { name: 'Status' }).click();
    await page.getByRole('option', { name: 'Can receive' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.poll(() => interceptor.capturedBodies[0]).toMatchObject({
      action: 'doResumeDeviceSync',
      accountName: 'iPhone',
      deviceId: 'DEV-001',
    });
    await expect
      .element(page.getByText('The change has been saved successfully'))
      .toBeVisible();
  });

  it('resets edits when Cancel is clicked', async () => {
    setupZextrasInterceptor({
      abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Quarantined' }],
    });
    await renderDetail();
    await expect.element(page.getByText('Quarantined')).toBeVisible();

    await page.getByRole('button', { name: 'ABQ Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect.element(page.getByText('Quarantined')).toBeVisible();
    await expect
      .element(page.getByRole('button', { name: 'Save' }))
      .not.toBeInTheDocument();
  });

  it('keeps the dirty state and shows an error snackbar when the backend rejects the change', async () => {
    setupZextrasInterceptor({
      abqDevices: [{ device_id: 'DEV-001/uuid', status: 'Quarantined' }],
      abqSaveOk: false,
    });
    await renderDetail();
    await expect.element(page.getByText('Quarantined')).toBeVisible();

    await page.getByRole('button', { name: 'ABQ Status' }).click();
    await page.getByRole('option', { name: 'Blocked' }).click();
    await page.getByRole('button', { name: 'Save' }).click();

    await expect.element(page.getByText('Cannot update device')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Save' })).toBeVisible();
  });
});
