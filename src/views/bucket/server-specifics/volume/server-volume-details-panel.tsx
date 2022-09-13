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
import { fetchSoap } from '../../../../services/bucket-service';
import { INDEXERES, PRIMARIES, SECONDARIES } from '../../../../constants';

const ServerVolumeDetailsPanel: FC<{
	setToggleDetailPage: any;
	volumeDetail: any;
	modifyVolumeToggle: any;
	setmodifyVolumeToggle: any;
	setOpen: any;
	changeSelectedVolume: any;
	GetAllVolumesRequest: any;
	detailData: any;
	setDetailData: any;
}> = ({
	setToggleDetailPage,
	volumeDetail,
	modifyVolumeToggle,
	setmodifyVolumeToggle,
	setOpen,
	changeSelectedVolume,
	GetAllVolumesRequest,
	detailData,
	setDetailData
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const [typeLabel, setTypeLabel] = useState('');
	const [toggleSetAsBtnLabel, setToggleSetAsBtnLabel] = useState(
		t('label.set_as_secondary_button', 'SET AS SECONDARY')
	);
	const [toggleSetAsIcon, setToggleSetAsIcon] = useState('ArrowheadDown');

	const getVolumeDetailData = useCallback((): void => {
		fetchSoap('GetVolumeRequest', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxPowerstore',
			id: volumeDetail?.id
		})
			.then((response) => {
				if (response?.Body?.GetVolumeResponse?.volume[0]?.type === 1) {
					setTypeLabel(PRIMARIES);
				} else if (response?.Body?.GetVolumeResponse?.volume[0]?.type === 2) {
					setTypeLabel(SECONDARIES);
				} else if (response?.Body?.GetVolumeResponse?.volume[0]?.type === 10) {
					setTypeLabel(INDEXERES);
				}
				setDetailData({
					name: response?.Body?.GetVolumeResponse?.volume[0]?.name,
					id: response?.Body?.GetVolumeResponse?.volume[0]?.id,
					type: response?.Body?.GetVolumeResponse?.volume[0]?.type,
					compressBlobs: response?.Body?.GetVolumeResponse?.volume[0]?.compressBlobs,
					isCurrent: response?.Body?.GetVolumeResponse?.volume[0]?.isCurrent,
					rootpath: response?.Body?.GetVolumeResponse?.volume[0]?.rootpath,
					compressionThreshold: response?.Body?.GetVolumeResponse?.volume[0]?.compressionThreshold
				});
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
				GetAllVolumesRequest();
			});
	}, [
		GetAllVolumesRequest,
		createSnackbar,
		setDetailData,
		setToggleDetailPage,
		t,
		volumeDetail?.id
	]);

	useEffect(() => {
		getVolumeDetailData();
	}, [getVolumeDetailData, volumeDetail, modifyVolumeToggle]);

	const handleTypeToggleClick = useCallback((): void => {
		fetchSoap('ModifyVolumeRequest', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'ModifyVolumeRequest',
			id: detailData?.id,
			volume: {
				id: detailData?.id,
				type: typeLabel === PRIMARIES ? '2' : '1'
			}
		})
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
				GetAllVolumesRequest();
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
	}, [GetAllVolumesRequest, createSnackbar, detailData?.id, getVolumeDetailData, t, typeLabel]);

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
								{detailData.name} Details
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
							style={{ padding: '8px 8px 8px 6px', display: 'block' }}
							onClick={(): void => {
								setmodifyVolumeToggle(true);
							}}
							disabled={!detailData?.id || volumeDetail.id !== detailData?.id}
							loading={!detailData?.id || volumeDetail.id !== detailData?.id}
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
											disabled={!detailData?.id || volumeDetail.id !== detailData?.id}
											loading={!detailData?.id || volumeDetail.id !== detailData?.id}
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
									onClick={(): any => setOpen(true)}
									disabled={!detailData?.id || volumeDetail.id !== detailData?.id}
									loading={!detailData?.id || volumeDetail.id !== detailData?.id}
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
