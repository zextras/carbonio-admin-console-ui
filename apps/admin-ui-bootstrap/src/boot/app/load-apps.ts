/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { filter } from 'lodash-es';

import { getUserSetting } from '../../react-query/use-account';
import { useAppStore } from '../../store/app';
import { useI18nStore } from '../../store/i18n/store';

/**
 * Load apps with feature flag support
 * Filters apps based on attrKey (feature flags) and adds i18n resources
 * Note: Apps are already loaded via loadAllApps() in init.ts, this handles i18n only
 */
export function loadApps(): void {
  const appsToLoad = filter(Object.values(useAppStore.getState().apps), (app) => {
    return !(app.attrKey && getUserSetting('attrs', app.attrKey) !== 'TRUE');
  });

  const { locale, addI18n } = useI18nStore.getState();
  addI18n(appsToLoad, locale);
}

export function unloadAllApps(): Promise<void> {
  // No longer needed - apps are bundled, not dynamically loaded
  return Promise.resolve();
}
