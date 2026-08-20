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
import { DomainList } from './domain/domain-list/domain-list';
import GlobalActiveSync from './domain/global/global-active-sync';
import { GlobalAddressBook } from './domain/global/global-address-book';
import { GlobalAdministrators } from './domain/global/global-administrators/global-administrators';
import { GlobalDetailPanel } from './domain/global/global-detail-panel';
import GlobalTheme from './domain/global/global-theme';
import GlobalTwoFactorAuthentcation from './domain/global/global-two-factor-auth';
import QuarantineList from './quarantine/quarantine-list';

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
    Component: DomainList,
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
    Component: QuarantineList,
  },
  {
    id: WHITELABEL_SETTINGS,
    labelKey: 'label.whitelabel_settings',
    labelDefault: 'Whitelabel Settings',
    Component: GlobalTheme,
  },
  {
    id: TWO_FACTOR_AUTHENTICATION,
    labelKey: 'label.two_factor_authentication',
    labelDefault: '2-Factor Authentication',
    Component: GlobalTwoFactorAuthentcation,
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
    Component: GlobalAddressBook,
  },
];
