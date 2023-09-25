/* eslint-disable prefer-regex-literals */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import {
	Container,
	Row,
	Text,
	Switch,
	Select,
	Padding,
	Button,
	Divider,
	Table,
	Dropdown,
	Input,
	useSnackbar
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { AccountContext } from '../account-context';
import CustomRowFactory from '../../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../../app/shared/customTableHeaderFactory';
import { getDomainList } from '../../../../../services/search-domain-service';
import { AccountType } from '../account-types/account-types';
import { addDistributionListMember } from '../../../../../services/add-distributionlist-member-service';
import { searchDirectory } from '../../../../../services/search-directory-service';
import { getAccountMembershipRequest } from '../../../../../services/get-account-membership';
import { removeDistributionListMember } from '../../../../../services/remove-distributionlist-member-service';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';

const EditAccountAdministrationSection: FC<any> = ({ setIsLoading }) => {
	const context = useContext(AccountContext);
	const createSnackbar = useSnackbar();
	const { accountDetail, setAccountDetail, initAccountDetail, setDeleteAdministrationRights } =
		context;
	const [isDomainSelect, setIsDomainSelect] = useState(false);
	const [searchDomainName, setSearchDomainName] = useState('');
	const [domainList, setDomainList] = useState([]);
	const [distributionList, setDistributionList] = useState<any>([]);
	const [accountDistributionList, setAccountDistributionList] = useState([]);
	const [domainId, setDomainId] = useState('');
	const [sendSelectedRows, setSendSelectedRows] = useState([]);
	const [selectedOption, setSelectedOption] = useState<any>([]);
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

	const [t] = useTranslation();
	const headers: any = useMemo(
		() => [
			{
				id: 'rights',
				label: t('label.rights_access_control_lists', 'Rights (Access Control Lists)'),
				width: '48%',
				bold: true
			},
			{
				id: 'domain',
				label: t('label.domain', 'Domain'),
				width: '48%',
				bold: true
			}
		],
		[t]
	);

	const options =
		distributionList?.length > 0
			? distributionList?.map((group: any) => ({
					label: group.name,
					value: group.id
			  }))
			: [];

	const onOptionChange = (v: any): any => {
		const it = options.find((item: any) => item.value === v);
		setSelectedOption(it);
	};

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: AccountType) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);

	const getAccountDistributionList = useCallback(() => {
		getAccountMembershipRequest(accountDetail?.zimbraId).then((res) => {
			const data = res?.dl?.filter((item: any) => item?.via === undefined);
			setAccountDistributionList(data);
		});
	}, [accountDetail?.zimbraId]);

	const onAdd = useCallback((): void => {
		setIsLoading(true);
		const id: any = {
			n: 'id',
			_content: selectedOption.value
		};
		const dlmItem: any = {
			n: 'dlm',
			_content: accountDetail?.name
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
					getAccountDistributionList();
					setIsLoading(false);
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
	}, [t, accountDetail, selectedOption, getAccountDistributionList, createSnackbar, setIsLoading]);

	const fetchDistributionList = (name: string): void => {
		const attrs =
			'displayName,zimbraId,zimbraMailHost,uid,description,zimbraIsAdminGroup,zimbraMailStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount';
		const types = 'distributionlists,dynamicgroups';
		const query = `(&(!(zimbraIsSystemAccount=TRUE)))`;
		searchDirectory(attrs, types, name || '', query, 0, 6, 'name').then((res) => {
			setDistributionList(res?.dl);
		});
	};

	const tableRows = useMemo(
		() =>
			accountDistributionList?.map((v: any, i) => ({
				id: v.id,
				columns: [
					<Text key={i} weight="light">
						{v.name.replace(new RegExp('__', 'g'), '').split('@')[0]}
					</Text>,
					<Text color="text" key={i} weight="light">
						{v.name.replace(new RegExp('__', 'g'), '').split('@')[1]}
					</Text>
				],
				clickable: true
			})),
		[accountDistributionList]
	);

	const items = domainList?.map((domain: any) => ({
		id: domain.id,
		label: domain.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '0.3rem',
					width: '100%'
				}}
				onClick={(): void => {
					setDomainId(domain?.id);
					setSearchDomainName(domain?.name);
					setIsDomainSelect(true);
					fetchDistributionList(domain?.name);
				}}
			>
				{domain?.name}
			</Row>
		)
	}));

	const onDeleteFromList = useCallback(
		(lists: any, type: string) => {
			if (lists?.length > 0) {
				setIsLoading(true);
				lists.forEach((item: any) => {
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
								getAccountDistributionList();
								setIsLoading(false);
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
				});
			}
			setSendSelectedRows([]);
		},
		[t, accountDetail, getAccountDistributionList, createSnackbar, setIsLoading]
	);

	const getDomainLists = useCallback((domain: string): any => {
		getDomainList(domain, 0).then((data) => {
			const searchResponse: any = data;
			if (!!searchResponse && searchResponse?.searchTotal > 0) {
				setDomainList(searchResponse?.domain);
			} else {
				setDomainList([]);
			}
		});
	}, []);

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

	useEffect(() => {
		getDomainLists('');
		getAccountDistributionList();
	}, [getDomainLists, getAccountDistributionList, accountDetail?.name]);

	return (
		<>
			<Container
				mainAlignment="flex-start"
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
				style={{ overflow: 'auto' }}
			>
				<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('label.roles', 'Roles')}
						</Text>
					</Row>
					<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="flex-start">
						<Row width="40%" padding={{ top: 'large' }} mainAlignment="flex-start">
							<Switch
								value={accountDetail?.zimbraIsAdminAccount === 'TRUE'}
								onClick={(): void => {
									if (accountDetail?.zimbraIsAdminAccount === 'FALSE') {
										setDeleteAdministrationRights(accountDistributionList);
									} else {
										setDeleteAdministrationRights([]);
									}
									changeSwitchOption('zimbraIsAdminAccount');
									setAccountDetail((prev: AccountType) => ({
										...prev,
										zimbraIsDelegatedAdminAccount: initAccountDetail?.zimbraIsDelegatedAdminAccount
									}));
								}}
								label={t('account_details.global_administration', 'Global administration')}
								iconColor="primary"
							/>
						</Row>
					</Row>
					{isAdvanced && (
						<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="flex-start">
							<Row width="40%" mainAlignment="flex-start">
								{accountDetail?.zimbraIsAdminAccount !== 'TRUE' && (
									<Switch
										disabled={accountDetail?.zimbraIsAdminAccount === 'TRUE'}
										value={accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE'}
										onClick={(): void => changeSwitchOption('zimbraIsDelegatedAdminAccount')}
										label={t(
											'account_details.delegated_administration',
											'Delegated administration'
										)}
										iconColor="primary"
									/>
								)}
							</Row>
						</Row>
					)}
					{accountDetail?.zimbraIsAdminAccount !== 'TRUE' &&
						accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE' && (
							<Row
								width="100%"
								mainAlignment="flex-start"
								padding={{ top: 'large', bottom: 'large' }}
							>
								<Row
									width="45%"
									padding={{ top: 'large', right: 'large' }}
									mainAlignment="flex-start"
								>
									<Dropdown
										items={items}
										placement="bottom-start"
										disableAutoFocus
										width="100%"
										style={{
											width: '100%'
										}}
									>
										<Input
											label={t('label.domain', 'Domain')}
											onChange={(ev: any): void => {
												setIsDomainSelect(false);
												setDomainId('');
												setSearchDomainName(ev.target.value);
											}}
											value={searchDomainName}
											backgroundColor="gray5"
										/>
									</Dropdown>
								</Row>
								<Row
									width="45%"
									padding={{ top: 'large', right: 'large' }}
									mainAlignment="flex-start"
								>
									<Select
										disabled={options?.length < 1}
										items={options}
										background="gray5"
										label={t('label.rights_access_control_lists', 'Rights (Access Control Lists)')}
										showCheckbox={false}
										selection={selectedOption}
										onChange={onOptionChange}
									/>
								</Row>
								<Padding top="large" right="small">
									<Button
										label={t('label.add', 'Add')}
										onClick={onAdd}
										disabled={domainId === '' || selectedOption?.length === 0}
										type="outlined"
										color="primary"
										size="extralarge"
									/>
								</Padding>
							</Row>
						)}
				</Row>
				{accountDistributionList?.length > 0 &&
					accountDetail?.zimbraIsAdminAccount !== 'TRUE' &&
					accountDetail?.zimbraIsDelegatedAdminAccount === 'TRUE' && (
						<>
							<Row width="100%" padding={{ top: '2rem' }}>
								<Divider color="gray2" />
							</Row>
							<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
								<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
									<Text size="small" color="gray0" weight="bold">
										{t(
											'label.This account has Administration rights for',
											'This account has Administration rights for'
										)}
									</Text>
								</Row>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ top: 'large' }}
							>
								<Table
									rows={tableRows}
									headers={headers}
									showCheckbox={false}
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
									onSelectionChange={setSendSelectedRows}
									multiSelect={false}
									RowFactory={CustomRowFactory}
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
									HeaderFactory={CustomHeaderFactory}
								/>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								crossAlignment="center"
								padding={{ top: 'large', bottom: '3rem' }}
							>
								<Row padding={{ right: 'small' }} width="49%">
									<Padding all={'0'}>
										<Button
											disabled={sendSelectedRows?.length < 1}
											type="ghost"
											onClick={(): void => onDeleteFromList(sendSelectedRows, 'one')}
											label={t('label.remove', 'REMOVE')}
											color="error"
											width="fill"
										/>
									</Padding>
								</Row>

								<Row width="49%">
									<Button
										type="outlined"
										label={t('label.remove_all', 'REMOVE ALL')}
										onClick={(): void => onDeleteFromList(accountDistributionList, 'all')}
										color="error"
										width="fill"
									/>
								</Row>
							</Row>
						</>
					)}
			</Container>
		</>
	);
};

export default EditAccountAdministrationSection;
