/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AccountType } from '../../../../../types/account';
import { useTimeFieldState } from './use-time-field-state';

const TIME_FIELD_KEYS = {
  mailMessageLifetime: 'zimbraMailMessageLifetime',
  quotaWarnInterval: 'zimbraQuotaWarnInterval',
  passwordLockoutDuration: 'zimbraPasswordLockoutDuration',
  passwordLockoutFailureLifetime: 'zimbraPasswordLockoutFailureLifetime',
  adminAuthTokenLifetime: 'zimbraAdminAuthTokenLifetime',
  authTokenLifetime: 'zimbraAuthTokenLifetime',
  mailIdleSessionTimeout: 'zimbraMailIdleSessionTimeout',
  mailTrashLifetime: 'zimbraMailTrashLifetime',
  mailSpamLifetime: 'zimbraMailSpamLifetime',
} as const satisfies Record<string, keyof AccountType>;

type TimeFieldKey = keyof typeof TIME_FIELD_KEYS;

export type TimeFields = Record<TimeFieldKey, ReturnType<typeof useTimeFieldState>>;

export function useTimeFields(
  setCosAdvanced: React.Dispatch<React.SetStateAction<AccountType>>,
): TimeFields {
  const mailMessageLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.mailMessageLifetime]: v })),
  );
  const quotaWarnInterval = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.quotaWarnInterval]: v })),
  );
  const passwordLockoutDuration = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.passwordLockoutDuration]: v })),
  );
  const passwordLockoutFailureLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.passwordLockoutFailureLifetime]: v })),
  );
  const adminAuthTokenLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.adminAuthTokenLifetime]: v })),
  );
  const authTokenLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.authTokenLifetime]: v })),
  );
  const mailIdleSessionTimeout = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.mailIdleSessionTimeout]: v })),
  );
  const mailTrashLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.mailTrashLifetime]: v })),
  );
  const mailSpamLifetime = useTimeFieldState((v) =>
    setCosAdvanced((prev) => ({ ...prev, [TIME_FIELD_KEYS.mailSpamLifetime]: v })),
  );

  return {
    mailMessageLifetime,
    quotaWarnInterval,
    passwordLockoutDuration,
    passwordLockoutFailureLifetime,
    adminAuthTokenLifetime,
    authTokenLifetime,
    mailIdleSessionTimeout,
    mailTrashLifetime,
    mailSpamLifetime,
  };
}
