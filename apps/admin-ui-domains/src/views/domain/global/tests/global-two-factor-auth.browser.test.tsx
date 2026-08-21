/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { GlobalTwoFactorAuth } from '../global-two-factor-auth/global-two-factor-auth';

type ZextrasRequestBody = {
  Body: {
    zextras: {
      module: string;
      action: string;
      level: string;
      domain: string;
      service?: string;
      trustedDevice?: number;
      trustedIpRange?: string;
    };
  };
};

type PolicyEntry = { trustedDevice: number; trustedIpRange: Array<string> };

type PoliciesValues = Array<Record<string, PolicyEntry>>;

const SERVICE_KEYS = [
  'WebAdminUI',
  'WebUI',
  'MobileApp',
  'EAS',
  'DesktopApp',
  'Dav',
  'Pop3',
  'Imap',
  'Smtp',
];

const SERVICE_LABELS = [
  'Admin API',
  'WebUI',
  'Mobile Apps',
  'ActiveSync',
  'DesktopSync',
  'DAV',
  'POP',
  'IMAP',
  'SMTP',
];

function buildDefaultValues(): PoliciesValues {
  return SERVICE_KEYS.map((key) => ({ [key]: { trustedDevice: 0, trustedIpRange: [] } }));
}

function setup2faInterceptor(initialValues: PoliciesValues = buildDefaultValues()): {
  capturedSetPolicies: Array<ZextrasRequestBody['Body']['zextras']>;
} {
  const capturedSetPolicies: Array<ZextrasRequestBody['Body']['zextras']> = [];
  let serverValues: PoliciesValues = initialValues.map((entry) => ({ ...entry }));

  worker.use(
    http.post('/service/admin/soap/zextras', async ({ request }) => {
      const body = (await request.json()) as ZextrasRequestBody;
      const zextrasBody = body?.Body?.zextras;

      if (zextrasBody?.module === 'ZxAuth' && zextrasBody.action === 'listPolicies') {
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({ response: { values: serverValues } }),
            },
          },
        });
      }

      if (zextrasBody?.module === 'ZxAuth' && zextrasBody.action === 'setPolicy') {
        capturedSetPolicies.push(zextrasBody);
        const service = zextrasBody.service ?? '';
        const trustedIpRange =
          zextrasBody.trustedIpRange === 'empty' || zextrasBody.trustedIpRange === undefined
            ? []
            : zextrasBody.trustedIpRange.split(',');
        serverValues = serverValues.map((entry) =>
          Object.hasOwn(entry, service)
            ? {
                [service]: {
                  trustedDevice: zextrasBody.trustedDevice ?? 0,
                  trustedIpRange,
                },
              }
            : entry,
        );
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify({ ok: true, message: 'ok' }),
            },
          },
        });
      }

      return HttpResponse.json({ Body: {} });
    }),
  );

  return { capturedSetPolicies };
}

async function setup(
  initialValues?: PoliciesValues,
): Promise<{ capturedSetPolicies: Array<ZextrasRequestBody['Body']['zextras']> }> {
  const interceptor = setup2faInterceptor(initialValues);
  await setupBrowserTest(<GlobalTwoFactorAuth />, { queryClient: getQueryClient() });
  await expect.element(page.getByText('2-Factor-Authentication')).toBeVisible();
  return interceptor;
}

const firstServiceChipInput = () => page.getByPlaceholder('Trusted Networks (IP ranges)').nth(1);
const firstServiceDropdown = () => page.getByText('What to trust?').nth(1);

