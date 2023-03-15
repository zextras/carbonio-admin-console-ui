/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
	Container,
	Row,
	Text,
	Divider,
	Button,
	Switch,
	Input,
	SnackbarManagerContext,
	Padding
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import ListRow from '../../list/list-row';
import { useServerStore } from '../../../store/server/store';
import { setCoreAttributes } from '../../../services/set-core-attributes';
import { SERVER } from '../../../constants';
import { checkLdap } from '../../../services/check-ldap';
import { RouteLeavingGuard } from '../../ui-extras/nav-guard';

const ServerAdvanced: FC = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const allServers = useServerStore((state) => state.serverList);
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [ldapDumpEnabled, setLdapDumpEnabled] = useState<boolean>(false);
	const [serverConfiguration, setServerConfiguration] = useState<boolean>(false);
	const [purgeOldConfiguration, setPurgeOldConfiguration] = useState<boolean>(false);
	const [includeIndex, setIncludeIndex] = useState<boolean>(false);
	const [backupLatencyLowThreshold, setBackupLatencyLowThreshold] = useState<number>(0);
	const [backupLatencyHighThreshold, setBackupLatencyHighThreshold] = useState<number>(0);
	const [backupMaxWaitTime, setBackupMaxWaitTime] = useState<number>(0);
	const [backupMaxMetaDataSize, setBackupMaxMetaDataSize] = useState<number>(0);
	const [backupOnTheFlyMetadata, setBackupOnTheFlyMetadata] = useState<boolean>(false);
	const [backupMaxOperationPerAccount, setBackupMaxOperationPerAccount] = useState<number>(0);
	const [backupCompressionLevel, setBackupCompressionLevel] = useState<number>(0);
	const [backupNumberThreadsForItems, setBackupNumberThreadsForItems] = useState<number>(0);
	const [backupNumberThreadsForAccounts, setBackupNumberThreadsForAccounts] = useState<number>(0);
	const [currentBackupValue, setCurrentBackupValue] = useState<any>({});
	const [scheduledMetadataArchivingEnabled, setScheduledMetadataArchivingEnabled] =
		useState<boolean>(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	useEffect(() => {
		if (allServers && allServers.length > 0) {
			const selectedServer = allServers.find((serverItem: any) => serverItem?.name === server);
			if (selectedServer && selectedServer?.id) {
				const currentBackupObject: any = {};
				getSoapFetchRequest(
					`/service/extension/zextras_admin/core/getServer/${selectedServer?.id}?module=zxbackup`
				)
					.then((data: any) => {
						const attributes = data?.attributes;
						if (data && data?.attributes) {
							if (attributes?.ldapDumpEnabled) {
								const value = attributes?.ldapDumpEnabled?.value;
								if (value) {
									setLdapDumpEnabled(value);
									currentBackupObject.ldapDumpEnabled = true;
								} else {
									setLdapDumpEnabled(false);
									currentBackupObject.ldapDumpEnabled = false;
								}
							}

							if (attributes?.backupLatencyLowThreshold) {
								const value = attributes?.backupLatencyLowThreshold?.value;
								if (value) {
									setBackupLatencyLowThreshold(value);
									currentBackupObject.backupLatencyLowThreshold = value;
								} else {
									setBackupLatencyLowThreshold(value);
									currentBackupObject.backupLatencyLowThreshold = 0;
								}
							}

							if (attributes?.backupLatencyHighThreshold) {
								const value = attributes?.backupLatencyHighThreshold?.value;
								if (value) {
									setBackupLatencyHighThreshold(value);
									currentBackupObject.backupLatencyHighThreshold = value;
								} else {
									currentBackupObject.backupLatencyHighThreshold = 0;
								}
							}

							if (attributes?.ZxBackup_MaxWaitingTime) {
								const value = attributes?.ZxBackup_MaxWaitingTime?.value;
								if (value) {
									setBackupMaxWaitTime(value);
									currentBackupObject.backupMaxWaitTime = value;
								} else {
									currentBackupObject.backupMaxWaitTime = 0;
								}
							}

							if (attributes?.ZxBackup_MaxMetadataSize) {
								const value = attributes?.ZxBackup_MaxMetadataSize?.value;
								if (value) {
									setBackupMaxMetaDataSize(value);
									currentBackupObject.backupMaxMetaDataSize = value;
								} else {
									currentBackupObject.backupMaxMetaDataSize = 0;
								}
							}

							if (attributes?.backupOnTheFlyMetadata) {
								const value = attributes?.backupOnTheFlyMetadata?.value;
								if (value) {
									setBackupOnTheFlyMetadata(value);
									currentBackupObject.backupOnTheFlyMetadata = true;
								} else {
									setBackupOnTheFlyMetadata(false);
									currentBackupObject.backupOnTheFlyMetadata = false;
								}
							}

							if (attributes?.scheduledMetadataArchivingEnabled) {
								const value = attributes?.scheduledMetadataArchivingEnabled?.value;
								if (value) {
									setScheduledMetadataArchivingEnabled(value);
									currentBackupObject.scheduledMetadataArchivingEnabled = true;
								} else {
									setScheduledMetadataArchivingEnabled(false);
									currentBackupObject.scheduledMetadataArchivingEnabled = false;
								}
							}

							if (attributes?.ZxBackup_MaxOperationPerAccount) {
								const value = attributes?.ZxBackup_MaxOperationPerAccount?.value;
								if (value) {
									setBackupMaxOperationPerAccount(value);
									currentBackupObject.backupMaxOperationPerAccount = value;
								} else {
									currentBackupObject.backupMaxOperationPerAccount = 0;
								}
							}

							if (attributes?.backupCompressionLevel) {
								const value = attributes?.backupCompressionLevel?.value;
								if (value) {
									setBackupCompressionLevel(value);
									currentBackupObject.backupCompressionLevel = value;
								} else {
									currentBackupObject.backupCompressionLevel = 0;
								}
							}

							if (attributes?.backupNumberThreadsForItems) {
								const value = attributes?.backupNumberThreadsForItems?.value;
								if (value) {
									setBackupNumberThreadsForItems(value);
									currentBackupObject.backupNumberThreadsForItems = value;
								} else {
									currentBackupObject.backupNumberThreadsForItems = 0;
								}
							}

							if (attributes?.backupNumberThreadsForAccounts) {
								const value = attributes?.backupNumberThreadsForAccounts?.value;
								if (value) {
									setBackupNumberThreadsForAccounts(value);
									currentBackupObject.backupNumberThreadsForAccounts = value;
								} else {
									currentBackupObject.backupNumberThreadsForAccounts = 0;
								}
							}

							if (attributes?.ZxBackup_BackupCustomizations) {
								const value = attributes?.ZxBackup_BackupCustomizations?.value;
								if (value) {
									setServerConfiguration(value);
									currentBackupObject.serverConfiguration = true;
								} else {
									setServerConfiguration(false);
									currentBackupObject.serverConfiguration = false;
								}
							}

							if (attributes?.ZxBackup_PurgeCustomizations) {
								const value = attributes?.ZxBackup_PurgeCustomizations?.value;
								if (value) {
									setPurgeOldConfiguration(value);
									currentBackupObject.purgeOldConfiguration = true;
								} else {
									setPurgeOldConfiguration(false);
									currentBackupObject.purgeOldConfiguration = false;
								}
							}

							if (attributes?.backupSaveIndex) {
								const value = attributes?.backupSaveIndex?.value;
								if (value) {
									setIncludeIndex(value);
									currentBackupObject.includeIndex = true;
								} else {
									setIncludeIndex(false);
									currentBackupObject.includeIndex = false;
								}
							}
						}
						setCurrentBackupValue(currentBackupObject);
						setIsDirty(false);
					})
					.catch((error: any) => {
						setIsDirty(false);
						createSnackbar({
							key: 'error',
							type: 'error',
							label: error?.message
								? error?.message
								: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
					});
			}
		}
	}, [server, allServers, createSnackbar, t]);

	const onCancel = useCallback(() => {
		setLdapDumpEnabled(currentBackupValue.ldapDumpEnabled);
		setBackupLatencyLowThreshold(currentBackupValue.backupLatencyLowThreshold);
		setBackupLatencyHighThreshold(currentBackupValue.backupLatencyHighThreshold);
		setBackupMaxWaitTime(currentBackupValue.backupMaxWaitTime);
		setBackupMaxMetaDataSize(currentBackupValue.backupMaxMetaDataSize);
		setBackupOnTheFlyMetadata(currentBackupValue.backupOnTheFlyMetadata);
		setScheduledMetadataArchivingEnabled(currentBackupValue.scheduledMetadataArchivingEnabled);
		setBackupMaxOperationPerAccount(currentBackupValue.backupMaxOperationPerAccount);
		setBackupCompressionLevel(currentBackupValue.backupCompressionLevel);
		setBackupNumberThreadsForItems(currentBackupValue.backupNumberThreadsForItems);
		setBackupNumberThreadsForAccounts(currentBackupValue.backupNumberThreadsForAccounts);
		setIncludeIndex(currentBackupValue?.includeIndex);
		setPurgeOldConfiguration(currentBackupValue?.purgeOldConfiguration);
		setServerConfiguration(currentBackupValue?.serverConfiguration);
		setIsDirty(false);
	}, [
		currentBackupValue?.ldapDumpEnabled,
		currentBackupValue?.backupLatencyLowThreshold,
		currentBackupValue?.backupLatencyHighThreshold,
		currentBackupValue?.backupMaxWaitTime,
		currentBackupValue?.backupMaxMetaDataSize,
		currentBackupValue?.backupOnTheFlyMetadata,
		currentBackupValue?.scheduledMetadataArchivingEnabled,
		currentBackupValue?.backupMaxOperationPerAccount,
		currentBackupValue?.backupCompressionLevel,
		currentBackupValue?.backupNumberThreadsForItems,
		currentBackupValue?.backupNumberThreadsForAccounts,
		currentBackupValue?.includeIndex,
		currentBackupValue?.purgeOldConfiguration,
		currentBackupValue?.serverConfiguration
	]);

	useEffect(() => {
		if (
			currentBackupValue.ldapDumpEnabled !== undefined &&
			currentBackupValue.ldapDumpEnabled !== ldapDumpEnabled
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.ldapDumpEnabled, ldapDumpEnabled]);

	useEffect(() => {
		if (
			currentBackupValue.backupLatencyLowThreshold !== undefined &&
			currentBackupValue.backupLatencyLowThreshold !== backupLatencyLowThreshold
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupLatencyLowThreshold, backupLatencyLowThreshold]);

	useEffect(() => {
		if (
			currentBackupValue.backupLatencyHighThreshold !== undefined &&
			currentBackupValue.backupLatencyHighThreshold !== backupLatencyHighThreshold
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupLatencyHighThreshold, backupLatencyHighThreshold]);

	useEffect(() => {
		if (
			currentBackupValue.backupMaxWaitTime !== undefined &&
			currentBackupValue.backupMaxWaitTime !== backupMaxWaitTime
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupMaxWaitTime, backupMaxWaitTime]);

	useEffect(() => {
		if (
			currentBackupValue.backupMaxMetaDataSize !== undefined &&
			currentBackupValue.backupMaxMetaDataSize !== backupMaxMetaDataSize
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupMaxMetaDataSize, backupMaxMetaDataSize]);

	useEffect(() => {
		if (
			currentBackupValue.backupOnTheFlyMetadata !== undefined &&
			currentBackupValue.backupOnTheFlyMetadata !== backupOnTheFlyMetadata
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupOnTheFlyMetadata, backupOnTheFlyMetadata]);

	useEffect(() => {
		if (
			currentBackupValue.scheduledMetadataArchivingEnabled !== undefined &&
			currentBackupValue.scheduledMetadataArchivingEnabled !== scheduledMetadataArchivingEnabled
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.scheduledMetadataArchivingEnabled, scheduledMetadataArchivingEnabled]);

	useEffect(() => {
		if (
			currentBackupValue.backupMaxOperationPerAccount !== undefined &&
			currentBackupValue.backupMaxOperationPerAccount !== backupMaxOperationPerAccount
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupMaxOperationPerAccount, backupMaxOperationPerAccount]);

	useEffect(() => {
		if (
			currentBackupValue.backupCompressionLevel !== undefined &&
			currentBackupValue.backupCompressionLevel !== backupCompressionLevel
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupCompressionLevel, backupCompressionLevel]);

	useEffect(() => {
		if (
			currentBackupValue.backupNumberThreadsForItems !== undefined &&
			currentBackupValue.backupNumberThreadsForItems !== backupNumberThreadsForItems
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupNumberThreadsForItems, backupNumberThreadsForItems]);

	useEffect(() => {
		if (
			currentBackupValue.backupNumberThreadsForAccounts !== undefined &&
			currentBackupValue.backupNumberThreadsForAccounts !== backupNumberThreadsForAccounts
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.backupNumberThreadsForAccounts, backupNumberThreadsForAccounts]);

	useEffect(() => {
		if (
			currentBackupValue.includeIndex !== undefined &&
			currentBackupValue.includeIndex !== includeIndex
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.includeIndex, includeIndex]);

	useEffect(() => {
		if (
			currentBackupValue.purgeOldConfiguration !== undefined &&
			currentBackupValue.purgeOldConfiguration !== purgeOldConfiguration
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.purgeOldConfiguration, purgeOldConfiguration]);

	useEffect(() => {
		if (
			currentBackupValue.serverConfiguration !== undefined &&
			currentBackupValue.serverConfiguration !== serverConfiguration
		) {
			setIsDirty(true);
		}
	}, [currentBackupValue.serverConfiguration, serverConfiguration]);

	const onSave = useCallback(() => {
		const body: any = {
			ldapDumpEnabled: {
				value: ldapDumpEnabled,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_BackupCustomizations: {
				value: serverConfiguration,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_PurgeCustomizations: {
				value: purgeOldConfiguration,
				objectName: server,
				configType: SERVER
			},
			backupSaveIndex: {
				value: includeIndex,
				objectName: server,
				configType: SERVER
			},
			backupLatencyHighThreshold: {
				value: backupLatencyHighThreshold,
				objectName: server,
				configType: SERVER
			},
			backupLatencyLowThreshold: {
				value: backupLatencyLowThreshold,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_MaxWaitingTime: {
				value: backupMaxWaitTime,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_MaxMetadataSize: {
				value: backupMaxMetaDataSize,
				objectName: server,
				configType: SERVER
			},
			backupOnTheFlyMetadata: {
				value: backupOnTheFlyMetadata,
				objectName: server,
				configType: SERVER
			},
			scheduledMetadataArchivingEnabled: {
				value: scheduledMetadataArchivingEnabled,
				objectName: server,
				configType: SERVER
			},
			ZxBackup_MaxOperationPerAccount: {
				value: backupMaxOperationPerAccount,
				objectName: server,
				configType: SERVER
			},
			backupCompressionLevel: {
				value: backupCompressionLevel,
				objectName: server,
				configType: SERVER
			},
			backupNumberThreadsForItems: {
				value: backupNumberThreadsForItems,
				objectName: server,
				configType: SERVER
			},
			backupNumberThreadsForAccounts: {
				value: backupNumberThreadsForAccounts,
				objectName: server,
				configType: SERVER
			}
		};
		setIsRequestInProgress(true);
		setCoreAttributes(body)
			.then((data: any) => {
				setIsRequestInProgress(false);
				if (data?.errors && Array.isArray(data?.errors)) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: data?.errors[0]?.error
							? data?.errors[0]?.error
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					setCurrentBackupValue((prev: any) => ({
						...prev,
						ldapDumpEnabled,
						backupLatencyLowThreshold,
						backupLatencyHighThreshold,
						backupMaxWaitTime,
						backupMaxMetaDataSize,
						backupOnTheFlyMetadata,
						scheduledMetadataArchivingEnabled,
						backupMaxOperationPerAccount,
						backupCompressionLevel,
						backupNumberThreadsForItems,
						backupNumberThreadsForAccounts,
						serverConfiguration,
						purgeOldConfiguration,
						includeIndex
					}));
					setIsDirty(false);
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t(
							'label.the_last_changes_has_been_saved_successfully',
							'Changes have been saved successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			.catch((error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		ldapDumpEnabled,
		createSnackbar,
		t,
		server,
		backupLatencyLowThreshold,
		backupLatencyHighThreshold,
		backupMaxMetaDataSize,
		backupOnTheFlyMetadata,
		scheduledMetadataArchivingEnabled,
		backupMaxOperationPerAccount,
		backupCompressionLevel,
		backupNumberThreadsForItems,
		backupNumberThreadsForAccounts,
		serverConfiguration,
		purgeOldConfiguration,
		includeIndex,
		backupMaxWaitTime
	]);

	const checkLdapStatus = useCallback(() => {
		setIsRequestInProgress(true);
		checkLdap()
			.then((data: any) => {
				setIsRequestInProgress(false);
				if (data?.ok && data?.ok === true) {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('backup.ldap_working_properly', 'Ldap working properly'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})
			.catch((error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, t]);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="3.5rem">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('backup.advanced', 'Advanced')}
								</Text>
							</Row>
							<Row
								padding={{ all: 'large' }}
								width="50%"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
								<Padding right="small">
									{isDirty && (
										<Button
											label={t('label.cancel', 'Cancel')}
											color="secondary"
											onClick={onCancel}
											disabled={isRequestInProgress}
										/>
									)}
								</Padding>
								{isDirty && (
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										onClick={onSave}
										disabled={isRequestInProgress}
										loading={isRequestInProgress}
									/>
								)}
							</Row>
						</Row>
					</Container>
					<Divider color="gray2" />
				</Row>

				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-end"
					style={{ overflow: 'auto' }}
					padding={{ all: 'large' }}
					height="calc(100vh - 9.375rem)"
				>
					<ListRow>
						<Container
							padding={{ top: 'large' }}
							mainAlignment="flex-start"
							crossAlignment="flex-start"
						>
							<Switch
								label={t('backup.ldap_dump', 'LDAP Dump')}
								value={ldapDumpEnabled}
								onClick={(): void => setLdapDumpEnabled(!ldapDumpEnabled)}
							/>
						</Container>
						<Container padding={{ top: 'large' }}>
							<Switch
								label={t('backup.include_server_configuration', 'Include server configuration')}
								value={serverConfiguration}
								onClick={(): void => setServerConfiguration(!serverConfiguration)}
							/>
						</Container>
						<Container padding={{ top: 'large' }}>
							<Switch
								label={t('backup.purge_old_configuration', 'Purge old configuration')}
								value={purgeOldConfiguration}
								onClick={(): void => setPurgeOldConfiguration(!purgeOldConfiguration)}
							/>
						</Container>
						<Container padding={{ top: 'large' }}>
							<Switch
								label={t('backup.include_index', 'Include index')}
								value={includeIndex}
								onClick={(): void => setIncludeIndex(!includeIndex)}
							/>
						</Container>
					</ListRow>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ top: 'large' }}
							style={{ display: 'block' }}
						>
							<Button
								type="outlined"
								label={t('backup.check_ldap', 'Check ldap')}
								color="primary"
								icon="ActivityOutline"
								iconPlacement="right"
								onClick={checkLdapStatus}
								disabled={isRequestInProgress}
								loading={isRequestInProgress}
								style={{ width: '100%' }}
								width="100%"
								size="large"
							/>
						</Container>
					</ListRow>

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge' }}
						height="fit"
					>
						<Text size="medium" weight="bold">
							{t('backup.tuning_options', 'Tuning Options')}
						</Text>
					</Container>

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large' }}
						height="fit"
					>
						<Text size="medium" weight="bold">
							{t('backup.latency', 'Latency')}
						</Text>
					</Container>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="50%"
						>
							<Input
								label={t('backup.latency_high_threshold_ms', 'Latency High Threshold (ms)')}
								background="gray5"
								value={backupLatencyHighThreshold}
								onChange={(e: any): any => {
									setBackupLatencyHighThreshold(e.target.value);
								}}
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="50%"
						>
							<Input
								label={t('backup.latency_low_threshold_ms', 'Latency Low Threshold (ms)')}
								background="gray5"
								value={backupLatencyLowThreshold}
								onChange={(e: any): any => {
									setBackupLatencyLowThreshold(e.target.value);
								}}
							/>
						</Container>
					</ListRow>

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge' }}
						height="fit"
					>
						<Text size="medium" weight="bold">
							{t('backup.waiting_time', 'Waititng Time')}
						</Text>
					</Container>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="100%"
						>
							<Input
								label={t('backup.max_waiting_time_ms', 'Max Waiting Time (ms)')}
								background="gray5"
								borderColor="gray3"
								value={backupMaxWaitTime}
								onChange={(e: any): any => {
									setBackupMaxWaitTime(e.target.value);
								}}
							/>
						</Container>
					</ListRow>

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge' }}
						height="fit"
					>
						<Text size="medium" weight="bold">
							{t('backup.metadata', 'Metadata')}
						</Text>
					</Container>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="100%"
						>
							<Input
								label={t('backup.maximum_metadata_size_mb', 'Maximum Metadata Size (MB)')}
								background="gray5"
								value={backupMaxMetaDataSize}
								onChange={(e: any): any => {
									setBackupMaxMetaDataSize(e.target.value);
								}}
							/>
						</Container>
					</ListRow>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="100%"
						>
							<Switch
								label={t('backup.on_the_fly_metadata', 'On the fly metadata')}
								value={backupOnTheFlyMetadata}
								onClick={(): void => setBackupOnTheFlyMetadata(!backupOnTheFlyMetadata)}
							/>
						</Container>
					</ListRow>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="100%"
						>
							<Switch
								label={t('backup.metadata_archiving', 'Metadata archiving')}
								value={scheduledMetadataArchivingEnabled}
								onClick={(): void =>
									setScheduledMetadataArchivingEnabled(!scheduledMetadataArchivingEnabled)
								}
							/>
						</Container>
					</ListRow>

					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'extralarge' }}
						height="fit"
					>
						<Text size="medium" weight="bold">
							{t('backup.other_controls', 'Other Controls')}
						</Text>
					</Container>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="500%"
						>
							<Input
								label={t('backup.maximum_operation_per_account', 'Maximum Operation per Account')}
								background="gray5"
								value={backupMaxOperationPerAccount}
								onChange={(e: any): any => {
									setBackupMaxOperationPerAccount(e.target.value);
								}}
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="500%"
						>
							<Input
								label={t('backup.compression_level', 'Compression Level')}
								background="gray5"
								value={backupCompressionLevel}
								onChange={(e: any): any => {
									setBackupCompressionLevel(e.target.value);
								}}
							/>
						</Container>
					</ListRow>

					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="500%"
						>
							<Input
								label={t('backup.thread_number_for_items', 'Thread number for items')}
								background="gray5"
								value={backupNumberThreadsForItems}
								onChange={(e: any): any => {
									setBackupNumberThreadsForItems(e.target.value);
								}}
							/>
						</Container>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'large' }}
							width="500%"
						>
							<Input
								label={t('backup.thread_number_for_accounts', 'Thread number for accounts')}
								background="gray5"
								value={backupNumberThreadsForAccounts}
								onChange={(e: any): any => {
									setBackupNumberThreadsForAccounts(e.target.value);
								}}
							/>
						</Container>
					</ListRow>
				</Container>
			</Container>
			<RouteLeavingGuard when={isDirty} onSave={onSave}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</Container>
	);
};
export default ServerAdvanced;
