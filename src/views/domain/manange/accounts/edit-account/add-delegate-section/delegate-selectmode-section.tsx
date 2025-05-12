/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect, useCallback } from 'react';

import { Container, Row, Select, Text, useSnackbar } from '@zextras/carbonio-design-system';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { accountListDirectory } from '../../../../../../services/account-list-directory-service';
import DropDownInput from '../../../../../components/dropDownInput';
import { generateSnackbarFromError } from '../../../../../error/generate-snackbar-error';
import { delegateType } from '../../../../../utility/utils';
import { AccountContext } from '../../account-context';

const SelectItem = styled(Row)``;

const DelegateSelectModeSection: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const [delegateAccountList, setDelegateAccountList] = useState<any[]>([]);
	const [searchDelegateAccountName, setSearchDelegateAccountName] = useState(undefined);
	const [isDelegateAccountListExpand, setIsDelegateAccountListExpand] = useState(false);
	const [isDelegateSelect, setIsDelegateSelect] = useState(false);
	const DELEGETES_TYPE = useMemo(() => delegateType(t), [t]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(20);
	const context = useContext(AccountContext);
	const { deligateDetail, setDeligateDetail, accountDetail } = context;

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchAccountList = useCallback(
		debounce((searchText,type) => {
			if (searchText) {
				if (type == "distributionlists") {
					setSearchQuery(
						`(&(objectClass=zimbraDistributionList)(mail=*${searchText}*))`
					);
				} else {
					setSearchQuery(
						`(&(objectClass=zimbraAccount)(zimbraMailDeliveryAddress=*${searchText}*))`
					);
				}
			} else {
				setSearchQuery('');
			}
		}, 700),
		[debounce]
	);

	useEffect(() => {
		const type = deligateDetail?.grantee?.[0]?.type === 'grp' ? 'distributionlists' : 'accounts';
		searchAccountList(searchDelegateAccountName,type);
	}, [searchAccountList, searchDelegateAccountName,deligateDetail]);

	const selectedDelegateAccount = useCallback(
		(v: any): void => {
			setIsDelegateSelect(true);
			setSearchDelegateAccountName(v.name);
			setDeligateDetail((prev: any) => ({
				...prev,
				grantee: [{ name: v.name, type: deligateDetail?.grantee?.[0]?.type || '' }]
			}));
		},
		[deligateDetail, setDeligateDetail]
	);

	const getAccountList = useCallback((): void => {
		const type = deligateDetail?.grantee?.[0]?.type === 'grp' ? 'distributionlists' : 'accounts';
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';
		accountListDirectory(attrs, type, '', searchQuery, offset, limit)
			.then((data) => {
				const accountListResponse: any = data?.account || [];

				if (accountListResponse && Array.isArray(accountListResponse)) {
					const accountListArr: any[] = [];
					if (data?.dl?.length) {
						// eslint-disable-next-line no-param-reassign
						data.account = data?.dl;
					}
					data?.account.map(
						(delegateAccount: any) =>
							delegateAccount.id !== accountDetail.zimbraId &&
							accountListArr.push({
								id: delegateAccount.id,
								label: delegateAccount.name,
								customComponent: (
									<SelectItem
										style={{
											display: 'block',
											textAlign: 'left',
											height: 'inherit',
											width: 'inherit'
										}}
										onClick={(): void => {
											selectedDelegateAccount(delegateAccount);
										}}
									>
										{delegateAccount?.name}
									</SelectItem>
								)
							})
					);
					setDelegateAccountList(accountListArr);
				}
			})
			.catch((error) => {
				const snackbarConfig = generateSnackbarFromError(error, t);
				createSnackbar(snackbarConfig);
			});
	}, [
		deligateDetail?.grantee,
		searchQuery,
		offset,
		limit,
		accountDetail.zimbraId,
		selectedDelegateAccount,
		t,
		createSnackbar
	]);

	useEffect(() => {
		if(searchQuery.length > 2) getAccountList();
	}, [getAccountList, searchQuery]);

	const onGroupByChange = (v: any): any => {
		setDeligateDetail((prev: any) => ({
			...prev,
			grantee: [{ type: v, name: deligateDetail?.grantee?.[0]?.name || '' }]
		}));
		setSearchDelegateAccountName(undefined);
		if(searchQuery.length > 2) getAccountList();
	};

	const customIconDetail = {
		icon: 'GlobeOutline',
		color: 'text',
		onClick: (): void => {
			setIsDelegateAccountListExpand(!isDelegateAccountListExpand);
		},
		style: {
			width: '20px',
			height: '20px'
		}
	};
	return (
		<>
			<Container
				mainAlignment="flex-start"
				padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
			>
				<Row mainAlignment="flex-start" width="100%">
					<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
						<Text size="small" color="gray0" weight="bold">
							{t('account_details.i_want_to_create_a_delegate_for', `I want to create a delegate`)}
						</Text>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('account_details.who_will_be_delegates', 'Who will be the delegates?')}
							showCheckbox={false}
							defaultSelection={DELEGETES_TYPE.find(
								(item: any) => item.value === deligateDetail?.grantee?.[0]?.type
							)}
							onChange={onGroupByChange}
							items={DELEGETES_TYPE}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<DropDownInput
							items={delegateAccountList}
							maxWidth="19rem"
							width="17rem"
							inputLabel={t(
								'account_details.search_here_for_an_account',
								'Search here for an Account'
							)}
							onChange={(ev: any): void => {
								setIsDelegateSelect(false);
								setSearchDelegateAccountName(ev.target.value);
							}}
							inputValue={
								searchDelegateAccountName === undefined
									? deligateDetail?.grantee?.[0]?.name || ''
									: searchDelegateAccountName
							}
							isCustomIcon
							customIconDetail={customIconDetail}
						/>
					</Row>
				</Row>
			</Container>
		</>
	);
};

export default DelegateSelectModeSection;
