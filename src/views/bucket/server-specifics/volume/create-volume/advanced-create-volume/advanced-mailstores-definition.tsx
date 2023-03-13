/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Input, Select, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { BucketTypeItems, volumeAllocationList } from '../../../../../utility/utils';
import { VolumeContext } from '../volume-context';
import { LOCAL_TYPE_VALUE, UNUSED, USAGE_IN_EXTERNAL_BACKUP } from '../../../../../../constants';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import { fetchSoap } from '../../../../../../services/bucket-service';
import { AdvancedVolumeContext } from './create-advanced-volume-context';

const AdvancedMailstoresDefinition: FC<{
	externalData: any;
	setCompleteLoading: any;
	setToggleNextBtn: any;
}> = ({ externalData, setToggleNextBtn, setCompleteLoading }) => {
	const { t } = useTranslation();
	const context = useContext(VolumeContext);
	const advancedContext = useContext(AdvancedVolumeContext);
	const { volumeDetail, setVolumeDetail } = context;
	const { advancedVolumeDetail, setAdvancedVolumeDetail } = advancedContext;
	const { setIsAllocationToggle, isVolumeAllDetail, setIsVolumeAllDetail } = useBucketVolumeStore(
		(state) => state
	);
	const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
	const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
	const [allocation, setAllocation] = useState<any>();
	const [unusedType, setUnusedType] = useState<any>();
	const [errName, setErrName] = useState(true);
	const [backupUnusedBucketList, setBackupUnusedBucketList] = useState<any>([]);

	const server = document?.location?.hostname; // 'nbm-s02.demo.zextras.io';

	const changeVolName = useCallback(
		(e) => {
			setVolumeDetail((prev: any) => ({ ...prev, volumeName: e?.target?.value }));
			setAdvancedVolumeDetail((prev: any) => ({ ...prev, volumeName: e?.target?.value }));
			if (e?.target?.value !== '') {
				setErrName(true);
			} else {
				setErrName(false);
			}
		},
		[setAdvancedVolumeDetail, setVolumeDetail]
	);

	const onVolAllocationChange = (v: any): any => {
		setVolumeDetail((prev: any) => ({ ...prev, volumeAllocation: v }));
		const volumeTypeObject = volAllocationList?.find((item: any) => item?.value === v)?.label;
		setAdvancedVolumeDetail((prev: any) => ({ ...prev, volumeAllocation: volumeTypeObject }));
		if (v === LOCAL_TYPE_VALUE) {
			setToggleNextBtn(true);
		} else {
			setToggleNextBtn(false);
		}
	};

	const onUnusedBucketListChange = (e: any): any => {
		const selectedBucketDetail = isVolumeAllDetail?.filter((item: any) => item?.uuid === e)[0];
		setAdvancedVolumeDetail((prev: any) => ({
			...prev,
			bucketName: selectedBucketDetail?.bucketName,
			unusedBucketType: selectedBucketDetail?.storeType,
			bucketId: selectedBucketDetail?.uuid
		}));
	};

	const getBucketListType = useCallback((): void => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'listBuckets',
			type: 'all',
			targetServer: server,
			showSecrets: true
		}).then((res: any) => {
			const response = JSON.parse(res?.Body?.response?.content);
			if (response?.ok && response?.response?.values?.lenght !== 0) {
				const volUnusedBucketList: any = [];
				const allData = response?.response?.values
					?.filter((items: any) => items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED)
					.map((items: any) => {
						const volumeObject: any = bucketTypeItems?.find(
							(s) => s?.value?.toLowerCase() === items?.storeType?.toLowerCase()
						)?.label;
						volUnusedBucketList.push({
							label: `${volumeObject} | ${items?.label}`,
							value: items?.uuid
						});
						return items;
					});
				setIsVolumeAllDetail(allData);
				setBackupUnusedBucketList(volUnusedBucketList);
			}
		});
	}, [bucketTypeItems, server, setIsVolumeAllDetail]);

	useEffect(() => {
		const volumeTypeObject = volAllocationList?.find(
			(item: any) => item?.value === volumeDetail?.volumeAllocation
		);
		setAllocation(volumeTypeObject);
	}, [volAllocationList, volumeDetail?.volumeAllocation]);

	useEffect(() => {
		if (volumeDetail?.volumeName && volumeDetail?.volumeAllocation) {
			if (volumeDetail?.volumeAllocation === LOCAL_TYPE_VALUE) {
				setCompleteLoading(true);
				setIsAllocationToggle(true);
			} else if (advancedVolumeDetail?.unusedBucketType) {
				setCompleteLoading(true);
				setIsAllocationToggle(false);
			} else {
				setCompleteLoading(false);
				setIsAllocationToggle(true);
			}
		} else {
			setCompleteLoading(false);
			setIsAllocationToggle(true);
		}
	}, [
		advancedVolumeDetail?.unusedBucketType,
		advancedVolumeDetail?.volumeAllocation,
		setCompleteLoading,
		setIsAllocationToggle,
		volumeDetail?.volumeAllocation,
		volumeDetail?.volumeName
	]);

	useEffect(() => {
		const volumeTypeObject = backupUnusedBucketList?.find(
			(item: any) => item?.value === advancedVolumeDetail?.unusedBucketType
		);
		setUnusedType(volumeTypeObject);
	}, [backupUnusedBucketList, advancedVolumeDetail?.unusedBucketType]);

	useEffect(() => {
		getBucketListType();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="server"
						label={t('label.volume_server_name', 'Server')}
						backgroundColor="gray6"
						value={externalData}
						readOnly
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
				<Row padding={{ top: 'large' }} width="100%">
					<Select
						items={volAllocationList}
						background="gray5"
						label={t('label.storage_type', 'Storage Type')}
						showCheckbox={false}
						selection={allocation}
						onChange={onVolAllocationChange}
					/>
				</Row>
				{advancedVolumeDetail?.volumeAllocation !== undefined &&
					volumeDetail?.volumeAllocation !== LOCAL_TYPE_VALUE &&
					backupUnusedBucketList?.length !== 0 && (
						<Row padding={{ top: 'large' }} width="100%">
							<Select
								items={backupUnusedBucketList}
								background="gray5"
								label={t(
									'label.volume_available_unused_Buckets_list_in_backup',
									'Available Buckets List (that are not in use in the backup)'
								)}
								showCheckbox={false}
								selection={unusedType}
								onChange={onUnusedBucketListChange}
							/>
						</Row>
					)}
			</Container>
		</>
	);
};

export default AdvancedMailstoresDefinition;
