/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ReactFormExtendedApi } from '@tanstack/react-form';

import type { CosPrefAttributes } from '../../../../types/cos';

export type CosPreferencesFormValues = CosPrefAttributes;

export type CosPreferencesFormApi = ReactFormExtendedApi<
  CosPreferencesFormValues,
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
