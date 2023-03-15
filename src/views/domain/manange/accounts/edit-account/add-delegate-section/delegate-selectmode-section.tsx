/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect, useCallback } from 'react';
import {
	Container,
	Input,
	Row,
	Select,
	Text,
	Icon,
	Dropdown
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';
import { useDomainStore } from '../../../../../../store/domain/store';
import { accountListDirectory } from '../../../../../../services/account-list-directory-service';
import { AccountContext } from '../../account-context';
import { delegateType } from '../../../../../utility/utils';

const SelectItem = styled(Row)``;
const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const DelegateSelectModeSection: FC = () => {
	const domainName = useDomainStore((state) => state.domain?.name);

	const [t] = useTranslation();
	const [delegateAccountList, setDelegateAccountList] = useState<any[]>([]);
	const [searchDelegateAccountName, setSearchDelegateAccountName] = useState(undefined);
	const [isDelegateAccountListExpand, setIsDelegateAccountListExpand] = useState(false);
	const [isDelegateSelect, setIsDelegateSelect] = useState(false);
	const DELEGETES_TYPE = useMemo(() => delegateType(t), [t]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [offset, setOffset] = useState<number>(0);
	const [limit, setLimit] = useState<number>(20);
	const conext = useContext(AccountContext);
	const { deligateDetail, setDeligateDetail, accountDetail } = conext;

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

	useEffect(() => {
		searchAccountList(searchDelegateAccountName);
	}, [searchAccountList, searchDelegateAccountName]);

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
		accountListDirectory(attrs, type, domainName, searchQuery, offset, limit).then((data) => {
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
										fontFamily: 'roboto',
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
		});
	}, [
		deligateDetail?.grantee,
		domainName,
		searchQuery,
		offset,
		limit,
		accountDetail.zimbraId,
		selectedDelegateAccount
	]);

	useEffect(() => {
		getAccountList();
	}, [getAccountList, searchQuery]);

	const onGroupByChange = (v: any): any => {
		setDeligateDetail((prev: any) => ({
			...prev,
			grantee: [{ type: v, name: deligateDetail?.grantee?.[0]?.name || '' }]
		}));
		setSearchDelegateAccountName(undefined);
		getAccountList();
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
							{t(
								'account_details.i_want_to_create_a_delegate_for',
								`I want to create a delegate for`
							)}
						</Text>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="flex-start">
						<Select
							background="gray5"
							label={t('account_details.who_will_be_delegates', 'Who will be the delegates?')}
							showCheckbox={false}
							padding={{ right: 'medium' }}
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
						<Dropdown
							items={delegateAccountList}
							placement="bottom-start"
							maxWidth="19rem"
							disableAutoFocus
							width="17rem"
							style={{
								width: '100%'
							}}
						>
							<Input
								label={t(
									'account_details.search_here_for_an_account',
									'Search here for an Account'
								)}
								onChange={(ev: any): void => {
									setIsDelegateSelect(false);
									setSearchDelegateAccountName(ev.target.value);
								}}
								CustomIcon={(): any => (
									<CustomIcon
										icon="GlobeOutline"
										size="large"
										color="text"
										onClick={(): void => {
											setIsDelegateAccountListExpand(!isDelegateAccountListExpand);
										}}
									/>
								)}
								value={
									searchDelegateAccountName === undefined
										? deligateDetail?.grantee?.[0]?.name || ''
										: searchDelegateAccountName
								}
								backgroundColor="gray5"
							/>
						</Dropdown>
					</Row>
				</Row>
			</Container>
		</>
	);
};

export default DelegateSelectModeSection;
