/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { isEqual } from 'lodash-es';

import type { TwoFactorAuthPolicyValues, TwoFactorPolicy } from '../../../../types';
import type { TwoFactorPoliciesFormValues } from './two-factor-policies-schema';

export function buildPoliciesFormValues(
  policies: Array<TwoFactorAuthPolicyValues>,
  services: Array<TwoFactorPolicy>,
): TwoFactorPoliciesFormValues {
  const values: TwoFactorPoliciesFormValues = {};
  services.forEach((service) => {
    const entry = policies.find((policy) => Object.hasOwn(policy, service.keyToGet))?.[
      service.keyToGet
    ];
    values[service.keyToGet] = {
      trustedDevice: entry?.trustedDevice,
      trustedIpRange: entry?.trustedIpRange ?? [],
    };
  });
  return values;
}

export function getChangedServices(
  values: TwoFactorPoliciesFormValues,
  defaultValues: TwoFactorPoliciesFormValues,
): Array<string> {
  return Object.keys(values).filter((service) => !isEqual(values[service], defaultValues[service]));
}
