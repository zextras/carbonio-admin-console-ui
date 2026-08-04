/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import type { ComponentType } from 'react';

import {
	ADVANCED,
	ADVANCED_LBL,
	CONFIGURATION_BACKUP,
	IMPORT_EXTERNAL_BACKUP,
	SERVER_CONFIG,
	SERVERS_LIST,
} from '../../constants';
import ImportExternalBackup from './actions/import-external-backup';
import BackupConfiguration from './configuration/backup-configuration';
import BackupAdvanced from './default-setting/backup-advanced';
import BackupServerConfig from './default-setting/backup-server-config';
import ServersList from './default-setting/backup-servers-list';
import ServerAdvanced from './server-advanced/server-advanced';

export type SectionRoute = {
	id: string;
	prefix?: string;
	labelKey: string;
	labelDefault: string;
	Component: ComponentType;
};

export const SECTION_ROUTES: Array<SectionRoute> = [
	{
		id: SERVERS_LIST,
		labelKey: 'label.servers_list',
		labelDefault: 'Servers List',
		Component: ServersList,
	},
	{
		id: SERVER_CONFIG,
		labelKey: 'label.server_config',
		labelDefault: 'Server Config',
		Component: BackupServerConfig,
	},
	{
		id: ADVANCED,
		labelKey: 'label.advanced',
		labelDefault: 'Advanced',
		Component: BackupAdvanced,
	},
	{
		id: IMPORT_EXTERNAL_BACKUP,
		labelKey: 'label.import_an_external_backup',
		labelDefault: 'Import External Backup',
		Component: ImportExternalBackup,
	},
	{
		id: CONFIGURATION_BACKUP,
		prefix: ':server',
		labelKey: 'label.configuration_lbl',
		labelDefault: 'Configuration',
		Component: BackupConfiguration,
	},
	{
		id: ADVANCED_LBL,
		prefix: ':server',
		labelKey: 'label.advanced',
		labelDefault: 'Advanced',
		Component: ServerAdvanced,
	},
];
