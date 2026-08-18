/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import { domainQueryKeys } from './domain-query-keys';
import { getMobileAntiDosService } from './get-mobile-anti-dos-service';
import { getMobileAntiDosServiceJailDuration } from './get-mobile-anti-dos-service-jail-duration';
import { getMobileAntiDosServiceMaxRequests } from './get-mobile-anti-dos-service-max-requests';
import { getMobileAntiDosServiceTimeWindow } from './get-mobile-anti-dos-service-time-window';

export type AntiDosConfig = {
	enabled: boolean;
	jailDuration: string;
	maxRequests: string;
	timeWindow: string;
};

function parseEnvelope(res: any): any {
	return JSON.parse(res?.Body?.response?.content);
}

export function parseAntiDosEnabled(res: any): boolean {
	return Boolean(parseEnvelope(res)?.response?.values?.[0]?.value);
}

export function parseAntiDosValue(res: any): string {
	const entry = parseEnvelope(res)?.response?.values?.[0];
	const value = entry?.value ? entry.value : entry?.inheritedValue;
	return String(value ?? '');
}

export const useAntiDosConfig = () =>
	useQuery({
		queryKey: domainQueryKeys.antiDosConfig(),
		queryFn: async (): Promise<AntiDosConfig> => {
			const [enabledRes, jailRes, maxRes, windowRes] = await Promise.all([
				getMobileAntiDosService(),
				getMobileAntiDosServiceJailDuration(),
				getMobileAntiDosServiceMaxRequests(),
				getMobileAntiDosServiceTimeWindow(),
			]);
			return {
				enabled: parseAntiDosEnabled(enabledRes),
				jailDuration: parseAntiDosValue(jailRes),
				maxRequests: parseAntiDosValue(maxRes),
				timeWindow: parseAntiDosValue(windowRes),
			};
		},
		staleTime: 30_000,
		retry: 1,
		refetchOnWindowFocus: false,
	});
