/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
	Button,
	FileLoader,
	Input,
	Text,
	Padding,
	Select,
	Container,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { soapFetch, useUserSettings } from '@zextras/admin-ui-bootstrap';
import { useTranslation } from 'react-i18next';

import { ICertificateContent } from '../../../../../types';
import {
	DOMAIN_CERTIFICATE,
	DOMAIN_CERTIFICATE_CA_CHAIN,
	DOMAIN_CERTIFICATE_PRIVATE_KEY,
	INVALID,
	LONG,
	SHORT,
	TRUE,
	ZIMBRA_ADMIN_URN,
	ZIMBRA_ID
} from '../../../../constants';
import { flushCache } from '../../../../services/flush-cache-service';
import { modifyDomain } from '../../../../services/modify-domain-service';
import { IssueCertiRequest } from '../../../../services/virtual-host-service';
import { useDomainStore } from '../../../../store/domain/store';
import Textarea from '../../../components/textarea';
import ListRow from '../../../list/list-row';
import { CertificateTypes } from '../../../utility/utils';

const LoadAndVerifyCert: FC<{ setToggleWizardSection: any; externalData: any }> = ({
	setToggleWizardSection,
	externalData
}) => {
	let fileReader: FileReader;
	const { t } = useTranslation();
	const domain = useDomainStore((state) => state.domain);
	const certificateTypes: any = useMemo(() => CertificateTypes(t), [t]);
	const domainInformation = useDomainStore((state) => state.domain?.a);
	const [selectedCertType, setSelectedCertType] = useState(certificateTypes[2]?.value);
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

	const emptyCertiState = (): void => {
		setObjDomainCertificate({
			content: '',
			fileName: ''
		});
		setObjDomainCertificateCaChain({
			content: '',
			fileName: ''
		});
		setObjDomainCertificatePrivateKey({
			content: '',
			fileName: ''
		});
	};
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

	const isCustomCerti = useCallback(
		() => selectedCertType === certificateTypes[2]?.value,
		[certificateTypes, selectedCertType]
	);

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

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const verifyCertificateHandler = useCallback((): void => {
		if (objDomainCertificate.content === '') {
			setDomainCertiErr(false);
		}

		// eslint-disable-next-line sonarjs/no-collapsible-if
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
				} else if (!data?.verifyResult) {
					createSnackbar({
						key: 'warning',
						severity: 'warning',
						label: t(
							'domain.certificate_valid_but_either_expired_or_exists_non_trusted_CA',
							`The certificate is valid but it's either expired or exists a non trusted CA`
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					emptyCertiState();

					setVerifyBtnLoading(false);
				} else if (data?.verifyResult === INVALID) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: t(
							'domain.certificate_invalid_error',
							`The certificate is invalid , please try with other certificate`
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					emptyCertiState();
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
		t
	]);

	const uploadClickHandler = (): any => {
		const zimbraId =
			domainInformation &&
			domainInformation.filter((item: any) => item.n === ZIMBRA_ID)[0]?._content;
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
	};

	const requestCertiClickHandler = (): void => {
		setVerifyBtnLoading(true);
		let chainType = '';
		selectedCertType === certificateTypes[0]?.value ? (chainType = LONG) : (chainType = SHORT);
		IssueCertiRequest(domain.id, chainType)
			.then((res) => {
				setVerifyBtnLoading(false);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: res?.message[0]?._content,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
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
	};

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

	useEffect(() => {
		if (!isCustomCerti()) {
			emptyCertiState();
		}
	}, [isCustomCerti, selectedCertType]);

	return (
		<Container padding={{ all: 'small' }}>
			<ListRow>
				<Select
					style={{ zIndex: '1' }}
					items={certificateTypes}
					background="gray5"
					label={t('label.certificate_type', 'Certificate Type')}
					// @ts-ignore
					onChange={(e: React.MouseEvent): void => {
						setSelectedCertType(e);
					}}
					defaultSelection={certificateTypes?.filter(
						(items: { value: string }) => items?.value === selectedCertType
					)}
					showCheckbox={false}
				/>
			</ListRow>
			<Container
				style={{
					transform: !isCustomCerti() ? 'translateY(0rem)' : 'translateY(-3.5rem)',
					transition: 'all 0.5s ease-in-out',
					zIndex: '0',
					position: 'relative'
				}}
			>
				<Container
					width="100%"
					style={{ display: 'block', paddingTop: '0.5rem' }}
					padding={{ horizontal: 'small' }}
				>
					<Button
						style={{
							width: '100%'
						}}
						width="fill"
						size="large"
						label={t('label.generate_certifiacte', 'GENERATE CERTIFICATE')}
						onClick={requestCertiClickHandler}
						loading={verifyBtnLoading}
						type="outlined"
						disabled={isCustomCerti()}
					/>
				</Container>
				<Container>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text weight="bold" size="medium" disabled={!isCustomCerti()}>
								{t('label.domain_certificate', 'Domain Certificate')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Textarea
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('label.load_copy_certi', 'Load or copy your certificate')}
								backgroundColor="gray5"
								value={objDomainCertificate.content || ''}
								size="medium"
								inputName="zimbraNotes"
								onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
									setStatesForFileContent(
										DOMAIN_CERTIFICATE,
										objDomainCertificate.fileName,
										e.target.value
									);
								}}
								disabled={!isCustomCerti()}
								hasError={!domainCertiErr}
							/>
							{!domainCertiErr && (
								<Padding top="extrasmall">
									<Text color="error" overflow="break-word" size="extrasmall">
										{t(
											// eslint-disable-next-line sonarjs/no-duplicate-string
											'label.certificate_invalid',
											// eslint-disable-next-line sonarjs/no-duplicate-string
											'The certificate is invalid'
										)}
									</Text>
								</Padding>
							)}
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Input
								label={t('label.load_your_cert_file', 'Load your certificate file')}
								type="text"
								backgroundColor="gray5"
								value={objDomainCertificate.fileName}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									setObjDomainCertificate({
										...objDomainCertificate,
										fileName: e.target.value
									});
								}}
								disabled={!isCustomCerti()}
							/>
						</Padding>
						<Padding vertical="small" horizontal="small">
							<FileLoader
								label={''}
								size="extralarge"
								type="outlined"
								color="primary"
								onChange={(e: any): void => {
									if (e?.target?.files) {
										readFileContentHandler(e?.target?.files[0], DOMAIN_CERTIFICATE);
									}
								}}
								disabled={!isCustomCerti()}
								onClick={(): void => {
									// console.log('__');
								}}
								icon="AttachOutline"
							/>
						</Padding>
					</ListRow>
				</Container>
				<Container>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text weight="bold" size="medium" disabled={!isCustomCerti()}>
								{t('label.domain_certificate_ca_chain', 'Domain Certificate CA Chain')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Textarea
								label={t('label.load_copy_certi', 'Load or copy your certificate')}
								backgroundColor="gray5"
								value={objDomainCertificateCaChain.content || ''}
								size="medium"
								inputName="zimbraNotes"
								onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
									setStatesForFileContent(
										DOMAIN_CERTIFICATE_CA_CHAIN,
										objDomainCertificateCaChain.fileName,
										e.target.value
									);
								}}
								disabled={!isCustomCerti()}
								hasError={!domainCertiCaChainErr}
							/>
							{!domainCertiCaChainErr && (
								<Padding top="extrasmall">
									<Text color="error" overflow="break-word" size="extrasmall">
										{t('label.certificate_invalid', 'The certificate is invalid')}
									</Text>
								</Padding>
							)}
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Input
								label={t('label.load_your_cert_file', 'Load your certificate file')}
								type="text"
								backgroundColor="gray5"
								value={objDomainCertificateCaChain.fileName || ''}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									setObjDomainCertificateCaChain({
										...objDomainCertificateCaChain,
										fileName: e.target.value
									});
								}}
								disabled={!isCustomCerti()}
							/>
						</Padding>
						<Padding vertical="small" horizontal="small">
							<FileLoader
								label={''}
								size="extralarge"
								type="outlined"
								color="primary"
								icon="AttachOutline"
								onChange={(e: any): void => {
									if (e?.target?.files) {
										readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE_CA_CHAIN);
									}
								}}
								disabled={!isCustomCerti()}
								onClick={(): void => {
									// console.log('__');
								}}
							/>
						</Padding>
					</ListRow>
				</Container>
				<Container>
					<ListRow>
						<Padding vertical="large" horizontal="small" width="100%">
							<Text weight="bold" size="medium" disabled={!isCustomCerti()}>
								{t('label.domain_certificate_private_key', 'Domain Private Key')}
							</Text>
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Textarea
								label={t('label.load_copy_certi', 'Load or copy your certificate')}
								backgroundColor="gray5"
								value={objDomainCertificatePrivateKey.content || ''}
								size="medium"
								inputName="zimbraNotes"
								onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
									setStatesForFileContent(
										DOMAIN_CERTIFICATE_PRIVATE_KEY,
										objDomainCertificatePrivateKey.fileName,
										e.target.value
									);
								}}
								disabled={!isCustomCerti()}
								hasError={!privateKeyErr}
							/>
							{!privateKeyErr && (
								<Padding top="extrasmall">
									<Text color="error" overflow="break-word" size="extrasmall">
										{t('label.certificate_invalid', 'The certificate is invalid')}
									</Text>
								</Padding>
							)}
						</Padding>
					</ListRow>
					<ListRow>
						<Padding vertical="small" horizontal="small" width="100%">
							<Input
								label={t('label.load_your_private_file', 'Load your Domain Private Key')}
								type="text"
								backgroundColor="gray5"
								value={objDomainCertificatePrivateKey.fileName || ''}
								onChange={(e: ChangeEvent<HTMLInputElement>): void => {
									setObjDomainCertificatePrivateKey({
										...objDomainCertificatePrivateKey,
										fileName: e.target.value
									});
								}}
								disabled={!isCustomCerti()}
							/>
						</Padding>
						<Padding vertical="small" horizontal="small">
							<FileLoader
								label={''}
								size="extralarge"
								type="outlined"
								color="primary"
								onChange={(e: any): void => {
									if (e?.target?.files) {
										readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE_PRIVATE_KEY);
									}
								}}
								disabled={!isCustomCerti()}
								onClick={(): void => {
									// console.log('__');
								}}
								icon="AttachOutline"
							/>
						</Padding>
					</ListRow>
				</Container>
				<Container
					width="100%"
					style={{ display: 'block' }}
					padding={{ top: 'large', bottom: 'small' }}
				>
					<Button
						style={{ width: '100%' }}
						width="fill"
						size="large"
						label={
							uploadBtnTgl
								? t('label.want_to_use_this_certifiacte', 'I WANT TO USE THIS CERTIFICATE')
								: t('label.verify', 'Verify')
						}
						onClick={uploadBtnTgl ? uploadClickHandler : verifyCertificateHandler}
						loading={verifyBtnLoading}
						type={uploadBtnTgl ? 'outlined' : 'default'}
						disabled={!isCustomCerti()}
					/>
				</Container>
			</Container>
		</Container>
	);
};

export default LoadAndVerifyCert;
