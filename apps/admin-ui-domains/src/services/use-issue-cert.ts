/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from './domain-query-keys';
import { issueCert } from './virtual-host-service';

type UseIssueCertArgs = {
  domainId: string;
  domainName: string;
};

export function useIssueCert({ domainId, domainName }: UseIssueCertArgs) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chainType: string) => issueCert(domainId, chainType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.domainCert(domainId) });
      if (domainName) {
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.domainSslMaterial(domainName) });
      }
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t(
          'label.certificate_request_success',
          'Processing. Results will be notified to global and domain recipients',
        ),
        autoHideTimeout: 7000,
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
