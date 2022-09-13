/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext } from 'react';
import { Container, Row, Input, Select, Switch, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { VolumeContext } from './volume-context';
import { volumeTypeList } from '../../../../utility/utils';

const MailstoresVolume: FC = () => {
	const context = useContext(VolumeContext);
	const { t } = useTranslation();
	const { volumeDetail, setVolumeDetail } = context;

	const changeVolDetail = useCallback(
		(e) => {
			setVolumeDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setVolumeDetail]
	);

	const onVolMainChange = (v: any): any => {
		setVolumeDetail((prev: any) => ({ ...prev, volumeMain: v }));
	};

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setVolumeDetail((prev: any) => ({ ...prev, [key]: !volumeDetail[key] }));
		},
		[volumeDetail, setVolumeDetail]
	);

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="volumeName"
						label={t('label.volume_name', 'Volume Name')}
						backgroundColor="gray5"
						value={volumeDetail?.volumeName}
						onChange={changeVolDetail}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Select
						items={volumeTypeList}
						background="gray5"
						label={t('label.volume_main', 'Volume Main')}
						defaultSelection={volumeTypeList.find(
							(item: any) => item.value === volumeDetail?.volumeMain
						)}
						showCheckbox={false}
						onChange={onVolMainChange}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="path"
						label={t('label.volume_path', 'Path')}
						backgroundColor="gray5"
						value={volumeDetail?.path}
						onChange={changeVolDetail}
					/>
				</Row>
				<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
					<Switch
						value={volumeDetail?.isCurrent}
						label={t('label.enable_current', 'Enable as Current')}
						onClick={(): any => changeSwitchOption('isCurrent')}
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
					<Text color="secondary">
						Enabling this option will disable the current active volume.
					</Text>
				</Row>
			</Container>
		</>
	);
};

export default MailstoresVolume;
