/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN } from '../constants';
import { useSnackbar } from '../hooks/useSnackbar';
import { soapFetch } from '../network/fetch';

export type ConfigAttribute = { n: string; _content?: string };

export const modifyConfigAttributes = (a: Array<ConfigAttribute>): Promise<unknown> =>
  soapFetch('ModifyConfig', {
    _jsns: ZIMBRA_ADMIN_URN,
    a,
  });

/**
 * Mutation for SOAP ModifyConfig with success/error snackbars and
 * invalidation of the ['all-config'] query. Pass a custom mutationFn to
 * reuse the snackbar/invalidation behavior with a typed payload.
 */
export function useModifyConfig<TVariables = Array<ConfigAttribute>>(
  mutationFn?: (variables: TVariables) => Promise<unknown>,
) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, TVariables>({
    mutationFn: (variables) =>
      mutationFn ? mutationFn(variables) : modifyConfigAttributes(variables as Array<ConfigAttribute>),
    onSuccess: () => {
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('label.change_save_success_msg', 'The change has been saved successfully'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
      void queryClient.invalidateQueries({ queryKey: ['all-config'] });
    },
    onError: (error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: error?.message
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
