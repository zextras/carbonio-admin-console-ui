/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvanced, useTotalQuotaActive } from '@zextras/ui-shared';
import { useContext, useMemo } from 'react';

import { AccountContext } from '../../account-context';
import { EditAccountQuotaBarLegacy } from './edit-account-quota-bar-legacy';
import { EditAccountQuotaBarNew } from './edit-account-quota-bar-new';

export type EditAccountQuotaBarProps = {
  onClickMailboxQuota: () => void;
  onClickFilesQuota: () => void;
};

export const EditAccountQuotaBar = ({
  onClickMailboxQuota,
  onClickFilesQuota,
}: EditAccountQuotaBarProps): React.JSX.Element | null => {
  const isAdvanced = useIsAdvanced();
  const isTotalQuotaActive = useTotalQuotaActive();

  const { initAccountDetail } = useContext(AccountContext);
  const {
    totalQuotaUsed: used,
    totalComputedQuotaLimit: limit,
    totalQuotaUsedByModule: usedByModule,
    totalQuotaSource: source,
  } = initAccountDetail;
  const dataMissing = useMemo(
    () =>
      used === undefined ||
      limit === undefined ||
      usedByModule === undefined ||
      source === undefined,
    [used, limit, usedByModule, source],
  );

  if (!isTotalQuotaActive) {
    return (
      <EditAccountQuotaBarLegacy
        onClickMailboxQuota={onClickMailboxQuota}
        onClickFilesQuota={onClickFilesQuota}
      />
    );
  }

  if (!isAdvanced || dataMissing) {
    return null;
  }
  return (
    <EditAccountQuotaBarNew
      used={used!}
      limit={limit!}
      usedByModule={usedByModule!}
      source={source!}
    />
  );
};