describe('GlobalTwoFactorAuth (browser)', () => {
  describe('Rendering', () => {
    it('renders the title, configuration section and all service rows', async () => {
      await setup();

      await expect.element(page.getByText('Configuration')).toBeVisible();
      await expect
        .element(page.getByRole('button', { name: /apply to all services/i }))
        .toBeVisible();
      for (const label of SERVICE_LABELS) {
        await expect.element(page.getByText(label, { exact: true })).toBeVisible();
      }
    });

    it('loads the saved trusted values into the service rows', async () => {
      await setup([
        { WebAdminUI: { trustedDevice: 1, trustedIpRange: ['10.0.0.1', '192.168.1.0/24'] } },
        ...SERVICE_KEYS.slice(1).map((key) => ({
          [key]: { trustedDevice: 0, trustedIpRange: [] },
        })),
      ]);

      await expect.element(page.getByText('10.0.0.1')).toBeVisible();
      await expect.element(page.getByText('192.168.1.0/24')).toBeVisible();
    });

    it('does not show Save and Cancel buttons when not dirty', async () => {
      await setup();

      await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
      await expect.element(page.getByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
    });
  });

  describe('Dirty state', () => {
    it('shows Save and Cancel after editing a service row', async () => {
      await setup();

      await userEvent.type(firstServiceChipInput(), '192.168.1.1{Enter}');

      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();
      await expect.element(page.getByRole('button', { name: /^cancel$/i })).toBeVisible();
    });

    it('hides Save and Cancel and reverts the edit when Cancel is clicked', async () => {
      await setup();

      await userEvent.type(firstServiceChipInput(), '192.168.1.1{Enter}');
      await expect.element(page.getByText('192.168.1.1')).toBeVisible();

      await page.getByRole('button', { name: /^cancel$/i }).click();

      await expect.element(page.getByRole('button', { name: /^save$/i })).not.toBeInTheDocument();
      await expect.element(page.getByText('192.168.1.1').first()).not.toBeInTheDocument();
    });
  });

  describe('Save', () => {
    it('sends setPolicy only for the changed service, then clears the dirty state', async () => {
      const { capturedSetPolicies } = await setup();

      await userEvent.type(firstServiceChipInput(), '192.168.1.1{Enter}');
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect.poll(() => capturedSetPolicies.length).toBe(1);
      expect(capturedSetPolicies[0]).toMatchObject({
        module: 'ZxAuth',
        action: 'setPolicy',
        level: 'global',
        domain: '',
        service: 'WebAdminUI',
        trustedDevice: 0,
        trustedIpRange: '192.168.1.1',
      });

      await expect
        .element(page.getByText('The settings have been applied to all services'))
        .toBeVisible();
      await expect
        .poll(() => page.getByRole('button', { name: /^save$/i }).elements().length)
        .toBe(0);
    });

    it("sends 'empty' as trustedIpRange when the changed service has no IPs", async () => {
      const { capturedSetPolicies } = await setup();

      await firstServiceDropdown().click();
      await page.getByText('Trust the device', { exact: true }).first().click();
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect.poll(() => capturedSetPolicies.length).toBe(1);
      expect(capturedSetPolicies[0]).toMatchObject({
        service: 'WebAdminUI',
        trustedDevice: 2,
        trustedIpRange: 'empty',
      });
    });
  });

  describe('Validation', () => {
    it('flags an invalid IP inline and does not send setPolicy when saving', async () => {
      const { capturedSetPolicies } = await setup();

      await userEvent.type(firstServiceChipInput(), 'invalid-ip{Enter}');

      await expect.element(page.getByText('One or more IP are invalid')).toBeVisible();
      await page.getByRole('button', { name: /^save$/i }).click();

      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(capturedSetPolicies).toHaveLength(0);
    });
  });

  describe('Apply to all', () => {
    it('marks the form dirty without saving when APPLY TO ALL SERVICES is clicked', async () => {
      const { capturedSetPolicies } = await setup();

      await page.getByText('What to trust?').nth(0).click();
      await page.getByText('Trust the IP', { exact: true }).first().click();
      await page.getByRole('button', { name: /apply to all services/i }).click();

      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();

      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(capturedSetPolicies).toHaveLength(0);
    });
  });
});
