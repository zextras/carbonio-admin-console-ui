/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { LicenseV1Error } from './license-info-service';

export type LicenseV1CapabilityResult =
  | { type: 'success'; allowed: boolean }
  | { type: 'error'; error: LicenseV1Error };

export const fetchLicenseV1Capability = async (
  capability: string,
  accountId?: string,
): Promise<LicenseV1CapabilityResult> => {
  try {
    const url = `/services/license/v1/capabilities/allowed?capability=${encodeURIComponent(
      capability,
    )}${accountId ? `&accountId=${encodeURIComponent(accountId)}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const body = (await response.text()).trim().slice(0, 200);
      return {
        type: 'error',
        error: {
          kind: 'http-error',
          status: response.status,
          detail:
            body.length > 0 ? body : `Capability request failed: ${response.status}`,
        },
      };
    }

    const text = await response.text();
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      return {
        type: 'error',
        error: { kind: 'invalid-payload', detail: 'Invalid capability payload' },
      };
    }

    if (
      typeof payload !== 'object' ||
      payload === null ||
      typeof (payload as Record<string, unknown>).allowed !== 'boolean'
    ) {
      return {
        type: 'error',
        error: { kind: 'invalid-payload', detail: 'Invalid capability payload' },
      };
    }

    return { type: 'success', allowed: (payload as { allowed: boolean }).allowed };
  } catch (error) {
    return {
      type: 'error',
      error: {
        kind: 'network-error',
        detail: error instanceof Error ? error.message : String(error),
      },
    };
  }
};
