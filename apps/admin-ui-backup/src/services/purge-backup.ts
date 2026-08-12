/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import type { ExternalSoapResponse } from '../../types';
import { PURGE_BACKUP_URL } from '../constants';

export const triggerBackupPurge = async (server: string): Promise<ExternalSoapResponse> =>
  fetchExternalSoap<Record<string, unknown>, ExternalSoapResponse>(PURGE_BACKUP_URL, {
    targetServers: [server],
  });
