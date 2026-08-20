/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AnyFormApi } from '@tanstack/react-form';
import { isEqual } from 'lodash-es';
import { createContext, useContext } from 'react';

import type { ComputedLimit } from '../../../../../services/get-account-quota';

export type AccountFormValues = {
  [key: string]: any;
  name?: string;
  uid?: string;
  domainName?: string;
  password?: string;
  repeatPassword?: string;
  deleteAdministrationRights?: Array<any>;
  totalComputedQuotaLimit?: ComputedLimit;
};

export type AccountFormContextValue = {
  form: AnyFormApi;
  account: { id: string; name: string; [key: string]: any };
  resetToSaved: () => void;
  isSaving: boolean;
  savedValues: AccountFormValues;
  cosDetail: Record<string, any>;
  accSpecificDetail: Record<string, any>;
  signatureList: Array<any>;
  directMemberList: Array<any>;
  inDirectMemberList: Array<any>;
  otpList: Array<any>;
  credentialList: Array<any>;
  identitiesList: Array<any>;
  folderList: Array<any>;
  setFolderList: React.Dispatch<React.SetStateAction<Array<any>>>;
  deligateDetail: Record<string, any>;
  setDeligateDetail: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  sessions: Array<any>;
  refetchGrants: () => void;
  allowedDeletePassword: boolean;
};

export const AccountFormContext = createContext<AccountFormContextValue | null>(null);

export function useAccountForm(): AccountFormContextValue {
  const ctx = useContext(AccountFormContext);
  if (!ctx) {
    throw new Error('useAccountForm must be used within an AccountFormContext provider');
  }
  return ctx;
}

/**
 * Pure toggle semantics shared by every boolean-ish switch in the edit-account
 * sections. Flips between `on` and `off`, but when the flipped value is
 * visually identical to the saved one, restores the exact saved value
 * (including `undefined`, i.e. "no override / inherited"), so toggling back
 * clears the dirty state instead of leaving a sticky sentinel behind.
 */
export function computeToggledValue<T>(
  prev: unknown,
  saved: unknown,
  on: T,
  off: T,
): unknown {
  const next = prev === on ? off : on;
  const backToSaved = (next === on) === (saved === on);
  return backToSaved ? saved : next;
}

/**
 * Baseline-anchored toggle over the account form, replacing the per-section
 * `changeSwitchOption` copies. Use `useToggleAccountValue()('zimbraAttr')`
 * for TRUE/FALSE attrs; pass custom sentinels for other pairs
 * (e.g. ENABLED/DISABLED or true/false).
 */
export function useToggleAccountValue(): (
  key: string,
  on?: string | boolean,
  off?: string | boolean,
) => void {
  const { form, savedValues } = useAccountForm();
  return (key, on = 'TRUE', off = 'FALSE'): void => {
    const prev = (form.state.values as Record<string, unknown>)[key];
    const next = computeToggledValue(prev, (savedValues as Record<string, unknown>)[key], on, off);
    if (!isEqual(prev, next)) {
      form.setFieldValue(key, next);
    }
  };
}

/**
 * setState-style setter shim over the form, for consumers that call the
 * setter updater-style (`set((prev) => ({ ...prev, key: value }))`).
 * Only differing keys are written to the form so untouched fields stay untouched.
 */
export function useSetAccountValues(): (update: any) => void {
  const { form } = useAccountForm();
  return (update: any): void => {
    const prev = form.state.values as Record<string, any>;
    const next = typeof update === 'function' ? update(prev) : update;
    Object.keys(next ?? {}).forEach((key) => {
      if (!isEqual(prev?.[key], next[key])) {
        form.setFieldValue(key, next[key]);
      }
    });
  };
}
