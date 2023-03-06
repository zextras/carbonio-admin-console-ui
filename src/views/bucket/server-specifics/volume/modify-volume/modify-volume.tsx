/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { volumeTypeList } from '../../../../utility/utils';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import { fetchSoap } from '../../../../../services/bucket-service';
import {
	ALIBABA,
	CEPH,
	CLOUDIAN,
	CUSTOM_S3,
	EMC,
	FILEBLOB,
	OPENIO,
	S3,
	SCALITYS3,
	SWIFT
} from '../../../../../constants';
import { useBucketServersListStore } from '../../../../../store/bucket-server-list/store';
import { useServerStore } from '../../../../../store/server/store';

const ModifyVolume: FC<{
	setmodifyVolumeToggle: any;
	volumeDetail: any;
	changeSelectedVolume: any;
	getAllVolumesRequest: any;
	selectedServerId: string;
	volumeList: any;
}> = ({
	setmodifyVolumeToggle,
	volumeDetail,
	changeSelectedVolume,
	getAllVolumesRequest,
	selectedServerId,
	volumeList
}) => {
	const { t } = useTranslation();
	const isAdvanced = useAuthIsAdvanced((state) => state?.isAdvanced);
	const serverName = useBucketServersListStore((state) => state?.volumeList)[0].name;
	const serverList = useServerStore((state) => state.serverList);
	const volTypeList = useMemo(() => volumeTypeList(t), [t]);
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
	// const [currentVolumeName, setCurrentVolumeName] = useState('');
	const [externalVolDetail, setExternalVolDetail] = useState<any>('');
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

	const onSave = async (): Promise<void> => {
		if (isAdvanced) {
			const obj: any = {};
			obj._jsns = 'urn:zimbraAdmin';
			obj.module = 'ZxPowerstore';
			obj.action = 'doUpdateVolume';
			obj.targetServers = serverName;
			obj.currentVolumeName = volumeDetail?.name;
			obj.volumeName = name;
			obj.volumeType = type?.label?.toLowerCase();
			obj.volumeCurrent = isCurrent;
			obj.storeType = externalVolDetail?.storeType;

			if (externalVolDetail === '') {
				obj.volumePath = rootpath;
				obj.compressBlobs = compressBlobs ? 1 : 0;
				obj.compressionThreshold = Number(compressionThreshold);
			} else {
				if (
					externalVolDetail?.storeType?.toUpperCase() === ALIBABA?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === CEPH?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === CLOUDIAN?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === EMC?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === SCALITYS3?.toUpperCase() ||
					externalVolDetail?.storeType?.toUpperCase() === CUSTOM_S3?.toUpperCase()
				) {
					obj.volumePrefix = externalVolDetail?.volumePrefix;
					obj.bucketConfigurationId = externalVolDetail?.bucketConfigurationId;
				}
				if (externalVolDetail?.storeType?.toUpperCase() === S3?.toUpperCase()) {
					obj.volumePrefix = externalVolDetail?.volumePrefix;
					obj.bucketConfigurationId = externalVolDetail?.bucketConfigurationId;
					obj.useInfrequentAccess = false;
					obj.infrequentAccessThreshold = 'asd';
					obj.useIntelligentTiering = false;
				}
				if (externalVolDetail?.storeType?.toUpperCase() === FILEBLOB?.toUpperCase()) {
					obj.volumePath = '/tmp/store2';
					obj.volumeCompressed = false;
					obj.compressionThreshold = 'abc';
				}
				if (externalVolDetail?.storeType?.toUpperCase() === OPENIO?.toUpperCase()) {
					obj.url = '/tmp/store2';
					obj.account = 'abc';
					obj.namespace = 'abc';
					obj.proxyPort = 1;
					obj.accountPort = 1;
				}
				if (externalVolDetail?.storeType?.toUpperCase() === SWIFT?.toUpperCase()) {
					obj.url = '/tmp/store2';
					obj.username = 'abc';
					obj.password = 'abc';
					obj.authenticationMethod = 'BASIC';
					obj.authenticationMethodScope = 'DEFAULT';
					obj.tenantId = '12';
					obj.tenantName = '12';
					obj.domain = '12';
					obj.proxyHost = '12';
					obj.proxyPort = 10;
					obj.proxyUsername = 'abc';
					obj.proxyPassword = 'abc';
					obj.publicHost = 'abc';
					obj.privateHost = 'abc';
					obj.region = 'abc';
					obj.maxDeleteObjectsCount = 10;
				}
			}
			await fetchSoap('zextras', obj)
				.then((res: any) => {
					const result = JSON.parse(res?.Body?.response?.content);
					const updateResponse = result?.response?.[`${serverList[0]?.name}`];
					if (updateResponse?.ok) {
						createSnackbar({
							key: '1',
							type: 'success',
							label: t('label.external_volume_edited', '{{message}}', {
								message: updateResponse?.response?.message
							})
						});
						getAllVolumesRequest();
						setmodifyVolumeToggle(false);
					} else {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: updateResponse?.error?.message
							}),
							autoHideTimeout: 5000
						});
						setmodifyVolumeToggle(false);
					}
				})
				.catch((error: any) => {
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
		} else {
			await soapFetch(
				'ModifyVolume',
				{
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
				},
				undefined,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				selectedServerId
			)
				.then(() => {
					if (isCurrent) {
						soapFetch(
							'SetCurrentVolume',
							{
								_jsns: 'urn:zimbraAdmin',
								module: 'ZxCore',
								action: 'SetCurrentVolumeRequest',
								id,
								type: type?.value
							},
							undefined,
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							selectedServerId
						).catch((error) => {
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
					getAllVolumesRequest();
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
		}
		updatePreviousDetail();
	};

	const onUndo = (): void => {
		previousDetail?.name ? setName(previousDetail?.name) : setName(volumeDetail?.name);
		const volumeTypeObject = volTypeList?.find((item: any) => item?.value === volumeDetail?.type);
		previousDetail?.type ? setType(previousDetail?.type) : setType(volumeTypeObject);
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

	const onVolumeTypeChange = useCallback(
		(e: any): void => {
			const volumeObject: any = volTypeList?.find((item: any): any => item?.value === e);
			setType(volumeObject);
		},
		[volTypeList]
	);

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
		const volumeTypeObject = volTypeList?.find((item: any) => item?.value === volumeDetail?.type);
		setType(volumeTypeObject);
		setId(volumeDetail?.id);
		setRootpath(volumeDetail?.rootpath);
		setCompressBlobs(volumeDetail?.compressBlobs);
		setIsCurrent(volumeDetail?.isCurrent);
		setCompressionThreshold(volumeDetail?.compressionThreshold);
		setIsDirty(false);
	}, [volTypeList, volumeDetail]);

	useEffect(() => {
		if (isAdvanced) {
			if (volumeDetail?.type === 1) {
				// const volName = volumeList?.primaries?.filter((items: any) => items?.isCurrent)[0]?.name;
				// setCurrentVolumeName(volName);
				const volDetail = volumeList?.primaries?.filter(
					(items: any) => items?.id === volumeDetail?.id
				)[0];
				if (volDetail?.bucketConfigurationId) {
					setExternalVolDetail(volDetail);
				} else {
					setExternalVolDetail('');
				}
			}
			if (volumeDetail?.type === 2) {
				// const volName = volumeList?.secondaries?.filter((items: any) => items?.isCurrent)[0]?.name;
				// setCurrentVolumeName(volName);
				const volDetail = volumeList?.secondaries?.filter(
					(items: any) => items?.id === volumeDetail?.id
				)[0];
				if (volDetail?.bucketConfigurationId) {
					setExternalVolDetail(volDetail);
				} else {
					setExternalVolDetail('');
				}
			}
			if (volumeDetail?.type === 10) {
				// const volName = volumeList?.indexes?.filter((items: any) => items?.isCurrent)[0]?.name;
				// setCurrentVolumeName(volName);
				const volDetail = volumeList?.indexes?.filter(
					(items: any) => items?.id === volumeDetail?.id
				)[0];
				if (volDetail?.bucketConfigurationId) {
					setExternalVolDetail(volDetail);
				} else {
					setExternalVolDetail('');
				}
			}
		}
	}, [
		volumeList?.primaries,
		volumeDetail?.type,
		volumeList?.secondaries,
		volumeList?.indexes,
		isAdvanced,
		volumeDetail?.id
	]);

	return (
		<>
			<Container background="gray6">
				<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
					<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
						<Text size="extralarge" weight="bold">
							{t('label.volume_detail_page_title', '{{message}} Details', {
								message: volumeDetail?.name
							})}
						</Text>
					</Row>
					<Row padding={{ horizontal: 'small' }}>
						<IconButton icon="CloseOutline" onClick={(): void => setmodifyVolumeToggle(false)} />
					</Row>
				</Row>
				<Divider />
				<Container
					orientation="horizontal"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
					background="gray6"
					padding={{ all: 'extralarge' }}
					height="5.313rem"
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
							onChange={(e: any): any => setName(e?.target?.value)}
						/>
					</Row>
					<Row padding={{ top: 'large' }} width="100%">
						<Select
							items={volTypeList}
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
							onChange={(e: any): any => setId(e?.target?.value)}
						/>
					</Row>
					<Row padding={{ top: 'large' }} width="100%">
						<Input
							label={t('label.path', 'Path')}
							value={rootpath}
							backgroundColor="gray5"
							onChange={(e: any): any => setRootpath(e?.target?.value)}
						/>
					</Row>
					<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
						{volumeDetail?.type !== 10 && (
							<>
								<Row width="48%" mainAlignment="flex-start">
									<Switch
										value={compressBlobs}
										label={t('label.enable_compression', 'Enable Compression')}
										onClick={(): any => setCompressBlobs(!compressBlobs)}
										iconColor="primary"
									/>
								</Row>
								<Padding width="4%" />
							</>
						)}
						<Row width="48%" mainAlignment="flex-start">
							<Switch
								value={isCurrent}
								label={t('label.current', 'Current')}
								onClick={(): any => setIsCurrent(!isCurrent)}
								iconColor="primary"
							/>
						</Row>
					</Row>
					{volumeDetail?.type !== 10 && (
						<Row padding={{ top: 'small' }} width="50%">
							<Input
								label={t('label.compression_threshold', 'Compression Threshold')}
								value={compressionThreshold}
								backgroundColor="gray6"
								onChange={(e: any): any => setCompressionThreshold(e?.target?.value)}
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
