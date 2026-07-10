/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { getSoapFetchRequest } from '@zextras/ui-shared';

import { DESCRIPTION, HSM_SCHEDULED_KEY, INDEXER_MANAGER_KEY, ZIMBRA_ADMIN_URN } from '../constants';
import { fetchSoap } from './bucket-service';

export type ServerVolumeSummaryItem = {
  name: string;
  primaries?: string;
  secondaries?: string;
  indexes?: string;
  hsmScheduled?: string;
  indexer?: string;
  description: string;
};

type MailstoreServer = {
  name?: string;
  a?: Array<{ n?: string; _content?: string }>;
};

export const getServerVolumeSummaryAdvanced = async (
  allServersList: Array<MailstoreServer>,
): Promise<Array<ServerVolumeSummaryItem>> => {
  const res: { Body?: { response?: { content?: string } } } = await fetchSoap('zextras', {
    _jsns: ZIMBRA_ADMIN_URN,
    module: 'ZxPowerstore',
    action: 'getAllVolumes',
    targetServers: 'all_servers',
  });

  const powerStoreData: unknown = await getSoapFetchRequest(
    '/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore',
  );

  const powerStoreServers = (
    (powerStoreData as { servers?: Array<Record<string, unknown>> })?.servers ?? []
  ).map((s) => Object.values(s)[0]) as Array<Record<string, unknown>>;

  const responseData = res?.Body?.response?.content
    ? JSON.parse(res.Body.response.content)
    : null;

  if (!responseData?.ok || allServersList.length === 0) {
    return [];
  }

  return allServersList.map((item) => {
    let primaries = '';
    let secondaries = '';
    let indexes = '';
    let description = '';
    let indexer = '';
    let hsmScheduled = '';

    const findPowerStoreServer = powerStoreServers.find(
      (s) => (s as { name?: string }).name === item?.name,
    );
    if (findPowerStoreServer) {
      indexer = (
        findPowerStoreServer as {
          ZxPowerstore?: { services?: Record<string, string> };
        }
      ).ZxPowerstore?.services?.[INDEXER_MANAGER_KEY] ?? '';
      hsmScheduled = (
        (findPowerStoreServer as {
          ZxPowerstore?: {
            attributes?: { powerstoreMoveScheduler?: { value?: Record<string, string> } };
          };
        }).ZxPowerstore?.attributes?.powerstoreMoveScheduler?.value ?? {}
      )[HSM_SCHEDULED_KEY];
    }

    if (responseData?.response && item.name && responseData.response[item.name]) {
      const data = responseData.response[item.name]?.response;
      if (data) {
        primaries = data.primaries.length;
        secondaries = data.secondaries.length;
        indexes = data.indexes.length;
        const descriptionData = item?.a?.filter((items) => items?.n === DESCRIPTION);
        if (descriptionData && descriptionData.length > 0) {
          description = descriptionData[0]?._content || '';
        }
      }
    }

    return { name: item.name ?? '', primaries, secondaries, indexes, hsmScheduled, indexer, description };
  });
};

export const getServerVolumeSummaryCE = (
  allServersList: Array<MailstoreServer>,
): Array<{ name: string; description: string }> => {
  if (allServersList.length === 0) return [];

  return allServersList.map((item) => {
    let description = '';
    const descriptionData = item?.a?.filter((items) => items?.n === DESCRIPTION);
    if (descriptionData && descriptionData.length > 0) {
      description = descriptionData[0]?._content || '';
    }
    return { name: item.name ?? '', description };
  });
};
