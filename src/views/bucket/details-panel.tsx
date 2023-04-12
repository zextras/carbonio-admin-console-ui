/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Input,
	Row,
	IconButton,
	Divider,
	Padding,
	PasswordInput,
	Button,
	Text,
	Table,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { find } from 'lodash';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';
import { fetchSoap } from '../../services/bucket-service';
import { ALIBABA, EMC } from '../../constants';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';

const DetailsHeaders = [
	{
		id: 'service',
		label: 'Service',
		width: '40%',
		bold: true
	},
	{
		id: 'version',
		label: 'Version',
		width: '30%',
		bold: true
	},
	{
		id: 'rtstatus',
		label: 'RT Status',
		width: '30%',
		bold: true
	},
	{
		id: 'type',
		label: 'Type',
		width: '30%',
		bold: true
	},
	{
		id: 'samrtstatus',
		label: 'SmartStaus',
		width: '20%',
		bold: true
	}
];
const serverItems = [
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Stopped',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Enabled',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Stopped',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Enabled',
		type: 'local',
		samrtstatus: 'disbled'
	},
	{
		id: '1',
		name: 'myserver.name',
		version: '4.0.0',
		rtstatus: 'Stopped',
		type: 'local',
		samrtstatus: 'disbled'
	}
];

const ServerListTabel: FC<{ volumes: Array<any>; selectedRows: any; onSelectionChange: any }> = ({
	volumes,
	selectedRows,
	onSelectionChange
}) => {
	const tableRows = useMemo(
		() =>
			volumes.map((v, i) => ({
				id: v.id,
				columns: [
					<Text key={i} weight="light">
						{v.name}
					</Text>,
					<Text color="text" key={i} weight="light">
						{v.version}
					</Text>,
					<Text color="text" key={i} weight="light">
						{v.rtstatus}
					</Text>,
					<Text style={{ textTransform: 'capitalize' }} key={i} weight="light">
						{v.type}
					</Text>,
					<Text color="text" key={i} weight="light">
						{v.samrtstatus}
					</Text>
				],
				clickable: true
			})),
		[volumes]
	);

	return (
		<Container crossAlignment="flex-start">
			<Table
				headers={DetailsHeaders}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
				RowFactory={CustomRowFactory}
				HeaderFactory={CustomHeaderFactory}
			/>
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>Empty Table</Text>
				</Row>
			)}
		</Container>
	);
};

