/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSelector } from '@tanstack/react-store';
import { useIsAdvanced } from '@zextras/ui-shared';

import { useAccountForm } from '../account-form-context';
import { EditAccountQuotaBarNew } from './edit-account-quota-bar-new';

export const EditAccountQuotaBar = (): React.JSX.Element | null => {
  const isAdvanced = useIsAdvanced();

  const { form } = useAccountForm();
  const {
    totalQuotaUsed,
    totalComputedQuotaLimit,
    totalQuotaUsedByModule,
    totalQuotaSource,
    totalQuotaStatus,
  } = useSelector(
    form.store,
    (s) =>
      s.values as {
        totalQuotaUsed?: number;
        totalComputedQuotaLimit?: any;
        totalQuotaUsedByModule?: Record<string, number>;
        totalQuotaSource?: any;
        totalQuotaStatus?: any;
      },
  );
  const dataMissing =
    totalQuotaUsed === undefined ||
    totalComputedQuotaLimit === undefined ||
    totalQuotaUsedByModule === undefined ||
    totalQuotaSource === undefined ||
    totalQuotaStatus === undefined;

  if (!isAdvanced || dataMissing) {
    return null;
  }
  return (
    <EditAccountQuotaBarNew
      used={totalQuotaUsed}
      limit={totalComputedQuotaLimit}
      usedByModule={totalQuotaUsedByModule}
      source={totalQuotaSource}
      status={totalQuotaStatus}
    />
  );
};
