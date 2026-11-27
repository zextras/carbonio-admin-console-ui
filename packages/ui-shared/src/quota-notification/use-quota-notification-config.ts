/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { getQuotaNotificationConfig } from './quota-notification-service';
import type { QuotaNotificationTarget } from './types';

/** Shared by every consumer so invalidation is consistent across apps. */
export const quotaNotificationQueryKey = (target: QuotaNotificationTarget, id: string) =>
	['quota-notification', target, id] as const;

export const useQuotaNotificationConfig = (
	target: QuotaNotificationTarget,
	id: string | undefined,
	enabled: boolean,
) =>
	useQuery({
		queryKey: quotaNotificationQueryKey(target, id ?? ''),
		queryFn: () => getQuotaNotificationConfig(target, id!),
		enabled: !!id && enabled,
		staleTime: 30_000,
		placeholderData: keepPreviousData,
		retry: 1,
		refetchOnWindowFocus: false,
	});
