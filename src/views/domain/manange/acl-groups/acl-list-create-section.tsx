/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Input, Text, Table, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { AclListContext } from './acl-list-context';
import ListRow from '../../../list/list-row';
import { ALL, EMAIL, GRP, PUB } from '../../../../constants';
import CustomRowFactory from '../../../app/shared/customTableRowFactory';
import CustomHeaderFactory from '../../../app/shared/customTableHeaderFactory';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}
type MemberOwnerList = {
	id: string;
	name?: string;
	columns: [];
};
const AclListCreateSection: FC = () => {
	const { t } = useTranslation();
	const context = useContext(AclListContext);
	const { aclListDetail, setAclListDetail } = context;
	const [ownerMember, setOwnerMember] = useState<MemberOwnerList[]>([]);
	const [memberList, setMemberList] = useState<MemberOwnerList[]>([]);
	const [subscription, setSubscription] = useState<string | null>('');
	const [unSubscription, setUnSubscription] = useState<string | null>('');
	const [ldapQueryMembers, setLdapQueryMembers] = useState<MemberOwnerList[]>([]);
	const [grantEmailType, setGrantEmailType] = useState<string | null>('');

	const tableHeader: {
		id: string;
		label: string;
		width: string;
		bold: boolean;
	}[] = useMemo(
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

	const ownerTableHeader: {
		id: string;
		label: string;
		width: string;
		bold: boolean;
	}[] = useMemo(
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
		const member = aclListDetail?.members;
		if (member && member.length > 0) {
			const allRows = member.map((item: MemberOwnerList, index: number) => ({
				id: item,
				columns: [
					<Text size="medium" weight="light" key={index} color="#828282">
						{item}
					</Text>
				]
			}));
			setMemberList(allRows);
		}
	}, [aclListDetail?.members]);

	useEffect(() => {
		const ownersList = aclListDetail?.owners;
		if (ownersList && ownersList.length > 0) {
			const allRows = ownersList.map((item: MemberOwnerList) => ({
				id: item,
				columns: [
					<Text size="medium" weight="light" key={item?.id} color="#828282">
						{item}
					</Text>
				]
			}));
			setOwnerMember(allRows);
		}
	}, [aclListDetail?.owners]);

	useEffect(() => {
		const member = aclListDetail?.ldapQueryMembers;
		if (member && member.length > 0) {
			const allRows = member.map((item: MemberOwnerList) => ({
				id: item?.id,
				columns: [
					<Text size="medium" weight="light" key={item?.id} color="#828282">
						{item?.name}
					</Text>
				]
			}));
			setLdapQueryMembers(allRows);
		}
	}, [aclListDetail?.ldapQueryMembers]);

	useEffect(() => {
		const subscriptionPolicy = aclListDetail?.zimbraDistributionListSubscriptionPolicy?.value;
		if (subscriptionPolicy && subscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.ACCEPT) {
			setSubscription(t('label.automatically_accept', 'Automatically accept'));
		} else if (subscriptionPolicy && subscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.APPROVAL) {
			setSubscription(t('label.require_list_owner_approval', 'Require list owner approval'));
		} else if (subscriptionPolicy && subscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.REJECT) {
			setSubscription(t('label.automatically_reject', 'Automatically reject'));
		}
	}, [aclListDetail?.zimbraDistributionListSubscriptionPolicy, t]);

	useEffect(() => {
		const unSubscriptionPolicy = aclListDetail?.zimbraDistributionListUnsubscriptionPolicy?.value;
		if (unSubscriptionPolicy && unSubscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.ACCEPT) {
			setUnSubscription(t('label.automatically_accept', 'Automatically accept'));
		} else if (unSubscriptionPolicy && unSubscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.APPROVAL) {
			setUnSubscription(t('label.require_list_owner_approval', 'Require list owner approval'));
		} else if (unSubscriptionPolicy && unSubscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.REJECT) {
			setUnSubscription(t('label.automatically_reject', 'Automatically reject'));
		}
	}, [aclListDetail?.zimbraDistributionListUnsubscriptionPolicy, t]);

	useEffect(() => {
		if (aclListDetail?.ownerGrantEmailType?.value === PUB) {
			setGrantEmailType(t('label.everyone', 'Everyone'));
		} else if (aclListDetail?.ownerGrantEmailType?.value === GRP) {
			setGrantEmailType(t('label.members_only', 'Members only'));
		} else if (aclListDetail?.ownerGrantEmailType?.value === ALL) {
			setGrantEmailType(t('label.internal_users_only', 'Internal Users only'));
		} else if (aclListDetail?.ownerGrantEmailType?.value === EMAIL) {
			setGrantEmailType(t('label.only_there_users', 'Only these users'));
		}
	}, [aclListDetail?.ownerGrantEmailType, t]);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 18.75rem)"
				background="white"
				style={{ overflow: 'auto', padding: '1rem' }}
			>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.display_name', 'Display Name')}
							backgroundColor="gray6"
							value={aclListDetail?.displayName}
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
							label={t('label.address', 'Address')}
							backgroundColor="gray6"
							value={`${aclListDetail?.prefixName}@${aclListDetail?.suffixName}`}
							readOnly
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
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.description', 'Description')}
							backgroundColor="gray6"
							value={aclListDetail?.zimbraNotes}
							readOnly
						/>
					</Container>
				</ListRow>
				<Row>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'extralarge', bottom: 'medium' }}
					>
						<Text size="small" weight="bold">
							{t('label.members', 'Members')}
						</Text>
					</Container>
				</Row>
				<ListRow>
					<Container padding={{ bottom: 'medium' }}>
						<Table
							rows={memberList}
							headers={tableHeader}
							showCheckbox={false}
							RowFactory={CustomRowFactory}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>

				<Row>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'extralarge', bottom: 'medium' }}
					>
						<Text size="small" weight="bold">
							{t('label.owners', 'Owners')}
						</Text>
					</Container>
				</Row>

				<ListRow>
					<Container padding={{ bottom: 'medium', top: 'medium' }}>
						<Table
							rows={ownerMember}
							headers={ownerTableHeader}
							showCheckbox={false}
							RowFactory={CustomRowFactory}
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore // Need to fix it with custom soultion
							HeaderFactory={CustomHeaderFactory}
						/>
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default AclListCreateSection;
