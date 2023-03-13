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

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { filter, includes } from 'lodash';
import logo from '../../assets/ninja_robo.svg';
import NewBucket from './new-bucket';
import BucketDeleteModel from './delete-bucket-model';
import DetailsPanel from './details-panel';
import { fetchSoap } from '../../services/bucket-service';
import EditBucketDetailPanel from './edit-bucket-details-panel';
import { AbsoluteContainer } from '../components/styled';
import ListRow from '../list/list-row';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const headers = (t: any): Array<object> => [
	{
		id: 'label',
		label: t('label.label', 'Label'),
		bold: true
	},
	{
		id: 'name',
		label: t('label.name', 'Name'),
		bold: true
	},
	{
		id: 'type',
		label: t('label.type', 'Type'),
		bold: true
	}
];

const BucketListTable: FC<{
	volumes: Array<any>;
	selectedRows: any;
	onSelectionChange: any;
	onDoubleClick: any;
	onClick: any;
}> = ({ volumes, selectedRows, onSelectionChange, onDoubleClick, onClick }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i,
				columns: [
					<Tooltip placement="bottom" label={v.notes} key={i}>
						<Row
							onDoubleClick={(): any => {
								onDoubleClick(i);
							}}
							onClick={(): any => {
								onClick(i);
							}}
							style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						>
							{v.label}
						</Row>
					</Tooltip>,
					<Tooltip placement="bottom" label={v.notes} key={i}>
						<Row
							key={i}
							onDoubleClick={(): any => {
								onDoubleClick(i);
							}}
							onClick={(): any => {
								onClick(i);
							}}
							style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						>
							{v.bucketName}
						</Row>
					</Tooltip>,
					<Tooltip placement="bottom" label={v.notes} key={i}>
						<Row
							key={i}
							onDoubleClick={(): any => {
								onDoubleClick(i);
							}}
							onClick={(): any => {
								onClick(i);
							}}
							style={{ textAlign: 'left', justifyContent: 'flex-start' }}
						>
							{v.storeType}
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
					<Text overflow="break-word" weight="normal" size="large">
						<img src={logo} alt="logo" />
					</Text>
					<Padding all="medium" width="30.875rem">
						<Text
							color="gray1"
							overflow="break-word"
							weight="normal"
							size="large"
							width="60%"
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
	const [bucketselection, setBucketselection] = useState([]);
	const [bucketDeleteName, setBucketDeleteName] = useState<object | any>({});
	const [bucketType, setBucketType] = useState('');
	const [bucketList, setBucketList] = useState<Array<object | any>>([]);
	const [allBucketList, setAllBucketList] = useState([]);
	const [connectionData, setConnectionData] = useState();
	const [detailsBucket, setDetailsBucket] = useState(false);
	const [toggleWizardSection, setToggleWizardSection] = useState(false);
	const [open, setOpen] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showEditDetailView, setShowEditDetailView] = useState(false);
	const [toggleForGetAPICall, setToggleForGetAPICall] = useState(false);
	const [selectedRow, setSelectedRow] = useState<any>();

	const closeHandler = (): any => {
		setOpen(false);
		setShowDetails(!showDetails);
	};

	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';

	const getBucketListType = useCallback((): void => {
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
				setAllBucketList(response.response.values);
			} else {
				setBucketList([]);
			}
		});
	}, [server]);

	const deleteHandler = useCallback(() => {
		// eslint-disable-next-line no-restricted-syntax
		// delete  api call here
		setOpen(false);
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'doDeleteBucket',
			storeType: bucketDeleteName?.storeType,
			bucketConfigurationId: bucketDeleteName?.uuid,
			targetServer: server
		}).then((res: any) => {
			const response = JSON.parse(res.Body.response.content);
			if (response.ok) {
				getBucketListType();
				createSnackbar({
					key: 1,
					type: 'success',
					label: t('label.delete_bucket_sucess', 'The {{name}} has been removed', {
						name: bucketDeleteName?.bucketName
					}),
					autoHideTimeout: 2000
				});
				setDetailsBucket(false);
			} else {
				createSnackbar({
					key: 1,
					type: 'error',
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
		server,
		getBucketListType,
		createSnackbar,
		t
	]);
	const handleDoubleClick = (i: any): any => {
		const volumeObject: any = bucketList.find((s, index) => index === i);
		setConnectionData(volumeObject);
		setShowEditDetailView(true);
		setDetailsBucket(false);
		setShowDetails(true);
	};
	const handleClick = (i: any): any => {
		const volumeObject: any = bucketList.find((s, index) => index === i);
		setConnectionData(volumeObject);
		setDetailsBucket(true);
		setShowEditDetailView(false);
		setShowDetails(true);
	};

	useEffect(() => {
		if (selectedRow !== undefined) {
			const getIndex = bucketList.findIndex((data: any) => data.uuid === selectedRow.uuid);
			const volumeObject: any = bucketList.find((s, index) => index === getIndex);
			setConnectionData(volumeObject);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bucketList, toggleForGetAPICall]);

	useEffect(() => {
		getBucketListType();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [toggleWizardSection]);

	const filterBucketList = (e: any): void => {
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
				<AbsoluteContainer orientation="vertical" background="gray5">
					<NewBucket
						setToggleWizardSection={setToggleWizardSection}
						setDetailsBucket={setDetailsBucket}
						setConnectionData={setConnectionData}
						bucketType={bucketType}
					/>
				</AbsoluteContainer>
			)}
			{detailsBucket && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<DetailsPanel
						setDetailsBucket={setDetailsBucket}
						title="Bucket Connection"
						bucketDetail={connectionData}
						setBucketDeleteName={setBucketDeleteName}
						setOpen={setOpen}
						setShowEditDetailView={setShowEditDetailView}
					/>
				</AbsoluteContainer>
			)}
			{showEditDetailView && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<EditBucketDetailPanel
						setShowEditDetailView={setShowEditDetailView}
						title="Bucket Connection"
						bucketDetail={connectionData}
						getBucketListType={getBucketListType}
						setSelectedRow={setSelectedRow}
						setToggleForGetAPICall={setToggleForGetAPICall}
						toggleForGetAPICall={toggleForGetAPICall}
					/>
				</AbsoluteContainer>
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
					orientation="horizontal"
					padding={{ top: 'extralarge', right: 'large', left: 'large' }}
					style={{ gap: '1rem' }}
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
				<Row width="100%" style={{ padding: '1rem 0.813rem' }}>
					<Input
						background="gray5"
						label={t('buckets.filter_buckets_list', 'Filter Buckets List')}
						CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="grey" />}
						onChange={filterBucketList}
					/>
				</Row>
				<Row style={{ padding: '0 0.875rem 0 0.875rem' }} width="100%">
					<BucketListTable
						volumes={bucketList}
						selectedRows={bucketselection}
						onSelectionChange={(selected: any): any => {
							setBucketselection(selected);
							const volumeObject: any = bucketList.find((s, index) => index === selected[0]);
							setShowDetails(false);
							setBucketDeleteName(volumeObject);
						}}
						onDoubleClick={(i: any): any => {
							handleDoubleClick(i);
						}}
						onClick={(i: any): any => {
							handleClick(i);
						}}
					/>
				</Row>
			</RelativeContainer>
		</>
	);
};

export default BucketDetailPanel;
