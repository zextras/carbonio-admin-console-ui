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
	Switch,
	Text,
	Padding,
	Button,
	Table,
	Select
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import logo from '../../../../../../assets/gardian.svg';
import { volumeConfigHeader, volumeTypeList } from '../../../../../utility/utils';

const VolumeConfigTable: FC<{
	volumes: Array<any>;
	selectedRows: any;
	onSelectionChange: any;
	headers: any;
	onClick: any;
}> = ({ volumes, selectedRows, onSelectionChange, headers, onClick }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: v?.id,
				columns: [
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.id}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.name}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start' }}
					>
						{v?.rootpath}
					</Row>
				],
				clickable: true
			})),
		[onClick, volumes]
	);

	return (
		<Container crossAlignment="flex-start">
			<Table
				headers={headers}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
			/>
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text overflow="break-word" weight="normal" size="large">
						<Padding top="extralarge" />
						<Padding top="large" />
						<img src={logo} alt="logo" />
					</Text>
				</Row>
			)}
		</Container>
	);
};

const AdvancedMailstoresConfig: FC<{ externalData: any }> = ({ externalData }) => {
	const context = useContext(AdvancedVolumeContext);
	const { t } = useTranslation();
	const { advancedVolumeDetail, setAdvancedVolumeDetail } = context;
	const volTypeList = useMemo(() => volumeTypeList(t), [t]);
	const volConfigHeader = useMemo(() => volumeConfigHeader(t), [t]);
	const [volumeConfigSelection, setVolumeConfigSelection] = useState(false);

	const changeVolDetail = useCallback(
		(e) => {
			setAdvancedVolumeDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAdvancedVolumeDetail]
	);

	// const changeSwitchOption = useCallback(
	// 	(key: string): void => {
	// 		setVolumeDetail((prev: any) => ({ ...prev, [key]: !volumeDetail[key] }));
	// 	},
	// 	[volumeDetail, setVolumeDetail]
	// );

	const onVolMainChange = (v: any): any => {
		setAdvancedVolumeDetail((prev: any) => ({ ...prev, volumeMain: v }));
	};

	const volumeConfigList: Array<any> = [];
	const mainList: Array<any> = [];
	const eligibleServersList: Array<any> = [
		{
			label: 'servername#1',
			value: '1'
		},
		{
			label: 'anotherservername#2',
			value: '2'
		}
	];

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="server"
						label={t('label.volume_server_name', 'Server')}
						backgroundColor="gray6"
						value={externalData}
						// onChange={changeVolDetail}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="name"
						label={t('label.name', 'Name')}
						value="VolumeName#17"
						backgroundColor="gray5"
						onChange={changeVolDetail}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Select
						items={volTypeList}
						inputName="type"
						label={t('label.type', 'Type')}
						backgroundColor="gray5"
						defaultSelection={volTypeList.find(
							(item: any) => item.value === advancedVolumeDetail?.volumeMain
						)}
						showCheckbox={false}
						onChange={onVolMainChange}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Select
						items={mainList}
						inputName="objectStorage"
						label={t('label.object_storage', 'Object Storage')}
						backgroundColor="gray5"
						defaultSelection={{
							label: 'S3 - hsmBucket',
							value: 1
						}}
						showCheckbox={false}
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						inputName="prefix"
						label={t('label.prefix', 'Prefix')}
						value="S3 - hsmBucket"
						backgroundColor="gray5"
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Select
						items={mainList}
						label={t('label.main', 'Main')}
						inputName="main"
						backgroundColor="gray5"
						defaultSelection={{
							label: 'Secondary',
							value: 1
						}}
						showCheckbox={false}
					/>
				</Row>
				<Row padding={{ top: 'large' }} mainAlignment="flex-start" width="100%">
					<Switch
						value={advancedVolumeDetail?.isCompression}
						label={t('label.enable_current', 'Enable as Current')}
						// onClick={(): any => changeSwitchOption('isCompression')}
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
						value={advancedVolumeDetail?.isCompression}
						label={t('label.storage_centralized', 'I want this Storage to be centralized')}
						// onClick={(): any => changeSwitchOption('isCompression')}
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ left: 'extralarge' }}>
					<Text color="secondary" style={{ whiteSpace: 'pre-line' }}>
						{t(
							'label.storage_centralized_helptext',
							'Centralized data becomes useful when two or more servers need access to the same data. \n By keeping data in one place, it’s easier to manage both the hardware and the data itself. '
						)}
					</Text>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Row width="58%">
						<Select
							items={eligibleServersList}
							inputName="eligibleServers"
							label={t('label.eligible_servers', 'Eligible Servers')}
							backgroundColor="gray5"
							defaultSelection={{
								label: 'servername#1',
								value: 1
							}}
							showCheckbox={false}
						/>
					</Row>
					<Padding horizontal="small" />
					<Row width="16.6%">
						<Button
							label={t('label.link_button', 'LINK')}
							icon="Link2Outline"
							type="outlined"
							width="95px"
							height="44px"
							size="extralarge"
						/>
					</Row>
					<Padding horizontal="small" />
					<Row width="19.9%">
						<Button
							label={t('label.remove_button', 'REMOVE')}
							icon="CloseOutline"
							type="outlined"
							color="error"
							width="124px"
							height="44px"
							size="extralarge"
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<VolumeConfigTable
						volumes={volumeConfigList}
						headers={volConfigHeader}
						selectedRows={volumeConfigSelection}
						onSelectionChange={(selected: any): any => {
							setVolumeConfigSelection(selected);
						}}
						onClick={(i: any): any => {
							// handleClick(i, volumeList?.primaries);
						}}
					/>
				</Row>
			</Container>
		</>
	);
};

export default AdvancedMailstoresConfig;
