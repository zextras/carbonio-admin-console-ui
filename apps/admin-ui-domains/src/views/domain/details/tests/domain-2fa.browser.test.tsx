/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { domainByIdKey } from '@zextras/ui-shared';
import { getQueryClient, setupBrowserTest, worker } from 'admin-ui-test-utils';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { DomainTwoFactorAuthentication } from '../domain-2fa';

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

const DOMAIN_ID = 'test-domain-id';
const DOMAIN_NAME = 'example.com';

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

function buildDefaultValues(): PoliciesValues {
  return SERVICE_KEYS.map((key) => ({ [key]: { trustedDevice: 0, trustedIpRange: [] } }));
}

function setup2faInterceptor(
  initialValues: PoliciesValues = buildDefaultValues(),
  setPolicyResult: { ok: boolean; message?: string; error?: string } = { ok: true, message: 'ok' },
): {
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
        if (setPolicyResult.ok) {
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
        } else {
          capturedSetPolicies.push(zextrasBody);
        }
        return HttpResponse.json({
          Body: {
            response: {
              content: JSON.stringify(setPolicyResult),
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
  setPolicyResult?: { ok: boolean; message?: string; error?: string },
): Promise<{ capturedSetPolicies: Array<ZextrasRequestBody['Body']['zextras']> }> {
  const interceptor = setup2faInterceptor(initialValues, setPolicyResult);
  const queryClient = getQueryClient();
  queryClient.setQueryData(domainByIdKey(DOMAIN_ID, 1), {
    id: DOMAIN_ID,
    name: DOMAIN_NAME,
    a: [{ n: 'zimbraDomainName', _content: DOMAIN_NAME }],
  });
  await setupBrowserTest(<DomainTwoFactorAuthentication />, {
    queryClient,
    withDomainIdRoute: true,
    initialRouterEntry: `/${DOMAIN_ID}`,
  });
  await expect.element(page.getByText('2-Factor-Authentication')).toBeVisible();
  return interceptor;
}

const firstServiceChipInput = () => page.getByPlaceholder('Trusted Networks (IP ranges)').nth(1);

describe('DomainTwoFactorAuthentication (browser)', () => {
  describe('Rendering', () => {
    it('renders the 2-Factor-Authentication title', async () => {
      await setup();

      await expect.element(page.getByText('2-Factor-Authentication')).toBeVisible();
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
        level: 'domain',
        domain: DOMAIN_NAME,
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

    it('shows an error snackbar and keeps the dirty state when saving a policy fails', async () => {
      await setup(undefined, { ok: false, error: 'Policy could not be saved' });

      await userEvent.type(firstServiceChipInput(), '192.168.1.1{Enter}');
      await page.getByRole('button', { name: /^save$/i }).click();

      await expect.element(page.getByText('Policy could not be saved')).toBeVisible();
      await expect.element(page.getByRole('button', { name: /^save$/i })).toBeVisible();
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
});
