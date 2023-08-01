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

const DomainDelegatedTable: FC<{
	domainList: objectType[];
	selectedRows: any;
	onSelectionChange: (selected: string[]) => void;
	headers: {
		id: string;
		label: string;
		width: string;
		bold: boolean;
		align: string;
	}[];
}> = ({ domainList, selectedRows, onSelectionChange, headers }) => {
	const [t] = useTranslation();
	const domain = useDomainStore((state) => state.domain);
	const tableRows = useMemo(
		() =>
			domainList?.map((v: objectType, i: number) => ({
				id: v?.id,
				columns: [
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text weight="light">{v?.name}</Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text weight="light">{v.name.replace(new RegExp('__', 'g'), '').split('@')[0]}</Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text weight="light">{domain?.name}</Text>
					</Row>,
					<Row key={i} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
						<Text weight="light">{v?.description}</Text>
					</Row>
				],
				clickable: true
			})),
		[domain?.name, domainList]
	);

	return (
		<Container crossAlignment="flex-start" style={{ overflowY: 'scroll' }}>
			<Table
				headers={headers}
				rows={tableRows}
				showCheckbox={false}
				multiSelect={false}
				selectedRows={selectedRows}
				onSelectionChange={onSelectionChange}
				RowFactory={CustomRowFactory}
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
							size="large"
							width="60%"
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
		</Container>
	);
};

const ManageDelegates: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const domain = useDomainStore((state) => state.domain);
	const delegateDomainHeadersList = useMemo(() => delegateDomainHeaders(t), [t]);
	const [open, setOpen] = useState(false);
	const [isDomainDelegatedAdmin, setIsDomainDelegatedAdmin] = useState(false);
	const [isDisableRights, setisDisableRights] = useState(true);
	const [accountName, setAccountName] = useState('');
	const [distributionList, setDistributionList] = useState<objectType[]>([]);
	const [selectedOption, setSelectedOption] = useState<any>([]);
	const [accountDistributionList, setAccountDistributionList] = useState([]);
	const [sendSelectedRows, setSendSelectedRows] = useState([]);
	const [allAccount, setAllAccount] = useState([]);
	const [accountDetail, setaccountDetail] = useState<any>();
	const [loading, setLoading] = useState(false);

	const handleRevokesGrants = useCallback(() => {
		setLoading(true);
		InitDomainForDelegation('/admin/initDomainForDelegation', {
			_jsns: 'urn:zimbraAdmin',
			domain: domain?.name
		})
			.then((res: objectType) => {
				setLoading(false);
				setisDisableRights(false);
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
	}, [createSnackbar, domain?.name, t]);

	const getAccountDistributionList = useCallback(
		(id) => {
			getAccountMembershipRequest(id).then((res) => {
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
								description: des
							};
					  })
					: [];
				setAccountDistributionList(tableList || []);
			});
		},
		[distributionList]
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

	const onAdd = useCallback(async (): Promise<void> => {
		const requests = [];
		const accountData = allAccount.filter((item: objectType) => item.name === accountName);
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
		allAccount,
		accountName,
		selectedOption.value,
		createSnackbar,
		t,
		getAccountDistributionList
	]);

	const fetchDistributionList = (name: string | undefined): void => {
		const attrs =
			'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
		const types = 'distributionlists,dynamicgroups';
		const query = `(&(!(zimbraIsSystemAccount=TRUE)))`;
		searchDirectory(attrs, types, name || '', query, 0, 6, 'name').then((res) => {
			// const list = createObjectData(res.dl);
			setDistributionList(res?.dl);
		});
	};

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
		setIsDomainDelegatedAdmin(true);
		setOpen(false);
	};

	const removeAllACLs = (): void => {
		onDeleteFromList(accountDistributionList, 'all');
		setOpen(false);
	};
	const deleteHandler = (): void => {
		setAccountName('');
		setisDisableRights(true);
		setIsDomainDelegatedAdmin(true);
		setOpen(false);
	};

	const getAccountList = useCallback((): void => {
		const type = 'accounts';
		const offset = 0;
		const limit = 100;
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
		accountListDirectory(attrs, type, domain.name, '', offset, limit).then((response) => {
			setAllAccount(response.account);
		});
	}, [domain.name]);

	useEffect(() => {
		getAccountList();
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
				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container orientation="vertical" mainAlignment="space-around" height="3.625rem">
						<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
							<Row mainAlignment="flex-start" width="80%" crossAlignment="flex-start">
								<Text size="medium" weight="bold" color="gray0">
									{t('label.domain_delegates_title', 'Domain Delegates')}
								</Text>
							</Row>
							<Row mainAlignment="flex-end" crossAlignment="flex-end" width="20%">
								<Button
									label={t('label.save', 'Save')}
									color="primary"
									onClick={handleRevokesGrants}
									loading={loading}
									disabled={!isDomainDelegatedAdmin}
								/>
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
					height="calc(100% - 70px)"
					style={{ overflow: 'auto' }}
					padding={{ all: 'large' }}
				>
					<ListRow padding={{ vertical: 'large' }}>
						<Padding bottom="large">
							<Switch
								label={t(
									'label.domain_support_delegated_administration',
									'This domain supports delegated administration'
								)}
								value={isDomainDelegatedAdmin}
								onClick={(): void => {
									if (isDomainDelegatedAdmin) {
										setOpen(true);
									}
									setIsDomainDelegatedAdmin(!isDomainDelegatedAdmin);
								}}
								iconColor="primary"
							/>
						</Padding>
					</ListRow>
					<Row orientation="horizontal" width="100%" background="gray6">
						<Divider />
					</Row>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'large' }}
					>
						<Row
							mainAlignment="flex-start"
							width="100%"
							crossAlignment="flex-start"
							padding={{ vertical: 'large' }}
						>
							<Text size="medium" color="gray0">
								{t('label.administration_rights', 'Administration Rights')}
							</Text>
						</Row>
					</Row>
					<ListRow padding={{ all: '0' }}>
						<Padding right="small" width="46%">
							<Input
								label={t('label.account', 'Account')}
								value={accountName}
								background="gray5"
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
								onChange={onOptionChange}
								disabled={isDisableRights}
								onClick={(): void => {
									fetchDistributionList(domain?.name);
								}}
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
					</ListRow>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						wrap="nowrap"
						padding={{ top: 'large' }}
					>
						<DomainDelegatedTable
							domainList={accountDistributionList}
							headers={delegateDomainHeadersList}
							selectedRows={sendSelectedRows}
							onSelectionChange={(selected: any): void => {
								setSendSelectedRows(selected);
							}}
						/>
					</Row>
					{accountDistributionList?.length > 0 && (
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
					)}
				</Container>
			</Container>
		</Container>
	);
};

export default ManageDelegates;
