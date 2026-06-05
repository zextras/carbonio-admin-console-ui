/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import type { AccountType } from '../../../../types/account';

export type CosAdvancedFormValues = AccountType & {
  backupEnabled: boolean;
  backupSelfUndeleteAllowed: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CosFormApi = ReactFormExtendedApi<
  CosAdvancedFormValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;
