/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	FC,
	useEffect,
	useCallback,
	useMemo,
	useContext,
	useState,
	ChangeEvent
} from 'react';

import {
	Container,
	Input,
	PasswordInput,
	Row,
	Select,
	Text,
	Icon,
	Switch,
	Tooltip
} from '@zextras/carbonio-design-system';
import { find, head } from 'lodash';
import { useTranslation } from 'react-i18next';

import { AccountContext } from './account-context';
import { useDomainStore } from '../../../../../store/domain/store';
import Textarea from '../../../../components/textarea';
import {
	AccountStatus,
	checkValidUserName,
	convertToAscii,
	getModifiedName,
	isValidPhoneNumber
} from '../../../../utility/utils';
import { AccountType } from '../account-types/account-types';

const CreateAccountDetailSection: FC = () => {
	const context = useContext(AccountContext);
	const domainName = useDomainStore((state) => state.domain?.name);
	const domain = useDomainStore((state) => state.domain);
	const [showAutoFillAlert, setShowAutoFillAlert] = useState<boolean>(false);

	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const { accountDetail, setAccountDetail } = context;

	const [isValidPhone, setIsValidPhone] = useState<boolean>(true);
	const [isValidHomePhone, setIsValidHomePhone] = useState<boolean>(true);
	const [isValidMobile, setIsValidMobile] = useState<boolean>(true);
	const [isValidPager, setIsValidPager] = useState<boolean>(true);
	const [isValidFaxNumber, setIsValidFaxNumber] = useState<boolean>(true);

	const [t] = useTranslation();

	const phoneTooltipLabel = t(
		'label.accounts.phoneNumber.tooltip',
		'allowed chars are whitespaces, numbers and symbols -+()/,.'
	);

	const ACCOUNT_STATUS = useMemo(() => AccountStatus(t), [t]);

	const domainStatus = useMemo(() => {
		const status = find(domain?.a, { n: 'zimbraDomainStatus' });
		// eslint-disable-next-line sonarjs/prefer-single-boolean-return
		if (status?._content === 'closed') {
			return true;
		}
		return false;
	}, [domain]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({ ...prev, [key]: !accountDetail[key] }));
		},
		[accountDetail, setAccountDetail]
	);
	const changeAccDetail = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setAccountDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);
	const changeAccName = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setShowAutoFillAlert(false);
			setAccountDetail((prev: any) => ({ ...prev, changeNameBool: true }));
			setAccountDetail((prev: any) => ({
				...prev,
				[e.target.name]: e.target.value?.replace(/ /g, '')?.toLowerCase()
			}));
		},
		[setAccountDetail]
	);

	const changeAccDisplayName = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			setAccountDetail((prev: AccountType) => ({ ...prev, changeDisplayNameBool: true }));
			setAccountDetail((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);

	const combineName = useMemo(() => {
		const { sn, initials, givenName, changeNameBool, name } = accountDetail || {};

		if (!changeNameBool) {
			const userName = [];

			if (givenName.trim()) userName.push(getModifiedName(givenName.trim()));
			if (initials.trim()) userName.push(head(getModifiedName(initials.trim())));
			if (sn.trim()) userName.push(String(getModifiedName(sn.trim())));
			let userNameString = '';
			userNameString = userName.join('.');
			const asciiValue = convertToAscii(userNameString);
			if (userNameString.length === asciiValue.length && checkValidUserName(asciiValue)) {
				setShowAutoFillAlert(false);
				return asciiValue;
			}
			setShowAutoFillAlert(true);
			return '';
		}

		return name || '';
	}, [accountDetail]);

	const combineDisplayName = useMemo(
		() =>
			// eslint-disable-next-line sonarjs/no-nested-template-literals
			`${accountDetail?.givenName ? `${accountDetail?.givenName} ` : ''}${
				accountDetail?.initials ? `${accountDetail?.initials} ` : ''
				// eslint-disable-next-line sonarjs/no-nested-template-literals
			}${accountDetail?.sn ? `${accountDetail?.sn} ` : ''}`.trim(),
		[accountDetail?.sn, accountDetail?.initials, accountDetail?.givenName]
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
	const onCOSIdChange = (v: any): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraCOSId: v }));
	};

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{
				overflow: 'auto',
				transition: 'left 0.2s ease-in-out',
				maxHeight: '100%'
			}}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Text size="small" color="gray0" weight="bold">
					{t('label.account', 'Account')}
				</Text>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="32%" mainAlignment="space-between">
						<Input
							label={t('label.surname', 'Surname')}
							backgroundColor="gray5"
							onChange={changeAccDetail}
							inputName="sn"
							defaultValue={accountDetail?.sn || ''}
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
							onChange={changeAccDetail}
							inputName="givenName"
							label={t('label.person_name', 'Name')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.givenName || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.user_auto_fill', 'user (Auto-fill)')}
							value={accountDetail?.name}
							onChange={changeAccName}
							inputName="name"
						/>
						{(accountDetail?.displayName || combineDisplayName) && showAutoFillAlert && (
							<Text color="error" size="small">
								{t('accountDetails.auto_fill_user_is_disabled', 'Auto fill user is disabled')}
							</Text>
						)}
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
								backgroundColor="gray6"
								// eslint-disable-next-line sonarjs/no-nested-template-literals
								value={`${domainName} ${domainStatus ? `(${t('label.closed', 'Closed')})` : ''}`}
								disabled
							/>
						</Row>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.display_name_auto_fill', 'Display Name (Auto-fill)')}
						backgroundColor="gray5"
						value={accountDetail?.displayName || combineDisplayName}
						onChange={changeAccDisplayName}
						inputName="displayName"
						autoComplete="new-password"
					/>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<PasswordInput
							backgroundColor="gray5"
							label={t('label.password', 'Password')}
							onChange={changeAccDetail}
							inputName="password"
							defaultValue={accountDetail?.password || ''}
							autoComplete="new-password"
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<PasswordInput
							backgroundColor="gray5"
							label={t('label.repeat_password', 'Repeat Password')}
							onChange={changeAccDetail}
							inputName="repeatPassword"
							defaultValue={accountDetail?.repeatPassword || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPasswordMustChange}
							onClick={(): void => changeSwitchOption('zimbraPasswordMustChange')}
							label={t(
								'accountDetails.user_will_change_password_on_next_login',
								'User will change password on next login'
							)}
							iconColor="primary"
						/>
					</Row>
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
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="20%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.defaultCOS}
							onClick={(): void => changeSwitchOption('defaultCOS')}
							label={t('accountDetails.default_COS', 'Default COS')}
							iconColor="primary"
						/>
					</Row>
					<Row width="80%" mainAlignment="flex-start">
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
						{t('label.description', 'Description')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						backgroundColor="gray5"
						label={t('label.description', 'Description')}
						defaultValue={accountDetail?.description || ''}
						onChange={changeAccDetail}
						inputName="description"
					/>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.notes', 'Notes')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Textarea
						label={t('label.notes', 'Notes')}
						value={accountDetail?.zimbraNotes || ''}
						backgroundColor="gray5"
						inputName="zimbraNotes"
						onChange={changeAccDetail}
					/>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.phone', 'Phone')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="space-between">
						<Tooltip placement="top" label={phoneTooltipLabel}>
							<Input
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									if (e.target.value) {
										const validPhone = isValidPhoneNumber(e.target.value);
										setIsValidPhone(validPhone);
										if (validPhone) {
											changeAccDetail(e);
										}
									} else {
										changeAccDetail(e);
									}
								}}
								hasError={!isValidPhone}
								inputName="telephoneNumber"
								label={t('label.phone', 'Phone')}
								backgroundColor="gray5"
								defaultValue={accountDetail?.telephoneNumber || ''}
								value={accountDetail?.telephoneNumber || ''}
							/>
						</Tooltip>
					</Row>
					<Row width="48%" mainAlignment="space-between">
						<Tooltip placement="top" label={phoneTooltipLabel}>
							<Input
								label={t('label.home', 'Home')}
								backgroundColor="gray5"
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									if (e.target.value) {
										const validPhone = isValidPhoneNumber(e.target.value);
										setIsValidHomePhone(validPhone);
										if (validPhone) {
											changeAccDetail(e);
										}
									} else {
										changeAccDetail(e);
									}
								}}
								hasError={!isValidHomePhone}
								inputName="homePhone"
								defaultValue={accountDetail?.homePhone || ''}
								value={accountDetail?.homePhone || ''}
							/>
						</Tooltip>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Tooltip placement="top" label={phoneTooltipLabel}>
							<Input
								backgroundColor="gray5"
								label={t('label.mobile', 'Mobile')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									if (e.target.value) {
										const validPhone = isValidPhoneNumber(e.target.value);
										setIsValidMobile(validPhone);
										if (validPhone) {
											changeAccDetail(e);
										}
									} else {
										changeAccDetail(e);
									}
								}}
								hasError={!isValidMobile}
								inputName="mobile"
								defaultValue={accountDetail?.mobile || ''}
								value={accountDetail?.mobile || ''}
							/>
						</Tooltip>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Tooltip placement="top" label={phoneTooltipLabel}>
							<Input
								backgroundColor="gray5"
								label={t('label.pager', 'Pager')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									if (e.target.value) {
										const validPhone = isValidPhoneNumber(e.target.value);
										setIsValidPager(validPhone);
										if (validPhone) {
											changeAccDetail(e);
										}
									} else {
										changeAccDetail(e);
									}
								}}
								hasError={!isValidPager}
								inputName="pager"
								defaultValue={accountDetail?.pager || ''}
								value={accountDetail?.pager || ''}
							/>
						</Tooltip>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Tooltip placement="top" label={phoneTooltipLabel}>
							<Input
								backgroundColor="gray5"
								label={t('label.fax_number', 'Fax Number')}
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									if (e.target.value) {
										const validPhone = isValidPhoneNumber(e.target.value);
										setIsValidFaxNumber(validPhone);
										if (validPhone) {
											changeAccDetail(e);
										}
									} else {
										changeAccDetail(e);
									}
								}}
								hasError={!isValidFaxNumber}
								inputName="facsimileTelephoneNumber"
								defaultValue={accountDetail?.facsimileTelephoneNumber || ''}
								value={accountDetail?.facsimileTelephoneNumber || ''}
							/>
						</Tooltip>
					</Row>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.company', 'Company')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.company', 'Company')}
							onChange={changeAccDetail}
							inputName="company"
							defaultValue={accountDetail?.company || ''}
							value={accountDetail?.company || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.job_title', 'Job Title')}
							onChange={changeAccDetail}
							inputName="title"
							defaultValue={accountDetail?.title || ''}
							value={accountDetail?.title || ''}
						/>
					</Row>
				</Row>
			</Row>
			<Row mainAlignment="flex-start" padding={{ top: 'large', left: 'small' }} width="100%">
				<Row padding={{ top: 'large' }}>
					<Text size="small" color="gray0" weight="bold">
						{t('label.address', 'Address')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.country', 'Country')}
							onChange={changeAccDetail}
							inputName="co"
							defaultValue={accountDetail?.co || ''}
							value={accountDetail?.co || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.state', 'State')}
							onChange={changeAccDetail}
							inputName="st"
							defaultValue={accountDetail?.st || ''}
							value={accountDetail?.st || ''}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.city', 'City')}
							onChange={changeAccDetail}
							inputName="l"
							defaultValue={accountDetail?.l || ''}
							value={accountDetail?.l || ''}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.postal_code', 'Postal Code')}
							onChange={changeAccDetail}
							inputName="postalCode"
							defaultValue={accountDetail?.postalCode || ''}
							value={accountDetail?.postalCode || ''}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.address', 'Address')}
							onChange={changeAccDetail}
							inputName="street"
							defaultValue={accountDetail?.street || ''}
							value={accountDetail?.street || ''}
						/>
					</Row>
				</Row>
			</Row>
		</Container>
	);
};

export default CreateAccountDetailSection;
