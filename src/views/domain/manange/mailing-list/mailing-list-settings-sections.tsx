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
	Switch,
	Select,
	Table,
	Input,
	Button,
	Dropdown,
	SnackbarManagerContext,
	ChipInput
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { debounce, sortedUniq, uniq } from 'lodash';
import { MailingListContext } from './mailinglist-context';
import ListRow from '../../../list/list-row';
import { getAllEmailFromString, isValidEmail } from '../../../utility/utils';
import { searchDirectory } from '../../../../services/search-directory-service';
import { ALL, EMAIL, GRP, PUB, RECORD_DISPLAY_LIMIT } from '../../../../constants';
import { searchGal } from '../../../../services/search-gal-service';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

const MailingListSettingsSection: FC<any> = () => {
	const { t } = useTranslation();
	const createSnackbar: any = useContext(SnackbarManagerContext);
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
	const [grantEmails, setGrantEmails] = useState<any>(mailingListDetail?.ownerGrantEmails);
	const [grantEmailsList, setGrantEmailsList] = useState<any>([]);

	const subscriptionUnsubscriptionRequestOptions: any[] = useMemo(
		() => [
			{
				label: t('label.automatically_accept', 'Automatically accept'),
				value: SUBSCRIBE_UNSUBSCRIBE.ACCEPT
			},
			{
				label: t('label.require_list_owner_approval', 'Require list owner approval'),
				value: SUBSCRIBE_UNSUBSCRIBE.APPROVAL
			},
			{
				label: t('label.automatically_reject', 'Automatically reject'),
				value: SUBSCRIBE_UNSUBSCRIBE.REJECT
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

	const [zimbraDistributionListSubscriptionPolicy, setZimbraDistributionListSubscriptionPolicy] =
		useState<any>(mailingListDetail?.zimbraDistributionListSubscriptionPolicy);

	const [
		zimbraDistributionListUnsubscriptionPolicy,
		setZimbraDistributionListUnsubscriptionPolicy
	] = useState<any>(mailingListDetail?.zimbraDistributionListUnsubscriptionPolicy);

	const onSubscriptionChange = useCallback(
		(v: any): any => {
			const it = subscriptionUnsubscriptionRequestOptions.find((item: any) => item.value === v);
			setZimbraDistributionListSubscriptionPolicy(it);
			setMailingListDetail((prev: any) => ({
				...prev,
				zimbraDistributionListSubscriptionPolicy: it
			}));
		},
		[subscriptionUnsubscriptionRequestOptions, setMailingListDetail]
	);

	const onUnSubscriptionChange = useCallback(
		(v: any): any => {
			const it = subscriptionUnsubscriptionRequestOptions.find((item: any) => item.value === v);
			setZimbraDistributionListUnsubscriptionPolicy(it);
			setMailingListDetail((prev: any) => ({
				...prev,
				zimbraDistributionListUnsubscriptionPolicy: it
			}));
		},
		[subscriptionUnsubscriptionRequestOptions, setMailingListDetail]
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
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
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
						/>
					</Container>
				</ListRow>

				<ListRow>
					<Container>
						<Select
							items={subscriptionUnsubscriptionRequestOptions}
							background="gray5"
							label={t('label.new_subscription_requests', 'New subscriptions requests')}
							showCheckbox={false}
							onChange={onSubscriptionChange}
							selection={zimbraDistributionListSubscriptionPolicy}
						/>
					</Container>

					<Container padding={{ all: 'small' }}>
						<Select
							items={subscriptionUnsubscriptionRequestOptions}
							background="gray5"
							label={t('label.unsubscribe_request', 'Unsubscription requests')}
							showCheckbox={false}
							onChange={onUnSubscriptionChange}
							selection={zimbraDistributionListUnsubscriptionPolicy}
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
						{t('label.owners_settings_lbl', 'Owners’ Settings')}
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
						overflow="break-word"
					>
						{t(
							'label.owners_description_msg_1',
							'Owners can add and remove members, change displayname and description, change list visibility (ie. to hide in gal), change the ownership, modify the subscription/unsubscription behaviour.'
						)}
					</Text>
				</Row>
				<ListRow>
					<Container>
						<Select
							items={grantTypeOptions}
							background="gray5"
							label={t('label.who_can_send_mails_to_this_list', 'Who can send mails TO this list?')}
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
						{/* <Input
							label={t('label.type_an_account_dot', 'Type an account ...')}
							backgroundColor="gray5"
							size="medium"
							value={member}
							onChange={(e: any): void => {
								setMember(e.target.value);
							}}
						/> */}

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
						padding={{ top: 'medium', right: 'small' }}
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
							onSelectionChange={(selected: any): void =>
								setSelectedDistributionListOwner(selected)
							}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default MailingListSettingsSection;
