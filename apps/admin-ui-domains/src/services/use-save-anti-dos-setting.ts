/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { assertNoFault } from './assert-no-fault';
import { domainQueryKeys } from './domain-query-keys';
import { type MobileAntiDosAttribute, setMobileAntiDosService } from './mobile-anti-dos-service';

export type SaveAntiDosSettingInput =
	| { field: 'enabled'; value: boolean }
	| { field: 'jailDuration'; value: number }
	| { field: 'maxRequests'; value: number }
	| { field: 'timeWindow'; value: number };

const ANTI_DOS_ATTRIBUTE_BY_FIELD: Record<SaveAntiDosSettingInput['field'], MobileAntiDosAttribute> = {
	enabled: 'mobileAntiDosServiceEnabled',
	jailDuration: 'mobileAntiDosServiceJailDuration',
	maxRequests: 'mobileAntiDosServiceMaxRequests',
	timeWindow: 'mobileAntiDosServiceTimeWindow'
};

export const useSaveAntiDosSetting = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: SaveAntiDosSettingInput): Promise<void> => {
			assertNoFault(
				await setMobileAntiDosService(ANTI_DOS_ATTRIBUTE_BY_FIELD[input.field], input.value),
				'anti-dos setting save failed'
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: domainQueryKeys.antiDosConfig() });
		},
	});
};
