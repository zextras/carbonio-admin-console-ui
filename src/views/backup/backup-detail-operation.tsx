/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect } from 'react';
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
import { dumpGlobalConfig } from '../../services/dump-global-config';
import { useBackupStore } from '../../store/backup/store';

const BackupDetailOperation: FC = () => {
	const { operation }: { operation: string } = useParams();
	const setGlobalConfig = useBackupStore((state) => state.setGlobalConfig);

	const getGlobalConfig = useCallback((): void => {
		const serverName = window.location.hostname;
		dumpGlobalConfig(serverName)
			.then((response: any) => response.json())
			.then((data: any) => {
				if (data?.Body?.response?.content) {
					const parseData = JSON.parse(data.Body.response.content);
					if (parseData?.response?.[serverName]?.response) {
						setGlobalConfig(parseData?.response?.[serverName]?.response);
					}
				}
			});
	}, [setGlobalConfig]);

	useEffect(() => {
		getGlobalConfig();
	}, [getGlobalConfig]);

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
