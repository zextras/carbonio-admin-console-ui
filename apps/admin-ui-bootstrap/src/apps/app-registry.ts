/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';

import { AppState } from '../../types';
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
 * Static import map - Vite can analyze these literal imports and code-split them.
 * Each app is loaded via dynamic import() but with a literal string path
 * that Vite can statically analyze at build time.
 */
const appImporters: Record<string, () => Promise<{ default: unknown }>> = {
  '@zextras/admin-ui-dashboard': () => import('@zextras/admin-ui-dashboard'),
  '@zextras/admin-ui-domains': () => import('@zextras/admin-ui-domains'),
  '@zextras/admin-ui-backup': () => import('@zextras/admin-ui-backup'),
  '@zextras/admin-ui-cos': () => import('@zextras/admin-ui-cos'),
  '@zextras/admin-ui-legalhold': () => import('@zextras/admin-ui-legalhold'),
  '@zextras/admin-ui-mta': () => import('@zextras/admin-ui-mta'),
  '@zextras/admin-ui-notifications': () => import('@zextras/admin-ui-notifications'),
  '@zextras/admin-ui-operations': () => import('@zextras/admin-ui-operations'),
  '@zextras/admin-ui-subscription': () => import('@zextras/admin-ui-subscription'),
  '@zextras/admin-ui-privacy': () => import('@zextras/admin-ui-privacy'),
  '@zextras/admin-ui-storage': () => import('@zextras/admin-ui-storage'),
};

/**
 * Load all apps from the registry and register them in the store.
 * Uses static imports that Vite code-splits at build time.
 */
export async function loadAllAppsFromRegistry(
  useAppStore: UseBoundStore<StoreApi<AppState>>,
  appContextMap: Map<string, AppManifest | undefined>,
): Promise<void> {
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

  // Load all apps in parallel using static imports
  const loadPromises = APP_REGISTRY.map(async (app) => {
    const importer = appImporters[app.packageName];
    if (!importer) {
      console.error(`No importer found for ${app.packageName}`);
      return;
    }

    try {
      const module = await importer();
      const Component = module.default;

      useAppStore.setState((state) => ({
        entryPoints: {
          ...state.entryPoints,
          [app.name]: Component as ComponentType<unknown>,
        },
      }));

      appContextMap.set(
        app.packageName,
        APP_REGISTRY.find((a) => a.packageName === app.packageName) as AppManifest,
      );

      // eslint-disable-next-line no-console
      console.info(
        `%c loaded ${app.name}`,
        'color: white; background: #539507;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%',
      );
    } catch (error) {
      console.error(`Failed to load app ${app.name}:`, error);
    }
  });

  await Promise.all(loadPromises);
}
