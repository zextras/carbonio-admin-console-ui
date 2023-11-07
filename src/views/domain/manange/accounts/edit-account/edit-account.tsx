/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useState, useContext } from 'react';

import {
	Container,
	Button,
	useSnackbar,
	TabBar,
	DefaultTabBarItem,
	Text,
	Row,
	IconButton,
	Divider,
	Padding
} from '@zextras/carbonio-design-system';
import { isEqual, reduce, remove, differenceBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import EditAccountAdministrationSection from './edit-account-administration-section';
import EditAccountConfigrationSection from './edit-account-configration-section';
import EditAccountContactsSection from './edit-account-contacts-section';
import EditAccountDelegatesSection from './edit-account-delegates-section';
import EditAccountGeneralSection from './edit-account-general-section';
import EditAccountSecuritySection from './edit-account-security-section';
import EditAccountUserPrefrencesSection from './edit-account-user-pref-section';
import {
	ACCOUNT,
	CONFIGURATION,
	PROFILE,
	DELEGATES,
	GENERAL_SECTION,
	MOBILE_CALENDAR_FEATURE_SYNC,
	MOBILE_CONTACT_FEATURE_SYNC,
	SECURITY,
	USER_PREFERENCES,
	DOMAIN_NAME,
	UID,
	ADMINISTRATION,
	CHANGE_NAME_BOOLEAN,
	CHANGE_DISPLAY_NAME_BOOLEAN,
	IS_DEFAULT_USER_NAME
} from '../../../../../constants';
import { addAccountAliasRequest } from '../../../../../services/add-account-alias';
import { deleteAccountAliasRequest } from '../../../../../services/delete-account-alias';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { removeDistributionListMember } from '../../../../../services/remove-distributionlist-member-service';
import { renameAccountRequest } from '../../../../../services/rename-account';
import { getDomainList } from '../../../../../services/search-domain-service';
import { setCoreAttributes } from '../../../../../services/set-core-attributes';
import { setPasswordRequest } from '../../../../../services/set-password';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import { useDomainStore } from '../../../../../store/domain/store';
import OverlayDivision from '../../../../components/overlayDivision';
import { RouteLeavingGuard } from '../../../../ui-extras/nav-guard';
import { AccountContext } from '../account-context';
import { AccountType } from '../account-types/account-types';

const ovelayStyle = styled(Container)`
	position: fixed;
	width: 58.75rem;
	top: 0;
	right: 0;
	bottom: 0;
	height: auto;
	max-height: 100%;
	overflow: hidden;
	background: #0d0d0d;
	opacity: 0.4;
	z-index: 11;
	padding-top: 2rem;
`;

const EditAccount: FC<{
	setShowEditAccountView: any;
	selectedAccount: any;
	getAccountList: any;
	signatureItems: any;
	signatureList: any;
	getAccountDetail: any;
	defaultTab: string;
	setDefaultTab: any;
	setShowAccountDetailView: any;
}> = ({
	setShowEditAccountView,
	selectedAccount,
	getAccountList,
	signatureItems,
	signatureList,
	getAccountDetail,
	defaultTab,
	setShowAccountDetailView,
	setDefaultTab
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const domainList = useDomainStore((state) => state.domainList);
	const [change, setChange] = useState(defaultTab);
	const [click, setClick] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const context = useContext(AccountContext);
	const {
		accountDetail,
		setAccountDetail,
		initAccountDetail,
		setInitAccountDetail,
		deleteAdministrationRights
	} = context;
	const setDomainListStore = useDomainStore((state) => state.setDomainList);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	const getDomainLists = useCallback(
		(offset: number): any => {
			getDomainList('', offset).then((data) => {
				const searchResponse: any = data;
				if (!!searchResponse && searchResponse?.searchTotal > 0) {
					if (searchResponse?.domain?.length) {
						setDomainListStore([...domainList, ...searchResponse.domain]);
						if (searchResponse?.more) {
							getDomainLists(offset + 50);
						}
					}
				} else {
					setDomainListStore([]);
				}
			});
		},
		[domainList, setDomainListStore]
	);

	useEffect(() => {
		if (!domainList?.length) {
			getDomainLists(0);
		}
	}, [domainList, getDomainLists]);

	useEffect(() => {
		// Uncomment this for debugg change keys
		// const modifiedKeys: any = reduce(
		// 	accountDetail,
		// 	function (result, value, key): any {
		// 		return isEqual(value, initAccountDetail[key]) ? result : [...result, key];
		// 	},
		// 	[]
		// );
		// map(modifiedKeys, (ele) => {
		// 	console.log(ele, initAccountDetail[ele], accountDetail[ele]);
		// });
		if (initAccountDetail?.zimbraId && !isEqual(accountDetail, initAccountDetail)) {
			setIsDirty(true);
		} else {
			setIsDirty(false);
		}
	}, [accountDetail, initAccountDetail]);

	const ReusedDefaultTabBar: FC<{
		item: any;
		index: any;
		selected: any;
		onClick: any;
	}> = ({ item, index, selected, onClick }): ReactElement => (
		<DefaultTabBarItem
			item={item}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore // Need to fix it with custom soultion
			index={index}
			selected={selected}
			onClick={onClick}
			orientation="horizontal"
		>
			<Row padding="small">
				<Text size="small" color={selected ? 'primary' : 'gray'}>
					{item.label}
				</Text>
			</Row>
		</DefaultTabBarItem>
	);
	const items = [
		{
			id: 'general',
			label: t('label.general', 'GENERAL'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'profile',
			label: t('label.profile', 'PROFILE'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'configuration',
			label: t('label.configuration', 'CONFIGURATION'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'user_preferences',
			label: t('label.user_preferences', 'USER PREFERENCES'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'security',
			label: t('label.security', 'SECURITY'),
			CustomComponent: ReusedDefaultTabBar
		},
		{
			id: 'administration',
			label: t('label.administration', 'ADMINISTRATION'),
			CustomComponent: ReusedDefaultTabBar
		}
	];

	if (isAdvanced) {
		items.push({
			id: 'delegates',
			label: t('label.delegates', 'DELEGATES'),
			CustomComponent: ReusedDefaultTabBar
		});
	}

	const setSwitchInitOptionValue = useCallback(
		(key: string, value: string): void => {
			setInitAccountDetail((prev: Record<string, string>) => ({ ...prev, [key]: value }));
		},
		[setInitAccountDetail]
	);

	const modifyCoreAttributes = useCallback(
		(body: any): void => {
			setCoreAttributes(body)
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				.then((data: any) => {
					setSwitchInitOptionValue(
						'mobileContactFeatureSync',
						body?.mobileContactFeatureSync?.value === 'enabled' ? 'TRUE' : 'FALSE'
					);
					setSwitchInitOptionValue(
						'mobileCalendarFeatureSync',
						body?.mobileCalendarFeatureSync?.value === 'enabled' ? 'TRUE' : 'FALSE'
					);
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
		},
		[createSnackbar, setSwitchInitOptionValue, t]
	);
	const onDeleteFromList = useCallback(
		(lists: any) => {
			if (lists?.length > 0) {
				lists.forEach((item: any) => {
					const id: any = {
						n: 'id',
						_content: item.id
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: accountDetail?.name
					};
					removeDistributionListMember(id, dlmItem)
						.then((data: any) => {
							if (data) {
								createSnackbar({
									key: 'success',
									type: 'success',
									label: t(
										'account_details.right_for_selected_user_deleted_successfully',
										'Right for selected user deleted successfully'
									),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							}
						})
						.catch((error: any) => {
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
				});
			}
		},
		[t, accountDetail, createSnackbar]
	);

	// eslint-disable-next-line sonarjs/cognitive-complexity
	const modifyAccountReq = useCallback(async () => {
		const modifiedKeys: any = reduce(
			accountDetail,
			function (result, value, key): any {
				return isEqual(value, initAccountDetail[key]) ? result : [...result, key];
			},
			[]
		);
		if (deleteAdministrationRights?.length > 0 && modifiedKeys.includes('zimbraIsAdminAccount')) {
			onDeleteFromList(deleteAdministrationRights);
		}
		const modifiedData: any = {};
		let isPasswordChange = false;
		remove(modifiedKeys, (ele) => ele === CHANGE_NAME_BOOLEAN);
		remove(modifiedKeys, (ele) => ele === CHANGE_DISPLAY_NAME_BOOLEAN);
		remove(modifiedKeys, (ele) => ele === IS_DEFAULT_USER_NAME);
		if (!accountDetail?.sn?.trim()) {
			createSnackbar({
				key: 'error',
				type: 'error',
				label: t('label.surname_required', 'Surname is required'),
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		// eslint-disable-next-line sonarjs/no-collapsible-if
		if (accountDetail?.password || accountDetail?.repeatPassword) {
			if (modifiedKeys.includes('password') || modifiedKeys.includes('repeatPassword')) {
				if (accountDetail?.password?.length < 6) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.password_lenght_msg', 'Password should be more than 5 character'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					return;
				}
				if (accountDetail?.password !== accountDetail?.repeatPassword) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: t('label.password_and repeat_password_not_match', 'Passwords do not match'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					return;
				}
				setPasswordRequest(initAccountDetail?.zimbraId, accountDetail?.password);
				isPasswordChange = true;
				remove(modifiedKeys, (ele) => ele === 'password' || ele === 'repeatPassword');
			}
		}
		if (modifiedKeys.includes('uid') || modifiedKeys.includes(DOMAIN_NAME)) {
			setIsLoading(true);
			await renameAccountRequest(
				initAccountDetail?.zimbraId,
				`${accountDetail?.uid}@${accountDetail?.domainName}`
			)
				.then(() => {
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t(
							'label.the_last_changes_has_been_saved_successfully',
							'Changes have been saved successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
					setIsLoading(false);
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
					setIsLoading(false);
				});
			await getAccountList();
			remove(modifiedKeys, (ele) => ele === UID);
			if (modifiedKeys.includes(DOMAIN_NAME)) {
				remove(modifiedKeys, (ele) => ele === DOMAIN_NAME);
				setShowEditAccountView(false);
			}
		}
		if (modifiedKeys.includes('mail')) {
			const deleteAliasArr = differenceBy(
				initAccountDetail.mail.split(','),
				accountDetail.mail.split(',')
			);
			const addAliasArr = differenceBy(
				accountDetail.mail.split(','),
				initAccountDetail.mail.split(',')
			);
			// eslint-disable-next-line array-callback-return
			deleteAliasArr.forEach((aliasName) => {
				deleteAccountAliasRequest(initAccountDetail?.zimbraId, `${aliasName}`).then();
			});

			// eslint-disable-next-line array-callback-return
			addAliasArr.forEach((aliasName) => {
				addAccountAliasRequest(initAccountDetail?.zimbraId, `${aliasName}`).then();
			});

			remove(modifiedKeys, (ele) => ele === 'mail');
		}

		if (
			(modifiedKeys.includes(MOBILE_CALENDAR_FEATURE_SYNC) ||
				modifiedKeys.includes(MOBILE_CONTACT_FEATURE_SYNC)) &&
			isAdvanced
		) {
			const coreAttrBody: any = {
				mobileCalendarFeatureSync: {
					value: accountDetail?.mobileCalendarFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
					objectName: accountDetail?.name,
					configType: ACCOUNT
				},
				mobileContactFeatureSync: {
					value: accountDetail?.mobileContactFeatureSync === 'TRUE' ? 'enabled' : 'disabled',
					objectName: accountDetail?.name,
					configType: ACCOUNT
				}
			};
			modifyCoreAttributes(coreAttrBody);
			remove(modifiedKeys, (ele) => ele === MOBILE_CALENDAR_FEATURE_SYNC);
			remove(modifiedKeys, (ele) => ele === MOBILE_CONTACT_FEATURE_SYNC);
		}
		modifiedKeys.forEach((ele: any) => {
			modifiedData[ele] = accountDetail[ele];
		});

		if (modifiedKeys && modifiedKeys?.length > 0) {
			setIsLoading(true);
			modifyAccountRequest(initAccountDetail?.zimbraId, modifiedData)
				.then((data) => {
					if (data) {
						// setShowCreateAccountView(false);
						createSnackbar({
							key: 'success',
							type: 'success',
							label: t(
								'label.the_last_changes_has_been_saved_successfully',
								'Changes have been saved successfully'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						setInitAccountDetail({ ...accountDetail });
						setIsLoading(false);
						getAccountList();
						getAccountDetail(initAccountDetail?.zimbraId);
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
					setIsLoading(false);
				});
		} else {
			if (isPasswordChange) {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t('account_details.user_password_set', 'User password set successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				accountDetail.userPassword = 'VALUE-BLOCKED';
			}
			setInitAccountDetail({ ...accountDetail });
		}
	}, [
		accountDetail,
		createSnackbar,
		getAccountDetail,
		getAccountList,
		initAccountDetail,
		isAdvanced,
		modifyCoreAttributes,
		setInitAccountDetail,
		setShowEditAccountView,
		deleteAdministrationRights,
		onDeleteFromList,
		setIsLoading,
		t
	]);
	const onUndo = (): void => {
		setAccountDetail({ ...initAccountDetail, isDefaultUserName: true });
		setInitAccountDetail((prev: AccountType) => ({ ...prev, isDefaultUserName: true }));
	};

	return (
		<>
			{(!accountDetail?.zimbraId || isLoading) && <OverlayDivision ovelayStyle={ovelayStyle} />}
			<Container
				background="gray5"
				mainAlignment="flex-start"
				style={{
					position: 'absolute',
					top: '0rem',
					height: 'auto',
					overflow: 'hidden',
					transition: 'left 0.2s ease-in-out',
					maxHeight: '100%'
				}}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="center"
					orientation="horizontal"
					background="white"
					width="fill"
					height="56px"
				>
					<Row padding={{ horizontal: 'small' }}></Row>
					<Row takeAvailableSpace mainAlignment="flex-start">
						<Text size="medium" overflow="ellipsis" weight="bold">
							{`${selectedAccount?.name} ${t('label.detail', 'Detail')}`}
						</Text>
					</Row>
					<Row>
						{isDirty && (
							<Container
								orientation="horizontal"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
								background="gray6"
							>
								<Padding right="small">
									<Button label={t('label.cancel', 'Cancel')} color="secondary" onClick={onUndo} />
								</Padding>
								<Padding right="small">
									<Button
										label={t('label.save', 'Save')}
										color="primary"
										onClick={modifyAccountReq}
									/>
								</Padding>
							</Container>
						)}
					</Row>
					<Row padding={{ right: 'extrasmall' }}>
						<IconButton
							size="medium"
							icon="CloseOutline"
							onClick={(): void => {
								setShowEditAccountView(false);
								setShowAccountDetailView(true);
								setDefaultTab('general');
							}}
						/>
					</Row>
				</Row>
				<Row>
					<Divider color="gray3" />
				</Row>
				<Container
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					background="white"
				>
					<TabBar
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore // Need to fix it with custom soultion
						items={items}
						selected={change}
						onChange={(ev: unknown, selectedId: string): void => {
							setChange(selectedId);
						}}
						onItemClick={setClick}
						width="100%"
					/>
					<Divider color="gray2" />
				</Container>
				<Container
					padding={{ all: 'small' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="calc(100vh - 7.5rem)"
					background="white"
				>
					<Container crossAlignment="flex-start" padding={{ all: '0px' }}>
						{change === GENERAL_SECTION && <EditAccountGeneralSection />}
						{change === PROFILE && <EditAccountContactsSection />}
						{change === CONFIGURATION && <EditAccountConfigrationSection />}
						{change === USER_PREFERENCES && (
							<EditAccountUserPrefrencesSection
								signatureItems={signatureItems}
								signatureList={signatureList}
							/>
						)}
						{change === SECURITY && <EditAccountSecuritySection />}
						{change === DELEGATES && <EditAccountDelegatesSection />}
						{change === ADMINISTRATION && (
							<EditAccountAdministrationSection setIsLoading={setIsLoading} />
						)}
					</Container>
				</Container>
			</Container>
			<RouteLeavingGuard when={isDirty} onSave={modifyAccountReq}>
				<Text>
					{t(
						'label.unsaved_changes_line1',
						'Are you sure you want to leave this page without saving?'
					)}
				</Text>
				<Text>{t('label.unsaved_changes_line2', 'All your unsaved changes will be lost')}</Text>
			</RouteLeavingGuard>
		</>
	);
};
export default EditAccount;
