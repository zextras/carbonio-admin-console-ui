/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Button,
	Container,
	Divider,
	Padding,
	Row,
	Select,
	Switch,
	Table,
	Text,
	useSnackbar} from '@zextras/carbonio-design-system';
import { debounce, sortedUniq, uniq } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import helmetLogo from '../../../../assets/helmet_logo.svg';
import { ALL, EMAIL, GRP, PUB } from '../../../../constants';
import { searchGal } from '../../../../services/search-gal-service';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import DropDownInput from '../../../components/dropDownInput';
import ListRow from '../../../list/list-row';
import { getAllEmailFromString, isValidEmail } from '../../../utility/utils';
import { MailingListContext } from './mailinglist-context';

const MailingListSettingsSection: FC<any> = () => {
	const { t } = useTranslation();
	const createSnackbar = useSnackbar();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const [member, setMember] = useState<string>('');
	const [ownerTableRows, setOwnerTableRows] = useState<Array<any>>([]);
	const [ownersList, setOwnersList] = useState<Array<any>>(
		mailingListDetail?.owners ? mailingListDetail?.owners : []
	);
	const [selectedDistributionListOwner, setSelectedDistributionListOwner] = useState<Array<any>>(
		[]
	);

	const [searchMemberResult, setSearchMemberResult] = useState<Array<any>>([]);
	const [grantType, setGrantType] = useState<any>(mailingListDetail?.ownerGrantEmailType);
	const [searchGrantEmailResult, setSearchGrantEmailResult] = useState<Array<any>>([]);
	const [grantEmailItem, setGrantEmailItem] = useState<string>('');
	const [grantEmailTableRows, setGrantEmailTableRows] = useState<Array<any>>([]);
	const [selectedGrantEmail, setSelectedGrantEmail] = useState<Array<any>>([]);
	const [grantEmailsList, setGrantEmailsList] = useState<any>(
		mailingListDetail?.ownerGrantEmails ? mailingListDetail?.ownerGrantEmails : []
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

	const grantEmailHeaders: any[] = useMemo(
		() => [
			{
				id: 'grantEmail',
				label: t('label.who_can_send_mails_to_list ', 'Who can send mails TO this list?'),
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
			setMailingListDetail((prev: any) => ({
				...prev,
				owners: []
			}));
			setOwnerTableRows([]);
		}
	}, [ownersList, setMailingListDetail]);

	const onAdd = useCallback((): void => {
		if (member !== '') {
			const specialChars = /[ `'"<>,;]/;
			const allEmails: any[] = specialChars.test(member) ? getAllEmailFromString(member) : [member];
			if (allEmails !== null && allEmails !== undefined) {
				const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
				if (inValidEmailAddress && inValidEmailAddress.length > 0) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						// eslint-disable-next-line sonarjs/no-duplicate-string
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
					severity: 'error',
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

	const getSearchMemberList = useCallback(
		(searchKeyword: string) => {
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
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '0.188rem',
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

	const grantItems = searchGrantEmailResult.map((item: any, index) => ({
		id: item?.id,
		label: item?.name,
		customComponent: (
			<Row
				style={{
					display: 'block',
					textAlign: 'left',
					height: 'inherit',
					padding: '0.188rem',
					width: 'inherit'
				}}
				onClick={(): void => {
					setGrantEmailItem(item?.name);
				}}
			>
				{item?.name}
			</Row>
		)
	}));

	const searchEmailFromGal = useCallback((searchKeyword: string) => {
		searchGal(searchKeyword).then((data) => {
			const contactList = data?.cn;
			if (contactList) {
				let result: any[] = [];
				result = contactList.map((item: any): any => ({
					id: item?.id,
					name: item?._attrs?.email
				}));
				setSearchGrantEmailResult(result);
			} else {
				setSearchGrantEmailResult([]);
			}
		});
	}, []);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const searchGrantEmail = useCallback(
		debounce((searchWord) => {
			searchEmailFromGal(searchWord);
		}, 700),
		[debounce]
	);

	useEffect(() => {
		if (grantEmailItem !== '') {
			searchGrantEmail(grantEmailItem);
		}
	}, [grantEmailItem, searchGrantEmail]);

	const onAddGrantEmail = useCallback(() => {
		if (grantEmailItem !== '') {
			const specialChars = /[ `'"<>,;]/;
			const allEmails: any[] = specialChars.test(grantEmailItem)
				? getAllEmailFromString(grantEmailItem)
				: [grantEmailItem];
			if (allEmails !== null && allEmails !== undefined) {
				const inValidEmailAddress = allEmails.filter((item: any) => !isValidEmail(item));
				if (inValidEmailAddress && inValidEmailAddress.length > 0) {
					createSnackbar({
						key: 'error',
						severity: 'error',
						label: `${t('label.invalid_email_address', 'Invalid email address')} ${
							inValidEmailAddress[0]
						}`,
						autoHideTimeout: 3000,
						hideButton: true,
						replace: true
					});
				} else {
					setGrantEmailItem('');
					const sortedList = sortedUniq(allEmails);
					setGrantEmailsList(uniq(grantEmailsList.concat(sortedList)));
				}
			} else if (allEmails === undefined) {
				createSnackbar({
					key: 'error',
					severity: 'error',
					label: `${t('label.invalid_email_address', 'Invalid email address')} ${grantEmailItem}`,
					autoHideTimeout: 3000,
					hideButton: true,
					replace: true
				});
			}
		}
	}, [grantEmailsList, createSnackbar, grantEmailItem, t]);

	const onDeleteFromGrantEmail = useCallback(() => {
		if (selectedGrantEmail.length > 0) {
			const _dlm = grantEmailsList.filter((item: any) => !selectedGrantEmail.includes(item));
			setGrantEmailsList(_dlm);
			setSelectedGrantEmail([]);
		}
	}, [selectedGrantEmail, grantEmailsList]);

	useMemo(() => {
		if (grantEmailsList && grantEmailsList.length > 0) {
			setMailingListDetail((prev: any) => ({
				...prev,
				ownerGrantEmails: grantEmailsList
			}));
			const allRows = grantEmailsList.map((item: any) => ({
				id: item,
				columns: [
					<Text
						size="medium"
						weight="light"
						key={item?.id}
						color="#828282"
						onClick={(): void => {
							setSelectedGrantEmail([item]);
						}}
					>
						{item}
					</Text>
				]
			}));
			setGrantEmailTableRows(allRows);
		} else {
			setMailingListDetail((prev: any) => ({
				...prev,
				ownerGrantEmails: []
			}));
			setGrantEmailTableRows([]);
		}
	}, [grantEmailsList, setMailingListDetail]);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 13.125rem)"
				background="white"
				style={{ overflow: 'auto', padding: '1rem' }}
			>
				<Row>
					<Text size="small" weight="bold">
						{t('label.main_settings', 'Main Settings')}
					</Text>
				</Row>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'medium', bottom: 'medium' }}
					>
						<Switch
							value={mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers}
							label={t(
								'label.send_new_members_notification_for_share_assigned_to_this_group',
								'Send new members a notification for the share/delegation assigned to this group'
							)}
							onClick={(): void => {
								setMailingListDetail((prev: any) => ({
									...prev,
									zimbraDistributionListSendShareMessageToNewMembers:
										!mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers
								}));
							}}
							iconColor="primary"
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
							value={mailingListDetail?.zimbraHideInGal}
							label={t('label.hidden_from_gal', 'Hidden from GAL')}
							onClick={(): void => {
								setMailingListDetail((prev: any) => ({
									...prev,
									zimbraHideInGal: !mailingListDetail?.zimbraHideInGal
								}));
							}}
							iconColor="primary"
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
							label={t('label.this_list_can_receive_email', 'This list can receive emails')}
							onClick={(): void => {
								setMailingListDetail((prev: any) => ({
									...prev,
									zimbraMailStatus: !mailingListDetail?.zimbraMailStatus
								}));
							}}
							iconColor="primary"
						/>
					</Container>
				</ListRow>
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
						width="70%"
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
						crossAlignment="center"
						orientation="horizontal"
						width="fit"
						padding={{ top: 'medium', right: 'small' }}
					>
						<Button
							type="outlined"
							label={t('label.add', 'Add')}
							color="primary"
							size="large"
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
							size="large"
							onClick={onDeleteFromList}
							disabled={selectedDistributionListOwner && selectedDistributionListOwner.length === 0}
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
				{ownerTableRows.length === 0 && (
					<ListRow>
						<Container
							background="gray6"
							height="fit-content"
							mainAlignment="center"
							crossAlignment="center"
						>
							<Padding value="57px 0 0 0" width="100%">
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

				<ListRow>
					<Container>
						<Divider />
					</Container>
				</ListRow>
				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Select
							items={grantTypeOptions}
							background="gray5"
							label={t('label.who_can_send_mails_to_this_list', 'Who can send mails TO this list?')}
							showCheckbox={false}
							onChange={onGrantTypeChange}
							selection={grantType}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="100%"
					>
						<DropDownInput
							width="100%"
							items={grantItems}
							inputLabel={t(
								'label.type_an_account_add_senders_list',
								'Type an account to add it to the sender for the list'
							)}
							size="medium"
							onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
								setGrantEmailItem(e.target.value);
							}}
							inputValue={grantEmailItem}
							isCustomIcon={false}
							inputDisabled={grantType?.value !== EMAIL}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						width="18%"
						padding={{ top: 'large' }}
					>
						<Button
							type="outlined"
							label={t('label.add', 'Add')}
							color="primary"
							size="large"
							onClick={onAddGrantEmail}
							disabled={grantEmailItem === ''}
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="center"
						orientation="horizontal"
						padding={{ top: 'large' }}
						width="25%"
					>
						<Button
							type="outlined"
							label={t('label.delete', 'Delete')}
							color="error"
							size="large"
							onClick={onDeleteFromGrantEmail}
							disabled={selectedGrantEmail && selectedGrantEmail.length === 0}
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Table
							rows={grantEmailTableRows}
							headers={grantEmailHeaders}
							showCheckbox={false}
							selectedRows={selectedGrantEmail}
							RowFactory={CustomRowFactory}
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>
				{grantEmailTableRows.length === 0 && (
					<ListRow>
						<Container
							background="gray6"
							height="fit-content"
							mainAlignment="center"
							crossAlignment="center"
						>
							<Padding value="3.563rem 0 0 0" width="100%">
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
			</Container>
		</Container>
	);
};

export default MailingListSettingsSection;
