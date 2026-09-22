/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { FilesConfigScope } from './get-files-config-raw';

export const filesConfigQueryKeys = {
  all: ['files-config'] as const,
  raw: (scope: FilesConfigScope, id: string) =>
    [...filesConfigQueryKeys.all, 'raw', scope, id] as const,
  defaults: () => [...filesConfigQueryKeys.all, 'defaults'] as const,
} as const;
