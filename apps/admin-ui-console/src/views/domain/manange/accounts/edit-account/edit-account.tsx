/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useUserSettings, useDomainStore } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Button,
	useSnackbar,
	TabBar,
	DefaultTabBarItem,
	Text,
	Row,
	Divider,
	Padding,
	Modal,
	Icon
} from '@zextras/carbonio-design-system';
import { isEqual, reduce, remove, differenceBy, find } from 'lodash';
import React, {
	FC,
	ReactElement,
	useCallback,
	useEffect,
	useState,
	useContext,
	useMemo
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
	IS_DEFAULT_USER_NAME,
	TRUE,
	CLOSED,
	ABQ_MODE,
	BACKUP_ENABLED,
	ADMIN_LOGIN_AS,
	BACKUP_SELF_UNDELETE_ALLOWED,
	FILES_QUOTA_LIMIT
} from '../../../../../constants';
import { addAccountAliasRequest } from '../../../../../services/add-account-alias';
import { deleteAccountAliasRequest } from '../../../../../services/delete-account-alias';
import { deleteAccount } from '../../../../../services/delete-account-service';
import { flushCache } from '../../../../../services/flush-cache-service';
import { getDelegateAuthRequest } from '../../../../../services/get-delegate-auth-request';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { removeDistributionListMember } from '../../../../../services/remove-distributionlist-member-service';
import { renameAccountRequest } from '../../../../../services/rename-account';
import { resetFileQuotaLimitById } from '../../../../../services/reset-file-quota-limit';
import { getDomainList } from '../../../../../services/search-domain-service';
import { setCoreAttributes } from '../../../../../services/set-core-attributes';
import { setFileQuotaLimitById } from '../../../../../services/set-file-quota-limit';
import { setPasswordRequest } from '../../../../../services/set-password';
import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import { Right, Rights, useRightsStore } from '../../../../../store/rights/store';
import { useStickyBarStore } from '../../../../../store/sticky-bar/store';
import Displayer from '../../../../components/displayer';
import OverlayDivision from '../../../../components/overlayDivision';
import { generateSnackbarFromError } from '../../../../error/generate-snackbar-error';
import { RouteLeavingGuard } from '../../../../ui-extras/nav-guard';
import { AccountContext } from '../account-context';
import { AccountType } from '../account-types/account-types';

import EditAccountAdministrationSection from './edit-account-administration-section';
import EditAccountConfigurationSection from './edit-account-configuration-section';
import EditAccountContactsSection from './edit-account-contacts-section';
import EditAccountDelegatesSection from './edit-account-delegates-section';
import EditAccountGeneralSection from './edit-account-general-section';
import EditAccountSecuritySection from './edit-account-security-section';
import EditAccountUserPrefrencesSection from './edit-account-user-pref-section';

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

type UserSession = {
	name: string;
	sid: string;
	zid: string;
	ip: string;
	service: string;
};

