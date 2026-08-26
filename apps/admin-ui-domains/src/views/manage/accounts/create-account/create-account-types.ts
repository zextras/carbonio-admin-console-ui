/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { ReactFormExtendedApi } from '@tanstack/react-form';
import type { z } from 'zod';

import type { AccountRowItem } from '../account-row';
import type { createAccountSchema } from './create-account-schema';

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export type CreateAccountFormApi = ReactFormExtendedApi<
	CreateAccountFormValues,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>;

export type CreateAccountProps = {
  setShowCreateAccountView: (value: boolean) => void;
  getAccountList: () => void;
  setShowEditAccountView: (value: boolean) => void;
  openDetailView: (account: AccountRowItem) => void;
  setShowAccountDetailView: (value: boolean) => void;
  setIsAccountCreated: (value: boolean) => void;
  setDefaultTab: (tab: string) => void;
};
