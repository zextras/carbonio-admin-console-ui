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
	Select,
	Input,
	Icon,
	Table,
	useSnackbar
} from '@zextras/carbonio-design-system';

import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import logo from '../../assets/ninja_robo.svg';
import NewBucket from './new-bucket';
import BucketDeleteModel from './delete-bucket-model';
import DetailsPanel from './details-panel';
import { fetchSoap } from '../../services/bucket-service';
import { BucketTypeItems } from '../utility/utils';
import EditBucketDetailPanel from './edit-bucket-details-panel';

const RelativeContainer = styled(Container)`
	position: relative;
`;
const AbsoluteContainer = styled(Container)`
	position: absolute;
	max-width: 630px;
	right: 0;
	z-index: 1;
	box-shadow: 0 0 12px -1px #888;
	top: 0;
`;

const headers = [
	{
		id: 'name',
		label: 'Name',
		width: '90%',
		bold: true
	},
	{
		id: 'type',
		label: 'Type',
		i18nAllLabel: 'All',
		width: '10%',
		align: 'center',
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
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: i,
				columns: [
					// eslint-disable-next-line react/jsx-key
					<Row
						onDoubleClick={(): any => {
							onDoubleClick(i);
						}}
						onClick={(): any => {
							onClick(i);
						}}
						style={{ textAlign: 'left', justifyContent: 'flex-start', textTransform: 'capitalize' }}
					>
						{v.bucketName}
					</Row>,
					// eslint-disable-next-line react/jsx-key
					<Row
						onDoubleClick={(): any => {
							onDoubleClick(i);
						}}
						onClick={(): any => {
							onClick(i);
						}}
						style={{ textAlign: 'center', textTransform: 'capitalize' }}
					>
						{v.storeType}
					</Row>
				],
				clickable: true
			})),
		[onClick, onDoubleClick, volumes]
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
					<Text>Empty Table</Text>
				</Row>
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
	const [bucketList, setBucketList] = useState([]);
	const [connectionData, setConnectionData] = useState();
	const [detailsBucket, setDetailsBucket] = useState(false);
	const [toggleWizardSection, setToggleWizardSection] = useState(false);
	const [open, setOpen] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showEditDetailView, setShowEditDetailView] = useState(false);

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
			type: bucketType,
			targetServer: server,
			showSecrets: true
		}).then((res: any) => {
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				setBucketList(response.response.values);
			} else {
				setBucketList([]);
			}
		});
	}, [bucketType, server]);

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
			const response = JSON.parse(res.response.content);
			if (response.ok) {
				getBucketListType();
				createSnackbar({
					key: 1,
					type: 'success',
					label: t('label.delete_bucket_sucess', 'The {{name}} has removerd', {
						name: bucketDeleteName?.bucketName
					}),
					autoHideTimeout: 2000
				});
				setDetailsBucket(false);
			} else {
				createSnackbar({
					key: 1,
					type: 'error',
					label: t('label.delete_bucket_fail', 'The {{name}} has not removerd', {
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
		setDetailsBucket(true);
		setShowDetails(true);
	};

	useEffect(() => {
		getBucketListType();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [bucketType, toggleWizardSection]);

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
					/>
				</AbsoluteContainer>
			)}
			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto', marginLeft: '16px' }}
				background="white"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('buckets.bucket_list', 'Buckets List')}
					</Text>
				</Row>
				<Divider />
				<Row padding="32px 12px 10px" width="100%">
					<Select
						items={BucketTypeItems}
						background="gray5"
						label={t('buckets.bucket_type', 'Buckets Type')}
						onChange={(e: any): void => {
							const volumeObject: any = BucketTypeItems.find((s) => s.value === e);
							setBucketType(volumeObject.value);
						}}
						showCheckbox={false}
						padding={{ right: 'medium' }}
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
				{bucketType ? (
					<>
						<Row
							width="100%"
							mainAlignment="flex-end"
							orientation="horizontal"
							padding="8px 14px"
							style={{ gap: '8px' }}
						>
							<Button
								type="outlined"
								label={t('label.create_button', 'CREATE')}
								icon="Plus"
								color="primary"
								onClick={(): void => {
									setToggleWizardSection(!toggleWizardSection);
									if (showDetails) setShowDetails(!showDetails);
								}}
							/>
						</Row>
						{bucketList?.length !== 0 && (
							<>
								<Row width="100%" padding="3px 13px">
									<Input
										background="gray5"
										label={t('buckets.filter_buckets_list', 'Filter Buckets List')}
										CustomIcon={(): any => <Icon icon="FunnelOutline" size="large" color="grey" />}
									/>
								</Row>
								<Row padding="16px 14px 0px 14px" width="100%">
									<BucketListTable
										volumes={bucketList}
										selectedRows={bucketselection}
										onSelectionChange={(selected: any): any => {
											setBucketselection(selected);
											const volumeObject: any = bucketList.find(
												(s, index) => index === selected[0]
											);
											setShowDetails(false);
											setBucketDeleteName(volumeObject);
										}}
										onDoubleClick={(i: any): any => {
											handleDoubleClick(i);
											setShowEditDetailView(true);
										}}
										onClick={(i: any): any => {
											handleDoubleClick(i);
											setShowEditDetailView(false);
										}}
									/>
								</Row>
							</>
						)}
					</>
				) : (
					<Container>
						<Text overflow="break-word" weight="normal" size="large">
							<img src={logo} alt="logo" />
						</Text>
						<Padding all="medium" width="47%">
							<Text color="gray1" overflow="break-word" weight="normal" size="large" width="60%">
								{t(
									'select_bucket_or_create_new_bucket',
									"It seems like you haven't setup a bucket type. Click NEW BUCKET button to create a new one."
								)}
							</Text>
						</Padding>
						<Padding all="medium">
							<Text
								size="small"
								overflow="break-word"
								style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
							>
								<Button
									type="outlined"
									label={t('buckets.create_new_bucket', 'NEW BUCKET')}
									icon="Plus"
									color="info"
									onClick={(): void => setToggleWizardSection(!toggleWizardSection)}
								/>
							</Text>
						</Padding>
					</Container>
				)}
			</RelativeContainer>
		</>
	);
};

export default BucketDetailPanel;
