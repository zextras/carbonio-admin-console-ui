/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

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

function assertNoFault(res: any): void {
	if (res?.Body?.Fault) {
		throw new Error(res.Body.Fault?.Reason?.Text ?? 'anti-dos setting save failed');
	}
}

export const useSaveAntiDosSetting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SaveAntiDosSettingInput): Promise<void> => {
			switch (input.field) {
				case 'enabled':
					assertNoFault(await setAntiDosServiceEnabled(input.value));
					return;
				case 'jailDuration':
					assertNoFault(await setAntiDosServiceJailDuration(input.value));
					return;
				case 'maxRequests':
					assertNoFault(await setAntiDosServiceMaxRequests(input.value));
					return;
				case 'timeWindow':
					assertNoFault(await setAntiDosServiceTimeWindow(input.value));
					return;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
		},
	});
};
