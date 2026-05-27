/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import type { AccountType } from '../../../../types/account';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CosFormApi = ReactFormExtendedApi<
  AccountType,
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
