/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { assertNoFault } from './assert-no-fault';
import { domainQueryKeys } from './domain-query-keys';
import { setAntiDosServiceEnabled } from './set-mobile-anti-dos-service';
import { setAntiDosServiceJailDuration } from './set-mobile-anti-dos-service-jail-duration';
import { setAntiDosServiceMaxRequests } from './set-mobile-anti-dos-service-max-requests';
import { setAntiDosServiceTimeWindow } from './set-mobile-anti-dos-service-time-window';

export type SaveAntiDosSettingInput =
	| { field: 'enabled'; value: boolean }
	| { field: 'jailDuration'; value: number }
	| { field: 'maxRequests'; value: number }
	| { field: 'timeWindow'; value: number };

export const useSaveAntiDosSetting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SaveAntiDosSettingInput): Promise<void> => {
			switch (input.field) {
				case 'enabled':
					assertNoFault(
						await setAntiDosServiceEnabled(input.value),
						'anti-dos setting save failed',
					);
					return;
				case 'jailDuration':
					assertNoFault(
						await setAntiDosServiceJailDuration(input.value),
						'anti-dos setting save failed',
					);
					return;
				case 'maxRequests':
					assertNoFault(
						await setAntiDosServiceMaxRequests(input.value),
						'anti-dos setting save failed',
					);
					return;
				case 'timeWindow':
					assertNoFault(
						await setAntiDosServiceTimeWindow(input.value),
						'anti-dos setting save failed',
					);
					return;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
		},
	});
};
