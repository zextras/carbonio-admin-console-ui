/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { create } from 'zustand';

type AdvanceState = {
	maxApiVersion: number;
	minApiVersion: number;
	version: string;
	domain: string;
	isAdvanced: boolean;
};

export const useAdvanceStore = create<AdvanceState>(() => ({
	maxApiVersion: 1,
	minApiVersion: 1,
	version: '',
	domain: '',
	isAdvanced: false
}));
