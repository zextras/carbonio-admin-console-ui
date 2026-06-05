/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';

import { cosQueryKeys } from './cos-query-keys';

export function useInvalidateCosQuota() {
	const queryClient = useQueryClient();
	return (cosId: string) =>
		queryClient.invalidateQueries({ queryKey: cosQueryKeys.cosQuota(cosId) });
}
