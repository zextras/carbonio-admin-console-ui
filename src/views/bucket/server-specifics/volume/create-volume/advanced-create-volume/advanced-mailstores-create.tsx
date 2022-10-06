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
	Padding,
	Switch,
	Text,
	Select,
	Table
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { volumeConfigHeader } from '../../../../../utility/utils';
import { AdvancedVolumeContext } from './create-advanced-volume-context';
import { NO, YES } from '../../../../../../constants';
import logo from '../../../../../../assets/gardian.svg';

const VolumeCreateTable: FC<{
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
						{v?.name}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-center' }}
					>
						{v?.hsmSchedule === '1' ? YES : NO}
					</Row>,
					<Row
						key={i}
						onClick={(): void => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-center' }}
					>
						{v?.indexer === '1' ? YES : NO}
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

const AdvancedMailstoresCreate: FC<{
	onSelection: any;
	externalData: string;
	setCompleteLoading: any;
}> = ({ onSelection, externalData, setCompleteLoading }) => {
	const context = useContext(AdvancedVolumeContext);
	const { t } = useTranslation();
	const volConfigHeader = useMemo(() => volumeConfigHeader(t), [t]);
	// const { advancedVolumeDetail, setAdvancedVolumeDetail } = context;
	const [volumeCreateSelection, setVolumeCreateSelection] = useState(false);

	const volumeCreateList: Array<any> = [
		{
			name: 'servername#1',
			hsmSchedule: '0',
			indexer: '1'
		}
	];

	return (
		<>
			<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
					<Input
						inputName="volumeName"
						label={t('label.volume_name', 'Volume Name')}
						backgroundColor="gray6"
						value="NewVolume#4"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Row width="48.6%" mainAlignment="flex-start">
						<Input
							label={t('label.volume_type', 'Volume Type')}
							backgroundColor="gray6"
							value="Secondary"
							readOnly
						/>
					</Row>
					<Padding horizontal="small" />
					<Row width="48.6%" mainAlignment="flex-start">
						<Input
							label={t('label.current', 'Current')}
							backgroundColor="gray6"
							value="Not current"
							readOnly
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Row width="31.5%" mainAlignment="flex-start">
						<Input
							label={t('label.type', 'Type')}
							backgroundColor="gray6"
							value="Object Storage"
							readOnly
						/>
					</Row>
					<Padding horizontal="small" />
					<Row width="31.5%" mainAlignment="flex-start">
						<Input
							label={t('label.object_storage', 'CurObject Storagerent')}
							backgroundColor="gray6"
							value="hsmBucket | S3"
							readOnly
						/>
					</Row>
					<Padding horizontal="small" />
					<Row width="31.5%" mainAlignment="flex-start">
						<Input
							label={t('label.prefix', 'Prefix')}
							backgroundColor="gray6"
							value="hsms3"
							readOnly
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
					<Input
						inputName="volumeName"
						label={t('label.volume_id', 'Volume ID')}
						backgroundColor="gray6"
						value="1b26f772-301f-448b-9dd9-2dc75a0d326d"
						readOnly
					/>
				</Row>
				<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
					<Text color="gray0">
						{t('label.will_be_centralized_in_helptext', 'Will be centralized in')}
					</Text>
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<VolumeCreateTable
						volumes={volumeCreateList}
						headers={volConfigHeader}
						selectedRows={volumeCreateSelection}
						onSelectionChange={(selected: any): any => {
							setVolumeCreateSelection(selected);
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

export default AdvancedMailstoresCreate;
