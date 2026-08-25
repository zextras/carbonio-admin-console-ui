/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSnackbar } from '@zextras/ui-components';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { use2faPolicies } from '../../../services/use-2fa-policies';
import { GlobalTwoFactorAuthContent } from './global-two-factor-auth-content';

export const GlobalTwoFactorAuth = () => {
  const [t] = useTranslation();
  const createSnackbar = useSnackbar();
  const { data: policies = [], error: policiesError, isPending } = use2faPolicies('');

  useEffect(() => {
    if (policiesError) {
      createSnackbar({
        key: 'error',
        severity: 'error',
        label:
          policiesError.message ??
          t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
        autoHideTimeout: 3000,
        hideButton: true,
        replace: true,
      });
    }
  }, [policiesError, createSnackbar, t]);

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  return <GlobalTwoFactorAuthContent policies={policies} />;
};
