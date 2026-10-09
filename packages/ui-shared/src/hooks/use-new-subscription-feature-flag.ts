/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLoginConfigStore } from '../store/login/store';

export function useNewSubscriptionFeatureFlag(): boolean {
  return useLoginConfigStore(
    (state) => state.featureFlags?.enforceSubscriptionRequirements ?? false,
  );
}
