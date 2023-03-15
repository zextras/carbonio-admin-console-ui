/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	SnackbarManagerContext,
	Button,
	FileLoader,
	Input,
	Text,
	Padding,
	Row,
	Select,
	Container
} from '@zextras/carbonio-design-system';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { postSoapFetchRequest, soapFetch } from '@zextras/carbonio-shell-ui';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICertificateContent } from '../../../../../types';
import {
	DOMAIN_CERTIFICATE,
	DOMAIN_CERTIFICATE_CA_CHAIN,
	DOMAIN_CERTIFICATE_PRIVATE_KEY,
	INVALID,
	ZIMBRA_ID
} from '../../../../constants';
import { getDomainInformation } from '../../../../services/domain-information-service';
import { modifyDomain } from '../../../../services/modify-domain-service';
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
	const domainInformation: any = useDomainStore((state) => state.domain?.a);
	const [selectedCertType, setSelectedCertType] = useState<any>();
	const [verifyBtnLoading, setVerifyBtnLoading] = useState(false);
	const [uploadBtnTgl, setUploadBtnTgl] = useState(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const certificateTypes = useMemo(() => CertificateTypes(t), [t]);
	const [domainCertiErr, setDomainCertiErr] = useState(true);
	const [domainCertiCaChainErr, setDomainCertiCaChainErr] = useState(true);
	const [privateKeyErr, setPrivateKeyErr] = useState(true);
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

	const verifyCertificateHandler = useCallback((): void => {
		if (objDomainCertificate.content === '') {
			setDomainCertiErr(false);
		}
		if (objDomainCertificateCaChain.content === '') {
			setDomainCertiCaChainErr(false);
		}
		if (objDomainCertificatePrivateKey.content === '') {
			setPrivateKeyErr(false);
		}
		setVerifyBtnLoading(true);
		if (
			objDomainCertificate.content === '' ||
			objDomainCertificateCaChain.content === '' ||
			objDomainCertificatePrivateKey.content === ''
		) {
			createSnackbar({
				key: 'error',
				type: 'error',
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
				_jsns: 'urn:zimbraAdmin',
				ca: objDomainCertificateCaChain.content.replaceAll('\r', ''),
				cert: objDomainCertificate.content.replaceAll('\r', ''),
				privkey: objDomainCertificatePrivateKey.content.replaceAll('\r', '')
			}).then((data: any) => {
				if (data?.verifyResult) {
					createSnackbar({
						key: 'success',
						type: 'success',
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
						type: 'warning',
						label: t(
							'domain.certificate_valid_but_either_expired_or_exists_non_trusted_CA',
							`The certificate is valid but it's either expired or exists a non trusted CA`
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
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
					setVerifyBtnLoading(false);
				} else if (data?.verifyResult === INVALID) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t(
							'domain.certificate_invalid_error',
							`The certificate is invalid , please try with other certificate`
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
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
					setVerifyBtnLoading(false);
				}
			});
		}
	}, [
		createSnackbar,
		objDomainCertificate.content,
		objDomainCertificateCaChain.content,
		objDomainCertificatePrivateKey.content,
		t
	]);

	const uploadClickHandler = (): any => {
		const zimbraId =
			domainInformation &&
			domainInformation.filter((item: any) => item.n === ZIMBRA_ID)[0]?._content;
		const concatedCertiFile = objDomainCertificate?.content.concat(
			objDomainCertificateCaChain.content
		);
		const body: any = {};
		const attributes: any[] = [];
		body.id = zimbraId;
		body._jsns = 'urn:zimbraAdmin';
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
					type: 'success',
					label: t('domain.certificate_saved', `The certificates have been saved`),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				externalData(true);
				setToggleWizardSection(false);
			})
			.catch((error) => {
				createSnackbar({
					key: 'error',
					type: 'error',
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
		if (objDomainCertificateCaChain.content !== '') {
			setDomainCertiCaChainErr(true);
		}
		if (objDomainCertificatePrivateKey.content !== '') {
			setPrivateKeyErr(true);
		}
	}, [
		objDomainCertificate.content,
		objDomainCertificateCaChain.content,
		objDomainCertificatePrivateKey.content
	]);

	return (
		<Container padding={{ all: 'small' }}>
			<ListRow>
				<Padding vertical="small" horizontal="small" width="100%">
					<Select
						items={certificateTypes}
						background="gray5"
						label={t('label.certificate_type', 'Certificate Type')}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
							setSelectedCertType(e);
						}}
						defaultSelection={certificateTypes[1]}
						showCheckbox={false}
						readOnly
						disabled
					/>
				</Padding>
			</ListRow>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Text weight="bold" size="medium">
							{t('label.domain_certificate', 'Domain Certificate')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Textarea
							label={t('label.load_copy_certi', 'Load or copy your certificate')}
							backgroundColor="gray5"
							value={objDomainCertificate.content || ''}
							size="medium"
							inputName="zimbraNotes"
							readOnly
							hasError={!domainCertiErr}
						/>
						{!domainCertiErr && (
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
							value={objDomainCertificate.fileName || ''}
							readOnly
						/>
					</Padding>
					<Padding vertical="small" horizontal="small">
						<FileLoader
							label={''}
							size="extralarge"
							type="outlined"
							color="primary"
							onChange={(e: any): any =>
								readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE)
							}
						/>
					</Padding>
				</ListRow>
			</Container>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Text weight="bold" size="medium">
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
							readOnly
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
							readOnly
						/>
					</Padding>
					<Padding vertical="small" horizontal="small">
						<FileLoader
							label={''}
							size="extralarge"
							type="outlined"
							color="primary"
							onChange={(e: any): any =>
								readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE_CA_CHAIN)
							}
						/>
					</Padding>
				</ListRow>
			</Container>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Text weight="bold" size="medium">
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
							readOnly
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
							readOnly
						/>
					</Padding>
					<Padding vertical="small" horizontal="small">
						<FileLoader
							label={''}
							size="extralarge"
							type="outlined"
							color="primary"
							onChange={(e: any): any =>
								readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE_PRIVATE_KEY)
							}
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
					width="100%"
					size="large"
					label={
						uploadBtnTgl
							? t('label.want_to_use_this_certifiacte', 'I WANT TO USE THIS CERTIFICATE')
							: t('label.verify', 'Verify')
					}
					onClick={uploadBtnTgl ? uploadClickHandler : verifyCertificateHandler}
					loading={verifyBtnLoading}
					type={uploadBtnTgl ? 'outlined' : 'default'}
				/>
			</Container>
		</Container>
	);
};

export default LoadAndVerifyCert;
