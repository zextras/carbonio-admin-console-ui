/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { type ReactElement,useState } from 'react';

import { AccountFormContext, type AccountFormContextValue } from '../account-form-context';

type AccountFormTestProviderProps = {
  values: Record<string, any>;
  contextOverrides?: Partial<AccountFormContextValue>;
  children: ReactElement;
};

/**
 * Browser-test harness that provides the AccountFormContext backed by a real
 * TanStack form instance, so sections can be rendered in isolation.
 */
export const AccountFormTestProvider = ({
  values,
  contextOverrides,
  children,
}: AccountFormTestProviderProps) => {
  const form = useForm({
    defaultValues: values,
    onSubmit: async () => {},
  });
  const [folderList, setFolderList] = useState<Array<any>>([]);
  const [deligateDetail, setDeligateDetail] = useState<Record<string, any>>({});
  const contextValue: AccountFormContextValue = {
    form,
    account: { id: values?.zimbraId ?? 'mock-zimbra-id', name: values?.name ?? '' },
    resetToSaved: () => {},
    isSaving: false,
    savedValues: values,
    cosDetail: {},
    accSpecificDetail: {},
    signatureList: [],
    directMemberList: [],
    inDirectMemberList: [],
    otpList: [],
    credentialList: [],
    identitiesList: [],
    folderList,
    setFolderList,
    deligateDetail,
    setDeligateDetail,
    sessions: [],
    refetchGrants: () => {},
    allowedDeletePassword: false,
  };
  return (
    <AccountFormContext.Provider value={{ ...contextValue, ...contextOverrides }}>
      {children}
    </AccountFormContext.Provider>
  );
};
