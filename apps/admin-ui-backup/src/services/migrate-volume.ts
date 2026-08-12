/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import { MIGRATE_VOLUME_URL } from '../constants';
import type { ExternalSoapResponse } from '../../types';

export const migrateVolume = async (
  body: Record<string, unknown>,
): Promise<ExternalSoapResponse> =>
  fetchExternalSoap<Record<string, unknown>, ExternalSoapResponse>(MIGRATE_VOLUME_URL, {
    ...body,
  });
