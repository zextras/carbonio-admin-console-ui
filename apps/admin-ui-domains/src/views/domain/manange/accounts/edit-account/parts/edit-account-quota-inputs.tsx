/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useTotalQuotaActive } from '@zextras/ui-shared';
import React, { ComponentProps, Dispatch, SetStateAction, useCallback } from 'react';

import { AccountDetail, CosDetail } from '../../account-context';
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
  cosDetail: CosDetail;
  initialAccountDetail: AccountDetail;
  setAccountDetail: Dispatch<SetStateAction<AccountDetail>>;
  onQuotaErrorChange: (hasError: boolean) => void;
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
  cosDetail,
  initialAccountDetail,
  setAccountDetail,
  onQuotaErrorChange,
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
        cosComputedLimit={
          cosDetail.totalComputedQuotaLimit === undefined
            ? undefined
            : cosDetail.totalComputedQuotaLimit.type === 'unlimited'
            ? 'unlimited'
            : cosDetail.totalComputedQuotaLimit.value
        }
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
        onQuotaErrorChange={onQuotaErrorChange}
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
