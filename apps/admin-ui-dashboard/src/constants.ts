/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// Route IDs - canonical single source of truth lives in @zextras/ui-shared.
// Re-exported here (aliased) so consumers keep their existing import names.
export {
  DASHBOARD_ROUTE_ID as DASHBOARD,
  DOMAINS_ROUTE_ID,
  NOTIFICATION_ROUTE_ID,
  STORAGE_ROUTE_ID as STORAGES_ROUTE_ID,
  SUBSCRIPTIONS_ROUTE_ID,
} from '@zextras/ui-shared';

// Section IDs
export const ACCOUNTS = 'accounts';
export const DISTRIBUTION_LIST = 'distribution_list';
export const SERVERS_LIST = 'servers_list';
export const SERVER = 'server';
export const LIST = 'list';

// Values and Flags
export const TRUE = 'TRUE';
export const DESC = 'desc';

// Analytics
export const PRIMARY_BAR_DASHBOARD = 'pb_dashboard';

// API Config
export const LIST_SERVER = 'listServer';
