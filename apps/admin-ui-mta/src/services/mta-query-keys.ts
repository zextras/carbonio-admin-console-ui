/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export const mtaQueryKeys = {
  all: ['mta'] as const,
  server: (serverName: string, applyConfig?: boolean) =>
    [...mtaQueryKeys.all, 'server', serverName, applyConfig ?? true] as const,
  mailQueueInfo: (serverName: string) =>
    [...mtaQueryKeys.all, 'mail-queue-info', serverName] as const,
  mailQueue: (serverName: string, queueName: string, offset: number, limit: number) =>
    [...mtaQueryKeys.all, 'mail-queue', serverName, queueName, offset, limit] as const,
} as const;
