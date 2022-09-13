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
	Text,
	Button,
	IconButton,
	Divider,
	Switch,
	Select,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { volumeTypeList } from '../../../../utility/utils';
import { fetchSoap } from '../../../../../services/bucket-service';

const ModifyVolume: FC<{
	setmodifyVolumeToggle: any;
	volumeDetail: any;
	changeSelectedVolume: any;
	GetAllVolumesRequest: any;
}> = ({ setmodifyVolumeToggle, volumeDetail, changeSelectedVolume, GetAllVolumesRequest }) => {
	const { t } = useTranslation();
	const [isDirty, setIsDirty] = useState(false);
	const [name, setName] = useState(volumeDetail?.name);
	const [type, setType] = useState<any>();
	const [id, setId] = useState(volumeDetail?.id);
	const [rootpath, setRootpath] = useState(volumeDetail?.rootpath);
	const [compressBlobs, setCompressBlobs] = useState(volumeDetail?.compressBlobs);
	const [isCurrent, setIsCurrent] = useState(volumeDetail?.isCurrent);
	const [compressionThreshold, setCompressionThreshold] = useState(
		volumeDetail?.compressionThreshold
	);
	const [previousDetail, setPreviousDetail] = useState<any>({});
	const createSnackbar = useSnackbar();

	const updatePreviousDetail = (): void => {
		const latestData: any = {};
		latestData.name = name;
		latestData.type = type;
		latestData.id = id;
		latestData.rootpath = rootpath;
		latestData.compressBlobs = compressBlobs;
		latestData.isCurrent = isCurrent;
		latestData.compressionThreshold = compressionThreshold;
		setPreviousDetail(latestData);
		setIsDirty(false);
	};

	const onSave = (): void => {
		fetchSoap('ModifyVolumeRequest', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'ModifyVolumeRequest',
			id,
			volume: {
				id,
				name,
				rootpath,
				type: type?.value,
				compressBlobs: compressBlobs ? 1 : 0,
				compressionThreshold,
				isCurrent: isCurrent ? 1 : 0
			}
		})
			.then(() => {
				if (isCurrent) {
					fetchSoap('SetCurrentVolumeRequest', {
						_jsns: 'urn:zimbraAdmin',
						module: 'ZxCore',
						action: 'SetCurrentVolumeRequest',
						id,
						type: type?.value
					}).catch((error) => {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: error
							}),
							autoHideTimeout: 5000
						});
					});
				}
				createSnackbar({
					key: '1',
					type: 'success',
					label: t('label.volume_edited', 'Volume edited successfully')
				});
				GetAllVolumesRequest();
				setmodifyVolumeToggle(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.volume_detail_error', '{{message}}', {
						message: error
					}),
					autoHideTimeout: 5000
				});
				setmodifyVolumeToggle(false);
			});
		updatePreviousDetail();
	};

	const onUndo = (): void => {
		previousDetail?.name ? setName(previousDetail?.name) : setName(volumeDetail?.name);
		const VolumeTypeObject = volumeTypeList.find((item: any) => item.value === volumeDetail?.type);
		previousDetail?.type ? setType(previousDetail?.type) : setType(VolumeTypeObject);
		previousDetail?.id ? setId(previousDetail?.id) : setId(volumeDetail?.id);
		previousDetail?.rootpath
			? setRootpath(previousDetail?.rootpath)
			: setRootpath(volumeDetail?.rootpath);
		previousDetail?.compressBlobs
			? setCompressBlobs(previousDetail?.compressBlobs)
			: setCompressBlobs(volumeDetail?.compressBlobs);
		previousDetail?.isCurrent
			? setIsCurrent(previousDetail?.isCurrent)
			: setIsCurrent(volumeDetail?.isCurrent);
		previousDetail?.compressionThreshold
			? setCompressionThreshold(previousDetail?.compressionThreshold)
			: setCompressionThreshold(volumeDetail?.compressionThreshold);
		setIsDirty(false);
	};

	const onVolumeTypeChange = useCallback((e: any): void => {
		const volumeObject: any = volumeTypeList.find((item: any): any => item.value === e);
		setType(volumeObject);
	}, []);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.name !== name) {
			setIsDirty(true);
		}
	}, [name, volumeDetail]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.type !== type?.value) {
			setIsDirty(true);
		}
	}, [type?.value, volumeDetail]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.id !== id) {
			setIsDirty(true);
		}
	}, [volumeDetail, id]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.rootpath !== rootpath) {
			setIsDirty(true);
		}
	}, [volumeDetail, rootpath]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.compressBlobs !== compressBlobs) {
			setIsDirty(true);
		}
	}, [volumeDetail, compressBlobs]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.isCurrent !== isCurrent) {
			setIsDirty(true);
		}
	}, [volumeDetail, isCurrent]);

	useEffect(() => {
		if (volumeDetail !== undefined && volumeDetail?.compressionThreshold !== compressionThreshold) {
			setIsDirty(true);
		}
	}, [volumeDetail, compressionThreshold]);

	useEffect(() => {
		setName(volumeDetail?.name);
		const VolumeTypeObject = volumeTypeList.find((item: any) => item.value === volumeDetail?.type);
		setType(VolumeTypeObject);
		setId(volumeDetail?.id);
		setRootpath(volumeDetail?.rootpath);
		setCompressBlobs(volumeDetail?.compressBlobs);
		setIsCurrent(volumeDetail?.isCurrent);
		setCompressionThreshold(volumeDetail?.compressionThreshold);
		setIsDirty(false);
	}, [volumeDetail]);

	return (
		<>
			<Container background="gray6">
				<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
						<Text size="extralarge" weight="bold">
							{volumeDetail?.name} Details
						</Text>
					</Row>
					<Row padding={{ horizontal: 'small' }}>
						<IconButton
							icon="CloseOutline"
							color="gray1"
							onClick={(): void => setmodifyVolumeToggle(false)}
						/>
					</Row>
				</Row>
				<Divider />
				<Container
					orientation="horizontal"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					background="gray6"
					padding={{ all: 'extralarge' }}
					height="85px"
				>
					<Padding right="small">
						{isDirty && (
							<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
						)}
					</Padding>
					{isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
				</Container>
				<Container
					padding={{ horizontal: 'large', top: 'extralarge', bottom: 'large' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Row padding={{ top: 'small' }} width="100%">
						<Input
							label={t('label.volume_name', 'Volume Name')}
							value={name}
							backgroundColor="gray5"
							onChange={(e: any): any => setName(e.target.value)}
						/>
					</Row>
					<Row padding={{ top: 'large' }} width="100%">
						<Select
							items={volumeTypeList}
							background="gray5"
							label={t('label.volume_main', 'Volume Main')}
							selection={type}
							showCheckbox={false}
							onChange={onVolumeTypeChange}
							disabled
						/>
					</Row>
					<Row padding={{ top: 'large' }} width="100%">
						<Input
							label={t('label.volume_id', 'Volume ID')}
							value={id}
							backgroundColor="gray6"
							onChange={(e: any): any => setId(e.target.value)}
						/>
					</Row>
					<Row padding={{ top: 'large' }} width="100%">
						<Input
							label={t('label.path', 'Path')}
							value={rootpath}
							backgroundColor="gray5"
							onChange={(e: any): any => setRootpath(e.target.value)}
						/>
					</Row>
					<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
						{volumeDetail?.type !== 10 && (
							<>
								<Row width="48%" mainAlignment="flex-start">
									<Switch
										value={compressBlobs}
										label={t('label.enable_compression', 'Enable Compression')}
										onClick={(e: any): any => setCompressBlobs(!compressBlobs)}
									/>
								</Row>
								<Padding width="4%" />
							</>
						)}
						<Row width="48%" mainAlignment="flex-start">
							<Switch
								value={isCurrent}
								label={t('label.current', 'Current')}
								onClick={(e: any): any => setIsCurrent(!isCurrent)}
							/>
						</Row>
					</Row>
					{volumeDetail?.type !== 10 && (
						<Row padding={{ top: 'small' }} width="50%">
							<Input
								label={t('label.compression_threshold', 'Compression Threshold')}
								value={compressionThreshold}
								backgroundColor="gray6"
								onChange={(e: any): any => setCompressionThreshold(e.target.value)}
								color="secondary"
							/>
						</Row>
					)}
				</Container>
			</Container>
		</>
	);
};

export default ModifyVolume;
