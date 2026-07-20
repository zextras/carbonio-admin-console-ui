/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useSnackbar } from '@zextras/ui-components';
import { useEffect } from 'react';

type ShowErrorSnackbarOptions = {
  label: string;
  onAction?: () => void;
  autoHideTimeout?: number;
};

export function useShowErrorSnackbar(
  query: { isError: boolean; isFetching: boolean },
  options: ShowErrorSnackbarOptions,
): void {
  const createSnackbar = useSnackbar();
  const { label, onAction, autoHideTimeout = 5000 } = options;
  const hasError = query.isError && !query.isFetching;
  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- snackbar is an imperative API; the only way to bridge query error state to it is via an effect. Global QueryCache.onError would require modifying the shared ui-shared provider (affecting all apps).
    if (hasError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label,
        autoHideTimeout,
      });
      onAction?.();
    }
  }, [hasError, label, autoHideTimeout, createSnackbar, onAction]);
}