const EditAccount: FC<{
	setShowEditAccountView: any;
	selectedAccount: any;
	getAccountList: any;
	signatureItems: any;
	signatureList: any;
	getAccountDetail: any;
	defaultTab: string;
	setDefaultTab: any;
	showModal: boolean;
	setShowModal: (showModal: boolean) => void;
	isDirty: boolean;
	setIsDirty: (isDirty: boolean) => void;
	STATUS_COLOR: any;
}> = ({
	setShowEditAccountView,
	selectedAccount,
	getAccountList,
	signatureItems,
	signatureList,
	getAccountDetail,
	defaultTab,
	setDefaultTab,
	showModal,
	setShowModal,
	isDirty,
	setIsDirty,
	STATUS_COLOR
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const domainList = useDomainStore((state) => state.domainList);
	const [change, setChange] = useState(defaultTab);
	const [click, setClick] = useState<any>('');
	const [isLoading, setIsLoading] = useState(false);
	const context = useContext(AccountContext);
	const {
		accountDetail,
		setAccountDetail,
		initAccountDetail,
		setInitAccountDetail,
		deleteAdministrationRights,
		setDefaultCOS,
		cosDetail
	} = context;
	const setDomainListStore = useDomainStore((state) => state.setDomainList);
	const isAdvanced = useIsAdvanced();
	const userSetting = useUserSettings();
	const [isGlobalAdmin, setIsGlobalAdmin] = useState<boolean>(false);
	const { isSticky, setIsSticky } = useStickyBarStore();
	const { userType } = useRightsStore((state) => state);
	const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState<boolean>(false);
	const [isOpenDeleteHintModel, setisOpenDeleteHintModel] = useState(false);
	const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);

	const getDomainLists = useCallback(
		(offset: number): any => {
			getDomainList('', offset)
				.then((data) => {
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
				})
				.catch((error) => {
					const snackbarConfig = generateSnackbarFromError(error, t);
					createSnackbar(snackbarConfig);
				});
		},
		[createSnackbar, domainList, setDomainListStore, t]
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
	}, [accountDetail, initAccountDetail, setIsDirty]);

	useEffect(() => {
		if (userSetting?.attrs) {
			const account = userSetting?.attrs?.zimbraIsAdminAccount;
			if (account && account === TRUE) {
				setIsGlobalAdmin(true);
			}
		}
	}, [userSetting?.attrs]);

	const ReusedDefaultTabBar: FC<{
		item: any;
		index: any;
		selected: any;
		onClick: any;
	}> = ({ item, index, selected, onClick }): ReactElement => (
		<DefaultTabBarItem
			item={item}
			tabIndex={index}
			selected={selected}
			onClick={onClick}
			orientation="horizontal"
			background="gray6"
			underlineColor="primary"
			forceWidthEquallyDistributed={false}
		>
			<Row padding="small">
				<Text size="small" color={selected ? 'primary' : 'gray'}>
					{item.label}
				</Text>
			</Row>
		</DefaultTabBarItem>
	);
	const items: any = [
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
						severity: 'error',
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
									severity: 'success',
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
								severity: 'error',
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

	const ErrorSnackbar = useCallback(
		(label: string): void => {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
		},
		[createSnackbar]
	);

	function findModifiedKeys(): string[] {
		return reduce(
			accountDetail,
			(result, value, key): any =>
				isEqual(value, initAccountDetail[key]) ? result : [...result, key],
			[]
		);
	}

	function handleAdministrationRightsDeletion(modifiedKeys: string[]): any {
		if (deleteAdministrationRights?.length > 0 && modifiedKeys.includes('zimbraIsAdminAccount')) {
			onDeleteFromList(deleteAdministrationRights);
		}
	}

	const handlePasswordChange = useCallback(
		async (modifiedKeys: string[]): Promise<void> => {
			if (accountDetail?.password?.length < 6) {
				ErrorSnackbar(t('label.password_length_msg', 'Password should be more than 5 character'));
				return;
			}
			if (accountDetail?.password !== accountDetail?.repeatPassword) {
				ErrorSnackbar(t('label.password_and_repeat_password_not_match', 'Passwords do not match'));
				return;
			}
			setPasswordRequest(initAccountDetail?.zimbraId, accountDetail?.password).then(() => {
				if (isGlobalAdmin) {
					flushCache('account', 'id', initAccountDetail?.zimbraId);
				}
			});
			remove(modifiedKeys, (ele) => ele === 'password' || ele === 'repeatPassword');
		},
		[
			ErrorSnackbar,
			accountDetail?.password,
			accountDetail?.repeatPassword,
			initAccountDetail?.zimbraId,
			isGlobalAdmin,
			t
		]
	);

	const handleAccountRename = useCallback(
		async (modifiedKeys: string[]) => {
			if (modifiedKeys.includes('uid') || modifiedKeys.includes(DOMAIN_NAME)) {
				setIsLoading(true);
				await renameAccountRequest(
					initAccountDetail?.zimbraId,
					`${accountDetail?.uid}@${accountDetail?.domainName}`
				)
					.then(() => {
						createSnackbar({
							key: 'success',
							severity: 'success',
							label: t(
								// eslint-disable-next-line sonarjs/no-duplicate-string
								'label.the_last_changes_has_been_saved_successfully',
								// eslint-disable-next-line sonarjs/no-duplicate-string
								'Changes have been saved successfully'
							),
							autoHideTimeout: 3000,
							hideButton: true,
							replace: true
						});
						setIsLoading(false);
						if (isGlobalAdmin) {
							flushCache('account', 'id', initAccountDetail?.zimbraId);
						}
					})
					.catch((error) => {
						ErrorSnackbar(
							error?.message
								? error?.message
								: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
						);
						setIsLoading(false);
					});
				await getAccountList();
				remove(modifiedKeys, (ele) => ele === UID);
				if (modifiedKeys.includes(DOMAIN_NAME)) {
					remove(modifiedKeys, (ele) => ele === DOMAIN_NAME);
					setShowEditAccountView(false);
				}
			}
		},
		[
			ErrorSnackbar,
			accountDetail?.domainName,
			accountDetail?.uid,
			createSnackbar,
			getAccountList,
			initAccountDetail?.zimbraId,
			isGlobalAdmin,
			setShowEditAccountView,
			t
		]
	);

	const handleCoreAttributesModification = async (modifiedKeys: string[]): Promise<void> => {
		if (
			modifiedKeys.includes(ABQ_MODE) ||
			modifiedKeys.includes(BACKUP_ENABLED) ||
			modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED)
		) {
			const body: any = {};
			if (modifiedKeys.includes(ABQ_MODE)) {
				body.abqMode = {
					value: accountDetail.abqMode,
					objectName: accountDetail.zimbraId,
					configType: ACCOUNT
				};
			}
			if (modifiedKeys.includes(BACKUP_ENABLED)) {
				body.backupEnabled = {
					value: accountDetail.backupEnabled,
					objectName: accountDetail.zimbraId,
					configType: ACCOUNT
				};
			}

			if (modifiedKeys.includes(BACKUP_SELF_UNDELETE_ALLOWED)) {
				body.backupSelfUndeleteAllowed = {
					value: accountDetail.backupSelfUndeleteAllowed,
					objectName: accountDetail.zimbraId,
					configType: ACCOUNT
				};
			}

			await setCoreAttributes(body)
				.then(() => {
					createSnackbar({
						key: 'success',
						severity: 'success',
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
					ErrorSnackbar(
						error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
					);
					setIsLoading(false);
				});
			remove(modifiedKeys, (ele) => ele === BACKUP_ENABLED);
			remove(modifiedKeys, (ele) => ele === ABQ_MODE);
			remove(modifiedKeys, (ele) => ele === BACKUP_SELF_UNDELETE_ALLOWED);
		}
	};

	const handleAliasChanges = async (
		deleteAliasArr: any,
		addAliasArr: any,
		modifiedKeys: string[]
	): Promise<void> => {
		deleteAliasArr.forEach(async (aliasName: any) => {
			await deleteAccountAliasRequest(initAccountDetail?.zimbraId, `${aliasName}`)
				.then(() => {
					if (isGlobalAdmin) {
						flushCache('account', 'id', initAccountDetail?.zimbraId);
					}
				})
				.catch((error) => {
					createSnackbar({
						key: `error${aliasName}`,
						severity: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: false
					});
					setIsLoading(false);
				});
		});

		addAliasArr.forEach(async (aliasName: any) => {
			addAccountAliasRequest(initAccountDetail?.zimbraId, `${aliasName}`)
				.then(() => {
					if (isGlobalAdmin) {
						flushCache('account', 'id', initAccountDetail?.zimbraId);
					}
				})
				.catch((error) => {
					createSnackbar({
						key: `error${aliasName}`,
						severity: 'error',
						label: error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: false
					});
					setIsLoading(false);
				});
		});

		remove(modifiedKeys, (ele) => ele === 'mail');
	};

	const handleMobileSyncFeatures = useCallback(
		(modifiedKeys: string[]) => {
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
		},
		[
			accountDetail?.mobileCalendarFeatureSync,
			accountDetail?.mobileContactFeatureSync,
			accountDetail?.name,
			isAdvanced,
			modifyCoreAttributes
		]
	);

	const handleFileQuotaLimitChange = useCallback(
		(modifiedKeys: string[]) => {
			if (modifiedKeys.includes(FILES_QUOTA_LIMIT)) {
				if (accountDetail?.filesQuotaLimit) {
					setFileQuotaLimitById(accountDetail?.zimbraId, accountDetail?.filesQuotaLimit).then(
						(res) => {
							if (modifiedKeys?.length === 0) {
								createSnackbar({
									key: 'success',
									severity: 'success',
									label: t(
										'label.the_last_changes_has_been_saved_successfully',
										'Changes have been saved successfully'
									),
									autoHideTimeout: 3000,
									hideButton: true,
									replace: true
								});
							}
						}
					);
				} else {
					resetFileQuotaLimitById(accountDetail?.zimbraId).then((res) => {
						if (modifiedKeys?.length === 0) {
							createSnackbar({
								key: 'success',
								severity: 'success',
								label: t(
									'label.the_last_changes_has_been_saved_successfully',
									'Changes have been saved successfully'
								),
								autoHideTimeout: 3000,
								hideButton: true,
								replace: true
							});
							setInitAccountDetail((prev: any) => ({
								...prev,
								[FILES_QUOTA_LIMIT]: cosDetail.filesQuotaLimit
							}));
							setAccountDetail((prev: any) => ({
								...prev,
								[FILES_QUOTA_LIMIT]: cosDetail.filesQuotaLimit
							}));
						}
					});
				}
				remove(modifiedKeys, (ele) => ele === FILES_QUOTA_LIMIT);
			}
		},
		[
			accountDetail?.filesQuotaLimit,
			accountDetail?.zimbraId,
			cosDetail.filesQuotaLimit,
			createSnackbar,
			setAccountDetail,
			setInitAccountDetail,
			t
		]
	);

	const handleMainModifiedKeys = useCallback(
		async (initAccountDetails: any, modifiedData: any) => {
			setIsLoading(true);
			await modifyAccountRequest(initAccountDetails?.zimbraId, modifiedData)
				.then(async (data) => {
					if (data) {
						// setShowCreateAccountView(false);
						if (isGlobalAdmin) {
							await flushCache('account', 'id', initAccountDetails?.zimbraId);
						}
						createSnackbar({
							key: 'success',
							severity: 'success',
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
						getAccountDetail(initAccountDetails?.zimbraId);
					}
				})
				.catch((error) => {
					ErrorSnackbar(
						error?.message
							? error?.message
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.')
					);
					setIsLoading(false);
				});
		},
		[
			ErrorSnackbar,
			accountDetail,
			createSnackbar,
			getAccountDetail,
			getAccountList,
			isGlobalAdmin,
			setInitAccountDetail,
			t
		]
	);

	const modifyAccountReq = useCallback(async () => {
		const modifiedKeys: string[] = findModifiedKeys();
		handleAdministrationRightsDeletion(modifiedKeys);

		const modifiedData: any = {};
		let isPasswordChange = false;
		remove(modifiedKeys, (ele) => ele === CHANGE_NAME_BOOLEAN);
		remove(modifiedKeys, (ele) => ele === CHANGE_DISPLAY_NAME_BOOLEAN);
		remove(modifiedKeys, (ele) => ele === IS_DEFAULT_USER_NAME);
		if (!accountDetail?.sn?.trim()) {
			ErrorSnackbar(t('label.surname_required', 'Surname is required'));
			return;
		}

		if (accountDetail?.password || accountDetail?.repeatPassword) {
			if (modifiedKeys.includes('password') || modifiedKeys.includes('repeatPassword')) {
				await handlePasswordChange(modifiedKeys);
				isPasswordChange = true;
			}
		}

		await handleAccountRename(modifiedKeys);

		await handleCoreAttributesModification(modifiedKeys);

		const deleteAliasArr = differenceBy(
			initAccountDetail.mail.split(','),
			accountDetail.mail.split(',')
		);
		const addAliasArr = differenceBy(
			accountDetail.mail.split(','),
			initAccountDetail.mail.split(',')
		);

		if (modifiedKeys.includes('mail')) {
			await handleAliasChanges(deleteAliasArr, addAliasArr, modifiedKeys);
		}

		handleMobileSyncFeatures(modifiedKeys);
		handleFileQuotaLimitChange(modifiedKeys);

		modifiedKeys.forEach((ele: any) => {
			modifiedData[ele] = accountDetail[ele];
		});

		if (modifiedKeys && modifiedKeys?.length > 0) {
			await handleMainModifiedKeys(initAccountDetail, modifiedData);
		} else {
			if (addAliasArr.length || deleteAliasArr.length) {
				setInitAccountDetail({ ...accountDetail });
				setIsLoading(false);
				getAccountList();
				getAccountDetail(initAccountDetail?.zimbraId);
			}
			if (isPasswordChange) {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t('account_details.user_password_set', 'User password set successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
				accountDetail.userPassword = 'VALUE-BLOCKED';
				accountDetail.zimbraPasswordMustChange = 'FALSE';
			}
			setInitAccountDetail({ ...accountDetail });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		ErrorSnackbar,
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
		isGlobalAdmin,
		t
	]);
	const onUndo = (): void => {
		setAccountDetail({ ...initAccountDetail, isDefaultUserName: true });
		setDefaultCOS(!initAccountDetail.zimbraCOSId);
		setInitAccountDetail((prev: AccountType) => ({ ...prev, isDefaultUserName: true }));
	};
	const onViewMail = useCallback(() => {
		getDelegateAuthRequest(selectedAccount?.id)
			.then((data: any) => {
				if (data?.authToken?.[0]) {
					window.open(
						`https://${window.location.hostname}/service/preauth?authtoken=${data?.authToken?.[0]._content}&isredirect=1&adminPreAuth=1&redirectURL=/carbonio/`,
						'blank'
					);
				} else {
					createSnackbar({
						key: 'error',
						severity: 'error',

						label: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			})

			.catch((error) => {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [createSnackbar, selectedAccount?.id, t]);

	const accountUserType = useCallback((item: any): string => {
		if (item.zimbraIsAdminAccount === 'TRUE') return 'Admin';
		if (item.zimbraIsDelegatedAdminAccount === 'TRUE') return 'DelegatedAdmin';
		if (item.zimbraIsExternalVirtualAccount === 'TRUE') return 'External';
		if (item.zimbraIsSystemAccount === 'TRUE') return 'System';
		return 'Normal';
	}, []);

	const onDeleteAccount = useCallback(() => {
		if (userType === 'DelegatedAdmin' || userType === 'System') {
			if (
				accountUserType(selectedAccount) === 'DelegatedAdmin' ||
				accountUserType(selectedAccount) === 'System'
			) {
				setisOpenDeleteHintModel(true);
			} else {
				setIsOpenDeleteDialog(true);
			}
		} else if (userType === 'Normal') {
			setisOpenDeleteHintModel(true);
		} else {
			setIsOpenDeleteDialog(true);
		}
	}, [accountUserType, selectedAccount, userType]);

	const rights: Rights = useRightsStore((state) => state.rights);

	const allowSetPrivacy = useMemo(() => {
		const rightsConfig: Right = find(rights, { type: ACCOUNT }) ?? {
			all: [],
			inDomains: [],
			type: ACCOUNT
		};
		return (
			!!rightsConfig?.all?.[0]?.right?.find((right) => right?.n === ADMIN_LOGIN_AS) ||
			!!rightsConfig?.inDomains?.[0]?.rights?.[0].right?.find(
				(right) => right?.n === ADMIN_LOGIN_AS
			)
		);
	}, [rights]);
	const buttons = [
		allowSetPrivacy && {
			align: 'right',
			label: t('label.view_mail', 'VIEW MAIL'),
			color: 'primary',
			onClick: onViewMail
		},
		{
			align: 'right',
			color: 'error',
			label: t('label.delete', 'delete'),
			type: 'ghost',
			disabled: !accountDetail?.zimbraId || accountDetail?.zimbraId !== selectedAccount.id,
			onClick: onDeleteAccount
		},
		{
			align: 'left',
			icon: isSticky ? 'Pin3Outline' : 'Unpin3Outline',
			onClick: (): void => setIsSticky(!isSticky)
		}
	];
	const closeHandler = useCallback(() => {
		setIsOpenDeleteDialog(false);
	}, []);
	const onSuccess = useCallback(
		(message: string) => {
			createSnackbar({
				key: 'success',
				severity: 'success',
				label: message,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			setIsRequestInProgress(false);
			closeHandler();
			getAccountList();
		},
		[closeHandler, createSnackbar, getAccountList]
	);
	const onDisableAccount = useCallback(() => {
		setIsRequestInProgress(true);
		modifyAccountRequest(accountDetail?.zimbraId, { zimbraAccountStatus: CLOSED })
			.then((data) => {
				if (data?.account && Array.isArray(data?.account)) {
					onSuccess(
						t('label.account_disable_correctly', 'The account has been correctly disabled.')
					);
				}
			})
			.catch((error) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error?.message
						? error?.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [accountDetail?.zimbraId, createSnackbar, t, onSuccess]);

	const onDeleteHandler = useCallback(() => {
		setIsRequestInProgress(true);
		deleteAccount(selectedAccount?.id)
			.then((data: any) => {
				onSuccess(t('label.account_remove_correctly', 'The account has been correctly removed.'));
				setShowEditAccountView(false);
				setDefaultTab('general');
			})
			.catch((error) => {
				setIsRequestInProgress(false);
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: error.message
						? error.message
						: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),

					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
	}, [selectedAccount?.id, onSuccess, t, createSnackbar, setDefaultTab, setShowEditAccountView]);

	const handleCloseWhenDirty = useCallback(() => {
		setShowModal(true);
	}, [setShowModal]);

	const handleCloseWhenClean = useCallback(() => {
		setShowEditAccountView(false);
		setDefaultTab('general');
	}, [setDefaultTab, setShowEditAccountView]);

	const handleClose = useCallback(() => {
		if (isDirty) {
			handleCloseWhenDirty();
		} else {
			handleCloseWhenClean();
		}
	}, [isDirty, handleCloseWhenDirty, handleCloseWhenClean]);

	return (
		<>
			{(!accountDetail?.name || isLoading) && <OverlayDivision ovelayStyle={ovelayStyle} />}
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
						<Button
							size="medium"
							type="ghost"
							color={'text'}
							icon="CloseOutline"
							onClick={handleClose}
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
						items={items}
						selected={change}
						onChange={(ev: unknown, selectedId: string): void => {
							setChange(selectedId);
						}}
						onClick={setClick}
						width="100%"
						background="gray6"
					/>
					<Divider color="gray2" />
				</Container>
				<Container
					padding={{ left: 'large', right: 'large' }}
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					height="calc(100vh - 3.6rem)"
					background="white"
					style={{ overflow: 'auto' }}
				>
					{/* <Container crossAlignment="flex-start" padding={{ all: '0px' }}> */}
					<Displayer buttons={buttons} pinIcon={isSticky} />
					{change === GENERAL_SECTION && <EditAccountGeneralSection setChange={setChange} />}
					{change === PROFILE && <EditAccountContactsSection />}
					{change === CONFIGURATION && <EditAccountConfigurationSection />}
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
					{/* </Container> */}
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
			<Modal
				size="small"
				title={t('label.hey_there_are_unsaved_changes_here', 'Hey! There are unsaved changes here')}
				open={showModal}
				customFooter={
					<Container orientation="horizontal" mainAlignment="flex-end">
						<Row style={{ gap: '1rem' }}>
							<Button
								label={t('label.discard', 'Discard')}
								color="primary"
								type="outlined"
								onClick={(): void => {
									setShowModal && setShowModal(false);
									onUndo();
								}}
							/>
							<Button
								label={t('label.save_the_changes', 'Save the changes')}
								color="primary"
								onClick={(): void => {
									setShowModal && setShowModal(false);
									modifyAccountReq();
								}}
							/>
						</Row>
					</Container>
				}
				showCloseIcon
				onClose={(): void => {
					setShowModal && setShowModal(false);
				}}
			>
				<Text
					size={'extralarge'}
					overflow="break-word"
					style={{ whiteSpace: 'pre-line', textAlign: 'center', padding: '2rem 0' }}
				>
					{t(
						'label.are_you_sure_you_want_to_leave_without_saving_he_changes',
						`Are you sure you want to leave without saving he changes?`
					)}
				</Text>
			</Modal>
			{isOpenDeleteDialog && (
				<Modal
					size="medium"
					title={t('label.deleting_account_name', 'You are deleting {{name}} account', {
						name: selectedAccount?.name
					})}
					open={isOpenDeleteDialog}
					customFooter={
						<Container orientation="horizontal" mainAlignment="flex-end">
							<Row style={{ gap: '1rem' }}>
								<Button
									label={t('label.delete_it_instead', 'Delete it instead')}
									color="error"
									type="outlined"
									onClick={onDeleteHandler}
									disabled={isRequestInProgress}
								/>
								<Button
									label={t('label.close_the_account', 'Close the account')}
									color="primary"
									onClick={onDisableAccount}
									disabled={
										isRequestInProgress ||
										STATUS_COLOR[selectedAccount?.zimbraAccountStatus]?.label ===
											STATUS_COLOR?.closed?.label
									}
								/>
							</Row>
						</Container>
					}
					showCloseIcon
					onClose={closeHandler}
				>
					<Container>
						{userType === 'Admin' &&
							(accountUserType(selectedAccount) === 'System' ||
								accountUserType(selectedAccount) === 'DelegatedAdmin') && (
								<Padding bottom="medium" top="medium">
									<Text color="warning" size="extralarge" overflow="break-word">
										{t(
											'label.deleting_account_warning_content',
											'Deleting the system account could impact the system stability.'
										)}
									</Text>
								</Padding>
							)}
						<Padding bottom="medium">
							<Text size={'extralarge'} overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_1"
									defaults="Are you sure you want to delete <bold>{{name}}</bod> ?"
									components={{ bold: <strong />, name: selectedAccount?.name }}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_2"
									defaults="Deleting the account <bold>will PERMANENTLY delete</bold> all the data."
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Padding>
						<Padding bottom="medium">
							<Text size="extralarge" overflow="break-word">
								<Trans
									i18nKey="label.deleting_account_content_3"
									defaults="You can <bold>Close it to preserve</bold> the data, instead."
									components={{ bold: <strong /> }}
								/>
							</Text>
						</Padding>
						<Row padding={{ bottom: 'large' }}>
							<Icon
								icon="AlertTriangleOutline"
								size="large"
								style={{ height: '48px', width: '48px' }}
							/>
						</Row>
					</Container>
				</Modal>
			)}
			{isOpenDeleteHintModel && (
				<Modal
					size="medium"
					title={selectedAccount?.name}
					open={isOpenDeleteHintModel}
					customFooter={
						<Container orientation="horizontal" mainAlignment="flex-end">
							<Button
								label={t('label.close', 'Close')}
								color="primary"
								onClick={(): void => {
									setisOpenDeleteHintModel(false);
								}}
								disabled={
									isRequestInProgress ||
									STATUS_COLOR[selectedAccount?.zimbraAccountStatus]?.label ===
										STATUS_COLOR?.closed?.label
								}
							/>
						</Container>
					}
					showCloseIcon
					onClose={(): void => {
						setisOpenDeleteHintModel(false);
					}}
				>
					<Container>
						<Padding bottom="medium" top="medium">
							<Text style={{ textAlign: 'center' }} size={'extralarge'} overflow="break-word">
								{t(
									'label.delete_delegated_account_content',
									`The system accounts can't be deleted from here. Please visit the respective module to manage the account.`
								)}
							</Text>
						</Padding>
					</Container>
				</Modal>
			)}
		</>
	);
};
export default EditAccount;
