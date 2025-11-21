/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC } from 'react';

import { Container, Row, Padding, Text, Input, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../../../list/list-row';
import { objectType } from '../../../../../types';

interface CertificateViewProps {
	domainCertiDetails?: objectType;
	toggleCertiBtn: boolean;
	domainCertificate: any;
	domainName: string;
	onVerifyCertificate: () => void;
	onRemove: () => void;
}

const CertificateView: FC<CertificateViewProps> = ({
	domainCertiDetails,
	toggleCertiBtn,
	domainCertificate,
	domainName,
	onVerifyCertificate,
	onRemove
}) => {
	const [t] = useTranslation();

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
				<Row>
					<Padding left="large">
						<Button
							type="ghost"
							label={t('label.verify_certificate', 'VERIFY CERTIFICATE')}
							color="primary"
							onClick={onVerifyCertificate}
						/>
					</Padding>
					<Padding left="large">
						<Button
							type="ghost"
							label={t('label.download_uppercase', 'DOWNLOAD')}
							color="primary"
							disabled={toggleCertiBtn}
							onClick={handleDownload}
						/>
					</Padding>
					<Padding left="large">
						<Button
							type="ghost"
							label={t('label.remove', 'Remove')}
							color="error"
							disabled={toggleCertiBtn}
							onClick={onRemove}
						/>
					</Padding>
				</Row>
			</Row>
			<ListRow padding={{ top: 'extralarge' }}>
				<Container padding={{ horizontal: 'small', top: 'small' }}>
					<Input
						label={t(
							'label.subject_name_cname',
							'Subject Name (Canonical Name record - CNAME)'
						)}
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
		</Container>
	);
};

export default CertificateView;
