/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	CustomHeaderFactory,
	DropDownInput,
	HoverableRowFactory,
	ListRow,
	Padding,
	Row,
	Table,
	useSnackbar
} from '@zextras/ui-components';
import { uniq } from 'lodash-es';
import React, { type FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
	type DirectorySearchConfig,
	useDirectoryEmailSearch
} from '../use-directory-email-search';
import { HelmetEmptyState } from './helmet-empty-state';
import { MailingListContext } from './mailinglist-context';
import { parseEmailInput } from './parse-email-input';

const WIZARD_MEMBER_SEARCH_CONFIG: DirectorySearchConfig = {
	attrs:
		'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSid,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus',
	types: 'accounts,distributionlists,aliases',
	buildQuery: (mem: string): string =>
		`(&(!(zimbraAccountStatus=closed))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)(uid=*${mem}*)(zimbraDomainName=*${mem}*)(uid=*${mem}*)))`
};

const MembersSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const dlm = mailingListDetail?.members ?? [];
	const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<Array<any>>(
		[]
	);
	const createSnackbar = useSnackbar();
	const { searchValue: member, setSearchValue: setMember, items } =
		useDirectoryEmailSearch(WIZARD_MEMBER_SEARCH_CONFIG);

	const memberHeaders: any[] = [
		{
			id: 'members',
			label: t('label.accounts', 'Accounts'),
			width: '100%',
			bold: true
		}
	];

	const dlmTableRows: Array<any> = (dlm ?? []).map((item: any) => ({
		id: item,
		columns: [
			<ds-text
				as="span"
				size="medium"
				weight="light"
				key={item}
				color="#828282"
				onClick={(): void => {
					setSelectedDistributionListMember([item]);
				}}
			>
				{item}
			</ds-text>,
			''
		]
	}));

	const onAdd = (): void => {
		if (member === '') return;
		const parsed = parseEmailInput(member);
		if (parsed.type === 'undefined') {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: `${t('label.invalid_email_address', 'Invalid email address')} ${member}`,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		if (parsed.type === 'invalid') {
			createSnackbar({
				key: 'error',
				severity: 'error',
				label: `${t('label.invalid_email_address', 'Invalid email address')} ${
					parsed.firstInvalid
				}`,
				autoHideTimeout: 3000,
				hideButton: true,
				replace: true
			});
			return;
		}
		const sortedList = parsed.emails;
		setMailingListDetail((prev: any) => ({
			...prev,
			members: uniq((prev.members ?? []).concat(sortedList))
		}));
		setMember('');
	};

	const onDeleteFromList = (): void => {
		if (selectedDistributionListMember.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				members: (prev.members ?? []).filter(
					(item: any) => !selectedDistributionListMember.includes(item)
				)
			}));
			setSelectedDistributionListMember([]);
		}
	};

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 13rem)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<ds-text as="h3" size="small" weight="bold">
						{t('label.members', 'Members')}
					</ds-text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="64%"
					>
						<DropDownInput
							width="100%"
							items={items}
							inputLabel={t('label.type_an_account_dot', 'Type an account ...')}
							size="medium"
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setMember(e.target.value);
							}}
							inputValue={member}
							isCustomIcon={false}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						padding={{ top: 'large' }}
						orientation="horizontal"
						width="35%"
					>
						<Button
							type="outlined"
							label={t('label.add', 'Add')}
							color="primary"
							icon="PlusOutline"
							iconPlacement="right"
							size="large"
							disabled={member === ''}
							onClick={onAdd}
						/>
						<Padding left="small">
							<Button
								type="outlined"
								label={t('label.delete', 'Delete')}
								color="error"
								icon="PlusOutline"
								iconPlacement="right"
								size="large"
								disabled={
									selectedDistributionListMember?.length === 0
								}
								onClick={onDeleteFromList}
							/>
						</Padding>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large', right: 'small' }}>
						<Table
							rows={dlmTableRows}
							headers={memberHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListMember}
							RowFactory={HoverableRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>
				{dlmTableRows.length === 0 && (
					<ListRow>
						<HelmetEmptyState
							firstMessage={t('label.there_are_not_member_here', "There aren't members here.")}
							secondMessage={t(
								'label.search_for_user_and_clic_to_add',
								'Search for a user and click on the ADD button.'
							)}
						/>
					</ListRow>
				)}
			</Container>
		</Container>
	);
};

export default MembersSection;
