/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { Dispatch, SetStateAction } from 'react';

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
  initAccountDetail: AccountDetail;
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
  initAccountDetail,
  setAccountDetail
}: EditAccountQuotaInputsProps): React.JSX.Element => {

  const isTotalQuotaActive = useTotalQuotaActive();

  if (!isTotalQuotaActive) {
    return <EditAccountQuotaInputsLegacy
      focusableFileQuota={focusableFileQuota}
      highlightFileQuota={highlightFileQuota}
      focusableMailboxQuota={focusableMailboxQuota}
      highlightMailboxQuota={highlightMailboxQuota}
      setFocusableFileQuota={setFocusableFileQuota}
      setHighlightFileQuota={setHighlightFileQuota}
      setFocusableMailboxQuota={setFocusableMailboxQuota}
      setHighlightMailboxQuota={setHighlightMailboxQuota}
    />
  } else {
    return <EditAccountQuotaInputsNew initAccountDetail={initAccountDetail} setAccountDetail={setAccountDetail} accountDetail={accountDetail} />
  }
}