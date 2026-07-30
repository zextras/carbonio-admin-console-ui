/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import { ADVANCED, FEATURES, GENERAL_INFORMATION, PREFERENCES, SERVER_POOLS, WSC } from '../../constants';
import { WscCosSettings } from '../../wsc/wsc-cos-settings';
import { CosAdvanced } from './advanced/cos-advanced';
import { CosFeatures } from './cos-features/cos-features';
import { CosServerPools } from './cos-server-pools/cos-server-pools';
import { CosGeneralInformation } from './general-information/cos-general-information';
import { COSPreferences } from './preferences/cos-preferences';

export type SectionRoute = {
  id: string;
  prefix?: string;
  labelKey: string;
  labelDefault: string;
  Component: ComponentType;
};

export const SECTION_ROUTES: Array<SectionRoute> = [
  {
    id: GENERAL_INFORMATION,
    prefix: ':cosId',
    labelKey: 'label.general_information',
    labelDefault: 'General Information',
    Component: CosGeneralInformation,
  },
  {
    id: FEATURES,
    prefix: ':cosId',
    labelKey: 'label.features',
    labelDefault: 'Features',
    Component: CosFeatures,
  },
  {
    id: WSC,
    prefix: ':cosId',
    labelKey: 'label.wsc',
    labelDefault: 'Chat',
    Component: WscCosSettings,
  },
  {
    id: PREFERENCES,
    prefix: ':cosId',
    labelKey: 'label.preferences',
    labelDefault: 'Preferences',
    Component: COSPreferences,
  },
  {
    id: SERVER_POOLS,
    prefix: ':cosId',
    labelKey: 'label.server_pools',
    labelDefault: 'Server Pools',
    Component: CosServerPools,
  },
  {
    id: ADVANCED,
    prefix: ':cosId',
    labelKey: 'label.advanced',
    labelDefault: 'Advanced',
    Component: CosAdvanced,
  },
];
