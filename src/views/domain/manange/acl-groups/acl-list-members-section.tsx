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
import { AclListContext } from './acl-list-context';
import { RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { searchDirectory } from '../../../../services/search-directory-service';
import { searchGal } from '../../../../services/search-gal-service';
import helmetLogo from '../../../../assets/helmet_logo.svg';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

const AclListMembersSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(AclListContext);
	const { aclListDetail, setAclListDetail } = context;
	const [dlm, setDlm] = useState<Array<any>>(aclListDetail?.members);
	const [dlmTableRows, setDlmTableRows] = useState<Array<any>>([]);
	const [selectedDistributionListMember, setSelectedDistributionListMember] = useState<Array<any>>(
		[]
	);
	const [member, setMember] = useState<string>('');
	const [owner, setOwner] = useState<string>('');
	const [ownerTableRows, setOwnerTableRows] = useState<Array<any>>([]);
	const [ownersList, setOwnersList] = useState<Array<any>>(
		aclListDetail?.owners ? aclListDetail?.owners : []
	);
	const [selectedDistributionListOwner, setSelectedDistributionListOwner] = useState<Array<any>>(
		[]
	);
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [searchOwnerResult, setSearchOwnerResult] = useState<Array<any>>([]);
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
	const ownerHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.accounts_that_are_owners', 'Accounts that are owners'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

	useEffect(() => {
		if (dlm && dlm.length > 0) {
			setAclListDetail((prev: any) => ({
				...prev,
				members: dlm
			}));
			const allRows = dlm.map((item: any) => ({
				id: item,
				columns: [
					<Text
						size="medium"
						weight="light"
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
			setAclListDetail((prev: any) => ({
				...prev,
				members: []
			}));
		}
	}, [dlm, setAclListDetail]);

	useEffect(() => {
		if (ownersList && ownersList.length > 0) {
			setAclListDetail((prev: any) => ({
				...prev,
				owners: ownersList
			}));
			const allRows = ownersList.map((item: any) => ({
				id: item,
				columns: [
					<Text
						size="medium"
						weight="light"
						key={item?.id}
						color="#828282"
						onClick={(): void => {
							setSelectedDistributionListOwner([item]);
						}}
					>
						{item}
					</Text>
				]
			}));
			setOwnerTableRows(allRows);
		} else {
			setAclListDetail((prev: any) => ({
				...prev,
				owners: []
			}));
			setOwnerTableRows([]);
		}
	}, [ownersList, setAclListDetail]);

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

	const getSearchOwnerList = useCallback((searchKeyword) => {
		searchGal(searchKeyword).then((data) => {
			const contactList = data?.cn;
			if (contactList) {
				let result: any[] = [];
				result = contactList.map((item: any): any => ({
					id: item?.id,
					name: item?._attrs?.email
				}));
				setSearchOwnerResult(result);
			} else {
				setSearchMemberResult([]);
			}
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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchOwnerCall = useCallback(
		debounce((own) => {
			getSearchOwnerList(own);
		}, 700),
		[debounce]
	);
	useEffect(() => {
		if (owner !== '') {
			searchOwnerCall(owner);
		}
	}, [owner, searchOwnerCall]);

	const items = searchMemberResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '0.2rem',
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

	const ownersItems = searchOwnerResult.map((item: any, index) => ({
		id: item.id,
		label: item.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '0.2rem',
					width: 'inherit'
				}}
				onClick={(): void => {
					setOwner(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));
	const onAddOwner = useCallback((): void => {
		if (owner !== '') {
			const specialChars = /[ `'"<>,;]/;
			const allEmails: any[] = specialChars.test(owner) ? getAllEmailFromString(owner) : [owner];
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
					setOwner('');
					const sortedList = sortedUniq(allEmails);
					setOwnersList(uniq(ownersList.concat(sortedList)));
				}
			} else if (allEmails === undefined) {
				createSnackbar({
					key: 'error',
					type: 'error',
					label: `${t('label.invalid_email_address', 'Invalid email address')} ${owner}`,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		}
	}, [owner, createSnackbar, ownersList, t]);

	const onDeleteOwnerFromList = useCallback((): void => {
		if (selectedDistributionListOwner.length > 0) {
			const _dlm = ownersList.filter((item: any) => !selectedDistributionListOwner.includes(item));
			setOwnersList(_dlm);
			setSelectedDistributionListOwner([]);
		}
	}, [ownersList, selectedDistributionListOwner]);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 18.75rem)"
				background="white"
				style={{ overflow: 'auto', padding: '1rem' }}
			>
				<Row>
					<Text size="small" weight="bold">
						{t('label.members', 'Members')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="64%"
					>
						<Dropdown
							items={items}
							placement="bottom-start"
							maxWidth="18.75rem"
							disableAutoFocus
							width="16.5rem"
							style={{
								width: '100%'
							}}
						>
							<Input
								label={t('label.type_an_account_dot', 'Type an account ...')}
								backgroundColor="gray5"
								value={member}
								onChange={(e: any): void => {
									setMember(e.target.value);
								}}
							/>
						</Dropdown>
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
									selectedDistributionListMember && selectedDistributionListMember.length === 0
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
							RowFactory={CustomRowFactory}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
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
							<Padding value="3.5rem 0 0 0" width="100%">
								<Row mainAlignment="center" width="100%">
									<img src={helmetLogo} alt="logo" />
								</Row>
							</Padding>
							<Padding vertical="extralarge" width="100%">
								<Row mainAlignment="center" width="100%">
									<Text size="large" color="secondary" weight="regular">
										{t('label.there_are_not_member_here', 'There aren’t members here.')}
									</Text>
								</Row>
								<Row mainAlignment="center" width="100%">
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
				<Row padding={{ top: 'large' }}>
					<Text size="small" weight="bold">
						{t('label.owners_settings_lbl', 'Owners’ Settings')}
					</Text>
				</Row>
				<Row padding={{ top: 'small', bottom: 'medium' }}>
					<Text size="small" weight="light" color="#828282" overflow="break-word">
						{t(
							'label.owners_description_msg_1',
							'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.'
						)}
					</Text>
				</Row>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'medium', right: 'small' }}
						width="65%"
					>
						<Dropdown
							items={ownersItems}
							placement="bottom-start"
							maxWidth="18.75rem"
							disableAutoFocus
							width="16.5rem"
							style={{
								width: '100%'
							}}
						>
							<Input
								label={t('label.type_an_account_dot', 'Type an account ...')}
								backgroundColor="gray5"
								value={owner}
								onChange={(e: any): void => {
									setOwner(e.target.value);
								}}
							/>
						</Dropdown>
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
							disabled={owner === ''}
							onClick={onAddOwner}
						/>
						<Padding left="small">
							<Button
								type="outlined"
								label={t('label.delete', 'Delete')}
								color="error"
								icon="Trash2Outline"
								iconPlacement="right"
								size="large"
								onClick={onDeleteOwnerFromList}
								disabled={
									selectedDistributionListOwner && selectedDistributionListOwner.length === 0
								}
							/>
						</Padding>
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Table
							rows={ownerTableRows}
							headers={ownerHeaders}
							showCheckbox={false}
							selectedRows={selectedDistributionListOwner}
							RowFactory={CustomRowFactory}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>
				{ownerTableRows.length === 0 && (
					<ListRow>
						<Container
							background="gray6"
							height="fit-content"
							mainAlignment="center"
							crossAlignment="center"
						>
							<Padding value="3.5rem 0 0 0" width="100%">
								<Row mainAlignment="center" width="100%">
									<img src={helmetLogo} alt="logo" />
								</Row>
							</Padding>
							<Padding vertical="extralarge" width="100%">
								<Row mainAlignment="center" width="100%">
									<Text size="large" color="secondary" weight="regular">
										{t('label.there_are_no_owners', 'There aren’t owners here.')}
									</Text>
								</Row>
								<Row mainAlignment="center" width="100%">
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

export default AclListMembersSection;
