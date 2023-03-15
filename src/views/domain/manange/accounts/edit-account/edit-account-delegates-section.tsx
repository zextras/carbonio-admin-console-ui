/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
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
	Select
} from '@zextras/carbonio-design-system';
import { find, filter, map, debounce, cloneDeep, findIndex, pullAt } from 'lodash';
import { Trans, useTranslation } from 'react-i18next';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from '../account-context';
import { HorizontalWizard } from '../../../../app/component/hwizard';
import logo from '../../../../../assets/gardian.svg';
import { Section } from '../../../../app/component/section';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';
import DelegateSelectModeSection from './add-delegate-section/delegate-selectmode-section';
import DelegateSetRightsSection from './add-delegate-section/delegate-setright-section';
import DelegateAddSection from './add-delegate-section/delegate-add-section';
import { accountListDirectory } from '../../../../../services/account-list-directory-service';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';
import { deligateSendSettings } from '../../../../utility/utils';
import {
	SEND_MAILS_ONLY,
	READ_MAILS_ONLY,
	SEND_READ_MAILS,
	MANAGE_NO_SEND,
	SEND_READ_MANAGE_MAILS
} from '../../../../../constants';

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
	const conext = useContext(AccountContext);
	const domainName = useDomainStore((state) => state.domain?.name);
	const {
		identitiesList,
		accountDetail,
		getIdentitiesList,
		deligateDetail,
		setDeligateDetail,
		folderList,
		setAccountDetail
	} = conext;
	const [showCreateIdentity, setShowCreateIdentity] = useState<boolean>(false);
	const [editMode, setEditMode] = useState<boolean>(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [readWriteSelectedRows, setReadWriteSelectedRows] = useState([]);
	const [readSelectedRows, setReadSelectedRows] = useState([]);
	const [sendSelectedRows, setSendSelectedRows] = useState([]);
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);
	const [simpleSelectedList, setSimpleSelectedList] = useState<any>([]);
	const [identityListItem, setIdentityListItem] = useState<any>([]);
	const [isSimplified, setIsSimplified] = useState<boolean>(true);
	const [readRightCheck, setReadRightCheck] = useState<boolean>(false);
	const [readRightWriteCheck, setReadWriteRightCheck] = useState<boolean>(false);
	const [sendRightCheck, setSendRightCheck] = useState<boolean>(false);
	const [sendBehalfRightCheck, setSendBehalfRightCheck] = useState<boolean>(false);
	const DELEGATE_SEND_SETTINGS = useMemo(() => deligateSendSettings(t), [t]);

	useEffect(() => {
		const identitiesArr: any = [];
		identitiesList.map((item: any): any => {
			identitiesArr.push({
				id: item?.grantee?.[0]?.id,
				columns: [
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.grantee?.[0]?.name || ' '}
					</Text>,
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.grantee?.[0]?.type === 'usr' ? 'Single User' : 'Group'}
					</Text>,
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
						{item?.right?.[0]?._content === 'sendAs' ? 'Send As' : ''}
						{item?.right?.[0]?._content === 'sendOnBehalfOf' ? 'Send on Behalf Of' : ''}
					</Text>,
					<Text size="medium" key={item?.grantee?.[0]?.id} color="#414141">
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
		if (selectedDelegate) {
			if (selectedDelegate?.folder?.length) {
				selectedDelegate.folder.forEach((ele: any) => {
					postSoapFetchRequest(
						`/service/admin/soap/FolderActionRequest`,
						{
							_jsns: 'urn:zimbraMail',
							action: {
								op: '!grant',
								id: ele.id,
								zid: ele.zid
							}
						},
						'FolderActionRequest',
						accountDetail?.zimbraId
					).then(() => {
						getIdentitiesList({
							id: accountDetail?.zimbraId,
							name: accountDetail?.zimbraMailDeliveryAddress
						});
					});
				});
			}
			if (selectedDelegate?.right?.[0]?._content) {
				postSoapFetchRequest(
					`/service/admin/soap/RevokeRightRequest`,
					{
						_jsns: 'urn:zimbraAdmin',
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
					},
					'RevokeRightRequest',
					accountDetail?.zimbraId
				).then(() => {
					setShowCreateIdentity(false);
					getIdentitiesList({
						id: accountDetail?.zimbraId,
						name: accountDetail?.zimbraMailDeliveryAddress
					});
				});
			}
			if (!editMode) {
				createSnackbar({
					key: 'success',
					type: 'success',
					label: t(
						'account_details.delegate_deleted_successfully',
						'Delegate deleted successfully'
					),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		}
	}, [accountDetail, createSnackbar, editMode, getIdentitiesList, identitiesList, selectedRows, t]);
	const handleCreateDelegateAPI = useCallback((): void => {
		if (editMode) {
			handleDeleteeDelegate();
		}
		if (
			deligateDetail?.delegeteRights &&
			(deligateDetail?.delegeteRights === 'send_mails_only' ||
				deligateDetail?.delegeteRights === 'send_read_mails' ||
				deligateDetail?.delegeteRights === 'send_read_manage_mails')
		) {
			postSoapFetchRequest(
				`/service/admin/soap/GrantRightRequest`,
				{
					_jsns: 'urn:zimbraAdmin',
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
				},
				'GrantRightRequest',
				accountDetail?.zimbraId
			).then(() => {
				getIdentitiesList({
					id: accountDetail?.zimbraId,
					name: accountDetail?.zimbraMailDeliveryAddress
				});
				setShowCreateIdentity(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: editMode
						? t('account_details.delegate_updated_successfully', 'Delegate updated successfully')
						: t('account_details.delegate_created_successfully', 'Delegate created successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
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
			postSoapFetchRequest(
				`/service/admin/soap/FolderActionRequest`,
				{
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
				},
				'FolderActionRequest',
				accountDetail?.zimbraId
			).then(() => {
				getIdentitiesList({
					id: accountDetail?.zimbraId,
					name: accountDetail?.zimbraMailDeliveryAddress
				});
				setShowCreateIdentity(false);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: editMode
						? t('account_details.delegate_updated_successfully', 'Delegate updated successfully')
						: t('account_details.delegate_created_successfully', 'Delegate created successfully'),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			});
		}
	}, [
		deligateDetail,
		editMode,
		handleDeleteeDelegate,
		accountDetail?.zimbraMailDeliveryAddress,
		accountDetail?.zimbraId,
		getIdentitiesList,
		createSnackbar,
		t,
		folderList
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
			if (searchText) {
				setSearchQuery(
					`(|(mail=*${searchText}*)(cn=*${searchText}*)(sn=*${searchText}*)(gn=*${searchText}*)(displayName=*${searchText}*)(zimbraMailDeliveryAddress=*${searchText}*))`
				);
			} else {
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);
	const filterOptions = useCallback(
		({ textContent }) => {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			searchAccountList(textContent);
		},
		[searchAccountList]
	);
	const addAccountGroupRights = useCallback((): void => {
		simpleSelectedList?.forEach((ele: any): void => {
			if (sendRightCheck || sendBehalfRightCheck) {
				postSoapFetchRequest(
					`/service/admin/soap/RevokeRightRequest`,
					{
						_jsns: 'urn:zimbraAdmin',
						target: {
							_content: accountDetail?.zimbraMailDeliveryAddress,
							type: 'account',
							by: 'name'
						},
						grantee: {
							by: 'name',
							type: ele.type,
							_content: ele?.ele?.name
						},
						right: {
							_content: sendRightCheck ? 'sendOnBehalfOf' : 'sendAs'
						}
					},
					'RevokeRightRequest',
					accountDetail?.zimbraId
				).then(() => {
					setShowCreateIdentity(false);
					getIdentitiesList({
						id: accountDetail?.zimbraId,
						name: accountDetail?.zimbraMailDeliveryAddress
					});
				});

				postSoapFetchRequest(
					`/service/admin/soap/GrantRightRequest`,
					{
						_jsns: 'urn:zimbraAdmin',
						target: {
							_content: accountDetail?.zimbraMailDeliveryAddress,
							type: 'account',
							by: 'name'
						},
						grantee: {
							by: 'name',
							type: ele.type,
							_content: ele?.ele?.name
						},
						right: {
							_content: sendRightCheck ? 'sendAs' : 'sendOnBehalfOf'
						}
					},
					'GrantRightRequest',
					accountDetail?.zimbraId
				).then(() => {
					getIdentitiesList({
						id: accountDetail?.zimbraId,
						name: accountDetail?.zimbraMailDeliveryAddress
					});
					setShowCreateIdentity(false);
				});
			}
			if (readRightWriteCheck || readRightCheck) {
				postSoapFetchRequest(
					`/service/admin/soap/FolderActionRequest`,
					{
						_jsns: 'urn:zimbraMail',
						action: {
							op: 'grant',
							id: '1',
							grant: {
								perm: readRightWriteCheck ? 'rwidxa' : 'r',
								gt: ele?.type,
								d: ele?.ele?.name,
								pw: ''
							}
						}
					},
					'FolderActionRequest',
					accountDetail?.zimbraId
				).then(() => {
					getIdentitiesList({
						id: accountDetail?.zimbraId,
						name: accountDetail?.zimbraMailDeliveryAddress
					});
					setShowCreateIdentity(false);
					createSnackbar({
						key: 'success',
						type: 'success',
						label: editMode
							? t('account_details.delegate_updated_successfully', 'Delegate updated successfully')
							: t('account_details.delegate_created_successfully', 'Delegate created successfully'),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				});
			}
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
		getIdentitiesList,
		createSnackbar,
		editMode,
		t
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
			selectedDelegateArr.forEach((selectedDelegate: any) => {
				if (selectedDelegate) {
					if (
						(rightsType === 'readWrite' || rightsType === 'read') &&
						selectedDelegate?.folder?.length
					) {
						selectedDelegate.folder.forEach((ele: any) => {
							postSoapFetchRequest(
								`/service/admin/soap/FolderActionRequest`,
								{
									_jsns: 'urn:zimbraMail',
									action: {
										op: '!grant',
										id: ele.id,
										zid: ele.zid
									}
								},
								'FolderActionRequest',
								accountDetail?.zimbraId
							).then(() => {
								getIdentitiesList({
									id: accountDetail?.zimbraId,
									name: accountDetail?.zimbraMailDeliveryAddress
								});
							});
						});
					}
					if (rightsType === 'send' && selectedDelegate?.right?.[0]?._content) {
						postSoapFetchRequest(
							`/service/admin/soap/RevokeRightRequest`,
							{
								_jsns: 'urn:zimbraAdmin',
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
							},
							'RevokeRightRequest',
							accountDetail?.zimbraId
						).then(() => {
							setShowCreateIdentity(false);
							getIdentitiesList({
								id: accountDetail?.zimbraId,
								name: accountDetail?.zimbraMailDeliveryAddress
							});
						});
					}
					createSnackbar({
						key: 'success',
						type: 'success',
						label: t(
							'account_details.delegate_deleted_successfully',
							'Delegate deleted successfully'
						),
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				}
			});
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
		accountListDirectory(attrs, type, domainName, searchQuery, 0, 10).then((data) => {
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
		});
	}, [accountDetail.zimbraId, domainName, searchQuery]);

	useEffect(() => {
		if (searchQuery) getAccountList();
	}, [getAccountList, searchQuery]);
	const onDeligateSendSettingsChange = (v: string): void => {
		setAccountDetail((prev: any) => ({ ...prev, zimbraPrefDelegatedSendSaveTarget: v }));
	};
	return (
		<Container
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			orientation="vertical"
			style={{ overflow: 'auto' }}
		>
			<Row
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				mainAlignment="flex-start"
				width="100%"
			>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.delegate_send_settings', 'Delegate Send Settings')}
					</Text>
				</Row>
			</Row>
			<Row
				width="100%"
				padding={{ bottom: 'extralarge', right: 'extralarge', left: 'large' }}
				mainAlignment="space-between"
			>
				<Row width="100%" mainAlignment="flex-start">
					<Select
						background="gray5"
						label={t('label.delegate_send_settings', 'Delegate Send Settings')}
						showCheckbox={false}
						padding={{ right: 'medium' }}
						defaultSelection={DELEGATE_SEND_SETTINGS.find(
							(item: any) => item.value === accountDetail?.zimbraPrefDelegatedSendSaveTarget
						)}
						onChange={onDeligateSendSettingsChange}
						items={DELEGATE_SEND_SETTINGS}
					/>
				</Row>
			</Row>
			<Row width="100%" padding={{ top: 'medium' }}>
				<Divider color="gray2" />
			</Row>
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
							{t('account_details.switch_simplified', 'Switch to Simplified View')}
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
							{t('account_details.switch_advanced', 'Switch to Advanced View')}
						</Text>
					)}
				</Row>
			</Container>

			{isSimplified && (
				<Container
					mainAlignment="flex-start"
					height="auto"
					padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						style={{ gap: '0.625rem' }}
						onClick={getAccountList}
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
								setSelectedAccounts(data);

								setSearchQuery('');
							}}
							requireUniqueChips
						/>
					</Container>
					<Container mainAlignment="flex-start">
						<Row
							width="100%"
							padding={{ top: 'large', left: 'large' }}
							mainAlignment="space-between"
						>
							<Row width="24%" mainAlignment="flex-start">
								<Checkbox
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
							<Row width="24%" mainAlignment="flex-start">
								<Checkbox
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
							<Row width="24%" mainAlignment="flex-start">
								<Checkbox
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
							<Row width="24%" mainAlignment="flex-start">
								<Checkbox
									value={sendBehalfRightCheck}
									onClick={(): void => {
										if (!sendBehalfRightCheck) {
											setSendRightCheck(false);
										}
										setSendBehalfRightCheck(!sendBehalfRightCheck);
									}}
									label={t('account_details.send_on_behalf_of_check', 'Send on Behalf')}
								/>
							</Row>
						</Row>
					</Container>
					<Container mainAlignment="flex-start">
						<Row
							width="100%"
							padding={{ top: 'large', left: 'large' }}
							margin={{ top: 'large' }}
							mainAlignment="space-between"
						>
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
					<Container mainAlignment="flex-start" height="auto" padding={{ bottom: 'large' }}>
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
									<Text
										weight="light"
										size="large"
										overflow="break-word"
										margin={{ bottom: 'large' }}
									>
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
									<Text
										weight="light"
										size="large"
										overflow="break-word"
										margin={{ bottom: 'large' }}
									>
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
									<Text
										weight="light"
										size="large"
										overflow="break-word"
										margin={{ bottom: 'large' }}
									>
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
											height={44}
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
											height={44}
											onClick={(): void => handleEditDelegate()}
										/>
									</Padding>
									<Button
										type="outlined"
										label={t('label.REMOVE', 'REMOVE')}
										icon="CloseOutline"
										iconPlacement="right"
										color="error"
										height={44}
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
