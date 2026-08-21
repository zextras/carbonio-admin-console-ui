/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { SoapResponseBody } from '../../types';
import { BACKUP_SOAP_URL, ZIMBRA_ADMIN_URN } from '../constants';

export type ServiceAction = 'doStartService' | 'doStopService';

export type ServiceStartStopParams = {
  action: ServiceAction;
  server: string;
};

export const serviceStartStop = async ({
  action,
  server,
}: ServiceStartStopParams): Promise<SoapResponseBody> =>
  postSoapFetchRequest<Record<string, unknown>, SoapResponseBody>(
    BACKUP_SOAP_URL,
    {
      _jsns: ZIMBRA_ADMIN_URN,
      module: 'ZxBackup',
      action,
      service_name: 'module',
      targetServers: server,
    },
    'zextras',
  );
