/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { QueryClient } from '@tanstack/react-query';

const createdQueryClients = new Set<QueryClient>();

export function registerQueryClient(queryClient: QueryClient): void {
  createdQueryClients.add(queryClient);
}

export function clearQueryClients(): void {
  for (const queryClient of createdQueryClients) {
    queryClient.clear();
  }
  createdQueryClients.clear();
}
