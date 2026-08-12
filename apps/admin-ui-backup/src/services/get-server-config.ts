/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '@zextras/ui-shared';

import { GET_SERVER_BACKUP_URL } from '../constants';
import type { GetServerResponse } from '../../types';

export const getServerConfig = async (serverId: string): Promise<GetServerResponse> =>
  getSoapFetchRequest<GetServerResponse>(
    `${GET_SERVER_BACKUP_URL}/${serverId}?module=zxbackup`,
  );
