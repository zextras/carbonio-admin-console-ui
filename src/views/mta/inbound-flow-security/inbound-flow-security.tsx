/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Container,
	Row,
	Text,
	Padding,
	Button,
	Divider,
	Switch,
	ChipInput
} from '@zextras/carbonio-design-system';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ListRow from '../../list/list-row';

const MTAInboundFlowSecurity: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(true);
	return (
		<Container background="gray6" mainAlignment="flex-start">
			<Row
				mainAlignment="flex-start"
				crossAlignment="center"
				orientation="horizontal"
				background="gray6"
				width="fill"
				height="56px"
			>
				<Row padding={{ horizontal: 'small' }}></Row>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium" overflow="ellipsis" weight="bold">
						{t('mta.inbound_flow_and_security', 'Inbound Flow & Security')}
					</Text>
				</Row>
				<Row>
					{isDirty && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-end"
							crossAlignment="flex-end"
							background="gray6"
						>
							<Padding right="small">
								{isDirty && (
									<Button label={t('label.cancel', 'Cancel')} color="secondary" height={36} />
								)}
							</Padding>
							<Padding right="small">
								{isDirty && <Button label={t('label.save', 'Save')} color="primary" height={36} />}
							</Padding>
						</Container>
					)}
				</Row>
			</Row>
			<ListRow>
				<Divider />
			</ListRow>
			<Container
				padding={{ all: 'extralarge' }}
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				height="calc(100vh - 10.5rem)"
				background="white"
				style={{ overflow: 'auto' }}
			>
				<Container crossAlignment="flex-start" padding={{ top: 'large', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.settings', 'Settings')}
					</Text>
				</Container>
				<Container crossAlignment="flex-start">
					<ChipInput
						placeholder={t('mta.add_here_any_blocked_extension', 'Add here any Blocked Extension')}
						background="gray5"
					/>
				</Container>
				<Row padding={{ top: 'large' }}>
					<Switch label={t('mta.block_also_common_extensions', 'Block also common extensions')} />
				</Row>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.notify_admins_about_block_extensions',
								'Notify admins about blocked extensions'
							)}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.notify_users_about_block_extensions',
								'Notify users about blocked extensions'
							)}
						/>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container crossAlignment="flex-start" padding={{ top: 'extralarge', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.rejection', 'Rejection')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.reject_unlisted_sender', 'Reject unlisted Sender')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.reject_unlisted_recipient', 'Reject unlisted Recipient')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.reject_sender_login_mismatch_or_empty',
								'Reject Sender login mismatch or empty '
							)}
						/>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container crossAlignment="flex-start" padding={{ top: 'extralarge', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.additional_settings', 'Additional settings')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.enable_antispam', 'Enable Antispam')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.enable_antivirus', 'Enable Antivirus')} />
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'extralarge' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t('mta.enable_accounting_quota_checks', 'Enable Accounting quota checks')}
						/>
					</Container>
				</Container>
				<ListRow>
					<Divider />
				</ListRow>

				<Container crossAlignment="flex-start" padding={{ top: 'extralarge', bottom: 'large' }}>
					<Text size="small" weight="bold" color="gray0">
						{t('mta.protocol_checks', 'Protocol Checks')}
					</Text>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'large', bottom: 'medium' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.clients_ip_address', 'Client’s IP address')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.client_must_greet_with_resolving_hostname',
								'Client must greet with a resolving hostname'
							)}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.hostname_in_greetings', 'Hostname in greetings')} />
					</Container>
					<Container crossAlignment="flex-start">
						<Switch label={t('mta.senders_domain', 'Sender’s Domain')} />
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.hostname_in_greeting_violates_rfc',
								'Hostname in greeting violates RFC'
							)}
						/>
					</Container>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.senders_address_must_fully_qualified',
								'Sender address must be fully qualified'
							)}
						/>
					</Container>
				</Container>
				<Container
					orientation="horizontal"
					mainAlignment="space-between"
					crossAlignment="flex-start"
					padding={{ top: 'small', bottom: 'small' }}
					height="auto"
				>
					<Container crossAlignment="flex-start">
						<Switch
							label={t(
								'mta.client_must_greet_with_fully_qualified_hostname',
								'Client must greet with a fully qualified hostname'
							)}
						/>
					</Container>
				</Container>
			</Container>
		</Container>
	);
};

export default MTAInboundFlowSecurity;
