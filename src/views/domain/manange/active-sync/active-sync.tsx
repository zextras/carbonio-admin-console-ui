/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Button,
	Input,
	Padding,
	Table,
	Icon,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import { cloneDeep, debounce, filter } from 'lodash';
import gardian from '../../../../assets/gardian.svg';
import { getAllDevices } from '../../../../services/get-all-devices';
import ActiveDeviceDetail from './active-device-detail';
import { ZX_MOBILE } from '../../../../constants';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

type MobileDevice = {
	accountEmail: string;
	accountName: string;
	accountServer: string;
	deviceId: string;
	deviceType: string;
	firstSeen: number;
	hasMobilePassword: boolean;
	isOnline: boolean;
	lastCommandReceived: number;
	lastPingTimeoutSecs: number;
	lastSeen: number;
	protocolVersion: string;
	provisionable: boolean;
	status: number;
	userAgent: string;
};

const ActiveSync: FC = () => {
	const [t] = useTranslation();
	const [offset, setOffset] = useState<number>(0);
	const [allMobileDevices, setAllMobileDevices] = useState<Array<MobileDevice>>([]);
	const [allDeviceRow, setAllDeviceRow] = useState<Array<any>>([]);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isShowDeviceDetail, setIsShowDeviceDetail] = useState<boolean>(false);
	const [selectedMobileDevice, setSelectedMobileDevice] = useState<Array<any>>([]);
	const [selectedMobileDeviceDetail, setSelectedMobileDeviceDetail] = useState<any>();
	const [refreshDeviceList, setRefreshDeviceList] = useState<boolean>(false);
	const [searchString, setSearchString] = useState<string>('');
	const [backupAllDevice, setBackupAllDevice] = useState<Array<MobileDevice>>([]);

	const headers: any[] = useMemo(
		() => [
			{
				id: 'name',
				label: t('label.device', 'Device'),
				width: '10%',
				bold: true
			},
			{
				id: 'device_id',
				label: t('label.device_id', 'Device ID'),
				width: '15%',
				bold: true
			},
			{
				id: 'account',
				label: t('label.account', 'Account'),
				width: '15%',
				bold: true
			},
			{
				id: 'last_seen',
				label: t('label.last_seen', 'Last seen'),
				width: '20%',
				bold: true
			},
			{
				id: 'eas',
				label: t('label.eas', 'EAS'),
				width: '15%',
				bold: true
			},
			{
				id: 'status',
				label: t('label.status', 'Status'),
				width: '15%',
				bold: true
			}
		],
		[t]
	);

	const getAllDeviceList = useCallback(() => {
		getAllDevices(ZX_MOBILE)
			.then((res: any) => {
				if (res?.Body?.response?.content) {
					const content = JSON.parse(res?.Body?.response?.content);
					if (content?.response) {
						const contentDevice: any = content?.response;
						const keys = Object.keys(contentDevice);
						if (keys.length > 0) {
							const allDevices: Array<MobileDevice> = [];
							keys.forEach((item: string) => {
								const mobileData = contentDevice[item];
								if (mobileData?.response?.devices) {
									const devices = mobileData?.response?.devices;
									if (devices && devices.length > 0) {
										devices.forEach((deviceItem: MobileDevice) => {
											allDevices.push(deviceItem);
										});
									}
								}
							});
							if (allDevices.length > 0) {
								setAllMobileDevices(allDevices);
								setBackupAllDevice(allDevices);
							}
						}
					}
				}
			})
			.catch((error: any) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error
						? error?.error
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [t, createSnackbar]);

	useEffect(() => {
		getAllDeviceList();
	}, [getAllDeviceList]);

	useEffect(() => {
		if (refreshDeviceList) {
			setRefreshDeviceList(false);
			setIsShowDeviceDetail(false);
			setSelectedMobileDevice([]);
			getAllDeviceList();
		}
	}, [refreshDeviceList, getAllDeviceList, selectedMobileDevice]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchQuery = useCallback(
		debounce((searchText, data: Array<MobileDevice>) => {
			setSelectedMobileDevice([]);
			if (searchText) {
				const filterDevice = data.filter(
					(item: MobileDevice) =>
						item?.accountName.toLowerCase().includes(searchText.toLowerCase()) ||
						item?.status.toString().toLowerCase().includes(searchText.toLowerCase()) ||
						item?.deviceType.toLowerCase().includes(searchText.toLowerCase())
				);
				setAllMobileDevices(filterDevice);
			} else {
				setAllMobileDevices(data);
			}
		}, 700),
		[debounce]
	);

	useEffect(() => {
		searchQuery(searchString, backupAllDevice);
	}, [searchString, searchQuery, backupAllDevice]);

	useMemo(() => {
		setAllDeviceRow([]);
		if (allMobileDevices.length > 0) {
			const allRows = allMobileDevices.map((item: MobileDevice) => ({
				id: item?.firstSeen,
				columns: [
					<Text
						size="medium"
						weight="light"
						color="gray0"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
							setSelectedMobileDevice([item?.firstSeen]);
						}}
					>
						{item?.accountName}
					</Text>,
					<Text
						size="medium"
						weight="light"
						color="gray0"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
							setSelectedMobileDevice([item?.firstSeen]);
						}}
					>
						{item?.deviceId}
					</Text>,
					<Text
						size="medium"
						weight="light"
						color="gray0"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
							setSelectedMobileDevice([item?.firstSeen]);
						}}
					>
						{item?.accountEmail}
					</Text>,
					<Text
						size="medium"
						weight="light"
						color="gray0"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
							setSelectedMobileDevice([item?.firstSeen]);
						}}
					>
						{moment(item?.lastSeen).format('YY/MM/DD | hh:mm:ss a')}
					</Text>,
					<Text
						size="medium"
						weight="light"
						color="gray0"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
							setSelectedMobileDevice([item?.firstSeen]);
						}}
					>
						{''}
					</Text>,
					<Text
						size="medium"
						weight="light"
						color="gray0"
						key={item}
						onClick={(event: { stopPropagation: () => void }): void => {
							event.stopPropagation();
							setSelectedMobileDevice([item?.firstSeen]);
						}}
					>
						{item?.status === 1 ? t('label.enabled', 'Enabled') : t('label.disabled', 'Disabled')}
					</Text>
				]
			}));
			setAllDeviceRow(allRows);
		} else {
			setAllDeviceRow([]);
		}
	}, [allMobileDevices, t]);

	useEffect(() => {
		if (selectedMobileDevice.length > 0) {
			const mobileDevice = allMobileDevices.find(
				(item: MobileDevice) => item?.firstSeen === selectedMobileDevice[0]
			);
			if (mobileDevice) {
				setRefreshDeviceList(false);
				setSelectedMobileDeviceDetail(mobileDevice);
				setIsShowDeviceDetail(true);
			}
		}
	}, [selectedMobileDevice, allMobileDevices]);

	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="56px">
						<Row orientation="horizontal" width="100%">
							<Row
								padding={{ all: 'large' }}
								mainAlignment="flex-start"
								width="50%"
								crossAlignment="flex-start"
							>
								<Text size="medium" weight="bold" color="gray0">
									{t('label.active_sync', 'ActiveSync')}
								</Text>
							</Row>
							<Row
								padding={{ all: 'large' }}
								width="50%"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
							>
								<Button
									type="outlined"
									label={t('label.bulk_actions', 'Bulk Actions')}
									icon="ArrowIosDownward"
									iconPlacement="right"
									color="primary"
									disabled
									height={36}
								/>
							</Row>
						</Row>
					</Container>
					<Divider color="gray2" />
				</Row>
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="calc(100% - 70px)"
					style={{ overflow: 'auto' }}
					padding={{ all: 'large' }}
				>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%" wrap="nowrap">
						<Container width="88%" crossAlignment="flex-start" mainAlignment="flex-start">
							<Input
								label={t(
									'label.filter_by_device_type_account',
									'Filter by device type, account, status'
								)}
								background="gray5"
								onChange={(e: any): any => {
									setSearchString(e.target.value);
								}}
								CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="primary" />}
							/>
						</Container>
						<Container width="12%" crossAlignment="flex-end" mainAlignment="flex-end">
							<Padding left="medium">
								<Button
									type="outlined"
									label={t('label.remove', 'Remove')}
									color="error"
									disabled
									size="extralarge"
								/>
							</Padding>
						</Container>
					</Row>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						wrap="nowrap"
						padding={{ top: 'large' }}
					>
						<Table
							rows={allDeviceRow}
							headers={headers}
							showCheckbox={false}
							multiSelect={false}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Row>
					{allDeviceRow.length === 0 && (
						<Container orientation="column" crossAlignment="center" mainAlignment="center">
							<Row>
								<img src={gardian} alt="logo" />
							</Row>
							<Row
								padding={{ top: 'extralarge' }}
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
							>
								<Text weight="light" color="#828282" size="large" overflow="break-word">
									{t('label.this_list_is_empty', 'This list is empty.')}
								</Text>
							</Row>
							<Row
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
								padding={{ top: 'small' }}
								width="53%"
							>
								<Text weight="light" color="#828282" size="large" overflow="break-word">
									<Trans
										i18nKey="label.do_you_need_more_information"
										defaults="Do you need more information?"
									/>
								</Text>
							</Row>
							<Row
								orientation="vertical"
								crossAlignment="center"
								style={{ textAlign: 'center' }}
								padding={{ top: 'small', bottom: 'small' }}
								width="53%"
							>
								<Text weight="light" color="primary">
									{t('label.click_here', 'Click here')}
								</Text>
							</Row>
						</Container>
					)}
				</Container>
			</Container>
			{isShowDeviceDetail && (
				<ActiveDeviceDetail
					setIsShowDeviceDetail={setIsShowDeviceDetail}
					selectedMobileDeviceDetail={selectedMobileDeviceDetail}
					setRefreshDeviceList={setRefreshDeviceList}
				/>
			)}
		</Container>
	);
};
export default ActiveSync;
