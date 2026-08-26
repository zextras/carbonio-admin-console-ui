/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../constants';
import { InitDomainForDelegation } from './init-domain-for-delegation';

export type InitDomainForDelegationVariables = {
	domain: string;
};

export function useInitDomainForDelegation() {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	return useMutation({
		mutationFn: ({ domain }: InitDomainForDelegationVariables) =>
			InitDomainForDelegation('/admin/initDomainForDelegation', {
				_jsns: ZIMBRA_ADMIN_URN,
				domain
			}),
		onSuccess: (res) => {
			createSnackbar({
				key: 'success',
				severity: 'success',
				label:
					res?.message ||
					t('label.the_last_changes_has_been_saved_successfully', 'Changes have been saved successfully'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		onError: (error: Error) => {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label:
					error?.message ||
					t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		}
	});
}
