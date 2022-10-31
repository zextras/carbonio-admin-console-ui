/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Input,
	Padding,
	Switch,
	Text,
	Select,
	Radio
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { volumeAllocationList, volumeTypeList } from '../../../../utility/utils';
import { VolumeContext } from './volume-context';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import {
	EMPTY_TYPE_VALUE,
	INDEX_TYPE_VALUE,
	LOCAL,
	PRIMARY_TYPE_VALUE,
	SECONDARY_TYPE_VALUE
} from '../../../../../constants';

const MailstoresCreate: FC<{
	onSelection: any;
	externalData: string;
	setCompleteLoading: any;
}> = ({ onSelection, externalData, setCompleteLoading }) => {
	const context = useContext(VolumeContext);
	const { t } = useTranslation();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const volTypeList = useMemo(() => volumeTypeList(t), [t]);
	const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
	const { volumeDetail, setVolumeDetail } = context;
	const [errName, setErrName] = useState(true);
	const [errPath, setErrPath] = useState(true);
	const [errCompressionThreshold, setErrCompressionThreshold] = useState(true);
	const [toggleIndexer, setToggleIndexer] = useState(false);
	const [primaryRadio, setPrimaryRadio] = useState(false);
	const [secondaryRadio, setSecondaryRadio] = useState(false);
	const [indexRadio, setIndexRadio] = useState(false);
	const [allocation, setAllocation] = useState<any>();

	const onVolMainChange = (v: any): void => {
		if (!isAdvanced) {
			setVolumeDetail((prev: any) => ({ ...prev, volumeMain: v }));
			onSelection({ volumeMain: v }, true);
			if (v === INDEX_TYPE_VALUE) {
				setToggleIndexer(true);
			} else {
				setToggleIndexer(false);
			}
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

	const onVolAllocationChange = (v: any): any => {
		setVolumeDetail((prev: any) => ({ ...prev, volumeAllocation: v }));
	};

	useEffect(() => {
		if (
			volumeDetail?.volumeName &&
			volumeDetail?.path &&
			(volumeDetail?.compressionThreshold || toggleIndexer)
		) {
			if (isAdvanced && volumeDetail?.volumeMain) {
				setCompleteLoading(true);
			} else if (isAdvanced) {
				setCompleteLoading(false);
			} else if (!isAdvanced) {
				setCompleteLoading(true);
			}
		} else {
			setCompleteLoading(false);
		}
	}, [
		isAdvanced,
		setCompleteLoading,
		toggleIndexer,
		volumeDetail?.compressionThreshold,
		volumeDetail?.path,
		volumeDetail?.volumeMain,
		volumeDetail?.volumeName
	]);
	useEffect(() => {
		if (isAdvanced) {
			if (primaryRadio) {
				setVolumeDetail((prev: any) => ({ ...prev, volumeMain: PRIMARY_TYPE_VALUE }));
				onSelection({ volumeMain: PRIMARY_TYPE_VALUE }, true);
			} else if (secondaryRadio) {
				setVolumeDetail((prev: any) => ({ ...prev, volumeMain: SECONDARY_TYPE_VALUE }));
				onSelection({ volumeMain: SECONDARY_TYPE_VALUE }, true);
			} else if (indexRadio) {
				setVolumeDetail((prev: any) => ({ ...prev, volumeMain: INDEX_TYPE_VALUE }));
				onSelection({ volumeMain: INDEX_TYPE_VALUE }, true);
			} else {
				setVolumeDetail((prev: any) => ({ ...prev, volumeMain: EMPTY_TYPE_VALUE }));
				onSelection({ volumeMain: EMPTY_TYPE_VALUE }, true);
			}
			const volumeTypeObject = volAllocationList.find(
				(item: any) => item.value === volumeDetail?.volumeAllocation
			);
			setAllocation(volumeTypeObject);
		}
	}, [
		indexRadio,
		isAdvanced,
		onSelection,
		primaryRadio,
		secondaryRadio,
		setVolumeDetail,
		volAllocationList,
		volumeDetail?.volumeAllocation
	]);

	useEffect(() => {
		if (isAdvanced) {
			if (volumeDetail?.volumeMain === PRIMARY_TYPE_VALUE) {
				setPrimaryRadio(true);
			} else if (volumeDetail?.volumeMain === SECONDARY_TYPE_VALUE) {
				setSecondaryRadio(true);
			} else if (volumeDetail?.volumeMain === INDEX_TYPE_VALUE) {
				setIndexRadio(true);
			}
		}
	}, [isAdvanced, volumeDetail?.volumeMain]);

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
				{!isAdvanced && (
					<Row padding={{ top: 'large' }} width="100%">
						<Input
							label={t('label.volume_allocation', 'Allocation')}
							backgroundColor="gray6"
							value={LOCAL}
							readOnly
						/>
					</Row>
				)}
				{!isAdvanced && (
					<Row padding={{ top: 'large' }} width="100%">
						<Select
							items={volTypeList}
							background="gray5"
							label={t('label.volume_type', 'Volume Type')}
							defaultSelection={volTypeList.filter(
								(items) => items.value === volumeDetail?.volumeMain
							)}
							showCheckbox={false}
							onChange={onVolMainChange}
						/>
					</Row>
				)}
				{isAdvanced && (
					<Row padding={{ top: 'large' }} width="100%">
						<Select
							items={volAllocationList}
							background="gray5"
							label={t('label.volume_allocation', 'Allocation')}
							showCheckbox={false}
							selection={allocation}
							onChange={onVolAllocationChange}
						/>
					</Row>
				)}
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
				{isAdvanced && (
					<>
						<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
							<Row width="48%" mainAlignment="flex-start">
								<Radio
									inputName="primary"
									label={t('label.primary_volume', 'This is a Primary Volume')}
									value={PRIMARY_TYPE_VALUE}
									checked={primaryRadio}
									onClick={(): any => {
										setPrimaryRadio(!primaryRadio);
										setSecondaryRadio(false);
										setIndexRadio(false);
									}}
								/>
							</Row>
							<Row width="48%" mainAlignment="flex-start">
								<Radio
									inputName="secondary"
									label={t('label.secondary_volume', 'This is a Secondary Volume')}
									value={SECONDARY_TYPE_VALUE}
									checked={secondaryRadio}
									onClick={(): any => {
										setSecondaryRadio(!secondaryRadio);
										setPrimaryRadio(false);
										setIndexRadio(false);
									}}
								/>
							</Row>
						</Row>
						<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
							<Radio
								inputName="index"
								label={t('label.index_volume', 'This is a Index Volume')}
								value={INDEX_TYPE_VALUE}
								checked={indexRadio}
								onClick={(): any => {
									setIndexRadio(!indexRadio);
									setPrimaryRadio(false);
									setSecondaryRadio(false);
								}}
							/>
						</Row>
					</>
				)}
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
