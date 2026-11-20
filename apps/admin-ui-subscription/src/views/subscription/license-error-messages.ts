/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { LicenseV1Error } from '@zextras/ui-shared';
import type { TFunction } from 'i18next';

export function getLicenseV1ErrorMessage(t: TFunction, error: LicenseV1Error): string {
  switch (error.kind) {
    case 'http-error':
      return t('subscription.errors.load_failed', 'Unable to load the subscription information');
    case 'network-error':
      return t('subscription.errors.unreachable', 'Unable to reach the server');
    default:
      return t('error.something_went_wrong', 'Something went wrong');
  }
}
