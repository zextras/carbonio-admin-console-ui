/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
	ADVANCED,
	ADVANCED_LBL,
	CONFIGURATION_BACKUP,
	IMPORT_EXTERNAL_BACKUP,
	SERVERS_LIST,
	SERVER_CONFIG
} from '../../constants';
import ImportExternalBackup from './actions/import-external-backup';
import BackupAdvanced from './default-setting/backup-advanced';
import BackupServerConfig from './default-setting/backup-server-config';
import ServersList from './default-setting/backup-servers-list';

import { useBackupStore } from '../../store/backup/store';
import ServerAdvanced from './server-advanced/server-advanced';
import BackupConfiguration from './configuration/backup-configuration';

const BackupDetailOperation: FC = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const setBackupSelectedServer = useBackupStore((state) => state.setSelectedBackupServer);

	useEffect(() => {
		if (server) {
			setBackupSelectedServer(server);
		}
	}, [server, setBackupSelectedServer]);

	return (
		<>
			{((): any => {
				switch (operation) {
					case SERVER_CONFIG:
						return <BackupServerConfig />;
					case ADVANCED:
						return <BackupAdvanced />;
					case SERVERS_LIST:
						return <ServersList />;
					case IMPORT_EXTERNAL_BACKUP:
						return <ImportExternalBackup />;
					case CONFIGURATION_BACKUP:
						return <BackupConfiguration />;
					case ADVANCED_LBL:
						return <ServerAdvanced />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default BackupDetailOperation;
