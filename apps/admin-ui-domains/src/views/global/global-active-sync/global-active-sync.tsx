/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { useAntiDosConfig } from '../../../services/use-anti-dos-config';
import { GlobalActiveSyncContent } from './global-active-sync-content';

export const GlobalActiveSync = () => {
  const { data: antiDosConfig, error: configError, isPending } = useAntiDosConfig();

  useQueryErrorSnackbar(configError);

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  if (!antiDosConfig) {
    return null;
  }

  return <GlobalActiveSyncContent config={antiDosConfig} />;
};
