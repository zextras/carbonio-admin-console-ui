/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { Container, Input, Text, Table, Row } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { MailingListContext } from './mailinglist-context';
import ListRow from '../../../list/list-row';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}
const MailingListCreateSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const [ownerMember, setOwnerMember] = useState<Array<any>>([]);
	const [memberList, setMemberList] = useState<Array<any>>([]);
	const [subscription, setSubscription] = useState<string>('');
	const [unSubscription, setUnSubscription] = useState<string>('');
	const tableHeader: any[] = useMemo(
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
		const member = mailingListDetail?.members;
		if (member && member.length > 0) {
			const allRows = member.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="bold" key={item} color="#828282">
						{item}
					</Text>
				]
			}));
			setMemberList(allRows);
		}
	}, [mailingListDetail?.members]);

	useEffect(() => {
		const ownersList = mailingListDetail?.owners;
		if (ownersList && ownersList.length > 0) {
			const allRows = ownersList.map((item: any) => ({
				id: item,
				columns: [
					<Text size="medium" weight="bold" key={item?.id} color="#828282">
						{item}
					</Text>
				]
			}));
			setOwnerMember(allRows);
		}
	}, [mailingListDetail?.owners]);

	useEffect(() => {
		const subscriptionPolicy = mailingListDetail?.zimbraDistributionListSubscriptionPolicy?.value;
		if (subscriptionPolicy && subscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.ACCEPT) {
			setSubscription(t('label.automatically_accept', 'Automatically accept'));
		} else if (subscriptionPolicy && subscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.APPROVAL) {
			setSubscription(t('label.require_list_owner_approval', 'Require list owner approval'));
		} else if (subscriptionPolicy && subscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.REJECT) {
			setSubscription(t('label.automatically_reject', 'Automatically reject'));
		}
	}, [mailingListDetail?.zimbraDistributionListSubscriptionPolicy, t]);

	useEffect(() => {
		const unSubscriptionPolicy =
			mailingListDetail?.zimbraDistributionListUnsubscriptionPolicy?.value;
		if (unSubscriptionPolicy && unSubscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.ACCEPT) {
			setUnSubscription(t('label.automatically_accept', 'Automatically accept'));
		} else if (unSubscriptionPolicy && unSubscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.APPROVAL) {
			setUnSubscription(t('label.require_list_owner_approval', 'Require list owner approval'));
		} else if (unSubscriptionPolicy && unSubscriptionPolicy === SUBSCRIBE_UNSUBSCRIBE.REJECT) {
			setUnSubscription(t('label.automatically_reject', 'Automatically reject'));
		}
	}, [mailingListDetail?.zimbraDistributionListUnsubscriptionPolicy, t]);

	return (
		<Container mainAlignment="flex-start">
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 300px)"
				background="white"
				style={{ overflow: 'auto', padding: '16px' }}
			>
				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.displayed_name', 'Displayed Name')}
							backgroundColor="gray6"
							size="medium"
							value={mailingListDetail?.displayName}
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
							size="medium"
							value={`${mailingListDetail?.prefixName}@${mailingListDetail?.suffixName}`}
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
							size="medium"
							value={mailingListDetail?.description}
							readOnly
						/>
					</Container>
				</ListRow>

				{mailingListDetail?.dynamic && (
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.list_url', 'List URL')}
								backgroundColor="gray6"
								size="medium"
								value={mailingListDetail?.memberURL}
								readOnly
							/>
						</Container>
					</ListRow>
				)}

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
					>
						<Input
							label={t('label.notes', 'Notes')}
							backgroundColor="gray6"
							size="medium"
							value={mailingListDetail?.zimbraNotes}
							readOnly
						/>
					</Container>
				</ListRow>

				{!mailingListDetail?.dynamic && (
					<Row>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'extralarge', bottom: 'medium' }}
						>
							<Text
								size="small"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								orientation="horizontal"
								weight="bold"
							>
								{t('label.members', 'Members')}
							</Text>
						</Container>
					</Row>
				)}
				{!mailingListDetail?.dynamic && (
					<ListRow>
						<Container padding={{ bottom: 'medium' }}>
							<Table rows={memberList} headers={tableHeader} showCheckbox={false} />
						</Container>
					</ListRow>
				)}

				<ListRow>
					{!mailingListDetail?.dynamic && (
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.share_message_to_new_member', 'Share message to new members')}
								backgroundColor="gray6"
								size="medium"
								value={
									mailingListDetail?.zimbraDistributionListSendShareMessageToNewMembers
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
							size="medium"
							value={
								mailingListDetail?.zimbraHideInGal ? t('label.yes', 'Yes') : t('label.no', 'No')
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
							label={t('label.can_receive_email', 'Can receive email')}
							backgroundColor="gray6"
							size="medium"
							value={
								mailingListDetail?.zimbraMailStatus ? t('label.yes', 'Yes') : t('label.no', 'No')
							}
							readOnly
						/>
					</Container>
				</ListRow>
				{!mailingListDetail?.dynamic && (
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							padding={{ top: 'large', right: 'small' }}
						>
							<Input
								label={t('label.new_subscription_requests', 'New subscriptions requests')}
								backgroundColor="gray6"
								size="medium"
								value={subscription}
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
								label={t('label.unsubscribe_request', 'Unsubscription requests')}
								backgroundColor="gray6"
								size="medium"
								value={unSubscription}
								readOnly
							/>
						</Container>
					</ListRow>
				)}

				<Row>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'extralarge', bottom: 'medium' }}
					>
						<Text
							size="small"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							orientation="horizontal"
							weight="bold"
						>
							{t('label.owners', 'Owners')}
						</Text>
					</Container>
				</Row>

				<ListRow>
					<Container padding={{ bottom: 'medium' }}>
						<Table rows={ownerMember} headers={tableHeader} showCheckbox={false} />
					</Container>
				</ListRow>
			</Container>
		</Container>
	);
};

export default MailingListCreateSection;
