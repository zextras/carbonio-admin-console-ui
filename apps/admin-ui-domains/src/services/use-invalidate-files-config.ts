/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useQueryClient } from '@tanstack/react-query';

import { filesConfigQueryKeys } from './files-config-query-keys';
import { FilesConfigScope } from './get-files-config-raw';

export function useInvalidateFilesConfig() {
  const queryClient = useQueryClient();
  return (scope: FilesConfigScope, id: string) => {
    queryClient.invalidateQueries({ queryKey: filesConfigQueryKeys.raw(scope, id) });
    // Account writes change the account's resolved effective value/source, so refresh it too.
    queryClient.invalidateQueries({ queryKey: filesConfigQueryKeys.resolved(id) });
  };
}
