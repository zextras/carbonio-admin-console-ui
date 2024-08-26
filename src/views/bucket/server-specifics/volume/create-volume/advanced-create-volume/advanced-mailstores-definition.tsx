/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Container, Row, Input, Select, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { AdvancedVolumeContext } from './create-advanced-volume-context';
import { objectType } from '../../../../../../../types';
import {
	LOCAL_TYPE_VALUE,
	EXTERNAL_TYPE_VALUE,
	UNUSED,
	USAGE_IN_EXTERNAL_BACKUP
} from '../../../../../../constants';
import { fetchSoap } from '../../../../../../services/bucket-service';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';
import { BucketTypeItems, volumeAllocationList } from '../../../../../utility/utils';
import { VolumeContext } from '../volume-context';

const AdvancedMailstoresDefinition: FC<{
	externalData: any;
	setCompleteLoading: (newValue: boolean) => void;
	setToggleNextBtn: (newValue: boolean) => void;
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

	const changeVolName = useCallback(
		(e) => {
			setVolumeDetail((prev: objectType) => ({ ...prev, volumeName: e?.target?.value }));
			setAdvancedVolumeDetail((prev: objectType) => ({ ...prev, volumeName: e?.target?.value }));
			if (e?.target?.value !== '') {
				setErrName(true);
			} else {
				setErrName(false);
			}
		},
		[setAdvancedVolumeDetail, setVolumeDetail]
	);

	const onVolAllocationChange = (v: any): void => {
		setVolumeDetail((prev: objectType) => ({ ...prev, volumeAllocation: v }));
		const volumeTypeObject = volAllocationList?.find(
			(item: { label: string; value?: number }) => item?.value === v
		)?.label;
		setAdvancedVolumeDetail((prev: objectType) => ({
			...prev,
			volumeAllocation: volumeTypeObject
		}));
		if (v === LOCAL_TYPE_VALUE) {
			setToggleNextBtn(true);
		} else {
			setToggleNextBtn(false);
		}
	};

	const onUnusedBucketListChange = (e: any): void => {
		const selectedBucketDetail = isVolumeAllDetail?.filter(
			(item: objectType) => item?.uuid === e
		)[0];
		setAdvancedVolumeDetail((prev: objectType) => ({
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
			showSecrets: true
		}).then((res) => {
			const response = JSON.parse(res?.Body?.response?.content);
			if (response?.ok && response?.response?.values?.lenght !== 0) {
				const volUnusedBucketList: objectType[] = [];
				const allData = response?.response?.values
					?.filter((items: objectType) => items[USAGE_IN_EXTERNAL_BACKUP] === UNUSED)
					.map((items: objectType) => {
						const volumeObject: string | undefined = bucketTypeItems?.find(
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
	}, [bucketTypeItems, setIsVolumeAllDetail]);

	useEffect(() => {
		const volumeTypeObject = volAllocationList?.find(
			(item: { label: string; value?: number }) => item?.value === volumeDetail?.volumeAllocation
		);
		setAllocation(volumeTypeObject);
	}, [volAllocationList, volumeDetail?.volumeAllocation]);

	useEffect(() => {
		if (volumeDetail?.volumeName && volumeDetail?.volumeAllocation) {
			if (volumeDetail?.volumeAllocation === LOCAL_TYPE_VALUE) {
				setCompleteLoading(true);
				setIsAllocationToggle(true);
			} else if (advancedVolumeDetail?.unusedBucketType && backupUnusedBucketList?.length !== 0) {
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
		advancedVolumeDetail.volumeAllocation,
		backupUnusedBucketList?.length,
		setCompleteLoading,
		setIsAllocationToggle,
		volumeDetail?.volumeAllocation,
		volumeDetail?.volumeName
	]);

	useEffect(() => {
		const volumeTypeObject = isVolumeAllDetail?.filter(
			(item: { uuid: string }) => item?.uuid === advancedVolumeDetail?.bucketId
		)[0];
		setUnusedType(volumeTypeObject);
	}, [
		backupUnusedBucketList,
		advancedVolumeDetail?.unusedBucketType,
		advancedVolumeDetail?.bucketId,
		isVolumeAllDetail
	]);

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
					volumeDetail?.volumeAllocation === EXTERNAL_TYPE_VALUE &&
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
