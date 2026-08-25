/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import {
  ACTIVE_SYNC,
  ADDRESS_BOOK,
  ADMINISTRATORS,
  DOMAINS,
  QUARANTINE,
  SETTINGS,
  TWO_FACTOR_AUTHENTICATION,
  WHITELABEL_SETTINGS,
} from '../constants';
import { GlobalActiveSync } from './global/global-active-sync/global-active-sync';
import { GlobalAdministrators } from './global/global-administrators/global-administrators';
import { GlobalDetailPanel } from './global/global-detail-panel/global-detail-panel';
import { GlobalDomainList } from './global/global-domain-list/global-domain-list';
import { GlobalQuarantine } from './global/global-quarantine/global-quarantine';
import { GlobalServices } from './global/global-services/global-services';
import { GlobalTwoFactorAuth } from './global/global-two-factor-auth/global-two-factor-auth';
import { GlobalWhiteLabel } from './global/global-white-label/global-white-label';

export type GlobalSectionRoute = {
  /** Sub-path segment under the global route; empty string for the bare global route. */
  id: string;
  /** i18n key used for the breadcrumb menu label. */
  labelKey: string;
  /** Fallback label when no translation is available. */
  labelDefault: string;
  /** Component rendered for this route. */
  Component: ComponentType;
};

export const GLOBAL_SECTION_ROUTES: Array<GlobalSectionRoute> = [
  {
    id: '',
    labelKey: 'label.global',
    labelDefault: 'Global',
    Component: GlobalDetailPanel,
  },
  {
    id: DOMAINS,
    labelKey: 'label.domains',
    labelDefault: 'Domains',
    Component: GlobalDomainList,
  },
  {
    id: SETTINGS,
    labelKey: 'label.settings',
    labelDefault: 'Settings',
    Component: GlobalDetailPanel,
  },
  {
    id: ADMINISTRATORS,
    labelKey: 'label.administrators',
    labelDefault: 'Administrators',
    Component: GlobalAdministrators,
  },
  {
    id: QUARANTINE,
    labelKey: 'label.quarantine',
    labelDefault: 'Quarantine',
    Component: GlobalQuarantine,
  },
  {
    id: WHITELABEL_SETTINGS,
    labelKey: 'label.whitelabel_settings',
    labelDefault: 'Whitelabel Settings',
    Component: GlobalWhiteLabel,
  },
  {
    id: TWO_FACTOR_AUTHENTICATION,
    labelKey: 'label.two_factor_authentication',
    labelDefault: '2-Factor Authentication',
    Component: GlobalTwoFactorAuth,
  },
  {
    id: ACTIVE_SYNC,
    labelKey: 'label.active_sync',
    labelDefault: 'Active Sync',
    Component: GlobalActiveSync,
  },
  {
    id: ADDRESS_BOOK,
    labelKey: 'label.services',
    labelDefault: 'Services',
    Component: GlobalServices,
  },
];
