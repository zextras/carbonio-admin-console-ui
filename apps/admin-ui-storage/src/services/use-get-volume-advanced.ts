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
  error?: unknown;
};

type AdvancedGetVolumeContent = {
  ok?: boolean;
  response?: Record<string, AdvancedServerResponse>;
  error?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'string' && error.length > 0) return error;
  if (isRecord(error) && typeof error.message === 'string') return error.message;
  return 'Failed to fetch advanced volume details';
}

function parseSoapContent(response: SoapContentResponse): AdvancedGetVolumeContent {
  const content = response?.Body?.response?.content;
  if (!content) {
    throw new Error('Missing SOAP response content');
  }

  const parsed: unknown = JSON.parse(content);
  if (!isRecord(parsed)) {
    throw new Error('Failed to fetch advanced volume details');
  }

  const responseEntries = isRecord(parsed.response)
    ? Object.entries(parsed.response).map(([key, value]) => [key, parseAdvancedServerResponse(value)])
    : [];

  return {
    ok: parsed.ok === true,
    response: Object.fromEntries(responseEntries),
    error: parsed.error,
  };
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function getNumberValue(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function getBooleanValue(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function getBooleanOrNumberValue(value: unknown): boolean | number | undefined {
  return typeof value === 'boolean' || typeof value === 'number' ? value : undefined;
}

function getStringOrNumberValue(value: unknown): string | number | undefined {
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function getBooleanNumberOrStringValue(
  value: unknown,
): boolean | number | string | undefined {
  return typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string'
    ? value
    : undefined;
}

function normalizeVolume(value: unknown): Volume | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const uuid = getStringValue(value.uuid);
  const compressed = getBooleanValue(value.compressed);
  const threshold = getNumberValue(value.threshold);
  const path = getStringValue(value.path);

  return {
    id: getNumberValue(value.id),
    name: getStringValue(value.name),
    rootpath: getStringValue(value.rootpath) ?? path,
    type: getNumberValue(value.type),
    compressBlobs: getStringValue(value.compressBlobs) ?? String(compressed ?? false),
    compressionThreshold: getStringValue(value.compressionThreshold) ?? String(threshold ?? ''),
    mgbits: getNumberValue(value.mgbits),
    mbits: getNumberValue(value.mbits),
    fgbits: getNumberValue(value.fgbits),
    fbits: getNumberValue(value.fbits),
    isCurrent: getBooleanOrNumberValue(value.isCurrent),
    inUse: getBooleanNumberOrStringValue(value.inUse),
    availableSpace: getNumberValue(value.availableSpace),
    bucketConfigurationId: getStringValue(value.bucketConfigurationId) ?? uuid,
    centralized: getBooleanValue(value.centralized),
    compressed,
    uuid,
    tieringSupported: getBooleanValue(value.tieringSupported),
    infrequentAccessThreshold: getStringOrNumberValue(value.infrequentAccessThreshold),
    isDrivePrimary: getBooleanValue(value.isDrivePrimary),
    path,
    storeType: getStringValue(value.storeType),
    threshold,
    totalSpace: getNumberValue(value.totalSpace),
    useInfrequentAccess: getBooleanValue(value.useInfrequentAccess),
    useIntelligentTiering: getBooleanValue(value.useIntelligentTiering),
    volumePrefix: getStringValue(value.volumePrefix),
    volumeType: getStringValue(value.volumeType),
    volumeName: getStringValue(value.volumeName),
    serverName: getStringValue(value.serverName),
  };
}

function parseAdvancedServerResponse(value: unknown): AdvancedServerResponse {
  if (!isRecord(value)) {
    return {};
  }

  return {
    ok: value.ok === true,
    response: value.response,
    error: value.error,
  };
}

function getServerVolumeResponse(
  parsed: AdvancedGetVolumeContent,
  serverName: string,
): AdvancedServerResponse {
  const serverResponse = parsed.response?.[serverName];

  if (!serverResponse) {
    throw new Error('Failed to fetch advanced volume details');
  }

  return serverResponse;
}

function extractVolumeResponse(payload: unknown): Volume | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const nestedVolume = payload.volume;
  if (Array.isArray(nestedVolume)) {
    return normalizeVolume(nestedVolume[0]);
  }

  if (nestedVolume !== undefined) {
    return normalizeVolume(nestedVolume);
  }

  const nestedVolumes = payload.volumes;
  if (Array.isArray(nestedVolumes)) {
    return normalizeVolume(nestedVolumes[0]);
  }

  return normalizeVolume(payload);
}

export const useGetVolumeAdvanced = (
  volumeName: string,
  serverName: string,
  enabled: boolean,
) =>
  useQuery({
    queryKey: s3ConnectorVolumeQueryKeys.getAdvancedVolume(serverName, volumeName),
    queryFn: async (): Promise<Volume | undefined> => {
      const response = (await fetchSoap('zextras', {
        _jsns: ZIMBRA_ADMIN_URN,
        module: 'ZxPowerstore',
        action: 'getVolume',
        targetServers: serverName,
        volumeName,
      })) as SoapContentResponse;

      const parsed = parseSoapContent(response);
      if (!parsed?.ok) {
        throw new Error(getErrorMessage(parsed?.error));
      }

      const serverResponse = getServerVolumeResponse(parsed, serverName);

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
