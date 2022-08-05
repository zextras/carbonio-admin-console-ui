/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	IconButton,
	Divider,
	Input,
	Table,
	Text,
	Switch,
	Padding,
	Icon
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import ListRow from '../../../list/list-row';
import Paginig from '../../../components/paging';
import { getDistributionList } from '../../../../services/get-distribution-list';
import { getDistributionListMembership } from '../../../../services/get-distributionlists-membership-service';
import { getDateFromStr } from '../../../utility/utils';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

// eslint-disable-next-line no-shadow
export enum TRUE_FALSE {
	TRUE = 'TRUE',
	FALSE = 'FALSE'
}

const MailingListDetail: FC<any> = ({
	selectedMailingList,
	setShowMailingListDetailView,
	setEditMailingList
}) => {
	const [t] = useTranslation();
	const [zimbraCreateTimestamp, setZimbraCreateTimestamp] = useState<string>('');
	const dlCreateDate = useMemo(
		() =>
			!!zimbraCreateTimestamp && zimbraCreateTimestamp !== null && zimbraCreateTimestamp !== ''
				? moment(getDateFromStr(zimbraCreateTimestamp)).format('DD MMM YYYY - hh:MM')
				: '',
		[zimbraCreateTimestamp]
	);

	const memberHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.members', 'Members'),
				width: '80%',
				bold: true
			},
			{
				id: 'address',
				label: t('label.type', 'Type'),
				width: '20%',
				bold: true
			}
		],
		[t]
	);

	const ownerHeaders: any[] = useMemo(
		() => [
			{
				id: 'owners',
				label: t('label.owners', 'Owners'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);

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

	const rightsOptions: any[] = useMemo(
		() => [
			{
				label: t('label.can_send_receiver', 'Can Send & Receive'),
				value: TRUE_FALSE.TRUE
			},
			{
				label: t('label.not_send_receive', 'Not Send & Receive'),
				value: TRUE_FALSE.FALSE
			}
		],
		[t]
	);

	const listMemberOfHeaders: any[] = useMemo(
		() => [
			{
				id: 'members',
				label: t('label.this_list_is_member_of', 'This List is member of'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);
	const [zimbraMailStatus, setZimbraMailStatus] = useState<any>(rightsOptions[1]);
	const [zimbraDistributionListSubscriptionPolicy, setZimbraDistributionListSubscriptionPolicy] =
		useState<any>(subscriptionUnsubscriptionRequestOptions[0]);
	const [
		zimbraDistributionListUnsubscriptionPolicy,
		setZimbraDistributionListUnsubscriptionPolicy
	] = useState<any>(subscriptionUnsubscriptionRequestOptions[0]);
	const [dlId, setdlId] = useState<string>('');
	const [dlMembershipList, setDlMembershipList] = useState<any>([]);
	const [dlmTableRows, setDlmTableRows] = useState<any>([]);
	const [zimbraHideInGal, setZimbraHideInGal] = useState<boolean>(false);
	const [zimbraMailAlias, setZimbraMailAlias] = useState<any>([]);
	const [dlm, setDlm] = useState<any[]>([]);
	const [ownersList, setOwnersList] = useState<any[]>([]);
	const [zimbraNotes, setZimbraNotes] = useState<string>('');
	const [
		zimbraDistributionListSendShareMessageToNewMembers,
		setZimbraDistributionListSendShareMessageToNewMembers
	] = useState<boolean>(false);
	const [displayName, setDisplayName] = useState<string>('');
	const [distributionName, setDistributionName] = useState<string>('');
	const [dlmMemberOfRows, setDlmMemberOfRows] = useState<any>([]);
	const [ownerTableRows, setOwnerTableRows] = useState<any[]>([]);
	const [memberOffset, setMemberOffset] = useState<number>(0);
	const [ownerOffset, setOwnerOffset] = useState<number>(0);
	const [memberURL, setMemberURL] = useState<string>();

	const onRightsChange = useCallback(
		(v: any): any => {
			const it = rightsOptions.find((item: any) => item.value === v);
			setZimbraMailStatus(it);
		},
		[rightsOptions]
	);

	const onSubscriptionChange = useCallback(
		(v: any): any => {
			const it = subscriptionUnsubscriptionRequestOptions.find((item: any) => item.value === v);
			setZimbraDistributionListSubscriptionPolicy(it);
		},
		[subscriptionUnsubscriptionRequestOptions]
	);

	const onUnSubscriptionChange = useCallback(
		(v: any): any => {
			const it = subscriptionUnsubscriptionRequestOptions.find((item: any) => item.value === v);
			setZimbraDistributionListUnsubscriptionPolicy(it);
		},
		[subscriptionUnsubscriptionRequestOptions]
	);

	const getMailingList = useCallback(
		(id: string, name: string): void => {
			getDistributionList(id, name)
				.then((response) => response.json())
				.then((data) => {
					const distributionListMembers = data?.Body?.GetDistributionListResponse?.dl[0];
					if (distributionListMembers) {
						if (distributionListMembers?.id) {
							setdlId(distributionListMembers?.id);
						}
						if (distributionListMembers?.dlm) {
							const _dlm = distributionListMembers?.dlm.map((item: any) => item?._content);
							setDlm(_dlm);
						}
						if (distributionListMembers?.owners && distributionListMembers?.owners[0]?.owner) {
							setOwnersList(distributionListMembers?.owners[0]?.owner);
						}
						if (distributionListMembers?.a) {
							/* Get Gal Hide Information */
							const _zimbraHideInGal = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraHideInGal'
							)?._content;
							if (_zimbraHideInGal === 'TRUE') {
								setZimbraHideInGal(true);
							} else {
								setZimbraHideInGal(false);
							}

							const _zimbraNotes = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraNotes'
							)?._content;

							setZimbraNotes(_zimbraNotes || '');

							const _zimbraDistributionListSendShareMessageToNewMembers =
								distributionListMembers?.a?.find(
									(a: any) => a?.n === 'zimbraDistributionListSendShareMessageToNewMembers'
								)?._content;

							if (_zimbraDistributionListSendShareMessageToNewMembers === 'TRUE') {
								setZimbraDistributionListSendShareMessageToNewMembers(true);
							} else {
								setZimbraDistributionListSendShareMessageToNewMembers(false);
							}

							const _zimbraMailAlias = distributionListMembers?.a?.filter(
								(a: any) => a?.n === 'zimbraMailAlias' && a?._content !== selectedMailingList?.name
							);
							if (_zimbraMailAlias && _zimbraMailAlias.length > 0) {
								const allAlias = _zimbraMailAlias.map((item: any) => ({
									attr: 'zimbraMailAlias',
									value: item?._content
								}));
								setZimbraMailAlias(allAlias);
							}
							const _zimbraCreateTimestamp = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraCreateTimestamp'
							)?._content;
							_zimbraCreateTimestamp
								? setZimbraCreateTimestamp(_zimbraCreateTimestamp)
								: setZimbraCreateTimestamp('');

							const _zimbraDistributionListSubscriptionPolicy = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraDistributionListSubscriptionPolicy'
							)?._content;
							if (_zimbraDistributionListSubscriptionPolicy) {
								onSubscriptionChange(_zimbraDistributionListSubscriptionPolicy);
								const it = subscriptionUnsubscriptionRequestOptions.find(
									(item: any) => item.value === _zimbraDistributionListSubscriptionPolicy
								);
							}

							const _zimbraDistributionListUnsubscriptionPolicy = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraDistributionListUnsubscriptionPolicy'
							)?._content;
							if (_zimbraDistributionListUnsubscriptionPolicy) {
								onUnSubscriptionChange(_zimbraDistributionListUnsubscriptionPolicy);
								const it = subscriptionUnsubscriptionRequestOptions.find(
									(item: any) => item.value === _zimbraDistributionListUnsubscriptionPolicy
								);
							}
							/* Mail status */

							const _zimbraMailStatus = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'zimbraMailStatus'
							)?._content;
							if (_zimbraMailStatus === 'enabled') {
								onRightsChange(rightsOptions[0].value);
							}

							const _memberURL = distributionListMembers?.a?.find(
								(a: any) => a?.n === 'memberURL'
							)?._content;
							if (_memberURL) {
								setMemberURL(_memberURL);
							}
						}
					}
				});
		},
		[
			selectedMailingList?.name,
			subscriptionUnsubscriptionRequestOptions,
			onSubscriptionChange,
			onUnSubscriptionChange,
			rightsOptions,
			onRightsChange
		]
	);

	const getDistributionListMembershipList = useCallback((id: string): void => {
		getDistributionListMembership(id)
			.then((response) => response.json())
			.then((data) => {
				const members = data?.Body?.GetDistributionListMembershipResponse?.dl;
				if (members && members.length > 0) {
					const allMembers = members.map((item: any) => ({
						label: item?.name,
						background: 'gray3',
						color: 'text',
						id: item?.id,
						name: item?.name
					}));
					setDlMembershipList(allMembers);
				}
			});
	}, []);

	useEffect(() => {
		if (selectedMailingList?.a) {
			const dsName = selectedMailingList?.a?.find((a: any) => a?.n === 'displayName')?._content;
			if (dsName) {
				setDisplayName(dsName);
			} else {
				setDisplayName('');
			}
		}
		setDistributionName(selectedMailingList?.name);

		getMailingList(selectedMailingList?.id, selectedMailingList?.name);
		getDistributionListMembershipList(selectedMailingList?.id);
	}, [selectedMailingList, getMailingList, getDistributionListMembershipList]);

	useEffect(() => {
		if (dlMembershipList && dlMembershipList.length > 0) {
			const allRows = dlMembershipList.map((item: any) => ({
				id: item?.id,
				columns: [
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item?.label}
					</Text>,
					''
				]
			}));
			setDlmMemberOfRows(allRows);
		} else {
			setDlmMemberOfRows([]);
		}
	}, [dlMembershipList]);

	useEffect(() => {
		if (dlm && dlm.length > 0) {
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
		}
	}, [dlm]);

	useEffect(() => {
		if (ownersList && ownersList.length > 0) {
			const allRows = ownersList.map((item: any) => ({
				id: item?.name,
				columns: [
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item?.name}
					</Text>
				]
			}));
			setOwnerTableRows(allRows);
		} else {
			setOwnerTableRows([]);
		}
	}, [ownersList]);

	const onEditMailingList = (): void => {
		setEditMailingList(true);
	};

	const onCopyLink = useCallback(() => {
		if (navigator) {
			navigator.clipboard.writeText(memberURL || '');
		}
	}, [memberURL]);

	return (
		<Container
			background="gray5"
			mainAlignment="flex-start"
			style={{
				position: 'absolute',
				left: `${'max(calc(100% - 680px), 12px)'}`,
				top: '43px',
				height: 'auto',
				width: 'auto',
				overflow: 'hidden',
				transition: 'left 0.2s ease-in-out',
				'box-shadow': '-6px 4px 5px 0px rgba(0, 0, 0, 0.1)'
			}}
		>
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="white"
				width="fill"
				height="48px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{selectedMailingList?.name} (
						{selectedMailingList?.dynamic
							? t('label.dynamic', 'Dynamic')
							: t('label.standard', 'Standard')}
						)
					</Text>
				</Row>
				<Row padding={{ right: 'extrasmall' }}>
					<IconButton
						size="medium"
						icon="CloseOutline"
						onClick={(): void => setShowMailingListDetailView(false)}
					/>
				</Row>
			</Row>
			<Row>
				<Divider color="gray3" />
			</Row>
			<Container
				orientation="horizontal"
				mainAlignment="flex-end"
				crossAlignment="flex-end"
				background="gray6"
				padding={{ all: 'extralarge' }}
			>
				<Padding right="large">
					<Container style={{ border: '1px solid #2b73d2' }}>
						<IconButton
							iconColor="primary"
							backgroundColor="gray6"
							icon="EditAsNewOutline"
							height={44}
							width={44}
							onClick={onEditMailingList}
						/>
					</Container>
				</Padding>
				<Container width="fit" style={{ border: '1px solid #d74942' }}>
					<IconButton
						iconColor="error"
						backgroundColor="gray6"
						icon="Trash2Outline"
						height={44}
						width={44}
					/>
				</Container>
			</Container>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 250px)"
				background="white"
				style={{ overflow: 'auto' }}
			>
				<Row>
					<Text size="medium" weight="bold" color="gray0">
						{t('domain.list_details', 'List Details')}
					</Text>
				</Row>
				<ListRow>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'EyeOutline'} size="large" />
					</Container>
					<Container>
						<Input
							label={t('label.displayed_name', 'Displayed Name')}
							value={displayName}
							background="gray6"
							readOnly
						/>
					</Container>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'EmailOutline'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.address', 'Address')}
							value={distributionName}
							background="gray6"
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'CheckmarkCircleOutline'} size="large" />
					</Container>

					<Container>
						<Input
							background="gray6"
							label={t('label.new_subscription_requests', 'New subscriptions requests')}
							readOnly
							value={zimbraDistributionListSubscriptionPolicy?.label}
						/>
					</Container>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'CloseCircleOutline'} size="large" />
					</Container>

					<Container padding={{ all: 'small' }}>
						<Input
							background="gray6"
							label={t('label.unsubscribe_request', 'Unsubscription requests')}
							readOnly
							value={zimbraDistributionListUnsubscriptionPolicy?.label}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container width="fit" padding={{ right: 'small' }} className="xxxxxx">
						<Icon icon={'OptionsOutline'} size="large" />
					</Container>
					<Container padding={{ right: 'small', top: 'small' }}>
						<Input
							background="gray6"
							label={t('label.rights', 'Rights')}
							readOnly
							value={zimbraMailStatus?.label}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', bottom: 'medium' }}
					>
						<Switch
							value={zimbraDistributionListSendShareMessageToNewMembers}
							label={t('label.share_manages_to_new_members', 'Share messages to new members')}
							disabled
						/>
					</Container>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						padding={{ top: 'large', bottom: 'medium' }}
					>
						<Switch
							value={zimbraHideInGal}
							label={t('label.this_is_hidden_from_gal', 'This list is hidden from GAL')}
							disabled
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'PeopleOutline'} size="large" />
					</Container>
					<Container>
						<Input
							label={t('label.members', 'Members')}
							value={dlm.length}
							background="gray6"
							readOnly
						/>
					</Container>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'CornerUpRight'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Input
							label={t('label.alias_in_the_list', 'Alias in the List')}
							value={zimbraMailAlias.length}
							background="gray6"
							readOnly
						/>
					</Container>
				</ListRow>
				{selectedMailingList?.dynamic && (
					<ListRow>
						<Container width="fit" padding={{ right: 'small' }}>
							<Icon icon={'Link2Outline'} size="large" />
						</Container>
						<Container>
							<Input
								label={t('label.list_url', 'List URL')}
								value={memberURL}
								background="gray6"
								readOnly
								CustomIcon={(): any => (
									<Icon icon="CopyOutline" size="large" color="grey" onClick={onCopyLink} />
								)}
							/>
						</Container>
					</ListRow>
				)}
				<ListRow>
					<Container width="64px">
						<Icon icon={'FingerPrintOutline'} size="large" />
					</Container>
					<Container padding={{ all: 'small' }}>
						<Input label={t('label.id_lbl', 'ID')} value={dlId} background="gray6" readOnly />
					</Container>
					<Container width="64px" padding={{ right: 'small' }}>
						<Icon icon={'CalendarOutline'} size="large" />
					</Container>
					<Container>
						<Input
							label={t('label.creation_date', 'Creation Date')}
							value={dlCreateDate}
							background="gray6"
							readOnly
						/>
					</Container>
				</ListRow>
				<Row padding={{ top: 'small', bottom: 'small' }}>
					<Text size="medium" weight="bold" color="gray0">
						{t('label.manage_list', 'Manage List')}
					</Text>
				</Row>
				{!selectedMailingList?.dynamic && (
					<ListRow>
						<Container mainAlignment="flex-start" padding={{ top: 'small', bottom: 'small' }}>
							<Table rows={dlmMemberOfRows} headers={listMemberOfHeaders} showCheckbox={false} />
						</Container>
					</ListRow>
				)}
				<ListRow>
					{!selectedMailingList?.dynamic && (
						<Container mainAlignment="flex-start" padding={{ top: 'small', bottom: 'small' }}>
							<Table rows={dlmTableRows} headers={memberHeaders} showCheckbox={false} />
						</Container>
					)}
					<Container
						padding={{
							left: !selectedMailingList?.dynamic ? 'small' : '',
							top: 'small',
							bottom: 'small'
						}}
						mainAlignment="flex-start"
					>
						<Table rows={ownerTableRows} headers={ownerHeaders} showCheckbox={false} />
					</Container>
				</ListRow>
				{!selectedMailingList?.dynamic && (
					<ListRow>
						<Container mainAlignment="flex-end" crossAlignment="flex-end">
							<Divider />

							<Padding all="small">
								<Paginig totalItem={1} pageSize={10} setOffset={setMemberOffset} />
							</Padding>
						</Container>
						<Container
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							padding={{ left: 'small' }}
						>
							<Divider />
							<Padding all="small">
								<Paginig totalItem={1} pageSize={10} setOffset={setOwnerOffset} />
							</Padding>
						</Container>
					</ListRow>
				)}
				<ListRow>
					<Container>
						<Input
							value={zimbraNotes}
							label={t('label.notes', 'Notes')}
							background="gray6"
							readOnly
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default MailingListDetail;
