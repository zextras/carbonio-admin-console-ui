/* eslint-disable prefer-regex-literals */
/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Row,
	Container,
	Padding,
	Divider,
	Text,
	Switch,
	Select,
	Input,
	Button,
	Table,
	useSnackbar
} from '@zextras/carbonio-design-system';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	postSoapFetchRequest,
	soapFetch
} from '@zextras/carbonio-shell-ui';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../../../../assets/guardian.svg';
import ListRow from '../../../list/list-row';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import { delegateDomainHeaders } from '../../../utility/utils';
import DisableDelegateAdminModel from './disable-delegate-admin-model';
import { searchDirectory } from '../../../../services/search-directory-service';
import { addDistributionListMember } from '../../../../services/add-distributionlist-member-service';
import { getAccountMembershipRequest } from '../../../../services/get-account-membership';
import { removeDistributionListMember } from '../../../../services/remove-distributionlist-member-service';
import { Attribute, objectType } from '../../../../../types';
import { accountListDirectory } from '../../../../services/account-list-directory-service';
import { useDomainStore } from '../../../../store/domain/store';
import { InitDomainForDelegation } from '../../../../services/init-domain-for-delegation';
import { getAllAdminAccountRequest } from '../../../../services/get-all-admin-account-service';
import Paging from '../../../components/paging';
import { modifyAccountRequest } from '../../../../services/modify-account';

const DomainDelegatedTable: FC<{
	accountList: objectType[];
	selectedRows: any;
	onSelectionChange: (selected: string[]) => void;
	headers: {
		id: string;
		label: string;
		width: string;
		bold: boolean;
		align: string;
	}[];
}> = ({ accountList, selectedRows, onSelectionChange, headers }) => {
	const [t] = useTranslation();
	const tableRows = useMemo(
		() =>
			accountList?.map((v: objectType, i: number) => ({
				id: v?.id,
				columns: [
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text weight="light">{v?.name}</Text>
					</Row>
				],
				clickable: true
			})),
		[accountList]
	);

	return (
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			crossAlignment="flex-start"
			width="fill"
			style={{
				height: 'calc(100vh - 21.25rem)',
				position: 'relative'
			}}
		>
			<Table
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore // Need to fix it with custom soultion
				headers={headers}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
				RowFactory={CustomRowFactory}
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore // Need to fix it with custom soultion
				HeaderFactory={CustomHeaderFactory}
			/>
			{tableRows?.length === 0 && (
				<Container crossAlignment="center" mainAlignment="flex-start" style={{ marginTop: '2rem' }}>
					<Text overflow="break-word" weight="regular" size="large">
						<img src={logo} alt="logo" />
					</Text>
					<Padding all="medium" width="25.875rem">
						<Text
							color="gray1"
							overflow="break-word"
							weight="regular"
							style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
						>
							{t(
								'label.no_account_added_with_administration_rights',
								'There is no account added with administration rights.'
							)}
						</Text>
					</Padding>
				</Container>
			)}
		</Row>
	);
};

