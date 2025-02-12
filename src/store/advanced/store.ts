/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';

import { AdvanceState } from './types';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const useAdvanceStore = create<AdvanceState>(() => ({
	maxApiVersion: 1,
	minApiVersion: 1,
	version: '',
	domain: '',
	isAdvanced: false
}));
