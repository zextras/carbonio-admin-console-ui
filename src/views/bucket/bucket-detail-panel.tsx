/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Padding,
	Text,
	Button,
	Row,
	Divider,
	Input,
	Icon,
	Table,
	useSnackbar,
	Tooltip
} from '@zextras/carbonio-design-system';
import { TFunction } from 'i18next';
import { filter } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BucketDeleteModel from './delete-bucket-model';
import EditBucketDetailPanel from './edit-bucket-details-panel';
import NewBucket from './new-bucket';
import { TestConnectionObjectType, objectType } from '../../../types';
import logo from '../../assets/ninja_robo.svg';
import { fetchSoap } from '../../services/bucket-service';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import ModalOverlay from '../components/ModalOverlay';
import ListRow from '../list/list-row';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const headers = (t: TFunction): any => [
	{
		id: 'label',
		label: t('label.label', 'Label'),
		bold: true
	},
	{
		id: 'name',
		label: t('label.bucket_name', 'Name'),
		bold: true
	},
	{
		id: 'type',
		label: t('label.type', 'Type'),
		bold: true
	}
];

const BucketListTable: FC<{
	volumes: objectType[];
	selectedRows: any;
	onSelectionChange: (selected: string[]) => void;
	onDoubleClick: (i: number) => void;
	onClick: (i: number) => void;
}> = ({ volumes, selectedRows, onSelectionChange, onDoubleClick, onClick }) => {
	const [t] = useTranslation();
	const tableRows: any = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i,
				columns: [
					<Tooltip placement="bottom" label={v.notes} key={v.label}>
						<Row
							onDoubleClick={(): void => {
								onDoubleClick(i);
							}}
							onClick={(): void => {
								onClick(i);
							}}
							// eslint-disable-next-line sonarjs/no-duplicate-string
							style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						>
							<Text size="small" weight="regular">
								{v.label}
							</Text>
						</Row>
					</Tooltip>,
					<Tooltip placement="bottom" label={v.notes} key={v.bucketName}>
						<Row
							key={i}
							onDoubleClick={(): void => {
								onDoubleClick(i);
							}}
							onClick={(): void => {
								onClick(i);
							}}
							style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						>
							<Text size="small" weight="light">
								{v.bucketName}
							</Text>
						</Row>
					</Tooltip>,
					<Tooltip placement="bottom" label={v.notes} key={v.storeType}>
						<Row
							key={i}
							onDoubleClick={(): void => {
								onDoubleClick(i);
							}}
							onClick={(): void => {
								onClick(i);
							}}
							style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						>
							<Text size="small" weight="light">
								{v.storeType}
							</Text>
						</Row>
					</Tooltip>
				],
				clickable: true
			})),
		[onClick, onDoubleClick, volumes]
	);

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<ListRow>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					width="fill"
					maxHeight="calc(100vh - 25rem)"
					minHeight="auto"
				>
					<Table
						headers={headers(t)}
						rows={tableRows}
						showCheckbox={false}
						multiSelect={false}
						selectedRows={selectedRows}
						onSelectionChange={onSelectionChange}
						RowFactory={CustomRowFactory}
						HeaderFactory={CustomHeaderFactory}
					/>
				</Container>
			</ListRow>
			{tableRows.length === 0 && (
				<Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '4rem' }}>
					<Text overflow="break-word" weight="regular" size="large">
						<img src={logo} alt="logo" />
					</Text>
					<Padding all="medium" width="30.875rem">
						<Text
							color="gray1"
							overflow="break-word"
							weight="regular"
							size="large"
							style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
						>
							{t(
								'select_bucket_or_create_bucket',
								'It seems like you haven\'t setup a bucket type. \n Click on the "CREATE +" button to create a new one.'
							)}
						</Text>
					</Padding>
				</Container>
			)}
		</Container>
	);
};

