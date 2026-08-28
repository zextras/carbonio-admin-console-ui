/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { domainQueryKeys } from './domain-query-keys';
import { getDistributionList } from './get-distribution-list';

const FALLBACK_ERROR = 'Something went wrong. Please try again.';

export function useDistributionListSnackbar() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const fallback = t('label.something_wrong_error_msg', FALLBACK_ERROR);

  function error(err: Error): void {
    createSnackbar({
      key: 'error',
      severity: 'error',
      label: err.message === '' ? fallback : err.message,
      autoHideTimeout: 3000,
      hideButton: true,
      replace: true,
    });
  }

  return { fallback, error };
}

export function useDistributionList(listId: string | undefined, listName: string | undefined) {
  const { fallback, error } = useDistributionListSnackbar();

  return useQuery({
    queryKey: domainQueryKeys.distributionList(listId ?? ''),
    queryFn: async () => {
      try {
        return await getDistributionList(listId ?? '', listName ?? '');
      } catch (err) {
        const caught = err instanceof Error ? err : new Error(fallback);
        error(caught);
        throw caught;
      }
    },
    enabled: Boolean(listId),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
