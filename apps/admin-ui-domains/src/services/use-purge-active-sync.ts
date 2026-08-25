/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { assertNoFault } from './assert-no-fault';
import { doPurgeActiveSync } from './do-purge-mobile-state';

export const usePurgeActiveSync = () =>
	useMutation({
		mutationFn: async (): Promise<void> => {
			assertNoFault(await doPurgeActiveSync(), 'purging ActiveSync failed');
		},
	});
