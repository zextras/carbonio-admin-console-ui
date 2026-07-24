/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import { DATA_VOLUMES, HSM_SETTINGS, S3CONNECTOR_LIST, SERVERS_LIST } from '../constants';
import { VolumesDetailPanel } from './data-volumes/volumes-list';
import { HSMsettingPanel } from './hsm/hsm-setting-panel';
import { S3ConnectorListPanel } from './s3-connectors/s3-connector-list-panel';
import { ServerListPanel } from './servers-list/server-list-panel';

export type SectionRoute = {
  /** Sub-path segment for this route. */
  id: string;
  /** When set (e.g. ':server') the route is nested under this dynamic prefix. */
  prefix?: string;
  /** i18n key used for the sidebar label. */
  labelKey: string;
  /** Fallback label when no translation is available. */
  labelDefault: string;
  /** Component rendered for this route. */
  Component: ComponentType;
};

export const SECTION_ROUTES: Array<SectionRoute> = [
  {
    id: SERVERS_LIST,
    labelKey: 'label.servers_list',
    labelDefault: 'Servers List',
    Component: ServerListPanel,
  },
  {
    id: S3CONNECTOR_LIST,
    labelKey: 'storages.s3Connectors.title',
    labelDefault: 'S3 connectors',
    Component: S3ConnectorListPanel,
  },
  {
    id: DATA_VOLUMES,
    prefix: ':server',
    labelKey: 'label.data_volumes',
    labelDefault: 'Data Volumes',
    Component: VolumesDetailPanel,
  },
  {
    id: HSM_SETTINGS,
    prefix: ':server',
    labelKey: 'label.hsm_settings',
    labelDefault: 'HSM Settings',
    Component: HSMsettingPanel,
  },
];
