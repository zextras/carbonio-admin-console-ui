/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Padding,
	PasswordInput,
	Button,
	useSnackbar,
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';
import { fetchSoap } from '../../services/bucket-service';
import { ALIBABA, AMAZON_WEB_SERVICE_S3, ERROR, FAIL, SUCCESS } from '../../constants';

const prefixRegex = /^[A-Za-z0-9_./-]*$/;

const Connection: FC<{
	isActive: any;
	getData: any;
	onSelection: any;
	title: string;
	setVerifyCheck: any;
	verifyCheck: any;
	setButtonChange: any;
	externalData: any;
	setCompleteLoading: any;
}> = ({ isActive, getData, onSelection, title, externalData, setCompleteLoading }) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [buttonColor, setButtonColor] = useState<string>('primary');
	const [icon, setIcon] = useState<string>('ActivityOutline');
	const [buttonDetail, setButtonDetail] = useState(
		t('buckets.connection.create_and_verify_connector', 'CREATE & VERIFY CONNECTOR')
	);

	const [bucketName, setBucketName] = useState('');
	const [accessKeyData, setAccessKeyData] = useState('');
	const [secretKey, setSecretKey] = useState('');
	const [regionsData, setRegionsData] = useState<any>();
	const [urlInput, setUrlInput] = useState('');
	const [prefix, setPrefix] = useState('');
	const [BucketUid, setBucketUid] = useState('');
	const [bucketTypeData, setBucketTypeData] = useState();
	const [verifyCheck, setVerifyCheck] = useState<string>('');
	const [buttonChange, setButtonChange] = useState<boolean>(false);
	const [verifyFailErr, setverifyFailErr] = useState('');
	const [bothFail, setbothFail] = useState('');
	const [bucketDetailButton, setbucketDetailButton] = useState<boolean>(true);
	const [showPrefix, setShowPrefix] = useState(false);
	const [showRegion, setShowRegion] = useState(true);
	const [showURL, setShowURL] = useState(true);
	const [prefixConfirm, setprefixConfirm] = useState(true);
	const [regionSelection, setRegionSelection] = useState<any>(BucketRegions[0]);
	const bucketType = externalData;
	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';
	const handleVerifyConnector = (): any => {
		if (bucketName && accessKeyData && secretKey) {
			fetchSoap('zextras', {
				_jsns: 'urn:zimbraAdmin',
				module: 'ZxCore',
				action: 'doCreateBucket',
				storeType: bucketType || bucketTypeData,
				bucketName,
				accessKey: accessKeyData,
				secret: secretKey,
				region: regionsData?.value,
				url:
					bucketTypeData === ALIBABA ||
					bucketType === ALIBABA ||
					bucketTypeData === AMAZON_WEB_SERVICE_S3 ||
					bucketType === AMAZON_WEB_SERVICE_S3
						? ''
						: urlInput,
				prefix,
				targetServer: server
			}).then((res: any) => {
				const response = JSON.parse(res.response.content);
				if (response.ok) {
					const data = response.response.message;
					const responseData = data.split("'");
					setBucketUid(responseData[1]);
					onSelection({ uuid: responseData[1] }, false);
					fetchSoap('zextras', {
						_jsns: 'urn:zimbraAdmin',
						module: 'ZxCore',
						action: 'testS3Connection',
						targetServers: server,
						bucketId: responseData[1]
					}).then((responseVerify) => {
						const responseVerifyData = JSON.parse(responseVerify.response.content);
						if (
							responseVerifyData.ok &&
							responseVerifyData.response[server] &&
							responseVerifyData.response[server].ok
						) {
							setVerifyCheck(SUCCESS);
							setbucketDetailButton(true);
						} else {
							setVerifyCheck(ERROR);
							setverifyFailErr(data);
							setbucketDetailButton(true);
						}
					});
				} else {
					setbothFail(response.error.message || response.error);
					setVerifyCheck(FAIL);
					setbucketDetailButton(false);
				}
			});
		}
	};

	useEffect(() => {
		if (
			(bucketTypeData === AMAZON_WEB_SERVICE_S3 || bucketType === AMAZON_WEB_SERVICE_S3) &&
			bucketName &&
			regionsData?.value &&
			accessKeyData &&
			secretKey
		) {
			setbucketDetailButton(false);
		} else if (
			(bucketTypeData === ALIBABA || bucketType === ALIBABA) &&
			bucketName &&
			regionsData?.value &&
			accessKeyData &&
			secretKey &&
			urlInput &&
			prefix &&
			prefixConfirm
		) {
			setbucketDetailButton(false);
		} else if (
			bucketTypeData !== AMAZON_WEB_SERVICE_S3 &&
			bucketType !== AMAZON_WEB_SERVICE_S3 &&
			bucketTypeData !== ALIBABA &&
			bucketType !== ALIBABA &&
			bucketName &&
			accessKeyData &&
			secretKey &&
			urlInput &&
			prefix &&
			prefixConfirm
		) {
			setbucketDetailButton(false);
		} else {
			setbucketDetailButton(true);
		}
	}, [
		accessKeyData,
		bucketName,
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
		if (isActive) {
			setCompleteLoading(
				bucketName &&
					regionsData?.value &&
					accessKeyData &&
					secretKey &&
					urlInput &&
					prefix &&
					BucketUid
			);
		}
	}, [
		accessKeyData,
		bucketName,
		isActive,
		regionsData?.value,
		secretKey,
		urlInput,
		prefix,
		setCompleteLoading,
		BucketUid
	]);

	useEffect(() => {
		if (bucketTypeData !== '') {
			if (
				bucketTypeData === undefined ||
				bucketTypeData === AMAZON_WEB_SERVICE_S3 ||
				bucketType === AMAZON_WEB_SERVICE_S3
			) {
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
			}
		}
	}, [bucketType, bucketTypeData]);

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
		if (bucketType !== undefined) {
			const volumeObject: any = BucketTypeItems.find((s) => s.value === bucketType);
			setBucketTypeData(volumeObject?.label);
			onSelection({ storeType: bucketType }, false);
		}
	}, [bucketType, bucketTypeData, onSelection]);

	useEffect(() => {
		setButtonColor('primary');
		setIcon('ActivityOutline');
		setButtonDetail(
			t('buckets.connection.create_and_verify_connector', 'CREATE & VERIFY CONNECTOR')
		);
		setbucketDetailButton(true);
		setBucketName('');
		setAccessKeyData('');
		setSecretKey('');
		setRegionsData('');
		setUrlInput('');
		setPrefix('');
	}, [bucketTypeData, t]);

	const onSelectRegionChange = useCallback(
		(e: any): any => {
			const volumeObject: any =
				bucketType === ALIBABA || bucketTypeData === ALIBABA
					? BucketRegionsInAlibaba.find((s) => s.value === e)
					: BucketRegions.find((s) => s.value === e);
			setRegionsData(volumeObject);
			onSelection({ region: volumeObject?.value }, false);
		},
		[bucketType, bucketTypeData, onSelection]
	);

	const onChangeBucketType = useCallback(
		(v: any): any => {
			const volumeObject: any =
				bucketType === ALIBABA || bucketTypeData === ALIBABA
					? BucketRegionsInAlibaba[0]
					: BucketRegions[0];
			setRegionSelection(volumeObject);
		},
		[bucketType, bucketTypeData]
	);

	useEffect(() => {
		if (verifyCheck === SUCCESS) {
			setButtonColor('success');
			setIcon('CheckmarkCircle2');
			setButtonDetail(
				t('label.connector_is_create_and_verified', 'CONNECTOR IS CREATED AND VERIFIED')
			);
		} else if (verifyCheck === ERROR) {
			setButtonColor('warning');
			setIcon('alert-triangle');
			setButtonDetail(
				t(
					'label.connection_is_created_verify_connector_fail',
					'CONNECTOR IS CREATED BUT VERIFICATION FAILED'
				)
			);
			if (verifyFailErr !== '') {
				createSnackbar({
					key: '1',
					type: 'warning',
					label: t('label.verify_error', '{{name}}', {
						name: verifyFailErr
					}),
					autoHideTimeout: 5000
				});
			}
		} else if (verifyCheck === FAIL) {
			setButtonColor('error');
			setIcon('AlertTriangle');
			setButtonDetail(
				t(
					'label.connector_is_not_created_and_verification_failed',
					'CONNECTOR IS NOT CREATED AND VERIFICATION FAILED'
				)
			);
			createSnackbar({
				key: 1,
				type: 'error',
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
	}, [bothFail, createSnackbar, setButtonChange, t, verifyCheck, verifyFailErr]);

	return (
		<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
			{bucketType !== undefined ? (
				<Row padding={{ top: 'extralarge' }} width="100%">
					<Input
						label={t('label.bucket_type', 'Bucket Type')}
						backgroundColor="gray5"
						value={bucketTypeData}
						readOnly
					/>
				</Row>
			) : (
				<Row padding={{ top: 'extralarge' }} width="100%">
					<Select
						items={BucketTypeItems}
						background="gray5"
						label={t('buckets.bucket_type', 'Bucket Type')}
						onChange={(e: any): void => {
							const volumeObject: any = BucketTypeItems.find((s) => s.value === e);
							setBucketTypeData(volumeObject?.value);
							onSelection({ storeType: bucketTypeData }, false);
							onChangeBucketType(volumeObject);
						}}
						showCheckbox={false}
						padding={{ right: 'medium' }}
					/>
				</Row>
			)}
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width={showRegion ? '48%' : '100%'} mainAlignment="flex-start">
					<Input
						background="gray5"
						label={t('label.bucket_name', 'Bucket Name')}
						name="bucketName"
						value={bucketName}
						onChange={(ev: any): any => {
							setBucketName(ev.target.value);
							onSelection({ bucketName: ev.target.value }, false);
						}}
					/>
				</Row>
				{showRegion && (
					<>
						<Padding width="4%" />
						<Row width="48%" mainAlignment="flex-end">
							<Select
								items={
									bucketTypeData === ALIBABA || bucketType === ALIBABA
										? BucketRegionsInAlibaba
										: BucketRegions
								}
								background="gray5"
								label={t('label.region', 'Region')}
								// selection={regionSelection}
								onChange={onSelectRegionChange}
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
						background="gray5"
						label={t('label.access_key', 'Access Key')}
						name="accessKey"
						value={accessKeyData}
						onChange={(ev: any): any => {
							setAccessKeyData(ev.target.value);
							onSelection({ accessKey: ev.target.value }, false);
						}}
					/>
				</Row>
				<Padding width="4%" />
				<Row width="48%" mainAlignment="flex-end">
					<PasswordInput
						background="gray5"
						label={t('label.secret_key', 'Secret Key')}
						name="secretKey"
						value={secretKey}
						onChange={(ev: any): any => {
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
						name="url"
						value={urlInput}
						onChange={(ev: any): any => {
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
						name="prefix"
						value={prefix}
						onChange={(ev: any): any => {
							setPrefix(ev.target.value);
							if (prefixRegex.test(ev.target.value)) {
								setprefixConfirm(true);
							} else {
								setprefixConfirm(false);
							}
						}}
						hasError={!prefixConfirm}
					/>
					{!prefixConfirm && (
						<Text color="error" overflow="break-word" size="extrasmall">
							{t(
								'buckets.invalid_prefix',
								'Prefix should not contains space, the allowed letters are a-z,A-z and special characters /-.'
							)}
						</Text>
					)}
				</Row>
			)}
			<Row width="100%" padding={{ top: 'large' }}>
				<Button
					type="outlined"
					label={buttonDetail}
					icon={icon}
					iconPlacement="right"
					color={buttonColor}
					width="100%"
					onClick={handleVerifyConnector}
					disabled={bucketDetailButton}
				/>
			</Row>
			{verifyCheck === SUCCESS && (
				<Row width="100%" padding={{ top: 'large' }}>
					<Input label={t('label.uuid', 'uuid')} value={BucketUid} readOnly />
				</Row>
			)}
		</Container>
	);
};

export default Connection;
