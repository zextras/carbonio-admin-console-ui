/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Row } from '@zextras/ui-components';
import { TFunction } from 'i18next';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { AllModuleConfig } from './subscription';

function getLicenseStatus(data: AllModuleConfig, t: TFunction) {
	if (data?.quantity !== 'unlimited') {
		return `${data?.quantity} users`;
	}
	if (data.enabled) {
		return t('label.enabled', 'Enabled');
	}
	return t('label.disabled', 'Disabled');
}

export const ServiceStatus = ({ data }: { data: AllModuleConfig }): ReactElement => {
	const [t] = useTranslation();
	const licenseStatus = getLicenseStatus(data, t);
	return (
		<Row
			width="8rem"
			height="7.688rem"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="stretch"
			borderRadius="regular"
			style={{
				padding: '0.75rem 0.75rem 0.75rem 0.5rem',
				background: '#FFF',
				boxShadow: `0rem 0rem 0.25rem 0rem rgba(166, 166, 166, 0.50)`,
				marginBottom: '2.25rem'
			}}
		>
			<Row
				orientation="vertical"
				crossAlignment="flex-end"
				mainAlignment="space-between"
				width="100%"
			>
				<Row orientation="vertical" crossAlignment="flex-start" width="100%" gap="0.25rem">
					<Row
						borderRadius="regular"
						style={{
							background: '#00506D'
						}}
						padding={{ horizontal: 'extrasmall' }}
					>
						<ds-text
							as="span"
							size="small"
							weight="bold"
							style={{
								color: '#FFF',
								lineHeight: '1.313rem'
							}}
						>
							{data?.name?.label}
						</ds-text>
					</Row>
					<Row>
						<ds-text as="span" size="extrasmall" weight="bold" style={{ whiteSpace: 'break-spaces' }}>
							{data?.name?.value}
						</ds-text>
					</Row>
				</Row>
				<Row orientation="vertical" crossAlignment="flex-end" width="100%" gap="1.938rem">
					<ds-text as="span" size="extrasmall" weight="regular" color={data.enabled ? 'text' : 'secondary'}>
						{}
						{licenseStatus}
					</ds-text>
				</Row>
			</Row>
		</Row>
	);
};
