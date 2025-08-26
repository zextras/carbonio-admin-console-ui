/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState, useMemo } from 'react';

import {
	Container,
	Input,
	Row,
	Select,
	Padding,
	PasswordInput,
	Button,
	useSnackbar,
	Text,
	Icon
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { TestConnectionObjectType } from '../../../types';
import {
	ALIBABA,
	AMAZON_WEB_SERVICE_S3,
	CUSTOM_S3,
	ERROR,
	FAIL,
	HTTP,
	HTTPS,
	SUCCESS,
	V4,
	ZIMBRA_ADMIN_URN
} from '../../constants';
import { fetchSoap } from '../../services/bucket-service';
import { useBucketVolumeStore } from '../../store/bucket-volume/store';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';

const prefixRegex = /^[A-Za-z0-9_./-]*$/;

const Connection: FC<{
	isActive: any;
	onSelection: any;
	externalData: any;
	setCompleteLoading: any;
}> = ({ isActive, onSelection, externalData, setCompleteLoading }) => {
	const [t] = useTranslation();
	const bucketTypeItems = useMemo(() => BucketTypeItems(t), [t]);
	const bucketRegions = useMemo(() => BucketRegions(t), [t]);
	const bucketRegionsInAlibaba = useMemo(() => BucketRegionsInAlibaba(t), [t]);
	const createSnackbar = useSnackbar();
	const [buttonColor, setButtonColor] = useState<string>('primary');
	const [icon, setIcon] = useState<string>('ActivityOutline');
	const [buttonDetail, setButtonDetail] = useState(
		// eslint-disable-next-line sonarjs/no-duplicate-string
		t('buckets.connection.create_and_verify_connector', 'CREATE & VERIFY CONNECTOR')
	);
	const [bucketName, setBucketName] = useState('');
	const [bucketLabel, setBucketLabel] = useState('');
	const [bucketNotes, setBucketNotes] = useState('');
	const [accessKeyData, setAccessKeyData] = useState('');
	const [secretKey, setSecretKey] = useState('');
	const [regionsData, setRegionsData] = useState<any>();
	const [urlInput, setUrlInput] = useState('');
	const [prefix, setPrefix] = useState('');
	const [BucketUid, setBucketUid] = useState('');
	const [bucketTypeData, setBucketTypeData] = useState<string | undefined>(
		bucketTypeItems[1]?.value
	);
	const [verifyCheck, setVerifyCheck] = useState<string>('');
	const [verifyFailErr, setverifyFailErr] = useState('');
	const [bothFail, setbothFail] = useState('');
	const [bucketDetailButton, setBucketDetailButton] = useState<boolean>(true);
	const [showPrefix, setShowPrefix] = useState(false);
	const [showRegion, setShowRegion] = useState(true);
	const [showURL, setShowURL] = useState(true);
	const [prefixConfirm, setprefixConfirm] = useState(true);
	const [regionSelection, setRegionSelection] = useState<any>(bucketRegions[0]);
	const bucketType = externalData;
	const { selectedServerName } = useBucketVolumeStore((state) => state);
	// eslint-disable-next-line sonarjs/cognitive-complexity
	const handleVerifyConnector = (): any => {
		if (bucketName && accessKeyData && secretKey) {
			const storeType = bucketType || bucketTypeData;
			const objectToSend: TestConnectionObjectType = {
				_jsns: ZIMBRA_ADMIN_URN,
				module: 'ZxCore',
				action: 'doCreateBucket',
				storeType,
				bucketName,
				label: bucketLabel,
				notes: bucketNotes,
				accessKey: accessKeyData,
				secret: secretKey,
				region: regionsData?.value,
				signatureVersion: V4,
				protocol: urlInput.startsWith(HTTPS) ? HTTPS : HTTP,
				url:
					bucketTypeData === AMAZON_WEB_SERVICE_S3 ||
					bucketType === AMAZON_WEB_SERVICE_S3 ||
					bucketTypeData === ALIBABA ||
					bucketType === ALIBABA
						? ''
						: urlInput,
				prefix,
				targetServer: selectedServerName
			};
			if (storeType === CUSTOM_S3) {
				delete objectToSend.region;
			}
			if (prefix === '') {
				delete objectToSend.prefix;
			}
			if (selectedServerName === '') {
				delete objectToSend?.targetServers;
			}

			fetchSoap('zextras', objectToSend).then((res: any) => {
				const response = JSON.parse(res.Body.response.content);
				if (response.ok) {
					const data = response.response.message;
					const responseData = data.split("'");
					setBucketUid(responseData[1]);
					onSelection({ uuid: responseData[1] }, false);
					const objToSendTestConnection: TestConnectionObjectType = {
						_jsns: ZIMBRA_ADMIN_URN,
						module: 'ZxCore',
						action: 'testS3Connection',
						targetServers: selectedServerName,
						bucketId: responseData[1]
					};

					if (selectedServerName === '') {
						delete objToSendTestConnection?.targetServers;
					}

					fetchSoap('zextras', objToSendTestConnection).then((responseVerify) => {
						const responseVerifyData = JSON.parse(responseVerify.Body.response.content);
						if (
							responseVerifyData.ok &&
							responseVerifyData.response[selectedServerName] &&
							responseVerifyData.response[selectedServerName].ok
						) {
							setVerifyCheck(SUCCESS);
							setBucketDetailButton(true);
							if (isActive) {
								setCompleteLoading(true);
							}
						} else {
							const errorResponse = responseVerifyData?.error;

							const errorResponsePart = errorResponse.split(objToSendTestConnection?.bucketId);
							const errorStoreTypeMessage = errorResponsePart[1].replace('as', '');

							setVerifyCheck(ERROR);
							setverifyFailErr(
								t(
									'label.bucket_verification_failed_message',
									'Verification Failed Could not test bucket configuration. {{bucketType}} not supported for this connection (ID: {{bucketId}})',
									{
										bucketType: errorStoreTypeMessage,
										bucketId: objToSendTestConnection?.bucketId
									}
								)
							);
							setBucketDetailButton(true);
							if (isActive) {
								setCompleteLoading(true);
							}
						}
					});
				} else {
					setBucketDetailButton(false);
					setbothFail(
						response?.error?.message ||
							response?.error ||
							response?.exception?.message ||
							response.response[selectedServerName].error.message
					);
					setVerifyCheck(FAIL);
				}
			});
		}
	};

	useEffect(() => {
		if (regionsData === undefined) {
			const volumeObject =
				bucketType === ALIBABA || bucketTypeData === ALIBABA
					? bucketRegionsInAlibaba[0]
					: bucketRegions[0];
			setRegionsData(volumeObject);
		}

		if (
			(bucketTypeData === AMAZON_WEB_SERVICE_S3 || bucketType === AMAZON_WEB_SERVICE_S3) &&
			bucketName &&
			regionsData?.value &&
			accessKeyData &&
			secretKey
		) {
			setBucketDetailButton(false);
		} else if (
			(bucketTypeData === ALIBABA || bucketType === ALIBABA) &&
			bucketName &&
			regionsData?.value &&
			accessKeyData &&
			secretKey &&
			urlInput &&
			prefixConfirm
		) {
			setBucketDetailButton(false);
		} else if (
			bucketTypeData !== AMAZON_WEB_SERVICE_S3 &&
			bucketType !== AMAZON_WEB_SERVICE_S3 &&
			bucketTypeData !== ALIBABA &&
			bucketType !== ALIBABA &&
			bucketName &&
			accessKeyData &&
			secretKey &&
			urlInput &&
			prefixConfirm
		) {
			setBucketDetailButton(false);
		} else {
			setBucketDetailButton(true);
		}
	}, [
		accessKeyData,
		bucketName,
		bucketRegions,
		bucketRegionsInAlibaba,
		bucketType,
		bucketTypeData,
		prefix,
		prefixConfirm,
		regionsData,
		regionsData?.value,
		secretKey,
		urlInput
	]);
	useEffect(() => {
		setCompleteLoading(false);
	}, [setCompleteLoading]);

	useEffect(() => {
		if (bucketTypeData !== '') {
			if (bucketTypeData === undefined) {
				setShowPrefix(false);
			} else {
				setShowPrefix(true);
			}
		}
	}, [bucketType, bucketTypeData, prefix]);

	useEffect(() => {
		if (bucketTypeData !== '') {
			if (
				bucketTypeData === undefined ||
				bucketTypeData === ALIBABA ||
				bucketType === ALIBABA ||
				bucketTypeData === AMAZON_WEB_SERVICE_S3 ||
				bucketType === AMAZON_WEB_SERVICE_S3
			) {
				setShowRegion(true);
			} else {
				setShowRegion(false);
				regionsData.value = '';
			}
		}
	}, [bucketType, bucketTypeData, regionsData]);

	useEffect(() => {
		if (
			bucketTypeData === undefined ||
			(bucketTypeData !== AMAZON_WEB_SERVICE_S3 && bucketType !== AMAZON_WEB_SERVICE_S3)
		) {
			setShowURL(true);
		} else {
			setShowURL(false);
		}
	}, [bucketType, bucketTypeData, showURL]);

	useEffect(() => {
		if (bucketType !== '') {
			const volumeObject: any = bucketTypeItems.find((s: any) => s.value === bucketType);
			setBucketTypeData(volumeObject?.label);
			onSelection({ storeType: bucketType }, false);
		}
	}, [bucketType, bucketTypeData, bucketTypeItems, onSelection]);

	useEffect(() => {
		setButtonColor('primary');
		setIcon('ActivityOutline');
		setButtonDetail(
			t('buckets.connection.create_and_verify_connector', 'CREATE & VERIFY CONNECTOR')
		);
		setBucketDetailButton(true);
		setBucketName('');
		setAccessKeyData('');
		setSecretKey('');
		setUrlInput('');
		setPrefix('');
	}, [bucketTypeData, t]);

	const onSelectBucketTypeChange = useCallback(
		(e: any): void => {
			const volumeObject: any = bucketTypeItems.find((s: any) => s.value === e);
			setVerifyCheck('');
			setBucketTypeData(volumeObject?.value);
			onSelection({ storeType: bucketTypeData }, false);
			setRegionSelection(
				bucketType === ALIBABA || volumeObject?.value === ALIBABA
					? bucketRegionsInAlibaba[0]
					: bucketRegions[0]
			);
			setRegionsData(
				bucketType === ALIBABA || volumeObject?.value === ALIBABA
					? bucketRegionsInAlibaba[0]
					: bucketRegions[0]
			);
		},
		[
			bucketRegions,
			bucketRegionsInAlibaba,
			bucketType,
			bucketTypeData,
			bucketTypeItems,
			onSelection
		]
	);

	const onSelectRegionChange = useCallback(
		(e: any): any => {
			const volumeObject: any =
				bucketType === ALIBABA || bucketTypeData === ALIBABA
					? bucketRegionsInAlibaba.find((s: any) => s.value === e)
					: bucketRegions.find((s: any) => s.value === e);
			setRegionsData(volumeObject);
			setRegionSelection(volumeObject);
			onSelection({ region: volumeObject?.value }, false);
		},
		[bucketRegions, bucketRegionsInAlibaba, bucketType, bucketTypeData, onSelection]
	);

	useEffect(() => {
		if (verifyCheck === SUCCESS) {
			setButtonColor('success');
			setIcon('CheckmarkCircle2');
			setButtonDetail(
				t('label.connector_is_create_and_verified', 'CONNECTOR IS CREATED AND VERIFIED')
			);
		} else if (verifyCheck === ERROR) {
			setButtonColor('error');
			setIcon('AlertTriangle');
			setButtonDetail(
				t(
					'label.connection_is_created_verify_connector_fail',
					'CONNECTOR IS CREATED BUT VERIFICATION HAS FAILED'
				)
			);
		} else if (verifyCheck === FAIL) {
			setButtonColor('error');
			setIcon('AlertTriangle');
			setButtonDetail(
				t(
					'label.connector_is_not_created_and_verification_failed',
					'CONNECTOR IS NOT CREATED AND VERIFICATION HAS FAILED'
				)
			);
			createSnackbar({
				key: '1',
				severity: 'error',
				label: t('label.verify_error', '{{name}}', {
					name: bothFail
				}),
				autoHideTimeout: 5000
			});
		} else {
			setButtonColor('primary');
			setIcon('ActivityOutline');
			setButtonDetail(
				t('buckets.connection.create_and_verify_connector', 'CREATE & VERIFY CONNECTOR')
			);
		}
	}, [bothFail, createSnackbar, t, verifyCheck, verifyFailErr]);

	return (
		<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
			{bucketType !== '' ? (
				<Row padding={{ top: 'extralarge' }} width="100%">
					<Input
						label={t('label.bucket_type', 'Bucket Type')}
						backgroundColor="gray5"
						value={bucketTypeData}
					/>
				</Row>
			) : (
				<Row padding={{ top: 'extralarge' }} width="100%">
					<Select
						items={bucketTypeItems}
						background="gray5"
						label={t('buckets.bucket_type', 'Bucket Type')}
						// defaultSelection={bucketTypeItems?.filter((items) => items?.value === bucketTypeData)}
						defaultSelection={bucketTypeItems[0]}
						onChange={onSelectBucketTypeChange}
						showCheckbox={false}
					/>
				</Row>
			)}
			<Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
				<Input
					backgroundColor="gray5"
					label={t('label.label', 'Label')}
					value={bucketLabel}
					onChange={(ev): void => {
						setBucketLabel(ev.target.value);
					}}
				/>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width={showRegion ? '48%' : '100%'} mainAlignment="flex-start">
					<Input
						backgroundColor="gray5"
						label={t('label.bucket_name', 'Bucket Name')}
						value={bucketName}
						onChange={(ev): void => {
							setBucketName(ev.target.value);
							onSelection({ bucketName: ev.target.value }, false);
						}}
					/>
				</Row>
				{showRegion && (
					<>
						<Padding horizontal={'small'} />
						<Row width="48%" mainAlignment="flex-end">
							<Select
								items={
									bucketTypeData === ALIBABA || bucketType === ALIBABA
										? bucketRegionsInAlibaba
										: bucketRegions
								}
								background="gray5"
								label={t('label.region', 'Region')}
								selection={regionSelection}
								onChange={onSelectRegionChange}
								showCheckbox={false}
							/>
						</Row>
					</>
				)}
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<Input
						backgroundColor="gray5"
						label={t('label.access_key', 'Access Key')}
						value={accessKeyData}
						onChange={(ev): void => {
							setAccessKeyData(ev.target.value);
							onSelection({ accessKey: ev.target.value }, false);
						}}
					/>
				</Row>
				<Padding horizontal={'small'} />
				<Row width="48%" mainAlignment="flex-end">
					<PasswordInput
						backgroundColor="gray5"
						label={t('label.secret_key', 'Secret Key')}
						value={secretKey}
						onChange={(ev): void => {
							setSecretKey(ev.target.value);
							onSelection({ secret: ev.target.value }, false);
						}}
					/>
				</Row>
			</Row>
			{showURL && (
				<Row padding={{ top: 'large' }} width="100%">
					<Input
						label={t('label.url', 'URL')}
						backgroundColor="gray5"
						value={urlInput}
						onChange={(ev): void => {
							setUrlInput(ev.target.value);
						}}
					/>
				</Row>
			)}
			{showPrefix && (
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="flex-start">
					<Input
						label={t('label.prefix', 'Prefix')}
						backgroundColor="gray5"
						value={prefix}
						onChange={(ev): void => {
							setPrefix(ev.target.value);
							if (ev.target.value !== '') {
								if (prefixRegex.test(ev.target.value)) {
									setprefixConfirm(true);
								} else {
									setprefixConfirm(false);
								}
							} else {
								setprefixConfirm(true);
							}
						}}
						hasError={!prefixConfirm}
					/>
					{!prefixConfirm && (
						<Padding top="extrasmall">
							<Text color="error" overflow="break-word" size="extrasmall">
								{t(
									'buckets.invalid_prefix',
									'The prefix should not contain spaces. The allowed letters are a-z, A-Z, and special characters /-.'
								)}
							</Text>
						</Padding>
					)}
				</Row>
			)}
			<Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
				<Input
					backgroundColor="gray5"
					label={t('label.description', 'Description')}
					value={bucketNotes}
					onChange={(ev): void => {
						setBucketNotes(ev.target.value);
					}}
				/>
			</Row>
			<Row width="100%" padding={{ top: 'large' }} style={{ display: 'block' }}>
				<Button
					type="outlined"
					label={buttonDetail}
					icon={icon}
					iconPlacement="right"
					color={buttonColor}
					width="fill"
					size="large"
					style={{ width: '100%' }}
					onClick={handleVerifyConnector}
					disabled={bucketDetailButton}
				/>
			</Row>
			{verifyCheck === SUCCESS && (
				<Row width="100%" padding={{ top: 'large' }}>
					<Input label={t('label.uuid', 'uuid')} value={BucketUid} />
				</Row>
			)}
			{verifyCheck === ERROR && (
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
							{verifyFailErr}
						</Text>
					</Row>
				</Container>
			)}
		</Container>
	);
};

export default Connection;
