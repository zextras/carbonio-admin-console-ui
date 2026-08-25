/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { INVALID } from '../constants';
import {
  verifyCertKey,
  type VerifyCertKeyBody,
  type VerifyCertKeyResponse,
} from './verify-cert-key-service';

export function useVerifyCertKey() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();

  return useMutation({
    mutationFn: (body: VerifyCertKeyBody): Promise<VerifyCertKeyResponse> => verifyCertKey(body),
    onSuccess: (data) => {
      if (data?.verifyResult === INVALID) {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t(
            'domain.certificate_invalid_error',
            'The certificate is invalid , please try with other certificate',
          ),
          autoHideTimeout: 6000,
          hideButton: true,
          replace: true,
        });
        return;
      }
      if (data?.verifyResult) {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t('domain.certificate_valid', 'The certificate is valid'),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        return;
      }
      createSnackbar({
        key: 'warning',
        severity: 'warning',
        label: t(
          'domain.certificate_valid_but_either_expired_or_exists_non_trusted_CA',
          "The certificate is valid but it's either expired or exists a non trusted CA",
        ),
        autoHideTimeout: 6000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error: Error) => {
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
