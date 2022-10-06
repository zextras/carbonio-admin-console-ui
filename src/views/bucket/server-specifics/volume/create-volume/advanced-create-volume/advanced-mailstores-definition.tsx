/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Row, Input, Select, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { volumeAllocationList } from '../../../../../utility/utils';
import { VolumeContext } from '../volume-context';
import { LOCAL_TYPE_VALUE } from '../../../../../../constants';
import { useBucketVolumeStore } from '../../../../../../store/bucket-volume/store';

const AdvancedMailstoresDefinition: FC<{
	externalData: any;
	setCompleteLoading: any;
	setToggleNextBtn: any;
}> = ({ externalData, setToggleNextBtn, setCompleteLoading }) => {
	const { t } = useTranslation();
	const context = useContext(VolumeContext);
	const { volumeDetail, setVolumeDetail } = context;
	const setIsAllocationToggle = useBucketVolumeStore((state) => state.setIsAllocationToggle);
	const volAllocationList = useMemo(() => volumeAllocationList(t), [t]);
	const [allocation, setAllocation] = useState<any>();
	const [errName, setErrName] = useState(true);
	const [errPath, setErrPath] = useState(true);

	const changeVolName = useCallback(
		(e) => {
			setVolumeDetail((prev: any) => ({ ...prev, volumeName: e.target.value }));
			if (e.target.value !== '') {
				setErrName(true);
			} else {
				setErrName(false);
			}
		},
		[setVolumeDetail]
	);

	const changeVolPath = useCallback(
		(e) => {
			setVolumeDetail((prev: object) => ({ ...prev, path: e.target.value }));
			if (e.target.value !== '') {
				setErrPath(true);
			} else {
				setErrPath(false);
			}
		},
		[setVolumeDetail]
	);

	const onVolAllocationChange = (v: any): any => {
		setVolumeDetail((prev: any) => ({ ...prev, volumeAllocation: v }));
		if (v === LOCAL_TYPE_VALUE) {
			setToggleNextBtn(true);
			setIsAllocationToggle(true);
		} else {
			setToggleNextBtn(false);
			setIsAllocationToggle(false);
		}
	};

	useEffect(() => {
		const volumeTypeObject = volAllocationList.find(
			(item: any) => item.value === volumeDetail?.volumeAllocation
		);
		setAllocation(volumeTypeObject);
	}, [volAllocationList, volumeDetail?.volumeAllocation]);

	useEffect(() => {
		if (volumeDetail?.volumeName && volumeDetail?.path && volumeDetail?.volumeAllocation) {
			setCompleteLoading(true);
		} else {
			setCompleteLoading(false);
		}
	}, [
		setCompleteLoading,
		volumeDetail?.path,
		volumeDetail?.volumeAllocation,
		volumeDetail?.volumeName
	]);

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
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
					<Input
						inputName="path"
						label={t('label.volume_path', 'Path')}
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
			</Container>
		</>
	);
};

export default AdvancedMailstoresDefinition;
