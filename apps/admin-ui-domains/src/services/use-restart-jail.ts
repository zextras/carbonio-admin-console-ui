/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';

import { assertNoFault } from './assert-no-fault';
import { doStratStopJail } from './do-start-stop-jail';

export const useRestartJail = () =>
	useMutation({
		mutationFn: async (serverNames: Array<string>): Promise<void> => {
			await Promise.all(
				serverNames.map(async (serverName) => {
					const response = await doStratStopJail('doStartService', serverName);
					assertNoFault(response, `restarting jail on ${serverName} failed`);
				}),
			);
		},
	});