const ManageDelegates: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const domain = useDomainStore((state) => state.domain);
	const delegateDomainHeadersList = useMemo(() => delegateDomainHeaders(t), [t]);
	const [open, setOpen] = useState(false);
	const [isDisableRights, setisDisableRights] = useState(true);
	const [accountName, setAccountName] = useState('');
	const [distributionList, setDistributionList] = useState<objectType[]>([]);
	const [selectedOption, setSelectedOption] = useState<any>([]);
	const [accountDistributionList, setAccountDistributionList] = useState([]);
	const [sendSelectedRows, setSendSelectedRows] = useState([]);
	const [allAccount, setAllAccount] = useState<any>([]);
	const [allAccountDetails, setAllAccountDetails] = useState<any>([]);
	const [accountDetail, setaccountDetail] = useState<any>();
	const [loading, setLoading] = useState(false);

	const getAccountList = useCallback(
		(offsetData: number, limitData: number): void => {
			const type = 'accounts';
			const searchQuery =
				'(|(&(zimbraIsAdminAccount=TRUE))(&(zimbraIsDelegatedAdminAccount=TRUE)(!(zimbraIsAdminAccount=TRUE))))';
			const attrs =
				'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
			accountListDirectory(attrs, type, domain.name, searchQuery, offsetData, limitData).then(
				(response) => {
					if (response.account) {
						setAllAccount((accounts: any) => [...accounts, ...response.account]);
						if (response?.more) {
							getAccountList(offsetData + limitData, limitData);
						}
					}
				}
			);
		},
		[domain.name]
	);

	const getAccountDistributionList = useCallback(
		(id) => {
			getAccountMembershipRequest(id)
				.then((res) => {
					const data = res?.dl?.filter((item: objectType) => item?.via === undefined);

					const tableList = data
						? data.map((item: objectType) => {
								const selectedItem: any = distributionList.filter(
									(i: objectType) => i.name === item.name
								);
								const des = selectedItem[0].a?.filter((i: Attribute) => i.n === 'description')[0]
									._content;
								return {
									...item,
									accname: accountName.split('@')[0],
									description: des
								};
						  })
						: [];
					setAccountDistributionList(tableList || []);
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
		[accountName, createSnackbar, distributionList, t]
	);

	const createObjectData = (listData: { a: objectType[]; id: string; name: string }[]): any =>
		listData.length > 0 &&
		listData?.map((item: { a: objectType[]; id: string; name: string }): objectType => {
			const obj: objectType = {};
			item?.a?.map((data: objectType) => {
				obj[data.n] = data._content;
				return data;
			});
			obj.id = item?.id;
			obj.name = item?.name;
			return obj;
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const ModifyAccount = (id: any): any => {
		const modifiedData = {
			zimbraIsDelegatedAdminAccount: 'TRUE'
		};
		modifyAccountRequest(id, modifiedData)
			.then((data: any) => {
				if (data) {
					setAllAccount([]);
					getAccountList(0, 20);
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
	};

	const onAdd = useCallback(async (): Promise<void> => {
		const requests = [];
		const accountData = allAccountDetails.filter((item: objectType) => item.name === accountName);
		const objectData = await createObjectData(accountData);
		setaccountDetail(objectData[0]);
		requests.push(objectData);
		Promise.all(requests).then((result) => {
			if (result.length > 0) {
				const id: objectType = {
					n: 'id',
					_content: selectedOption.value
				};
				const dlmItem: objectType = {
					n: 'dlm',
					_content: accountName
				};
				addDistributionListMember(id, dlmItem)
					.then((data) => {
						if (data) {
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
							getAccountDistributionList(result[0][0]?.zimbraId);
							ModifyAccount(result[0][0]?.zimbraId);
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
		});
	}, [
		allAccountDetails,
		accountName,
		selectedOption,
		createSnackbar,
		t,
		getAccountDistributionList,
		ModifyAccount
	]);

	const fetchDistributionList = useCallback(
		(name: string | undefined, offsetData: number, limitData: number): void => {
			const attrs =
				'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
			const types = 'distributionlists,dynamicgroups';
			const query = `(&(!(zimbraIsSystemAccount=TRUE)))`;
			searchDirectory(attrs, types, name || '', query, offsetData, limitData, 'name').then(
				(res) => {
					const data = res?.dl;
					if (data) {
						setDistributionList((prevDistributionList) => [...prevDistributionList, ...data]);
						if (res.more) {
							fetchDistributionList(domain?.name, offsetData + limitData, limitData);
						}
						setisDisableRights(false);
					}
				}
			);
		},
		[domain?.name]
	);

	const options =
		distributionList?.length > 0
			? distributionList?.map((group: objectType) => ({
					label: group.name,
					value: group.id
			  }))
			: [];

	const onOptionChange = (v: string): void => {
		const it = options.find((item: objectType) => item.value === v);
		setSelectedOption(it);
	};

	const handleRevokesGrants = useCallback(() => {
		setLoading(true);
		InitDomainForDelegation('/admin/initDomainForDelegation', {
			_jsns: 'urn:zimbraAdmin',
			domain: domain?.name
		})
			.then((res: objectType) => {
				setLoading(false);
				fetchDistributionList(domain?.name, 0, 10);
				createSnackbar({
					key: 'success',
					type: 'success',
					label: res?.message
						? res?.message
						: t(
								'label.the_last_changes_has_been_saved_successfully',
								'Changes have been saved successfully'
						  ),
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			})
			.catch((error) => {
				setLoading(false);
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
	}, [createSnackbar, domain?.name, fetchDistributionList, t]);

	const onDeleteFromList = useCallback(
		(lists: objectType[], type: string) => {
			if (lists?.length > 0) {
				lists.forEach((item: objectType) => {
					const id: any = {
						n: 'id',
						_content: type === 'all' ? item.id : item
					};
					const dlmItem: any = {
						n: 'dlm',
						_content: accountDetail?.name
					};
					removeDistributionListMember(id, dlmItem)
						.then((data) => {
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
								getAccountDistributionList(accountDetail?.zimbraId);
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
				});
			}
			setSendSelectedRows([]);
		},
		[t, accountDetail, getAccountDistributionList, createSnackbar]
	);

	const closeHandler = (): void => {
		setOpen(false);
	};

	const removeAllACLs = (): void => {
		onDeleteFromList(accountDistributionList, 'all');
		setOpen(false);
	};
	const deleteHandler = (): void => {
		setAccountName('');
		setisDisableRights(true);
		setOpen(false);
	};

	const getAllAccountList = useCallback(
		(offsetData: number, limitData: number): void => {
			const type = 'accounts';
			const attrs =
				'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
			accountListDirectory(attrs, type, domain.name, '', offsetData, limitData).then((response) => {
				if (response.account) {
					setAllAccountDetails((accounts: any) => [...accounts, ...response.account]);
					if (response?.more) {
						getAllAccountList(offsetData + limitData, limitData);
					}
				}
			});
		},
		[domain.name]
	);

	useEffect(() => {
		getAllAccountList(0, 20);
		getAccountList(0, 20);
		fetchDistributionList(domain?.name, 0, 10);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Container padding={{ all: 'large' }} background="gray6" mainAlignment="flex-start">
			{accountDistributionList?.length > 0 && open && (
				<DisableDelegateAdminModel
					open={open}
					closeHandler={closeHandler}
					removeAllACLs={removeAllACLs}
					saveHandler={deleteHandler}
					modelDetail={domain}
				/>
			)}
			<Container
				orientation="column"
				background="gray6"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
			>
				<Row mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="3.625rem">
						<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
							<Row mainAlignment="flex-start" width="100%" crossAlignment="flex-start">
								<Text size="medium" weight="bold" color="gray0">
									{t('label.delegates_domain_admins', 'Delegated Domain Admins')}
								</Text>
							</Row>
						</Row>
					</Container>
				</Row>
				<Row orientation="horizontal" width="100%" background="gray6">
					<Divider />
				</Row>
				<Container
					orientation="column"
					background="gray6"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					height="calc(100% - 4.375rem)"
					style={{ overflow: 'auto' }}
					padding={{ all: 'large' }}
				>
					<ListRow padding={{ vertical: 'large' }}>
						<Padding bottom="large">
							<Button
								label={t('label.init_domain', 'INIT DOMAIN')}
								color="primary"
								onClick={handleRevokesGrants}
								loading={loading}
							/>
						</Padding>
					</ListRow>
					<Row orientation="horizontal" width="100%" background="gray6">
						<Divider />
					</Row>
					<Row mainAlignment="flex-start" width="100%" padding={{ top: 'large' }}>
						<Row
							mainAlignment="flex-start"
							width="100%"
							crossAlignment="flex-start"
							padding={{ vertical: 'large' }}
						>
							<Text size="medium" weight="bold" color="gray0">
								{t('label.administration_rights', 'Administration Rights')}
							</Text>
						</Row>
					</Row>
					{/* TODO: uncomment once we fix the delgates feature's bug completely. */}
					{/* <ListRow padding={{ all: '0' }}>
						<Padding right="small" width="46%">
							<Input
								label={t('label.account', 'Account')}
								value={accountName}
								backgroundColor="gray5"
								inputName="username"
								onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
									setAccountName(e.target.value);
								}}
								disabled={isDisableRights}
							/>
						</Padding>
						<Padding horizontal="small" width="46%">
							<Select
								items={options}
								label={t('label.access_control_lists', 'Rights (Access Control Lists)')}
								background="gray5"
								showCheckbox={false}
								selection={selectedOption}
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore // Need to fix it with custom soultion
								onChange={onOptionChange}
								disabled={isDisableRights}
							/>
						</Padding>
						<Padding left="small" width="8%">
							<Button
								type="outlined"
								label={t('label.add', 'ADD')}
								iconPlacement="right"
								width="fill"
								onClick={onAdd}
								disabled={accountName === '' || selectedOption?.length === 0 || isDisableRights}
								size="extralarge"
							/>
						</Padding>
					</ListRow> */}
					<Row
						orientation="column"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						width="100%"
						height="calc(100% - 4.375rem)"
						style={{ overflow: 'auto' }}
					>
						<DomainDelegatedTable
							accountList={allAccount}
							headers={delegateDomainHeadersList}
							selectedRows={sendSelectedRows}
							onSelectionChange={(selected: any): void => {
								setSendSelectedRows(selected);
							}}
						/>
					</Row>
					{/* TODO: uncomment once we fix the delgates feature's bug completely. */}
					{/* {allAccount?.length > 0 && (
						<>
							<ListRow padding={{ top: 'large' }}>
								<Padding left="small" width="50%">
									<Button
										disabled={sendSelectedRows?.length < 1}
										type="ghost"
										onClick={(): void => onDeleteFromList(sendSelectedRows, 'one')}
										label={t('label.remove', 'REMOVE')}
										iconPlacement="right"
										width="fill"
										size="extralarge"
										color="error"
									/>
								</Padding>
								<Padding left="small" width="50%">
									<Button
										type="outlined"
										label={t('label.remove_all', 'REMOVE ALL')}
										iconPlacement="right"
										width="fill"
										size="extralarge"
										color="error"
										onClick={(): void => onDeleteFromList(accountDistributionList, 'all')}
									/>
								</Padding>
							</ListRow>
						</>
					)} */}
				</Container>
			</Container>
		</Container>
	);
};

export default ManageDelegates;
