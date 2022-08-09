/* eslint-disable no-shadow */
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
	useSnackbar,
	Select
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { find } from 'lodash';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';
import { fetchSoap } from '../../services/bucket-service';
import { ALIBABA, EMC } from '../../constants';

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
					<Text key={i}>{v.name}</Text>,
					<Text color="text" key={i}>
						{v.version}
					</Text>,
					<Text color="text" key={i}>
						{v.rtstatus}
					</Text>,
					<Text key={i}>{v.type}</Text>,
					<Text color="text" key={i}>
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
			/>
			{tableRows.length === 0 && (
				<Row padding={{ top: 'extralarge', horizontal: 'extralarge' }} width="fill">
					<Text>Empty Table</Text>
				</Row>
			)}
		</Container>
	);
};

const EditBucketDetailPanel: FC<{
	setShowEditDetailView: any;
	title: string;
	bucketDetail: any;
}> = ({ setShowEditDetailView, title, bucketDetail }) => {
	const [t] = useTranslation();
	const [bucketName, setBucketName] = useState(bucketDetail?.bucketName);
	const [bucketType, setBucketType] = useState<any>();
	const [regionData, setRegionData] = useState(
		bucketDetail?.region !== undefined && bucketDetail?.region
	);
	const [accessKeyData, setAccessKeyData] = useState(bucketDetail?.accessKey);
	const [secretKey, setSecretKey] = useState(bucketDetail?.secret);
	const [urlData, setUrlData] = useState(bucketDetail?.url !== undefined && bucketDetail?.url);
	const [verify, setVerify] = useState('primary');
	const [ButtonLabel, setButtonLabel] = useState(t('label.verify_connector', 'VERIFY CONNECTOR'));
	const [buttonIcon, setButtonIcon] = useState<string>('ActivityOutline');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [previousDetail, setPreviousDetail] = useState<any>({});
	const [showURL, setShowURL] = useState(true);
	const createSnackbar = useSnackbar();
	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';

	const verifyConnector = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'testS3Connection',
			targetServers: server,
			bucketId: bucketDetail.uuid
		}).then((res) => {
			const response = JSON.parse(res.response.content);
			if (response.ok && response.response[server] && response.response[server].ok) {
				setVerify('success');
				setButtonLabel(t('label.verify_connector_verified', ' VERIFIED'));
				setButtonIcon('ActivityOutline');
			} else {
				setVerify('error');
				setButtonLabel(t('label.verify_connector_fail', ' VERIFICATION FAILED'));
				setButtonIcon('alert-triangle');
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.verify_error', '{{name}}', {
						name: response.response[server].error
					})
				});
			}
		});
	}, [bucketDetail.uuid, createSnackbar, server, t]);

	useEffect(() => {
		setButtonLabel(t('label.verify_connector', 'VERIFY CONNECTOR'));
		setButtonIcon('ActivityOutline');
		setVerify('primary');
	}, [bucketDetail.uuid, t]);

	useEffect(() => {
		if (bucketDetail?.url !== undefined) {
			setShowURL(true);
		} else {
			setShowURL(false);
		}
	}, [bucketDetail?.url]);

	const updatePreviousDetail = (): void => {
		const latestData: any = {};
		latestData.bucketName = bucketName;
		latestData.regionData = bucketDetail?.region !== undefined && regionData;
		latestData.accessKeyData = accessKeyData;
		latestData.secretKey = secretKey;
		latestData.url = urlData;
		setPreviousDetail(latestData);
		setIsDirty(false);
	};
	const onSave = (): void => {
		// API CALL
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'doUpdateBucket',
			bucketConfigurationId: bucketDetail?.uuid,
			storeType: bucketType?.value,
			bucketName,
			accessKey: accessKeyData,
			secret: secretKey,
			url: bucketDetail?.url !== undefined ? urlData : '',
			region: bucketDetail?.region !== undefined ? regionData.value : '',
			targetServer: server
		}).then((res: any) => {
			const updateResData = JSON.parse(res.response.content);
			if (updateResData.ok) {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('label.changes_have_been_updated', '{{message}}', {
						message: updateResData.response.message
					}),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				updatePreviousDetail();
			} else {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: t('label.error', '{{message}}', {
						message: updateResData.error.message
					}),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		});
	};

	const onUndo = (): void => {
		const upperBucketType =
			bucketDetail.storeType !== EMC
				? bucketDetail.storeType.charAt(0).toUpperCase() +
				  bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail.storeType;
		const bucketTypeValue: any = find(BucketTypeItems, (o) => o.value === upperBucketType);
		previousDetail?.bucketType
			? setBucketType(previousDetail?.bucketType)
			: setBucketType(bucketTypeValue);
		previousDetail?.bucketName
			? setBucketName(previousDetail?.bucketName)
			: setBucketName(bucketName);
		const regionValue: any = find(
			upperBucketType === ALIBABA && bucketDetail?.region !== undefined
				? BucketRegionsInAlibaba
				: BucketRegions,
			(o) => o.value === bucketDetail.region
		);
		bucketDetail?.region !== undefined && previousDetail?.regionData
			? setRegionData(previousDetail?.regionData)
			: setRegionData(regionValue);
		previousDetail?.accessKeyData
			? setAccessKeyData(previousDetail?.accessKeyData)
			: setAccessKeyData(bucketDetail.accessKey);
		previousDetail?.secretKey
			? setSecretKey(previousDetail?.secretKey)
			: setSecretKey(bucketDetail.secret);
		previousDetail?.url ? setUrlData(previousDetail?.url) : setUrlData(bucketDetail.url);
		setIsDirty(false);
	};

	const onSelectionChange = useCallback(
		(e: any): any => {
			const volumeObject =
				bucketDetail?.region !== undefined && bucketDetail.storeType === ALIBABA.toUpperCase()
					? BucketRegionsInAlibaba.find((s) => s.value === e)
					: BucketRegions.find((s) => s.value === e);
			setRegionData(volumeObject);
		},
		[bucketDetail?.region, bucketDetail.storeType]
	);

	const onBucketTypeSelectionChange = useCallback((e: any): void => {
		const volumeObject: any = BucketTypeItems.find((item: any): any => item.value === e);
		setBucketType(volumeObject);
	}, []);

	useEffect(() => {
		const upperBucketType =
			bucketDetail.storeType !== EMC
				? bucketDetail.storeType.charAt(0).toUpperCase() +
				  bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail.storeType;
		const bucketTypeValue: any = find(BucketTypeItems, (o) => o.value === upperBucketType)?.value;
		if (bucketType !== undefined && bucketTypeValue !== bucketType?.value) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [bucketDetail.storeType, bucketType]);

	useEffect(() => {
		if (bucketName !== undefined && bucketDetail?.bucketName !== bucketName) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [bucketDetail?.bucketName, bucketName]);

	useEffect(() => {
		const upperBucketType =
			bucketDetail.storeType !== EMC
				? bucketDetail.storeType.charAt(0).toUpperCase() +
				  bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail.storeType;
		const regionValue: any = find(
			bucketDetail?.region !== undefined && upperBucketType === ALIBABA
				? BucketRegionsInAlibaba
				: BucketRegions,
			(o) => o.value === bucketDetail.region
		)?.value;
		if (
			bucketDetail?.region !== undefined &&
			regionData?.value !== undefined &&
			regionValue !== regionData?.value
		) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [bucketDetail.region, bucketDetail.storeType, regionData]);

	useEffect(() => {
		if (accessKeyData !== undefined && bucketDetail?.accessKey !== accessKeyData) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [bucketDetail?.accessKey, accessKeyData]);

	useEffect(() => {
		if (secretKey !== undefined && bucketDetail?.secret !== secretKey) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [bucketDetail?.secret, secretKey]);

	useEffect(() => {
		if (urlData !== undefined && bucketDetail?.url !== urlData) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [bucketDetail?.url, secretKey, urlData]);

	useEffect(() => {
		const upperBucketType =
			bucketDetail.storeType !== EMC
				? bucketDetail.storeType.charAt(0).toUpperCase() +
				  bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail.storeType;
		const regionValue: any = find(
			bucketDetail?.region !== undefined && upperBucketType === ALIBABA
				? BucketRegionsInAlibaba
				: BucketRegions,
			(o) => o.value === bucketDetail.region
		);
		const bucketTypeValue: any = find(BucketTypeItems, (o) => o.value === upperBucketType);
		setRegionData(bucketDetail?.region !== undefined && regionValue);
		setBucketType(bucketTypeValue);
	}, [bucketDetail]);

	return (
		<Container background="gray6">
			<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
					<Text size="extralarge" weight="bold">
						{title}
					</Text>
				</Row>
				<Row padding={{ horizontal: 'small' }}>
					<IconButton
						icon="CloseOutline"
						color="gray1"
						onClick={(): any => setShowEditDetailView(false)}
					/>
				</Row>
			</Row>
			<Divider />
			<Container
				orientation="horizontal"
				mainAlignment="flex-end"
				crossAlignment="flex-end"
				background="gray6"
				padding={{ all: 'extralarge' }}
				height="85px"
			>
				<Padding right="small">
					{isDirty && (
						<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
					)}
				</Padding>
				{isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
			</Container>
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
				<Row padding={{ top: 'small' }} width="100%">
					<Select
						items={BucketTypeItems}
						background="gray6"
						label={t('buckets.bucket_type', 'Buckets Type')}
						onChange={onBucketTypeSelectionChange}
						selection={bucketType}
						showCheckbox={false}
						padding={{ right: 'medium' }}
					/>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row
						width={bucketDetail?.region !== undefined ? '48%' : '100%'}
						mainAlignment="flex-start"
					>
						<Input
							label={t('label.bucket_name', 'Bucket Name')}
							name="BucketName"
							value={bucketName}
							onChange={(ev: any): any => {
								setBucketName(ev.target.value);
							}}
						/>
					</Row>
					{bucketDetail?.region !== undefined && (
						<>
							<Padding width="4%" />
							<Row width="48%" mainAlignment="flex-end">
								<Select
									items={
										bucketDetail.storeType === ALIBABA.toUpperCase()
											? BucketRegionsInAlibaba
											: BucketRegions
									}
									background="gray6"
									label={t('label.region', 'Region')}
									onChange={onSelectionChange}
									selection={regionData}
									showCheckbox={false}
									padding={{ right: 'medium' }}
								/>
							</Row>
						</>
					)}
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.access_key', 'Access Key')}
							value={accessKeyData}
							onChange={(e: any): void => {
								setAccessKeyData(e.target.value);
							}}
						/>
					</Row>
					<Padding width="4%" />
					<Row width="48%" mainAlignment="flex-end">
						<PasswordInput
							label={t('label.secret_key', 'Secret Key')}
							value={secretKey}
							onChange={(e: any): void => {
								setSecretKey(e.target.value);
							}}
						/>
					</Row>
				</Row>
				{showURL && (
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Input
							label={t('label.url', 'URL')}
							value={urlData}
							onChange={(e: any): void => {
								setUrlData(e.target.value);
							}}
						/>
					</Row>
				)}
				<Row width="100%" padding={{ top: 'large' }}>
					<Button
						type="outlined"
						label={ButtonLabel}
						icon={buttonIcon}
						iconPlacement="right"
						size="fill"
						color={verify}
						onClick={verifyConnector}
					/>
				</Row>

				<Divider color="gray2" />
			</Container>
		</Container>
	);
};

export default EditBucketDetailPanel;