const BucketDetailPanel: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [bucketselection, setBucketselection] = useState<string[]>([]);
	const [bucketDeleteName, setBucketDeleteName] = useState<objectType | undefined>({});
	const [bucketType, setBucketType] = useState('');
	const [bucketList, setBucketList] = useState<objectType[]>([]);
	const [allBucketList, setAllBucketList] = useState([]);
	const [connectionData, setConnectionData] = useState<objectType | undefined>();
	const [toggleWizardSection, setToggleWizardSection] = useState(false);
	const [open, setOpen] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [searchBucket, setSearchBucket] = useState('');
	const [showEditDetailView, setShowEditDetailView] = useState(false);
	const [toggleForGetAPICall, setToggleForGetAPICall] = useState(false);
	const [selectedRow, setSelectedRow] = useState<objectType>();

	const closeHandler = (): void => {
		setOpen(false);
		setShowDetails(!showDetails);
	};

	const { selectedServerName } = useBucketVolumeStore((state) => state);

	const getBucketListType = useCallback((): void => {
		const objToSend: {
			_jsns: string;
			module: string;
			action: string;
			type: string;
			showSecrets: boolean;
			targetServer?: string;
		} = {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'listBuckets',
			type: 'all',
			showSecrets: true
		};

		if (selectedServerName !== '') {
			objToSend.targetServer = selectedServerName;
		}

		fetchSoap('zextras', objToSend).then((res: any) => {
			const response = JSON.parse(res.Body.response.content);
			if (response.ok) {
				setBucketList(response.response.values);
				setAllBucketList(response.response.values);
			} else {
				setBucketList([]);
			}
		});
	}, [selectedServerName]);

	const deleteHandler = useCallback(() => {
		// eslint-disable-next-line no-restricted-syntax
		// delete  api call here
		setOpen(false);
		const objectToSendDeleteBucket: TestConnectionObjectType = {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'doDeleteBucket',
			storeType: bucketDeleteName?.storeType,
			bucketConfigurationId: bucketDeleteName?.uuid,
			targetServer: selectedServerName
		};

		if (selectedServerName === '') {
			delete objectToSendDeleteBucket?.targetServers;
		}
		fetchSoap('zextras', objectToSendDeleteBucket).then((res) => {
			const response = JSON.parse(res.Body.response.content);
			if (response.ok) {
				getBucketListType();
				createSnackbar({
					key: '1',
					severity: 'success',
					label: t('label.delete_bucket_sucess', 'The {{name}} has been removed', {
						name: bucketDeleteName?.bucketName
					}),
					autoHideTimeout: 2000
				});
				setShowEditDetailView(false);
			} else {
				createSnackbar({
					key: '1',
					severity: 'error',
					label: t('label.delete_bucket_fail', 'The {{name}} has not been removed', {
						name: bucketDeleteName?.bucketName
					}),
					autoHideTimeout: 2000
				});
			}
		});
	}, [
		bucketDeleteName?.storeType,
		bucketDeleteName?.uuid,
		bucketDeleteName?.bucketName,
		selectedServerName,
		getBucketListType,
		createSnackbar,
		t
	]);
	const handleClick = (i: number): void => {
		const volumeObject: objectType | undefined = bucketList.find((s, index) => index === i);
		setConnectionData(volumeObject);
		setShowEditDetailView(true);
		setShowDetails(true);
	};

	useEffect(() => {
		if (selectedRow !== undefined) {
			const getIndex = bucketList.findIndex((data: objectType) => data.uuid === selectedRow.uuid);
			const volumeObject: objectType | undefined = bucketList.find(
				(s, index) => index === getIndex
			);
			setConnectionData(volumeObject);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bucketList, toggleForGetAPICall]);

	useEffect(() => {
		getBucketListType();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toggleWizardSection]);

	const filterBucketList = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setSearchBucket(e.target.value);
		if (e.target.value !== '') {
			setBucketList(
				filter(
					bucketList,
					(o) =>
						o.bucketName.toLowerCase().includes(e.target.value) ||
						o.label.toLowerCase().includes(e.target.value)
				)
			);
		} else {
			setBucketList(allBucketList);
		}
	};

	return (
		<>
			{toggleWizardSection && (
				<ModalOverlay setOpen={setToggleWizardSection} open={toggleWizardSection}>
					<NewBucket
						setToggleWizardSection={setToggleWizardSection}
						setDetailsBucket={setShowEditDetailView}
						setConnectionData={setConnectionData}
						bucketType={bucketType}
					/>
				</ModalOverlay>
			)}
			{showEditDetailView && (
				<ModalOverlay setOpen={setShowEditDetailView} open={showEditDetailView}>
					<EditBucketDetailPanel
						setBucketDeleteName={setBucketDeleteName}
						setOpen={setOpen}
						setShowEditDetailView={setShowEditDetailView}
						title="Bucket Connection"
						bucketDetail={connectionData}
						getBucketListType={getBucketListType}
						setSelectedRow={setSelectedRow}
						setToggleForGetAPICall={setToggleForGetAPICall}
						toggleForGetAPICall={toggleForGetAPICall}
					/>
				</ModalOverlay>
			)}
			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto' }}
				background="white"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('buckets.bucket_list', 'Buckets List')}
					</Text>
				</Row>
				<Divider />
				<Padding vertical="small" />
				<Row
					width="100%"
					mainAlignment="flex-end"
					style={{ gap: '1rem' }}
					orientation="horizontal"
					padding={{ top: 'extralarge', right: 'large', left: 'large' }}
				>
					<Button
						type="outlined"
						label={t('label.bucket_create_button', 'CREATE')}
						icon="PlusOutline"
						color="primary"
						onClick={(): void => {
							setToggleWizardSection(!toggleWizardSection);
							if (showDetails) setShowDetails(!showDetails);
						}}
					/>
				</Row>
				{bucketDeleteName && (
					<BucketDeleteModel
						open={open}
						closeHandler={closeHandler}
						saveHandler={deleteHandler}
						BucketDetail={bucketDeleteName}
					/>
				)}
				<Row width="100%" padding={{ all: 'large' }}>
					<Input
						disabled={bucketList.length === 0 && searchBucket.length === 0}
						backgroundColor="gray5"
						label={t('buckets.filter_buckets_list', 'Filter Buckets List')}
						CustomIcon={(): JSX.Element => (
							<Icon icon="FunnelOutline" size="large" color="primary" />
						)}
						onChange={filterBucketList}
					/>
				</Row>

				<Row style={{ padding: '0 0.875rem 0 0.875rem' }} width="100%">
					<BucketListTable
						volumes={bucketList}
						selectedRows={bucketselection}
						onSelectionChange={(selected: any): void => {
							setBucketselection(selected);
							const volumeObject: objectType | undefined = bucketList.find(
								(s, index) => index === selected[0]
							);
							setShowDetails(false);
							setBucketDeleteName(volumeObject);
						}}
						onDoubleClick={(i: number): void => {
							handleClick(i);
						}}
						onClick={(i: number): void => {
							handleClick(i);
						}}
					/>
				</Row>
			</RelativeContainer>
		</>
	);
};

export default BucketDetailPanel;
