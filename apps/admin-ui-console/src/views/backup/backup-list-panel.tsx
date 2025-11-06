/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { replaceHistory } from '@zextras/admin-ui-bootstrap';
import { Container, Row, Text, Padding } from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	ADVANCED,
	ADVANCED_LBL,
	BACKUP_BASIC,
	CONFIGURATION_BACKUP,
	IS_DEFAULT_SETTINGS_EXPANDED,
	IS_SERVER_SPECIFICS_EXPANDED,
	LIST_SERVER,
	SERVER,
	SERVERS_LIST,
	SERVER_CONFIG
} from '../../constants';
import { useBucketServersListStore } from '../../store/bucket-server-list/store';
import { useGlobalConfigStore } from '../../store/global-config/store';
import { useModuleLicenseStore } from '../../store/module-license/store';
import { useRightsStore } from '../../store/rights/store';
import DropDownInput from '../components/dropDownInput';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';
import { getRights } from '../utility/utils';

const BackupListPanel: FC = () => {
	const [t] = useTranslation();
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [selectedOperationItem, setSelectedOperationItem] = useState(SERVERS_LIST);
	const [isDefaultSettingsExpanded, setIsDefaultSettingsExpanded] = useState(true);
	const [isServerSpecificsExpanded, setIsServerSpecificsExpanded] = useState<boolean>(true);
	const serverList = useBucketServersListStore((state) => state.volumeList || []);
	const [selectedServer, setSelectedServer] = useState<string>('');
	const [isServerSelect, setIsServerSelect] = useState<boolean>(false);
	const [searchServer, setSearchServer] = useState<string>('');
	const [serverNames, setServerNames] = useState<any>();
	const [isBackupModuleLicensed, setIsBackupModuleLicensed] = useState<boolean>(false);
	const moduleLicenseInfo = useModuleLicenseStore((state) => state.licenseInfo);
	const rights = useRightsStore((state) => state.rights);
	const [hasListServerRights, sethasListServerRights] = useState<boolean>(false);
	const [isShowError, setIsShowError] = useState(false);

	useEffect(() => {
		if (moduleLicenseInfo && moduleLicenseInfo.features.length > 0) {
			const backupModule = moduleLicenseInfo.features.filter(
				(item: Record<string, string | number | boolean>) => item?.name === BACKUP_BASIC
			);
			if (backupModule && backupModule[0] && backupModule[0]?.enabled) {
				setIsBackupModuleLicensed(true);
			}
		}
	}, [moduleLicenseInfo]);

	const defaultSettingsOptions = useMemo(
		() => [
			{
				id: SERVERS_LIST,
				name: t('label.servers_list', 'Servers List'),
				isSelected: !!isBackupModuleLicensed
			},
			{
				id: SERVER_CONFIG,
				name: t('label.server_config', 'Server Config'),
				isSelected: !!isBackupModuleLicensed
			},
			{
				id: ADVANCED,
				name: t('label.advanced', 'Advanced'),
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
		if (selectedOperationItem === CONFIGURATION_BACKUP || selectedOperationItem === ADVANCED_LBL) {
			replaceHistory(`/${selectedServer}/${selectedOperationItem}`);
		} else {
			replaceHistory(`/${selectedOperationItem}`);
		}
	}, [globalCarbonioSendAnalytics, selectedOperationItem, selectedServer]);

	const toggleDefaultSettingsView = (): void => {
		if (isDefaultSettingsExpanded) {
			setIsDefaultSettingsExpanded(false);
			localStorage.setItem(IS_DEFAULT_SETTINGS_EXPANDED, 'false');
		} else {
			setIsDefaultSettingsExpanded(true);
			localStorage.removeItem(IS_DEFAULT_SETTINGS_EXPANDED);
		}
	};

	const toggleServerSpecific = (): void => {
		if (isServerSpecificsExpanded) {
			setIsServerSpecificsExpanded(false);
			localStorage.setItem(IS_SERVER_SPECIFICS_EXPANDED, 'false');
		} else {
			setIsServerSpecificsExpanded(true);
			localStorage.removeItem(IS_SERVER_SPECIFICS_EXPANDED);
		}
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
		if (serverList.length > 0 && filterList.length === 0) {
			setIsShowError(true);
		}
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

	const customIconDetail = {
		icon: searchServer === '' ? 'HardDriveOutline' : 'CloseOutline',
		onClick: (): void => {
			setIsShowError(false);
			if (searchServer !== '') {
				setSearchServer('');
				setIsServerSelect(false);
				setSelectedOperationItem(SERVER_CONFIG);
			}
		}
	};

	useEffect(() => {
		const storedValue = localStorage.getItem(IS_DEFAULT_SETTINGS_EXPANDED);
		if (storedValue === 'false') {
			setIsDefaultSettingsExpanded(false);
		} else {
			setIsDefaultSettingsExpanded(true);
		}
		const storedServerSpecificsValue = localStorage.getItem(IS_SERVER_SPECIFICS_EXPANDED);
		if (storedServerSpecificsValue === 'false') {
			setIsServerSpecificsExpanded(false);
		} else {
			setIsServerSpecificsExpanded(true);
		}
	}, []);

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
						<>
							<Row mainAlignment="flex-start" width="100%">
								<DropDownInput
									items={isBackupModuleLicensed ? serverNames : []}
									maxWidth="18.75rem"
									width="16.56rem"
									inputLabel={t('label.select_a_server', 'Select a Server')}
									onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
										setIsShowError(false);
										setSearchServer(e.target.value);
									}}
									inputValue={searchServer}
									isCustomIcon
									hasError={isShowError}
									inputDisabled={!isBackupModuleLicensed}
									customIconDetail={customIconDetail}
								/>
								{isShowError && (
									<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
										<Padding top="large" left="small">
											<Text size="extrasmall" weight="regular" color="error">
												{t(
													'label.not_found_check_the_text_and_try_again',
													'Not found - check the text and try again'
												)}
											</Text>
										</Padding>
									</Container>
								)}
							</Row>
						</>
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
