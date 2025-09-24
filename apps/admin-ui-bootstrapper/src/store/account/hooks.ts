/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { get, join } from 'lodash';
import { useMemo } from 'react';

import { Account, AccountSettings } from '../../../types';

import { useAccountStore } from './store';

export type UseUserAccount = Account;

export const useUserAccount = (): UseUserAccount => useAccountStore((s) => s.account as Account);
export const useUserAccounts = (): Array<Account> => {
	const acct = useAccountStore((s) => s.account);
	return useMemo(() => (acct ? [acct as Account] : []), [acct]);
};

export const useUserSettings = (): AccountSettings => useAccountStore((s) => s.settings);
export const getUserSetting = <T = void>(...path: Array<string>): string | T =>
	get(useAccountStore.getState().settings, join(path, '.'));
