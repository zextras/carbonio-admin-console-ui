/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useForm } from '@tanstack/react-form';
import { type ReactElement } from 'react';

import { CREATE_ACCOUNT_DEFAULT_VALUES } from '../create-account-constants';
import {
  CreateAccountFormContext,
  type CreateAccountFormContextValue,
} from '../create-account-form-context';
import { createAccountSchema } from '../create-account-schema';
import type { CreateAccountFormValues } from '../create-account-types';

type CreateAccountFormTestProviderProps = {
  values?: Partial<CreateAccountFormValues>;
  submitAttempted?: boolean;
  setShowCreateAccountView?: (value: boolean) => void;
  children: ReactElement;
};

export const CreateAccountFormTestProvider = ({
  values,
  submitAttempted = false,
  setShowCreateAccountView = () => {},
  children,
}: CreateAccountFormTestProviderProps) => {
  const form = useForm({
    defaultValues: {
      ...CREATE_ACCOUNT_DEFAULT_VALUES,
      ...values,
    },
    validators: {
      onMount: createAccountSchema,
      onChange: createAccountSchema,
    },
    onSubmit: async () => {},
  });
  const contextValue: CreateAccountFormContextValue = {
    form,
    setShowCreateAccountView,
    submitAttempted,
  };
  return (
    <CreateAccountFormContext.Provider value={contextValue}>{children}</CreateAccountFormContext.Provider>
  );
};
