/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MtaAdvanced } from '../../../../types';
import type { AppFormApi } from '../../../types/app-form-api';

export type MtaAdvancedFormValues = MtaAdvanced & {
  limitMaxMessageSize: boolean;
  zimbraMtaMaxMessageSizeState: number | string;
};

export type MtaAdvancedFormApi = AppFormApi<MtaAdvancedFormValues>;
