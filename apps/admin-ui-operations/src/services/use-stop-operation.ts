/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useAllServers } from '@zextras/ui-shared';
import { useTranslation } from 'react-i18next';

import { type Operation } from '../types/operations';
import { operationQueryKeys } from './operation-query-keys';
import { stopOperations } from './stop-operation';

type UseStopOperationParams = {
  selectedData: Operation | undefined;
  setOpen: (value: boolean) => void;
  setWizardDetailToggle: (value: boolean) => void;
  successI18nKey: string;
  successDefault: string;
};

export const useStopOperation = ({
  selectedData,
  setOpen,
  setWizardDetailToggle,
  successI18nKey,
  successDefault,
}: UseStopOperationParams): (() => void) => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const { data: serverList = [] } = useAllServers();
  const serverName = serverList[0]?.name;

  return () => {
    if (!selectedData?.id) {
      return;
    }

    stopOperations(selectedData?.id)
      .then((res) => {
        const result = JSON.parse(res?.Body?.response?.content ?? '');
        if (result?.response?.[`${serverName}`]?.ok) {
          createSnackbar({
            key: '1',
            severity: 'success',
            label: t(successI18nKey, successDefault, {
              name: selectedData?.name,
            }),
          });
          setOpen(false);
          setWizardDetailToggle(false);
          queryClient.invalidateQueries({ queryKey: operationQueryKeys.allOperations() });
        } else {
          createSnackbar({
            key: '1',
            severity: 'error',
            label: t('label.stop_operation_helperText', '{{message}}', {
              message: result?.response?.[`${serverName}`]?.error?.message,
            }),
          });
          setOpen(false);
          setWizardDetailToggle(false);
        }
      })
      .catch((err) => {
        createSnackbar({
          key: '1',
          severity: 'error',
          label: t('label.operation.stop_operation_error', '{{name}}', {
            name: err,
          }),
        });
      });
  };
};
