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
	Padding,
	Table
} from '@zextras/carbonio-design-system';
import { debounce, map } from 'lodash';
import moment from 'moment';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { objectType, Attribute } from '../../../../../../types';
import { ADMINISTRATION, MAX_DOMAIN_DISPLAY } from '../../../../../constants';
import { endSession } from '../../../../../services/end-session';
import { getDelegateAuthRequest } from '../../../../../services/get-delegate-auth-request';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { getDomainList } from '../../../../../services/search-domain-service';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../../store/domain/store';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomChip from '../../../../components/customChip';
import DropDownInput from '../../../../components/dropDownInput';
import ManageAliases from '../../../../components/manageAliases';
import Paging from '../../../../components/paging';
import Textarea from '../../../../components/textarea';
import InheritedInput from '../../../../utility/inherited-components/inherited-input';
import InheritedSelect from '../../../../utility/inherited-components/inherited-select';
import { localeList, AccountStatus } from '../../../../utility/utils';
import { AccountContext } from '../account-context';
import { AccountType } from '../account-types/account-types';

type UserSession = {
	name: string;
	sid: string;
	zid: string;
	ip: string;
	service: string;
};

const SelectItem = styled(Row)``;

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const ZimbraAuthMethod = {
	INTERNAL: 'zimbra',
	LDAP: 'ldap',
	EXTERNAL: 'ad'
} as const;

