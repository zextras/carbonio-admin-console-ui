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
	SnackbarManagerContext,
	IconButton,
	Select,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import moment from 'moment';
import ListRow from '../../../list/list-row';
import { getMobileDeviceDetail } from '../../../../services/get-mobile-device-detail';
import { RESET_DEVICE, SUSPEND_DEVICE, WIPE_DEVICE, ZX_MOBILE } from '../../../../constants';
import ActiveDeviceConfirmation from './active-device-confirmation';
import { resetDevice } from '../../../../services/reset-device';
import { suspendDevice } from '../../../../services/suspend-device';
import { wipeDevice } from '../../../../services/wipe-device';

type MobileDeviceDetail = {
	accountEmail: string;
	accountName: string;
	accountServer: string;
	deviceId: string;
	deviceType: string;
	firstSeen: number;
	friendlyName: string;
	hasMobilePassword: boolean;
	imei: string;
	isOnline: boolean;
	lastPingTimeout: number;
	lastSeen: number;
	model: string;
	numBadItems: number;
	numContacts: number;
	numEmails: number;
	numEvents: number;
	numRemoteFolders: number;
	numTasks: number;
	os: string;
	osLanguage: string;
	phoneNumber: string;
	protocolVersion: string;
	status: number;
	userAgent: string;
};

