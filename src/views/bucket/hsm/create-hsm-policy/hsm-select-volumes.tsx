/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Text,
	Switch,
	Table,
	Padding,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import ListRow from '../../../list/list-row';
import { HSMContext } from '../hsm-context/hsm-context';

const HSMselectVolumes: FC<any> = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const [t] = useTranslation();
	const context = useContext(HSMContext);
	const { hsmDetail, setHsmDetail } = context;
	const [showSourceVolume, setShowSourceVolume] = useState<boolean>(
		hsmDetail?.sourceVolume.length > 0
	);
	const [showDestinationVolume, setShowDestinationVolume] = useState<boolean>(
		hsmDetail?.destinationVolume.length > 0
	);

	const [volumeRows, setVolumeRows] = useState<Array<any>>([]);
	const [selectedDestinationVolume, setSelectedDestinationVolume] = useState<Array<any>>(
		hsmDetail?.destinationVolume.map((item: any) => item?.id)
	);
	const [selectedSourceVolume, setSelectedSourceVolume] = useState<Array<any>>(
		hsmDetail?.sourceVolume.map((item: any) => item?.id)
	);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const headers = useMemo(
		() => [
			{
				id: 'name',
				label: t('hsm.name', 'Name'),
				width: '25%',
				bold: true
			},
			{
				id: 'allocation',
				label: t('hsm.allocation', 'Allocation'),
				width: '25%',
				bold: true
			},
			{
				id: 'type',
				label: t('hsm.type', 'Type'),
				width: '25%',
				bold: true
			},
			{
				id: 'current',
				label: t('hsm.current', 'Current'),
				width: '25%',
				bold: true
			}
		],
		[t]
	);

	const getVoumeType = useCallback(
		(type: number): string => {
			if (type === 1) {
				return t('hsm.primary', 'Primary');
			}
			if (type === 2) {
				return t('hsm.secondry', 'Secondry');
			}
			return t('hsm.indexes', 'Indexes');
		},
		[t]
	);

	useEffect(() => {
		const volumeList = hsmDetail?.allVolumes;
		if (volumeList && volumeList.length > 0) {
			const allRows = volumeList.map((item: any) => ({
				id: item?.id,
				columns: [
					<Text size="medium" weight="bold" key={item} color="#828282">
						{item?.name}
					</Text>,
					<Text size="medium" weight="bold" key={item} color="#828282">
						{''}
					</Text>,
					<Text size="medium" weight="bold" key={item} color="#828282">
						{getVoumeType(item?.type)}
					</Text>,
					<Text
						size="medium"
						weight="bold"
						key={item}
						color={item?.isCurrent ? '#414141' : '#D74942'}
					>
						{item?.isCurrent ? t('hsm.yes', 'Yes') : t('hsm.no', 'No')}
					</Text>
				]
			}));
			setVolumeRows(allRows);
		} else {
			setVolumeRows([]);
		}
	}, [hsmDetail?.allVolumes, getVoumeType, t]);

	useEffect(() => {
		if (Array.isArray(hsmDetail?.allVolumes)) {
			const sourceVol = hsmDetail?.allVolumes?.filter((item: any) =>
				selectedSourceVolume?.includes(item?.id)
			);
			if (sourceVol) {
				setHsmDetail((prev: any) => ({
					...prev,
					sourceVolume: sourceVol
				}));
			}
		}
	}, [hsmDetail?.allVolumes, selectedSourceVolume, setHsmDetail]);

	useEffect(() => {
		if (Array.isArray(hsmDetail?.allVolumes)) {
			const destVol = hsmDetail?.allVolumes?.filter((item: any) =>
				selectedDestinationVolume?.includes(item?.id)
			);
			if (destVol) {
				setHsmDetail((prev: any) => ({
					...prev,
					destinationVolume: destVol
				}));
			}
		}
	}, [hsmDetail?.allVolumes, selectedDestinationVolume, setHsmDetail]);

	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			height="calc(100vh - 300px)"
			background="white"
			style={{ overflow: 'auto', padding: '16px' }}
		>
			<ListRow>
				<Padding bottom="large">
					<Text size="medium" weight="bold" color="gray0">
						{<Trans i18nKey="hsm.source_volume" defaults="Source Volume" />}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					<Text
						size="medium"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						color="secondary"
						style={{ 'white-space': 'normal' }}
					>
						{t(
							'hsm.all_primary_volume_used_source_msg',
							'All primary volumes will be used as source by default. Or select manually other volumes.'
						)}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					<Switch
						label={t('hsm.select_manually_source_volumes', 'Select manually source volumes')}
						value={showSourceVolume}
						onClick={(): void => {
							setShowSourceVolume(!showSourceVolume);
						}}
					/>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					{showSourceVolume && (
						<Table
							rows={volumeRows}
							headers={headers}
							selectedRows={selectedSourceVolume}
							onSelectionChange={(selected: any): void => {
								const available = selectedDestinationVolume.filter((item: any) =>
									selected?.includes(item)
								);
								if (available.length > 0) {
									createSnackbar({
										key: 'error',
										type: 'error',
										label: t(
											'hsm.volume_already_selected_in_destination',
											'Volume already selected in destination volume'
										),
										autoHideTimeout: 3000,
										hideButton: true,
										replace: true
									});
								} else {
									setSelectedSourceVolume(selected);
								}
							}}
						/>
					)}
				</Padding>
			</ListRow>

			<ListRow>
				<Padding bottom="large">
					<Text size="medium" weight="bold" color="gray0">
						{<Trans i18nKey="hsm.destination_volume" defaults="Destination Volume" />}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					<Text
						size="medium"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						color="secondary"
						style={{ 'white-space': 'normal' }}
					>
						{t(
							'hsm.all_secondary_volume_used_source_msg',
							'The current secondary volume will be used as a destination. Or select manually other volumes.'
						)}
					</Text>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					<Switch
						label={t(
							'hsm.select_manually_destination_volumes',
							'Select manually destination volumes'
						)}
						value={showDestinationVolume}
						onClick={(): void => {
							setShowDestinationVolume(!showDestinationVolume);
						}}
					/>
				</Padding>
			</ListRow>
			<ListRow>
				<Padding bottom="large">
					{showDestinationVolume && (
						<Table
							rows={volumeRows}
							headers={headers}
							showCheckbox={false}
							multiSelect={false}
							selectedRows={selectedDestinationVolume}
							onSelectionChange={(selected: any): void => {
								const available = selectedSourceVolume.filter((item: any) =>
									selected?.includes(item)
								);
								if (available.length > 0) {
									createSnackbar({
										key: 'error',
										type: 'error',
										label: t(
											'hsm.volume_already_selected_in_source',
											'Volume already selected in source volume'
										),
										autoHideTimeout: 3000,
										hideButton: true,
										replace: true
									});
								} else {
									setSelectedDestinationVolume(selected);
								}
							}}
						/>
					)}
				</Padding>
			</ListRow>
		</Container>
	);
};

export default HSMselectVolumes;
