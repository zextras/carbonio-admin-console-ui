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
	Text,
	Switch,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { INDEXERES, PRIMARIES, SECONDARIES } from '../../../../constants';
import { useAuthIsAdvanced } from '../../../../store/auth-advanced/store';
import { useBucketServersListStore } from '../../../../store/bucket-server-list/store';
import { useServerStore } from '../../../../store/server/store';
import { fetchSoap } from '../../../../services/bucket-service';

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
						message: error
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

	useEffect(() => {
		getVolumeDetailData();
	}, [getVolumeDetailData, volumeDetail, modifyVolumeToggle]);

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
						setTypeLabel(
							obj.volumeType === PRIMARIES.toLocaleLowerCase() ? SECONDARIES : PRIMARIES
						);
						setToggleDetailPage(false);
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
						label: t('label.volume_type_edited', '{{message}}', {
							message:
								typeLabel === PRIMARIES
									? 'volume type successfully changed to Secondary'
									: 'volume type successfully changed to Primary'
						})
					});
					getAllVolumesRequest();
					getVolumeDetailData();
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
				});
		}
	}, [
		isAdvanced,
		serverName,
		volumeDetail?.volumeType,
		volumeDetail?.storeType,
		volumeDetail?.isCurrent,
		volumeDetail?.name,
		serverList,
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
			{detailData && (
				<Container background="gray6">
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
							size="large"
							label=""
							style={{ padding: '0.5rem 0.5rem 0.5rem 0.375rem', display: 'block' }}
							onClick={(): void => {
								setmodifyVolumeToggle(true);
							}}
							disabled={!detailData?.id || volumeDetail?.id !== detailData?.id}
							loading={!detailData?.id || volumeDetail?.id !== detailData?.id}
						/>
					</Container>
					<Container
						padding={{ horizontal: 'large', top: 'extralarge', bottom: 'large' }}
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
											iconColor="primary"
										/>
									</Row>
									<Padding width="4%" />
								</>
							)}
							<Row width="48%" mainAlignment="flex-start">
								<Switch
									value={detailData?.isCurrent}
									label={t('label.current', 'Current')}
									iconColor="primary"
								/>
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
									onClick={(): any => setOpen(true)}
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
