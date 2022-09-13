/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';
import {
	Container,
	Row,
	Input,
	Padding,
	Switch,
	Text,
	Select
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { volumeTypeList } from '../../../../utility/utils';
import { VolumeContext } from './volume-context';

const MailstoresCreate: FC<{
	onSelection: any;
	externalData: string;
	setCompleteLoading: any;
}> = ({ onSelection, externalData, setCompleteLoading }) => {
	const context = useContext(VolumeContext);
	const { t } = useTranslation();
	const { volumeDetail, setVolumeDetail } = context;
	const [errName, setErrName] = useState(true);
	const [errPath, setErrPath] = useState(true);
	const [errCompressionThreshold, setErrCompressionThreshold] = useState(true);
	const [toggleIndexer, setToggleIndexer] = useState(false);

	const onVolMainChange = (v: any): void => {
		setVolumeDetail((prev: any) => ({ ...prev, volumeMain: v }));
		onSelection({ volumeMain: v }, true);
		if (v === 10) {
			setToggleIndexer(true);
		} else {
			setToggleIndexer(false);
		}
	};

	const changeVolName = useCallback(
		(e) => {
			setVolumeDetail((prev: object) => ({ ...prev, volumeName: e.target.value }));
			onSelection({ volumeName: e.target.value }, true);
			if (e.target.value !== '') {
				setErrName(true);
			} else {
				setErrName(false);
			}
		},
		[onSelection, setVolumeDetail]
	);
	const changeVolPath = useCallback(
		(e) => {
			setVolumeDetail((prev: object) => ({ ...prev, path: e.target.value }));
			onSelection({ path: e.target.value }, true);
			if (e.target.value !== '') {
				setErrPath(true);
			} else {
				setErrPath(false);
			}
		},
		[onSelection, setVolumeDetail]
	);
	const changeVolCompThresold = useCallback(
		(e) => {
			setVolumeDetail((prev: object) => ({ ...prev, compressionThreshold: e.target.value }));
			onSelection({ compressionThreshold: e.target.value }, true);
			if (e.target.value !== '') {
				setErrCompressionThreshold(true);
			} else {
				setErrCompressionThreshold(false);
			}
		},
		[onSelection, setVolumeDetail]
	);

	const changeSwitchIsCurrent = useCallback((): void => {
		setVolumeDetail((prev: object) => ({ ...prev, isCurrent: !volumeDetail?.isCurrent }));
		onSelection({ isCurrent: !volumeDetail?.isCurrent }, true);
	}, [onSelection, setVolumeDetail, volumeDetail?.isCurrent]);

	const changeSwitchIsCompression = useCallback((): void => {
		setVolumeDetail((prev: object) => ({ ...prev, isCompression: !volumeDetail?.isCompression }));
		onSelection({ isCompression: !volumeDetail?.isCompression }, true);
	}, [onSelection, setVolumeDetail, volumeDetail?.isCompression]);

	useEffect(() => {
		if (
			volumeDetail?.volumeMain &&
			volumeDetail?.volumeName &&
			volumeDetail?.path &&
			(volumeDetail?.compressionThreshold || toggleIndexer)
		) {
			setCompleteLoading(true);
		} else {
			setCompleteLoading(false);
		}
	}, [
		setCompleteLoading,
		toggleIndexer,
		volumeDetail?.compressionThreshold,
		volumeDetail?.path,
		volumeDetail?.volumeMain,
		volumeDetail?.volumeName
	]);

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.volume_server', 'Server')}
						backgroundColor="gray6"
						value={externalData}
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Select
						items={volumeTypeList}
						background="gray5"
						label={t('label.volume_type', 'Volume Type')}
						defaultSelection={{
							label: 'Primary',
							value: 1
						}}
						showCheckbox={false}
						onChange={onVolMainChange}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
					<Input
						inputName="volumeName"
						label={t('label.volume_name', 'Volume Name')}
						backgroundColor="gray5"
						value={volumeDetail?.volumeName}
						onChange={changeVolName}
						hasError={!errName}
					/>
					{!errName && (
						<Padding top="extrasmall">
							<Text color="error" overflow="break-word" size="extrasmall">
								{t('buckets.invalid_volume_name', 'Volume name is required.')}
							</Text>
						</Padding>
					)}
				</Row>
				<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
					<Input
						inputName="path"
						label={t('label.volume_path', 'Volume path')}
						backgroundColor="gray5"
						value={volumeDetail?.path}
						onChange={changeVolPath}
						hasError={!errPath}
					/>
					{!errPath && (
						<Padding top="extrasmall">
							<Text color="error" overflow="break-word" size="extrasmall">
								{t('buckets.invalid_volume_path', 'path is required')}
							</Text>
						</Padding>
					)}
				</Row>
				{!toggleIndexer && (
					<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
						<Row width="32%" mainAlignment="flex-start">
							<Switch
								value={volumeDetail?.isCompression}
								label={t('label.enable_compression', 'Enable Compression')}
								onClick={changeSwitchIsCompression}
							/>
						</Row>
						<Padding horizontal="small" />
						<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="65%">
							<Input
								inputName="compressionThreshold"
								label={t('label.volume_compression_thresold', 'Compression Threshold')}
								backgroundColor="gray5"
								value={volumeDetail?.compressionThreshold}
								onChange={changeVolCompThresold}
								hasError={!errCompressionThreshold}
							/>
							{!errCompressionThreshold && (
								<Padding top="extrasmall">
									<Text color="error" overflow="break-word" size="extrasmall">
										{t('buckets.invalid_compression_thresold', 'Compression Threshold is required')}
									</Text>
								</Padding>
							)}
						</Row>
					</Row>
				)}
				<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
					<Switch
						value={volumeDetail?.isCurrent}
						label={t('label.enable_current', 'Enable as Current')}
						onClick={changeSwitchIsCurrent}
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
					<Text color="secondary">
						{t(
							'label.enable_current_helptext',
							'Enabling this option will disable the current active volume.'
						)}
					</Text>
				</Row>
			</Container>
		</>
	);
};

export default MailstoresCreate;