const ActiveDeviceDetail: FC<{
	setIsShowDeviceDetail: any;
	selectedMobileDeviceDetail: any;
	setRefreshDeviceList: any;
}> = ({ setIsShowDeviceDetail, selectedMobileDeviceDetail, setRefreshDeviceList }) => {
	const [t] = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [mobileDeviceDetail, setMobileDeviceDetail] = useState<MobileDeviceDetail>();
	const [isShowConfirmBox, setIsShowConfirmBox] = useState<boolean>(false);
	const [operationType, setOperationType] = useState<string>('');
	const [isDetailRequestInProgess, setIsDetailRequestInProgess] = useState<boolean>(false);
	const [isOperationRequestInProgress, setIsOperationRequestInProgress] = useState<boolean>(false);
	const [wipeDeviceConfirmation, setWipeDeviceConfirmation] = useState<boolean>(false);

	const abqStatusOptions: any[] = useMemo(
		() => [
			{
				label: t('label.allowed', 'Allowed'),
				value: 1
			},
			{
				label: t('label.blocked', 'Blocked'),
				value: 2
			},
			{
				label: t('label.quarantined', 'Quarantined'),
				value: 3
			}
		],
		[t]
	);

	const statusOptions: any[] = useMemo(
		() => [
			{
				label: t('label.can_receive', 'Can receive'),
				value: 1
			},
			{
				label: t('label.can_not_receiver', 'Can`t receiver'),
				value: 0
			}
		],
		[t]
	);

	const [abqStatus, setAbqStatus] = useState<any>(abqStatusOptions[0]);
	const [status, setStatus] = useState<any>(statusOptions[0]);

	useEffect(() => {
		if (selectedMobileDeviceDetail) {
			setIsDetailRequestInProgess(true);
			getMobileDeviceDetail(
				ZX_MOBILE,
				selectedMobileDeviceDetail?.accountEmail,
				selectedMobileDeviceDetail?.deviceId,
				selectedMobileDeviceDetail?.accountServer
			)
				.then((res: any) => {
					setIsDetailRequestInProgess(false);
					if (res?.Body?.response?.content) {
						const content: any = JSON.parse(res?.Body?.response?.content);
						const keys = Object.keys(content?.response);
						if (keys && keys.length > 0) {
							const deviceItem = content?.response[keys[0]]?.response;
							if (deviceItem) {
								setMobileDeviceDetail(deviceItem);
							}
						}
					}
				})
				.catch((error: any) => {
					setIsDetailRequestInProgess(false);
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
		}
	}, [selectedMobileDeviceDetail, createSnackbar, t]);

	useEffect(() => {
		if (!!mobileDeviceDetail && mobileDeviceDetail?.status) {
			if (mobileDeviceDetail?.status === 1) {
				setStatus(statusOptions[0]);
			} else {
				setStatus(statusOptions[1]);
			}
		}
	}, [mobileDeviceDetail, statusOptions]);

	const resetUI = useCallback(() => {
		setRefreshDeviceList(true);
	}, [setRefreshDeviceList]);

	const resetDeviceOperation = useCallback(() => {
		resetDevice(
			ZX_MOBILE,
			mobileDeviceDetail?.accountName || '',
			mobileDeviceDetail?.deviceId || ''
		)
			.then((res: any) => {
				setIsOperationRequestInProgress(false);
				setIsShowConfirmBox(false);
				if (res?.Body?.response?.content) {
					const content: any = JSON.parse(res?.Body?.response?.content);
					if (content?.response && content?.ok) {
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t('label.change_save_success_msg', 'The change has been saved successfully'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						resetUI();
					}
				}
			})
			.catch((error: any) => {
				setIsOperationRequestInProgress(false);
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
	}, [mobileDeviceDetail, t, createSnackbar, resetUI]);

	const suspendDeviceOperation = useCallback(() => {
		suspendDevice(
			ZX_MOBILE,
			mobileDeviceDetail?.accountName || '',
			mobileDeviceDetail?.deviceId || ''
		)
			.then((res: any) => {
				setIsOperationRequestInProgress(false);
				setIsShowConfirmBox(false);
				if (res?.Body?.response?.content) {
					const content: any = JSON.parse(res?.Body?.response?.content);
					if (content?.ok) {
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t('label.change_save_success_msg', 'The change has been saved successfully'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						resetUI();
					}
				}
			})
			.catch((error: any) => {
				setIsOperationRequestInProgress(false);
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
	}, [mobileDeviceDetail, t, createSnackbar, resetUI]);

	const wipeDeviceOperation = useCallback(() => {
		wipeDevice(
			ZX_MOBILE,
			mobileDeviceDetail?.accountName || '',
			mobileDeviceDetail?.deviceId || '',
			wipeDeviceConfirmation
		)
			.then((res: any) => {
				setIsOperationRequestInProgress(false);
				setIsShowConfirmBox(false);
				if (res?.Body?.response?.content) {
					const content: any = JSON.parse(res?.Body?.response?.content);
					if (content?.ok) {
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t('label.change_save_success_msg', 'The change has been saved successfully'),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						resetUI();
					}
				}
			})
			.catch((error: any) => {
				setIsOperationRequestInProgress(false);
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
	}, [mobileDeviceDetail, t, createSnackbar, wipeDeviceConfirmation, resetUI]);

	const doDeviceOperation = useCallback(() => {
		setIsOperationRequestInProgress(true);
		if (operationType === RESET_DEVICE) {
			resetDeviceOperation();
		} else if (operationType === SUSPEND_DEVICE) {
			suspendDeviceOperation();
		} else if (operationType === WIPE_DEVICE) {
			wipeDeviceOperation();
		}
	}, [operationType, resetDeviceOperation, suspendDeviceOperation, wipeDeviceOperation]);

	return (
		<Container
			background="gray6"
			mainAlignment="flex-start"
			style={{
				'z-index': '10',
				position: 'absolute',
				top: '2.688rem',
				right: '0',
				bottom: '0',
				left: `${'max(calc(100% - 42.5rem), 0.75rem)'}`,
				transition: 'left 0.2s ease-in-out',
				height: 'auto',
				width: 'auto',
				'max-height': '100%',
				overflow: 'hidden',
				'box-shadow': '-0.375rem 0.25rem 0.313rem 0 rgba(0, 0, 0, 0.1)'
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="3.5rem"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					{selectedMobileDeviceDetail?.accountName}
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setIsShowDeviceDetail(false)}
					/>
				</Row>
			</Row>
			<Divider />
			<ListRow>
				<Container padding={{ top: 'large' }}>
					<Tooltip
						placement="bottom"
						label={t(
							'label.wipe_device_factory_settings',
							'Wipe the device to the factory settings'
						)}
					>
						<Button
							type="outlined"
							key="add-button"
							label={t('label.wipe_device', 'Wipe Device')}
							color="primary"
							icon="SmartphoneOutline"
							height={44}
							width={186}
							iconPlacement="right"
							loading={isDetailRequestInProgess}
							disable={isDetailRequestInProgess}
							onClick={(): void => {
								setOperationType(WIPE_DEVICE);
								setIsShowConfirmBox(true);
							}}
						/>
					</Tooltip>
				</Container>
				<Container padding={{ top: 'large' }}>
					<Tooltip
						placement="bottom"
						label={t('label.logoff_from_every_device', 'Log off from every device')}
					>
						<Button
							type="outlined"
							key="add-button"
							label={t('label.reset_device', 'Reset Device')}
							color="primary"
							icon="HistoryOutline"
							height={44}
							width={186}
							iconPlacement="right"
							onClick={(): void => {
								setOperationType(RESET_DEVICE);
								setIsShowConfirmBox(true);
							}}
							loading={isDetailRequestInProgess}
							disable={isDetailRequestInProgess}
						/>
					</Tooltip>
				</Container>
				<Container padding={{ top: 'large' }}>
					<Tooltip
						placement="top"
						label={t('label.active_sync_active_paused', 'The activesync is active / paused')}
					>
						<Button
							type="outlined"
							key="add-button"
							label={t('label.suspend', 'Suspend')}
							color="primary"
							icon="AlertTriangleOutline"
							height={44}
							width={186}
							iconPlacement="right"
							onClick={(): void => {
								setIsOperationRequestInProgress(true);
								setOperationType(SUSPEND_DEVICE);
								suspendDeviceOperation();
							}}
							loading={isDetailRequestInProgess || isOperationRequestInProgress}
							disable={isDetailRequestInProgess || isOperationRequestInProgress}
						/>
					</Tooltip>
				</Container>
			</ListRow>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" padding={{ all: 'large' }}>
				<ListRow>
					<Row padding={{ top: 'large' }}>
						<Text size="medium" weight="bold" color="gray0">
							{t('label.status_lbl', 'Status')}
						</Text>
					</Row>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Select
							items={abqStatusOptions}
							background="gray5"
							label={t('label.abq_status', 'ABQ Status')}
							showCheckbox={false}
							selection={abqStatus}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Row padding={{ top: 'large' }}>
						<Text size="medium" weight="bold" color="gray0">
							{t('label.account', 'Account')}
						</Text>
					</Row>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('label.server', 'Server')}
							backgroundColor="gray5"
							value={mobileDeviceDetail?.accountServer}
							readOnly
						/>
					</Container>
					<Container padding={{ top: 'large', left: 'extralarge' }}>
						<Input
							label={t('label.e_mail', 'E-mail')}
							backgroundColor="gray5"
							value={mobileDeviceDetail?.accountEmail}
							readOnly
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Select
							items={statusOptions}
							background="gray5"
							label={t('label.status_lbl', 'Status')}
							showCheckbox={false}
							selection={status}
						/>
					</Container>
					<Container padding={{ top: 'large', left: 'extralarge' }}>
						<Input
							label={t('label.mobile_password', 'Mobile Password')}
							backgroundColor="gray5"
							value={
								mobileDeviceDetail?.hasMobilePassword
									? t('label.true', 'True')
									: t('label.false', 'False')
							}
							readOnly
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('label.device_id', 'Device ID')}
							backgroundColor="gray5"
							value={mobileDeviceDetail?.deviceId}
							readOnly
						/>
					</Container>
					<Container padding={{ top: 'large', left: 'extralarge' }}>
						<Input
							label={t('label.device', 'Device')}
							backgroundColor="gray5"
							value={mobileDeviceDetail?.deviceType}
							readOnly
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('label.user_agent', 'User Agent')}
							backgroundColor="gray5"
							value={mobileDeviceDetail?.userAgent}
							readOnly
						/>
					</Container>
					<Container padding={{ top: 'large', left: 'extralarge' }}>
						<Input label={t('label.eas', 'EAS')} backgroundColor="gray5" value={''} readOnly />
					</Container>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('label.registration', 'Registration')}
							backgroundColor="gray5"
							value={''}
							readOnly
						/>
					</Container>
					<Container padding={{ top: 'large', left: 'extralarge' }}>
						<Input
							label={t('label.last_access', 'Last Access')}
							backgroundColor="gray5"
							value={
								mobileDeviceDetail?.lastSeen
									? moment(mobileDeviceDetail?.lastSeen).format('YY/MM/DD | hh:mm:ss a')
									: ''
							}
							readOnly
						/>
					</Container>
				</ListRow>
				{isShowConfirmBox && (
					<ActiveDeviceConfirmation
						operationType={operationType}
						setIsShowConfirmBox={setIsShowConfirmBox}
						isShowConfirmBox={isShowConfirmBox}
						mobileDeviceDetail={mobileDeviceDetail}
						isOperationRequestInProgress={isOperationRequestInProgress}
						doDeviceOperation={doDeviceOperation}
						setWipeDeviceConfirmation={setWipeDeviceConfirmation}
					/>
				)}
			</Container>
		</Container>
	);
};

export default ActiveDeviceDetail;
