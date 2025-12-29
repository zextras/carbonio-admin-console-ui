/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType } from 'react';
import { APP_REGISTRY } from 'virtual:app-registry';

import { useAppStore } from '../store/app';
import type { AppManifest } from './types';

export type AppEntry = {
  manifest: (typeof APP_REGISTRY)[number];
  Component: ComponentType;
};

// Store app context by package name for addRoute to use
// This persists after module loading since useEffect runs later
const appContextMap = new Map<string, AppManifest>();

export const getAppContext = (packageName: string): AppManifest | undefined =>
  appContextMap.get(packageName);

/**
 * Load all registered apps via dynamic import
 * Each app becomes a separate lazy-loaded chunk
 */
export async function loadAllApps(): Promise<void> {
  const loadPromises = APP_REGISTRY.map(async (manifest) => {
    try {
      // Store app context before import (available for addRoute when useEffect runs)
      appContextMap.set(manifest.packageName, manifest);

      const module = await import(manifest.entryPoint);
      const Component = module.default as ComponentType;

      useAppStore.setState((state) => ({
        entryPoints: {
          ...state.entryPoints,
          [manifest.name]: Component,
        },
      }));
      // eslint-disable-next-line no-console
      console.info(
        `%c loaded ${manifest.name}`,
        'color: white; background: #539507;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%',
      );
    } catch (error) {
      console.error(`Failed to load app ${manifest.name}:`, error);
    }
  });

  await Promise.all(loadPromises);
}
