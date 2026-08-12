/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { fetchExternalSoap } from '@zextras/ui-shared';

import { SMART_SCAN_URL } from '../constants';
import type { ExternalSoapResponse } from '../../types';

export const triggerSmartScan = async (server: string): Promise<ExternalSoapResponse> =>
  fetchExternalSoap<Record<string, unknown>, ExternalSoapResponse>(SMART_SCAN_URL, {
    targetServers: [server],
  });
