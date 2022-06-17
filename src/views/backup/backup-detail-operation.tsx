/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import {
	ADVANCED,
	IMPORT_EXTERNAL_BACKUP,
	SERVERS_LIST,
	SERVER_CONFIG,
	SERVICE_STATUS
} from '../../constants';
import ImportExternalBackup from './actions/import-external-backup';
import BackupAdvanced from './default-setting/backup-advanced';
import BackupServiceStatus from './default-setting/backup-service-status';
import BackupServerConfig from './default-setting/backup-server-config';
import ServersList from './server-setting/backup-servers-list';

const BackupDetailOperation: FC = () => {
	const { operation }: { operation: string } = useParams();
	return (
		<>
			{((): any => {
				switch (operation) {
					case SERVICE_STATUS:
						return <BackupServiceStatus />;
					case SERVER_CONFIG:
						return <BackupServerConfig />;
					case ADVANCED:
						return <BackupAdvanced />;
					case SERVERS_LIST:
						return <ServersList />;
					case IMPORT_EXTERNAL_BACKUP:
						return <ImportExternalBackup />;
					default:
						return null;
				}
			})()}
		</>
	);
};
export default BackupDetailOperation;
