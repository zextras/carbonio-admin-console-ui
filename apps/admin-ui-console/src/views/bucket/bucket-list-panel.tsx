/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useGlobalConfigStore, replaceHistory, useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { useBucketServersListStore } from '@zextras/admin-ui-bootstrap';
import { Container, Row, Text, Padding } from '@zextras/carbonio-design-system';
import React, { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import {
	BUCKET_LIST,
	SERVERS_LIST,
	HSM_SETTINGS,
	DATA_VOLUMES,
	IS_SERVER_LIST_EXPANDED,
	IS_SERVER_SPECIFIC_LIST_EXPANDED
} from '../../constants';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import DropDownInput from '../components/dropDownInput';
import ListItems from '../list/list-items';
import ListPanelItem from '../list/list-panel-item';

const SelectItem = styled(Row)``;

const BucketListPanel: FC = () => {
	const [t] = useTranslation();
	const setSelectedServerName = useBucketVolumeStore((state) => state.setSelectedServerName);
	const volumeList = useBucketServersListStore((state) => state.volumeList);
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
	const isAdvanced = useIsAdvanced();
	const [itemsVolume, setItemsVolume] = useState<any>();
	const [isShowError, setIsShowError] = useState(false);

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

	const addServerToList = useCallback(
		(list: any) => {
			const data = list.map((volume: any) => ({
				id: volume.id,
				label: volume.name,
				customComponent: (
					<SelectItem
						style={{
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
		},
		[selectedVolume]
	);

	useEffect(() => {
		const filterList = volumeList.filter((item: any) => item.name.includes(searchVolumeName));
		addServerToList(filterList);
		if (volumeList.length > 0 && filterList.length === 0) {
			setIsShowError(true);
		}
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

	const globalOptions = useMemo(
		() =>
			!isAdvanced
				? globalServerOption.filter((item: any) => item?.id !== BUCKET_LIST)
				: globalServerOption,
		[isAdvanced, globalServerOption]
	);

	const serverSpecificOption = useMemo(
		() => [
			{
				id: DATA_VOLUMES,
				name: t('label.data_volumes', 'Data Volumes'),
				isSelected: isStoreVolumeSelect
			},
			{
				id: HSM_SETTINGS,
				name: t('label.hsm_settings', 'HSM Settings'),
				isSelected: isStoreVolumeSelect
			}
		],
		[t, isStoreVolumeSelect]
	);

	const serverOptions = useMemo(
		() =>
			!isAdvanced
				? serverSpecificOption.filter((item: any) => item?.id !== HSM_SETTINGS)
				: serverSpecificOption,
		[isAdvanced, serverSpecificOption]
	);

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
					replaceHistory(`${searchVolumeName}/${selectedOperationItem}`);
				} else {
					replaceHistory(`/${selectedOperationItem}`);
				}
			} else {
				replaceHistory(`/${selectedOperationItem}`);
			}
		}
	}, [isStoreSelect, selectedOperationItem, searchVolumeName, globalCarbonioSendAnalytics]);

	const toggleServer = (): void => {
		if (isServerListExpand) {
			setIsServerListExpand(false);
			localStorage.setItem(IS_SERVER_LIST_EXPANDED, 'false');
		} else {
			setIsServerListExpand(true);
			localStorage.removeItem(IS_SERVER_LIST_EXPANDED);
		}
	};
	const toggleServerSpecific = (): void => {
		if (isServerSpecificListExpand) {
			setIsServerSpecificListExpand(false);
			localStorage.setItem(IS_SERVER_SPECIFIC_LIST_EXPANDED, 'false');
		} else {
			setIsServerSpecificListExpand(true);
			localStorage.removeItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
		}
		setIsServerSpecificListExpand(!isServerSpecificListExpand);
	};

	const customIconDetail = {
		icon: searchVolumeName === '' ? 'HardDriveOutline' : 'CloseOutline',
		onClick: (): void => {
			setIsVolumeListExpand(!isVolumeListExpand);
			setIsShowError(false);
			if (searchVolumeName !== '') {
				setSearchVolumeName('');
				setIsStoreVolumeSelect(false);
				setSelectedOperationItem(SERVERS_LIST);
			}
		}
	};

	useEffect(() => {
		const storedServerValue = localStorage.getItem(IS_SERVER_LIST_EXPANDED);
		if (storedServerValue === 'false') {
			setIsServerListExpand(false);
		} else {
			setIsServerListExpand(true);
		}
		const storedValue = localStorage.getItem(IS_SERVER_SPECIFIC_LIST_EXPANDED);
		if (storedValue === 'false') {
			setIsServerSpecificListExpand(false);
		} else {
			setIsServerSpecificListExpand(true);
		}
	}, []);

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
						<Row mainAlignment="flex-start" width="100%">
							<DropDownInput
								items={itemsVolume}
								inputLabel={t('label.select_a_server', 'Select a Server')}
								onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
									setIsShowError(false);
									setSearchVolumeName(ev.target.value);
								}}
								hasError={isShowError}
								inputValue={searchVolumeName}
								isCustomIcon
								customIconDetail={customIconDetail}
							/>
						</Row>
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
