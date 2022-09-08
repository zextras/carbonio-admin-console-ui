/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect } from 'react';
import { Container, Input, Row, Select, Text, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { find } from 'lodash';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from './account-context';
import { AccountStatus, localeList } from '../../../../utility/utils';

const AccountCreateSection: FC = () => {
	const conext = useContext(AccountContext);
	const { accountDetail } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [t] = useTranslation();
	const localeZone = useMemo(() => localeList(t), [t]);
	const accountStatus = useMemo(() => AccountStatus(t), [t]);
	useEffect(() => {
		if (!!cosList && cosList.length > 0) {
			const arrayItem: any[] = [];
			cosList.forEach((item: any) => {
				arrayItem.push({
					label: item.name,
					value: item.id
				});
			});
			setCosItems(arrayItem);
		}
	}, [cosList]);
	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Text size="small" color="Gray0" weight="bold">
					{t('label.account', 'Account')}
				</Text>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.user', 'User')}
							backgroundColor="gray6"
							value={accountDetail?.name}
							readOnly
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.mail', 'Mail')}
							backgroundColor="gray6"
							value={accountDetail?.name && `${accountDetail?.name}@${domainName}`}
							readOnly
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							label={t('label.password', 'Password')}
							backgroundColor="gray6"
							value={`${accountDetail?.password}`}
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
							readOnly
						/>
					</Row>
				</Row>
				{/* <Row padding={{ top: 'large', left: 'large' }} width="100%">
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
                </Row> */}
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Select
							background="gray6"
							label={t('label.status', 'Status')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={{
								value: accountDetail?.zimbraAccountStatus,
								label: `${
									find(accountStatus, { value: accountDetail?.zimbraAccountStatus })?.label || ''
								}`
							}}
							readOnly
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Select
							background="gray6"
							label={t('label.language', 'Language')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={{
								value: accountDetail?.zimbraPrefLocale,
								label: `${
									find(localeZone, { value: accountDetail?.zimbraPrefLocale })?.label || ''
								}`
							}}
							readOnly
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Select
							background="gray6"
							label={t('label.time_zone', 'Time Zone')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={
								accountDetail?.zimbraPrefTimeZoneId
									? {
											value: `${accountDetail?.zimbraPrefTimeZoneId}`,
											label: `${accountDetail?.zimbraPrefTimeZoneId}`
									  }
									: null
							}
							readOnly
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					{cosItems?.length === cosList?.length ? (
						<Input
							background="gray6"
							label={t('label.default_class_of_service', 'Default Class of Service')}
							value={
								accountDetail?.zimbraCOSId
									? cosItems.find((item: any) => item.value === accountDetail?.zimbraCOSId)?.label
									: ''
							}
							readOnly
						/>
					) : (
						<></>
					)}
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.space', 'Space')}
						backgroundColor="gray6"
						value="(CoS Default)"
						readOnly
					/>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.notes', 'Notes')}
						backgroundColor="gray6"
						value={accountDetail?.zimbraNotes}
						readOnly
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default AccountCreateSection;
