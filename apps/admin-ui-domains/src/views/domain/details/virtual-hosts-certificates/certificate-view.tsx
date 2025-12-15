/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Container,
	Row,
	Text,
	Input,
	Button,
	Tooltip,
	useSnackbar
} from '@zextras/carbonio-design-system';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { objectType } from '../../../../../types';
import { SHORT } from '../../../../constants';
import { IssueCertiRequest } from '../../../../services/virtual-host-service';
import ListRow from '../../../list/list-row';

import { GenerateCertificateModal } from './generate-certificate-modal';

interface CertificateViewProps {
	domainCertiDetails?: objectType;
	toggleCertiBtn: boolean;
	domainCertificate: any;
	domainName: string;
	domainId: string;
	hasVirtualHosts: boolean;
	virtualHosts: string[];
	onVerifyCertificate: () => void;
	onRemove: () => void;
	onCertificateGenerated: () => void;
}

export const CertificateView: FC<CertificateViewProps> = ({
	domainCertiDetails,
	toggleCertiBtn,
	domainCertificate,
	domainName,
	domainId,
	hasVirtualHosts,
	virtualHosts,
	onVerifyCertificate,
	onRemove,
	onCertificateGenerated
}) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [modalOpen, setModalOpen] = useState(false);
	const [generateLoading, setGenerateLoading] = useState(false);

	const noCertificateLabel = t(
		'label.no_certificate_to_remove',
		'There is no certificate to remove.'
	);
	const noCertificateDownloadLabel = t(
		'label.no_certificate_to_download',
		'There is no certificate to download.'
	);
	const noVirtualHostLabel = t(
		'label.no_virtual_hosts',
		'You need to add at least one Virtual Host.'
	);
	const requestSuccessLabel = t(
		'label.certificate_request_success',
		'Processing. Results will be notified to global and domain recipients'
	);

	const handleModalClose = (): void => {
		setModalOpen(false);
	};

	const requestCertiClickHandler = (): void => {
		setGenerateLoading(true);
		IssueCertiRequest(domainId, SHORT)
			.then(() => {
				setGenerateLoading(false);
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: requestSuccessLabel,
					autoHideTimeout: 7000,
					hideButton: true,
					replace: true
				});
				setModalOpen(false);
				onCertificateGenerated();
			})
			.catch((error) => {
				setGenerateLoading(false);
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

	const handleDownload = (): void => {
		const elementCerti = document.createElement('a');
		const fileCerti = new Blob([domainCertificate?.zimbraSSLCertificate], {
			type: 'application/x-pem-file'
		});
		elementCerti.href = URL.createObjectURL(fileCerti);
		elementCerti.download = `certificate-${domainName}.pem`;
		document.body.appendChild(elementCerti);
		elementCerti.click();

		const elementPrivateKey = document.createElement('a');
		const fileKey = new Blob([domainCertificate?.zimbraSSLPrivateKey], {
			type: 'application/x-pem-file'
		});
		elementPrivateKey.href = URL.createObjectURL(fileKey);
		elementPrivateKey.download = `private-key-${domainName}.pem`;
		document.body.appendChild(elementPrivateKey);
		elementPrivateKey.click();
	};

	return (
		<Container
			padding={{ all: 'large' }}
			height="fit"
			crossAlignment="flex-start"
			background="gray6"
		>
			<Row
				padding={{ top: 'large' }}
				width="100%"
				mainAlignment="space-between"
				crossAlignment="flex-start"
			>
				<Row>
					<Text size="medium" color="gray0" weight="bold">
						{t('label.certificate', 'Certificate')}
					</Text>
				</Row>
				<Row padding={{ left: 'large' }}>
					<Button
						type="ghost"
						label={t('label.upload_certificate', 'UPLOAD CERTIFICATE')}
						color="primary"
						onClick={onVerifyCertificate}
					/>
					<Tooltip label={noVirtualHostLabel} disabled={hasVirtualHosts}>
						<Button
							type="ghost"
							label={t('label.generate_certificate', 'GENERATE CERTIFICATE')}
							color="primary"
							disabled={!hasVirtualHosts}
							onClick={(): void => {
								setModalOpen(true);
							}}
						/>
					</Tooltip>
					<Tooltip label={noCertificateDownloadLabel} disabled={!toggleCertiBtn}>
						<Button
							type="ghost"
							label={t('label.download_uppercase', 'DOWNLOAD')}
							color="primary"
							disabled={toggleCertiBtn}
							onClick={handleDownload}
						/>
					</Tooltip>
					<Tooltip label={noCertificateLabel} disabled={!toggleCertiBtn}>
						<Button
							type="ghost"
							label={t('label.remove', 'Remove')}
							color="error"
							disabled={toggleCertiBtn}
							onClick={onRemove}
						/>
					</Tooltip>
				</Row>
			</Row>
			<ListRow padding={{ top: 'extralarge' }}>
				<Container padding={{ horizontal: 'small', top: 'small' }}>
					<Input
						label={t('label.subject_name_cname', 'Subject Name (Canonical Name record - CNAME)')}
						backgroundColor="gray6"
						value={domainCertiDetails?.subject || ''}
					/>
				</Container>
				<Container padding={{ horizontal: 'small', top: 'small' }}>
					<Input
						label={t(
							'label.subject_name_fqdn',
							'Subject Alt Name (Fully Qualified Domain Name - FQDN)'
						)}
						backgroundColor="gray6"
						value={domainCertiDetails?.SubjectAltName || ''}
					/>
				</Container>
			</ListRow>
			<ListRow padding={{ top: 'large' }}>
				<Container padding={{ horizontal: 'small' }}>
					<Input
						backgroundColor="gray6"
						label={t('label.issuer', 'Issuer')}
						value={domainCertiDetails?.issuer || ''}
					/>
				</Container>
			</ListRow>
			<ListRow padding={{ top: 'large' }}>
				<Container padding={{ horizontal: 'small' }}>
					<Input
						label={t('label.valid_not_before', 'Valid from (not before)')}
						backgroundColor="gray6"
						value={domainCertiDetails?.notBefore || ''}
					/>
				</Container>
				<Container padding={{ horizontal: 'small' }}>
					<Input
						label={t('label.valid_not_after', 'Valid until (not after)')}
						backgroundColor="gray6"
						value={domainCertiDetails?.notAfter || ''}
					/>
				</Container>
			</ListRow>

			<GenerateCertificateModal
				open={modalOpen}
				domainName={domainName}
				virtualHosts={virtualHosts}
				loading={generateLoading}
				onClose={handleModalClose}
				onGenerate={requestCertiClickHandler}
			/>
		</Container>
	);
};
