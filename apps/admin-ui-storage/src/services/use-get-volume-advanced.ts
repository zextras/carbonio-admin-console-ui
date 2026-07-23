/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQuery } from '@tanstack/react-query';

import type { Volume } from '../../types';
import { ZIMBRA_ADMIN_URN } from '../constants';
import { fetchSoap } from './s3-connector-service';
import { s3ConnectorVolumeQueryKeys } from './s3-connector-volume-query-keys';

type SoapContentResponse = {
  Body?: {
    response?: {
      content?: string;
    };
  };
};

type AdvancedServerResponse = {
  ok?: boolean;
  response?: unknown;
  error?: { message?: string } | string;
};

type AdvancedGetVolumeContent = {
  ok?: boolean;
  response?: Record<string, AdvancedServerResponse>;
  error?: { message?: string } | string;
};

function getErrorMessage(error: AdvancedGetVolumeContent['error']): string {
  if (typeof error === 'string' && error.length > 0) return error;
  if (typeof error === 'object' && error?.message) return error.message;
  return 'Failed to fetch advanced volume details';
}

function extractVolumeResponse(payload: unknown): Volume | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const candidate = payload as {
    volume?: Volume | Array<Volume>;
    volumes?: Array<Volume>;
  };

  if (Array.isArray(candidate.volume)) {
    return candidate.volume[0];
  }

  if (candidate.volume && typeof candidate.volume === 'object') {
    return candidate.volume as Volume;
  }

  if (Array.isArray(candidate.volumes)) {
    return candidate.volumes[0];
  }

  return payload as Volume;
}

export const useGetVolumeAdvanced = (
  volumeName: string,
  serverName: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.getAdvancedVolume(serverName, volumeName),
    queryFn: async (): Promise<Volume | undefined> => {
      const res = (await fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'getVolume',
        targetServers: serverName,
        volumeName,
      })) as SoapContentResponse;

      const content = res?.Body?.response?.content;
      if (!content) {
        throw new Error('Missing SOAP response content');
      }

      const parsed = JSON.parse(content) as AdvancedGetVolumeContent;
      if (!parsed?.ok) {
        throw new Error(getErrorMessage(parsed?.error));
      }

      const serverResponse = parsed.response?.[serverName] ?? Object.values(parsed.response ?? {})[0];

      if (!serverResponse?.ok) {
        throw new Error(getErrorMessage(serverResponse?.error));
      }

      return extractVolumeResponse(serverResponse.response);
    },
    enabled,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