const EditAccountGeneralSection: FC<{ setChange: any }> = ({ setChange }) => {
	const createSnackbar = useSnackbar();
	const context = useContext(AccountContext);
	const {
		accountDetail,
		setAccountDetail,
		directMemberList,
		inDirectMemberList,
		setInitAccountDetail,
		accSpecificDetail,
		cosDetail,
		otpList,
		allUserSessionList,
		setAllUserSessionList,
		userSessionList,
		setUserSessionList
	} = context;
	const domainInformation = useDomainStore((state) => state.domain?.a);
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
	const [accountQuota, setAccountQuota] = useState('');
	const [sessionListRows, setSessionListRows] = useState<Array<any>>([]);
	const [selectedSession, setSelectedSession] = useState<any>([]);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	const sessionTableHeader: any[] = useMemo(
		() => [
			{
				id: 'accounts',
				label: t('label.accounts', 'Accounts'),
				width: '25%',
				bold: true
			},
			{
				id: 'session_id',
				label: t('label.session_id', 'Session ID'),
				width: '25%',
				bold: true
			},
			{
				id: 'ip',
				label: t('label.ip', 'IP'),
				width: '25%',
				bold: true
			},
			{
				id: 'service',
				label: t('label.service', 'Service'),
				width: '25%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		setAccountQuota(
			accountDetail.zimbraMailQuota ? (accountDetail.zimbraMailQuota / 1048576).toString() : ''
		);
	}, [accountDetail?.zimbraMailQuota]);

	const isHidePassword = useMemo(() => {
		if (!!domainInformation && domainInformation.length > 0) {
			const obj: objectType = {};
			domainInformation.forEach((item: Attribute) => {
				obj[item?.n] = item._content;
			});
			if (
				obj?.zimbraAuthMech === ZimbraAuthMethod.LDAP &&
				obj.zimbraAuthFallbackToLocal !== 'TRUE'
			) {
				return true;
			}
		}
		return false;
	}, [domainInformation]);

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

	const changeAccountQuota = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({
				...prev,
				[e.target.name]: (Number(e.target.value) * 1048576).toString()
			}));
		},
		[setAccountDetail]
	);

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

	const changeAccDisplayName = useCallback(
		(e) => {
			setAccountDetail((prev: AccountType) => ({ ...prev, [e.target.name]: e.target.value }));
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

	const onAccountStatusChange = (v: any): any => {
		setAccountDetail((prev: AccountType) => ({ ...prev, zimbraAccountStatus: v }));
	};
	const onPrefLocaleChange = (v: string): void => {
		v && setAccountDetail((prev: AccountType) => ({ ...prev, zimbraPrefLocale: v }));
	};
	const onCOSIdChange = (v: any): void => {
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
						: // eslint-disable-next-line sonarjs/no-duplicate-string
						  t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	};
	const setEmptyValue = useCallback(
		(keyName) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
		},
		[setAccountDetail]
	);

	const items =
		domainList.length > MAX_DOMAIN_DISPLAY
			? [
					{
						customComponent: (
							<>
								<Row mainAlignment="flex-start">
									<Padding horizontal="small">
										<CustomIcon icon="InfoOutline"></CustomIcon>
									</Padding>
								</Row>
								<Row
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

	const accountUserType = useMemo((): string => {
		if (accountDetail.zimbraIsAdminAccount === 'TRUE') return 'Admin';
		if (accountDetail.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
		if (accountDetail.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
		if (accountDetail.zimbraIsSystemAccount === 'TRUE') return 'System';
		return 'Normal';
	}, [
		accountDetail.zimbraIsAdminAccount,
		accountDetail.zimbraIsDelegatedAdminAccount,
		accountDetail.zimbraIsExternalVirtualAccount,
		accountDetail.zimbraIsSystemAccount
	]);

	const addSelection = useCallback((item) => {
		setSelectedSession([item?.sid]);
	}, []);

	useEffect(() => {
		if (userSessionList && userSessionList.length > 0) {
			const allRows = userSessionList.map((item: UserSession) => ({
				id: item?.sid,
				columns: [
					<Container
						crossAlignment="flex-start"
						key={item?.zid}
						style={{ cursor: 'pointer' }}
						onClick={(): void => addSelection(item)}
					>
						<Text size="small" weight="light" color="#828282">
							{item?.name}
						</Text>
					</Container>,
					<Container
						crossAlignment="flex-start"
						key={item?.zid}
						style={{ cursor: 'pointer' }}
						onClick={(): void => addSelection(item)}
					>
						<Text size="small" weight="light" key={item?.zid} color="#828282">
							{item?.sid}
						</Text>
					</Container>,
					<Container
						crossAlignment="flex-start"
						key={item?.zid}
						style={{ cursor: 'pointer' }}
						onClick={(): void => addSelection(item)}
					>
						<Text size="small" weight="light" key={item?.zid} color="#828282">
							{''}
						</Text>
					</Container>,
					<Container
						crossAlignment="flex-start"
						key={item?.zid}
						style={{ cursor: 'pointer' }}
						onClick={(): void => addSelection(item)}
					>
						<Text size="small" weight="light" key={item?.zid} color="#828282">
							{''}
						</Text>
					</Container>
				]
			}));
			setSessionListRows(allRows);
		} else {
			setSessionListRows([]);
		}
	}, [addSelection, userSessionList]);

	const onEndSession = useCallback(() => {
		setIsRequestInProgress(true);
		getDelegateAuthRequest(accountDetail?.zimbraId)
			.then((res: any) => {
				if (res && res?.authToken) {
					const token = res?.authToken[0]?._content;
					setIsRequestInProgress(true);
					endSession(selectedSession[0], accountDetail?.name, token)
						.then((resp: any) => {
							setIsRequestInProgress(false);
							if (resp && resp?._jsns) {
								setUserSessionList((prev: any) => [
									...prev.filter((item: UserSession) => item?.sid !== selectedSession[0])
								]);
								setAllUserSessionList((prev: any) => [
									...prev.filter((item: UserSession) => item?.sid !== selectedSession[0])
								]);
								setSelectedSession([]);
								createSnackbar({
									key: 'success',
									type: 'success',
									label: t('label.session_end_success', 'Session end successfully'),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							}
						})
						.then((error: any) => {
							setIsRequestInProgress(false);
							createSnackbar({
								key: 'error',
								type: 'error',
								label: error.message
									? error.message
									: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),

								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
						});
				}
			})
			.then((error: any) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					type: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),

					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [
		accountDetail?.zimbraId,
		accountDetail?.name,
		selectedSession,
		setUserSessionList,
		setAllUserSessionList,
		createSnackbar,
		t
	]);

	const onSessionFilterInputChange = useCallback(
		(ev) => {
			setSelectedSession([]);
			const value = ev?.target?.value || '';
			const filterdSession = allUserSessionList.filter(
				(item: UserSession) => item?.name.includes(value) || item?.sid.includes(value)
			);
			setUserSessionList(filterdSession);
		},
		[allUserSessionList, setUserSessionList]
	);

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
							label={t('label.surname', 'Surname')}
							backgroundColor="gray5"
							onChange={changeAccDetail}
							inputName="sn"
							defaultValue={accountDetail?.sn || ''}
							value={accountDetail?.sn || ''}
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
							onChange={changeAccDetail}
							inputName="givenName"
							label={t('label.person_name', 'Name')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.givenName || ''}
							value={accountDetail?.givenName || ''}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="47%" mainAlignment="flex-start">
						<Input
							backgroundColor="gray5"
							label={t('label.advance_edit_user', 'User')}
							onChange={changeUserNaneDetail}
							inputName="uid"
							defaultValue={accountDetail?.uid}
							value={accountDetail?.uid}
							autoComplete="new-password"
						/>
					</Row>
					<Row mainAlignment="center" crossAlignment="center" padding={{ top: 'small' }}>
						<Icon icon="AtOutline" size="large" />
					</Row>
					<Row width="47%" mainAlignment="flex-start">
						<Row mainAlignment="flex-start" crossAlignment="flex-start" width="100%">
							<DropDownInput
								items={items}
								maxWidth="400px"
								width="365px"
								inputLabel={
									isDomainSelect
										? t('label.domain_name', 'Domain Name')
										: t('domain.type_here_a_domain', 'Type here a domain')
								}
								onChange={(ev: React.ChangeEvent<HTMLInputElement>): void => {
									setIsDomainSelect(false);
									setSearchDomainName(ev.target.value);
								}}
								inputValue={searchDomainName}
								isCustomIcon={false}
							/>
						</Row>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="49%" mainAlignment="flex-start">
						<ManageAliases
							viewType="small"
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
					</Row>
					<Row width="49%" mainAlignment="flex-start">
						<Input
							label={t('label.type', 'Type')}
							value={accountUserType}
							CustomIcon={(): any => (
								<Icon
									icon="DiagonalArrowRightUp"
									onClick={(): void => setChange(ADMINISTRATION)}
									style={{ cursor: 'pointer' }}
									size="large"
									onChange={(): null => null}
								/>
							)}
						/>
					</Row>
				</Row>

				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="49%" mainAlignment="flex-start">
						<Input
							label={t('label.advance_edit_display_name', 'Display Name')}
							backgroundColor="gray5"
							defaultValue={accountDetail?.displayName}
							value={accountDetail?.displayName}
							onChange={changeAccDisplayName}
							inputName="displayName"
							name="descriptiveName"
							autoComplete="new-password"
						/>
					</Row>
					{isAdvanced ? (
						<Row width="49%" mainAlignment="flex-start">
							<Input
								// eslint-disable-next-line sonarjs/no-duplicate-string
								label={t('account_details.otp_devices', 'OTP Devices')}
								backgroundColor="gray5"
								defaultValue={accountDetail?.displayName}
								value={otpList?.length || 0}
							/>
						</Row>
					) : (
						<></>
					)}
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="49%" mainAlignment="flex-start">
						<Input
							label={t('label.server', 'Server')}
							backgroundColor="gray5"
							value={accountDetail?.zimbraMailHost}
						/>
					</Row>
					<Row width="49%" mainAlignment="flex-start">
						<Input label="ID" backgroundColor="gray5" value={accountDetail?.zimbraId} />
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="49%" mainAlignment="flex-start">
						<Input
							label={t('label.creation_date', 'Creation Date')}
							backgroundColor="gray6"
							readOnly
							value={
								accountDetail?.zimbraCreateTimestamp
									? moment(accountDetail?.zimbraCreateTimestamp, 'YYYYMMDDHHmmss.Z').format(
											'DD MMM YYYY | hh:MM:SS A'
									  )
									: t('label.not_available', 'Not Available')
							}
						/>
					</Row>
					<Row width="49%" mainAlignment="flex-start">
						<Input
							label={t('label.last_access', 'Last Access')}
							backgroundColor="gray6"
							readOnly
							value={
								accountDetail?.zimbraLastLogonTimestamp
									? moment(accountDetail?.zimbraLastLogonTimestamp, 'YYYYMMDDHHmmss.Z').format(
											'DD MMM YYYY | hh:MM:SS A'
									  )
									: t('label.never_logged_in', 'Never logged in')
							}
						/>
					</Row>
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
							<Text
								size="small"
								color="gray0"
								style={{ textDecoration: 'underline', cursor: 'default' }}
							>
								({t('label.what_is_a_gal', "What's a GAL?")})
							</Text>
						</Tooltip>
					</Row>
					<Row width="69%" mainAlignment="flex-start">
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
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					{isHidePassword ? (
						<>
							<Row width="49%" mainAlignment="flex-start">
								<Tooltip
									placement="top"
									label={t(
										// eslint-disable-next-line sonarjs/no-duplicate-string
										'label.try_local_password_management_ldap',
										// eslint-disable-next-line sonarjs/no-duplicate-string
										'Disable the “Try local password management in case of failure” toggle or change your default Auth method to edit these fields'
									)}
								>
									<Input
										backgroundColor="gray5"
										label={t('label.password', 'Password')}
										onChange={changeAccDetail}
										inputName="password"
										type="password"
										autoComplete="new-password"
										value={accountDetail?.password}
										disabled={isHidePassword}
									/>
								</Tooltip>
							</Row>
							<Row width="49%" mainAlignment="flex-start">
								<Tooltip
									placement="top"
									label={t(
										'label.try_local_password_management_ldap',
										'Disable the “Try local password management in case of failure” toggle or change your default Auth method to edit these fields'
									)}
								>
									<Input
										backgroundColor="gray5"
										label={t('label.repeat_password', 'Repeat Password')}
										onChange={changeAccDetail}
										inputName="repeatPassword"
										type="password"
										autoComplete="new-password"
										value={accountDetail?.repeatPassword}
										disabled={isHidePassword}
									/>
								</Tooltip>
							</Row>
						</>
					) : (
						<>
							<Row width="49%" mainAlignment="flex-start">
								<Input
									backgroundColor="gray5"
									label={t('label.password', 'Password')}
									onChange={changeAccDetail}
									inputName="password"
									type="password"
									autoComplete="new-password"
									value={accountDetail?.password}
									disabled={isHidePassword}
								/>
							</Row>
							<Row width="49%" mainAlignment="flex-start">
								<Input
									backgroundColor="gray5"
									label={t('label.repeat_password', 'Repeat Password')}
									onChange={changeAccDetail}
									inputName="repeatPassword"
									type="password"
									autoComplete="new-password"
									value={accountDetail?.repeatPassword}
									disabled={isHidePassword}
								/>
							</Row>
						</>
					)}
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
				{isHidePassword ? (
					<Tooltip
						placement="top"
						label={t(
							'label.try_local_password_management_ldap',
							'Disable the “Try local password management in case of failure” toggle or change your default Auth method to edit these fields'
						)}
					>
						<Row width="100%" mainAlignment="space-between">
							<Button
								type="outlined"
								label={t(
									'account_details.delete_user_password',
									'DELETE USER PASSWORD FROM THE LDAP'
								)}
								color="error"
								width="fill"
								onClick={(): void => setShowDeletePasswordModal(true)}
								disabled={isHidePassword}
							/>
						</Row>
					</Tooltip>
				) : (
					<Row width="100%" mainAlignment="space-between">
						<Button
							type="outlined"
							label={t(
								'account_details.delete_user_password',
								'DELETE USER PASSWORD FROM THE LDAP'
							)}
							color="error"
							width="fill"
							onClick={(): void => setShowDeletePasswordModal(true)}
							disabled={isHidePassword}
						/>
					</Row>
				)}
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
					<Row width="49%" mainAlignment="flex-start">
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
							/>
						) : (
							<></>
						)}
					</Row>
					<Row width="49%" mainAlignment="flex-start">
						{accountDetail?.zimbraId && localeZone?.length ? (
							<InheritedSelect
								label={t('label.language', 'Language')}
								items={localeZone}
								subValue={accountDetail.zimbraPrefLocale}
								inheritedValue={cosDetail.zimbraPrefLocale}
								fromSubValue={accSpecificDetail?.zimbraPrefLocale}
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
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="15.5%" mainAlignment="flex-start">
						<Switch
							defaultChecked={defaultCOS}
							onClick={onCOSSwitchChanges}
							label={t('account_details.default_COS', 'Default COS')}
							iconColor="primary"
							value={defaultCOS}
						/>
					</Row>
					<Row width="84.5%" mainAlignment="flex-start">
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
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<InheritedInput
						label={t('label.account_quota_mb', 'Account Quota (MB)')}
						subValue={accountQuota}
						inheritedValue={
							cosDetail.zimbraMailQuota ? (cosDetail.zimbraMailQuota / 1048576).toString() : ''
						}
						fromSubValue={
							accSpecificDetail.zimbraMailQuota
								? (accSpecificDetail.zimbraMailQuota / 1048576).toString()
								: ''
						}
						background="gray5"
						inputName="zimbraMailQuota"
						onChange={changeAccountQuota}
						onChangeReset={(): void => setEmptyValue('zimbraMailQuota')}
					/>
				</Row>

				<Row
					padding={{ top: 'large', left: 'large' }}
					width="100%"
					mainAlignment="space-between"
				></Row>
			</Row>
			<Row width="100%" padding={{ top: 'large' }}>
				<Divider color="gray2" />
			</Row>
			<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
				<Text size="small" color="gray0" weight="bold">
					{t('label.distribution_list', 'Distribution List')}
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
						ChipComponent={CustomChip}
						maxChips={null}
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
						ChipComponent={CustomChip}
						maxChips={null}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
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
						defaultValue={accountDetail?.description}
						value={accountDetail?.description}
						onChange={changeAccDetail}
						inputName="description"
					/>
				</Row>
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
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
			<Row
				mainAlignment="flex-start"
				padding={{ top: 'large', left: 'small', bottom: 'extralarge' }}
				width="100%"
			>
				<Row padding={{ top: 'extralarge' }}>
					<Text size="small" weight="bold">
						{t('label.active_sessions', 'Active Sessions')}
					</Text>
				</Row>
				<Row
					padding={{ top: 'extralarge' }}
					width="97%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Container width="calc(100% - 13rem)">
						<Input
							label={t('label.i_m_looking_for_the_session', 'I`m looking for the session ...')}
							backgroundColor="gray5"
							width="100%"
							onChange={onSessionFilterInputChange}
						></Input>
					</Container>
					<Padding horizontal="small" />
					<Container width="12rem" mainAlignment="flex-end" crossAlignment="flex-end">
						<Button
							label={t('label.end_session', 'End Session')}
							color="error"
							type="outlined"
							icon="StopCircleOutline"
							iconPlacement="right"
							size="extralarge"
							disabled={selectedSession.length === 0 || isRequestInProgress}
							onClick={onEndSession}
							loading={isRequestInProgress}
						/>
					</Container>
				</Row>
				<Row
					padding={{ top: 'extralarge' }}
					width="97%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
				>
					<Table
						rows={sessionListRows}
						headers={sessionTableHeader}
						showCheckbox={false}
						selectedRows={selectedSession}
						multiSelect={false}
						HeaderFactory={CustomHeaderFactory}
						RowFactory={CustomRowFactory}
					></Table>
				</Row>

				<Row
					padding={{ top: 'extralarge' }}
					width="97%"
					mainAlignment="flex-end"
					crossAlignment="flex-end"
				>
					<Paging totalItem={1} setOffset={(): null => null} />
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
