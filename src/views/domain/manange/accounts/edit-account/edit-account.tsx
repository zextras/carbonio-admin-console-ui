/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
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
	Padding,
	Icon
} from '@zextras/carbonio-design-system';
import { isEqual, reduce, remove, map, differenceBy } from 'lodash';
import { useDomainStore } from '../../../../../store/domain/store';
import { RouteLeavingGuard } from '../../../../ui-extras/nav-guard';

import EditAccountGeneralSection from './edit-account-general-section';
import EditAccountConfigrationSection from './edit-account-configration-section';
import EditAccountUserPrefrencesSection from './edit-account-user-pref-section';
import EditAccountSecuritySection from './edit-account-security-section';
import EditAccountDelegatesSection from './edit-account-delegates-section';

import { addAccountAliasRequest } from '../../../../../services/add-account-alias';
import { deleteAccountAliasRequest } from '../../../../../services/delete-account-alias';
import { modifyAccountRequest } from '../../../../../services/modify-account';
import { setPasswordRequest } from '../../../../../services/set-password';
import { renameAccountRequest } from '../../../../../services/rename-account';
import { AccountContext } from '../account-context';
import { getDomainList } from '../../../../../services/search-domain-service';
import { setCoreAttributes } from '../../../../../services/set-core-attributes';
import {
	ACCOUNT,
	MOBILE_CALENDAR_FEATURE_SYNC,
	MOBILE_CONTACT_FEATURE_SYNC
} from '../../../../../constants';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';

// eslint-disable-next-line no-empty-pattern
const EditAccount: FC<{
	setShowEditAccountView: any;
	selectedAccount: any;
	getAccountList: any;
	signatureItems: any;
	signatureList: any;
}> = ({
	setShowEditAccountView,
	selectedAccount,
	getAccountList,
	signatureItems,
	signatureList
}) => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const domainName = useDomainStore((state) => state.domain?.name);
	const domainList = useDomainStore((state) => state.domainList);
	const [change, setChange] = useState('general');
	const [click, setClick] = useState('');
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const conext = useContext(AccountContext);
	const { accountDetail, setAccountDetail, initAccountDetail, setInitAccountDetail } = conext;
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
			index={index}
			selected={selected}
			onClick={onClick}
			orientation="horizontal"
		>
			<Row padding="small">
				<Padding horizontal="small">
					<Icon size="medium" color={selected ? 'primary' : 'gray'} icon={item.icon} />
				</Padding>
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
			CustomComponent: ReusedDefaultTabBar,
			icon: 'InfoOutline'
		},
		{
			id: 'configuration',
			label: t('label.configuration', 'CONFIGURATION'),
			CustomComponent: ReusedDefaultTabBar,
			icon: 'OptionsOutline'
		},
		{
			id: 'user_preferences',
			label: t('label.user_preferences', 'USER PREFERENCES'),
			CustomComponent: ReusedDefaultTabBar,
			icon: 'PersonOutline'
		},
		{
			id: 'security',
			label: t('label.security', 'SECURITY'),
			CustomComponent: ReusedDefaultTabBar,
			icon: 'LockOutline'
		}
	];

	if (isAdvanced) {
		items.push({
			id: 'delegates',
			label: t('label.delegates', 'DELEGATES'),
			CustomComponent: ReusedDefaultTabBar,
			icon: 'SharedAccountOutline'
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
							: t('label.something_wrong_error_msg', 'Something went wrong. Please try again.'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
		},
		[createSnackbar, setSwitchInitOptionValue, t]
	);

	const modifyAccountReq = useCallback((): void => {
		const modifiedKeys: any = reduce(
			accountDetail,
			function (result, value, key): any {
				return isEqual(value, initAccountDetail[key]) ? result : [...result, key];
			},
			[]
		);
		const modifiedData: any = {};

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
				remove(modifiedKeys, (ele) => ele === 'password' || ele === 'repeatPassword');
			}
		}
		if (modifiedKeys.includes('uid')) {
			renameAccountRequest(initAccountDetail?.zimbraId, `${accountDetail?.uid}@${domainName}`);
			remove(modifiedKeys, (ele) => ele === 'uid');
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
			deleteAliasArr.map((aliasName) => {
				deleteAccountAliasRequest(initAccountDetail?.zimbraId, `${aliasName}`).then();
			});

			// eslint-disable-next-line array-callback-return
			addAliasArr.map((aliasName) => {
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
						getAccountList();
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
		}
	}, [
		accountDetail,
		createSnackbar,
		domainName,
		getAccountList,
		initAccountDetail,
		isAdvanced,
		modifyCoreAttributes,
		setInitAccountDetail,
		t
	]);
	const onUndo = (): void => {
		setAccountDetail({ ...initAccountDetail });
	};

	return (
		<>
			<Container
				background="gray5"
				mainAlignment="flex-start"
				style={{
					position: 'absolute',
					left: `${'max(calc(100% - 940px), 12px)'}`,
					top: '43px',
					height: 'auto',
					width: '940px',
					overflow: 'hidden',
					transition: 'left 0.2s ease-in-out',
					'box-shadow': '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
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
							onClick={(): void => setShowEditAccountView(false)}
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
					height="calc(100vh - 152px)"
					background="white"
				>
					<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
						<TabBar
							items={items}
							selected={change}
							onChange={(ev: unknown, selectedId: string): void => {
								setChange(selectedId);
							}}
							onItemClick={setClick}
							width={915}
						/>
					</Row>
					<Row width="100%">
						<Divider color="gray2" />
					</Row>
					<Container crossAlignment="flex-start" padding={{ all: '0px' }}>
						{change === 'general' && <EditAccountGeneralSection />}
						{change === 'configuration' && <EditAccountConfigrationSection />}
						{change === 'user_preferences' && (
							<EditAccountUserPrefrencesSection
								signatureItems={signatureItems}
								signatureList={signatureList}
							/>
						)}
						{change === 'security' && <EditAccountSecuritySection />}
						{change === 'delegates' && <EditAccountDelegatesSection />}
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
