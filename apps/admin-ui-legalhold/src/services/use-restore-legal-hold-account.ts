/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@zextras/ui-components';
import { useTranslation } from 'react-i18next';

import { type ErrorResponse, formattedErrorMessage } from '../views/utility/utils';
import { legalHoldQueryKeys } from './legal-hold-query-keys';
import { doRestoreOnNewLegalHoldAccount } from './restore-new-legal-hold-account';

export type RestoreLegalHoldVariables = {
  sourceAccountId: string;
  destinationAccount: string;
  date: number;
  undeleteDate: number | null;
  unDelete: boolean;
  targetServers: string;
};

function restoreErrorMessage(error: Error, fallback: string): string {
  const formatted = formattedErrorMessage(error as unknown as ErrorResponse);
  return formatted.message || error.message || fallback;
}

export function useRestoreLegalHoldAccount() {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const queryClient = useQueryClient();
  const fallback = t('label.something_wrong_error_msg', 'Something went wrong. Please try again.');

  return useMutation({
    mutationFn: async ({
      sourceAccountId,
      destinationAccount,
      date,
      undeleteDate,
      unDelete,
      targetServers,
    }: RestoreLegalHoldVariables) => {
      const result = await doRestoreOnNewLegalHoldAccount(
        sourceAccountId,
        destinationAccount,
        date,
        undeleteDate,
        unDelete,
        targetServers,
      );
      if (result.type === 'error') {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: legalHoldQueryKeys.all });
      createSnackbar({
        key: 'success',
        severity: 'success',
        label: t('legal_hold.account_successful_restored', 'Account successfully restored'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
    onError: (error: Error) => {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label: restoreErrorMessage(error, fallback),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    },
  });
}