const DetailsPanel: FC<{
	setDetailsBucket: any;
	title: string;
	bucketDetail: any;
	setBucketDeleteName: any;
	setOpen: any;
	setShowEditDetailView: any;
}> = ({
	setDetailsBucket,
	title,
	bucketDetail,
	setBucketDeleteName,
	setOpen,
	setShowEditDetailView
}) => {
	const [t] = useTranslation();
	const [bucketType, setBucketType] = useState();
	const [regionData, setRegionData] = useState();
	const [toggleBtn, setToggleBtn] = useState(false);
	const [verify, setVerify] = useState('primary');
	const [showRegion, setShowRegion] = useState(true);
	const [showURL, setShowURL] = useState(true);
	const [ButtonLabel, setButtonLabel] = useState(t('label.verify_connector', 'VERIFY CONNECTOR'));
	const [buttonIcon, setButtonIcon] = useState<string>('ActivityOutline');
	const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
	const bucketRegions = useMemo(() => BucketRegions(t), [t]);
	const bucketRegionsInAlibaba = useMemo(() => BucketRegionsInAlibaba(t), [t]);

	const createSnackbar = useSnackbar();
	const { selectedServerName } = useBucketVolumeStore((state) => state);

	const verifyConnector = useCallback(() => {
		const objectToSend = {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'testS3Connection',
			targetServers: selectedServerName,
			bucketId: bucketDetail.uuid
		};

		if (selectedServerName === '') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			delete objectToSend?.targetServers;
		}

		fetchSoap('zextras', objectToSend).then((res) => {
			const response = JSON.parse(res.Body.response.content);
			if (
				response.ok ||
				(response.ok === true &&
					response.response[selectedServerName] &&
					response.response[selectedServerName].ok)
			) {
				setVerify('success');
				setButtonLabel(t('label.verify_connector_verified', ' VERIFIED'));
				setButtonIcon('ActivityOutline');
				setToggleBtn(true);
			} else {
				setVerify('error');
				setButtonLabel(t('label.verify_connector_fail', 'VERIFICATION FAILED'));
				setButtonIcon('alert-triangle');
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.verify_error', '{{name}}', {
						name:
							response.error ||
							response.response[selectedServerName]?.error ||
							response.response[selectedServerName]?.error?.message
					})
				});
				setToggleBtn(false);
			}
		});
	}, [bucketDetail.uuid, createSnackbar, selectedServerName, t]);

	useEffect(() => {
		setButtonLabel(t('label.verify_connector', 'VERIFY CONNECTOR'));
		setButtonIcon('ActivityOutline');
		setVerify('primary');
		setToggleBtn(false);
	}, [bucketDetail.uuid, t, bucketDetail]);

	useEffect(() => {
		const upperBucketType =
			bucketDetail.storeType !== EMC
				? bucketDetail.storeType.charAt(0).toUpperCase() +
				  bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail.storeType;
		const volumeObject: any = find(
			bucketTypeItems,
			(o) => o.value?.toLowerCase() === upperBucketType?.toLowerCase()
		)?.label;
		const regionValue: any = find(
			upperBucketType === ALIBABA ? bucketRegionsInAlibaba : bucketRegions,
			(o) => o.value === bucketDetail.region
		)?.label;
		setBucketType(volumeObject);
		setRegionData(regionValue);
	}, [bucketDetail, bucketRegions, bucketRegionsInAlibaba, bucketTypeItems]);

	useEffect(() => {
		if (bucketDetail.region !== undefined) {
			setShowRegion(true);
		} else {
			setShowRegion(false);
		}
	}, [bucketDetail.region]);

	useEffect(() => {
		if (bucketDetail.url !== undefined) {
			setShowURL(true);
		} else {
			setShowURL(false);
		}
	}, [bucketDetail.region, bucketDetail.url]);

	return (
		<Container background="gray6">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="3rem"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
					<Text size="extralarge" weight="bold">
						{title}
					</Text>
				</Row>
				<Row padding={{ horizontal: 'small' }}>
					<IconButton icon="CloseOutline" onClick={(): void => setDetailsBucket(false)} />
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
				<Padding right="large">
					<Container>
						<Button
							type="outlined"
							color="primary"
							icon="EditAsNewOutline"
							size="large"
							onClick={(): void => {
								setShowEditDetailView(true);
							}}
						/>
					</Container>
				</Padding>
				<Container width="fit" height="fit">
					<Button
						type="outlined"
						color="error"
						icon="Trash2Outline"
						size="large"
						onClick={(): void => {
							setBucketDeleteName(bucketDetail);
							setOpen(true);
						}}
					/>
				</Container>
			</Container>
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
				<Row padding={{ top: 'small' }} width="100%">
					<Input label={t('buckets.bucket_type', 'Buckets Type')} value={bucketType} readyOnly />
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input label={t('label.label', 'Label')} value={bucketDetail.label} readOnly />
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.bucket_name', 'Bucket Name')}
						value={bucketDetail.bucketName}
						readOnly
					/>
				</Row>
				{showRegion && (
					<Row padding={{ top: 'large' }} width="100%">
						<Input label="Region" showCheckbox={false} value={regionData} readOnly />
					</Row>
				)}
				<Row width="100%" padding={{ top: 'large' }}>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.access_key', 'Access Key')}
							value={bucketDetail.accessKey}
							readOnly
						/>
					</Row>
					<Padding width="4%" />
					<Row width="48%" mainAlignment="flex-end">
						<PasswordInput
							label={t('label.secret_key', 'Secret Key')}
							value={bucketDetail.secret}
							readOnly
						/>
					</Row>
				</Row>
				{showURL && (
					<Row padding={{ top: 'large' }} width="100%">
						<Input
							label={t('label.url', 'URL')}
							showCheckbox={false}
							value={bucketDetail.url}
							readOnly
						/>
					</Row>
				)}
				<Row padding={{ top: 'large' }} width="100%">
					<Input label={t('label.prefix', 'Prefix')} value={bucketDetail.prefix || ''} readOnly />
				</Row>
				<Row padding={{ top: 'large' }} width="100%">
					<Input label={t('label.notes', 'Notes')} value={bucketDetail.notes || ''} readOnly />
				</Row>
				<Row width="100%" padding={{ top: 'large' }} style={{ display: 'block' }}>
					<Button
						width="100%"
						style={{ width: '100%' }}
						type="outlined"
						label={ButtonLabel}
						icon={buttonIcon}
						iconPlacement="right"
						color={verify}
						onClick={verifyConnector}
						disabled={toggleBtn}
						size="large"
					/>
				</Row>

				<Divider color="gray2" />
			</Container>
		</Container>
	);
};

export default DetailsPanel;
