/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ComputedLimit } from '../../../services/account-quota';
import { BytesToGB, GbToBytes } from '../../utility/utils';

/** Plain limit representation used by the quota inputs. */
export type QuotaLimitValue = number | 'unlimited' | undefined;

/**
 * Converts the stored `ComputedLimit` into the plain limit representation
 * used by the quota inputs.
 */
export function computedLimitToLimit(
  computed: ComputedLimit | undefined,
): QuotaLimitValue {
  if (computed === undefined) {
    return undefined;
  }
  return computed.type === 'unlimited' ? 'unlimited' : computed.value;
}

/**
 * Converts a byte/`'unlimited'` limit into the editable GB value.
 */
export function quotaValueFromLimit(limit: QuotaLimitValue): QuotaLimitValue {
  if (typeof limit === 'number') {
    return limit > 0 ? BytesToGB(limit) : undefined;
  }
  return limit;
}

/**
 * True when the quota value (in GB) exceeds a numeric domain quota constraint.
 */
export function quotaExceedsDomainLimit(
  quotaValue: QuotaLimitValue,
  domainQuotaConstraint: number | 'not-set',
): boolean {
  if (typeof domainQuotaConstraint !== 'number' || typeof quotaValue !== 'number') {
    return false;
  }
  return (GbToBytes(quotaValue) as number) > domainQuotaConstraint;
}
