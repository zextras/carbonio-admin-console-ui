/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';

import { AccountState } from '../../../types';

// @ts-ignore
export const useAccountStore = create<AccountState>(() => ({
	account: undefined,
	version: '',
	settings: {
		prefs: {},
		attrs: {},
		props: []
	},
	lastNotificationTime: Date.now()
}));
