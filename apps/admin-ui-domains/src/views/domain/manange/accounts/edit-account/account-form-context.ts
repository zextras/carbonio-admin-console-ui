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
