/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { AccountType } from '../../../../types/account';

export type CosAdvancedFormValues = AccountType & {
  backupEnabled: boolean;
  backupSelfUndeleteAllowed: boolean;
};
