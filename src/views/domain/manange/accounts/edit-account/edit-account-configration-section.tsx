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
import { map, some } from 'lodash';
import { useTranslation } from 'react-i18next';
import { AccountContext } from '../account-context';
import { useAuthIsAdvanced } from '../../../../../store/auth-advanced/store';

const emailRegex =
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, max-len, no-control-regex
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const EditAccountConfigrationSection: FC = () => {
	const conext = useContext(AccountContext);
	const [t] = useTranslation();
	const { accountDetail, setAccountDetail } = conext;
	const [prefMailForwardingAddress, setPrefMailForwardingAddress] = useState<any[]>([]);
	const [mailForwardingAddress, setMailForwardingAddress] = useState<any[]>([]);
	const [prefCalendarForwardInvitesTo, setPrefCalendarForwardInvitesTo] = useState<any[]>([]);
	const [accountQuota, setAccountQuota] = useState('');
	const isAdvanced = useAuthIsAdvanced((state) => state.isAdvanced);

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
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.main', 'Main')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="20%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureMailEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureMailEnabled')}
							label={t('account_details.mail', 'Mail')}
							disabled
						/>
					</Row>
					<Row width="20%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureCalendarEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureCalendarEnabled')}
							label={t('account_details.calendar', 'Calendar')}
							disabled
						/>
					</Row>
					<Row width="20%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureContactsEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureContactsEnabled')}
							label={t('account_details.contact', 'Contact')}
							disabled
						/>
					</Row>
					<Row width="20%" mainAlignment="flex-start">
						<Switch value={false} label={t('account_details.Chats', 'Chats')} disabled />
					</Row>
					<Row width="20%" mainAlignment="flex-start">
						<Switch value={false} label={t('account_details.files', 'Files')} disabled />
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				{/* <Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('account_details.general', 'General')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureTaggingEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureTaggingEnabled')}
							label={t('account_details.tagging', 'Tagging')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureHtmlComposeEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureHtmlComposeEnabled')}
							label={t('account_details.html_compose', 'HTML Compose')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureWebClientOfflineAccessEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureWebClientOfflineAccessEnabled')}
							label={t(
								'account_details.offline_support_for_advanced_ajax_client',
								'Offline support for Advanced (Ajax) client'
							)}
							disabled
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.mail', 'Mail')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureMailPriorityEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureMailPriorityEnabled')}
							label={t('account_details.message_priority', 'Message Priority')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeaturePop3DataSourceEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeaturePop3DataSourceEnabled')}
							label={t('account_details.external_pop_access', 'External POP Access')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureOutOfOfficeReplyEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureOutOfOfficeReplyEnabled')}
							label={t('account_details.out_of_the_office_reply', 'Out of Office Reply')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraPrefMailSignatureEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraPrefMailSignatureEnabled')}
							label={t('account_details.mail_signatures', 'Mail Signatures')}
							disabled
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.contact', 'Contact')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureDistributionListFolderEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureDistributionListFolderEnabled')}
							label={t('account_details.distribution_list_folder', 'Distribution List Folder')}
							disabled
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.calendar', 'Calendar')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureGroupCalendarEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureGroupCalendarEnabled')}
							label={t('account_details.group_calendar', 'Group Calendar')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureCalendarReminderDeviceEmailEnabled === 'TRUE'}
							onClick={(): void =>
								changeSwitchOption('zimbraFeatureCalendarReminderDeviceEmailEnabled')
							}
							label={t('account_details.sms_reminder', 'SMS Reminder')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start"></Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.search', 'Search')}
					</Text>
				</Row>
				<Row width="100%" padding={{ top: 'large', left: 'large' }} mainAlignment="space-between">
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureAdvancedSearchEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureAdvancedSearchEnabled')}
							label={t('account_details.advanced_search', 'Advanced Search')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureSavedSearchesEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureSavedSearchesEnabled')}
							label={t('account_details.saved_searches', 'Saved Searches')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureInitialSearchPreferenceEnabled === 'TRUE'}
							onClick={(): void =>
								changeSwitchOption('zimbraFeatureInitialSearchPreferenceEnabled')
							}
							label={t('account_details.initial_search_preference', 'Initial Search Preference')}
							disabled
						/>
					</Row>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeaturePeopleSearchEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeaturePeopleSearchEnabled')}
							label={t('account_details.search_fro_people', 'Search for People')}
							disabled
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row>
				<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
					<Text size="small" color="gray0" weight="bold">
						{t('label.smime', 'S/MIME')}
					</Text>
				</Row>
				<Row
					width="100%"
					padding={{ top: 'large', left: 'large', bottom: 'large' }}
					mainAlignment="space-between"
				>
					<Row width="32%" mainAlignment="flex-start">
						<Switch
							value={accountDetail?.zimbraFeatureSMIMEEnabled === 'TRUE'}
							onClick={(): void => changeSwitchOption('zimbraFeatureSMIMEEnabled')}
							label={t('account_details.enable_smime', 'Enable S/MIME')}
							disabled
						/>
					</Row>
				</Row>
				<Row width="100%" padding={{ top: 'medium' }}>
					<Divider color="gray2" />
				</Row> */}
				{isAdvanced && (
					<>
						<Row padding={{ top: 'large' }} width="100%" mainAlignment="space-between">
							<Text size="small" color="gray0" weight="bold">
								{t('label.active_sync', 'ActiveSync')}
							</Text>
						</Row>
						<Row
							width="100%"
							padding={{ top: 'large', left: 'large', bottom: 'large' }}
							mainAlignment="space-between"
						>
							<Row width="32%" mainAlignment="flex-start">
								<Switch
									value={accountDetail?.zimbraFeatureMobileSyncEnabled === 'TRUE'}
									onClick={(): void => changeSwitchOption('zimbraFeatureMobileSyncEnabled')}
									label={t('account_details.activesync_remote_access', 'ActiveSync remote access')}
								/>
							</Row>
						</Row>
					</>
				)}
			</Row>
		</Container>
	);
};

export default EditAccountConfigrationSection;
