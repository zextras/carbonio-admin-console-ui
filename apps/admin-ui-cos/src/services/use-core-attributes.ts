
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { type CoreAttributeRequest, getCoreAttributes } from '@zextras/ui-shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { cosQueryKeys } from './cos-query-keys';

export const useCoreAttributes = (body: Array<CoreAttributeRequest>) => {
  const createSnackbar = useSnackbar();
  const [t] = useTranslation();

  const result = useQuery({
    queryKey: cosQueryKeys.coreAttributes(body),
    queryFn: () => getCoreAttributes(body),
    enabled: body.length > 0,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (result.error) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: (result.error as Error)?.message
          ? (result.error as Error).message
          : t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [result.error, createSnackbar, t]);

  return result;
};
