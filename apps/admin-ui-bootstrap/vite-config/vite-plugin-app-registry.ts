/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Plugin } from 'vite';

import { getWorkspaceRoot } from '../../../scripts/utils';
import type { AppManifest } from '../src/apps/types';

/**
 * Scan apps directory and build app manifests
 */
function scanAppsDir(): Array<AppManifest> {
  const rootDir = getWorkspaceRoot();
  const appsDir = join(rootDir, 'apps');

  const adminUiDirs = readdirSync(appsDir).filter(
    (dir) => dir.startsWith('admin-ui-') && dir !== 'admin-ui-bootstrap',
  );

  return adminUiDirs
    .map((dir): AppManifest | null => {
      const packageJsonPath = join(appsDir, dir, 'package.json');
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const carbonio = packageJson.carbonio;

        if (carbonio && carbonio.type === 'carbonioAdmin') {
          const manifest: AppManifest = {
            name: carbonio.name,
            packageName: packageJson.name,
            displayName: carbonio.display,
            priority: carbonio.priority ?? 99,
            icon: carbonio.icon,
            entryPoint: packageJson.name,
          };
          return manifest;
        }
      } catch {
        // Skip if package.json cannot be read
      }
      return null;
    })
    .filter((app): app is AppManifest => app !== null)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Generate state objects for apps and appContexts
 */
function buildStateObjects(apps: Array<AppManifest>): { apps: string; appContexts: string } {
  const appsObject = apps.reduce(
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
  const appContextsObject = apps.reduce((acc, app) => ({ ...acc, [app.name]: {} }), {});

  return {
    apps: JSON.stringify(appsObject),
    appContexts: JSON.stringify(appContextsObject),
  };
}

/**
 * Generate import statement for an app
 */
function generateImportStatement(app: AppManifest, index: number): string {
  return `    const module${index} = await import('${app.packageName}');`;
}

/**
 * Generate component extraction from module
 */
function generateComponentExtraction(index: number): string {
  return `    const Component = module${index}.default;`;
}

/**
 * Generate store state update for entry point
 */
function generateEntryPointsUpdate(app: AppManifest, index: number): string {
  return `    useAppStore.setState((state) => ({
      entryPoints: {
        ...state.entryPoints,
        ['${app.name}']: module${index}.default
      }
    }));`;
}

/**
 * Generate app context mapping
 */
function generateAppContextMap(app: AppManifest): string {
  return `    appContextMap.set('${app.packageName}', APP_REGISTRY.find((a) => a.packageName === '${app.packageName}'));`;
}

/**
 * Generate success log message
 */
function generateSuccessLog(app: AppManifest): string {
  return `    console.info('%c loaded ${app.name}', 'color: white; background: #539507;padding: 4px 8px 2px 4px; font-family: sans-serif; border-radius: 12px; width: 100%');`;
}

/**
 * Generate error log message
 */
function generateErrorLog(app: AppManifest): string {
  return `    console.error('Failed to load app ${app.name}:', error);`;
}

/**
 * Generate complete try-catch block for an app
 */
function generateAppTryCatchBlock(app: AppManifest, index: number): string {
  return `  try {
${generateImportStatement(app, index)}
${generateComponentExtraction(index)}
${generateEntryPointsUpdate(app, index)}
${generateAppContextMap(app)}
${generateSuccessLog(app)}
  } catch (error) {
${generateErrorLog(app)}
  }`;
}

/**
 * Generate loadAllApps function code
 * @param apps - Array of app manifests
 * @returns Generated function code string
 */
function generateLoadAllAppsCode(apps: Array<AppManifest>): string {
  const { apps: appsStr, appContexts: appContextsStr } = buildStateObjects(apps);
  const stateInitCode = `  useAppStore.setState((state) => ({
    apps: { ...${appsStr} },
    appContexts: { ...${appContextsStr} }
  }));`;

  const lines: Array<string> = [];

  lines.push('export const APP_REGISTRY = ' + JSON.stringify(apps, null, '\t') + ';');
  lines.push('');
  lines.push('export async function loadAllApps(useAppStore, appContextMap) {');
  lines.push(stateInitCode);
  lines.push('');

  apps.forEach((app, index) => {
    const tryCatchBlock = generateAppTryCatchBlock(app, index);
    lines.push(tryCatchBlock);
    if (index < apps.length - 1) {
      lines.push('');
    }
  });

  lines.push('}');

  return lines.join('\n');
}

/**
 * Vite plugin to generate app registry module
 */
export function appRegistryPlugin(): Plugin {
  const virtualModuleId = 'virtual:app-registry';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'app-registry',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const apps = scanAppsDir();
        const functionCode = generateLoadAllAppsCode(apps);

        return `/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * Auto-generated by app-registry Vite plugin
 */

${functionCode}
`;
      }
    },
  };
}
