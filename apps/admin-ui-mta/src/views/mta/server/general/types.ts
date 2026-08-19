/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { MtaServerGeneral } from '../../../../../types';
import type { AppFormApi } from '../../../../types/app-form-api';

export type MtaServerGeneralFormValues = {
  [K in keyof MtaServerGeneral]: MtaServerGeneral[K] | undefined;
};

export type MtaServerGeneralFormApi = AppFormApi<MtaServerGeneralFormValues>;

export type ServerAttr = { n: string; _content: string };

export type ConfigItem = { n: string; _content: string };
