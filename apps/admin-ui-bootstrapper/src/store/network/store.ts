/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';

import { NetworkState } from '../../../types';

export const useNetworkStore = create<NetworkState>(() => ({
	noOpTimeout: undefined,
	context: {},
	pollingInterval: 30000
}));
