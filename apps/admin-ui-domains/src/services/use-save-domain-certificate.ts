/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type QueryClient,useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { domainByIdKey, flushCache } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { ZIMBRA_ADMIN_URN, ZIMBRA_SSL_CERTIFICATE, ZIMBRA_SSL_PRIVATE_KEY } from '../constants';
import { domainQueryKeys } from './domain-query-keys';
import { modifyDomain } from './modify-domain-service';

type CertMutationIds = {
  domainId: string;
  domainName: string;
};

async function invalidateCertCaches(
  queryClient: QueryClient,
  domainId: string,
  domainName: string,
): Promise<void> {
  if (domainId) {
    await flushCache('domain', 'id', domainId);
    queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 1) });
    queryClient.invalidateQueries({ queryKey: domainByIdKey(domainId, 0) });
    queryClient.invalidateQueries({ queryKey: domainQueryKeys.domainCert(domainId) });
  }
  if (domainName) {
    queryClient.invalidateQueries({ queryKey: domainQueryKeys.domainSslMaterial(domainName) });
  }
}

export function useSaveDomainCertificate({ domainId, domainName }: CertMutationIds) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { certificate: string; privateKey: string }) =>
      modifyDomain({
        id: domainId,
        _jsns: ZIMBRA_ADMIN_URN,
        a: [
          { n: ZIMBRA_SSL_CERTIFICATE, _content: payload.certificate },
          { n: ZIMBRA_SSL_PRIVATE_KEY, _content: payload.privateKey },
        ],
      }),
    onSuccess: async () => {
      await invalidateCertCaches(queryClient, domainId, domainName);
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('domain.certificate_saved', 'The certificates have been saved'),
        autoHideTimeout: 3000,
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

export function useDeleteDomainCertificate({ domainId, domainName }: CertMutationIds) {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      modifyDomain({
        id: domainId,
        _jsns: ZIMBRA_ADMIN_URN,
        a: [
          { n: ZIMBRA_SSL_CERTIFICATE, _content: '' },
          { n: ZIMBRA_SSL_PRIVATE_KEY, _content: '' },
        ],
      }),
    onSuccess: async () => {
      await invalidateCertCaches(queryClient, domainId, domainName);
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('domain.certificate_removed', 'The certificates has been removed'),
        autoHideTimeout: 3000,
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
