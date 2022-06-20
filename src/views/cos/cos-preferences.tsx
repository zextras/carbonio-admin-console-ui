/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useState } from 'react';
import {
	Container,
	Divider,
	Row,
	Text,
	Input,
	Icon,
	Select,
	Switch,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../list/list-row';

const CosPreferences: FC = () => {
	const [t] = useTranslation();
	const [checked1, setChecked1] = useState(true);
	const [selected, setSelected] = useState(1);

	return (
		<Container mainAlignment="flex-start" crossAlignment="flex-start">
			<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
				<Text size="medium" weight="bold">
					{t('cos.preferences', 'Preferences')}
				</Text>
			</Row>
			<Divider />
			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
			>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'extralarge', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.general_options', 'General Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ left: 'small', right: 'small', top: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										// items={items}
										background="gray5"
										label={t('cos.type_of_UI', 'Type of UI')}
										onChange={setSelected}
										defaultSelection={{ value: '1', label: 'Carbonio' }}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Input
										label={t('label.initial_mail_serach', 'initial Mail Serach')}
										value="in:inbox"
										background="gray5"
									/>
								</Container>
							</ListRow>
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'small', bottom: 'small', left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t('cos.show_search_string', 'Show Search String')}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t('cos.show_IMAP_search_folder', 'Show IMAP Search Folder')}
									/>
								</Padding>

								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t('cos.enable_keyboard_shortcuts', 'Enable keyboard shortcuts')}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'cos.display_warning_when_users_try_to_navigate_away_from_web_client',
											'Display a warning when users try to navigate away from web client'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'cos.display_a_warning_when_administrators_try_to_navigate_away_from_Zimbra_Administration_Console',
											'Display a warning when administrators try to navigate away from Zimbra Administration Console'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'cos.show_selection_checkbox_for_selecting_email_contact_voicemail_items_in_a_list_view_for_batch_operations',
											'Show selection checkbox for selecting email, contact, voicemail items in a list view for batch operations'
										)}
									/>
								</Padding>
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label={t('cos.index_junk_messages', 'Index Junk Messages')}
								/>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'small', bottom: 'large', left: 'small', right: 'small' }}
							>
								<Select
									// items={items}
									background="gray5"
									label={t('cos.language', 'Language')}
									onChange={setSelected}
									defaultSelection={{ value: '1', label: 'English (UK)' }}
								/>
							</Row>
						</Container>
					</Row>
					<Divider />
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.standard_html_client', 'Standard (HTML) Client')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container
							height="fit"
							crossAlignment="flex-start"
							background="gray6"
							padding={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
						>
							<ListRow>
								<Container padding={{ all: 'small' }}>
									<Select
										// items={items}
										background="gray5"
										label={t(
											'cos.maximum_number_of_items_to_display_per_page',
											'Maximum number of items to display per page'
										)}
										onChange={setSelected}
										defaultSelection={{ value: '1', label: '100' }}
									/>
								</Container>
								<Container padding={{ all: 'small' }}>
									<Select
										// items={items}
										background="gray5"
										label={t(
											'cos.number_of_items_to_display_per_page',
											'Number of items to display per page'
										)}
										onChange={setSelected}
										defaultSelection={{ value: '1', label: '25' }}
									/>
								</Container>
							</ListRow>
						</Container>
					</Row>
					<Divider />
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', left: 'large', bottom: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.mail_options', 'Mail Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t('cos.view_mail_as_html', 'View mail as HTML (when possible)')}
									/>
								</Padding>
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label={t(
										'cos.display_external_images_in_HTML_mail',
										'Display external images in HTML mail'
									)}
								/>
							</Row>
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
							>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('cos.group_mail', 'Group Mail')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'Conversation' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t(
												'cos.number_of_items_to_display_per_page',
												'Number of items to display per page'
											)}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: '25' }}
										/>
									</Container>
								</ListRow>
							</Container>
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'cos.enable_toaster_notification_for_new_mail',
											'Enable toaster notification for new mail'
										)}
									/>
								</Padding>
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label={t('cos.enable_message_deduping', 'Enable Message Deduping')}
								/>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', bottom: 'large', left: 'large', right: 'large' }}
							>
								<Input
									label={t(
										'label.number_of_items_to_fetch_when_scrolling',
										'Number of items to fetch when scrolling'
									)}
									value="50"
									background="gray5"
								/>
							</Row>
						</Container>
					</Row>
					<Divider />
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.receiving_mail', 'Receiving mail')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'cos.play_sound_when_message_arrives',
											'Play a sound when a message arrives (requires QuickTime or Windows Media plugin)'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'cos.highlight_the_Mail_tab_when_message_arrives',
											'Highlight the Mail tab when a message arrives'
										)}
									/>
								</Padding>
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label={t(
										'cos.flash_browser_title_when_message_arrives',
										'Flash the browser title when a message arrives'
									)}
								/>
							</Row>
							<Row
								width="100%"
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large', right: 'large' }}
							>
								<Select
									// items={items}
									background="gray5"
									label={t(
										'cos.polling_interval',
										'Polling interval (time after which to check for new mail)'
									)}
									onChange={setSelected}
									defaultSelection={{ value: '1', label: '5 minutes' }}
								/>
							</Row>
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'small', left: 'small', right: 'small' }}
							>
								<ListRow>
									<Container padding={{ all: 'small' }} width="30%">
										<Input
											label={t(
												'label.minimum_mail_polling_interval',
												'Minimum mail polling interval'
											)}
											value="2"
											background="gray5"
										/>
									</Container>
									<Container padding={{ all: 'small' }} width="20%">
										<Select
											// items={items}
											background="gray5"
											label={t('cos.preferences', 'Preferences')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'minutes' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }} width="30%">
										<Input
											label={t(
												'label.out_of_office_cache_lifetime',
												'Out of office cache lifetime'
											)}
											value="2"
											background="gray5"
										/>
									</Container>
									<Container padding={{ all: 'small' }} width="20%">
										<Select
											// items={items}
											background="gray5"
											label={t('cos.range_time', 'Range Time')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'Days' }}
										/>
									</Container>
								</ListRow>
							</Container>
							<Row
								width="100%"
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'small', bottom: 'large', left: 'large', right: 'large' }}
							>
								<Select
									// items={items}
									background="gray5"
									label={t('cos.send_read_receipts', 'Send read receipts')}
									onChange={setSelected}
									defaultSelection={{ value: '1', label: 'Prompt' }}
								/>
							</Row>
						</Container>
					</Row>
					<Divider />
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.sending_mail', 'Sending Mail')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t('label.save_to_sent_folder', 'Save to Sent Folder')}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.allow_sending_email_from_any_address',
											'Allow sending email from any address'
										)}
									/>
								</Padding>
							</Row>
						</Container>
					</Row>
					<Divider />
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.composing_mail', 'Composing Mail')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large' }}
							>
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label={t('label.always_compose_in_new_window', 'Always compose in new window')}
								/>
							</Row>
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
							>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('label.always_compose_mail_using', 'Always compose mail using')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'HTML' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('label.default_font_family', 'Default Font Family')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'Roboto' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('label.default_font_size', 'Default Font Size')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: '12 pt' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Input
											label={t('label.default_font_color', 'Default Font Color')}
											value="#414141"
											background="gray5"
											CustomIcon={() => <Icon icon="Square2" size="large" color="primary" />}
										/>
									</Container>
								</ListRow>
							</Container>

							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.reply/forward_using_format_of_the_original_message',
											'Reply/forward using format of the original message'
										)}
									/>
								</Padding>
								<Switch
									value={checked1}
									onClick={() => setChecked1(!checked1)}
									label={t('label.enable_mandatory_spell_check', 'Enable mandatory spell check')}
								/>
							</Row>
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
							>
								<ListRow>
									<Container padding={{ all: 'small' }} width="50%">
										<Input
											label={t(
												'label.maximum_length_of_mail_signature',
												'Maximum length of mail signature'
											)}
											value="10240"
											background="gray5"
										/>
									</Container>
									<Container padding={{ all: 'small' }} width="30%">
										<Input
											label={t('label.draft_auto_save_interval', 'Draft auto save interval')}
											value="2"
											background="gray5"
										/>
									</Container>
									<Container padding={{ all: 'small' }} width="20%">
										<Select
											// items={items}
											background="gray5"
											label={t('label.range_time', 'Range Time')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'minutes' }}
										/>
									</Container>
								</ListRow>
							</Container>
						</Container>
					</Row>
					<Divider />
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.contacts_options', 'Contacts Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.enable_automatic_adding_of_contacts',
											'Enable automatic adding of contacts'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.use_the_gal_when_autocompleting_addresses',
											'Use the GAL when autocompleting addresses'
										)}
									/>
								</Padding>
							</Row>
							<Divider />
						</Container>
					</Row>
				</Container>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ top: 'large', right: 'large', bottom: 'large', left: 'large' }}
					width="100%"
				>
					<Text size="small" weight="bold">
						{t('cos.calendar_options', 'Calendar Options')}
					</Text>
					<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
						<Container height="fit" crossAlignment="flex-start" background="gray6">
							<Row
								width="100%"
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ top: 'large', left: 'large', right: 'large' }}
							>
								<Select
									// items={items}
									background="gray5"
									label={t('label.time_zone', 'Time Zone')}
									onChange={setSelected}
									defaultSelection={{ value: '1', label: 'GMT/UTC Coordinated Universal Time' }}
								/>
							</Row>
							<Container
								height="fit"
								crossAlignment="flex-start"
								background="gray6"
								padding={{ top: 'small', bottom: 'small', left: 'small', right: 'small' }}
							>
								<ListRow>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('label.show_reminder', 'Show Reminder')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: '5 minutes' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('label.initial_calendar_view', 'Initial calendar view')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'Work Week' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t('label.first_day_of_Week', 'First day of Week')}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'Monday' }}
										/>
									</Container>
									<Container padding={{ all: 'small' }}>
										<Select
											// items={items}
											background="gray5"
											label={t(
												'label.default_appointment_visibility',
												'Default appointment visibility'
											)}
											onChange={setSelected}
											defaultSelection={{ value: '1', label: 'Public' }}
										/>
									</Container>
								</ListRow>
							</Container>
							<Row
								mainAlignment="flex-start"
								orientation="vertical"
								crossAlignment="flex-start"
								padding={{ left: 'large' }}
							>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.use_iCal_delegation_model_for_shared_calendars_for_CalDAV_interface',
											'Use iCal delegation model for shared calendars for CalDAV interface'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t('label.enable_past_due_reminders', 'Enable past due reminders')}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.enable_toaster_notification_for_new_calendar_events',
											'enable toaster notification for new calendar events'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.allow_sending_cancellation_email_to_organizer',
											'Allow sending cancellation email to organizer'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.automatically_add_invites_with_PUBLISH_method',
											'Automatically add invites with PUBLISH method'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.automatically_add_forwarded_invites_to_calendar',
											'Automatically add forwarded invites to calendar'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.notify_of_changes_made_via_delegated_access',
											'Notify of changes made via delegated access'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.always_show_the_mini-calendar',
											'Always show the mini-calendar'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.use_the_QuickAdd_dialog_when_creating_new_appointments',
											'use the QuickAdd dialog when creating new appointments'
										)}
									/>
								</Padding>
								<Padding bottom="large">
									<Switch
										value={checked1}
										onClick={() => setChecked1(!checked1)}
										label={t(
											'label.show_time_zone_list_in_appointment_view',
											'Show time zone list in appointment view'
										)}
									/>
								</Padding>
							</Row>
						</Container>
					</Row>
				</Container>
			</Container>
		</Container>
	);
};

export default CosPreferences;
