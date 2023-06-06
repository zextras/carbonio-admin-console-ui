/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Dropdown, Row, Input, Icon } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import ListPanelItem from '../list/list-panel-item';
import {
	ADVANCED,
	ADVANCED_LBL,
	BACKUP_ROUTE_ID,
	CONFIGURATION_BACKUP,
	LIST_SERVER,
	SERVER,
	SERVERS_LIST,
	SERVER_CONFIG
} from '../../constants';
import ListItems from '../list/list-items';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';
import { useBucketServersListStore } from '../../store/bucket-server-list/store';
import { useModuleLicenseStore } from '../../store/module-license/store';
import { useRightsStore } from '../../store/rights/store';
import { getRights } from '../utility/utils';

const BackupListPanel: FC = () => {
	const [t] = useTranslation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [selectedOperationItem, setSelectedOperationItem] = useState(SERVER_CONFIG);
	const [isDefaultSettingsExpanded, setIsDefaultSettingsExpanded] = useState(true);
	const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState<boolean>(true);
	const serverList = useBucketServersListStore((state) => state.volumeList || []);
	const [selectedServer, setSelectedServer] = useState<string>('');
	const [isServerSelect, setIsServerSelect] = useState<boolean>(false);
	const [searchServer, setSearchServer] = useState<string>('');
	const [serverNames, setServerNames] = useState<any>();
	const [isBackupModuleLicensed, setIsBackupModuleLicensed] = useState<boolean>(false);
	const moduleLicense = useModuleLicenseStore((state) => state.moduleLicense);
	const rights = useRightsStore((state) => state.rights);
	const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${BACKUP_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	useEffect(() => {
		if (moduleLicense && moduleLicense.length > 0) {
			const backupModule = moduleLicense.filter(
				(item: Record<string, string | number | boolean>) => item?.name === 'Backup'
			);
			if (backupModule && backupModule[0] && backupModule[0]?.licensed) {
				setIsBackupModuleLicensed(true);
			}
		}
	}, [moduleLicense]);

	const defaultSettingsOptions = useMemo(
		() => [
			{
				id: SERVER_CONFIG,
				name: t('label.server_config', 'Server Config'),
				isSelected: !!isBackupModuleLicensed
			},
			{
				id: ADVANCED,
				name: t('label.advanced', 'Advanced'),
				isSelected: !!isBackupModuleLicensed
			},
			{
				id: SERVERS_LIST,
				name: t('label.servers_list', 'Servers List'),
				isSelected: !!isBackupModuleLicensed
			}
		],
		[t, isBackupModuleLicensed]
	);

	const [defaultOptions, setDefaultOptions] =
		useState<Array<Record<string, unknown>>>(defaultSettingsOptions);

	useEffect(() => {
		if (!hasListServerRights) {
			setDefaultOptions(
				defaultSettingsOptions.filter((item: Record<string, unknown>) => item?.id !== SERVERS_LIST)
			);
		} else {
			setDefaultOptions(defaultSettingsOptions);
		}
	}, [hasListServerRights, defaultSettingsOptions]);

	const serverSettingsOptions = useMemo(
		() => [
			{
				id: CONFIGURATION_BACKUP,
				name: t('label.configuration_lbl', 'Configuration'),
				isSelected: isBackupModuleLicensed ? isServerSelect : false
			},
			{
				id: ADVANCED_LBL,
				name: t('label.advanced', 'Advanced'),
				isSelected: isBackupModuleLicensed ? isServerSelect : false
			}
		],
		[t, isServerSelect, isBackupModuleLicensed]
	);

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
		if (selectedOperationItem === CONFIGURATION_BACKUP || selectedOperationItem === ADVANCED_LBL) {
			replaceHistory(`/${selectedServer}/${selectedOperationItem}`);
		} else {
			replaceHistory(`/${selectedOperationItem}`);
		}
	}, [globalCarbonioSendAnalytics, matomo, selectedOperationItem, selectedServer]);

	const toggleDefaultSettingsView = (): void => {
		setIsDefaultSettingsExpanded(!isDefaultSettingsExpanded);
	};

	const toggleServerSpecific = (): void => {
		setIsServerSpecificsExpanded(!isServerSpecificsExpanded);
	};

	useEffect(() => {
		if (selectedServer !== '') {
			setIsServerSelect(true);
		}
	}, [selectedServer]);

	const addServerToList = useCallback((list: any) => {
		const data = list.map((serverItem: any) => ({
			id: serverItem?.id,
			label: serverItem?.name,
			customComponent: (
				<Row
					top="0.56rem"
					right="large"
					bottom="0.56rem"
					left="large"
					style={{
						display: 'block',
						textAlign: 'left',
						height: 'inherit',
						padding: '0.18rem',
						width: 'inherit'
					}}
					onClick={(): void => {
						setSelectedServer(serverItem?.name);
						setSearchServer(serverItem?.name);
						setSelectedOperationItem(CONFIGURATION_BACKUP);
					}}
				>
					{serverItem?.name}
				</Row>
			)
		}));
		setServerNames(data);
	}, []);

	useEffect(() => {
		const filterList = serverList.filter((item: any) => item.name.includes(searchServer));
		addServerToList(filterList);
	}, [searchServer, addServerToList, serverList]);

	useEffect(() => {
		if (rights && rights.length > 0) {
			const right = getRights(rights, SERVER);
			if (right.length > 0) {
				const findServerRight = right.find(
					(item: Record<string, string>) => item?.n && item?.n === LIST_SERVER
				);
				if (findServerRight) {
					sethasListServerRights(true);
				}
			}
		}
	}, [rights]);

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			background="gray5"
			style={{ overflow: 'auto', borderTop: '1px solid #FFFFFF' }}
		>
			<ListPanelItem
				title={t('label.global_server_settings', 'Global Server Settings')}
				isListExpanded={isDefaultSettingsExpanded}
				setToggleView={toggleDefaultSettingsView}
			/>
			{isDefaultSettingsExpanded && (
				<ListItems
					items={defaultOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}

			{hasListServerRights && (
				<Container mainAlignment="flex-start">
					<ListPanelItem
						title={t('label.server_specifics', 'Server Specifics')}
						isListExpanded={isServerSpecificsExpanded}
						setToggleView={toggleServerSpecific}
					/>
					{isServerSpecificsExpanded && (
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Dropdown
								items={isBackupModuleLicensed ? serverNames : []}
								placement="bottom-start"
								maxWidth="18.75rem"
								disableAutoFocus
								width="16.56rem"
								style={{
									width: '100%'
								}}
							>
								<Input
									label={t('label.select_a_server', 'Select a Server')}
									value={searchServer}
									CustomIcon={(): any => (
										<Icon icon="HardDriveOutline" size="large" color="primary" />
									)}
									backgroundColor="gray5"
									onChange={(e: any): any => {
										setSearchServer(e.target.value);
									}}
									disabled={!isBackupModuleLicensed}
								/>
							</Dropdown>
						</Row>
					)}

					{isServerSpecificsExpanded && (
						<ListItems
							items={serverSettingsOptions}
							selectedOperationItem={selectedOperationItem}
							setSelectedOperationItem={setSelectedOperationItem}
						/>
					)}
				</Container>
			)}
		</Container>
	);
};
export default BackupListPanel;
