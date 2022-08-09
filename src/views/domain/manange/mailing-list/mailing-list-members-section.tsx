/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Text,
	Input,
	Button,
	Table,
	Dropdown,
	SnackbarManagerContext
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce, sortedUniq } from 'lodash';
import ListRow from '../../../list/list-row';
import {
	getAllEmailFromString,
	getEmailDisplayNameFromString,
	isValidEmail
} from '../../../utility/utils';
import { MailingListContext } from './mailinglist-context';
import { RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { searchDirectory } from '../../../../services/search-directory-service';

const MailingListMembersSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const [dlm, setDlm] = useState<Array<any>>(mailingListDetail?.members);
	const [dlmTableRows, setDlmTableRows] = useState<Array<any>>([]);
	const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<Array<any>>(
		[]
	);
	const [member, setMember] = useState<string>('');
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const createSnackbar: any = useContext(SnackbarManagerContext);

	const memberHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts', 'Accounts'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		if (dlm && dlm.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				members: dlm
			}));
			const allRows = dlm.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="bold" key={item} color="#828282">
						{item}
					</Text>,
					''
				]
			}));
			setDlmTableRows(allRows);
		} else {
			setDlmTableRows([]);
			setMailingListDetail((prev: any) => ({
				...prev,
				members: []
			}));
		}
	}, [dlm, setMailingListDetail]);

	const onAdd = useCallback((): void => {
		if (member !== '') {
			const allEmails: any[] =
				member.includes('"') || member.includes("'") ? getAllEmailFromString(member) : [member];

			if (allEmails !== null && allEmails !== undefined) {
				const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
				if (inValidEmailAddress && inValidEmailAddress.length > 0) {
					createSnackbar({
						key: 'error',
						type: 'error',
						label: `${t('label.invalid_email_address', 'Invalid email address')} ${
							inValidEmailAddress[0]
						}`,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					const sortedList = sortedUniq(allEmails);
					setDlm(dlm.concat(sortedList));
				}
			} else if (allEmails === undefined) {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: `${t('label.invalid_email_address', 'Invalid email address')} ${member}`,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		}
	}, [member, createSnackbar, t, dlm]);

	const onDeleteFromList = useCallback((): void => {
		if (selectedDistributionListMember.length > 0) {
			const _dlm = dlm.filter((item: any) => !selectedDistributionListMember.includes(item));
			setDlm(_dlm);
			setSelectedDistributionListMember([]);
		}
	}, [dlm, selectedDistributionListMember]);

	const getSearchMemberList = useCallback((mem) => {
		const attrs =
			'displayName,zimbraId,zimbraAliasTargetId,cn,sn,zimbraMailHost,uid,zimbraCOSId,zimbraAccountStatus,zimbraLastLogonTimestamp,description,zimbraIsSystemAccount,zimbraIsDelegatedAdminAccount,zimbraIsAdminAccount,zimbraIsSystemResource,zimbraAuthTokenValidityValue,zimbraIsExternalVirtualAccount,zimbraMailStatus,zimbraIsAdminGroup,zimbraCalResType,zimbraDomainType,zimbraDomainName,zimbraDomainStatus';
		const types = 'accounts,distributionlists,aliases';
		const query = `(&(!(zimbraAccountStatus=closed))(|(mail=*${mem}*)(cn=*${mem}*)(sn=*${mem}*)(gn=*${mem}*)(displayName=*${mem}*)(zimbraMailDeliveryAddress=*${mem}*)(zimbraMailAlias=*${mem}*)(uid=*${mem}*)(zimbraDomainName=*${mem}*)(uid=*${mem}*)))`;

		searchDirectory(attrs, types, '', query, 0, RECORD_DISPLAY_LIMIT, 'name')
			.then((response) => response.json())
			.then((data) => {
				const result: any[] = [];

				const dl = data?.Body?.SearchDirectoryResponse?.dl;
				const account = data?.Body?.SearchDirectoryResponse?.account;
				const alias = data?.Body?.SearchDirectoryResponse?.alias;
				if (dl) {
					dl.map((item: any) => result.push(item));
				}
				if (account) {
					account.map((item: any) => result.push(item));
				}
				if (alias) {
					alias.map((item: any) => result.push(item));
				}
				setSearchMemberResult(result);
			});
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchMemberCall = useCallback(
		debounce((mem) => {
			getSearchMemberList(mem);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		if (member !== '') {
			searchMemberCall(member);
		}
	}, [member, searchMemberCall]);

	const items = searchMemberResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
				top="9px"
				right="large"
				bottom="9px"
				left="large"
				style={{
					fontFamily: 'roboto',
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '3px',
					width: 'inherit'
				}}
				onClick={(): void => {
					setMember(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<Row>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.members', 'Members')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="65%"
					>
						<Dropdown
							items={items}
							placement="bottom-start"
							maxWidth="300px"
							disableAutoFocus
							width="265px"
							style={{
								width: '100%'
							}}
						>
							<Input
								label={t('label.type_an_account_dot', 'Type an account ...')}
								backgroundColor="gray5"
								size="medium"
								value={member}
								onChange={(e: any): void => {
									setMember(e.target.value);
								}}
							/>
						</Dropdown>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						width="fit"
						padding={{ top: 'large', right: 'small' }}
					>
						<Button
							type="outlined"
							label={t('label.add', 'Add')}
							color="primary"
							icon="PlusOutline"
							iconPlacement="right"
							height={44}
							disabled={member === ''}
							onClick={onAdd}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="fit"
					>
						<Button
							type="outlined"
							label={t('label.delete', 'Delete')}
							color="error"
							icon="PlusOutline"
							iconPlacement="right"
							height={44}
							disabled={
								selectedDistributionListMember && selectedDistributionListMember.length === 0
							}
							onClick={onDeleteFromList}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Table
							rows={dlmTableRows}
							headers={memberHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListMember}
							onSelectionChange={(selected: any): void =>
								setSelectedDistributionListMember(selected)
							}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default MailingListMembersSection;
