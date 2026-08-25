/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { getDelegateAuthRequest } from './get-delegate-auth-request';

export const useDelegateAuth = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  return useMutation({
    mutationFn: async (accountId: string): Promise<string> => {
      const data = await getDelegateAuthRequest(accountId);
      const token = data?.authToken?.[0]?._content;
      if (!token) {
        throw new Error(
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      }
      return token;
    },
    onError: (error: Error): void => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          error?.message ||
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
};
