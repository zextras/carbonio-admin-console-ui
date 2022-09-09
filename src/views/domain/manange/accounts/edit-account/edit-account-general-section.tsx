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
	Switch,
	Divider,
	Tooltip,
	ChipInput
} from '@zextras/carbonio-design-system';
import { setDefaults, useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { timeZoneList, localeList, AccountStatus } from '../../../../utility/utils';

const EditAccountGeneralSection: FC = () => {
	const conext = useContext(AccountContext);
	const { accountDetail, setAccountDetail, directMemberList, inDirectMemberList } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [defaultCOS, setDefaultCOS] = useState<boolean>(!accountDetail?.zimbraCOSId);

	const [t] = useTranslation();
	const timezones = useMemo(() => timeZoneList(t), [t]);
	const localeZone = useMemo(() => localeList(t), [t]);
	const ACCOUNT_STATUS = useMemo(() => AccountStatus(t), [t]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);
	const changeAccDetail = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
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
	const onCOSSwitchChanges = (): void => {
		defaultCOS && setAccountDetail((prev: any) => ({ ...prev, zimbraCOSId: '' }));
		setDefaultCOS(!defaultCOS);
	};
	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.account', 'Account')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="32%" mainAlignment="space-between">
						<Input
							onChange={changeAccDetail}
							inputName="givenName"
							label={t('label.name', 'Name')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.givenName || ''}
							value={accountDetail?.givenName || ''}
						/>
					</Row>
					<Row width="32%" mainAlignment="space-between">
						<Input
							label={t('label.second_name_initials', 'Second Name Initials')}
							backgroundColor="gray5"
							onChange={changeAccDetail}
							inputName="initials"
							defaultValue={accountDetail?.initials || ''}
							value={accountDetail?.initials || ''}
						/>
					</Row>
					<Row width="32%" mainAlignment="space-between">
						<Input
							label={t('label.surname', 'Surname')}
							backgroundColor="gray5"
							onChange={changeAccDetail}
							inputName="sn"
							defaultValue={accountDetail?.sn || ''}
							value={accountDetail?.sn || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.userName', 'username')}
							onChange={changeAccDetail}
							inputName="uid"
							defaultValue={accountDetail?.uid}
							value={accountDetail?.uid}
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
						label={t('label.viewed_name', 'Viewed Name')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.displayName}
						value={accountDetail?.displayName}
						onChange={changeAccDetail}
						inputName="displayName"
						name="descriptiveName"
					/>
				</Row>

				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraHideInGal === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraHideInGal')}
							label={t('account_details.hide_in_gal', 'Hide in GAL')}
						/>
						<Tooltip placement="top" label={t('label.global_address_list', 'Global Address List')}>
							<Text size="small" color="#414141" style={{ 'text-decoration': 'underline' }}>
								({t('label.what_is_a_gal', "What's a GAL?")})
							</Text>
						</Tooltip>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPasswordMustChange === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPasswordMustChange')}
							label={t(
								'account_details.this_user_must_change_password',
								'This user must change password'
							)}
						/>
					</Row>
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
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="flex-start">
					<Row mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPasswordLocked === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPasswordLocked')}
							label={t(
								'account_details.prevent_user_from_changing_password',
								'Prevent user from changing password'
							)}
						/>
					</Row>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.settings', 'Settings')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						{accountDetail?.zimbraId ? (
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
						) : (
							<></>
						)}
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraIsAdminAccount === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraIsAdminAccount')}
							label={t(
								'account_details.this_is_global_administrator',
								'This is a Global Administrator '
							)}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							defaultValue={defaultCOS}
							onClick={onCOSSwitchChanges}
							label={t('account_details.default_COS', 'Default COS')}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						{cosItems?.length ? (
							<Select
								items={cosItems}
								background="gray5"
								label={t('label.default_class_of_service', 'Default Class of Service')}
								showCheckbox={false}
								defaultSelection={cosItems.find(
									(item: any) => item.value === accountDetail?.zimbraCOSId
								)}
								onChange={onCOSIdChange}
							/>
						) : (
							<></>
						)}
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						{accountDetail?.zimbraId ? (
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
						) : (
							<></>
						)}
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						{accountDetail?.zimbraId ? (
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
						) : (
							<></>
						)}
					</Row>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
				<Text size="small" color="gray0" weight="bold">
					{t('label.mailing_list', 'Mailing List')}
				</Text>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="space-between">
					<ChipInput
						placeholder={t(
							'account_details.this_account_is_a_direct_member_of',
							'This account is a direct member of'
						)}
						background="gray5"
						defaultValue={directMemberList}
						disabled
					/>
				</Row>
			</Row>
			<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
				<Row width="100%" mainAlignment="space-between">
					<ChipInput
						placeholder={t(
							'account_details.this_account_is_a_in_direct_member_of',
							'This account is a in direct member of'
						)}
						background="gray5"
						defaultValue={inDirectMemberList}
						disabled
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row
				mainAlignment="flex-start"
				padding={{ top: 'large', left: 'small', bottom: 'large' }}
				width="100%"
			>
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
						defaultValue={accountDetail?.zimbraNotes}
						value={accountDetail?.zimbraNotes}
						onChange={changeAccDetail}
						inputName="zimbraNotes"
					/>
				</Row>
			</Row>
		</Container>
	);
};

export default EditAccountGeneralSection;
