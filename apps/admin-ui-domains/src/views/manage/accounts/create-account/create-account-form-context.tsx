/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { createContext, useContext } from 'react';

import type { CreateAccountFormApi } from './create-account-types';

export type CreateAccountFormContextValue = {
  form: CreateAccountFormApi;
  setShowCreateAccountView: (value: boolean) => void;

  submitAttempted: boolean;
};

export const CreateAccountFormContext = createContext<CreateAccountFormContextValue | null>(null);

export function useCreateAccountFormContext(): CreateAccountFormContextValue {
  const ctx = useContext(CreateAccountFormContext);
  if (!ctx) {
    throw new Error(
      'useCreateAccountFormContext must be used within a CreateAccountFormContext provider',
    );
  }
  return ctx;
}
