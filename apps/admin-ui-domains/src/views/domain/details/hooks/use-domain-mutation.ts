/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey } from '@zextras/ui-shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

type UseDomainMutationOptions<TData, TVariables> = {
	mutationFn: (variables: TVariables) => Promise<TData>;
	successMessage?: string;
};

type UseDomainMutationResult<TData, TVariables> = {
	mutate: (variables: TVariables) => Promise<TData | undefined>;
	isPending: boolean;
};

export function useDomainMutation<TData, TVariables>({
	mutationFn,
	successMessage
}: UseDomainMutationOptions<TData, TVariables>): UseDomainMutationResult<TData, TVariables> {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const queryClient = useQueryClient();
	const { domainId } = useParams<{ domainId: string }>();
	const [isPending, setIsPending] = useState(false);

	const mutate = async (variables: TVariables): Promise<TData | undefined> => {
		setIsPending(true);
		try {
			const result = await mutationFn(variables);
			createSnackbar({
				key: 'domain-mutation-success',
				severity: 'success',
				label: successMessage ?? t('label.change_save_success_msg', 'Changes saved successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			if (domainId) {
				await queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
			}
			return result;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			createSnackbar({
				key: 'domain-mutation-error',
				severity: 'error',
				label: errorMessage || t('label.something_wrong_error_msg', 'Something went wrong'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return undefined;
		} finally {
			setIsPending(false);
		}
	};

	return { mutate, isPending };
}
