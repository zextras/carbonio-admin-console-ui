/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { soapFetch, useUserSettings, useDomainStore } from '@zextras/admin-ui-bootstrap';
import {
	Button,
	Text,
	Padding,
	Container,
	useSnackbar,
	Icon,
	Tooltip
} from '@zextras/carbonio-design-system';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ICertificateContent } from '../../../../../types';
import {
	DOMAIN_CERTIFICATE,
	DOMAIN_CERTIFICATE_CA_CHAIN,
	DOMAIN_CERTIFICATE_PRIVATE_KEY,
	INVALID,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_ID
} from '../../../../constants';
import { flushCache } from '../../../../services/flush-cache-service';
import { modifyDomain } from '../../../../services/modify-domain-service';
import Textarea from '../../../components/textarea';

export const LoadAndVerifyCert: FC<{ setToggleWizardSection: any; externalData: any }> = ({
	setToggleWizardSection,
	externalData
}) => {
	let fileReader: FileReader;
	const { t } = useTranslation();
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const [verifyBtnLoading, setVerifyBtnLoading] = useState(false);
	const [uploadBtnTgl, setUploadBtnTgl] = useState(false);
	const createSnackbar = useSnackbar();
	const [domainCertiErr, setDomainCertiErr] = useState(true);
	const [domainCertiCaChainErr, setDomainCertiCaChainErr] = useState(true);
	const [privateKeyErr, setPrivateKeyErr] = useState(true);
	const isCertificateAvailbale = useDomainStore((state) => state.isCertificateAvailbale);
	const [objDomainCertificate, setObjDomainCertificate] = useState<ICertificateContent>({
		fileName: '',
		content: ''
	});
	const [objDomainCertificateCaChain, setObjDomainCertificateCaChain] =
		useState<ICertificateContent>({
			fileName: '',
			content: ''
		});

	const [objDomainCertificatePrivateKey, setObjDomainCertificatePrivateKey] =
		useState<ICertificateContent>({
			fileName: '',
			content: ''
		});

	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const userSetting = useUserSettings();
	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const setStatesForFileContent = (fieldName: string, fileName: string, content: any): void => {
		switch (fieldName) {
			case DOMAIN_CERTIFICATE:
				setObjDomainCertificate({
					content,
					fileName
				});

				break;
			case DOMAIN_CERTIFICATE_CA_CHAIN:
				setObjDomainCertificateCaChain({
					content,
					fileName
				});

				break;
			case DOMAIN_CERTIFICATE_PRIVATE_KEY:
				setObjDomainCertificatePrivateKey({
					content,
					fileName
				});

				break;

			default:
				break;
		}
	};

	const readFileContentHandler = (file: File, fieldName: string): any => {
		fileReader = new FileReader();
		fileReader.onload = (evt): any => {
			setStatesForFileContent(fieldName, file.name, evt.target?.result);
		};
		fileReader.readAsText(file);
		setUploadBtnTgl(false);
	};

	const uploadClickHandler = useCallback((): any => {
		const zimbraId = domainInformation?.find((item: any) => item.n === ZIMBRA_ID)?._content;
		const concatedCertiFile = objDomainCertificate?.content
			? objDomainCertificate?.content.concat('\n', objDomainCertificateCaChain.content)
			: objDomainCertificateCaChain.content;
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = ZIMBRA_ADMIN_URN;
		attributes.push({
			n: 'zimbraSSLCertificate',
			_content: concatedCertiFile
		});
		attributes.push({
			n: 'zimbraSSLPrivateKey',
			_content: objDomainCertificatePrivateKey?.content
		});
		body.a = attributes;
		modifyDomain(body)
			.then(() => {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('domain.certificate_saved', `The certificates have been saved`),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				if (isGlobalAdmin) {
					flushCache('domain', 'id', zimbraId);
				}
				externalData(true);
				setToggleWizardSection(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		createSnackbar,
		domainInformation,
		externalData,
		isGlobalAdmin,
		objDomainCertificate?.content,
		objDomainCertificateCaChain.content,
		objDomainCertificatePrivateKey?.content,
		setToggleWizardSection,
		t
	]);

	const verifyCertificateHandler = useCallback((): void => {
		if (objDomainCertificate.content === '') {
			setDomainCertiErr(false);
		}

		if (!isCertificateAvailbale) {
			if (objDomainCertificateCaChain.content === '') {
				setDomainCertiCaChainErr(false);
			}
		}
		if (objDomainCertificatePrivateKey.content === '') {
			setPrivateKeyErr(false);
		}
		setVerifyBtnLoading(true);
		if (
			(objDomainCertificate.content === '' || objDomainCertificatePrivateKey.content === '') &&
			isCertificateAvailbale
		) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: t(
					'domain.certificate_content_error_without_ca_chain',
					'Domain certificate , Private key is invalid'
				),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			setVerifyBtnLoading(false);
		} else if (
			(!isCertificateAvailbale && objDomainCertificateCaChain.content === '') ||
			objDomainCertificate.content === '' ||
			objDomainCertificatePrivateKey.content === ''
		) {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: t(
					'domain.certificate_content_error',
					'Domain certificate , CA Chain or Private key is invalid'
				),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			setVerifyBtnLoading(false);
		} else {
			soapFetch(`VerifyCertKey`, {
				_jsns: ZIMBRA_ADMIN_URN,
				// @ts-ignore
				ca: objDomainCertificateCaChain.content.replaceAll('\r', ''),
				// @ts-ignore
				cert: objDomainCertificate.content.replaceAll('\r', ''),
				// @ts-ignore
				privkey: objDomainCertificatePrivateKey.content.replaceAll('\r', '')
			}).then((data: any) => {
				if (data?.verifyResult) {
					createSnackbar({
						key: 'success',
						severity: 'success',
						label: t('domain.certificate_valid', `The certificate is valid`),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					setVerifyBtnLoading(false);
					setUploadBtnTgl(true);
					// Upload the certificate after successful verification
					uploadClickHandler();
				} else if (!data?.verifyResult) {
					createSnackbar({
						key: 'warning',
						severity: 'warning',
						label: t(
							'domain.certificate_valid_but_either_expired_or_exists_non_trusted_CA',
							`The certificate is valid but it's either expired or exists a non trusted CA`
						),
						autoHideTimeout: 6000,
						hideButton: true,
						replace: true
					});

					setVerifyBtnLoading(false);
				} else if (data?.verifyResult === INVALID) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: t(
							'domain.certificate_invalid_error',
							`The certificate is invalid , please try with other certificate`
						),
						autoHideTimeout: 6000,
						hideButton: true,
						replace: true
					});
					setVerifyBtnLoading(false);
				}
			});
		}
	}, [
		createSnackbar,
		isCertificateAvailbale,
		objDomainCertificate.content,
		objDomainCertificateCaChain.content,
		objDomainCertificatePrivateKey.content,
		t,
		uploadClickHandler
	]);

	useEffect(() => {
		if (objDomainCertificate.content !== '') {
			setDomainCertiErr(true);
		}
		if (!isCertificateAvailbale) {
			if (objDomainCertificateCaChain.content !== '') {
				setDomainCertiCaChainErr(true);
			}
		} else {
			setDomainCertiCaChainErr(true);
		}
		if (objDomainCertificatePrivateKey.content !== '') {
			setPrivateKeyErr(true);
		}
	}, [
		isCertificateAvailbale,
		objDomainCertificate.content,
		objDomainCertificateCaChain.content,
		objDomainCertificatePrivateKey.content
	]);

	return (
		<Container
			padding={{ all: 'large' }}
			gap="1.5rem"
			width="fill"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Text size="large" weight="bold">
				{t('label.upload_verify_certificate', 'Upload and Verify Certificate')}
			</Text>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				width="fill"
			>
				<Container padding={{ right: '0.25rem' }} width="fit">
					<Icon icon="InfoOutline" color="secondary" />
				</Container>
				<Text color="secondary">
					{t(
						'label.certificate_alert_helperText',
						'The certificate will be available once the Proxy is restarted'
					)}
				</Text>
			</Container>

			<Container width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
				<Text weight="bold">{t('label.domain_certificate', 'Domain Certificate')}</Text>
				<Padding bottom="small" />
				<Textarea
					label={t('label.upload_paste_certificate', 'Upload or paste your Certificate')}
					backgroundColor="gray5"
					value={objDomainCertificate.content || ''}
					inputName="domainCertificate"
					onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
						setStatesForFileContent(
							DOMAIN_CERTIFICATE,
							objDomainCertificate.fileName,
							e.target.value
						);
					}}
					hasError={!domainCertiErr}
				/>
				<Padding bottom="large" />
				<Button
					type="outlined"
					label={t('label.upload', 'UPLOAD')}
					color="primary"
					onClick={(): void => {
						const input = document.createElement('input');
						input.type = 'file';
						input.onchange = (e: any): void => {
							if (e?.target?.files) {
								readFileContentHandler(e?.target?.files[0], DOMAIN_CERTIFICATE);
							}
						};
						input.click();
					}}
				/>
			</Container>

			<Container width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
				<Padding bottom="small" />
				<Text weight="bold">
					{t('label.domain_certificate_ca_chain', 'Domain Certificate CA Chain')}
				</Text>
				<Padding bottom="small" />
				<Textarea
					label={t(
						'label.upload_paste_certificate_ca_chain',
						'Upload or paste your Certificate CA Chain'
					)}
					backgroundColor="gray5"
					value={objDomainCertificateCaChain.content || ''}
					inputName="domainCertificateCaChain"
					onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
						setStatesForFileContent(
							DOMAIN_CERTIFICATE_CA_CHAIN,
							objDomainCertificateCaChain.fileName,
							e.target.value
						);
					}}
					hasError={!domainCertiCaChainErr}
				/>
				<Padding bottom="large" />
				<Button
					type="outlined"
					label={t('label.upload', 'UPLOAD')}
					color="primary"
					onClick={(): void => {
						const input = document.createElement('input');
						input.type = 'file';
						input.onchange = (e: any): void => {
							if (e?.target?.files) {
								readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE_CA_CHAIN);
							}
						};
						input.click();
					}}
				/>
			</Container>

			<Container width="fill" mainAlignment="flex-start" crossAlignment="flex-start">
				<Padding bottom="small" />
				<Text weight="bold">{t('label.domain_certificate_private_key', 'Domain Private Key')}</Text>
				<Padding bottom="small" />
				<Textarea
					label={t('label.upload_paste_private_key', 'Upload or paste your Private Key')}
					backgroundColor="gray5"
					value={objDomainCertificatePrivateKey.content || ''}
					inputName="domainPrivateKey"
					onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
						setStatesForFileContent(
							DOMAIN_CERTIFICATE_PRIVATE_KEY,
							objDomainCertificatePrivateKey.fileName,
							e.target.value
						);
					}}
					hasError={!privateKeyErr}
				/>
				<Padding bottom="large" />
				<Button
					type="outlined"
					label={t('label.upload', 'UPLOAD')}
					color="primary"
					onClick={(): void => {
						const input = document.createElement('input');
						input.type = 'file';
						input.onchange = (e: any): void => {
							if (e?.target?.files) {
								readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE_PRIVATE_KEY);
							}
						};
						input.click();
					}}
				/>
			</Container>

			<Container padding={{ top: 'medium' }} width="fill">
				<Tooltip
					disabled={!uploadBtnTgl}
					label={t(
						'label.fill_all_required_fields',
						'Please fill in all required fields correctly'
					)}
				>
					<Button
						width="fill"
						size="large"
						label={t('label.verify', 'VERIFY')}
						onClick={verifyCertificateHandler}
						loading={verifyBtnLoading}
						disabled={
							!objDomainCertificate.content ||
							!objDomainCertificateCaChain.content ||
							!objDomainCertificatePrivateKey.content
						}
					/>
				</Tooltip>
			</Container>
		</Container>
	);
};
