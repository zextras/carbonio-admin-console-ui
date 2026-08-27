/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useSelector } from '@tanstack/react-store';
import {
	Button,
	Checkbox,
	ChipInput,
	ChipInputProps,
	Container,
	Row,
} from '@zextras/ui-components';
import { useDebouncedValue } from '@zextras/ui-shared';
import { cloneDeep, find, findIndex, map, pullAt } from 'lodash-es';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAccountListDirectory } from '../../../services/use-account-list-directory';
import { useBatchDelegates } from '../../../services/use-batch-delegates';
import CustomChip from '../../components/customChip';
import { isValidEmail } from '../../utility/utils';
import { useAccountForm } from '../account-form-context';
import {
	buildDelegateSearchQuery,
	buildSimplifiedGrantBatch,
	parseDelegateDirectoryOptions,
} from './utils';

const DELEGATE_SEARCH_ATTRS =
	'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraIsSystemAccount,zimbraIsExternalVirtualAccount,zimbraCreateTimestamp,zimbraLastLogonTimestamp,zimbraMailQuota,zimbraNotes,mail';

type SimplifiedRightsActionsProps = {
	refetchGrants: () => void;
};

export const SimplifiedRightsActions = ({ refetchGrants }: SimplifiedRightsActionsProps) => {
	const [t] = useTranslation();
	const { form } = useAccountForm();
	const accountDetail = useSelector(form.store, (s) => s.values as Record<string, any>);

	const [selectedAccounts, setSelectedAccounts] = useState<any>([]);
	const [simpleSelectedList, setSimpleSelectedList] = useState<any>([]);
	const [readRightCheck, setReadRightCheck] = useState<boolean>(false);
	const [readWriteRightCheck, setReadWriteRightCheck] = useState<boolean>(false);
	const [sendRightCheck, setSendRightCheck] = useState<boolean>(false);
	const [sendBehalfRightCheck, setSendBehalfRightCheck] = useState<boolean>(false);
	const [searchText, setSearchText] = useState('');

	const debouncedSearch = useDebouncedValue(searchText, 700);
	const searchQuery = buildDelegateSearchQuery(debouncedSearch ?? '');

	const { data: options = [] } = useAccountListDirectory(
		{
			attr: DELEGATE_SEARCH_ATTRS,
			type: 'distributionlists,accounts',
			domainName: '',
			query: searchQuery,
			offset: 0,
			limit: 10,
			select: (res: any) => parseDelegateDirectoryOptions(res, accountDetail?.zimbraId),
		},
		searchQuery.length > 2,
	);

	const batchDelegates = useBatchDelegates(accountDetail?.zimbraId);

	const filterOptions = ({ textContent }: { textContent: string | null }): void => {
		setSearchText(textContent ?? '');
	};

	const addAccountGroupRights = (): void => {
		const { revokeUsrRigths, grantUsrRigths, folderUsrRights } = buildSimplifiedGrantBatch(
			simpleSelectedList,
			{ sendRightCheck, sendBehalfRightCheck, readWriteRightCheck, readRightCheck },
			accountDetail?.zimbraMailDeliveryAddress,
		);

		batchDelegates.mutate(
			{
				reqObject: {
					RevokeRightRequest: revokeUsrRigths,
					GrantRightRequest: grantUsrRigths,
					FolderActionRequest: folderUsrRights,
					_jsns: 'urn:zimbra',
				},
				otherAccount: accountDetail?.zimbraMailDeliveryAddress,
			},
			{
				onSettled: (): void => {
					refetchGrants();
				},
			},
		);
		setSelectedAccounts([]);
		setSimpleSelectedList([]);
		setReadRightCheck(false);
		setReadWriteRightCheck(false);
		setSendRightCheck(false);
	};

	return (
		<>
			<Container mainAlignment="flex-start" crossAlignment="flex-start" style={{ gap: '0.625rem' }}>
				<ChipInput
					placeholder={t(
						'account_details.start_typing_account',
						'Start typing an Account / Group to add it to the rights',
					)}
					options={options}
					disableOptions
					background="gray5"
					bottomBorderColor="gray3"
					onInputType={filterOptions as NonNullable<ChipInputProps['onInputType']>}
					value={selectedAccounts}
					onChange={(contacts: any): void => {
						const data: any = [];
						let listArr = cloneDeep(simpleSelectedList);
						map(contacts, (contact: any) => {
							data.push(contact);
							if (!find(listArr, { label: contact.label }) && find(options, { label: contact.label })) {
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

						setSearchText('');
					}}
					requireUniqueChips
					ChipComponent={CustomChip}
					maxChips={null}
				/>
			</Container>
			<Container mainAlignment="flex-start">
				<Row width="100%" padding={{ top: 'large' }} mainAlignment="space-between">
					<Row width="50%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<ds-text as="h2" size="small" color="gray0" weight="bold">
							{t('label.read_options', 'Read options')}
						</ds-text>
					</Row>
					<Row width="50%" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
						<ds-text as="h2" size="small" color="gray0" weight="bold">
							{t('label.sending_options', 'Send options')}
						</ds-text>
					</Row>
					<Row width="25%" mainAlignment="flex-start">
						<Checkbox
							iconColor="primary"
							value={readWriteRightCheck}
							onClick={(): void => {
								if (!readWriteRightCheck) {
									setReadRightCheck(false);
								}
								setReadWriteRightCheck(!readWriteRightCheck);
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
							'ADD THE ACCOUNT / GROUP WITH SELECTED RIGHTS',
						)}
						onClick={(): void => addAccountGroupRights()}
						width="fill"
						type="outlined"
						disabled={
							!(
								sendRightCheck ||
								readRightCheck ||
								readWriteRightCheck ||
								sendBehalfRightCheck
							) || !selectedAccounts?.length
						}
					/>
				</Row>
			</Container>
		</>
	);
};
