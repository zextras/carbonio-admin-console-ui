/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSnackbar } from '@zextras/ui-components';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAntiDosConfig } from '../../../services/use-anti-dos-config';
import { GlobalActiveSyncContent } from './global-active-sync-content';

export const GlobalActiveSync = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: antiDosConfig, error: configError, isPending } = useAntiDosConfig();

  useEffect(() => {
    if (configError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          configError.message ??
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [configError, createSnackbar, t]);

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  if (!antiDosConfig) {
    return null;
  }

  return <GlobalActiveSyncContent config={antiDosConfig} />;
};
