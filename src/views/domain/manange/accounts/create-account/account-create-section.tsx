/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext } from 'react';
import { Container, Input, Row, Select, Text, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { find } from 'lodash';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from './account-context';
import { localeList } from '../../../../utility/utils';

const AccountCreateSection: FC = () => {
	const conext = useContext(AccountContext);
	const { accountDetail } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const [t] = useTranslation();
	const localeZone = useMemo(() => localeList(t), [t]);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Text size="small" color="Gray0" weight="bold">
					Account
				</Text>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.user', 'User')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.name}
							readOnly
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.mail', 'Mail')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.name && `${accountDetail?.name}@${domainName}`}
							readOnly
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.password', 'Password')}
							backgroundColor="gray5"
							defaultValue={`${accountDetail?.password}`}
							CustomIcon={(): any => <Icon icon="CopyOutline" size="large" color="Gray0" />}
							readOnly
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Select
							background="gray6"
							label={t('label.must_change_passowrd', 'Must Change Passowrd?')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={{
								value: '0',
								label: `${accountDetail?.zimbraPasswordMustChange ? 'Yes' : 'No'}`
							}}
							disabled
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t(
							'label.first_2FA_access_token_link',
							'First 2FA Access Token Link (send this to the user)'
						)}
						backgroundColor="gray5"
						defaultValue={`otpauth://totp/Example:${accountDetail?.name}@${domainName}...`}
						CustomIcon={(): any => <Icon icon="CopyOutline" size="large" color="Gray0" />}
						disabled
					/>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('label.status', 'Status')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={{
								value: `${accountDetail?.zimbraAccountStatus}`,
								label: `${accountDetail?.zimbraAccountStatus}`
							}}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('label.language', 'Language')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={{
								value: accountDetail?.zimbraPrefLocale,
								label: `${
									find(localeZone, { value: accountDetail?.zimbraPrefLocale })?.label || ''
								}`
							}}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('label.time_zone', 'Time Zone')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={{
								value: `${accountDetail?.zimbraPrefTimeZoneId}`,
								label: `${accountDetail?.zimbraPrefTimeZoneId}`
							}}
							disabled
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Select
						background="gray6"
						label={t('label.cos', 'COS')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={{ value: domainName, label: domainName }}
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.space', 'Space')}
						backgroundColor="gray6"
						defaultValue="(CoS Default)"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.description', 'Description')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.description}
						readOnly
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default AccountCreateSection;
