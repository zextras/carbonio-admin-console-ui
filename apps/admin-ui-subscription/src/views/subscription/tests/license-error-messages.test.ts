/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { LicenseV1Error } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';

import { getLicenseV1ErrorMessage } from '../license-error-messages';

const tStub = ((key: string) => key) as unknown as TFunction;

describe('getLicenseV1ErrorMessage', () => {
  it('should map http-error to the load-failed message key', () => {
    const error: LicenseV1Error = { kind: 'http-error', status: 500, detail: 'oops' };
    expect(getLicenseV1ErrorMessage(tStub, error)).toBe('subscription.errors.load_failed');
  });

  it('should map network-error to the unreachable message key', () => {
    const error: LicenseV1Error = { kind: 'network-error', detail: 'Failed to fetch' };
    expect(getLicenseV1ErrorMessage(tStub, error)).toBe('subscription.errors.unreachable');
  });

  it('should map invalid-payload to the generic something-went-wrong key', () => {
    const error: LicenseV1Error = { kind: 'invalid-payload', detail: 'not JSON' };
    expect(getLicenseV1ErrorMessage(tStub, error)).toBe('error.something_went_wrong');
  });
});
