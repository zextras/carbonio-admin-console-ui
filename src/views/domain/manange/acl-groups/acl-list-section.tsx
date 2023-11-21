/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
	Container,
	Text,
	Input,
	Row,
	Icon,
	Table,
	Button,
	Dropdown,
	SnackbarManagerContext,
	Select,
	ChipInput
} from '@zextras/carbonio-design-system';
import { debounce, sortedUniq, uniq } from 'lodash';
import { useTranslation } from 'react-i18next';

import { AclListContext } from './acl-list-context';
import { ALL, EMAIL, GRP, PUB } from '../../../../constants';
import { searchGal } from '../../../../services/search-gal-service';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomChip from '../../../components/customChip';
import Textarea from '../../../components/textarea';
import ListRow from '../../../list/list-row';
import { getAllEmailFromString, isValidEmail, isValidLdapQuery } from '../../../utility/utils';

const AclListSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(AclListContext);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [isValidQuery, setIsValidQuery] = useState<boolean>(true);
	const { aclListDetail, setAclListDetail } = context;
	const [dynamicListMember, setDynamicListMember] = useState<Array<any>>(
		aclListDetail?.ldapQueryMembers
	);
	const [dynamicListMemberRows, setDynamicListMemberRows] = useState<Array<any>>([]);
	const [isShowLdapQueryMessage, setIsShowLdapQueryMessage] = useState<boolean>(false);
	const [ldapQueryErrorMessage, setLdapQueryErrorMessage] = useState<string | null>('');
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [member, setMember] = useState<string>('');
	const [ownersList, setOwnersList] = useState<Array<any>>(
		aclListDetail?.owners ? aclListDetail?.owners : []
	);
	const [selectedDistributionListOwner, setSelectedDistributionListOwner] = useState<Array<any>>(
		[]
	);
	const [ownerTableRows, setOwnerTableRows] = useState<Array<any>>([]);
	const [grantEmailsList, setGrantEmailsList] = useState<any>([]);
	const [grantEmails, setGrantEmails] = useState<any>(aclListDetail?.ownerGrantEmails);
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
	const grantTypeOptions: any[] = useMemo(
		() => [
			{
				label: t('label.everyone', 'Everyone'),
				value: PUB
			},
			{
				label: t('label.members_only', 'Members only'),
				value: GRP
			},
			{
				label: t('label.internal_users_only', 'Internal Users only'),
				value: ALL
			},
			{
				label: t('label.only_there_users', 'Only these users'),
				value: EMAIL
			}
		],
		[t]
	);

	const [grantType, setGrantType] = useState<any>(aclListDetail?.ownerGrantEmailType);

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

	const changeResourceDetail = useCallback(
		(e) => {
			if (e.target.name === 'memberURL') {
				const validQuery = isValidLdapQuery(e.target.value);
				setIsValidQuery(validQuery);
				setIsShowLdapQueryMessage(!validQuery);
			}
			setAclListDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setAclListDetail]
	);

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
		if (dynamicListMember && dynamicListMember.length > 0) {
			const searchDlRows = dynamicListMember.map((item: any) => ({
				id: item?.name,
				columns: [
					<Text size="medium" weight="light" key={item?.id} color="#828282">
						{item?.name}
					</Text>,
					''
				]
			}));
			setDynamicListMemberRows(searchDlRows);
			setAclListDetail((prev: any) => ({ ...prev, ldapQueryMembers: dynamicListMember }));
		} else {
			setDynamicListMemberRows([]);
			setAclListDetail((prev: any) => ({ ...prev, ldapQueryMembers: [] }));
		}
	}, [dynamicListMember, setAclListDetail]);

	const getSearchMemberList = useCallback(
		(searchKeyword) => {
			searchGal(searchKeyword).then((data) => {
				const contactList = data?.cn;
				if (contactList) {
					let result: any[] = [];
					result = contactList.map((item: any): any => ({
						id: item?.id,
						name: item?._attrs?.email
					}));
					setSearchMemberResult(result);
					setAclListDetail((prev: any) => ({
						...prev,
						allOwnersList: aclListDetail?.allOwnersList.concat(contactList)
					}));
				} else {
					setSearchMemberResult([]);
				}
			});
		},
		[setAclListDetail, aclListDetail?.allOwnersList]
	);

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
		id: item?.id,
		label: item?.name,
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
					setMember('');
					const sortedList = sortedUniq(allEmails);
					setOwnersList(uniq(ownersList.concat(sortedList)));
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
	}, [member, createSnackbar, ownersList, t]);

	const onDeleteFromList = useCallback((): void => {
		if (selectedDistributionListOwner.length > 0) {
			const _dlm = ownersList.filter((item: any) => !selectedDistributionListOwner.includes(item));
			setOwnersList(_dlm);
			setSelectedDistributionListOwner([]);
		}
	}, [ownersList, selectedDistributionListOwner]);

	const onGrantTypeChange = useCallback(
		(v: any): any => {
			const it = grantTypeOptions.find((item: any) => item.value === v);

			setAclListDetail((prev: any) => ({
				...prev,
				ownerGrantEmailType: it
			}));
			setGrantType(it);
		},
		[grantTypeOptions, setAclListDetail]
	);

	const onEmailAdd = useCallback(
		(v) => {
			setGrantEmails(v);
			setAclListDetail((prev: any) => ({
				...prev,
				ownerGrantEmails: v
			}));
		},
		[setAclListDetail]
	);

	const searchEmailFromGal = useCallback((searchKeyword) => {
		searchGal(searchKeyword).then((data) => {
			const contactList = data?.cn;
			if (contactList) {
				let result: any[] = [];
				result = contactList.map((item: any): any => ({
					id: item?.id,
					address: item?._attrs?.email,
					lastName: item?._attrs?.email,
					firstName: item?._attrs?.email,
					label: item?._attrs?.email,
					value: {
						label: item?._attrs?.email,
						anotherProp: 'prop1',
						avatarIcon: 'People'
					}
				}));
				setGrantEmailsList(result);
			} else {
				setGrantEmailsList([]);
			}
		});
	}, []);

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
						{t('label.security_group_name', 'Security Group Name')}
					</Text>
				</Row>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large' }}
					>
						<Input
							label={t('label.displayed_name', 'Displayed Name')}
							backgroundColor="gray5"
							value={aclListDetail?.displayName}
							inputName="displayName"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.list_name', 'List Name')}
							backgroundColor="gray5"
							value={aclListDetail?.prefixName}
							inputName="prefixName"
							onChange={changeResourceDetail}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="fit"
					>
						<Icon icon="AtOutline" size="large" />
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', left: 'small' }}
					>
						<Input
							label={t('domain.type_here_a_domain', 'Type here a domain')}
							value={aclListDetail?.suffixName}
							readOnly
							backgroundColor="gray5"
						/>
					</Container>
				</ListRow>

				{aclListDetail?.dynamic && (
					<>
						<Row padding={{ top: 'large' }}>
							<Text size="small" weight="bold">
								{t('label.members', 'Members')}
							</Text>
						</Row>
						<ListRow>
							<Container padding={{ top: 'large', bottom: 'large' }}>
								<Table
									rows={dynamicListMemberRows}
									headers={memberHeaders}
									showCheckbox={false}
									RowFactory={CustomRowFactory}
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-ignore // Need to fix it with custom soultion
									HeaderFactory={CustomHeaderFactory}
								/>
							</Container>
						</ListRow>
						<Row padding={{ top: 'large' }}>
							<Text size="small" weight="bold">
								{t('label.owners_settings', 'Owners’ Settings')}
							</Text>
						</Row>
						<Row padding={{ top: 'small', bottom: 'medium' }}>
							<Text size="small" weight="light" color="#828282">
								{t(
									'label.owners_description',
									"Owners can manage the acl list's members (adding and removing emails) and modify its options."
								)}
							</Text>
						</Row>
						<ListRow>
							<Container>
								<Select
									items={grantTypeOptions}
									background="gray5"
									label={t(
										'label.who_can_send_mails_to_this_list',
										'Who can send mails TO this list?'
									)}
									showCheckbox={false}
									onChange={onGrantTypeChange}
									selection={grantType}
								/>
							</Container>

							<Container padding={{ all: 'small' }}>
								<ChipInput
									defaultValue={grantEmails}
									placeholder={t('label.type_in_the_mails', 'Type in the mails')}
									options={grantEmailsList}
									requireUniqueChips
									onChange={onEmailAdd}
									background="gray5"
									disabled={grantType?.value !== EMAIL}
									onInputType={(e: any): void => {
										searchEmailFromGal(e?.textContent);
									}}
									ChipComponent={CustomChip}
									maxChips={null}
								/>
							</Container>
						</ListRow>

						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'medium', right: 'small' }}
								width="65%"
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
									onClick={onAdd}
									disabled={member === ''}
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
									icon="Trash2Outline"
									iconPlacement="right"
									onClick={onDeleteFromList}
									disabled={
										selectedDistributionListOwner && selectedDistributionListOwner.length === 0
									}
								/>
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
					</>
				)}
				<ListRow>
					{!aclListDetail?.dynamic && (
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.share_message_to_new_member', 'Share message to new members')}
								backgroundColor="gray6"
								value={
									aclListDetail?.zimbraDistributionListSendShareMessageToNewMembers
										? t('label.yes', 'Yes')
										: t('label.no', 'No')
								}
								readOnly
							/>
						</Container>
					)}
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.hidden_from_gal', 'Hidden from GAL')}
							backgroundColor="gray6"
							value={aclListDetail?.zimbraHideInGal ? t('label.yes', 'Yes') : t('label.no', 'No')}
							readOnly
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.this_list_can_receive_email', 'This list can receive Emails')}
							backgroundColor="gray6"
							value={aclListDetail?.zimbraMailStatus ? t('label.yes', 'Yes') : t('label.no', 'No')}
							readOnly
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'small', bottom: 'medium' }}
					>
						<Input
							label={t('label.description', 'Description')}
							backgroundColor="gray5"
							value={aclListDetail?.description}
							inputName="description"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'small', bottom: 'medium' }}
					>
						<Textarea
							label={t('label.notes', 'Notes')}
							backgroundColor="gray5"
							value={aclListDetail?.zimbraNotes}
							inputName="zimbraNotes"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default AclListSection;
