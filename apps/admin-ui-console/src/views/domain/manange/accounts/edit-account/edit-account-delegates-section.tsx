/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useIsAdvanced } from '@zextras/admin-ui-bootstrap';
import {
	Container,
	Padding,
	Row,
	Button,
	Text,
	useSnackbar,
	Table,
	Divider,
	ChipInput,
	Checkbox,
	ChipInputProps
} from '@zextras/carbonio-design-system';
import { find, filter, map, debounce, cloneDeep, findIndex, pullAt } from 'lodash';
import React, {
	FC,
	useMemo,
	useContext,
	useState,
	ReactElement,
	useEffect,
	useCallback,
	useRef
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import logo from '../../../../../assets/gardian.svg';
import {
	SEND_MAILS_ONLY,
	READ_MAILS_ONLY,
	SEND_READ_MAILS,
	MANAGE_NO_SEND,
	SEND_READ_MANAGE_MAILS,
	ZIMBRA_ADMIN_URN
} from '../../../../../constants';
import { accountListDirectory } from '../../../../../services/account-list-directory-service';
import { batchService } from '../../../../../services/batch-service';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import { Section } from '../../../../app/component/section-component';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomChip from '../../../../components/customChip';
import { generateSnackbarFromError } from '../../../../error/generate-snackbar-error';
import InheritedSelect from '../../../../utility/inherited-components/inherited-select';
import { deligateSendSettings, isValidEmail } from '../../../../utility/utils';
import { AccountContext } from '../account-context';

import DelegateAddSection from './add-delegate-section/delegate-add-section';
import DelegateSelectModeSection from './add-delegate-section/delegate-selectmode-section';
import DelegateSetRightsSection from './add-delegate-section/delegate-setright-section';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('account_details.add_user_on_delegates_list', 'Add user on Delegates List')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

const EditAccountDelegatesSection: FC = () => {
	const context = useContext(AccountContext);
	const {
		identitiesList,
		accountDetail,
		getIdentitiesList,
		deligateDetail,
		setDeligateDetail,
		folderList,
		setAccountDetail,
		cosDetail,
		accSpecificDetail
	} = context;
	const [showCreateIdentity, setShowCreateIdentity] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [readWriteSelectedRows, setReadWriteSelectedRows] = useState<string[]>([]);
	const [readSelectedRows, setReadSelectedRows] = useState<string[]>([]);
	const [sendSelectedRows, setSendSelectedRows] = useState<string[]>([]);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const isAdvanced = useIsAdvanced();
	const [simpleSelectedList, setSimpleSelectedList] = useState<any>([]);
	const [identityListItem, setIdentityListItem] = useState<any>([]);
	const [isSimplified, setIsSimplified] = useState<boolean>(true);
	const [readRightCheck, setReadRightCheck] = useState<boolean>(false);
	const [readRightWriteCheck, setReadWriteRightCheck] = useState<boolean>(false);
	const [sendRightCheck, setSendRightCheck] = useState<boolean>(false);
	const [sendBehalfRightCheck, setSendBehalfRightCheck] = useState<boolean>(false);
	const DELEGATE_SEND_SETTINGS = useMemo(
		() => deligateSendSettings(t, context?.accSpecificDetail?.mail),
		[context?.accSpecificDetail?.mail, t]
	);

	useEffect(() => {
		const identitiesArr: any = [];
		identitiesList.forEach((item: any): any => {
			identitiesArr.push({
				id: item?.grantee?.[0]?.id,
				columns: [
					<Text size="medium" weight="light" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.grantee?.[0]?.name || ' '}
					</Text>,
					<Text size="medium" weight="light" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.grantee?.[0]?.type === 'usr' ? 'Single User' : 'Group'}
					</Text>,
					<Text size="medium" weight="light" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.right?.[0]?._content === 'sendAs' ? 'Send As' : ''}
						{item?.right?.[0]?._content === 'sendOnBehalfOf' ? 'Send on Behalf Of' : ''}
					</Text>,
					<Text size="medium" weight="light" key={item?.grantee?.[0]?.id} color="#414141">
						{find(
							item?.folder || [],
							(ele: any) => ele.perm.includes('r') && !ele.perm.includes('w')
						)
							? 'Read'
							: ' '}
						{find(item?.folder || [], (ele: any) => ele.perm.includes('w')) ? 'Read, Write' : ' '}
					</Text>
				],
				sendRights: !!(
					item?.right?.[0]?._content === 'sendAs' || item?.right?.[0]?._content === 'sendOnBehalfOf'
				),
				readFolder: !!find(item?.folder || [], (ele: any) => ele.perm.includes('r')),
				writeFolder: !!find(item?.folder || [], (ele: any) => ele.perm.includes('w')),
				...item,
				clickable: true
			});
			return '';
		});
		setIdentityListItem(identitiesArr);
	}, [identitiesList]);

	const headers: any = useMemo(
		() => [
			{
				id: 'accounts',
				label: t('label.Accounts', 'Accounts'),
				width: '30%',
				bold: true
			},
			{
				id: 'type',
				label: t('label.Type', 'Type'),
				width: '20%',
				bold: true
			},
			{
				id: 'rights',
				label: t('label.Rights', 'Rights'),
				width: '25%',
				bold: true
			},
			{
				id: 'sharing-options',
				label: t('label.sharing_options', 'Sharing Options'),
				width: '25%',
				bold: true
			}
		],
		[t]
	);
	const simplifiedViewTableHeader: any = useMemo(
		() => [
			{
				id: 'accounts',
				label: t('label.accounts_groups', 'Accounts / Groups'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);
	const handleCreateDelegate = (): void => {
		setEditMode(false);
		setDeligateDetail({});
		setShowCreateIdentity(true);
	};
	const handleEditDelegate = (): void => {
		setEditMode(true);
		const selectedDelegate = find(identitiesList, (o) => o?.grantee?.[0].id === selectedRows[0]);
		selectedDelegate.folderSelection = selectedDelegate?.folder?.length ? 'all_folders' : '';
		if (!selectedDelegate?.folder?.length) {
			selectedDelegate.delegeteRights = SEND_MAILS_ONLY;
		} else if (
			selectedDelegate?.folder?.length &&
			selectedDelegate?.folder?.[0]?.perm === 'r' &&
			!selectedDelegate?.right?.length
		) {
			selectedDelegate.delegeteRights = READ_MAILS_ONLY;
		} else if (selectedDelegate?.folder?.[0]?.perm === 'r') {
			selectedDelegate.delegeteRights = SEND_READ_MAILS;
		} else if (
			selectedDelegate?.folder?.[0]?.perm === 'rwidxa' &&
			!selectedDelegate?.right?.length
		) {
			selectedDelegate.delegeteRights = MANAGE_NO_SEND;
		} else if (selectedDelegate?.folder?.[0]?.perm === 'rwidxa') {
			selectedDelegate.delegeteRights = SEND_READ_MANAGE_MAILS;
		}
		setDeligateDetail(selectedDelegate);
		setShowCreateIdentity(true);
	};

	const handleDeleteeDelegate = useCallback((): void => {
		const selectedDelegate = find(identitiesList, (o) => o?.grantee?.[0].id === selectedRows[0]);
		const revokeUsrRigths: any[] = [];
		const folderUsrRights: any[] = [];

		if (selectedDelegate) {
			if (selectedDelegate?.folder?.length) {
				selectedDelegate.folder.forEach((ele: any) => {
					folderUsrRights.push({
						_jsns: 'urn:zimbraMail',
						action: {
							op: '!grant',
							id: ele.id,
							zid: ele.zid
						}
					});
				});
			}
			if (selectedDelegate?.right?.[0]?._content) {
				revokeUsrRigths.push({
					_jsns: ZIMBRA_ADMIN_URN,
					target: {
						_content: accountDetail?.zimbraMailDeliveryAddress,
						type: 'account',
						by: 'name'
					},
					grantee: {
						by: 'name',
						type: selectedDelegate?.grantee?.[0]?.type,
						_content: selectedDelegate?.grantee?.[0]?.name
					},
					right: {
						_content: selectedDelegate?.right?.[0]?._content
					}
				});
			}

			if (revokeUsrRigths.length > 0 || folderUsrRights.length > 0) {
				batchService(
					{
						RevokeRightRequest: revokeUsrRigths,
						FolderActionRequest: folderUsrRights,

						_jsns: 'urn:zimbra'
					},
					accountDetail?.zimbraMailDeliveryAddress
				);

				if (revokeUsrRigths.length > 0) setShowCreateIdentity(false);

				getIdentitiesList({
					id: accountDetail?.zimbraId,
					name: accountDetail?.zimbraMailDeliveryAddress
				});
			}

			if (!editMode) {
				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'account_details.delegate_deleted_successfully',
						'Delegate`s rights deleted successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		}
	}, [
		accountDetail?.zimbraId,
		accountDetail?.zimbraMailDeliveryAddress,
		createSnackbar,
		editMode,
		getIdentitiesList,
		identitiesList,
		selectedRows,
		t
	]);

	const handleCreateDelegateAPI = useCallback((): void => {
		if (editMode) {
			handleDeleteeDelegate();
		}

		const grantUsrRigths: any[] = [];
		const folderUsrRights: any[] = [];

		if (
			deligateDetail?.delegeteRights &&
			(deligateDetail?.delegeteRights === 'send_mails_only' ||
				deligateDetail?.delegeteRights === 'send_read_mails' ||
				deligateDetail?.delegeteRights === 'send_read_manage_mails')
		) {
			grantUsrRigths.push({
				_jsns: ZIMBRA_ADMIN_URN,
				target: {
					_content: accountDetail?.zimbraMailDeliveryAddress,
					type: 'account',
					by: 'name'
				},
				grantee: {
					by: 'name',
					type: deligateDetail?.grantee?.[0]?.type,
					_content: deligateDetail?.grantee?.[0]?.name
				},
				right: {
					_content: deligateDetail?.right?.[0]?._content
				}
			});
		}
		if (
			deligateDetail?.delegeteRights &&
			(deligateDetail?.delegeteRights === READ_MAILS_ONLY ||
				deligateDetail?.delegeteRights === SEND_READ_MAILS ||
				deligateDetail?.delegeteRights === MANAGE_NO_SEND ||
				deligateDetail?.delegeteRights === SEND_READ_MANAGE_MAILS)
		) {
			const selectedFolders = filter(folderList, { selected: true });
			const folderIds = selectedFolders.map(function (obj) {
				return obj.id;
			});

			folderUsrRights.push({
				_jsns: 'urn:zimbraMail',
				action: {
					op: 'grant',
					id: deligateDetail?.folderSelection === 'all_folders' ? '1' : folderIds.join(','),
					grant: {
						perm:
							deligateDetail?.delegeteRights === READ_MAILS_ONLY ||
							deligateDetail?.delegeteRights === SEND_MAILS_ONLY
								? 'r'
								: 'rwidxa',
						gt: deligateDetail?.grantee?.[0]?.type,
						d: deligateDetail?.grantee?.[0]?.name,
						pw: ''
					}
				}
			});
		}

		if (folderUsrRights.length > 0 || grantUsrRigths.length > 0) {
			batchService(
				{
					GrantRightRequest: grantUsrRigths,
					FolderActionRequest: folderUsrRights,
					_jsns: 'urn:zimbra'
				},
				accountDetail?.zimbraMailDeliveryAddress
			).then(() => {
				getIdentitiesList({
					id: accountDetail?.zimbraId,
					name: accountDetail?.zimbraMailDeliveryAddress
				});
				setShowCreateIdentity(false);

				createSnackbar({
					key: 'success',
					severity: 'success',
					label: editMode
						? t(
								'account_details.delegate_updated_successfully',
								'Delegate`s rights updated successfully'
							)
						: t(
								'account_details.delegate_created_successfully',
								'Delegate`s rights created successfully'
							),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		editMode,
		handleDeleteeDelegate,
		accountDetail?.zimbraMailDeliveryAddress,
		accountDetail?.zimbraId,
		getIdentitiesList,
		createSnackbar,
		t,
		accountDetail,
		deligateDetail
	]);

	const wizardSteps = useMemo(
		() => [
			{
				name: 'select-mode',
				label: t('account_details.select_mode', 'SELECT MODE'),
				icon: 'PlusOutline',
				view: DelegateSelectModeSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (): ReactElement => <></>,
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'set-rights',
				label: t('account_details.set_rights', 'SET RIGHTS'),
				icon: 'OptionsOutline',
				view: DelegateSetRightsSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (props: any): any => (
					<Button
						{...props}
						label={t('label.volume_back_button', 'BACK')}
						icon={'ChevronLeftOutline'}
						iconPlacement="left"
						disable={props.completeLoading}
						color="secondary"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.NEXT', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'add-delegate',
				label: t('account_details.ADD', 'ADD'),
				icon: 'KeyOutline',
				view: DelegateAddSection,
				clickDisabled: true,
				CancelButton: (props: any) => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={t('label.volume_cancel_button', 'CANCEL')}
						icon={'CloseOutline'}
						iconPlacement="right"
						color="secondary"
						onClick={(): void => setShowCreateIdentity(false)}
					/>
				),
				PrevButton: (props: any): any => (
					<Button
						{...props}
						label={t('label.volume_back_button', 'BACK')}
						icon={'ChevronLeftOutline'}
						iconPlacement="left"
						disable={props.completeLoading}
						color="secondary"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('account_details.ADD', 'ADD')}
						icon="PersonOutline"
						iconPlacement="right"
						onClick={(): void => handleCreateDelegateAPI()}
					/>
				)
			}
		],
		[handleCreateDelegateAPI, t]
	);

	const [selectedAccounts, setSelectedAccounts] = useState<any>([]);
	const [options, setOptions] = useState<any>([]);

	const inputRef = useRef<any>(null);

	const [searchQuery, setSearchQuery] = useState<string>('');

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccountList = useCallback(
		debounce((searchText) => {
			if (searchText.length >= 2) {
				setSearchQuery(
					`(|(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=*${searchText}*))(&(objectClass=zimbraDistributionList)(mail=*${searchText}*)))`
				);
			} else {
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);
	const filterOptions = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ textContent }: { textContent: string | null }) => {
			searchAccountList(textContent);
		},
		[searchAccountList]
	);

	const addAccountGroupRights = useCallback((): void => {
		const revokeUsrRigths: any[] = [];
		const grantUsrRigths: any[] = [];
		const folderUsrRights: any[] = [];

		simpleSelectedList?.forEach((item: any): any => {
			if (sendRightCheck || sendBehalfRightCheck) {
				revokeUsrRigths.push({
					_jsns: ZIMBRA_ADMIN_URN,
					target: {
						_content: accountDetail?.zimbraMailDeliveryAddress,
						type: 'account',
						by: 'name'
					},
					grantee: {
						by: 'name',
						type: item.type,
						_content: item?.ele?.name
					},
					right: {
						_content: sendRightCheck ? 'sendOnBehalfOf' : 'sendAs'
					}
				});
				grantUsrRigths.push({
					_jsns: ZIMBRA_ADMIN_URN,
					target: {
						_content: accountDetail?.zimbraMailDeliveryAddress,
						type: 'account',
						by: 'name'
					},
					grantee: {
						by: 'name',
						type: item.type,
						_content: item?.ele?.name
					},
					right: {
						_content: sendRightCheck ? 'sendAs' : 'sendOnBehalfOf'
					}
				});
			}
			if (readRightWriteCheck || readRightCheck) {
				folderUsrRights.push({
					_jsns: 'urn:zimbraMail',
					action: {
						op: 'grant',
						id: '1',
						grant: {
							perm: readRightWriteCheck ? 'rwidxa' : 'r',
							gt: item?.type,
							d: item?.ele?.name,
							pw: ''
						}
					}
				});
			}
		});

		batchService(
			{
				RevokeRightRequest: revokeUsrRigths,
				GrantRightRequest: grantUsrRigths,
				FolderActionRequest: folderUsrRights,
				_jsns: 'urn:zimbra'
			},
			accountDetail?.zimbraMailDeliveryAddress
		).then((res) => {
			getIdentitiesList({
				id: accountDetail?.zimbraId,
				name: accountDetail?.zimbraMailDeliveryAddress
			});
			setShowCreateIdentity(false);
		});
		setSelectedAccounts([]);
		setSimpleSelectedList([]);
		setReadRightCheck(false);
		setReadWriteRightCheck(false);
		setSendRightCheck(false);
	}, [
		simpleSelectedList,
		sendRightCheck,
		sendBehalfRightCheck,
		readRightWriteCheck,
		readRightCheck,
		accountDetail?.zimbraMailDeliveryAddress,
		accountDetail?.zimbraId,
		getIdentitiesList
	]);
	const handleSimpleDeleteDelegate = useCallback(
		(single: boolean, rightsType: string): void => {
			const selectedDelegateArr = [];
			if (rightsType === 'readWrite') {
				if (
					single &&
					find(identitiesList, (o) => o?.grantee?.[0].id === readWriteSelectedRows[0])
				) {
					selectedDelegateArr.push(
						find(identitiesList, (o) => o?.grantee?.[0].id === readWriteSelectedRows[0])
					);
				}
				if (!single) {
					selectedDelegateArr.push(
						...filter(identityListItem, { writeFolder: true, readFolder: true })
					);
				}
				setReadWriteSelectedRows([]);
			} else if (rightsType === 'read') {
				if (single && find(identitiesList, (o) => o?.grantee?.[0].id === readSelectedRows[0])) {
					selectedDelegateArr.push(
						find(identitiesList, (o) => o?.grantee?.[0].id === readSelectedRows[0])
					);
				}
				if (!single) {
					selectedDelegateArr.push(
						...filter(identityListItem, { writeFolder: false, readFolder: true })
					);
				}
				setReadSelectedRows([]);
			} else if (rightsType === 'send') {
				if (single && find(identitiesList, (o) => o?.grantee?.[0].id === sendSelectedRows[0])) {
					selectedDelegateArr.push(
						find(identitiesList, (o) => o?.grantee?.[0].id === sendSelectedRows[0])
					);
				}
				if (!single) {
					selectedDelegateArr.push(...filter(identityListItem, { sendRights: true }));
				}
				setReadSelectedRows([]);
			}

			const revokeUsrRigths: any[] = [];
			const folderUsrRights: any[] = [];

			selectedDelegateArr.forEach((selectedDelegate: any) => {
				if (selectedDelegate) {
					if (
						(rightsType === 'readWrite' || rightsType === 'read') &&
						selectedDelegate?.folder?.length
					) {
						selectedDelegate.folder.forEach((ele: any) => {
							folderUsrRights.push({
								_jsns: 'urn:zimbraMail',
								action: {
									op: '!grant',
									id: ele.id,
									zid: ele.zid
								}
							});
						});
					}
					if (rightsType === 'send' && selectedDelegate?.right?.[0]?._content) {
						revokeUsrRigths.push({
							_jsns: ZIMBRA_ADMIN_URN,
							target: {
								_content: accountDetail?.zimbraMailDeliveryAddress,
								type: 'account',
								by: 'name'
							},
							grantee: {
								by: 'name',
								type: selectedDelegate?.grantee?.[0]?.type,
								_content: selectedDelegate?.grantee?.[0]?.name
							},
							right: {
								_content: selectedDelegate?.right?.[0]?._content
							}
						});
					}
				}
			});

			if (revokeUsrRigths.length > 0 || folderUsrRights.length > 0) {
				batchService(
					{
						RevokeRightRequest: revokeUsrRigths,
						FolderActionRequest: folderUsrRights,
						_jsns: 'urn:zimbra'
					},
					accountDetail?.zimbraMailDeliveryAddress
				).then((res) => {
					getIdentitiesList({
						id: accountDetail?.zimbraId,
						name: accountDetail?.zimbraMailDeliveryAddress
					});
					if (revokeUsrRigths.length > 0) setShowCreateIdentity(false);
				});

				createSnackbar({
					key: 'success',
					severity: 'success',
					label: t(
						'account_details.delegate_deleted_successfully',
						'Delegate deleted successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		},
		[
			accountDetail?.zimbraId,
			accountDetail?.zimbraMailDeliveryAddress,
			createSnackbar,
			getIdentitiesList,
			identitiesList,
			identityListItem,
			readSelectedRows,
			readWriteSelectedRows,
			sendSelectedRows,
			t
		]
	);

	const getAccountList = useCallback((): void => {
		const type = 'distributionlists,accounts';
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
		accountListDirectory(attrs, type, '', searchQuery, 0, 10)
			.then((data) => {
				const accountListArr: any[] = [];
				data?.account?.map(
					(delegateAccount: any) =>
						delegateAccount.id !== accountDetail.zimbraId &&
						accountListArr.push({
							id: delegateAccount.id,
							label: delegateAccount.name,
							type: 'usr',
							ele: delegateAccount
						})
				);
				data?.dl?.map((delegateAccount: any) =>
					accountListArr.push({
						id: delegateAccount.id,
						label: delegateAccount.name,
						type: 'grp',
						ele: delegateAccount
					})
				);
				setOptions(accountListArr);
			})
			.catch((error) => {
				const snackbarConfig = generateSnackbarFromError(error, t);
				createSnackbar(snackbarConfig);
			});
	}, [accountDetail.zimbraId, createSnackbar, searchQuery, t]);

	useEffect(() => {
		if (searchQuery.length > 2) getAccountList();
	}, [getAccountList, searchQuery]);
	const onDeligateSendSettingsChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefDelegatedSendSaveTarget: v }));
	};
	const setEmptyValue = useCallback(
		(keyName: string) => {
			setAccountDetail((prev: any) => ({ ...prev, [keyName]: undefined }));
		},
		[setAccountDetail]
	);
	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			orientation="vertical"
			style={{ overflow: 'auto' }}
		>
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="auto"
				padding={{ top: 'large', bottom: 'large' }}
			>
				<Row width="100%">
					{!isSimplified && (
						<Text
							color="primary"
							size="small"
							weight="bold"
							onClick={(): void => setIsSimplified(true)}
							style={{ cursor: 'pointer' }}
						>
							{t('account_details.switch_advanced', 'Switch to Advanced View')}
						</Text>
					)}
					{isSimplified && (
						<Text
							color="primary"
							size="small"
							weight="bold"
							onClick={(): void => {
								setOptions([]);
								setIsSimplified(false);
							}}
							style={{ cursor: 'pointer' }}
						>
							{t('account_details.switch_simplified', 'Switch to Simplified View')}
						</Text>
					)}
				</Row>
			</Container>
			<Row
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				mainAlignment="flex-start"
				width="100%"
			>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t(`label.delegate's_general_send_settings`, `Delegate's general Send Settings`)}
					</Text>
				</Row>
			</Row>
			<Row
				width="100%"
				padding={{ bottom: 'extralarge', right: 'extralarge', left: 'large' }}
				mainAlignment="space-between"
			>
				<Row width="100%" mainAlignment="flex-start">
					<InheritedSelect
						label={t('label.delegate_send_settings', 'Delegate Send Settings')}
						items={DELEGATE_SEND_SETTINGS}
						subValue={accountDetail?.zimbraPrefDelegatedSendSaveTarget}
						inheritedValue={cosDetail.zimbraPrefDelegatedSendSaveTarget}
						fromSubValue={accSpecificDetail?.zimbraPrefDelegatedSendSaveTarget}
						background="gray5"
						selectName="zimbraPrefTimeZoneId"
						onChange={onDeligateSendSettingsChange}
						onChangeReset={(): void => setEmptyValue('zimbraPrefTimeZoneId')}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>

			{isSimplified && (
				<Container
					mainAlignment="flex-start"
					height="auto"
					padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				>
					<Row
						padding={{ right: 'extralarge', bottom: 'large', top: 'large' }}
						mainAlignment="flex-start"
						width="100%"
					>
						<Text size="small" color="gray0" weight="bold">
							{t(`label.delegate's_rights`, `Delegate's Rights`)}
						</Text>
					</Row>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						style={{ gap: '0.625rem' }}
					>
						<ChipInput
							placeholder={t(
								'account_details.start_typing_account',
								'Start typing an Account / Group to add it to the rights'
							)}
							options={options}
							disableOptions
							background="gray5"
							bottomBorderColor="gray3"
							onInputType={filterOptions}
							icon="ChevronDown"
							iconAction={filterOptions}
							inputRef={inputRef}
							value={selectedAccounts}
							onChange={(contacts: any): void => {
								const data: any = [];
								let listArr = cloneDeep(simpleSelectedList);
								map(contacts, (contact: any) => {
									data.push(contact);
									if (
										!find(listArr, { label: contact.label }) &&
										find(options, { label: contact.label })
									) {
										listArr.push(find(options, { label: contact.label }));
									}
								});
								const pullIndex: any = [];
								map(listArr, (ele: any, index) => {
									const indexEle = findIndex(contacts, { label: ele.label });
									if (indexEle < 0) {
										pullIndex.push(index);
									}
								});
								if (pullIndex.length) {
									listArr = pullAt(listArr, pullIndex);
								}
								setSimpleSelectedList(listArr);
								const filterData: any = [];
								map(data, (ele) => {
									if (isValidEmail(ele.label ?? '')) filterData.push(ele);
								});
								setSelectedAccounts(filterData);

								setSearchQuery('');
							}}
							requireUniqueChips
							ChipComponent={CustomChip}
							maxChips={null}
						/>
					</Container>
					<Container mainAlignment="flex-start">
						<Row width="100%" padding={{ top: 'large' }} mainAlignment="space-between">
							<Row
								width="50%"
								mainAlignment="flex-start"
								padding={{ top: 'large', bottom: 'large' }}
							>
								<Text size="small" color="gray0" weight="bold">
									{t('label.read_options', 'Read options')}
								</Text>
							</Row>
							<Row
								width="50%"
								mainAlignment="flex-start"
								padding={{ top: 'large', bottom: 'large' }}
							>
								<Text size="small" color="gray0" weight="bold">
									{t('label.sending_options', 'Send options')}
								</Text>
							</Row>
							<Row width="25%" mainAlignment="flex-start">
								<Checkbox
									iconColor="primary"
									value={readRightWriteCheck}
									onClick={(): void => {
										if (!readRightWriteCheck) {
											setReadRightCheck(false);
										}
										setReadWriteRightCheck(!readRightWriteCheck);
									}}
									label={t('account_details.read_write', 'Read / Write')}
								/>
							</Row>
							<Row width="25%" mainAlignment="flex-start">
								<Checkbox
									iconColor="primary"
									value={readRightCheck}
									onClick={(): void => {
										if (!readRightCheck) {
											setReadWriteRightCheck(false);
										}
										setReadRightCheck(!readRightCheck);
									}}
									label={t('account_details.read_only', 'Read Only')}
								/>
							</Row>
							<Row width="25%" mainAlignment="flex-start">
								<Checkbox
									iconColor="primary"
									value={sendRightCheck}
									onClick={(): void => {
										if (!sendRightCheck) {
											setSendBehalfRightCheck(false);
										}
										setSendRightCheck(!sendRightCheck);
									}}
									label={t('account_details.send_check', 'Send')}
								/>
							</Row>
							<Row width="25%" mainAlignment="flex-start">
								<Checkbox
									iconColor="primary"
									value={sendBehalfRightCheck}
									onClick={(): void => {
										if (!sendBehalfRightCheck) {
											setSendRightCheck(false);
										}
										setSendBehalfRightCheck(!sendBehalfRightCheck);
									}}
									label={t('account_details.send_on_behalf_of_check', 'Send on Behalf of')}
								/>
							</Row>
						</Row>
					</Container>
					<Container mainAlignment="flex-start">
						<Row width="100%" padding={{ top: 'large' }} mainAlignment="space-between">
							<Button
								label={t(
									'account_details.add_the_account_group_with_selected_rights',
									'ADD THE ACCOUNT / GROUP WITH SELECTED RIGHTS'
								)}
								onClick={(): void => addAccountGroupRights()}
								width="fill"
								type="outlined"
								disabled={
									!(
										sendRightCheck ||
										readRightCheck ||
										readRightWriteCheck ||
										sendBehalfRightCheck
									) || !selectedAccounts?.length
								}
							/>
						</Row>
					</Container>
					<Row width="100%" padding={{ top: 'medium' }}>
						<Divider color="gray2" />
					</Row>
					<Container mainAlignment="flex-start" height="auto" padding={{ bottom: '3rem' }}>
						<Container
							width="100%"
							padding={{ top: 'large', left: 'large' }}
							mainAlignment="space-between"
							crossAlignment="flex-start"
							height="auto"
							orientation="horizontal"
						>
							<Row width="30%" mainAlignment="flex-start" height="auto">
								<Row width="11rem" padding={{ bottom: 'large' }}>
									<Text weight="light" size="large" overflow="break-word">
										<Trans
											i18nKey="account_details.account_with_read_write_rights"
											defaults="Accounts with <bold>Read/Write</bold> rights"
											components={{ bold: <strong /> }}
										/>
									</Text>
								</Row>
								<Table
									rows={filter(identityListItem, { writeFolder: true, readFolder: true })}
									headers={simplifiedViewTableHeader}
									multiSelect={false}
									onSelectionChange={setReadWriteSelectedRows}
									style={{ overflow: 'auto', height: '15rem' }}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
								<Row
									width="100%"
									padding={{ top: 'large', bottom: 'large' }}
									mainAlignment="space-between"
								>
									<Row width="40%" mainAlignment="space-between">
										<Button
											type="ghost"
											label={t('account_details.remove', 'REMOVE')}
											color="error"
											disabled={!readWriteSelectedRows?.length}
											onClick={(): void => handleSimpleDeleteDelegate(true, 'readWrite')}
										/>
									</Row>
									<Row width="60%" mainAlignment="space-between">
										<Button
											type="outlined"
											label={t('account_details.remove_all', 'REMOVE ALL')}
											color="error"
											disabled={
												findIndex(identityListItem, {
													writeFolder: true,
													readFolder: true
												}) < 0
											}
											onClick={(): void => handleSimpleDeleteDelegate(false, 'readWrite')}
										/>
									</Row>
								</Row>
							</Row>
							<Row width="30%" mainAlignment="flex-start" height="auto">
								<Row width="11rem" padding={{ bottom: 'large' }}>
									<Text weight="light" size="large" overflow="break-word">
										<Trans
											i18nKey="account_details.account_with_read_only_rights"
											defaults="Accounts with <bold>Read Only</bold> rights"
											components={{ bold: <strong /> }}
										/>
									</Text>
								</Row>
								<Table
									rows={filter(identityListItem, { writeFolder: false, readFolder: true })}
									headers={simplifiedViewTableHeader}
									multiSelect={false}
									onSelectionChange={setReadSelectedRows}
									style={{ overflow: 'auto', height: '15rem' }}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
								<Row
									width="100%"
									padding={{ top: 'large', bottom: 'large' }}
									mainAlignment="space-between"
								>
									<Row width="40%" mainAlignment="space-between">
										<Button
											type="ghost"
											label={t('account_details.remove', 'REMOVE')}
											color="error"
											disabled={!readSelectedRows?.length}
											onClick={(): void => handleSimpleDeleteDelegate(true, 'read')}
										/>
									</Row>
									<Row width="60%" mainAlignment="space-between">
										<Button
											type="outlined"
											label={t('account_details.remove_all', 'REMOVE ALL')}
											color="error"
											disabled={
												findIndex(identityListItem, {
													writeFolder: false,
													readFolder: true
												}) < 0
											}
											onClick={(): void => handleSimpleDeleteDelegate(false, 'read')}
										/>
									</Row>
								</Row>
							</Row>
							<Row width="30%" mainAlignment="flex-start" height="auto">
								<Row width="16rem" padding={{ bottom: 'large' }}>
									<Text weight="light" size="large" overflow="break-word">
										<Trans
											i18nKey="account_details.account_with_send_rights"
											defaults="Account with <bold>SendAs/SendonBehalf</bold> rights on"
											components={{ bold: <strong /> }}
										/>
									</Text>
								</Row>
								<Table
									rows={filter(identityListItem, { sendRights: true })}
									headers={simplifiedViewTableHeader}
									onSelectionChange={setSendSelectedRows}
									multiSelect={false}
									style={{ overflow: 'auto', height: '15rem' }}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
								<Row
									width="100%"
									padding={{ top: 'large', bottom: 'large' }}
									mainAlignment="space-between"
								>
									<Row width="40%" mainAlignment="space-between">
										<Button
											type="ghost"
											label={t('account_details.remove', 'REMOVE')}
											color="error"
											disabled={!sendSelectedRows?.length}
											onClick={(): void => handleSimpleDeleteDelegate(true, 'send')}
										/>
									</Row>
									<Row width="60%" mainAlignment="space-between">
										<Button
											type="outlined"
											label={t('account_details.remove_all', 'REMOVE ALL')}
											color="error"
											disabled={findIndex(identityListItem, { sendRights: true }) < 0}
											onClick={(): void => handleSimpleDeleteDelegate(false, 'send')}
										/>
									</Row>
								</Row>
							</Row>
						</Container>
					</Container>
				</Container>
			)}

			{!isSimplified && isAdvanced && (
				<Container
					mainAlignment="flex-start"
					padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				>
					{!showCreateIdentity && (
						<>
							<Row
								mainAlignment="flex-start"
								padding={{ left: 'small', bottom: 'extralarge' }}
								width="100%"
							>
								<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
									<Text size="small" color="gray0" weight="bold">
										{t('label.delegates', 'DELEGATES')}
									</Text>
								</Row>
								<Row width="100%" mainAlignment="flex-end" crossAlignment="flex-end">
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.ADD_NEW', 'ADD NEW')}
											icon="PlusOutline"
											iconPlacement="right"
											color="primary"
											onClick={(): void => handleCreateDelegate()}
										/>
									</Padding>
									<Padding right="large">
										<Button
											type="outlined"
											label={t('label.EDIT', 'EDIT')}
											icon="Edit2Outline"
											iconPlacement="right"
											color="secondary"
											onClick={(): void => handleEditDelegate()}
										/>
									</Padding>
									<Button
										type="outlined"
										label={t('label.REMOVE', 'REMOVE')}
										icon="CloseOutline"
										iconPlacement="right"
										color="error"
										disabled={!selectedRows?.length}
										onClick={(): void => handleDeleteeDelegate()}
									/>
								</Row>
								<Row
									padding={{ top: 'large', left: 'large', bottom: 'extralarge' }}
									width="100%"
									mainAlignment="space-between"
								>
									{identityListItem.length !== 0 && (
										<Table
											rows={identityListItem}
											headers={headers}
											multiSelect={false}
											onSelectionChange={setSelectedRows}
											style={{ overflow: 'auto', height: '100%' }}
											RowFactory={CustomRowFactory}
											HeaderFactory={CustomHeaderFactory}
										/>
									)}
									{identityListItem.length === 0 && (
										<Container orientation="column" crossAlignment="center" mainAlignment="center">
											<Row>
												<img src={logo} alt="logo" />
											</Row>
											<Row
												padding={{ top: 'extralarge' }}
												orientation="vertical"
												crossAlignment="center"
												style={{ textAlign: 'center' }}
											>
												<Text weight="light" color="#828282" size="large" overflow="break-word">
													{t('label.this_list_is_empty', 'This list is empty.')}
												</Text>
											</Row>
											<Row
												orientation="vertical"
												crossAlignment="center"
												style={{ textAlign: 'center' }}
												padding={{ top: 'small' }}
												width="53%"
											>
												<Text weight="light" color="#828282" size="large" overflow="break-word">
													<Trans
														i18nKey="label.create_otp_list_msg"
														defaults="You can create a new OTP by clicking on <bold>NEW OTP</bold> button up here"
														components={{ bold: <strong /> }}
													/>
												</Text>
											</Row>
										</Container>
									)}
								</Row>
							</Row>
						</>
					)}
					{showCreateIdentity && (
						<>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<HorizontalWizard
									steps={wizardSteps}
									Wrapper={WizardInSection}
									setToggleWizardSection={setShowCreateIdentity}
								/>
							</Row>
						</>
					)}
				</Container>
			)}
		</Container>
	);
};

export default EditAccountDelegatesSection;
