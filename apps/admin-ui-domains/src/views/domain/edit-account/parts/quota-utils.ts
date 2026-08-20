/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ComputedLimit } from '../../../../services/get-account-quota';
import { BytesToGB, GbToBytes } from '../../../utility/utils';

/**
 * Converts the stored `ComputedLimit` into the plain limit representation
 * used by the quota inputs (`number | 'unlimited' | undefined`).
 */
export function computedLimitToLimit(
  computed: ComputedLimit | undefined,
): number | 'unlimited' | undefined {
  if (computed === undefined) {
    return undefined;
  }
  return computed.type === 'unlimited' ? 'unlimited' : computed.value;
}

/**
 * Converts a byte/`'unlimited'` limit into the editable GB value
 * (`number | 'unlimited' | undefined`).
 */
export function quotaValueFromLimit(
  limit: number | 'unlimited' | undefined,
): number | 'unlimited' | undefined {
  if (typeof limit === 'number') {
    return limit > 0 ? BytesToGB(limit) : undefined;
  }
  return limit;
}

/**
 * True when the quota value (in GB) exceeds a numeric domain quota constraint.
 */
export function quotaExceedsDomainLimit(
  quotaValue: number | 'unlimited' | undefined,
  domainQuotaConstraint: number | 'not-set',
): boolean {
  if (typeof domainQuotaConstraint !== 'number' || typeof quotaValue !== 'number') {
    return false;
  }
  return (GbToBytes(quotaValue) as number) > domainQuotaConstraint;
}
