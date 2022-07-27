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
	Divider,
	Switch,
	Padding,
	Button,
	Input,
	Select,
	Icon
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ListRow from '../list/list-row';

const CustomIcon = styled(Icon)`
	width: 20px;
	height: 20px;
`;

const CosAdvanced: FC = () => {
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);

	const timeItems: any[] = useMemo(
		() => [
			{
				label: t('label.days', 'Days'),
				value: 'd'
			},
			{
				label: t('label.hours', 'Hours'),
				value: 'h'
			},
			{
				label: t('label.minutes', 'Minutes'),
				value: 'm'
			},
			{
				label: t('label.seconds', 'Seconds'),
				value: 's'
			}
		],
		[t]
	);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Container
					orientation="vertical"
					mainAlignment="space-around"
					background="gray6"
					height="58px"
				>
					<Row orientation="horizontal" width="100%" padding={{ all: 'large' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{t('cos.advanced', 'Advanced')}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && <Button label={t('label.cancel', 'Cancel')} color="secondary" />}
							</Padding>
							{isDirty && <Button label={t('label.save', 'Save')} color="primary" />}
						</Row>
					</Row>
				</Container>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>
			<Container
				mainAlignment="flex-start"
				width="100%"
				orientation="vertical"
				style={{ overflow: 'auto' }}
			>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.general_options', 'General Options')}
					</Text>
					<Row
						width="100%"
						mainAlignment="flex-start"
						padding={{ top: 'large', left: 'large', bottom: 'large' }}
					>
						<Switch
							value
							label={t(
								'cos.disable_attachment_viewing_from_web_mail_ui',
								'Disable attachment viewing from web mail UI'
							)}
						/>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.quotas', 'Quotas')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.user_specific_fowarding_addresses',
											'Limit user-specified forwarding addresses field to (chars)'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.maximum_number_of_user_specific_forwarding_addresses',
											'Maximum number of user-specified forwarding addresses'
										)}
										value="100"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.account_quota', 'Account quota')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.maximum_number_of_contacts_allowed_in_folder',
											'Maximum number of contacts allowed in folder'
										)}
										value="100"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="100%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.percentage_threshold_for_quota_warning',
											'Percentage threshold for quota warning messages'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.minimum_duration_of_time_between_quota_warnings',
											'Minimum duration of time between quota warnings'
										)}
										value="100"
										background="gray5"
									/>
								</Container>
								<Container width="26%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.quota_warning_message_template',
											'Quota warning message template'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.data_source', 'Data Source')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.shortest_allowed_duration_for_any_polling_interval',
											'Shortest allowed duration for any polling interval'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.pop3_polling_interval', 'POP3 polling interval')}
										value="100"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.imap_polling_interval', 'IMAP polling interval')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.calendar_polling_interval', 'Calendar polling interval')}
										value="100"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.rss_polling_interval', 'RSS polling interval')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.caldav_polling_interval', 'CalDAV polling interval')}
										value="100"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.proxy_allowed_domains', 'Proxy Allowed Domains')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.proxy_allowed_domain_name', 'Proxy Allowed Domain Name')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container crossAlignment="flex-end" width="17%" padding={{ all: 'small' }}>
									<Button
										type="outlined"
										label={t('label.add', 'Add')}
										icon="Plus"
										color="primary"
										height="44px"
										width="128px"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.password', 'Password')}
					</Text>
					<Row
						takeAvwidth="fill"
						mainAlignment="flex-start"
						width="100%"
						padding={{ top: 'small', left: 'small', right: 'small' }}
					>
						<Container
							orientation="horizontal"
							width="99%"
							crossAlignment="center"
							mainAlignment="space-between"
							background="#D3EBF8"
							padding={{
								all: 'large'
							}}
							style={{ margin: '8px', borderRadius: '2px 2px 0px 0px' }}
						>
							<Row takeAvwidth="fill" mainAlignment="flex-start">
								<Padding horizontal="small">
									<CustomIcon icon="InfoOutline" color="primary"></CustomIcon>
								</Padding>
							</Row>
							<Row
								takeAvwidth="fill"
								mainAlignment="flex-start"
								width="100%"
								padding={{
									all: 'small'
								}}
							>
								<Text overflow="break-word">
									{t(
										'cos.password_set_to_use_external_authentication_information_msg',
										'These settings do not affect the passwords set by users in domains that are configured to use external authentication'
									)}
								</Text>
							</Row>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Switch
										value
										label={t(
											'cos.prevent_user_from_changing_password',
											'Prevent user from changing password'
										)}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_password_length', 'Minimum password length')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.maximum_password_length', 'Maximum password length')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_upper_case_characters', 'Minimum upper case characters')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_lower_case_characters', 'Minimum lower case characters')}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_punctuation_symbols', 'Minimum punctuation symbols')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_numeric_chracters', 'Minimum numeric characters')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.minimum_password_age', 'Minimum password age (Days)')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('cos.maximum_password_age', 'Maximum password age (Days)')}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.minimum_numeric_characters_or_punctuation_symbols',
											'Minimum numeric characters or punctuation symbols'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.minimum_number_of_unique_password_history',
											'Minimum number of unique passwords history'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.failed_login_policy', 'Failed Login Policy')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Switch
										value
										label={t('cos.enable_failed_login_lockout', 'Enable failed login lockout')}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.number_of_consecutive_failed_login_allowed',
											'Number of consecutive failed logins allowed'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.time_to_lockout_account', 'Time to lockout the account')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.time_window_failed_logins_must_occur_to_lock_account',
											'Time window in which the failed logins must occur to lock the account:'
										)}
										value="100"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.timeout_policy', 'Timeout Policy')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.admin_console_auth_token_lifetime',
											'Admin console auth token lifetime'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t('cos.auth_token_lifetime', 'Auth token lifetime')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="100%" crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t('cos.session_idle_timeout', 'Session idle timeout')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="17%" crossAlignment="flex-end" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.email_retention_policy', 'Email Retention Policy')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t('cos.email_message_lifetime', 'E-mail message lifetime')}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.trashed_message_lifetime', 'Trashed message lifetime')}
										value="50"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
								<Container width="72%" padding={{ all: 'small' }}>
									<Input
										label={t('cos.spam_message_lifetime', 'Spam message lifetime')}
										value="100"
										background="gray5"
									/>
								</Container>
								<Container width="28%" padding={{ all: 'small' }}>
									<Select
										items={timeItems}
										background="gray5"
										label={t('cos.range_time', 'Range Time')}
										defaultSelection={{ value: 'd', label: 'Days' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
				<Row
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="extralarge" weight="bold">
						{t('cos.free_busy_interop', 'Free/Busy Interop')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', left: 'small', right: 'small', bottom: 'small' }}
						>
							<ListRow>
								<Container crossAlignment="flex-start" padding={{ all: 'small' }}>
									<Input
										label={t(
											'cos.legacy_exchange_dn_attribute',
											'O and OU used in legacyExchangeDN attribute'
										)}
										value="50"
										background="gray5"
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Row>
			</Container>
		</Container>
	);
};

export default CosAdvanced;
