/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useAllServers } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { type OperationsContent, type SoapContentResponse } from '../types/operations';
import { operationsContentSchema } from '../types/operations-schemas';
import { operationQueryKeys } from './operation-query-keys';
import { stopOperations } from './stop-operation';

type StopOperationVariables = { id: string; name?: string };

export const useStopOperation = (
  onSuccessClose: () => void,
  successI18nKey: string,
  successDefault: string,
) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: serverList = [] } = useAllServers();
  const serverName = serverList[0]?.name;

  return useMutation<SoapContentResponse, Error, StopOperationVariables>({
    mutationKey: operationQueryKeys.stopOperation(),
    mutationFn: ({ id }) => stopOperations(id),
    onSuccess: async (data, vars) => {
      let ok = false;
      let errorMessage: string | undefined;
      try {
        const raw = JSON.parse(data?.Body?.response?.content ?? '{}');
        const result = operationsContentSchema.safeParse(raw);
        if (result.success) {
          const parsed = result.data as OperationsContent;
          ok = Boolean(parsed.response?.[serverName ?? '']?.ok);
          errorMessage = parsed.response?.[serverName ?? '']?.error?.message;
        }
      } catch {
        ok = false;
      }
      if (ok) {
        createSnackbar({
          key: 'success',
          severity: 'success',
          label: t(successI18nKey, successDefault, {
            name: vars.name,
          }),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
        queryClient.invalidateQueries({ queryKey: operationQueryKeys.allOperations() });
      } else {
        createSnackbar({
          key: 'error',
          severity: 'error',
          label: t('label.stop_operation_helperText', '{{message}}', {
            message: errorMessage,
          }),
          autoHideTimeout: 3000,
          hideButton: true,
          replace: true,
        });
      }
      onSuccessClose();
    },
    onError: (error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: t('label.operation.stop_operation_error', '{{name}}', {
          name: error?.message,
        }),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
};
