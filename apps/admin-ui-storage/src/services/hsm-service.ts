/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest, soapFetch } from '@zextras/ui-shared';

import type { HsmPolicyFromServer, Volume } from '../../types';
import { VOLUME_INDEX_TYPE, ZIMBRA_ADMIN_URN } from '../constants';
import { fetchSoap } from './bucket-service';

export type PowerstoreAttributes = Record<string, { value: unknown }>;

export const getHsmPolicyList = async (server: string): Promise<Array<HsmPolicyFromServer>> => {
  const res = await fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxPowerstore',
    action: 'getHSMPolicy',
    targetServers: server,
  });

  if (!res?.Body?.response?.content) {
    return [];
  }

  const content = JSON.parse(res.Body.response.content);
  const policies = content?.response?.[server]?.response?.policies;

  if (Array.isArray(policies) && policies.length > 0) {
    return policies;
  }

  return [];
};

export const getZxPowerStoreServerAttributes = async (
  server: string,
): Promise<PowerstoreAttributes> => {
  const data: unknown = await getSoapFetchRequest(
    '/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore',
  );

  const serv = (data as { servers?: Array<Record<string, Record<string, unknown>>> })?.servers;

  if (!serv || serv.length === 0) {
    return {};
  }

  const allServers = Object.values(serv).map((i) => Object.values(i)[0]) as Array<
    Record<string, unknown>
  >;

  const selectedServer = allServers.find(
    (sItem) => (sItem as { name?: string }).name === server,
  ) as { ZxPowerstore?: { attributes?: PowerstoreAttributes } } | undefined;

  return selectedServer?.ZxPowerstore?.attributes ?? {};
};

export const getAllVolumesForHsm = async (serverId: string): Promise<Array<Volume>> => {
  const response = await soapFetch<{ _jsns: string }, { volume?: Array<Volume> }>(
    'GetAllVolumes',
    { _jsns: ZIMBRA_ADMIN_URN },
    { targetServer: serverId },
  );

  if (!response?.volume || response.volume.length === 0) {
    return [];
  }

  return response.volume.filter((item: Volume) => item.type !== VOLUME_INDEX_TYPE);
};
