/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useQueryErrorSnackbar } from '../../../hooks/use-query-error-snackbar';
import { use2faPolicies } from '../../../services/use-2fa-policies';
import { GlobalTwoFactorAuthContent } from './global-two-factor-auth-content';

export const GlobalTwoFactorAuth = () => {
  const { data: policies = [], error: policiesError, isPending } = use2faPolicies('');

  useQueryErrorSnackbar(policiesError);

  if (isPending) {
    return <ds-spinner></ds-spinner>;
  }

  return <GlobalTwoFactorAuthContent policies={policies} />;
};
