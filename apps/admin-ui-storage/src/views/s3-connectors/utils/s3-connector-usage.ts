/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type S3ConnectorBackupUsageRow = {
  server: string;
};

export type S3ConnectorVolumeUsageRow = {
  server: string;
  volume: string;
};

const UNUSED_VALUES = new Set(['', 'unused', '-', 'none']);

function stripPrefix(value: string, prefix: string): string {
  const normalizedPrefix = `${prefix}:`;
  if (value.toLowerCase().startsWith(normalizedPrefix)) {
    return value.slice(normalizedPrefix.length).trim();
  }

  return value.trim();
}

export function isUsageUnused(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'string') {
    return UNUSED_VALUES.has(value.trim().toLowerCase());
  }

  return false;
}

function parseVolumeUsageItem(item: unknown): S3ConnectorVolumeUsageRow | undefined {
  if (item === null || item === undefined || typeof item !== 'object' || Array.isArray(item)) {
    return undefined;
  }

  const usageObject = item as Record<string, unknown>;
  const directServer = usageObject.server;
  const directVolume = usageObject.volume;

  if (
    (typeof directServer === 'string' || typeof directServer === 'number') &&
    (typeof directVolume === 'string' || typeof directVolume === 'number')
  ) {
    const server = String(directServer).trim();
    const volume = String(directVolume).trim();

    if (server !== '' && volume !== '') {
      return { server, volume };
    }
  }

  const entries = Object.entries(usageObject);

  for (const [rawKey, rawValue] of entries) {
    if (!rawKey.toLowerCase().startsWith('server:')) {
      continue;
    }

    if (typeof rawValue !== 'string' && typeof rawValue !== 'number') {
      continue;
    }

    const server = stripPrefix(rawKey, 'server');
    const volume = stripPrefix(String(rawValue), 'volume');

    if (server !== '' && volume !== '') {
      return { server, volume };
    }
  }

  return undefined;
}

function parseBackupUsageItem(item: unknown): S3ConnectorBackupUsageRow | undefined {
  if (item === null || item === undefined || typeof item !== 'object' || Array.isArray(item)) {
    return undefined;
  }

  const usageObject = item as Record<string, unknown>;
  const serverValue = usageObject.server;

  if (typeof serverValue === 'string' || typeof serverValue === 'number') {
    const server = String(serverValue).trim();

    if (server !== '') {
      return { server };
    }
  }

  return undefined;
}

export function parseBackupUsage(value: unknown): Array<S3ConnectorBackupUsageRow> {
  if (isUsageUnused(value) || !Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseBackupUsageItem)
    .filter((row): row is S3ConnectorBackupUsageRow => row !== undefined);
}

export function parseVolumeUsage(value: unknown): Array<S3ConnectorVolumeUsageRow> {
  if (isUsageUnused(value) || !Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseVolumeUsageItem)
    .filter((row): row is S3ConnectorVolumeUsageRow => row !== undefined);
}
