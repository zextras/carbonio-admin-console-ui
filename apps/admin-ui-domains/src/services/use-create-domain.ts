/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Attribute } from '../../types';
import { createDomain } from './create-domain';
import { domainQueryKeys } from './domain-query-keys';

export type CreateDomainVariables = {
	name: string;
	attributes?: Array<Attribute>;
};

export function useCreateDomain() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ name, attributes }: CreateDomainVariables) => createDomain(name, attributes),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: domainQueryKeys.all });
		},
	});
}
