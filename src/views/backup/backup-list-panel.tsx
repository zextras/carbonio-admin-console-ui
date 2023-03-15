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
	IMPORT_EXTERNAL_BACKUP,
	SERVERS_LIST,
	SERVER_CONFIG
} from '../../constants';
import ListItems from '../list/list-items';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';
import { useBucketServersListStore } from '../../store/bucket-server-list/store';

const BackupListPanel: FC = () => {
	const [t] = useTranslation();
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [selectedOperationItem, setSelectedOperationItem] = useState(SERVER_CONFIG);
	const [isDefaultSettingsExpanded, setIsDefaultSettingsExpanded] = useState(true);
	const [isActionExpanded, setIsActionExpanded] = useState(true);
	const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState<boolean>(true);
	const serverList = useBucketServersListStore((state) => state.volumeList || []);
	const [selectedServer, setSelectedServer] = useState<string>('');
	const [isServerSelect, setIsServerSelect] = useState<boolean>(false);
	const [searchServer, setSearchServer] = useState<string>('');
	const [serverNames, setServerNames] = useState<any>();

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${BACKUP_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const defaultSettingsOptions = useMemo(
		() => [
			{
				id: SERVER_CONFIG,
				name: t('label.server_config', 'Server Config'),
				isSelected: true
			},
			{
				id: ADVANCED,
				name: t('label.advanced', 'Advanced'),
				isSelected: true
			},
			{
				id: SERVERS_LIST,
				name: t('label.servers_list', 'Servers List'),
				isSelected: true
			}
		],
		[t]
	);

	const serverSettingsOptions = useMemo(
		() => [
			{
				id: CONFIGURATION_BACKUP,
				name: t('label.configuration_lbl', 'Configuration'),
				isSelected: isServerSelect
			},
			{
				id: ADVANCED_LBL,
				name: t('label.advanced', 'Advanced'),
				isSelected: isServerSelect
			}
		],
		[t, isServerSelect]
	);

	const actionOptions = useMemo(
		() => [
			{
				id: IMPORT_EXTERNAL_BACKUP,
				name: t('label.import_an_external_backup', 'Import an External Backup'),
				isSelected: true
			}
		],
		[t]
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
	const toggleActionView = (): void => {
		setIsActionExpanded(!isActionExpanded);
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
					top="9px"
					right="large"
					bottom="9px"
					left="large"
					style={{
						fontFamily: 'roboto',
						display: 'block',
						textAlign: 'left',
						height: 'inherit',
						padding: '3px',
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
					items={defaultSettingsOptions}
					selectedOperationItem={selectedOperationItem}
					setSelectedOperationItem={setSelectedOperationItem}
				/>
			)}

			<ListPanelItem
				title={t('label.server_specifics', 'Server Specifics')}
				isListExpanded={isServerSpecificsExpanded}
				setToggleView={toggleServerSpecific}
			/>

			{isServerSpecificsExpanded && (
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Dropdown
						items={serverNames}
						placement="bottom-start"
						maxWidth="300px"
						disableAutoFocus
						width="265px"
						style={{
							width: '100%'
						}}
					>
						<Input
							label={t(
								'label.I_want_to_see_this_server_details',
								'i want to see this server’s details'
							)}
							value={searchServer}
							CustomIcon={(): any => <Icon icon="HardDriveOutline" size="large" />}
							backgroundColor="gray5"
							onChange={(e: any): any => {
								setSearchServer(e.target.value);
							}}
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
	);
};
export default BackupListPanel;
