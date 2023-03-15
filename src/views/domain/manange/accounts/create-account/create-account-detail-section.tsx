/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useCallback, useMemo, useContext, useState } from 'react';
import {
	Container,
	Input,
	PasswordInput,
	Row,
	Select,
	Text,
	Icon,
	Switch
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from './account-context';
import { timeZoneList, localeList, AccountStatus } from '../../../../utility/utils';

const CreateAccountDetailSection: FC = () => {
	const conext = useContext(AccountContext);
	const domainName = useDomainStore((state) => state.domain?.name);
	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const { accountDetail, setAccountDetail } = conext;

	const [t] = useTranslation();
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const localeZone = useMemo(() => localeList(t), [t]);
	const ACCOUNT_STATUS = useMemo(() => AccountStatus(t), [t]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({ ...prev, [key]: !accountDetail[key] }));
		},
		[accountDetail, setAccountDetail]
	);
	const changeAccDetail = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);
	const changeAccName = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({ ...prev, changeNameBool: true }));
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	const changeAccDisplayName = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({ ...prev, changeDisplayNameBool: true }));
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	const combineName = useMemo(
		() =>
			!accountDetail?.changeNameBool
				? `${accountDetail?.givenName || ''}${accountDetail?.initials || ''}${
						accountDetail?.sn || ''
				  }`
				: accountDetail?.name,
		[
			accountDetail?.changeNameBool,
			accountDetail?.givenName,
			accountDetail?.initials,
			accountDetail?.name,
			accountDetail?.sn
		]
	);

	const combineDisplayName = useMemo(
		() =>
			`${accountDetail?.givenName || ''} ${accountDetail?.initials || ''} ${
				accountDetail?.sn || ''
			}`,
		[accountDetail?.givenName, accountDetail?.initials, accountDetail?.sn]
	);
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

	useEffect(() => {
		!accountDetail?.changeNameBool &&
			setAccountDetail((prev: any) => ({ ...prev, name: combineName }));
	}, [accountDetail?.changeNameBool, combineName, setAccountDetail]);

	useEffect(() => {
		!accountDetail?.changeDisplayNameBool &&
			setAccountDetail((prev: any) => ({ ...prev, displayName: combineDisplayName }));
	}, [accountDetail?.changeDisplayNameBool, combineDisplayName, setAccountDetail]);

	const onAccountStatusChange = (v: any): any => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraAccountStatus: v }));
	};
	const onPrefLocaleChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefLocale: v }));
	};
	const onPrefTimeZoneChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefTimeZoneId: v }));
	};
	const onCOSIdChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraCOSId: v }));
	};

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
			height="calc(100vh - 18.75rem)"
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Text size="small" color="gray0" weight="bold">
					{t('label.account', 'Account')}
				</Text>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="32%" mainAlignment="space-between">
						<Input
							onChange={changeAccDetail}
							inputName="givenName"
							label={t('label.name', 'Name')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.givenName || ''}
						/>
					</Row>
					<Row width="32%" mainAlignment="space-between">
						<Input
							label={t('label.second_name_initials', 'Middle Name Initials')}
							backgroundColor="gray5"
							onChange={changeAccDetail}
							inputName="initials"
							defaultValue={accountDetail?.initials || ''}
						/>
					</Row>
					<Row width="32%" mainAlignment="space-between">
						<Input
							label={t('label.surname', 'Surname')}
							backgroundColor="gray5"
							onChange={changeAccDetail}
							inputName="sn"
							defaultValue={accountDetail?.sn || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.userName_auto_fill', 'username (Auto-fill)')}
							value={accountDetail.name}
							onChange={changeAccName}
							inputName="name"
							// defaultValue={accountDetail?.name || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Row
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="10%"
							padding={{ top: 'small' }}
						>
							<Icon icon="AtOutline" size="large" />
						</Row>
						<Row width="90%" mainAlignment="flex-start" crossAlignment="flex-start">
							<Input
								label={t('label.domain_name', 'Domain Name')}
								background="gray6"
								value={domainName}
								disabled
							/>
						</Row>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.viewed_name_auto_fill', 'Viewed Name (Auto-fill)')}
						backgroundColor="gray5"
						value={accountDetail.displayName || combineDisplayName}
						onChange={changeAccDisplayName}
						inputName="displayName"
						name="descriptiveName"
					/>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<PasswordInput
							background="gray5"
							label={t('label.password', 'Password')}
							onChange={changeAccDetail}
							inputName="password"
							defaultValue={accountDetail?.password || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<PasswordInput
							background="gray5"
							label={t('label.repeat_password', 'Repeat Password')}
							onChange={changeAccDetail}
							inputName="repeatPassword"
							defaultValue={accountDetail?.repeatPassword || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPasswordMustChange}
							onClick={(): void => changeSwitchOption('zimbraPasswordMustChange')}
							label={t(
								'accountDetails.user_will_change_password_on_next_login',
								'User will change password on next login'
							)}
						/>
					</Row>
					{/* <Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.generateFirst2FAToken}
							onClick={(): void => changeSwitchOption('generateFirst2FAToken')}
							label={t('accountDetails.generate_first_2FA_token', 'Generate first 2FA token')}
						/>
					</Row> */}
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						Settings
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Select
							items={ACCOUNT_STATUS}
							background="gray5"
							label={t('label.account_status', 'Account Status')}
							showCheckbox={false}
							onChange={onAccountStatusChange}
							defaultSelection={ACCOUNT_STATUS.find(
								(item: any) => item.value === accountDetail?.zimbraAccountStatus
							)}
							padding={{ right: 'medium' }}
						/>
					</Row>
					{/* <Row width="32%" mainAlignment="flex-start">
						<Select
							items={localeZone}
							background="gray5"
							label={t('label.language', 'Language')}
							showCheckbox={false}
							defaultSelection={localeZone.find(
								(item: any) => item.value === accountDetail?.zimbraPrefLocale
							)}
							onChange={onPrefLocaleChange}
							padding={{ right: 'medium' }}
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Select
							items={timezones}
							background="gray5"
							label={t('label.time_zone', 'Time Zone')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
							defaultSelection={timezones.find(
								(item: any) => item.value === accountDetail?.zimbraPrefTimeZoneId
							)}
							onChange={onPrefTimeZoneChange}
						/>
					</Row> */}
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.defaultCOS}
							onClick={(): void => changeSwitchOption('defaultCOS')}
							label={t('accountDetails.default_COS', 'Default COS')}
						/>
					</Row>
					<Row width="64%" mainAlignment="flex-start">
						{cosItems?.length === cosList?.length ? (
							<Select
								items={cosItems}
								background="gray5"
								label={t('label.default_class_of_service', 'Default Class of Service')}
								showCheckbox={false}
								defaultSelection={cosItems.find(
									(item: any) => item.value === accountDetail?.zimbraCOSId
								)}
								onChange={onCOSIdChange}
								disabled={accountDetail?.defaultCOS}
							/>
						) : (
							<></>
						)}
					</Row>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						background="gray5"
						height="85px"
						label={t('label.notes', 'Notes')}
						defaultValue={accountDetail?.zimbraNotes || ''}
						onChange={changeAccDetail}
						inputName="zimbraNotes"
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default CreateAccountDetailSection;
