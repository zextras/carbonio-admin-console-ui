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
	Text
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { BucketRegions, BucketRegionsInAlibaba, BucketTypeItems } from '../utility/utils';
import { fetchSoap } from '../../services/bucket-service';
import {
	ALIBABA,
	AMAZON_WEB_SERVICE_S3,
	CUSTOM_S3,
	ERROR,
	FAIL,
	HTTP,
	HTTPS,
	SUCCESS,
	V4
} from '../../constants';

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
	const [bucketTypeData, setBucketTypeData] = useState();
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
	const server = document.location.hostname;
	const handleVerifyConnector = (): any => {
		if (bucketName && accessKeyData && secretKey) {
			const storeType = bucketType || bucketTypeData;
			const objectToSend = {
				_jsns: 'urn:zimbraAdmin',
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
					bucketTypeData === AMAZON_WEB_SERVICE_S3 || bucketType === AMAZON_WEB_SERVICE_S3
						? ''
						: urlInput,
				prefix,
				targetServer: server
			};
			if (storeType === CUSTOM_S3) {
				delete objectToSend.region;
			}
			if (prefix === '') {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				delete objectToSend.prefix;
			}

			fetchSoap('zextras', objectToSend).then((res: any) => {
				const response = JSON.parse(res.Body.response.content);
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
						const responseVerifyData = JSON.parse(responseVerify.Body.response.content);
						if (
							responseVerifyData.ok &&
							responseVerifyData.response[server] &&
							responseVerifyData.response[server].ok
						) {
							setVerifyCheck(SUCCESS);
							setBucketDetailButton(true);
							if (isActive) {
								setCompleteLoading(true);
							}
						} else {
							setVerifyCheck(ERROR);
							setverifyFailErr(data);
							setBucketDetailButton(true);
							if (isActive) {
								setCompleteLoading(true);
							}
						}
					});
				} else {
					setBucketDetailButton(false);
					setbothFail(response?.error?.message || response?.error || response?.exception?.message);
					setVerifyCheck(FAIL);
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
		bucketType,
		bucketTypeData,
		prefix,
		prefixConfirm,
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
			setBucketTypeData(volumeObject?.value);
			onSelection({ storeType: bucketTypeData }, false);
			setRegionSelection(
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
			setButtonColor('warning');
			setIcon('alert-triangle');
			setButtonDetail(
				t(
					'label.connection_is_created_verify_connector_fail',
					'CONNECTOR IS CREATED BUT VERIFICATION HAS FAILED'
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
					'CONNECTOR IS NOT CREATED AND VERIFICATION HAS FAILED'
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
	}, [bothFail, createSnackbar, t, verifyCheck, verifyFailErr]);

	return (
		<Container mainAlignment="flex-start" padding={{ horizontal: 'large' }}>
			{bucketType !== '' ? (
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
						items={bucketTypeItems}
						background="gray5"
						label={t('buckets.bucket_type', 'Bucket Type')}
						selection={bucketTypeItems[1]}
						onChange={onSelectBucketTypeChange}
						showCheckbox={false}
						padding={{ right: 'medium' }}
					/>
				</Row>
			)}
			<Row width={'100%'} padding={{ top: 'large' }} mainAlignment="flex-start">
				<Input
					background="gray5"
					label={t('label.label', 'Label')}
					name="label"
					value={bucketLabel}
					onChange={(ev: any): any => {
						setBucketLabel(ev.target.value);
					}}
				/>
			</Row>
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
										? bucketRegionsInAlibaba
										: bucketRegions
								}
								background="gray5"
								label={t('label.region', 'Region')}
								selection={regionSelection}
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
					background="gray5"
					label={t('label.bucket_notes', 'Notes')}
					name="notes"
					value={bucketNotes}
					onChange={(ev: any): any => {
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
					width="100%"
					size="large"
					style={{ width: '100%' }}
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
