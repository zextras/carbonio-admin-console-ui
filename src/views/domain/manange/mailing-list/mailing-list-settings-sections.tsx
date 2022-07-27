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
	Button
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { MailingListContext } from './mailinglist-context';
import ListRow from '../../../list/list-row';
import { isValidEmail } from '../../../utility/utils';

// eslint-disable-next-line no-shadow
export enum SUBSCRIBE_UNSUBSCRIBE {
	ACCEPT = 'ACCEPT',
	APPROVAL = 'APPROVAL',
	REJECT = 'REJECT'
}

const MailingListSettingsSection: FC<any> = () => {
	const { t } = useTranslation();
	const context = useContext(MailingListContext);
	const { mailingListDetail, setMailingListDetail } = context;
	const [member, setMember] = useState<string>('');
	const [ownerTableRows, setOwnerTableRows] = useState<Array<any>>(mailingListDetail?.owners);
	const [ownersList, setOwnersList] = useState<Array<any>>([]);
	const [selectedDistributionListOwner, setSelectedDistributionListOwner] = useState<Array<any>>(
		[]
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

	const ownerHeaders: any[] = useMemo(
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
		if (member !== '' && isValidEmail(member)) {
			setOwnersList((prev: any) => [...prev, member]);
			setMember('');
		}
	}, [member]);

	const onDeleteFromList = useCallback((): void => {
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
							label={t('label.share_message_to_new_member', 'Share message to new members')}
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
				<ListRow>
					<Text
						size="small"
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						weight="bold"
					>
						{t('label.owners', 'Owners')}
					</Text>
				</ListRow>

				<ListRow>
					<Container
						mainAlignment="flex-start"
						crossAlignment="flex-start"
						orientation="horizontal"
						padding={{ top: 'large', right: 'small' }}
						width="65%"
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
							onClick={onDeleteFromList}
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
