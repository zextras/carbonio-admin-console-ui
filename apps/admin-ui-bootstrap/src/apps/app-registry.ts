/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import Backup from '@zextras/admin-ui-backup';
import Cos from '@zextras/admin-ui-cos';
import Dashboard from '@zextras/admin-ui-dashboard';
import Domains from '@zextras/admin-ui-domains';
import Legalhold from '@zextras/admin-ui-legalhold';
import Mta from '@zextras/admin-ui-mta';
import Notifications from '@zextras/admin-ui-notifications';
import Operations from '@zextras/admin-ui-operations';
import Privacy from '@zextras/admin-ui-privacy';
import Storage from '@zextras/admin-ui-storage';
import Subscription from '@zextras/admin-ui-subscription';
import type { AppState } from '@zextras/ui-shared';
import { registerApp } from '@zextras/ui-shared';
import { ComponentType } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

import type { AppManifest } from './types';

/**
 * App registry - statically defined from app-manifest.json
 * These are the apps that will be loaded by the shell.
 */
export const APP_REGISTRY: ReadonlyArray<AppManifest> = [
  {
    name: 'carbonio-admin-ui-dashboard',
    packageName: '@zextras/admin-ui-dashboard',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/index.ts',
  },
  {
    name: 'carbonio-admin-ui-domains',
    packageName: '@zextras/admin-ui-domains',
    displayName: 'Manage',
    priority: 99,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-backup',
    packageName: '@zextras/admin-ui-backup',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-cos',
    packageName: '@zextras/admin-ui-cos',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-legalhold',
    packageName: '@zextras/admin-ui-legalhold',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-mta',
    packageName: '@zextras/admin-ui-mta',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-notifications',
    packageName: '@zextras/admin-ui-notifications',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-operations',
    packageName: '@zextras/admin-ui-operations',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-subscription',
    packageName: '@zextras/admin-ui-subscription',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-privacy',
    packageName: '@zextras/admin-ui-privacy',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
  {
    name: 'carbonio-admin-ui-storage',
    packageName: '@zextras/admin-ui-storage',
    displayName: 'Manage',
    priority: 3,
    icon: 'List',
    entryPoint: 'src/app.tsx',
  },
];

/**
 * Static module map - all apps are imported at build time.
 * No runtime dynamic imports - everything is bundled together.
 */
const appModules: Record<string, ComponentType<object>> = {
  '@zextras/admin-ui-dashboard': Dashboard,
  '@zextras/admin-ui-domains': Domains,
  '@zextras/admin-ui-backup': Backup,
  '@zextras/admin-ui-cos': Cos,
  '@zextras/admin-ui-legalhold': Legalhold,
  '@zextras/admin-ui-mta': Mta,
  '@zextras/admin-ui-notifications': Notifications,
  '@zextras/admin-ui-operations': Operations,
  '@zextras/admin-ui-subscription': Subscription,
  '@zextras/admin-ui-privacy': Privacy,
  '@zextras/admin-ui-storage': Storage,
};

/**
 * Load all apps from the registry and register them in the store.
 * All apps are statically imported and bundled at build time - no async loading.
 */
export function loadAllAppsFromRegistry(
  useAppStore: UseBoundStore<StoreApi<AppState>>,
): void {
  // Initialize app state
  const appsObject = APP_REGISTRY.reduce<Record<string, object>>(
    (acc, app) => ({
      ...acc,
      [app.name]: {
        description: '',
        name: app.name,
        priority: app.priority,
        type: 'carbonioAdmin',
        icon: app.icon,
        display: app.displayName,
        js_entrypoint: app.entryPoint,
      },
    }),
    {},
  );

  const appContextsObject = APP_REGISTRY.reduce<Record<string, object>>(
    (acc, app) => ({ ...acc, [app.name]: {} }),
    {},
  );

  useAppStore.setState(
    () =>
      ({
        apps: { ...appsObject },
        appContexts: { ...appContextsObject },
      } as Partial<AppState>),
  );

  // Register all apps synchronously - no runtime loading
  APP_REGISTRY.forEach((app) => {
    const Component = appModules[app.packageName];
    if (!Component) {
      console.error(`No module found for ${app.packageName}`);
      return;
    }

    useAppStore.setState((state) => ({
      entryPoints: {
        ...state.entryPoints,
        [app.name]: Component,
      },
    }));

    registerApp(
      app.packageName,
      APP_REGISTRY.find((a) => a.packageName === app.packageName) as AppManifest,
    );

    // eslint-disable-next-line no-console
    console.info(
      `%c loaded ${app.name}`,
      'color: white; background: #539507;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%',
    );
  });
}
