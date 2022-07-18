/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Padding,
	PasswordInput,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { BucketRegions, BucketTypeItems } from '../utility/utils';
import { fetchSoap } from '../../services/bucket-service';

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

	const [bucketName, setBucketName] = useState();
	const [accessKeyData, setAccessKeyData] = useState();
	const [secretKey, setSecretKey] = useState();
	const [regionsData, setRegionsData] = useState();
	const [BucketUid, setBucketUid] = useState('');
	const [bucketTypeData, setBucketTypeData] = useState();
	const [verifyCheck, setVerifyCheck] = useState<string>('');
	const [buttonChange, setButtonChange] = useState<boolean>(false);
	const [verifyFailErr, setverifyFailErr] = useState('');
	const [bothFail, setbothFail] = useState('');
	const [bucketDetailButton, setbucketDetailButton] = useState<boolean>(false);
	const bucketType = externalData;
	const server = document.location.hostname; // 'nbm-s02.demo.zextras.io';
	const handleVerifyConnector = (): any => {
		// API CALL
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxCore',
			action: 'doCreateBucket',
			storeType: bucketType || bucketTypeData,
			bucketName,
			accessKey: accessKeyData,
			secret: secretKey,
			region: regionsData,
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
						setVerifyCheck('successWithVerify');
						setbucketDetailButton(true);
					} else {
						setVerifyCheck('errorOnVerify');
						setverifyFailErr(data);
						setbucketDetailButton(true);
					}
				});
			} else {
				setbothFail(response.error.message || response.error);
				setVerifyCheck('fail');
				setbucketDetailButton(false);
			}
		});
	};
	useEffect(() => {
		if (bucketName && accessKeyData && secretKey) {
			setbucketDetailButton(false);
		} else {
			setbucketDetailButton(true);
		}
	}, [accessKeyData, bucketName, secretKey]);

	useEffect(() => {
		if (isActive) {
			setCompleteLoading(bucketName && regionsData && accessKeyData && secretKey && BucketUid);
		}
	}, [accessKeyData, bucketName, isActive, regionsData, secretKey, setCompleteLoading, BucketUid]);

	useEffect(() => {
		if (bucketType !== '') {
			const volumeObject: any = BucketTypeItems.find((s) => s.value === bucketType);
			setBucketTypeData(volumeObject?.label);
			onSelection({ storeType: bucketType }, false);
		}
	}, [bucketType, bucketTypeData, onSelection]);

	useEffect(() => {
		if (verifyCheck === 'successWithVerify') {
			setButtonColor('success');
			setIcon('CheckmarkCircle2');
			setButtonDetail(
				t('label.connector_is_create_and_verified', 'CONNECTOR IS CREATED AND VERIFIED')
			);
		} else if (verifyCheck === 'errorOnVerify') {
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
					autoHideTimeout: 2000
				});
			}
		} else if (verifyCheck === 'fail') {
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
				autoHideTimeout: 2000
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
						items={BucketTypeItems}
						background="gray5"
						label={t('buckets.bucket_type', 'Buckets Type')}
						onChange={(e: any): void => {
							const volumeObject: any = BucketTypeItems.find((s) => s.value === e);
							setBucketTypeData(volumeObject.value);
							onSelection({ storeType: bucketTypeData }, false);
						}}
						showCheckbox={false}
						padding={{ right: 'medium' }}
					/>
				</Row>
			)}
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<Input
						background="gray5"
						label={t('label.bucket_name', 'Bucket Name')}
						name="bucketName"
						onChange={(ev: any): any => {
							setBucketName(ev.target.value);
							onSelection({ bucketName: ev.target.value }, false);
						}}
					/>
				</Row>
				<Padding width="4%" />
				<Row width="48%" mainAlignment="flex-end">
					<Select
						items={BucketRegions}
						background="gray5"
						label={t('label.region', 'Region')}
						onChange={(e: any): any => {
							const volumeObject: any = BucketRegions.find((s) => s.value === e);
							setRegionsData(volumeObject.value);
							onSelection({ region: volumeObject.value }, false);
						}}
						showCheckbox={false}
						padding={{ right: 'medium' }}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Row width="48%" mainAlignment="flex-start">
					<PasswordInput
						background="gray5"
						label={t('label.access_key', 'Access Key')}
						name="accessKey"
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
						onChange={(ev: any): any => {
							setSecretKey(ev.target.value);
							onSelection({ secret: ev.target.value }, false);
						}}
					/>
				</Row>
			</Row>
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
			{verifyCheck === 'success' && (
				<Row width="100%" padding={{ top: 'large' }}>
					<Input label={t('label.uuid', 'uuid')} value={BucketUid} readOnly />
				</Row>
			)}
		</Container>
	);
};

export default Connection;
