/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { postSoapFetchRequest } from '@zextras/ui-shared';

import type { DumpGlobalConfigResponse } from '../../types';

type DumpGlobalConfigRequest = {
  _jsns: string;
  module: string;
  action: string;
};

export const dumpGlobalConfig = async (): Promise<DumpGlobalConfigResponse> => {
  const request: DumpGlobalConfigRequest = {
    _jsns: 'urn:zimbraAdmin',
    module: 'ZxConfig',
    action: 'dump_global_config',
    // targetServers: serverName
  };

  return postSoapFetchRequest<DumpGlobalConfigRequest, DumpGlobalConfigResponse>(
    `/service/admin/soap/zextras`,
    request,
    'zextras',
  );
};
