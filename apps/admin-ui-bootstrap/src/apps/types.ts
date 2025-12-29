/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type AppManifest = {
  /** The unique name from carbonio.name (e.g., "carbonio-admin-ui-dashboard") */
  readonly name: string;
  /** The npm package name (e.g., "@zextras/admin-ui-dashboard") */
  readonly packageName: string;
  /** Display name for UI (e.g., "Manage") */
  readonly displayName: string;
  /** Loading priority (lower = loads first) */
  readonly priority: number;
  /** Icon name from carbonio-ui-preview */
  readonly icon: string;
  /** Optional attribute key for feature flags */
  readonly attrKey: string;
  /** Package entryPoint */
  readonly entryPoint: string;
};
