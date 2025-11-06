/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Container, Text, Button, Modal, Padding, Checkbox } from '@zextras/carbonio-design-system';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RESET_DEVICE, WIPE_DEVICE } from '../../../../constants';

const ActiveDeviceConfirmation: FC<{
	operationType: string;
	setIsShowConfirmBox: any;
	isShowConfirmBox: boolean;
	mobileDeviceDetail: any;
	isOperationRequestInProgress: boolean;
	doDeviceOperation: any;
	setWipeDeviceConfirmation: any;
}> = ({
	operationType,
	setIsShowConfirmBox,
	isShowConfirmBox,
	mobileDeviceDetail,
	isOperationRequestInProgress,
	doDeviceOperation,
	setWipeDeviceConfirmation
}) => {
	const [t] = useTranslation();
	const [title, setTitle] = useState<string>('title');
	const [isRequstInProgress, setIsRequstInProgress] = useState<boolean>(false);
	const [yesOperationTitle, setYesOperationTitle] = useState<string>('operation');
	const [noOperationTitle, setNoOperationTitle] = useState<string>('operation');
	const [awareResetSetting, setAwareResetSetting] = useState<boolean>(false);

	useEffect(() => {
		if (operationType === WIPE_DEVICE) {
			setTitle(t('label.you_are_trying_wipe_device', 'You are trying to wipe a device'));
			setYesOperationTitle(t('label.yes_wipe_the_device', 'Yes, wipe the device'));
			setNoOperationTitle(t('label.no_donot_wipe_device', 'No, don`t wipe'));
		} else if (operationType === RESET_DEVICE) {
			setTitle(t('label.you_are_trying_reset_device', 'You are trying to reset a device'));
			setYesOperationTitle(t('label.yes_reset_the_device', 'Yes, reset the device'));
			setNoOperationTitle(t('label.no_donot_reset_device', 'No, don`t reset'));
		}
	}, [operationType, t]);

	return (
		<Modal
			title={title}
			open={isShowConfirmBox}
			showCloseIcon
			onClose={(): void => {
				setIsShowConfirmBox(false);
			}}
			size="medium"
			customFooter={
				<Container orientation="horizontal" mainAlignment="space-between">
					<Button
						label={t('label.help', 'Help')}
						type="outlined"
						color="primary"
						onClick={(): void => {
							setIsShowConfirmBox(false);
						}}
					/>
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Padding all="small">
							<Button
								label={yesOperationTitle}
								color="error"
								loading={isOperationRequestInProgress}
								disabled={isOperationRequestInProgress}
								type="outlined"
								onClick={(): void => {
									doDeviceOperation();
								}}
							/>
						</Padding>
						<Button
							label={noOperationTitle}
							color="primary"
							onClick={(): void => {
								setIsShowConfirmBox(false);
							}}
						/>
					</Container>
				</Container>
			}
		>
			<Padding all="medium">
				<Text overflow="break-word" weight="regular">
					{operationType === WIPE_DEVICE &&
						t(
							'label.wiping_device_warning_msg_1',
							'Wiping a device will restore it to the factory settings. Are you sure you want to continue?'
						)}
					{operationType === RESET_DEVICE &&
						t(
							'label.rest_device_warning_msg_1',
							'Wiping a device will restore it to the factory settings. Are you sure you want to continue? '
						)}
				</Text>
			</Padding>
			<Padding all="medium">
				<Text overflow="break-word" weight="regular">
					{t('label.account', 'Account')}: {mobileDeviceDetail?.accountEmail}
				</Text>
			</Padding>
			<Padding left="medium" bottom="medium">
				<Text overflow="break-word" weight="regular">
					{t('label.device_id', 'Device ID')}: {mobileDeviceDetail?.deviceId}
				</Text>
			</Padding>
			{operationType === WIPE_DEVICE && (
				<Padding top="medium" left="medium" bottom="large">
					<Checkbox
						iconColor="primary"
						size="small"
						label={t(
							'label.aware_of_doing_device_factory_settings',
							'I am aware of what I’m doing, I want to reset it to the factory settings '
						)}
						value={awareResetSetting}
						onClick={(): void => {
							setAwareResetSetting(!awareResetSetting);
							setWipeDeviceConfirmation(!awareResetSetting);
						}}
					/>
				</Padding>
			)}
		</Modal>
	);
};

export default ActiveDeviceConfirmation;
