/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/**
 * Canonical route IDs for every admin app.
 *
 * These are the *un-prefixed* `route` values passed to `addRoute()` (e.g. the
 * storage app registers `route: STORAGE_ROUTE_ID`). The store prefixes them
 * with their `primarybarSection.id` (e.g. `manage/storage`), but the ID itself
 * is stable and is the key used to look routes up via `getRoutes()` /
 * `buildPath()`.
 *
 * Import from here instead of re-declaring per app, so a single rename cannot
 * silently break cross-app navigation.
 */
export const DASHBOARD_ROUTE_ID = 'dashboard';
export const DOMAINS_ROUTE_ID = 'domains';
export const COS_ROUTE_ID = 'cos';
export const BACKUP_ROUTE_ID = 'backup';
export const LEGAL_HOLD_ROUTE_ID = 'legal_hold';
export const MTA_ROUTE_ID = 'mail_transfer_agent';
export const NOTIFICATION_ROUTE_ID = 'notifications';
export const OPERATIONS_ROUTE_ID = 'operations';
export const PRIVACY_ROUTE_ID = 'privacy';
export const STORAGE_ROUTE_ID = 'storage';
export const SUBSCRIPTIONS_ROUTE_ID = 'subscriptions';
