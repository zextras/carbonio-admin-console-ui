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
	Switch,
	Icon,
	Table,
	Padding,
	Button,
	Dropdown,
	SnackbarManagerContext,
	Select,
	ChipInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce, sortedUniq, uniq } from 'lodash';
import { MailingListContext } from './mailinglist-context';
import ListRow from '../../../list/list-row';
import { searchDirectory } from '../../../../services/search-directory-service';
import { getAllEmailFromString, isValidEmail, isValidLdapQuery } from '../../../utility/utils';
import { searchGal } from '../../../../services/search-gal-service';
import carbonioHelmet from '../../../../assets/carbonio-helmet.svg';
import { ALL, EMAIL, GRP, LDAP_QUERY, MEMBERS_ONLY, PUB } from '../../../../constants';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';

const MailingListSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [domainList, setDomainList] = useState([]);
	const [isValidQuery, setIsValidQuery] = useState<boolean>(true);
	const { mailingListDetail, setMailingListDetail } = context;
	const [dynamicListMember, setDynamicListMember] = useState<Array<any>>(
		mailingListDetail?.ldapQueryMembers
	);
	const [dynamicListMemberRows, setDynamicListMemberRows] = useState<Array<any>>([]);
	const [isShowLdapQueryMessage, setIsShowLdapQueryMessage] = useState<boolean>(false);
	const [ldapQueryErrorMessage, setLdapQueryErrorMessage] = useState<string>('');
	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [member, setMember] = useState<string>('');
	const [ownersList, setOwnersList] = useState<Array<any>>(
		mailingListDetail?.owners ? mailingListDetail?.owners : []
	);
	const [selectedDistributionListOwner, setSelectedDistributionListOwner] = useState<Array<any>>(
		[]
	);
	const [ownerTableRows, setOwnerTableRows] = useState<Array<any>>([]);
	const [grantEmailsList, setGrantEmailsList] = useState<any>([]);
	const [grantEmails, setGrantEmails] = useState<any>(mailingListDetail?.ownerGrantEmails);
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

	const [grantType, setGrantType] = useState<any>(mailingListDetail?.ownerGrantEmailType);

	useEffect(() => {
		if (ownersList && ownersList.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				owners: ownersList
			}));
			const allRows = ownersList.map((item: any) => ({
				id: item,
				columns: [
					<Text
						size="medium"
						weight="bold"
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
			setMailingListDetail((prev: any) => ({
				...prev,
				owners: []
			}));
			setOwnerTableRows([]);
		}
	}, [ownersList, setMailingListDetail]);

	const changeResourceDetail = useCallback(
		(e) => {
			if (e.target.name === 'memberURL') {
				const validQuery = isValidLdapQuery(e.target.value);
				setIsValidQuery(validQuery);
				setIsShowLdapQueryMessage(!validQuery);
			}
			setMailingListDetail((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
		},
		[setMailingListDetail]
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

	const getMemberFromLdapQuery = useCallback(() => {
		const query = mailingListDetail?.memberURL.replace('ldap:///??sub?', '');
		searchDirectory(
			'cn,description,name,zimbraId',
			'accounts,distributionlists,dynamicgroups,accounts,aliases,dynamicgroups,resources',
			'',
			query
		).then((data) => {
			const allList: any[] = [];
			const account = data?.account;
			const dl = data?.dl;
			const alias = data?.alias;
			const calresource = data?.calresource;
			const errorFault = data?.Body?.Fault;
			if (errorFault) {
				setIsShowLdapQueryMessage(true);
				setLdapQueryErrorMessage(t('label.query_is_not_valid', 'Query is not valid'));
			} else {
				setIsShowLdapQueryMessage(false);
				setLdapQueryErrorMessage('');
			}
			if (dl) {
				dl.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
			}
			if (account) {
				account.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
			}
			if (alias) {
				alias.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
			}
			if (calresource) {
				calresource.map((item: any) => allList.push({ id: item?.id, name: item?.name }));
			}
			if (allList && allList.length > 0) {
				setDynamicListMember(allList);
			} else {
				setDynamicListMember([]);
			}
		});
	}, [mailingListDetail?.memberURL, t]);

	useEffect(() => {
		if (dynamicListMember && dynamicListMember.length > 0) {
			const searchDlRows = dynamicListMember.map((item: any) => ({
				id: item?.name,
				columns: [
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item?.name}
					</Text>,
					''
				]
			}));
			setDynamicListMemberRows(searchDlRows);
			setMailingListDetail((prev: any) => ({ ...prev, ldapQueryMembers: dynamicListMember }));
		} else {
			setDynamicListMemberRows([]);
			setMailingListDetail((prev: any) => ({ ...prev, ldapQueryMembers: [] }));
		}
	}, [dynamicListMember, setMailingListDetail]);

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
					setMailingListDetail((prev: any) => ({
						...prev,
						allOwnersList: mailingListDetail?.allOwnersList.concat(contactList)
					}));
				} else {
					setSearchMemberResult([]);
				}
			});
		},
		[setMailingListDetail, mailingListDetail?.allOwnersList]
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

			setMailingListDetail((prev: any) => ({
				...prev,
				ownerGrantEmailType: it
			}));
			setGrantType(it);
		},
		[grantTypeOptions, setMailingListDetail]
	);

	const onEmailAdd = useCallback(
		(v) => {
			setGrantEmails(v);
			setMailingListDetail((prev: any) => ({
				...prev,
				ownerGrantEmails: v
			}));
		},
		[setMailingListDetail]
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
						{t('label.mailing_list_name', 'Mailing List Name')}
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
							value={mailingListDetail?.displayName}
							size="medium"
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
							value={mailingListDetail?.prefixName}
							size="medium"
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
							value={mailingListDetail?.suffixName}
							readOnly
							backgroundColor="gray5"
						/>
					</Container>
				</ListRow>
				{mailingListDetail?.dynamic && (
					<>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'medium', bottom: 'medium' }}
							>
								<Switch
									value={mailingListDetail?.zimbraHideInGal}
									label={t('label.hidden_from_gal', 'Hidden from GAL')}
									onClick={(): void => {
										setMailingListDetail((prev: any) => ({
											...prev,
											zimbraHideInGal: !mailingListDetail?.zimbraHideInGal
										}));
									}}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Container
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								padding={{ top: 'medium', bottom: 'medium' }}
							>
								<Switch
									value={mailingListDetail?.zimbraMailStatus}
									label={t('label.can_receive_email', 'Can receive email')}
									onClick={(): void => {
										setMailingListDetail((prev: any) => ({
											...prev,
											zimbraMailStatus: !mailingListDetail?.zimbraMailStatus
										}));
									}}
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
									label={t('label.list_url', "Mailing List's URL")}
									backgroundColor="gray5"
									value={mailingListDetail?.memberURL}
									size="medium"
									inputName="memberURL"
									onChange={changeResourceDetail}
									hasError={!isValidQuery}
									CustomIcon={(): any => (
										<Icon
											icon="CheckmarkOutline"
											size="large"
											color="grey"
											onClick={getMemberFromLdapQuery}
										/>
									)}
								/>
							</Container>
						</ListRow>
						<ListRow>
							<Text size="small" weight="regular" color="gray1">
								{`${t('label.example_lbl', 'Example:')} ${LDAP_QUERY}`}
							</Text>
						</ListRow>
						{isShowLdapQueryMessage && (
							<Row>
								<Container mainAlignment="flex-start" crossAlignment="flex-start" width="fill">
									<Padding>
										<Text size="extrasmall" weight="regular" color="error">
											{ldapQueryErrorMessage}
										</Text>
									</Padding>
								</Container>
							</Row>
						)}
					</>
				)}
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'medium', bottom: 'medium' }}
					>
						<Switch
							value={mailingListDetail?.dynamic}
							label={t('label.dynamic_mode', 'Dynamic Mode')}
							onClick={(): void => {
								setMailingListDetail((prev: any) => ({
									...prev,
									dynamic: !mailingListDetail?.dynamic
								}));
							}}
						/>
					</Container>
				</ListRow>

				{mailingListDetail?.dynamic && (
					<>
						<Row padding={{ top: 'large' }}>
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
							<Container padding={{ top: 'large', bottom: 'large' }}>
								<Table
									rows={dynamicListMemberRows}
									headers={memberHeaders}
									showCheckbox={false}
									RowFactory={CustomRowFactory}
									HeaderFactory={CustomHeaderFactory}
								/>
							</Container>
						</ListRow>
						<Row padding={{ top: 'large' }}>
							<Text
								size="small"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								weight="bold"
							>
								{t('label.owners_settings', 'Owners’ Settings')}
							</Text>
						</Row>
						<Row padding={{ top: 'small', bottom: 'medium' }}>
							<Text
								size="small"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								weight="light"
								color="#828282"
							>
								{t(
									'label.owners_description',
									"Owners can manage the mailing list's members (adding and removing emails) and modify its options."
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
									height={44}
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
									HeaderFactory={CustomHeaderFactory}
								/>
							</Container>
						</ListRow>
					</>
				)}

				{ownerTableRows.length === 0 && mailingListDetail?.dynamic && (
					<ListRow>
						<Container
							height="100%"
							mainAlignment="center"
							crossAlignment="center"
							background="gray6"
							padding={{ top: 'large' }}
						>
							<Text
								overflow="break-word"
								weight="normal"
								size="large"
								style={{ whiteSpace: 'pre-line', textAlign: 'center', fontFamily: 'roboto' }}
							>
								<img src={carbonioHelmet} alt="logo" />
							</Text>
							<Padding bottom="medium">
								<Text
									color="#828282"
									overflow="break-word"
									weight="light"
									style={{ fontSize: '18px' }}
								>
									{t('label.there_are_not_owner_here', 'There aren’t owners here.')}
								</Text>
							</Padding>
							<Padding bottom="small">
								<Text
									color="#828282"
									overflow="break-word"
									weight="light"
									style={{ fontSize: '18px' }}
								>
									{t(
										'label.search_for_user_add_button',
										'Search for a user and click on the ADD button.'
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
				)}
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'small', bottom: 'medium' }}
					>
						<Input
							label={t('label.notes', 'Notes')}
							backgroundColor="gray5"
							value={mailingListDetail?.zimbraNotes}
							size="medium"
							inputName="zimbraNotes"
							onChange={changeResourceDetail}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default MailingListSection;
