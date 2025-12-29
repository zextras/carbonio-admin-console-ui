/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { filter } from 'lodash-es';
import { APP_REGISTRY } from 'virtual:app-registry';

import { CarbonioModule } from '../../../types';
import { getUserSetting } from '../../react-query/use-account';
import { useI18nStore } from '../../store/i18n/store';

/**
 * Load apps with feature flag support
 * Filters apps based on attrKey (feature flags) and adds i18n resources
 * Note: Apps are already loaded via loadAllApps() in init.ts, this handles i18n only
 */
export function loadApps(): void {
  const appsToLoad = filter(APP_REGISTRY, (app) => {
    return !(app.attrKey && getUserSetting('attrs', app.attrKey) !== 'TRUE');
  });

  // Convert AppManifest to CarbonioModule format for addI18n
  const carbonioModules: Array<CarbonioModule> = appsToLoad.map(
    (app) =>
      ({
        commit: '', // No longer needed for bundled apps
        description: '',
        js_entrypoint: '', // No longer needed for bundled apps
        name: app.name,
        priority: app.priority,
        type: 'carbonioAdmin',
        attrKey: app.attrKey,
        icon: app.icon,
        display: app.displayName,
      }) as CarbonioModule,
  );

  const { locale, addI18n } = useI18nStore.getState();
  addI18n(carbonioModules, locale);
}

export function unloadAllApps(): Promise<void> {
  // No longer needed - apps are bundled, not dynamically loaded
  return Promise.resolve();
}
