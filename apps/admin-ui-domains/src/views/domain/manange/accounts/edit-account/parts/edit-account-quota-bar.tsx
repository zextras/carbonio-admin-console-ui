/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useTotalQuotaActive } from '@zextras/ui-shared';
import { useContext, useMemo } from 'react';

import { AccountContext } from '../../account-context';
import { EditAccountQuotaBarNew } from './edit-account-quota-bar-new';

export const EditAccountQuotaBar = (): React.JSX.Element | null => {
  const isTotalQuotaActive = useTotalQuotaActive();

  const { initAccountDetail } = useContext(AccountContext);
  const {
    totalQuotaUsed: used,
    totalComputedQuotaLimit: limit,
    totalQuotaUsedByModule: usedByModule,
    totalQuotaSource: source,
    totalQuotaStatus: status,
  } = initAccountDetail;
  const dataMissing = useMemo(
    () =>
      used === undefined ||
      limit === undefined ||
      usedByModule === undefined ||
      source === undefined ||
      status === undefined,
    [used, limit, usedByModule, source, status],
  );

  if (!isTotalQuotaActive) {
    return null;
  }

  if (dataMissing) {
    return null;
  }
  return (
    <EditAccountQuotaBarNew
      used={used!}
      limit={limit!}
      usedByModule={usedByModule!}
      source={source!}
      status={status!}
    />
  );
};
