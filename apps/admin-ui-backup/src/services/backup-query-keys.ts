/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const backupQueryKeys = {
  all: ['backup'] as const,
  globalConfig: () => [...backupQueryKeys.all, 'global-config'] as const,
  serverConfig: (serverId?: string) =>
    [...backupQueryKeys.all, 'server-config', serverId ?? 'default'] as const,
  buckets: () => [...backupQueryKeys.all, 'buckets'] as const,
} as const;
