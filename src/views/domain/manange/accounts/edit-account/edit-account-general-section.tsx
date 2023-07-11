/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useEffect, useCallback, useMemo, useContext, useState } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Text,
	Icon,
	Switch,
	Divider,
	Tooltip,
	ChipInput,
	Button,
	useSnackbar,
	Modal,
	Dropdown,
	Padding
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { debounce, map } from 'lodash';
import styled from 'styled-components';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { localeList, AccountStatus } from '../../../../utility/utils';
import ManageAliases from '../../../../components/manageAliases';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { AccountType } from '../account-types/account-types';
import InheritedSelect from './inherited-components/inherited-select';
import { getDomainList } from '../../../../../services/search-domain-service';
import { MAX_DOMAIN_DISPLAY } from '../../../../../constants';
import { objectType } from '../../../../../../types';

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const EditAccountGeneralSection: FC = () => {
	const createSnackbar = useSnackbar();
	const context = useContext(AccountContext);
	const {
		accountDetail,
		setAccountDetail,
		directMemberList,
		inDirectMemberList,
		setInitAccountDetail,
		accSpecificDetail,
		cosDetail
	} = context;
	const domainName = useDomainStore((state) => state.domain?.name);
	const cosList = useDomainStore((state) => state.cosList);
	const [t] = useTranslation();
	const localeZone = useMemo(() => localeList(t), [t]);
	const ACCOUNT_STATUS = useMemo(() => AccountStatus(t), [t]);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [defaultCOS, setDefaultCOS] = useState<boolean>(!accountDetail?.zimbraCOSId);
	const [accountAliases, setAccountAliases] = useState<any[]>([]);
	const [showDeletePasswordModal, setShowDeletePasswordModal] = useState<boolean>(false);
	const [domainList, setDomainList] = useState([]);
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState(domainName);

	const getDomainLists = useCallback((domain: string | undefined): void => {
		getDomainList(domain, 0).then((data) => {
			const searchResponse = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setDomainList(searchResponse?.domain);
			} else {
				setDomainList([]);
			}
		});
	}, []);

	const selectedDomain = useCallback(
		(domain: string) => {
			setIsDomainSelect(true);
			setSearchDomainName(domain);
			setAccountDetail((prev: AccountType) => ({ ...prev, domainName: domain }));
		},
		[setAccountDetail]
	);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchDomainCall = useCallback(
		debounce((domain) => {
			getDomainLists(domain);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (!isDomainSelect) {
			searchDomainCall(searchDomainName);
		}
	}, [searchDomainName, isDomainSelect, searchDomainCall]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: AccountType) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);
	const changeAccDetail = useCallback(
		(e) => {
			setAccountDetail((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAccountDetail]
	);
	const changeUserNaneDetail = useCallback(
		(e) => {
			setAccountDetail((prev: AccountType) => ({
				...prev,
				uid: e.target.value?.replace(/ /g, '')?.toLowerCase()
			}));
		},
		[setAccountDetail]
	);
	useEffect(() => {
		if (accountDetail?.mail) {
			const aliaes = accountDetail.mail.split(', ').map((ele: string) => ({ label: ele }));
			setAccountAliases(aliaes);
		}
	}, [accountDetail?.mail]);

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

	const onAccountStatusChange = (v: string): any => {
		setAccountDetail((prev: AccountType) => ({ ...prev, zimbraAccountStatus: v }));
	};
	const onPrefLocaleChange = (v: string): void => {
		v && setAccountDetail((prev: AccountType) => ({ ...prev, zimbraPrefLocale: v }));
	};
	const onCOSIdChange = (v: string): void => {
		setAccountDetail((prev: AccountType) => ({ ...prev, zimbraCOSId: v }));
	};
	const onCOSSwitchChanges = (): void => {
		defaultCOS && setAccountDetail((prev: AccountType) => ({ ...prev, zimbraCOSId: '' }));
		setDefaultCOS(!defaultCOS);
	};
	const deleteUserPassword = (): void => {
		setShowDeletePasswordModal(false);
		modifyAccountRequest(accountDetail?.zimbraId, { userPassword: '' })
			.then((data) => {
				setAccountDetail((prev: AccountType) => ({ ...prev, userPassword: '' }));
				setInitAccountDetail((prev: AccountType) => ({ ...prev, userPassword: '' }));
				setAccountDetail((prev: AccountType) => ({ ...prev, password: '' }));
				setInitAccountDetail((prev: AccountType) => ({ ...prev, password: '' }));
				setAccountDetail((prev: AccountType) => ({ ...prev, repeatPassword: '' }));
				setInitAccountDetail((prev: AccountType) => ({ ...prev, repeatPassword: '' }));
				if (data) {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t('account_details.user_password_deleted', 'User password deleted successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
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
	const setEmptyValue = useCallback(
		(keyName) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: '' }));
		},
		[setAccountDetail]
	);

	const items =
		domainList.length > MAX_DOMAIN_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row takeAvwidth="fill" mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
									takeAvwidth="fill"
									mainAlignment="flex-start"
									width="100%"
									padding={{
										all: 'small'
									}}
								>
									<Text overflow="break-word">
										{t(
											'many_domain_info_msg',
											'So many domains! Which one would you like to see? Start typing to filter.'
										)}
									</Text>
								</Row>
							</>
						)
					}
			  ]
			: domainList.map((domain: objectType, index) => ({
					id: domain.id,
					label: domain.name,
					customComponent: (
						<SelectItem
							top="9px"
							right="large"
							bottom="9px"
							left="large"
							style={{
								display: 'block',
								textAlign: 'left',
								height: 'inherit',
								padding: '3px',
								width: 'inherit'
							}}
							onClick={(): void => {
								selectedDomain(domain?.name);
							}}
						>
							{domain?.name}
						</SelectItem>
					)
			  }));

	useEffect(() => {
		selectedDomain(accountDetail?.domainName);
	}, [accountDetail?.domainName, selectedDomain]);

	useEffect(() => {
		setAccountDetail((prev: AccountType) => ({ ...prev, domainName }));
		setInitAccountDetail((prev: Record<string, string>) => ({ ...prev, domainName }));
		getDomainLists(domainName);
	}, [domainName, getDomainLists, setAccountDetail, setInitAccountDetail]);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			style={{ overflow: 'auto' }}
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
							label={t('label.second_name_initials', 'Middle Name Initials')}
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
							onChange={changeUserNaneDetail}
							inputName="uid"
							defaultValue={accountDetail?.uid}
							value={accountDetail?.uid}
							autoComplete="new-password"
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
						<Row
							takeAvwidth="fill"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="90%"
						>
							<Dropdown
								items={items}
								placement="bottom-start"
								maxWidth="400px"
								disableAutoFocus
								width="365px"
								style={{
									width: '100%'
								}}
							>
								<Input
									label={
										isDomainSelect
											? t('label.domain_name', 'Domain Name')
											: t('domain.type_here_a_domain', 'Type here a domain')
									}
									onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
										setIsDomainSelect(false);
										setSearchDomainName(ev.target.value);
									}}
									value={searchDomainName}
									backgroundColor="gray5"
								/>
							</Dropdown>
						</Row>
					</Row>
				</Row>
				<ManageAliases
					aliasType="accounts"
					listAliases={accountAliases}
					setListAliases={setAccountAliases}
					setAliasChange={(aliaes): void =>
						setAccountDetail((prev: AccountType) => ({
							...prev,
							mail: map(aliaes, 'label').join(', ')
						}))
					}
				/>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.viewed_name', 'Viewed Name')}
						backgroundColor="gray5"
						defaultValue={accountDetail?.displayName}
						value={accountDetail?.displayName}
						onChange={changeAccDetail}
						inputName="displayName"
						name="descriptiveName"
						autoComplete="new-password"
					/>
				</Row>

				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="27%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraHideInGal === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraHideInGal')}
							label={t('account_details.hide_in_gal', 'Hide in GAL')}
							iconColor="primary"
						/>
						<Tooltip placement="top" label={t('label.global_address_list', 'Global Address List')}>
							<Text size="small" color="gray0" style={{ 'text-decoration': 'underline' }}>
								({t('label.what_is_a_gal', "What's a GAL?")})
							</Text>
						</Tooltip>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPasswordMustChange === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPasswordMustChange')}
							label={t(
								'account_details.this_user_must_change_password',
								'This user must change password'
							)}
							iconColor="primary"
						/>
					</Row>
					<Row width="37%" mainAlignment="flex-start"></Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.password', 'Password')}
							onChange={changeAccDetail}
							inputName="password"
							type="password"
							autoComplete="new-password"
							value={
								// eslint-disable-next-line no-nested-ternary
								accountDetail?.password
									? accountDetail.password
									: accountDetail?.userPassword
									? '******'
									: ''
							}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Input
							background="gray5"
							label={t('label.repeat_password', 'Repeat Password')}
							onChange={changeAccDetail}
							inputName="repeatPassword"
							type="password"
							autoComplete="new-password"
							value={
								// eslint-disable-next-line no-nested-ternary
								accountDetail?.repeatPassword
									? accountDetail.repeatPassword
									: accountDetail?.userPassword
									? '******'
									: ''
							}
						/>
					</Row>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				<Button
					type="outlined"
					label={t('account_details.delete_user_password', 'DELETE USER PASSWORD FROM THE LDAP')}
					color="error"
					width="fill"
					onClick={(): void => setShowDeletePasswordModal(true)}
				/>
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
					<Row width="100%" mainAlignment="flex-start">
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
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							defaultValue={defaultCOS}
							onClick={onCOSSwitchChanges}
							label={t('account_details.default_COS', 'Default COS')}
							iconColor="primary"
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
					<Row width="100%" mainAlignment="flex-start">
						{accountDetail?.zimbraId && localeZone?.length ? (
							<InheritedSelect
								label={t('label.language', 'Language')}
								items={localeZone}
								accountValue={accountDetail.zimbraPrefLocale}
								cosValue={cosDetail.zimbraPrefLocale}
								fromAccount={accSpecificDetail?.zimbraPrefLocale}
								background="gray5"
								selectName="zimbraPrefLocale"
								onChange={onPrefLocaleChange}
								onChangeReset={(): void => setEmptyValue('zimbraPrefLocale')}
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
							'This account is an indirect member of'
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
				<Row padding={{ top: 'large', left: 'large', bottom: 'large' }} width="100%">
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
			<Modal
				size="small"
				title={t('account_details.delete_password', 'Delete Password', {
					name: accountDetail?.givenName
				})}
				open={showDeletePasswordModal}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '0.5rem' }}>
							<Button
								label={t('label.no_go_back', 'No, go back')}
								color="secondary"
								onClick={(): void => setShowDeletePasswordModal(false)}
							/>
							<Button
								label={t('label.yes_delete_it', 'Yes, delete it')}
								color="error"
								onClick={(): void => deleteUserPassword()}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClick={(): void => setShowDeletePasswordModal(false)}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 1rem' }}
				>
					<Trans
						i18nKey="account_details.delete_password_of_user_ldap"
						defaults="You are deleting the password of <bold>{{name}}</bold> from the LDAP. Are you sure you want to delete it?"
						components={{ bold: <strong /> }}
						values={{
							name: accountDetail?.givenName
						}}
					/>
				</Text>
			</Modal>
		</Container>
	);
};

export default EditAccountGeneralSection;
