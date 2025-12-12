 
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	Divider,
	Icon,
	Input,
	Padding,
	PasswordInput,
	Row,
	Select,
	Table,
	Text,
	useSnackbar} from '@zextras/carbonio-design-system';
import { find, get } from 'lodash';
import { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TestConnectionObjectType } from '../../../types';
import { ALIBABA, AMAZON_WEB_SERVICE_S3, CUSTOM_S3, EMC, ZIMBRA_ADMIN_URN } from '../../constants';
import { fetchSoap } from '../../services/bucket-service';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import CustomHeaderFactory from '../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../app/shared/customTableRowFactory';
import Displayer from '../components/displayer';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';

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
		// eslint-disable-next-line sonarjs/no-duplicate-string
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
	const [t] = useTranslation();
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
					<Text key={i} weight="light">
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
					<Text>{t('label.empty_table', 'Empty Table')}</Text>
				</Row>
			)}
		</Container>
	);
};

const EditBucketDetailPanel: FC<{
	setShowEditDetailView: any;
	title: string;
	setBucketDeleteName: any;
	bucketDetail: any;
	setOpen: any;
	getBucketListType: any;
	setSelectedRow: any;
	setToggleForGetAPICall: any;
	toggleForGetAPICall: any;
}> = ({
	setShowEditDetailView,
	title,
	bucketDetail,
	setBucketDeleteName,
	setOpen,
	getBucketListType,
	setSelectedRow,
	setToggleForGetAPICall,
	toggleForGetAPICall
}) => {
	setSelectedRow(bucketDetail);
	const [t] = useTranslation();
	const [bucketName, setBucketName] = useState(bucketDetail?.bucketName);
	const [bucketLabel, setBucketLabel] = useState(bucketDetail?.label);
	const [bucketNotes, setBucketNotes] = useState(bucketDetail?.notes);

	const [bucketType, setBucketType] = useState<any>();
	const [regionData, setRegionData] = useState(
		bucketDetail?.region !== undefined && bucketDetail?.region
	);
	const [accessKeyData, setAccessKeyData] = useState(bucketDetail?.accessKey);
	const [secretKey, setSecretKey] = useState(bucketDetail?.secret);
	const [urlData, setUrlData] = useState(bucketDetail?.url !== undefined ? bucketDetail?.url : '');
	const [verify, setVerify] = useState('primary');
	// eslint-disable-next-line sonarjs/no-duplicate-string
	const [ButtonLabel, setButtonLabel] = useState(t('label.verify_connector', 'VERIFY CONNECTOR'));
	const [buttonIcon, setButtonIcon] = useState<string>('ActivityOutline');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [previousDetail, setPreviousDetail] = useState<any>({});
	const [showURL, setShowURL] = useState(true);
	const [toggleBtn, setToggleBtn] = useState(false);
	const [checkError, setCheckError] = useState<string>('');
	const createSnackbar = useSnackbar();
	const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
	const bucketRegions = useMemo(() => BucketRegions(t), [t]);
	const bucketRegionsInAlibaba = useMemo(() => BucketRegionsInAlibaba(t), [t]);
	const [modifiedBucketDetails, setModifiedBucketDetails] = useState<any>({
		_jsns: ZIMBRA_ADMIN_URN,
		module: 'ZxCore',
		action: 'doUpdateBucket',
		bucketConfigurationId: bucketDetail?.uuid,
		storeType: bucketDetail?.storeType
	});
	const { selectedServerName } = useBucketVolumeStore((state) => state);

	const verifyConnector = useCallback(() => {
		const objToSendTestConnection: TestConnectionObjectType = {
			_jsns: ZIMBRA_ADMIN_URN,
			module: 'ZxCore',
			action: 'testS3Connection',
			targetServers: selectedServerName,
			bucketId: bucketDetail.uuid
		};

		if (selectedServerName === '') {
			delete objToSendTestConnection?.targetServers;
		}

		fetchSoap('zextras', objToSendTestConnection).then((res) => {
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
				const errorResponse =
					response.error ||
					response.response[selectedServerName]?.error ||
					response.response[selectedServerName]?.error?.message;

				const errorResponsePart = errorResponse.split(bucketDetail.uuid);
				const errorStoreTypeMessage = errorResponsePart[1].replace('as', '');

				setVerify('error');
				setButtonLabel(
					t(
						'label.something_went_wrong_check_data_and_try_again',
						'SOMETHING WENT WRONG. CHECK DATA AND TRY AGAIN'
					)
				);
				setButtonIcon('alert-triangle');
				setCheckError(
					t(
						'label.bucket_verification_failed_message',
						'Verification Failed Could not test bucket configuration. {{bucketType}} not supported for this connection (ID: {{bucketId}})',
						{
							bucketType: errorStoreTypeMessage,
							bucketId: bucketDetail.uuid
						}
					)
				);
				setToggleBtn(false);
			}
		});
	}, [bucketDetail.uuid, selectedServerName, t]);

	useEffect(() => {
		setButtonLabel(t('label.verify_connector', 'VERIFY CONNECTOR'));
		setButtonIcon('ActivityOutline');
		setVerify('primary');
		setToggleBtn(false);
	}, [bucketDetail.uuid, t, bucketDetail]);

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
		latestData.bucketLabel = bucketLabel;
		latestData.regionData = bucketDetail?.region !== undefined && regionData;
		latestData.accessKeyData = accessKeyData;
		latestData.secretKey = secretKey;
		latestData.url = bucketDetail?.url !== undefined ? urlData : '';
		setPreviousDetail(latestData);
		setIsDirty(false);
	};

	const checkIfChanged = useCallback(
		(name: string, newValue: any): void => {
			const currentValue = get(bucketDetail, name);
			if (currentValue !== newValue) {
				setModifiedBucketDetails((prev: any) => ({ ...prev, [name]: newValue }));
			} else {
				setModifiedBucketDetails((current: any) => {
					const copy = { ...current };
					delete copy[name];
					return copy;
				});
			}
		},
		[bucketDetail]
	);
	const onSave = (): void => {
		// API CALL
		fetchSoap('zextras', modifiedBucketDetails).then((res: any) => {
			const updateResData = JSON.parse(res?.Body?.response?.content);
			if (updateResData?.ok) {
				getBucketListType();
				setToggleForGetAPICall(!toggleForGetAPICall);
				setButtonLabel(t('label.verify_connector', 'VERIFY CONNECTOR'));
				setButtonIcon('ActivityOutline');
				setVerify('primary');
				setToggleBtn(false);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('label.changes_have_been_updated', '{{message}}', {
						message: updateResData?.response?.message || updateResData?.message
					}),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				updatePreviousDetail();
				setCheckError('');
			} else {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: t('label.error', '{{message}}', {
						message: updateResData?.error?.message || updateResData?.error
					}),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				setToggleBtn(false);
				setCheckError('');
			}
		});
	};

	const onUndo = (): void => {
		const upperBucketType =
			bucketDetail?.storeType !== EMC
				? bucketDetail.storeType.charAt(0).toUpperCase() +
					bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail?.storeType;
		const bucketTypeValue: any = find(
			bucketTypeItems,
			(o) => o.value?.toLowerCase() === upperBucketType?.toLowerCase()
		);
		previousDetail?.bucketType
			? setBucketType(previousDetail?.bucketType)
			: setBucketType(bucketTypeValue);
		previousDetail?.bucketLabel
			? setBucketLabel(previousDetail?.bucketLabel)
			: setBucketLabel(bucketDetail?.label);
		previousDetail?.bucketName
			? setBucketName(previousDetail?.bucketName)
			: setBucketName(bucketDetail?.bucketName);
		const regionValue: any = find(
			upperBucketType === ALIBABA && bucketDetail?.region !== undefined
				? bucketRegionsInAlibaba
				: bucketRegions,
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
				bucketDetail?.region !== undefined && bucketDetail?.storeType === ALIBABA.toUpperCase()
					? bucketRegionsInAlibaba.find((s) => s.value === e)
					: bucketRegions.find((s) => s.value === e);
			setRegionData(volumeObject);
			checkIfChanged('region', volumeObject?.value);
		},
		[
			bucketDetail?.region,
			bucketDetail?.storeType,
			bucketRegions,
			bucketRegionsInAlibaba,
			checkIfChanged
		]
	);

	const onBucketTypeSelectionChange = useCallback(
		(e: any): void => {
			const volumeObject: any = bucketTypeItems.find((item: any): any => item.value === e);
			setBucketType(volumeObject);
			checkIfChanged('storeType', volumeObject?.value);
		},
		[bucketTypeItems, checkIfChanged]
	);

	useEffect(() => {
		const upperBucketType =
			bucketDetail?.storeType !== EMC && bucketDetail?.storeType !== AMAZON_WEB_SERVICE_S3
				? bucketDetail.storeType.charAt(0).toUpperCase() +
					bucketDetail.storeType.slice(1).toLowerCase()
				: bucketDetail?.storeType;
		const customType =
			bucketDetail?.storeType === CUSTOM_S3 &&
			bucketDetail.storeType.charAt(0).toUpperCase() +
				bucketDetail.storeType.slice(1, 7).toLowerCase() +
				bucketDetail.storeType.charAt(7).toUpperCase() +
				bucketDetail.storeType.slice(8).toLowerCase();
		const bucketTypeValue: any = find(
			bucketTypeItems,
			(o) => o.value === (bucketDetail?.storeType === CUSTOM_S3 ? customType : upperBucketType)
		)?.value;

		if (bucketType !== undefined && bucketTypeValue !== bucketType?.value) {
			setIsDirty(true);
		}
	}, [bucketDetail, bucketDetail.storeType, bucketType, bucketTypeItems]);

	useEffect(() => {
		if (bucketName !== undefined && bucketDetail?.bucketName !== bucketName) {
			setIsDirty(true);
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
				? bucketRegionsInAlibaba
				: bucketRegions,
			(o) => o?.value === bucketDetail?.region
		)?.value;
		if (
			bucketDetail?.region !== undefined &&
			regionData?.value !== undefined &&
			regionValue !== regionData?.value
		) {
			setIsDirty(true);
		}
	}, [
		bucketDetail.region,
		bucketDetail.storeType,
		bucketRegions,
		bucketRegionsInAlibaba,
		regionData
	]);

	useEffect(() => {
		if (bucketLabel !== bucketDetail?.label) {
			setIsDirty(true);
		}
	}, [bucketDetail?.label, bucketLabel]);

	useEffect(() => {
		if (accessKeyData !== undefined && bucketDetail?.accessKey !== accessKeyData) {
			setIsDirty(true);
		}
	}, [bucketDetail?.accessKey, accessKeyData]);

	useEffect(() => {
		if (secretKey !== undefined && bucketDetail?.secret !== secretKey) {
			setIsDirty(true);
		}
	}, [bucketDetail?.secret, secretKey]);

	useEffect(() => {
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (bucketDetail?.url !== undefined) {
			if (bucketDetail?.url !== urlData) {
				setIsDirty(true);
			}
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
				? bucketRegionsInAlibaba
				: bucketRegions,
			(o) => o.value === bucketDetail.region
		);
		const bucketTypeValue: any = find(
			bucketTypeItems,
			(o) => o.value?.toLowerCase() === upperBucketType?.toLowerCase()
		);
		setRegionData(bucketDetail?.region !== undefined && regionValue);
		setBucketType(bucketTypeValue);
	}, [bucketDetail, bucketRegions, bucketRegionsInAlibaba, bucketTypeItems]);

	// useEffect(() => {
	// 	if (bucketDetail.storeType !== '') {
	// 		if (bucketDetail.storeType === undefined) {
	// 			setShowPrefix(false);
	// 		} else {
	// 			setShowPrefix(true);
	// 		}
	// 	}
	// }, [bucketType, bucketDetail]);

	const buttons = [
		{
			align: 'right',
			color: 'error',
			label: t('label.delete', 'delete'),
			onClick: (): void => {
				setBucketDeleteName(bucketDetail);
				setOpen(true);
			}
		}
	];

	return (
		<Container background="gray6">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="4.15rem"
			>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
					<Text size="extralarge" weight="bold">
						{title}
					</Text>
				</Row>
				<Row
					padding={{ all: 'small' }}
					width="50%"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
				>
					<Padding right="small">
						{isDirty && (
							<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
						)}
					</Padding>
					{isDirty && <Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />}
				</Row>
				<Row padding={{ horizontal: 'small' }}>
					<Button
						type="ghost"
						color={'text'}
						icon="CloseOutline"
						onClick={(): any => setShowEditDetailView(false)}
					/>
				</Row>
			</Row>
			<Divider />
			<Displayer buttons={buttons} pinIcon={false} />
			<Container padding={{ all: 'large' }} mainAlignment="flex-start" crossAlignment="flex-start">
				<Row padding={{ top: 'small' }} width="100%">
					<Input
						backgroundColor="gray5"
						label={t('label.bucket_type', 'Bucket Type')}
						inputName="label"
						value={bucketDetail?.storeType || ''}
					/>
				</Row>
				<Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
					<Input
						backgroundColor="gray5"
						label={t('label.label', 'Label')}
						inputName="label"
						value={bucketLabel}
						onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
							setBucketLabel(ev.target.value);
							checkIfChanged(ev.target.name, ev.target.value);
						}}
					/>
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row
						width={bucketDetail?.region !== undefined ? '48%' : '100%'}
						mainAlignment="flex-start"
					>
						<Input
							label={t('label.bucket_name', 'Bucket Name')}
							inputName="bucketName"
							value={bucketName}
							onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
								setBucketName(ev.target.value);
								checkIfChanged(ev.target.name, ev.target.value);
							}}
						/>
					</Row>
					{bucketDetail?.region !== undefined && (
						<>
							<Padding horizontal={'small'} />
							<Row width="48%" mainAlignment="flex-end" padding={{ right: 'medium' }}>
								<Select
									items={
										bucketDetail.storeType === ALIBABA.toUpperCase()
											? bucketRegionsInAlibaba
											: bucketRegions
									}
									background="gray6"
									label={t('label.region', 'Region')}
									onChange={onSelectionChange}
									selection={regionData}
									showCheckbox={false}
								/>
							</Row>
						</>
					)}
				</Row>
				<Row width="100%" padding={{ top: 'large' }}>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							inputName="access_key"
							label={t('label.access_key', 'Access Key')}
							value={accessKeyData}
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setAccessKeyData(e.target.value);
								checkIfChanged(e.target.name, e.target.value);
							}}
						/>
					</Row>
					<Padding horizontal={'small'} />
					<Row width="48%" mainAlignment="flex-end">
						<PasswordInput
							inputName="secret"
							label={t('label.secret_key', 'Secret Key')}
							value={secretKey}
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setSecretKey(e.target.value);
								checkIfChanged(e.target.name, e.target.value);
							}}
						/>
					</Row>
				</Row>
				{showURL && (
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Input
							inputName="url"
							label={t('label.url', 'URL')}
							value={urlData}
							onChange={(e: ChangeEvent<HTMLInputElement>): void => {
								setUrlData(e.target.value);
								checkIfChanged(e.target.name, e.target.value);
							}}
						/>
					</Row>
				)}
				<Row padding={{ top: 'small' }} width="100%">
					<Input
						backgroundColor="gray5"
						label={t('label.prefix', 'Prefix')}
						inputName="label"
						value={bucketDetail?.prefix || ''}
					/>
				</Row>
				<Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
					<Input
						backgroundColor="gray5"
						label={t('label.description', 'Description')}
						value={bucketNotes}
						onChange={(ev: ChangeEvent<HTMLInputElement>): void => {
							setBucketNotes(ev.target.value);
							checkIfChanged(ev.target.name, ev.target.value);
						}}
					/>
				</Row>
				<Row width="100%" padding={{ top: 'large' }} style={{ display: 'block' }}>
					<Button
						type="outlined"
						label={ButtonLabel}
						icon={buttonIcon}
						iconPlacement="right"
						size="large"
						width="fill"
						style={{ width: '100%' }}
						color={verify}
						onClick={verifyConnector}
						disabled={toggleBtn}
					/>
				</Row>
				<Divider color="gray2" />

				{checkError !== '' && (
					<Container
						background="warning"
						width="100%"
						orientation="horizontal"
						height="auto"
						padding={{ all: 'large' }}
						style={{ marginTop: '1rem' }}
					>
						<Row width="10%" mainAlignment="flex-start">
							<Icon
								icon="AlertTriangleOutline"
								color="gray6"
								size="large"
								style={{ height: '2rem', width: '2rem' }}
							/>
						</Row>
						<Row width="86%" mainAlignment="flex-end">
							<Text overflow="break-word" color="gray6">
								{checkError}
							</Text>
						</Row>
					</Container>
				)}
			</Container>
		</Container>
	);
};

export default EditBucketDetailPanel;
