/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { useRestoreForm } from './use-restore-form';

export type RestoreFormValues = {
  legalHoldPrefix: string;
  fromDate: Date | null;
  unDelete: boolean;
  undeleteFromDate: Date | null;
};

export type RestoreFormApi = ReturnType<typeof useRestoreForm>;
