/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import { Container, Row, Input, Switch, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { VolumeContext } from './volume-context';

const MailstoresConfig: FC = () => {
	const context = useContext(VolumeContext);
	const { t } = useTranslation();
	const { volumeDetail, setVolumeDetail } = context;

	const changeVolDetail = useCallback(
		(e) => {
			setVolumeDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setVolumeDetail]
	);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setVolumeDetail((prev: any) => ({ ...prev, [key]: !volumeDetail[key] }));
		},
		[volumeDetail, setVolumeDetail]
	);

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				{/* <Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_available_space', 'Available Space')}
						backgroundColor="gray5"
						value="98847126.224"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_min_threshold', 'Min Threshold')}
						backgroundColor="gray5"
						value="--"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_max_quota_allowed', 'Max Quota Allowed')}
						backgroundColor="gray5"
						value="1"
						readOnly
					/>
				</Row> */}
				<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
					<Switch
						value={volumeDetail?.isCompression}
						label={t('label.enable_compression', 'Enable Compression')}
						onClick={(): any => changeSwitchOption('isCompression')}
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
					<Text color="secondary">
						Enabling this option will disable the current active volume.
					</Text>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="compressionThreshold"
						label={t('label.volume_compression_thresold', 'Compression Threshold')}
						backgroundColor="gray5"
						value={volumeDetail?.compressionThreshold}
						onChange={changeVolDetail}
					/>
				</Row>
			</Container>
		</>
	);
};

export default MailstoresConfig;
