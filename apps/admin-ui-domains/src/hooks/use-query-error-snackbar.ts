/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
  type CreateSnackbarFn,
  type CreateSnackbarFnArgs,
  useSnackbar,
} from '@zextras/ui-components';
import type { TFunction } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { resolveErrorLabel } from '../utils/generate-snackbar-error';

type UseQueryErrorSnackbarOptions = {
  /** Snackbar key; defaults to 'error' */
  key?: string;
  /** autoHide timeout in milliseconds; defaults to 3000 */
  timeout?: number;
  /** Whether to hide the action button; defaults to true */
  hideButton?: boolean;
  /** Custom label used when the error carries no message */
  fallback?: string;
};

function buildErrorSnackbarArgs(
  error: unknown,
  t: TFunction,
  options: UseQueryErrorSnackbarOptions,
): CreateSnackbarFnArgs {
  const { key = 'error', timeout = 3000, hideButton = true, fallback } = options;
  return {
    key,
    severity: 'error',
    label: resolveErrorLabel(error, t, fallback),
    autoHideTimeout: timeout,
    hideButton,
    replace: true,
  };
}

function showErrorSnackbar(
  error: unknown,
  createSnackbar: CreateSnackbarFn,
  t: TFunction,
  options: UseQueryErrorSnackbarOptions,
): void {
  if (!error) {
    return;
  }
  createSnackbar(buildErrorSnackbarArgs(error, t, options));
}

/**
 * Shows an error snackbar whenever `error` becomes truthy.
 */
export function useQueryErrorSnackbar(
  error: unknown,
  options?: UseQueryErrorSnackbarOptions,
): void {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { key = 'error', timeout = 3000, hideButton = true, fallback } = options ?? {};

  useEffect(() => {
    showErrorSnackbar(error, createSnackbar, t, { key, timeout, hideButton, fallback });
  }, [error, createSnackbar, t, key, timeout, hideButton, fallback]);
}
