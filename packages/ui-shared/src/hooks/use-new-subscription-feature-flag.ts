/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useEffect } from 'react';

import { useLocalStorage } from './use-local-storage';

export const NEW_SUBSCRIPTION_FEATURE_FLAG_KEY = 'new_subscription_feature_flag';

export function useNewSubscriptionFeatureFlag(): boolean {
  const [featureFlag, setFeatureFlag] = useLocalStorage<boolean | null>(
    NEW_SUBSCRIPTION_FEATURE_FLAG_KEY,
    null,
  );

  useEffect(() => {
    if (featureFlag === null) setFeatureFlag(false);
  }, [featureFlag, setFeatureFlag]);

  return featureFlag ?? false;
}
