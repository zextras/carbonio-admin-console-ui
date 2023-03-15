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
	SnackbarManagerContext,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce, sortedUniq, uniq } from 'lodash';
import ListRow from '../../../list/list-row';
import {
	getAllEmailFromString,
	getEmailDisplayNameFromString,
	isValidEmail
} from '../../../utility/utils';
import { MailingListContext } from './mailinglist-context';
import { RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { searchDirectory } from '../../../../services/search-directory-service';
import helmetLogo from '../../../../assets/helmet_logo.svg';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

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
					<Text
						size="medium"
						weight="bold"
						key={item}
						color="#828282"
						onClick={(): void => {
							setSelectedDistributionListMember([item]);
						}}
					>
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
			const specialChars = /[ `'"<>,;]/;
			const allEmails: any[] = specialChars.test(member) ? getAllEmailFromString(member) : [member];
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
					setDlm(uniq(dlm.concat(sortedList)));
					setMember('');
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

		searchDirectory(attrs, types, '', query, 0, RECORD_DISPLAY_LIMIT, 'name').then((data) => {
			const result: any[] = [];

			const dl = data?.dl;
			const account = data?.account;
			const alias = data?.alias;
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
							size="large"
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
							size="large"
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
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>
				{dlmTableRows.length === 0 && (
					<ListRow>
						<Container
							background="gray6"
							height="fit-content"
							mainAlignment="center"
							crossAlignment="center"
						>
							<Padding value="57px 0 0 0" width="100%">
								<Row takeAvwidth="fill" mainAlignment="center" width="100%">
									<img src={helmetLogo} alt="logo" />
								</Row>
							</Padding>
							<Padding vertical="extralarge" width="100%">
								<Row takeAvwidth="fill" mainAlignment="center" width="100%">
									<Text size="large" color="secondary" weight="regular">
										{t('label.there_are_not_member_here', 'There aren’t members here.')}
									</Text>
								</Row>
								<Row takeAvwidth="fill" mainAlignment="center" width="100%">
									<Text size="large" color="secondary" weight="regular">
										{t(
											'label.search_for_user_and_clic_to_add',
											'Search for a user and click on the ADD button.'
										)}
									</Text>
								</Row>
							</Padding>
						</Container>
					</ListRow>
				)}
			</Container>
		</Container>
	);
};

export default MailingListMembersSection;
