/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useContext, useCallback, useState, useEffect } from 'react';
import {
	Container,
	Row,
	Text,
	ChipInput,
	Switch,
	Divider,
	Input
} from '@zextras/carbonio-design-system';
import { map, some, pick } from 'lodash';
import { setDefaults, useTranslation } from 'react-i18next';
import { AccountContext } from './account-context';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const EditAccountConfigrationSection: FC = () => {
	const conext = useContext(AccountContext);
	const [t] = useTranslation();
	const { accountDetail, setAccountDetail, directMemberList, inDirectMemberList } = conext;
	const [prefMailForwardingAddress, setPrefMailForwardingAddress] = useState<any[]>([]);
	const [mailForwardingAddress, setMailForwardingAddress] = useState<any[]>([]);
	const [prefCalendarForwardInvitesTo, setPrefCalendarForwardInvitesTo] = useState<any[]>([]);
	const [accountQuota, setAccountQuota] = useState('');
	useEffect(() => {
		setPrefMailForwardingAddress(
			accountDetail?.zimbraPrefMailForwardingAddress
				? accountDetail.zimbraPrefMailForwardingAddress
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraPrefMailForwardingAddress]);
	useEffect(() => {
		setAccountQuota((accountDetail.zimbraMailQuota / 1048576).toString());
	}, [accountDetail?.zimbraMailQuota]);
	useEffect(() => {
		setMailForwardingAddress(
			accountDetail?.zimbraMailForwardingAddress
				? accountDetail.zimbraMailForwardingAddress
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraMailForwardingAddress]);
	useEffect(() => {
		setPrefCalendarForwardInvitesTo(
			accountDetail?.zimbraPrefCalendarForwardInvitesTo
				? accountDetail.zimbraPrefCalendarForwardInvitesTo
						.split(', ')
						.map((ele: string) => ({ label: ele }))
				: []
		);
	}, [accountDetail?.zimbraPrefCalendarForwardInvitesTo]);

	const changeSwitchOption = useCallback(
		(key: string): void => {
			setAccountDetail((prev: any) => ({
				...prev,
				[key]: accountDetail[key] === 'TRUE' ? 'FALSE' : 'TRUE'
			}));
		},
		[accountDetail, setAccountDetail]
	);
	const changeAccountQuota = useCallback(
		(e) => {
			setAccountDetail((prev: any) => ({
				...prev,
				[e.target.name]: (Number(e.target.value) * 1048576).toString()
			}));
		},
		[setAccountDetail]
	);

	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" width="100%">
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.mailing_list', 'Mailing List')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.this_account_is_a_direct_member_of',
								'This account is a direct member of'
							)}
							background="gray5"
							defaultValue={directMemberList}
							disabled
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.this_account_is_a_in_direct_member_of',
								'This account is a in direct member of'
							)}
							background="gray5"
							defaultValue={inDirectMemberList}
							disabled
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.forwarding', 'Forwarding')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureMailForwardingEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureMailForwardingEnabled')}
							label={t(
								'account_details.can_specify_forwarding_address',
								'Can specify forwarding address'
							)}
						/>
					</Row>
					<Row width="48%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPrefMailLocalDeliveryDisabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPrefMailLocalDeliveryDisabled')}
							label={t(
								'account_details.dont_keep_local_copy_of_messages',
								`Don't Keep local copy of messages`
							)}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.forwarding_addresses_specified_by_the_user',
								'Forwarding addresses specified by the user'
							)}
							onChange={(contacts: any): void => {
								const data: any = [];
								map(contacts, (contact) => {
									if (emailRegex.test(contact.label ?? '')) data.push(contact);
								});
								setPrefMailForwardingAddress(data);
								setAccountDetail((prev: any) => ({
									...prev,
									zimbraPrefMailForwardingAddress: map(data, 'label').join(', ')
								}));
							}}
							defaultValue={prefMailForwardingAddress}
							value={prefMailForwardingAddress}
							background="gray5"
							hasError={some(prefMailForwardingAddress || [], { error: true })}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.forwarding_addresses_hidden_from_the_user',
								'Forwarding addresses hidden from the user'
							)}
							onChange={(contacts: any): void => {
								const data: any = [];
								map(contacts, (contact) => {
									if (emailRegex.test(contact.label ?? '')) data.push(contact);
								});
								setMailForwardingAddress(data);
								setAccountDetail((prev: any) => ({
									...prev,
									zimbraMailForwardingAddress: map(data, 'label').join(', ')
								}));
							}}
							defaultValue={mailForwardingAddress}
							value={mailForwardingAddress}
							background="gray5"
							hasError={some(mailForwardingAddress || [], { error: true })}
						/>
					</Row>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%" mainAlignment="space-between">
					<Row width="100%" mainAlignment="space-between">
						<ChipInput
							placeholder={t(
								'account_details.forwarding_calendar_invitations_to_these_addresses',
								'Forwarding calendar invitations to these addresses'
							)}
							onChange={(contacts: any): void => {
								const data: any = [];
								map(contacts, (contact) => {
									if (emailRegex.test(contact.label ?? '')) data.push(contact);
								});
								setPrefCalendarForwardInvitesTo(data);
								setAccountDetail((prev: any) => ({
									...prev,
									zimbraPrefCalendarForwardInvitesTo: map(data, 'label').join(', ')
								}));
							}}
							defaultValue={prefCalendarForwardInvitesTo}
							value={prefCalendarForwardInvitesTo}
							background="gray5"
							hasError={some(prefCalendarForwardInvitesTo || [], { error: true })}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.quotas', 'Quotas')}
					</Text>
				</Row>
				<Row padding={{ top: 'large', left: 'large' }} width="100%">
					<Input
						label={t('label.account_quota_mb', 'Account Quota (MB)')}
						backgroundColor="gray5"
						defaultValue={accountQuota}
						value={accountQuota}
						onChange={changeAccountQuota}
						inputName="zimbraMailQuota"
						name="zimbraMailQuota"
					/>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.features', 'Features')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureSharingEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureSharingEnabled')}
							label={t('account_details.sharing', 'Sharing')}
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPrefImapEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPrefImapEnabled')}
							label={t('account_details.iamp_access', 'IMAP Access')}
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPrefPop3Enabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPrefPop3Enabled')}
							label={t('account_details.pop3_access', 'POP3 Access')}
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureGalEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureGalEnabled')}
							label={t('account_details.global_address_list_access', 'Global Address List Access')}
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureNewMailNotificationEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureNewMailNotificationEnabled')}
							label={t('account_details.new_mail_notification', 'New Mail Notification')}
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureOutOfOfficeReplyEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureOutOfOfficeReplyEnabled')}
							label={t('account_details.out_of_office_reply', 'Out of Office Reply')}
						/>
					</Row>
				</Row>
				<Row
					width="100%"
					padding={{ top: 'large', left: 'large', bottom: 'large' }}
					mainAlignment="space-between"
				>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPrefGalAutoCompleteEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPrefGalAutoCompleteEnabled')}
							label={t('account_details.autocomplete_from_GAL', 'Autocomplete from GAL')}
						/>
					</Row>
				</Row>
			</Row>
		</Container>
	);
};

export default EditAccountConfigrationSection;
