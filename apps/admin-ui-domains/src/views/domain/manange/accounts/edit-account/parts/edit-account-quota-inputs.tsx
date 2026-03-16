/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ComponentProps, Dispatch, SetStateAction, useCallback } from 'react';

import { useTotalQuotaActive } from '../../../../../app/hooks/useTotalQuotaActive';
import { AccountDetail } from '../../account-context';
import { EditAccountQuotaInputsLegacy } from './edit-account-quota-inputs-legacy';
import { EditAccountQuotaInputsNew } from './edit-account-quota-inputs-new';

type EditAccountQuotaInputsProps = {
  focusableFileQuota: boolean;
  highlightFileQuota: boolean;
  focusableMailboxQuota: boolean;
  highlightMailboxQuota: boolean;
  setFocusableFileQuota: (value: boolean) => void;
  setHighlightFileQuota: (value: boolean) => void;
  setFocusableMailboxQuota: (value: boolean) => void;
  setHighlightMailboxQuota: (value: boolean) => void;
  accountDetail: AccountDetail;
  initialAccountDetail: AccountDetail;
  setAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
};

export const EditAccountQuotaInputs = ({
  focusableFileQuota,
  highlightFileQuota,
  focusableMailboxQuota,
  highlightMailboxQuota,
  setFocusableFileQuota,
  setHighlightFileQuota,
  setFocusableMailboxQuota,
  setHighlightMailboxQuota,
  accountDetail,
  initialAccountDetail,
  setAccountDetail,
}: EditAccountQuotaInputsProps): React.JSX.Element => {
  const isTotalQuotaActive = useTotalQuotaActive();

  const onTotalComputedQuotaLimitChange: ComponentProps<
    typeof EditAccountQuotaInputsNew
  >['onChange'] = useCallback(
    (value) => {
      setAccountDetail((prev) => ({ ...prev, totalComputedQuotaLimit: value }));
    },
    [setAccountDetail],
  );

  if (isTotalQuotaActive) {
    return (
      <EditAccountQuotaInputsNew
        totalComputedQuotaLimit={
          accountDetail.totalComputedQuotaLimit === undefined
            ? undefined
            : accountDetail.totalComputedQuotaLimit.type === 'unlimited'
            ? 'unlimited'
            : accountDetail.totalComputedQuotaLimit.value
        }
        initialTotalComputedQuotaLimit={
          initialAccountDetail.totalComputedQuotaLimit === undefined
            ? undefined
            : initialAccountDetail.totalComputedQuotaLimit.type === 'unlimited'
            ? 'unlimited'
            : initialAccountDetail.totalComputedQuotaLimit.value
        }
        totalQuotaSource={accountDetail.totalQuotaSource}
        onChange={onTotalComputedQuotaLimitChange}
      />
    );
  }

  return (
    <EditAccountQuotaInputsLegacy
      focusableFileQuota={focusableFileQuota}
      highlightFileQuota={highlightFileQuota}
      focusableMailboxQuota={focusableMailboxQuota}
      highlightMailboxQuota={highlightMailboxQuota}
      setFocusableFileQuota={setFocusableFileQuota}
      setHighlightFileQuota={setHighlightFileQuota}
      setFocusableMailboxQuota={setFocusableMailboxQuota}
      setHighlightMailboxQuota={setHighlightMailboxQuota}
    />
  );
};
