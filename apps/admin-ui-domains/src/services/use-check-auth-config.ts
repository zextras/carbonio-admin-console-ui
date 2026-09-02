/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { CHECK_OK } from '../constants';
import {
  checkAuthConfig,
  type CheckAuthConfigBody,
  type CheckAuthConfigResponse,
} from './check-auth-config-service';

export function useCheckAuthConfig() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: async (body: CheckAuthConfigBody): Promise<CheckAuthConfigResponse> => {
      const response = await checkAuthConfig(body);
      if (response?.code?.[0]?._content !== CHECK_OK) {
        throw new Error(
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        );
      }
      return response;
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: error?.message
          ? error.message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 5000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
