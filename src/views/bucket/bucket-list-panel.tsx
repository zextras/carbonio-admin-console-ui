/* eslint-disable prettier/prettier */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { Container, Icon, Input, Dropdown, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import styled from 'styled-components';
import ListPanelItem from '../list/list-panel-item';
import ListItems from '../list/list-items';
import {
	BUCKET_LIST,
	SERVERS_LIST,
	HSM_SETTINGS,
	DATA_VOLUMES,
	STORAGES_ROUTE_ID
} from '../../constants';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import { useBucketServersListStore } from '../../store/bucket-server-list/store';
import MatomoTracker from '../../matomo-tracker';
import { useGlobalConfigStore } from '../../store/global-config/store';
import { useAuthIsAdvanced } from '../../store/auth-advanced/store';

const SelectItem = styled(Row)``;

const BucketListPanel: FC = () => {
	const [t] = useTranslation();
	const setSelectedServerName = useBucketVolumeStore((state) => state.setSelectedServerName);
	const volumeList = useBucketServersListStore((state) => state.volumeList);
	const matomo = useMemo(() => new MatomoTracker(), []);
	const globalCarbonioSendAnalytics = useGlobalConfigStore(
		(state) => state.globalCarbonioSendAnalytics
	);
	const [isStoreSelect, setIsStoreSelect] = useState(false);
	const [isStoreVolumeSelect, setIsStoreVolumeSelect] = useState(false);
	const [selectedOperationItem, setSelectedOperationItem] = useState('');
	const [isServerListExpand, setIsServerListExpand] = useState(true);
	const [isServerSpecificListExpand, setIsServerSpecificListExpand] = useState(true);
	const [searchVolumeName, setSearchVolumeName] = useState('');
	const [isVolumeListExpand, setIsVolumeListExpand] = useState(false);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [itemsVolume, setItemsVolume] = useState<any>();

	useEffect(() => {
		globalCarbonioSendAnalytics && matomo.trackPageView(`${STORAGES_ROUTE_ID}`);
	}, [globalCarbonioSendAnalytics, matomo]);

	const selectedVolume = useCallback(
		(volume: any) => {
			setIsStoreSelect(true);
			setSelectedServerName(volume?.name);
			setSearchVolumeName(volume?.name);
			setSelectedOperationItem(DATA_VOLUMES);
			setIsStoreVolumeSelect(true);
			setIsVolumeListExpand(false);
		},
		[setSelectedServerName]
	);

	const addServerToList = useCallback((list: any) => {
		const data = list.map((volume: any) => ({
			id: volume.id,
			label: volume.name,
			customComponent: (
				<SelectItem
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
						selectedVolume(volume);
					}}
				>
					{volume?.name}
				</SelectItem>
			)
		}));
		setItemsVolume(data);
	}, [selectedVolume]);

	useEffect(() => {
		const filterList = volumeList.filter((item: any) => item.name.includes(searchVolumeName));
		addServerToList(filterList);
	}, [searchVolumeName, addServerToList, volumeList]);

	const globalServerOption = useMemo(
		() => [
			{
				id: SERVERS_LIST,
				name: t('label.servers_list', 'Servers List'),
				isSelected: isStoreSelect
			},
			{
				id: BUCKET_LIST,
				name: t('label.bucket_list', 'Bucket List'),
				isSelected: isStoreSelect
			}
		],
		[t, isStoreSelect]
	);

	const globalOptions = useMemo(() => !isAdvanced ? globalServerOption.filter((item: any) => item?.id !== BUCKET_LIST)
		: globalServerOption, [isAdvanced, globalServerOption]);

	const serverSpecificOption = useMemo(
		() => [
			{
				id: DATA_VOLUMES,
				name: t('label.data_volumes', 'Data Volumes'),
				isSelected: isStoreVolumeSelect
			}
			 ,
			{
				id: HSM_SETTINGS,
				name: t('label.hsm_settings', 'HSM Settings'),
				isSelected: isStoreVolumeSelect
			}
		],
		[t, isStoreVolumeSelect]
	);

	const serverOptions = useMemo(() => !isAdvanced ?
		serverSpecificOption.filter((item: any) => item?.id !== HSM_SETTINGS)
	: serverSpecificOption , [isAdvanced, serverSpecificOption]);

	useEffect(() => {
		setIsStoreSelect(true);
	}, []);

	useEffect(() => {
		setSelectedOperationItem(SERVERS_LIST);
	}, []);

	useEffect(() => {
		if (isStoreSelect) {
			if (selectedOperationItem) {
				if (selectedOperationItem === DATA_VOLUMES || selectedOperationItem === HSM_SETTINGS) {
					globalCarbonioSendAnalytics &&
						matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
					replaceHistory(`${searchVolumeName}/${selectedOperationItem}`);
				} else {
					replaceHistory(`/${selectedOperationItem}`);
					globalCarbonioSendAnalytics &&
						matomo.trackEvent('trackViewPage', `${selectedOperationItem}`);
				}
			} else {
				replaceHistory(`/${selectedOperationItem}`);
			}
		}
	}, [isStoreSelect, selectedOperationItem, searchVolumeName, matomo, globalCarbonioSendAnalytics]);

	const toggleServer = (): void => {
		setIsServerListExpand(!isServerListExpand);
	};
	const toggleServerSpecific = (): void => {
		setIsServerSpecificListExpand(!isServerSpecificListExpand);
	};

	return (
		<Container
			orientation="column"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			style={{ overflowY: 'auto' }}
			width="100%"
			background="gray5"
		>
			<Container crossAlignment="flex-start" mainAlignment="flex-start">
				<ListPanelItem
					title={t('label.global_servers', 'Global Servers')}
					isListExpanded={isServerListExpand}
					setToggleView={toggleServer}
				/>
				{isServerListExpand && (
					<ListItems
						items={globalOptions}
						selectedOperationItem={selectedOperationItem}
						setSelectedOperationItem={setSelectedOperationItem}
					/>
				)}
				<ListPanelItem
					title={t('label.server_details', 'Server Details')}
					isListExpanded={isServerSpecificListExpand}
					setToggleView={toggleServerSpecific}
				/>
				{isServerSpecificListExpand && (
					<>
						<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
							<Dropdown
								items={itemsVolume}
								placement="bottom-start"
								maxWidth="300px"
								disableAutoFocus
								width="265px"
								style={{
									width: '100%'
								}}
							>
								<Input
									label={t('label.select_a_server', 'Select a Server')}
									CustomIcon={(): any => (
										<Icon
											icon="HardDriveOutline"
											size="large"
											onClick={(): void => {
												setIsVolumeListExpand(!isVolumeListExpand);
											}}
										/>
									)}
									onChange={(ev: any): void => {
										setSearchVolumeName(ev.target.value);
									}}
									value={searchVolumeName}
									backgroundColor="gray5"
								/>
							</Dropdown>
						</Row>
						<ListItems
							items={serverOptions}
							selectedOperationItem={selectedOperationItem}
							setSelectedOperationItem={setSelectedOperationItem}
						/>
					</>
				)}
			</Container>
		</Container>
	);
};
export default BucketListPanel;
