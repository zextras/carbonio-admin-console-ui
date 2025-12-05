/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	Modal,
	Container,
	Row,
	Text,
	Button,
	Padding,
	Icon
} from '@zextras/carbonio-design-system';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface GenerateCertificateModalProps {
	open: boolean;
	domainName: string;
	virtualHosts: string[];
	loading: boolean;
	onClose: () => void;
	onGenerate: () => void;
}

export const GenerateCertificateModal: FC<GenerateCertificateModalProps> = ({
	open,
	domainName,
	virtualHosts,
	loading,
	onClose,
	onGenerate
}) => {
	const [t] = useTranslation();
	const certificateAuthority = "Let's Encrypt";

	return (
		<Modal
			size="medium"
			title={t('label.generate_certificate', 'Generate certificate')}
			open={open}
			showCloseIcon
			onClose={onClose}
			customFooter={
				<Container orientation="horizontal" mainAlignment="flex-end">
					<Padding horizontal="small">
						<Button
							label={t('label.dismiss', 'DISMISS')}
							type="outlined"
							color="secondary"
							onClick={onClose}
							disabled={loading}
						/>
					</Padding>
					<Button
						label={t('label.generate', 'GENERATE')}
						color="primary"
						onClick={onGenerate}
						loading={loading}
					/>
				</Container>
			}
		>
			<Container
				padding={{ vertical: 'large', horizontal: 'medium' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				gap="1rem"
			>
				<Container
					background="gray5"
					padding={{ all: 'medium' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					gap="0.5rem"
				>
					<Row mainAlignment="flex-start" width="fill">
						<Text weight="bold" size="small" color="gray0">
							{t('label.certificate_authority', 'Certificate Authority')}:
						</Text>
						<Padding left="extrasmall">
							<Text size="small" color="gray0">
								{certificateAuthority}
							</Text>
						</Padding>
					</Row>
					<Row mainAlignment="flex-start" width="fill">
						<Text weight="bold" size="small" color="gray0">
							{t('label.domain_name', 'Domain Name')}:
						</Text>
						<Padding left="extrasmall">
							<Text size="small" color="gray0">
								{domainName}
							</Text>
						</Padding>
					</Row>
					<Row mainAlignment="flex-start" width="fill">
						<Text weight="bold" size="small" color="gray0">
							{t('label.virtual_hosts', 'Virtual Hosts')}:
						</Text>
						<Padding left="extrasmall">
							<Text size="small" color="gray0">
								{virtualHosts.join(', ')}
							</Text>
						</Padding>
					</Row>
				</Container>

				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					orientation="horizontal"
					gap="0.5rem"
				>
					<Icon icon="InfoOutline" color="gray1" size="medium" />
					<Text size="small" color="gray1">
						{t(
							'label.certificate_available_after_proxy_restart',
							'The certificate will be available once the Proxy is restarted'
						)}
					</Text>
				</Container>
			</Container>
		</Modal>
	);
};
