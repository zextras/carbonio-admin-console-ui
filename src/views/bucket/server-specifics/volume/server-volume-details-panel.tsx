/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
	Container,
	Input,
	Row,
	IconButton,
	Button,
	Divider,
	Padding,
	Radio,
	Text,
	Switch,
	useSnackbar,
	Link
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import {
	AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK,
	AMAZON_USERGUIDE_STORAGE_CLASS_LINK,
	INDEXERES,
	LOCAL_VALUE,
	PRIMARIES,
	PRIMARY_TYPE_VALUE,
	S3,
	SECONDARIES,
	SECONDARY_TYPE_VALUE
} from '../../../../constants';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useBucketServersListStore } from '../../../../store/bucket-server-list/store';
import { useServerStore } from '../../../../store/server/store';
import { fetchSoap } from '../../../../services/bucket-service';
import ListRow from '../../../list/list-row';

const ServerVolumeDetailsPanel: FC<{
	setToggleDetailPage: any;
	volumeDetail: any;
	modifyVolumeToggle: any;
	setmodifyVolumeToggle: any;
	setOpen: any;
	changeSelectedVolume: any;
	getAllVolumesRequest: any;
	detailData: any;
	setDetailData: any;
	selectedServerId: string;
}> = ({
	setToggleDetailPage,
	volumeDetail,
	modifyVolumeToggle,
	setmodifyVolumeToggle,
	setOpen,
	changeSelectedVolume,
	getAllVolumesRequest,
	detailData,
	setDetailData,
	selectedServerId
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const serverList = useServerStore((state) => state?.serverList);
	const serverName = useBucketServersListStore((state) => state?.volumeList)[0].name;
	const isAdvanced = useAuthIsAdvanced((state) => state?.isAdvanced);
	const [typeLabel, setTypeLabel] = useState('');
	const [toggleSetAsBtnLabel, setToggleSetAsBtnLabel] = useState(
		t('label.set_as_secondary_button', 'SET AS SECONDARY')
	);
	const [toggleSetAsIcon, setToggleSetAsIcon] = useState('ArrowheadDown');
	const [type, setType] = useState<any>();
	const [externalVolDetail, setExternalVolDetail] = useState<any>('');
	const [bucketList, setBucketList] = useState<Array<object | any>>([]);
	const [bucketName, setBucketName] = useState('');
	const [bucketS3, setBucketS3] = useState(false);
	const [primaryRadio, setPrimaryRadio] = useState(false);
	const [secondaryRadio, setSecondaryRadio] = useState(false);

	const getVolumeDetailData = useCallback((): void => {
		soapFetch(
			'GetVolume',
			{
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxPowerstore',
				id: volumeDetail?.id
			},
			undefined,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			selectedServerId
		)
			.then((response: any) => {
				if (response?.volume[0]?.type === 1) {
					setTypeLabel(PRIMARIES);
				} else if (response?.volume[0]?.type === 2) {
					setTypeLabel(SECONDARIES);
				} else if (response?.volume[0]?.type === 10) {
					setTypeLabel(INDEXERES);
				}
				const volData = response?.volume[0];
				setDetailData(volData);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.volume_detail_error', '{{message}}', {
						message: 'Something went wrong, please try again'
					}),
					autoHideTimeout: 5000
				});
				setToggleDetailPage(false);
				getAllVolumesRequest();
			});
	}, [
		volumeDetail?.id,
		selectedServerId,
		setDetailData,
		createSnackbar,
		t,
		setToggleDetailPage,
		getAllVolumesRequest
	]);

	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';

	const getAllBuckets = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'listBuckets',
			type: 'all',
			targetServer: server,
			showSecrets: true
		}).then((res: any) => {
			const response = JSON.parse(res.Body.response.content);
			if (response.ok) {
				setBucketList(response.response.values);
				const bucName =
					response.response.values.find((b: any) => b?.uuid === volumeDetail?.bucketConfigurationId)
						?.bucketName || '';
				setBucketName(bucName);
			} else {
				setBucketList([]);
			}
		});
	}, [server, volumeDetail?.bucketConfigurationId]);

	useEffect(() => {
		getVolumeDetailData();
		getAllBuckets();
	}, [getVolumeDetailData, volumeDetail, modifyVolumeToggle, getAllBuckets]);

	useEffect(() => {
		if (volumeDetail?.storeType === S3) {
			setBucketS3(true);
		} else {
			setBucketS3(false);
		}
	}, [volumeDetail?.storeType]);

	useEffect(() => {
		if (volumeDetail?.volumeType === 'primary') {
			setPrimaryRadio(true);
		} else if (volumeDetail?.volumeType === 'secondary') {
			setSecondaryRadio(true);
		}
	}, [volumeDetail?.volumeType]);

	const handleTypeToggleClick = useCallback(async (): Promise<void> => {
		if (isAdvanced) {
			const obj: any = {};
			obj._jsns = 'urn:zimbraAdmin';
			obj.module = 'ZxPowerstore';
			obj.action = 'doUpdateVolume';
			obj.targetServers = serverName;
			obj.volumeType =
				volumeDetail?.volumeType === PRIMARIES.toLocaleLowerCase()
					? SECONDARIES.toLocaleLowerCase()
					: PRIMARIES.toLocaleLowerCase();
			obj.storeType = volumeDetail?.storeType;
			obj.isCurrent = volumeDetail?.isCurrent;
			obj.currentVolumeName = volumeDetail?.name;

			await fetchSoap('zextras', obj)
				.then((res: any) => {
					const result = JSON.parse(res?.Body?.response?.content);
					const updateResponse = result?.response?.[serverName];
					if (updateResponse?.ok) {
						createSnackbar({
							key: '1',
							type: 'success',
							label: t('label.volume_detail_success', 'All changes have been saved successfully')
						});
						getAllVolumesRequest();
						setmodifyVolumeToggle(false);
						setTypeLabel(
							obj.volumeType === PRIMARIES.toLocaleLowerCase() ? SECONDARIES : PRIMARIES
						);
						setToggleDetailPage(false);
					} else {
						createSnackbar({
							key: 'error',
							type: 'error',
							label: t('label.volume_detail_error', '{{message}}', {
								message: 'Something went wrong, please try again'
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
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
					});
					setmodifyVolumeToggle(false);
				});
		} else {
			soapFetch(
				'ModifyVolume',
				{
					_jsns: 'urn:zimbraAdmin',
					module: 'ZxCore',
					action: 'ModifyVolumeRequest',
					id: detailData?.id,
					volume: {
						id: detailData?.id,
						type: typeLabel === PRIMARIES ? '2' : '1'
					}
				},
				undefined,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				selectedServerId
			)
				.then(() => {
					createSnackbar({
						key: '1',
						type: 'success',
						label: t('label.volume_detail_success', 'All changes have been saved successfully')
					});
					getAllVolumesRequest();
					getVolumeDetailData();
				})
				.catch((error) => {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.volume_detail_error', '{{message}}', {
							message: 'Something went wrong, please try again'
						}),
						autoHideTimeout: 5000
					});
				});
		}
	}, [
		isAdvanced,
		serverName,
		volumeDetail?.volumeType,
		volumeDetail?.storeType,
		volumeDetail?.isCurrent,
		volumeDetail?.name,
		createSnackbar,
		t,
		getAllVolumesRequest,
		setmodifyVolumeToggle,
		setToggleDetailPage,
		detailData?.id,
		typeLabel,
		selectedServerId,
		getVolumeDetailData
	]);

	useEffect(() => {
		if (typeLabel === PRIMARIES) {
			setToggleSetAsBtnLabel(t('label.set_as_secondary_button', 'SET AS SECONDARY'));
			setToggleSetAsIcon('ArrowheadDown');
		} else if (typeLabel === SECONDARIES) {
			setToggleSetAsBtnLabel(t('label.set_as_primary_button', 'SET AS PRIMARY'));
			setToggleSetAsIcon('ArrowheadUp');
		}
	}, [t, typeLabel]);

	return (
		<>
			{detailData && volumeDetail?.storeType === LOCAL_VALUE ? (
				<Container
					background="gray6"
					mainAlignment="flex-start"
					orientation="vertical"
					style={{ overflowY: 'scroll' }}
				>
					<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
						<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
							<Text size="extralarge" weight="bold">
								{t('label.volume_detail_page_title', '{{message}} Details', {
									message: detailData?.name
								})}
							</Text>
						</Row>
						<Row padding={{ horizontal: 'small' }}>
							<IconButton icon="CloseOutline" onClick={(): void => setToggleDetailPage(false)} />
						</Row>
					</Row>
					<Divider />
					<Container
						orientation="horizontal"
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						background="gray6"
						padding={{ all: 'extralarge' }}
						style={{ height: 'fit-content' }}
					>
						<Button
							type="outlined"
							iconColor="gray6"
							icon="EditAsNewOutline"
							height={36}
							label=""
							width={36}
							style={{ padding: '0.5rem 0.5rem 0.5rem 0.375rem', display: 'block' }}
							onClick={(): void => {
								setmodifyVolumeToggle(true);
							}}
							disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
							loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
						/>
					</Container>
					<Container
						padding={{ horizontal: 'large', bottom: 'large' }}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row padding={{ top: 'small' }} width="100%">
							<Input
								label={t('label.volume_name', 'Volume Name')}
								value={detailData?.name}
								backgroundColor="gray5"
								readyOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.type', 'Type')}
								backgroundColor="gray6"
								value={typeLabel}
								readOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.volume_id', 'Volume ID')}
								value={detailData?.id}
								backgroundColor="gray6"
								readyOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.path', 'Path')}
								value={detailData?.rootpath}
								backgroundColor="gray5"
								readyOnly
							/>
						</Row>
						<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
							{typeLabel !== INDEXERES && (
								<>
									<Row width="48%" mainAlignment="flex-start">
										<Switch
											value={detailData?.compressBlobs}
											label={t('label.enable_compression', 'Enable Compression')}
										/>
									</Row>
									<Padding width="4%" />
								</>
							)}
							<Row width="48%" mainAlignment="flex-start">
								<Switch value={detailData?.isCurrent} label={t('label.current', 'Current')} />
							</Row>
						</Row>
						{typeLabel !== INDEXERES && (
							<Row padding={{ top: 'small' }} width="50%">
								<Input
									label={t('label.compression_threshold', 'Compression Threshold')}
									value={detailData?.compressionThreshold}
									backgroundColor="gray6"
									readOnly
									color="secondary"
								/>
							</Row>
						)}
						<Container orientation="horizontal" mainAlignment="flex-end" crossAlignment="flex-end">
							{typeLabel !== INDEXERES && (
								<>
									<Row width="50%" mainAlignment="flex-start">
										<Button
											type="outlined"
											width="fill"
											label={toggleSetAsBtnLabel}
											icon={toggleSetAsIcon}
											iconPlacement="left"
											color="primary"
											disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
											loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
											onClick={handleTypeToggleClick}
											size="large"
										/>
									</Row>
									<Padding horizontal="small" />
								</>
							)}
							<Row width={typeLabel !== INDEXERES ? '50%' : '100%'} mainAlignment="flex-start">
								<Button
									icon="CloseOutline"
									iconPlacement="left"
									type="outlined"
									label={t('label.button_delete', 'DELETE')}
									color="error"
									width="fill"
									onClick={(): void => setOpen(true)}
									disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
									loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
								/>
							</Row>
						</Container>
					</Container>
				</Container>
			) : (
				<Container
					background="gray6"
					mainAlignment="flex-start"
					orientation="vertical"
					style={{ overflowY: 'auto' }}
				>
					<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
						<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
							<Text size="extralarge" weight="bold">
								{t('label.volume_detail_page_title', '{{message}} Details', {
									message: detailData?.name
								})}
							</Text>
						</Row>

						<Row padding={{ horizontal: 'small' }}>
							<IconButton
								icon="CloseOutline"
								color="gray1"
								onClick={(): void => setToggleDetailPage(false)}
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
						style={{ height: 'fit-content' }}
					>
						<Button
							type="outlined"
							iconColor="gray6"
							icon="EditAsNewOutline"
							height={36}
							label=""
							width={36}
							style={{ padding: '0.5rem 0.5rem 0.5rem 0.375rem', display: 'block' }}
							onClick={(): void => {
								setmodifyVolumeToggle(true);
							}}
							disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
							loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
						/>
					</Container>

					<Container
						padding={{ horizontal: 'large', bottom: 'large' }}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row padding={{ top: 'small' }} width="100%">
							<Input
								inputName="server"
								label={t('label.volume_server_name', 'Server')}
								value={serverName}
								backgroundColor="gray5"
								readyOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.storage_type', 'Storage Type')}
								backgroundColor="gray6"
								value={t('volume.volume_allocation_list.object_storage', 'ObjectStorage')}
								readOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.volume_name', 'Volume Name')}
								value={volumeDetail?.name}
								backgroundColor="gray6"
								readOnly
							/>
						</Row>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'large', right: 'large' }}
							>
								<Input
									label={t('label.bucket_name', 'Bucket Name')}
									backgroundColor="gray6"
									value={bucketName}
									readOnly
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'large', right: 'large' }}
							>
								<Input
									label={t('label.type', 'Type')}
									backgroundColor="gray6"
									value={volumeDetail?.storeType}
									readOnly
								/>
							</Container>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								padding={{ top: 'large' }}
							>
								<Input
									label={t('label.ID', 'ID')}
									backgroundColor="gray6"
									value={volumeDetail?.bucketConfigurationId}
									readOnly
								/>
							</Container>
						</ListRow>
						<Row
							padding={{ top: 'large' }}
							width="100%"
							mainAlignment="center"
							crossAlignment="center"
							backgroundColor="gray6"
						>
							<Row width="48%">
								<Radio
									inputName="primary"
									label={t('label.primary_volume', 'This is a Primary Volume')}
									value={PRIMARY_TYPE_VALUE}
									checked={primaryRadio}
									onClick={(): void => {
										setPrimaryRadio(!primaryRadio);
										setSecondaryRadio(false);
									}}
									disabled
								/>
							</Row>
							<Row width="48%">
								<Radio
									inputName="secondary"
									label={t('label.secondary_volume', 'This is a Secondary Volume')}
									value={SECONDARY_TYPE_VALUE}
									checked={secondaryRadio}
									onClick={(): void => {
										setSecondaryRadio(!secondaryRadio);
										setPrimaryRadio(false);
									}}
									disabled
								/>
							</Row>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								inputName="prefix"
								label={t(
									'label.prefix_name',
									'Prefix - all objects will have this prefix in their name'
								)}
								value={volumeDetail?.volumePrefix}
								backgroundColor="gray5"
								readOnly
							/>
						</Row>
						{bucketS3 && (
							<>
								<Row
									padding={{ top: 'large' }}
									mainAlignment="flex-start"
									width="100%"
									backgroundColor="gray6"
								>
									<Row width="48.5%" mainAlignment="flex-start">
										<Row mainAlignment="flex-start" width="100%">
											<Switch
												value={volumeDetail?.useInfrequentAccess}
												label={t('label.use_infraquent_access', 'Use infrequent access')}
												disabled
											/>
										</Row>
										<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
											<Link
												color="secondary"
												href={AMAZON_USERGUIDE_STORAGE_CLASS_LINK}
												target="_blank"
												rel="noopener noreferrer"
											>
												<Trans
													i18nKey="label.use_infraquent_access_helptext"
													defaults="<underline>Amazon Storage Class Documentation</underline>"
													components={{ underline: <u /> }}
												/>
											</Link>
										</Row>
									</Row>
									<Padding horizontal="small" />
									<Row width="48.5%" mainAlignment="flex-start">
										<Input
											inputName="infrequentAccessThreshold"
											label={t('label.size_threshold', 'Size Threshold')}
											backgroundColor="gray5"
											value={volumeDetail?.infrequentAccessThreshold}
											disabled
										/>
									</Row>
								</Row>
								<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
									<Switch
										value={volumeDetail?.useIntelligentTiering}
										label={t('label.use_intelligent_tiering', 'Use intelligent tiering')}
										disabled
									/>
								</Row>
								<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
									<Link
										color="secondary"
										href={AMAZON_USERGUIDE_INTELLIGENT_TIERING_LINK}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Trans
											i18nKey="label.use_intelligent_tiering_helptext"
											defaults="<underline>Amazon Tiering Documentation</underline>"
											components={{ underline: <u /> }}
										/>
									</Link>
								</Row>
							</>
						)}
						<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
							<Switch
								value={volumeDetail?.isCurrent}
								label={t('label.enable_current', 'Enable as Current')}
								disabled
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
						<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
							<Switch
								value={volumeDetail?.centralized}
								label={t('label.storage_centralized', 'I want this Storage to be centralized')}
								disabled
							/>
						</Row>
						<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
							<Text color="secondary" style={{ whiteSpace: 'pre-line' }}>
								<Trans
									i18nKey="label.storage_centralized_helpertext"
									defaults="<bold>Use the CLI to manage the centralization.</bold> Centralized data becomes useful when two or more servers need access to the same data. By keeping data in one place, it’s easier to manage both the hardware and the data itself. "
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Row>
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							padding={{ top: 'large' }}
						>
							{typeLabel !== INDEXERES && (
								<>
									<Row width="50%" mainAlignment="flex-start">
										<Button
											type="outlined"
											width="fill"
											label={toggleSetAsBtnLabel}
											icon={toggleSetAsIcon}
											iconPlacement="left"
											color="primary"
											disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
											loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
											onClick={handleTypeToggleClick}
										/>
									</Row>
									<Padding horizontal="small" />
								</>
							)}
							<Row width={typeLabel !== INDEXERES ? '50%' : '100%'} mainAlignment="flex-start">
								<Button
									icon="CloseOutline"
									iconPlacement="left"
									type="outlined"
									label={t('label.button_delete', 'DELETE')}
									color="error"
									width="fill"
									onClick={(): void => setOpen(true)}
									disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
									loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
									size="large"
								/>
							</Row>
						</Container>
					</Container>
				</Container>
			)}
		</>
	);
};

export default ServerVolumeDetailsPanel;
